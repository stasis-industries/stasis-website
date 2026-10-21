import { useState, useEffect, useRef, useCallback, Fragment } from 'react';

const ITEMS = [
  { id: 'fault-taxonomy', num: '01', label: 'Fault Taxonomy',
    title: 'Four fault types, two categories',
    desc: 'Each type tests a different failure mode. The lines show working robots over time.',
    bullets: ['Permanent: burst failure, Weibull wear', 'Recoverable: zone outage, intermittent pauses', 'Control: one robot one tick late, the noise floor'],
    visual: 'taxonomy' },
  { id: 'baseline', num: '02', label: 'Baseline Model',
    title: 'Same seed, two runs',
    desc: 'Every metric compares a faulted run with a fault-free twin that shares its seed: same map, robots and tasks.',
    bullets: ['The two runs match exactly until the fault', 'The gap in tasks delivered is the fault’s cost', 'Each fault scored against its own twin'],
    visual: 'baseline' },
  { id: 'cascade', num: '03', label: 'Cascade Tracing',
    title: 'Who was waiting on the failed robot',
    desc: 'At the fault instant, MAFIS snapshots which robots wait on which, and walks the chain back from the failed one.',
    bullets: ['Dependency graph taken at the fault instant', 'Breadth-first search gives depth and spread', 'Attack rate: share of untouched robots the chain reaches'],
    visual: 'cascade' },
  { id: 'reproducibility', num: '04', label: 'Reproducibility',
    title: 'Seeded determinism',
    desc: 'Same seed and config produce an identical simulation.',
    bullets: ['Separate seeded streams for tasks, solver and faults', 'A zero-size fault leaves the run bit-identical', 'Seed is exported with every result'],
    visual: 'reproducibility' },
];

// One palette for the four diagrams: neutral strokes use currentColor (light and dark themes),
// red marks the fault, teal the fault-free reference.
const C = { teal: '#3DB8E8', red: '#D2452E' };
const MONO = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em' };
const Svg = ({ children, h = 150 }) => (
  <svg width="100%" style={{ maxWidth: 300 }} viewBox={`0 0 300 ${h}`} role="img" fill="none">{children}</svg>
);

// Working robots over time for each fault type: permanent ones never come back, recoverable ones do.
function TaxonomySvg() {
  const T0 = 22, W = 116, H = 34, row = (y, d, label, color) => (
    <g transform={`translate(${y[0]},${y[1]})`}>
      <text x="0" y="-8" fill="currentColor" style={MONO}>{label}</text>
      <line x1="0" y1={H} x2={W} y2={H} stroke="currentColor" strokeOpacity="0.25" />
      <path d={d} stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </g>
  );
  const f = T0 + 18; // fault tick
  return (
    <Svg h={170}>
      <text x="20" y="12" fill="currentColor" opacity="0.45" style={MONO}>PERMANENT</text>
      {row([20, 38], `M0,4 H${f} V18 H${W}`, 'Burst', 'currentColor')}
      {row([164, 38], `M0,4 H${f} V9 H${f + 18} V15 H${f + 34} V22 H${f + 52} V27 H${W}`, 'Wear', 'currentColor')}
      <text x="20" y="98" fill={C.red} opacity="0.8" style={MONO}>RECOVERABLE</text>
      {row([20, 124], `M0,4 H${f} V16 H${f + 40} V4 H${W}`, 'Zone outage', C.red)}
      {row([164, 124], `M0,4 H${f - 12} V10 H${f - 4} V4 H${f + 22} V10 H${f + 30} V4 H${f + 56} V10 H${f + 62} V4 H${W}`, 'Intermittent', C.red)}
    </Svg>
  );
}

// Cumulative tasks: one line until the fault, then the faulted run falls behind its twin.
function BaselineSvg() {
  const x0 = 30, x1 = 222, yb = 120, fx = 100;
  const base = `M${x0},${yb} L${fx},88 L${x1},22`;
  const fault = `M${fx},88 L${x1},52`;
  return (
    <Svg h={145}>
      <line x1={x0} y1={yb} x2={x1} y2={yb} stroke="currentColor" strokeOpacity="0.3" />
      <line x1={x0} y1={yb} x2={x0} y2="14" stroke="currentColor" strokeOpacity="0.3" />
      <path d={`M${fx},88 L${x1},22 L${x1},52 Z`} fill={C.red} fillOpacity="0.12" />
      <path d={base} stroke={C.teal} strokeWidth="1.8" />
      <path d={fault} stroke={C.red} strokeWidth="1.8" />
      <line x1={fx} y1="14" x2={fx} y2={yb} stroke={C.red} strokeDasharray="3 3" strokeOpacity="0.7" />
      <text x={fx + 5} y="22" fill={C.red} style={MONO}>FAULT</text>
      <text x={x1 + 8} y="26" fill={C.teal} style={MONO}>TWIN</text>
      <text x={x1 + 8} y="56" fill={C.red} style={MONO}>FAULTED</text>
      <text x={x1 + 8} y="41" fill="currentColor" opacity="0.55" style={MONO}>↕ COST</text>
      <text x={x0} y={yb + 16} fill="currentColor" opacity="0.5" style={MONO}>TICKS →</text>
      <text x={x0 - 6} y="20" textAnchor="end" fill="currentColor" opacity="0.5" style={MONO} transform={`rotate(-90 ${x0 - 6} 20)`}>TASKS</text>
    </Svg>
  );
}

