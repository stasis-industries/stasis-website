import { useEffect, useRef } from 'react';

// ─── Colors ──────────────────────────────────────────────────────────
const C = {
  teal: '#3DB8E8',
  amber: '#E8862A',
  red: '#991B1B',
  green: '#34D399',
  text: '#f0ede9',
  textSec: '#888',
  border: '#333',
  bg: '#111',
  cardBg: '#1a1a1a',
  dimLabel: '#666',
  brightVal: '#ccc',
};

// ─── Keyframe injection (once) ───────────────────────────────────────
const STYLE_ID = 'tool-mockup-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes tm-drift-0 {
      0%   { transform: translate(0px, 0px); }
      25%  { transform: translate(16px, 0px); }
      50%  { transform: translate(16px, 16px); }
      75%  { transform: translate(0px, 16px); }
      100% { transform: translate(0px, 0px); }
    }
    @keyframes tm-drift-1 {
      0%   { transform: translate(0px, 0px); }
      25%  { transform: translate(0px, -16px); }
      50%  { transform: translate(16px, -16px); }
      75%  { transform: translate(16px, 0px); }
      100% { transform: translate(0px, 0px); }
    }
    @keyframes tm-drift-2 {
      0%   { transform: translate(0px, 0px); }
      25%  { transform: translate(-16px, 0px); }
      50%  { transform: translate(-16px, -16px); }
      75%  { transform: translate(0px, -16px); }
      100% { transform: translate(0px, 0px); }
    }
    @keyframes tm-drift-3 {
      0%   { transform: translate(0px, 0px); }
      33%  { transform: translate(16px, -16px); }
      66%  { transform: translate(0px, -16px); }
      100% { transform: translate(0px, 0px); }
    }
    @keyframes tm-fault-pulse {
      0%, 80%, 100% { opacity: 0; }
      40% { opacity: 0.6; }
    }
    @keyframes tm-chart-draw {
      0%   { stroke-dashoffset: 300; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes tm-val-osc-0 {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
    @keyframes tm-val-osc-1 {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-tm-animate] * {
        animation: none !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ─── Setup Panel (Left) ─────────────────────────────────────────────
const CONFIG_ROWS = [
  { label: 'TOPOLOGY', value: 'warehouse_medium' },
  { label: 'SOLVER', value: 'PIBT' },
  { label: 'FAULT INTENSITY', value: 'Medium' },
  { label: 'AGENTS', value: '40' },
];

function SetupPanel() {
  const cardStyle = {
    background: C.cardBg,
    border: `1px solid ${C.border}`,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  };

  const labelStyle = {
    fontFamily: 'var(--mono, monospace)',
    fontSize: '11px',
    color: C.dimLabel,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    flexShrink: 0,
  };

  const valueStyle = {
    fontFamily: 'var(--mono, monospace)',
    fontSize: '13px',
    color: C.brightVal,
    textAlign: 'right',
  };

  return (
    <div style={cardStyle}>
      <div style={{
        fontFamily: 'var(--mono, monospace)',
        fontSize: '9px',
        color: C.dimLabel,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '2px',
      }}>
        CONFIGURATION
      </div>
      {CONFIG_ROWS.map((row) => (
        <div key={row.label} style={rowStyle}>
          <span style={labelStyle}>{row.label}</span>
          <span style={valueStyle}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Scenario Grid (Center) ─────────────────────────────────────────
// Agent dot positions (on a 10x10 grid, cell size 16px)
const AGENTS = [
  { x: 2, y: 1, drift: 0 },
  { x: 4, y: 2, drift: 1 },
  { x: 7, y: 1, drift: 2 },
  { x: 1, y: 3, drift: 3 },
  { x: 5, y: 4, drift: 0 },
  { x: 8, y: 3, drift: 1 },
  { x: 3, y: 5, drift: 2 },
  { x: 6, y: 6, drift: 3 },
  { x: 1, y: 7, drift: 0 },
  { x: 9, y: 5, drift: 1 },
  { x: 4, y: 8, drift: 2 },
  { x: 7, y: 7, drift: 3 },
  { x: 2, y: 9, drift: 0 },
  { x: 8, y: 8, drift: 1 },
  { x: 5, y: 1, drift: 2 },
  { x: 3, y: 3, drift: 3 },
  { x: 6, y: 9, drift: 0 },
  { x: 9, y: 2, drift: 1 },
  { x: 1, y: 5, drift: 2 },
  { x: 8, y: 6, drift: 3 },
];

const FAULTED_INDICES = [3, 9, 14];
const FAULT_CELL = { x: 5, y: 5 };

function ScenarioGrid({ compact = false }) {
  const cols = compact ? 8 : 10;
  const rows = compact ? 8 : 10;
  const cellSize = 16;
  const pad = 8;
  const w = cols * cellSize + pad * 2;
  const h = rows * cellSize + pad * 2;

  const agentSubset = compact ? AGENTS.slice(0, 12) : AGENTS;

  return (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h}`}
        style={{ maxWidth: w, display: 'block' }}
      >
        {/* Grid lines */}
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={pad + i * cellSize}
            y1={pad}
            x2={pad + i * cellSize}
            y2={pad + rows * cellSize}
            stroke={C.border}
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={pad}
            y1={pad + i * cellSize}
            x2={pad + cols * cellSize}
            y2={pad + i * cellSize}
            stroke={C.border}
            strokeWidth="0.5"
          />
        ))}

        {/* Fault event flash cell */}
        <rect
          x={pad + FAULT_CELL.x * cellSize}
          y={pad + FAULT_CELL.y * cellSize}
          width={cellSize}
          height={cellSize}
          fill={C.amber}
          style={{
            animation: 'tm-fault-pulse 3s ease-in-out infinite',
          }}
        />

        {/* Agent dots */}
        {agentSubset.map((agent, i) => {
          const isFaulted = FAULTED_INDICES.includes(i);
          const cx = pad + agent.x * cellSize + cellSize / 2;
          const cy = pad + agent.y * cellSize + cellSize / 2;
          const color = isFaulted ? C.red : C.teal;
          const driftName = `tm-drift-${agent.drift}`;
          const delay = `${-(i * 0.6)}s`;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={3}
              fill={color}
              style={{
                animation: `${driftName} 8s linear infinite`,
                animationDelay: delay,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── Charts Panel (Right) ───────────────────────────────────────────
const SCORECARD = [
  { label: 'FAULT TOLERANCE', base: 82, color: C.green },
  { label: 'NRR', base: 91, color: C.teal },
  { label: 'FLEET UTIL', base: 64, color: C.amber },
  { label: 'CRITICAL TIME', base: 15, color: C.textSec },
];

function ChartsPanel() {
  // Simple throughput chart polyline
  const chartW = 180;
  const chartH = 60;
  const points = [
    [0, 40], [20, 35], [40, 28], [60, 32], [80, 20],
    [100, 24], [120, 18], [140, 22], [160, 15], [180, 18],
  ];
  const polyline = points.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Throughput chart */}
      <div style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        padding: '12px 14px',
      }}>
        <div style={{
          fontFamily: 'var(--mono, monospace)',
          fontSize: '9px',
          color: C.dimLabel,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}>
          THROUGHPUT
        </div>
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          {/* Horizontal guide lines */}
          {[15, 30, 45].map((y) => (
            <line key={y} x1="0" y1={y} x2={chartW} y2={y} stroke={C.border} strokeWidth="0.5" />
          ))}
          <polyline
            points={polyline}
            fill="none"
            stroke={C.teal}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="300"
            style={{
              animation: 'tm-chart-draw 6s linear infinite',
            }}
          />
        </svg>
      </div>

      {/* Scorecard */}
      <div style={{
        background: C.cardBg,
        border: `1px solid ${C.border}`,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          fontFamily: 'var(--mono, monospace)',
          fontSize: '9px',
          color: C.dimLabel,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>
          SCORECARD
        </div>
        {SCORECARD.map((item, i) => (
          <ScorecardRow key={item.label} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

function ScorecardRow({ item, index }) {
  const valueRef = useRef(null);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const el = valueRef.current;
    if (!el) return;

    const base = item.base;
    const period = 4000;
    const offset = index * 700;
    let raf;

    function animate(t) {
      const v = base + Math.round(2 * Math.sin((t + offset) * (2 * Math.PI / period)));
      el.textContent = `0.${String(v).padStart(2, '0')}`;
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [item.base, index]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    }}>
      <span style={{
        fontFamily: 'var(--mono, monospace)',
        fontSize: '10px',
        color: C.dimLabel,
        letterSpacing: '0.05em',
      }}>
        {item.label}
      </span>
      <span
        ref={valueRef}
        style={{
          fontFamily: 'var(--mono, monospace)',
          fontSize: '14px',
          fontWeight: 600,
          color: item.color,
        }}
      >
        0.{String(item.base).padStart(2, '0')}
      </span>
    </div>
  );
}

// ─── Compact Mobile Metrics (2-metric card) ─────────────────────────
function CompactMetrics() {
  const items = SCORECARD.slice(0, 2);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0',
      background: C.cardBg,
      border: `1px solid ${C.border}`,
    }}>
      {items.map((item, i) => (
        <div key={item.label} style={{
          padding: '10px 14px',
          borderRight: i === 0 ? `1px solid ${C.border}` : 'none',
        }}>
          <div style={{
            fontFamily: 'var(--mono, monospace)',
            fontSize: '9px',
            color: C.dimLabel,
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}>
            {item.label}
          </div>
          <ScorecardRow item={item} index={i} />
        </div>
      ))}
    </div>
  );
}

// ─── Compact Setup Strip (mobile) ───────────────────────────────────
function CompactSetup() {
  return (
    <div style={{
      background: C.cardBg,
      border: `1px solid ${C.border}`,
      padding: '10px 14px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px 16px',
    }}>
      {CONFIG_ROWS.map((row) => (
        <span key={row.label} style={{
          fontFamily: 'var(--mono, monospace)',
          fontSize: '10px',
        }}>
          <span style={{ color: C.dimLabel }}>{row.label}</span>{' '}
          <span style={{ color: C.brightVal }}>{row.value}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function ToolMockup() {
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <div aria-hidden="true" data-tm-animate="">
      {/* Desktop layout (>= 1200px) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr 200px',
        gap: '16px',
        alignItems: 'start',
      }} className="tm-desktop">
        <SetupPanel />
        <ScenarioGrid />
        <ChartsPanel />
      </div>

      {/* Tablet layout (768-1199px) */}
      <div className="tm-tablet" style={{ display: 'none' }}>
        <div style={{ marginBottom: '16px' }}>
          <ScenarioGrid />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
        }}>
          <SetupPanel />
          <ChartsPanel />
        </div>
      </div>

      {/* Mobile layout (< 768px) */}
      <div className="tm-mobile" style={{ display: 'none' }}>
        <div style={{ marginBottom: '12px' }}>
          <ScenarioGrid compact />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <CompactSetup />
          <CompactMetrics />
        </div>
      </div>

      {/* Responsive visibility via injected style */}
      <style>{`
        .tm-desktop { display: grid !important; }
        .tm-tablet  { display: none !important; }
        .tm-mobile  { display: none !important; }

        @media (max-width: 1199px) and (min-width: 768px) {
          .tm-desktop { display: none !important; }
          .tm-tablet  { display: block !important; }
          .tm-mobile  { display: none !important; }
        }

        @media (max-width: 767px) {
          .tm-desktop { display: none !important; }
          .tm-tablet  { display: none !important; }
          .tm-mobile  { display: block !important; }
        }
      `}</style>
    </div>
  );
}
