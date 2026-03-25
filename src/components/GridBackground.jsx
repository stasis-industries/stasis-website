import { useRef, useEffect } from 'react';

const COLORS_DARK = {
  grid: 'rgba(240, 237, 233, 0.06)',
  dot: 'rgba(61, 184, 232, 0.12)',
  fault: 'rgba(232, 134, 42, 0.15)',
};
const COLORS_LIGHT = {
  grid: 'rgba(10, 10, 10, 0.06)',
  dot: 'rgba(61, 184, 232, 0.15)',
  fault: 'rgba(232, 134, 42, 0.18)',
};
const COLS = 20;
const ROWS = 12;
const DOT_COUNT = 15;
const FAULT_INTERVAL = 3000;

export default function GridBackground() {
  const canvasRef = useRef(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const mqHandler = (e) => { reducedMotion.current = e.matches; };
    mq.addEventListener('change', mqHandler);

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: DOT_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    let faultCell = null;
    let faultTime = 0;
    let animId;

    let isDark = document.documentElement.classList.contains('dark');
    const mutObs = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    mutObs.observe(document.documentElement, { attributes: true });

    function draw(time) {
      const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cellW = canvas.width / COLS;
      const cellH = canvas.height / ROWS;

      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, canvas.height);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(canvas.width, r * cellH);
        ctx.stroke();
      }

      if (reducedMotion.current) {
        animId = requestAnimationFrame(draw);
        return;
      }

      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.dot;
        ctx.fill();
      });

      if (!faultCell || time - faultTime > FAULT_INTERVAL) {
        faultCell = {
          c: Math.floor(Math.random() * COLS),
          r: Math.floor(Math.random() * ROWS),
        };
        faultTime = time;
      }
      const elapsed = time - faultTime;
      if (elapsed < 600) {
        const alpha = 0.15 * (1 - elapsed / 600);
        ctx.fillStyle = `rgba(232, 134, 42, ${alpha})`;
        ctx.fillRect(faultCell.c * cellW, faultCell.r * cellH, cellW, cellH);
      }

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      mq.removeEventListener('change', mqHandler);
      mutObs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