// Robots in a corridor: each waits for the one ahead; the chain from the failed robot sets depth and spread.
function CascadeSvg() {
  const xs = [250, 196, 142, 88, 34], y = 70, r = 13;
  return (
    <Svg h={140}>
      <line x1="16" y1={y + 22} x2="284" y2={y + 22} stroke="currentColor" strokeOpacity="0.2" />
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x - r} y={y - r} width={2 * r} height={2 * r} rx="4"
            stroke={i === 0 ? C.red : 'currentColor'} fill={i === 0 ? C.red : 'none'} fillOpacity={i === 0 ? 0.9 : 0}
            strokeOpacity={i === 0 ? 1 : 0.7} />
          <text x={x} y={y + 42} textAnchor="middle" fill={i === 0 ? C.red : 'currentColor'} opacity={i === 0 ? 1 : 0.6} style={MONO}>
            {i === 0 ? 'FAILED' : `d=${i}`}
          </text>
          {i > 0 && (
            <g stroke="currentColor" strokeOpacity="0.6">
              <line x1={x + r + 4} y1={y} x2={xs[i - 1] - r - 6} y2={y} />
              <path d={`M${xs[i - 1] - r - 10},${y - 4} L${xs[i - 1] - r - 5},${y} L${xs[i - 1] - r - 10},${y + 4}`} />
            </g>
          )}
        </g>
      ))}
      <text x="16" y="28" fill="currentColor" opacity="0.5" style={MONO}>WAITS FOR →</text>
      <text x="284" y="28" textAnchor="end" fill="currentColor" opacity="0.5" style={MONO}>DEPTH 4 · SPREAD 5</text>
    </Svg>
  );
}

// One seed feeds separate streams; two runs from the same seed trace the same path.
function ReproducibilitySvg() {
  const streams = ['TASKS', 'SOLVER', 'FAULTS'];
  const path = 'M0,30 H18 V12 H40 V24 H58 V6 H76';
  return (
    <Svg h={140}>
      <rect x="14" y="56" width="62" height="26" rx="3" stroke={C.teal} />
      <text x="45" y="73" textAnchor="middle" fill={C.teal} style={MONO}>SEED 42</text>
      {streams.map((s, i) => (
        <g key={s}>
          <path d={`M76,69 C96,69 96,${32 + i * 37} 116,${32 + i * 37}`} stroke="currentColor" strokeOpacity="0.35" />
          <text x="122" y={35 + i * 37} fill="currentColor" opacity="0.65" style={MONO}>{s}</text>
        </g>
      ))}
      {[30, 96].map((y, i) => (
        <g key={i} transform={`translate(200,${y})`}>
          <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <text x="0" y="-4" fill="currentColor" opacity="0.5" style={MONO}>{`RUN ${i + 1}`}</text>
        </g>
      ))}
      <text x="238" y="80" textAnchor="middle" fill={C.teal} style={{ ...MONO, fontSize: 18 }}>=</text>
    </Svg>
  );
}

const VISUALS = {
  taxonomy: TaxonomySvg,
  baseline: BaselineSvg,
  cascade: CascadeSvg,
  reproducibility: ReproducibilitySvg,
};

const BOTTOM_BAR_COLORS_DARK = ['rgba(60,60,60,0.3)', 'rgba(60,60,60,0.15)', 'rgba(60,60,60,0.3)', 'rgba(60,60,60,0.15)', 'rgba(60,60,60,0.3)'];
const BOTTOM_BAR_COLORS_LIGHT = ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.025)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.025)', 'rgba(0,0,0,0.05)'];

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function BottomBar({ isDark }) {
  const colors = isDark ? BOTTOM_BAR_COLORS_DARK : BOTTOM_BAR_COLORS_LIGHT;
  return (
    <div style={{ display: 'flex', height: 14 }}>
      {colors.map((bg, i) => (
        <div key={i} style={{ flex: 1, background: bg }} />
      ))}
    </div>
  );
}

