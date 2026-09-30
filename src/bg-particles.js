// Ambient Floating Particles background canvas
let canvas, ctx;
let width = 0, height = 0;
let particles = [];
let animId = null;

class AmbientParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = -Math.random() * 0.4 - 0.1;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, ' : 'rgba(184, 41, 255, ';
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < 0 || this.x < 0 || this.x > width) {
      this.reset();
      this.y = height + 10;
    }
  }

  draw() {
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function initBgParticles(canvasElement) {
  if (!canvasElement) return;
  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push(new AmbientParticle());
  }

  const BG_INTERVAL = 1000 / 30;
  let bgLastFrame = 0;

  function loop(timestamp) {
    animId = requestAnimationFrame(loop);
    if (!ctx || width === 0 || height === 0) return;
    if (timestamp - bgLastFrame < BG_INTERVAL) return;
    bgLastFrame = timestamp;

    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
  }

  loop(0);
}

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth || 1200;
  height = window.innerHeight || 800;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
