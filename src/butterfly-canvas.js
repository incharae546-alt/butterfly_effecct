// ✦ BUTTERFLY EFFECT — Enhanced Visual Engine
import { playBeep, playPulseSound } from './audio.js';

let canvas, ctx;
let width = 0, height = 0;
let animationFrameId = null;

let particles = [];
let sparkles = [];
const NUM_PARTICLES = 320;
let currentMode = 'lorenz';

let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false, shockwave: 0 };
let wingBeatPhase = 0;
let globalTime = 0;

// 30fps cap
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastFrameTime = 0;

// ── Color Palette ──────────────────────────────────────────────
// Colors shift based on particle distance from center
function getParticleColor(distRatio, timeOffset) {
  const t = (distRatio + timeOffset * 0.3) % 1;
  if (t < 0.33) {
    // Cyan → Electric Blue
    const f = t / 0.33;
    return { r: Math.round(0 + f * 59), g: Math.round(242 - f * 112), b: 254 };
  } else if (t < 0.66) {
    // Blue → Purple/Magenta
    const f = (t - 0.33) / 0.33;
    return { r: Math.round(59 + f * 125), g: Math.round(130 - f * 89), b: Math.round(254 - f * 3) };
  } else {
    // Purple → Gold → back to Cyan
    const f = (t - 0.66) / 0.34;
    return { r: Math.round(184 - f * 184), g: Math.round(41 + f * 201), b: Math.round(251 - f * 3) };
  }
}

// ── Particle Class ─────────────────────────────────────────────
class Particle {
  constructor(index, total) {
    this.index = index;
    this.total = total;
    this.reset();
  }

  reset() {
    const t = (this.index / this.total) * Math.PI * 12;
    const wingSide = this.index % 2 === 0 ? 1 : -1;
    const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);

    this.baseX = wingSide * Math.sin(t) * r * 44;
    this.baseY = -Math.cos(t) * r * 44;
    this.baseZ = (Math.random() - 0.5) * 50;

    this.x = this.baseX;
    this.y = this.baseY;
    this.z = this.baseZ;

    // Normalized distance from center (0 = center, 1 = edge)
    const maxDist = 100;
    this.distRatio = Math.min(Math.sqrt(this.baseX * this.baseX + this.baseY * this.baseY) / maxDist, 1);

    this.size = 0.8 + (1 - this.distRatio) * 1.4 + Math.random() * 0.8;
    this.alpha = 0.55 + this.distRatio * 0.4;
    this.colorOffset = Math.random();
  }

  update(wingAngle, mouseEffect) {
    const cosAngle = Math.cos(wingAngle * Math.sign(this.baseX));
    const sinAngle = Math.sin(wingAngle * Math.sign(this.baseX));

    let targetX = this.baseX;
    let targetY = this.baseY;

    if (currentMode === 'lorenz') {
      const dt = 0.008;
      const dx = 10 * (this.y - this.x) * dt * 0.04;
      const dy = (this.x * (28 - this.z) - this.y) * dt * 0.04;
      targetX += dx * 9;
      targetY += dy * 9;
    } else if (currentMode === 'quantum') {
      const wave = Math.sin(this.distRatio * 8 - globalTime * 2) * 5;
      targetX += wave * Math.sign(this.baseX);
      targetY += Math.cos(this.distRatio * 8 - globalTime * 2) * 3;
    } else if (currentMode === 'neural') {
      const wave = Math.sin(this.distRatio * 0.05 - wingBeatPhase * 3) * 7;
      targetX += wave;
      targetY += wave * 0.5;
    }

    let x3d = targetX * cosAngle - this.baseZ * sinAngle;
    const z3d = targetX * sinAngle + this.baseZ * cosAngle;

    if (mouseEffect.dist < 160) {
      const force = (1 - mouseEffect.dist / 160) * 40;
      const angle = Math.atan2(this.y - mouseEffect.y, this.x - mouseEffect.x);
      x3d += Math.cos(angle) * force;
      targetY += Math.sin(angle) * force;
    }

    if (mouseEffect.shockwave > 0) {
      const shockForce = mouseEffect.shockwave * 22 * Math.sin(this.index * 0.7);
      x3d += (Math.random() - 0.5) * shockForce;
      targetY += (Math.random() - 0.5) * shockForce;
    }

    this.x += (x3d - this.x) * 0.1;
    this.y += (targetY - this.y) * 0.1;
    this.z += (z3d - this.z) * 0.1;
  }
}

// ── Sparkle Dust ───────────────────────────────────────────────
class Sparkle {
  constructor() { this.reset(); }
  reset() {
    // Place sparkles along butterfly wing outline
    const t = Math.random() * Math.PI * 12;
    const side = Math.random() > 0.5 ? 1 : -1;
    const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
    this.x = side * Math.sin(t) * r * 44 + (Math.random() - 0.5) * 10;
    this.y = -Math.cos(t) * r * 44 + (Math.random() - 0.5) * 10;
    this.life = 1.0;
    this.decay = 0.03 + Math.random() * 0.04;
    this.size = 0.8 + Math.random() * 1.8;
    this.color = Math.random() > 0.5 ? '0,242,254' : Math.random() > 0.5 ? '245,200,50' : '255,255,255';
  }
  update() { this.life -= this.decay; }
  isDead() { return this.life <= 0; }
}