function Card({ item, index, isDark, stickyTop }) {
  const Visual = VISUALS[item.visual];
  const borderColor = isDark ? '#2c2c2c' : 'rgba(0,0,0,0.1)';
  const cardBg = isDark ? '#1a1a1a' : 'var(--surface, #F0EDE9)';
  const textColor = isDark ? '#f0ede9' : 'var(--text, #1a1a1a)';
  const descColor = isDark ? '#888' : 'var(--text-sec, #666)';

  return (
    <div
      data-card-index={index}
      className="instrument-card"
      style={{
        position: 'sticky',
        top: stickyTop,
        zIndex: index,
        marginBottom: 2,
        background: cardBg,
        width: '100%',
      }}
    >
      <div style={{ border: `1px solid ${borderColor}`, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div className="card-layout" style={{ flex: 1, minHeight: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            borderRight: `1px solid ${borderColor}`,
            overflow: 'hidden',
            color: textColor,
          }}
            className="card-visual-col"
          >
            <Visual />
          </div>
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            className="card-text-col"
          >
            <h3 style={{
              fontFamily: 'var(--serif)', fontSize: '1.3rem',
              color: textColor, marginBottom: 12, lineHeight: 1.2, marginTop: 0,
            }}>{item.title}</h3>
            <p style={{
              fontFamily: 'var(--sans)', fontSize: '0.9rem', fontWeight: 300,
              color: descColor, lineHeight: 1.7, marginBottom: 20, marginTop: 0,
            }}>{item.desc}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {item.bullets.map((b, i) => (
                <li key={i} style={{
                  borderLeft: '2px solid #3DB8E8', paddingLeft: 12, marginBottom: 8,
                  fontFamily: 'var(--sans)', fontSize: '0.82rem', fontWeight: 300,
                  color: textColor, opacity: 0.7, lineHeight: 1.5,
                }}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
        <BottomBar isDark={isDark} />
      </div>
    </div>
  );
}

const SPACER_HEIGHT = 180;

export default function InstrumentPanel() {
  const isDark = useTheme();
  const [active, setActive] = useState(0);
  const [cardTop, setCardTop] = useState(96);
  const sentinelRefs = useRef([]);
  const cardRefs = useRef([]);

  // Measure the sticky instrument-header height to position cards below it
  useEffect(() => {
    const header = document.getElementById('instrument-header');
    if (!header) return;
    const update = () => {
      const h = header.getBoundingClientRect().height;
      setCardTop(80 + h + 8);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // Scroll-based nav highlighting (more reliable than IntersectionObserver with large rootMargin)
  useEffect(() => {
    const container = document.querySelector('.snap-container');
    if (!container) return;

    const handleScroll = () => {
      const sentinels = sentinelRefs.current.filter(Boolean);
      let best = 0;
      for (let i = sentinels.length - 1; i >= 0; i--) {
        const rect = sentinels[i].getBoundingClientRect();
        if (rect.top <= cardTop + SPACER_HEIGHT) { best = i; break; }
      }
      setActive(best);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [cardTop]);

  const handleNavClick = useCallback((idx) => {
    const sentinel = sentinelRefs.current[idx];
    if (sentinel) {
      const container = document.querySelector('.snap-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const sentinelRect = sentinel.getBoundingClientRect();
        const offset = sentinelRect.top - containerRect.top + container.scrollTop - cardTop;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }
  }, [cardTop]);

  const borderColor = isDark ? '#2c2c2c' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? '#f0ede9' : 'var(--text, #1a1a1a)';
  const descColor = isDark ? '#666' : 'var(--text-sec, #999)';

  return (
    <>
      <div className="instrument-layout">
        {/* Sidebar nav */}
        <nav className="instrument-nav" style={{
          position: 'sticky', top: cardTop, alignSelf: 'flex-start',
          width: 200, flexShrink: 0,
        }}>
          {ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '14px 16px',
                background: 'transparent', border: 'none',
                borderLeft: i === active ? '2px solid #3DB8E8' : '2px solid transparent',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--mono)', fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: i === active ? textColor : descColor,
                transition: 'color 0.2s, border-color 0.2s',
                outline: 'none',
              }}
            >
              <span style={{ opacity: 0.4, fontSize: 10 }}>{item.num}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Cards column — Fragment ensures sticky cards are direct children of this div */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {ITEMS.map((item, i) => (
            <Fragment key={item.id}>
              <div
                ref={(el) => { sentinelRefs.current[i] = el; }}
                data-sentinel={i}
                style={{ height: 1, marginBottom: -1 }}
              />
              <Card item={item} index={i} isDark={isDark} stickyTop={cardTop} />
              <div className="card-spacer" style={{ height: SPACER_HEIGHT }} />
            </Fragment>
          ))}
        </div>
      </div>

      <style>{`
        .instrument-layout {
          display: flex;
          gap: 32px;
        }
        .instrument-card {
          height: 300px;
        }
        .card-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 900px) {
          .instrument-layout {
            display: block;
          }
          .instrument-nav {
            display: none !important;
          }
          .instrument-card {
            height: auto !important;
            top: 80px !important;
          }
          .card-spacer {
            height: 100px !important;
          }
        }
        @media (max-width: 600px) {
          .card-layout {
            grid-template-columns: 1fr;
          }
          .card-visual-col {
            min-height: 200px;
            border-right: none !important;
            border-bottom: 1px solid ${borderColor};
          }
        }
      `}</style>
    </>
  );
}
