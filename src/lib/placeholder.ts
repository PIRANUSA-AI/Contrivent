// Procedural "orbit" scene shown while a sequence has no footage yet.
// Driven by the same scroll progress as real frames, so the page feels right before videos exist.

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(2026);
const STARS = Array.from({ length: 280 }, () => ({
  x: random(),
  y: random(),
  size: random() ** 3 * 1.8 + 0.35,
  alpha: random() * 0.7 + 0.2,
  depth: random(),
}));

const TAU = Math.PI * 2;

export function drawPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, t: number, label: string) {
  const s = Math.min(w, h);
  const cx = w / 2;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#04060c';
  ctx.fillRect(0, 0, w, h);

  const nebula = ctx.createRadialGradient(cx, h * 0.2, 0, cx, h * 0.2, Math.max(w, h) * 0.85);
  nebula.addColorStop(0, 'rgba(70, 110, 230, 0.20)');
  nebula.addColorStop(0.5, 'rgba(24, 34, 80, 0.10)');
  nebula.addColorStop(1, 'rgba(4, 6, 12, 0)');
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, w, h);

  // Stars drift with depth-based parallax.
  ctx.fillStyle = '#e2eaff';
  const unit = s / 900;
  for (const star of STARS) {
    const y = ((((star.y - p * (0.12 + star.depth * 0.4)) % 1) + 1) % 1) * h;
    const twinkle = 0.65 + 0.35 * Math.sin(t * (0.8 + star.depth * 2) + star.x * 60);
    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fillRect(star.x * w, y, star.size * unit, star.size * unit);
  }
  ctx.globalAlpha = 1;

  // Planet rising as you scroll.
  const radius = Math.max(w * 0.78, h * 0.9);
  const top = h * (0.84 - 0.4 * p);
  const cy = top + radius;

  const atmosphere = ctx.createRadialGradient(cx, cy, radius * 0.97, cx, cy, radius * 1.1);
  atmosphere.addColorStop(0, 'rgba(130, 175, 255, 0.55)');
  atmosphere.addColorStop(0.3, 'rgba(244, 176, 74, 0.14)');
  atmosphere.addColorStop(1, 'rgba(79, 140, 255, 0)');
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, TAU);
  ctx.fill();

  const body = ctx.createLinearGradient(0, top, 0, top + radius * 0.5);
  body.addColorStop(0, '#20325a');
  body.addColorStop(0.12, '#0d1730');
  body.addColorStop(1, '#04060c');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200, 222, 255, 0.85)';
  ctx.lineWidth = Math.max(1, s * 0.0022);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 1.3, Math.PI * 1.7);
  ctx.stroke();

  // Sunrise flare on the horizon.
  ctx.globalCompositeOperation = 'lighter';
  const flare = ctx.createRadialGradient(cx, top, 0, cx, top, s * 0.55);
  flare.addColorStop(0, `rgba(255, 214, 160, ${0.3 + p * 0.4})`);
  flare.addColorStop(0.18, 'rgba(244, 176, 74, 0.16)');
  flare.addColorStop(1, 'rgba(244, 176, 74, 0)');
  ctx.fillStyle = flare;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  // HUD rings.
  const hy = h * 0.46;
  const base = s * 0.26 * (0.92 + p * 0.3);
  ctx.lineWidth = Math.max(1, s * 0.0012);
  const dashes = [[], [2, 10], [48, 18]];
  for (let k = 0; k < 3; k++) {
    const r = base * (1 + k * 0.3);
    const rotation = t * (0.06 + k * 0.04) * (k % 2 ? -1 : 1) + p * Math.PI * (k + 1) * 0.6;
    ctx.strokeStyle = `rgba(157, 184, 255, ${0.3 - k * 0.07})`;
    ctx.setLineDash(dashes[k].map((d) => d * unit * 1.5));
    ctx.beginPath();
    ctx.arc(cx, hy, r, rotation, rotation + Math.PI * (1.15 + k * 0.3));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const sweep = t * 0.5 + p * TAU;
  ctx.strokeStyle = 'rgba(56, 214, 232, 0.75)';
  ctx.lineWidth = Math.max(1.5, s * 0.003);
  ctx.beginPath();
  ctx.arc(cx, hy, base * 0.82, sweep, sweep + 0.35);
  ctx.stroke();

  // Status line.
  const frame = String(Math.round(p * 149) + 1).padStart(3, '0');
  ctx.font = `${Math.round(s * 0.0125)}px "Geist Mono", ui-monospace, monospace`;
  ctx.fillStyle = 'rgba(170, 182, 205, 0.55)';
  ctx.textAlign = 'right';
  ctx.fillText(`SIM // ${label.toUpperCase()} · FRAME ${frame}/150 · AWAITING FOOTAGE`, w - s * 0.04, h - s * 0.04);
}
