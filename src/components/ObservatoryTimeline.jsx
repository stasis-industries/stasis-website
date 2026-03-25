import { useRef, useEffect, useState } from 'react';

const TIMELINE_H = 250;
const FAULT_POINT = 40;
const TOTAL_POINTS = 100;
const ANIM_DURATION = 5000;
const PAUSE_DURATION = 1500;

function baselineNoise(i) {
  return Math.sin(i * 0.3) * 0.015 + Math.cos(i * 0.7) * 0.01 + Math.sin(i * 1.1) * 0.008;
}

function generateBaseline() {
  const points = [];
  for (let i = 0; i < TOTAL_POINTS; i++) {
    points.push(0.80 + baselineNoise(i));
  }
  return points;
}

function generateFaultInjection(baseline) {
  const points = [];
  for (let i = 0; i < TOTAL_POINTS; i++) {
    if (i <= FAULT_POINT) {
      points.push(baseline[i]);
    } else {
      const elapsed = (i - FAULT_POINT) / (TOTAL_POINTS - FAULT_POINT);
      const dip = Math.exp(-elapsed * 2.5) * 0.30;
      const recovery = 0.72;
      const noise = Math.sin(i * 0.4) * 0.012 + Math.cos(i * 0.9) * 0.008;
      points.push(Math.min(baseline[i], recovery - dip + noise));
    }
  }
  return points;
}

export default function ObservatoryTimeline() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isDarkRef = useRef(false);

  useEffect(() => {
    isDarkRef.current = document.documentElement.classList.contains('dark');
    const mutObs = new MutationObserver(() => {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    });
    mutObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mutObs.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsPlaying(entry.isIntersecting)),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    let width = container.clientWidth;
    const height = TIMELINE_H;
    const baselineData = generateBaseline();
    const faultData = generateFaultInjection(baselineData);

    function resize() {
      width = container.clientWidth;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    let animStart = null;
    let frameId = null;
    let running = true;

    const pad = { top: 40, bottom: 30, left: 20, right: 0 };
    const plotW = () => width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    function xForIndex(i, pw) {
      return pad.left + (i / (TOTAL_POINTS - 1)) * pw;
    }
    function yForValue(v) {
      return pad.top + plotH - v * plotH;
    }

    function drawCurve(data, pointCount, pw, style) {
      if (pointCount < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = style.color;
      ctx.lineWidth = style.lineWidth;
      ctx.lineJoin = 'round';
      if (style.dash) ctx.setLineDash(style.dash);
      else ctx.setLineDash([]);
      for (let i = 0; i < pointCount; i++) {
        const x = xForIndex(i, pw);
        const y = yForValue(data[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function draw(time) {
      if (!running) return;
      if (!isPlaying) { animStart = null; frameId = requestAnimationFrame(draw); return; }
      if (!animStart) animStart = time;

      let elapsed = (time - animStart) % (ANIM_DURATION + PAUSE_DURATION);
      const progress = Math.min(elapsed / ANIM_DURATION, 1);
      const dark = isDarkRef.current;
      const pw = plotW();
      const labelColor = dark ? 'rgba(240,237,233,0.4)' : 'rgba(10,10,10,0.4)';
      const baselineColor = dark ? 'rgba(240,237,233,0.35)' : 'rgba(10,10,10,0.35)';

      ctx.clearRect(0, 0, width, height);
      const faultX = xForIndex(FAULT_POINT, pw);
      const pointCount = Math.floor(TOTAL_POINTS * progress);

      // Red tint after fault
      if (pointCount > FAULT_POINT) {
        const drawnEndX = xForIndex(Math.min(pointCount - 1, TOTAL_POINTS - 1), pw);
        ctx.fillStyle = dark ? 'rgba(153,27,27,0.06)' : 'rgba(153,27,27,0.04)';
        ctx.fillRect(faultX, pad.top, drawnEndX - faultX, plotH);
      }

      // Fault marker line
      if (pointCount > FAULT_POINT) {
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(faultX, pad.top - 5);
        ctx.lineTo(faultX, pad.top + plotH + 5);
        ctx.stroke();

        ctx.font = '9px "DM Mono", monospace';
        ctx.fillStyle = '#991B1B';
        ctx.textAlign = 'left';
        ctx.fillText('FAULT INJECTED', faultX + 8, pad.top - 8);
      }

      // Phase labels
      ctx.font = '9px "DM Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = labelColor;
      if (pointCount > 10 && pointCount <= FAULT_POINT) {
        ctx.fillText('IDENTICAL', pad.left + (faultX - pad.left) / 2, pad.top + 16);
      } else if (pointCount > FAULT_POINT) {
        ctx.fillText('IDENTICAL', pad.left + (faultX - pad.left) / 2, pad.top + 16);
        ctx.fillText('DIVERGENCE', faultX + (pad.left + pw - faultX) / 2, pad.top + 16);
      }

      // Draw both curves
      drawCurve(baselineData, pointCount, pw, { color: baselineColor, lineWidth: 1.5, dash: [5, 5] });
      drawCurve(faultData, pointCount, pw, { color: '#047857', lineWidth: 2, dash: null });

      // Endpoint labels
      if (pointCount > TOTAL_POINTS * 0.7) {
        const lastIdx = Math.min(pointCount - 1, TOTAL_POINTS - 1);
        const labelX = xForIndex(lastIdx, pw);
        ctx.font = '9px "DM Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = baselineColor;
        ctx.fillText('BASELINE', labelX + 6, yForValue(baselineData[lastIdx]));
        ctx.fillStyle = '#047857';
        ctx.fillText('FAULT INJECTION', labelX + 6, yForValue(faultData[lastIdx]) + 2);
      }

      // Y-axis label
      if (progress > 0.2) {
        ctx.fillStyle = labelColor;
        ctx.globalAlpha = 0.6;
        ctx.save();
        ctx.translate(pad.left - 6, pad.top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '9px "DM Mono", monospace';
        ctx.fillText('THROUGHPUT', 0, -4);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      frameId = requestAnimationFrame(draw);
    }

    frameId = requestAnimationFrame(draw);
    return () => { running = false; window.removeEventListener('resize', resize); if (frameId) cancelAnimationFrame(frameId); };
  }, [isPlaying]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
    </div>
  );
}
