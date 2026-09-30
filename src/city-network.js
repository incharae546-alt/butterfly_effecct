// Interconnected City Network Node Simulator Canvas
import { playBeep, playPulseSound } from './audio.js';

let canvas, ctx;
let width = 0, height = 0;
let animationFrameId = null;

export const cityNodesData = [
  {
    id: 'dt-alpha',
    name: 'Downtown Grid Alpha',
    code: 'NODE ID: #DT-ALPHA-01',
    status: 'STABLE',
    load: 78.4,
    upstream: 8,
    downstream: 14,
    color: '#00f2fe',
    desc: 'Central traffic autonomous hub regulating over 450,000 daily transit vectors and signal synchronized corridors.',
    relX: 0.25,
    relY: 0.35,
    radius: 16,
    icon: 'cpu'
  },
  {
    id: 'cyber-port',
    name: 'Cyber Port Marine',
    code: 'NODE ID: #CP-PORT-04',
    status: 'OPTIMIZED',
    load: 42.1,
    upstream: 5,
    downstream: 9,
    color: '#b829ff',
    desc: 'Autonomous container shipping & drone cargo dispatch terminal operating along coastal hydro-corridors.',
    relX: 0.70,
    relY: 0.28,
    radius: 14,
    icon: 'ship'
  },
  {
    id: 'eco-arc',
    name: 'Eco Arc Habitat',
    code: 'NODE ID: #ECO-ARC-09',
    status: 'STABLE',
    load: 64.8,
    upstream: 12,
    downstream: 18,
    color: '#00ff9d',
    desc: 'Vertical bio-dome cluster maintaining microclimate humidity, carbon scrubbing, and oxygen balance.',
    relX: 0.45,
    relY: 0.68,
    radius: 15,
    icon: 'leaf'
  },
  {
    id: 'sky-ring',
    name: 'Sky Ring Transit',
    code: 'NODE ID: #SKY-RING-02',
    status: 'HIGH LOAD',
    load: 89.2,
    upstream: 15,
    downstream: 22,
    color: '#3b82f6',
    desc: 'Hyperloop tube matrix and aerial skybus station linking outer commuter rings to core business sectors.',
    relX: 0.80,
    relY: 0.72,
    radius: 14,
    icon: 'navigation'
  },
  {
    id: 'neon-hub',
    name: 'Neon Tech Hub',
    code: 'NODE ID: #NEON-CORE-07',
    status: 'QUANTUM LOCKED',
    load: 91.5,
    upstream: 24,
    downstream: 32,
    color: '#f59e0b',
    desc: 'High-density quantum computing core processing real-time causality calculations and predictive AI models.',
    relX: 0.52,
    relY: 0.25,
    radius: 18,
    icon: 'zap'
  },
  {
    id: 'solar-ridge',
    name: 'Solar Array Ridge',
    code: 'NODE ID: #SOLAR-RIDGE-12',
    status: 'STABLE',
    load: 55.0,
    upstream: 4,
    downstream: 11,
    color: '#00f2fe',
    desc: 'Perovskite solar farm and thermal storage grid supplying clean energy reserve to northern districts.',
    relX: 0.18,
    relY: 0.78,
    radius: 13,
    icon: 'sun'
  }
];

const cityConnections = [
  { from: 'dt-alpha', to: 'neon-hub' },
  { from: 'dt-alpha', to: 'eco-arc' },
  { from: 'dt-alpha', to: 'solar-ridge' },
  { from: 'neon-hub', to: 'cyber-port' },
  { from: 'cyber-port', to: 'sky-ring' },
  { from: 'eco-arc', to: 'sky-ring' },
  { from: 'eco-arc', to: 'solar-ridge' },
  { from: 'neon-hub', to: 'sky-ring' },
  { from: 'dt-alpha', to: 'cyber-port' }
];

let activeNode = cityNodesData[0];
let pulses = [];

export function initCityNetworkCanvas(canvasElement, onNodeSelectCallback) {
  if (!canvasElement) return;
  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const node of cityNodesData) {
      const nx = node.relX * width;
      const ny = node.relY * height;
      const dist = Math.hypot(clickX - nx, clickY - ny);

      if (dist <= node.radius + 10) {
        activeNode = node;
        triggerNodePulse(node.id);
        playBeep(800, 0.1);
        if (onNodeSelectCallback) onNodeSelectCallback(node);
        break;
      }
    }
  });

  setInterval(() => {
    if (document.hidden) return;
    if (Math.random() < 0.6 && cityConnections.length > 0 && pulses.length < 15) {
      const conn = cityConnections[Math.floor(Math.random() * cityConnections.length)];
      pulses.push({
        fromId: conn.from,
        toId: conn.to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012
      });
    }
  }, 1400);

  startLoop();
}

export function triggerNodePulse(nodeId) {
  playPulseSound();
  cityConnections.forEach(conn => {
    if (conn.from === nodeId || conn.to === nodeId) {
      if (pulses.length < 20) {
        pulses.push({
          fromId: conn.from === nodeId ? conn.from : conn.to,
          toId: conn.from === nodeId ? conn.to : conn.from,
          progress: 0,
          speed: 0.022
        });
      }
    }
  });
}

export function pulseAllNodes() {
  playPulseSound();
  cityNodesData.forEach(node => {
    triggerNodePulse(node.id);
  });
}

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  width = rect.width || 500;
  height = rect.height || 400;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  let pulseTime = 0;

  function render() {
    animationFrameId = requestAnimationFrame(render);
    if (document.hidden || !ctx || width === 0 || height === 0) return;

    pulseTime += 0.03;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    cityConnections.forEach(conn => {
      const fromNode = cityNodesData.find(n => n.id === conn.from);
      const toNode = cityNodesData.find(n => n.id === conn.to);

      if (fromNode && toNode) {
        const x1 = fromNode.relX * width;
        const y1 = fromNode.relY * height;
        const x2 = toNode.relX * width;
        const y2 = toNode.relY * height;

        const isHighlighted = (activeNode && (activeNode.id === conn.from || activeNode.id === conn.to));

        ctx.strokeStyle = isHighlighted ? 'rgba(0, 242, 254, 0.5)' : 'rgba(15, 43, 102, 0.6)';
        ctx.lineWidth = isHighlighted ? 2 : 1;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;

      const fromNode = cityNodesData.find(n => n.id === p.fromId);
      const toNode = cityNodesData.find(n => n.id === p.toId);

      if (fromNode && toNode) {
        const px = fromNode.relX * width + (toNode.relX * width - fromNode.relX * width) * p.progress;
        const py = fromNode.relY * height + (toNode.relY * height - fromNode.relY * height) * p.progress;

        ctx.fillStyle = '#00f2fe';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      if (p.progress >= 1) {
        pulses.splice(i, 1);
      }
    }

    cityNodesData.forEach(node => {
      const nx = node.relX * width;
      const ny = node.relY * height;
      const isActive = activeNode && activeNode.id === node.id;

      const ringRadius = node.radius + Math.sin(pulseTime * 2 + node.radius) * 3 + (isActive ? 6 : 0);
      
      ctx.strokeStyle = isActive ? node.color : 'rgba(0, 242, 254, 0.3)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.beginPath();
      ctx.arc(nx, ny, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = isActive ? node.color : 'rgba(6, 11, 30, 0.9)';
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isActive ? 20 : 8;

      ctx.beginPath();
      ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
      ctx.font = `600 11px 'Orbitron', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name, nx, ny + node.radius + 16);
    });
  }

  render();
}
