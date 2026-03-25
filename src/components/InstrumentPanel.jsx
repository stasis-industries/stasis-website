import { useState, useEffect, useRef, useCallback, Fragment } from 'react';

const ITEMS = [
  { id: 'fault-taxonomy', num: '01', label: 'Fault Taxonomy',
    title: 'Three fault categories',
    desc: 'Each category tests a different failure mode.',
    bullets: ['Recoverable: temporary blockage', 'Permanent-distributed: overheat', 'Permanent-localized: zone outage'],
    visual: 'taxonomy' },
  { id: 'solvers', num: '02', label: 'Solvers',
    title: 'Five lifelong solvers',
    desc: 'All lifelong-capable. Built for sustained operation.',
    bullets: ['PIBT: reactive priority inheritance', 'RHCR: three windowed planner variants', 'Token Passing: decentralized sequential'],
    visual: 'solvers' },
  { id: 'topologies', num: '03', label: 'Topologies',
    title: 'Four warehouse maps',
    desc: 'Cross-topology validation built in.',
    bullets: ['Warehouse Medium 32\u00D721', 'Kiva Large 57\u00D733', 'Sorting Center 40\u00D720', 'Compact Grid 24\u00D724'],
    visual: 'topologies' },
  { id: 'baseline', num: '04', label: 'Baseline Model',
    title: 'Dual-twin baseline',
    desc: 'Every metric is a deviation from a fault-free reference.',
    bullets: ['Fault-free baseline in parallel', 'Delta = research output', 'Same seed = identical reference'],
    visual: 'baseline' },
  { id: 'cascade', num: '05', label: 'Cascade Tracing',
    title: 'ADG + BFS propagation',
    desc: 'Full transitive closure of each fault event.',
    bullets: ['Action Dependency Graph every tick', 'BFS measures depth and spread', 'MTTR per affected agent'],
    visual: 'cascade' },
  { id: 'reproducibility', num: '06', label: 'Reproducibility',
    title: 'Seeded determinism',
    desc: 'Same seed + config = identical simulation.',
    bullets: ['SeededRng for all random events', 'Bit-exact replay from any tick', 'Export seed with every result'],
    visual: 'reproducibility' },
];

const C = {
  teal: '#3DB8E8', amber: '#E8862A', red: '#991B1B',
  green: '#34D399', textSec: '#888', border: '#333',
};

function TaxonomySvg() {
  return (
    <svg width="280" height="120" viewBox="0 0 280 120">
      <rect x="10" y="25" width="70" height="70" fill="none" stroke={C.teal} strokeWidth="2" />
      <text x="45" y="67" textAnchor="middle" fill={C.teal} fontFamily="var(--mono)" fontSize="24" fontWeight="600">R</text>
      <text x="45" y="110" textAnchor="middle" fill={C.textSec} fontFamily="var(--mono)" fontSize="9">RECOVERABLE</text>
      <rect x="105" y="25" width="70" height="70" fill="none" stroke={C.amber} strokeWidth="2" />
      <text x="140" y="67" textAnchor="middle" fill={C.amber} fontFamily="var(--mono)" fontSize="24" fontWeight="600">PD</text>
      <text x="140" y="110" textAnchor="middle" fill={C.textSec} fontFamily="var(--mono)" fontSize="9">PERM-DIST</text>
      <rect x="200" y="25" width="70" height="70" fill="none" stroke={C.red} strokeWidth="2" />
      <text x="235" y="67" textAnchor="middle" fill={C.red} fontFamily="var(--mono)" fontSize="24" fontWeight="600">PL</text>
      <text x="235" y="110" textAnchor="middle" fill={C.textSec} fontFamily="var(--mono)" fontSize="9">PERM-LOCAL</text>
    </svg>
  );
}