// ── Init ───────────────────────────────────────────────────────
export function initButterflyCanvas(canvasElement) {
  if (!canvasElement) return;
  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  particles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) particles.push(new Particle(i, NUM_PARTICLES));

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left - width / 2;
    mouse.targetY = e.clientY - rect.top - height / 2;
    mouse.isHovered = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.isHovered = false; });
  canvas.addEventListener('click', () => { mouse.shockwave = 1.0; playPulseSound(); });

  startLoop();
}

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  width = rect.width || 400;
  height = rect.height || 400;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function setButterflyMode(mode) {
  currentMode = mode;
  playBeep(700, 0.08);
}

// ── Render Loop ────────────────────────────────────────────────
function startLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  function render(timestamp) {
    animationFrameId = requestAnimationFrame(render);
    if (document.hidden || !ctx || width === 0 || height === 0) return;
    if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = timestamp;

    globalTime += 0.025;
    wingBeatPhase += 0.04;

    // ── TRAIL EFFECT (semi-transparent clear = motion blur) ──
    ctx.fillStyle = 'rgba(3, 6, 20, 0.28)';
    ctx.fillRect(0, 0, width, height);

    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;
    if (mouse.shockwave > 0) {
      mouse.shockwave *= 0.93;
      if (mouse.shockwave < 0.01) mouse.shockwave = 0;
    }

    const wingAngle = Math.sin(wingBeatPhase) * 0.42;
    const breathScale = 1 + Math.sin(globalTime * 0.8) * 0.025; // subtle breathing

    const cx = width / 2;
    const cy = height / 2 + 10;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(breathScale, breathScale);

    const mouseEffect = {
      x: mouse.x, y: mouse.y,
      dist: Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y),
      shockwave: mouse.shockwave
    };

    // ── Update all particles ──
    for (let i = 0; i < particles.length; i++) particles[i].update(wingAngle, mouseEffect);

    // ── Draw connection lines (batched, color-keyed) ──
    ctx.lineWidth = 0.4;
    const lineGroups = {};
    for (let i = 0; i < particles.length; i += 4) {
      const p1 = particles[i];
      const c1 = getParticleColor(p1.distRatio, globalTime + p1.colorOffset);
      const key = `${c1.r},${c1.g},${c1.b}`;
      for (let j = i + 1; j < i + 8 && j < particles.length; j += 3) {
        const p2 = particles[j];
        const dx = p1.x - p2.x, dy = p1.y - p2.y;
        if (dx * dx + dy * dy < 1100) {
          if (!lineGroups[key]) lineGroups[key] = [];
          lineGroups[key].push(p1.x, p1.y, p2.x, p2.y);
        }
      }
    }
    for (const key in lineGroups) {
      const pts = lineGroups[key];
      ctx.strokeStyle = `rgba(${key}, 0.18)`;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i += 4) { ctx.moveTo(pts[i], pts[i+1]); ctx.lineTo(pts[i+2], pts[i+3]); }
      ctx.stroke();
    }

    // ── Draw particles (batched by dynamic color) ──
    const dotGroups = {};
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const c = getParticleColor(p.distRatio, globalTime + p.colorOffset);
      const key = `${c.r},${c.g},${c.b}`;
      if (!dotGroups[key]) dotGroups[key] = [];
      dotGroups[key].push(p);
    }
    for (const key in dotGroups) {
      const group = dotGroups[key];
      ctx.shadowColor = `rgba(${key}, 0.7)`;
      ctx.shadowBlur = 7;
      ctx.fillStyle = `rgba(${key}, 0.92)`;
      ctx.beginPath();
      for (let i = 0; i < group.length; i++) {
        const p = group[i];
        const scale = 1 + p.z / 180;
        const size = Math.max(0.5, p.size * scale);
        ctx.moveTo(p.x + size, p.y);
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      }
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // ── Sparkle dust particles ──
    if (Math.random() < 0.45) sparkles.push(new Sparkle());
    for (let i = sparkles.length - 1; i >= 0; i--) {
      sparkles[i].update();
      if (sparkles[i].isDead()) { sparkles.splice(i, 1); continue; }
      const s = sparkles[i];
      ctx.globalAlpha = s.life;
      ctx.fillStyle = `rgba(${s.color}, 1)`;
      ctx.shadowColor = `rgba(${s.color}, 1)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // ── Body: central glowing orb ──
    const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    bodyGrad.addColorStop(0.3, 'rgba(0, 242, 254, 0.8)');
    bodyGrad.addColorStop(0.7, 'rgba(184, 41, 255, 0.4)');
    bodyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 22;
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Antenna ──
    const antWave = Math.sin(wingBeatPhase * 1.5) * 9;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.quadraticCurveTo(-22 + antWave, -125, -32 + antWave, -142);
    ctx.moveTo(0, -80);
    ctx.quadraticCurveTo(22 - antWave, -125, 32 - antWave, -142);
    ctx.stroke();

    // Glowing antenna tips
    ctx.shadowColor = '#f5c832';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#f5c832';
    ctx.beginPath();
    ctx.arc(-32 + antWave, -142, 3.5, 0, Math.PI * 2);
    ctx.arc(32 - antWave, -142, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  render(0);
}
