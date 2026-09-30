// Dynamic Abstract Digital Butterfly Engine (Canvas 2D / WebGL hybrid particle network)
import { playBeep, playPulseSound } from './audio.js';

let canvas, ctx;
let width = 0, height = 0;
let animationFrameId = null;

let particles = [];
const NUM_PARTICLES = 1400;
let currentMode = 'lorenz'; // 'lorenz' | 'quantum' | 'neural'

let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false, shockwave: 0 };
let wingBeatPhase = 0;
let time = 0;

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
    
    this.baseX = wingSide * Math.sin(t) * r * 42;
    this.baseY = -Math.cos(t) * r * 42;
    this.baseZ = (Math.random() - 0.5) * 40;

    this.x = this.baseX;
    this.y = this.baseY;
    this.z = this.baseZ;

    this.size = Math.random() * 1.5 + 0.8;
    this.alpha = Math.random() * 0.7 + 0.3;

    const colorType = Math.random();
    if (colorType < 0.5) {
      this.color = { r: 0, g: 242, b: 254 };
    } else if (colorType < 0.85) {
      this.color = { r: 184, g: 41, b: 255 };
    } else {
      this.color = { r: 59, g: 130, b: 246 };
    }
  }

  update(wingAngle, mouseEffect, currentMode) {
    time += 0.00002;

    const cosAngle = Math.cos(wingAngle * Math.sign(this.baseX));
    const sinAngle = Math.sin(wingAngle * Math.sign(this.baseX));

    let targetX = this.baseX;
    let targetY = this.baseY;

    if (currentMode === 'lorenz') {
      const dt = 0.008;
      const sigma = 10;
      const rho = 28;
      const beta = 8/3;

      let dx = sigma * (this.y - this.x) * dt * 0.04;
      let dy = (this.x * (rho - this.z) - this.y) * dt * 0.04;
      let dz = (this.x * this.y - beta * this.z) * dt * 0.04;

      targetX += dx * 8;
      targetY += dy * 8;
    } else if (currentMode === 'neural') {
      const distFromCenter = Math.sqrt(this.baseX * this.baseX + this.baseY * this.baseY);
      const wave = Math.sin(distFromCenter * 0.05 - wingBeatPhase * 3) * 6;
      targetX += wave;
      targetY += wave;
    }

    let x3d = targetX * cosAngle - this.baseZ * sinAngle;
    let z3d = targetX * sinAngle + this.baseZ * cosAngle;

    if (mouseEffect.dist < 160) {
      const force = (1 - mouseEffect.dist / 160) * 35;
      const angle = Math.atan2(this.y - mouseEffect.y, this.x - mouseEffect.x);
      x3d += Math.cos(angle) * force;
      targetY += Math.sin(angle) * force;
    }

    if (mouseEffect.shockwave > 0) {
      const shockForce = mouseEffect.shockwave * 25 * Math.sin(this.index);
      x3d += (Math.random() - 0.5) * shockForce;
      targetY += (Math.random() - 0.5) * shockForce;
    }

    this.x += (x3d - this.x) * 0.1;
    this.y += (targetY - this.y) * 0.1;
    this.z += (z3d - this.z) * 0.1;
  }
}

export function initButterflyCanvas(canvasElement) {
  if (!canvasElement) return;
  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  particles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle(i, NUM_PARTICLES));
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left - width / 2;
    mouse.targetY = e.clientY - rect.top - height / 2;
    mouse.isHovered = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.isHovered = false;
  });

  canvas.addEventListener('click', () => {
    mouse.shockwave = 1.0;
    playPulseSound();
  });

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

function startLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  function render() {
    animationFrameId = requestAnimationFrame(render);
    if (document.hidden || !ctx || width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    if (mouse.shockwave > 0) {
      mouse.shockwave *= 0.94;
      if (mouse.shockwave < 0.01) mouse.shockwave = 0;
    }

    wingBeatPhase += 0.04;
    const wingAngle = Math.sin(wingBeatPhase) * 0.45;

    const centerX = width / 2;
    const centerY = height / 2 + 10;

    ctx.save();
    ctx.translate(centerX, centerY);

    const mouseEffect = {
      x: mouse.x,
      y: mouse.y,
      dist: Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y),
      shockwave: mouse.shockwave
    };

    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i += 4) {
      const p1 = particles[i];
      p1.update(wingAngle, mouseEffect, currentMode);

      for (let j = i + 1; j < i + 8 && j < particles.length; j += 3) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 1300) {
          const lineAlpha = (1 - Math.sqrt(distSq) / 36) * 0.2;
          ctx.strokeStyle = `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const scale = 1 + p.z / 200;
      const alpha = p.alpha * Math.min(1, scale);

      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
      ctx.shadowBlur = p.size * 3;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * scale), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(0, 70);
    ctx.stroke();

    const antWave = Math.sin(wingBeatPhase * 1.5) * 8;
    ctx.beginPath();
    ctx.moveTo(0, -85);
    ctx.quadraticCurveTo(-25 + antWave, -130, -35 + antWave, -145);
    ctx.moveTo(0, -85);
    ctx.quadraticCurveTo(25 - antWave, -130, 35 - antWave, -145);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  render();
}