function SolversSvg() {
  const solvers = [
    { name: 'PIBT', w: 200, color: C.teal },
    { name: 'RHCR-PBS', w: 170, color: C.teal },
    { name: 'RHCR-PIBT', w: 180, color: C.teal },
    { name: 'RHCR-A*', w: 160, color: C.amber },
    { name: 'TOKEN', w: 140, color: C.green },
  ];
  return (
    <svg width="280" height="140" viewBox="0 0 280 140">
      {solvers.map((s, i) => (
        <g key={s.name}>
          <rect x="80" y={8 + i * 26} width={s.w} height="18" fill={s.color} opacity="0.2" />
          <rect x="80" y={8 + i * 26} width={s.w} height="18" fill="none" stroke={s.color} strokeWidth="1" opacity="0.5" />
          <text x="72" y={8 + i * 26 + 13} textAnchor="end" fill={C.textSec} fontFamily="var(--mono)" fontSize="10">{s.name}</text>
        </g>
      ))}
    </svg>
  );
}

function TopologiesSvg() {
  const labels = ['WH-MED', 'KIVA-LG', 'SORT-CTR', 'COMPACT'];
  const patterns = [
    [[0,0],[0,2],[0,4],[2,0],[2,2],[2,4],[4,0],[4,2],[4,4]],
    [[0,0],[0,1],[0,3],[0,4],[1,0],[1,4],[3,0],[3,4],[4,0],[4,1],[4,3],[4,4]],
    [[0,0],[1,1],[2,2],[3,3],[4,4],[0,4],[4,0]],
    [[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[1,4],[2,0],[2,4],[3,0],[3,4],[4,0],[4,1],[4,2],[4,3],[4,4]],
  ];
  return (
    <svg width="280" height="160" viewBox="0 0 280 160">
      {[0,1,2,3].map(idx => {
        const col = idx % 2, row = Math.floor(idx / 2);
        const ox = 20 + col * 140, oy = 10 + row * 80;
        return (
          <g key={idx}>
            <rect x={ox} y={oy} width="110" height="55" fill="none" stroke={C.border} strokeWidth="1" />
            {patterns[idx].map((p, pi) => (
              <rect key={pi} x={ox + 8 + p[1] * 18} y={oy + 5 + p[0] * 9} width="8" height="6" fill={C.teal} opacity="0.4" />
            ))}
            <text x={ox + 55} y={oy + 72} textAnchor="middle" fill={C.textSec} fontFamily="var(--mono)" fontSize="8">{labels[idx]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function BaselineSvg() {
  return (
    <svg width="280" height="120" viewBox="0 0 280 120">
      <text x="10" y="30" fill={C.green} fontFamily="var(--mono)" fontSize="9" opacity="0.7">BASELINE</text>
      <line x1="70" y1="27" x2="260" y2="27" stroke={C.green} strokeWidth="2" opacity="0.6" />
      {[90,120,150,180,210,240].map(x => (
        <line key={x} x1={x} y1="22" x2={x} y2="32" stroke={C.green} strokeWidth="1" opacity="0.3" />
      ))}
      <text x="10" y="75" fill={C.amber} fontFamily="var(--mono)" fontSize="9" opacity="0.7">DEGRADED</text>
      <line x1="70" y1="72" x2="150" y2="72" stroke={C.amber} strokeWidth="2" opacity="0.6" />
      <rect x="148" y="60" width="4" height="24" fill={C.red} />
      <text x="150" y="55" textAnchor="middle" fill={C.red} fontFamily="var(--mono)" fontSize="8">FAULT</text>
      <polyline points="154,72 170,82 190,85 220,80 260,76" fill="none" stroke={C.amber} strokeWidth="2" opacity="0.6" />
      <line x1="220" y1="27" x2="220" y2="80" stroke={C.textSec} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      <text x="228" y="56" fill={C.textSec} fontFamily="var(--mono)" fontSize="9" opacity="0.6">delta</text>
    </svg>
  );
}

function CascadeSvg() {
  return (
    <svg width="280" height="140" viewBox="0 0 280 140">
      <circle cx="140" cy="20" r="10" fill={C.red} opacity="0.8" />
      <text x="140" y="24" textAnchor="middle" fill="#f0ede9" fontFamily="var(--mono)" fontSize="8" fontWeight="600">F</text>
      <line x1="140" y1="30" x2="80" y2="60" stroke={C.amber} strokeWidth="1.5" opacity="0.5" />
      <line x1="140" y1="30" x2="140" y2="60" stroke={C.amber} strokeWidth="1.5" opacity="0.5" />
      <line x1="140" y1="30" x2="200" y2="60" stroke={C.amber} strokeWidth="1.5" opacity="0.5" />
      {[80,140,200].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="65" r="8" fill="none" stroke={C.amber} strokeWidth="1.5" opacity="0.6" />
          <text x={cx} y="68" textAnchor="middle" fill={C.amber} fontFamily="var(--mono)" fontSize="7">A{i+1}</text>
        </g>
      ))}
      <line x1="80" y1="73" x2="50" y2="100" stroke={C.teal} strokeWidth="1" opacity="0.4" />
      <line x1="80" y1="73" x2="110" y2="100" stroke={C.teal} strokeWidth="1" opacity="0.4" />
      <line x1="200" y1="73" x2="230" y2="100" stroke={C.teal} strokeWidth="1" opacity="0.4" />
      {[[50,'A4'],[110,'A5'],[230,'A6']].map(([cx, label]) => (
        <g key={label}>
          <circle cx={cx} cy="105" r="6" fill="none" stroke={C.teal} strokeWidth="1" opacity="0.4" />
          <text x={cx} y="108" textAnchor="middle" fill={C.teal} fontFamily="var(--mono)" fontSize="6">{label}</text>
        </g>
      ))}
      <text x="265" y="22" fill={C.textSec} fontFamily="var(--mono)" fontSize="8" opacity="0.5">d=0</text>
      <text x="265" y="67" fill={C.textSec} fontFamily="var(--mono)" fontSize="8" opacity="0.5">d=1</text>
      <text x="265" y="107" fill={C.textSec} fontFamily="var(--mono)" fontSize="8" opacity="0.5">d=2</text>
    </svg>
  );
}

function ReproducibilitySvg() {
  const MiniGrid = ({ ox, oy }) => (
    <g>
      <rect x={ox} y={oy} width="60" height="50" fill="none" stroke={C.border} strokeWidth="1" />
      {[0,1,2].map(r => [0,1,2,3].map(c => (
        <rect key={`${r}-${c}`} x={ox + 5 + c * 14} y={oy + 5 + r * 14} width="10" height="10"
          fill={C.teal} opacity={(r + c) % 3 === 0 ? 0.6 : 0.15} />
      )))}
    </g>
  );
  return (
    <svg width="280" height="120" viewBox="0 0 280 120">
      <rect x="10" y="30" width="80" height="30" fill="none" stroke={C.green} strokeWidth="1.5" />
      <text x="50" y="50" textAnchor="middle" fill={C.green} fontFamily="var(--mono)" fontSize="11">seed: 42</text>
      <line x1="90" y1="40" x2="110" y2="40" stroke={C.textSec} strokeWidth="1" opacity="0.5" />
      <line x1="90" y1="50" x2="110" y2="75" stroke={C.textSec} strokeWidth="1" opacity="0.5" />
      <MiniGrid ox={115} oy={15} />
      <text x="145" y="78" textAnchor="middle" fill={C.textSec} fontFamily="var(--mono)" fontSize="8">RUN 1</text>
      <text x="195" y="45" textAnchor="middle" fill={C.green} fontFamily="var(--mono)" fontSize="18" opacity="0.7">=</text>
      <MiniGrid ox={210} oy={15} />
      <text x="240" y="78" textAnchor="middle" fill={C.textSec} fontFamily="var(--mono)" fontSize="8">RUN 2</text>
    </svg>
  );
}

const VISUALS = {
  taxonomy: TaxonomySvg, solvers: SolversSvg, topologies: TopologiesSvg,
  baseline: BaselineSvg, cascade: CascadeSvg, reproducibility: ReproducibilitySvg,
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
            position: relative !important;
            top: auto !important;
            z-index: auto !important;
            margin-bottom: 16px !important;
          }
          .card-spacer {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .card-layout {
            grid-template-columns: 1fr;
          }
          .card-visual-col {
            border-right: none !important;
            border-bottom: 1px solid ${borderColor};
          }
        }
      `}</style>
    </>
  );
}
