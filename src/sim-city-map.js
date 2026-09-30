// Futuristic Interactive Fictional City Map Engine
import { playBeep, playPulseSound } from './audio.js';

let canvas, ctx;
let width = 0, height = 0;
let animId = null;

export const districtsData = [
  {
    id: 'dist-central',
    name: 'Central District',
    type: 'Commercial & Transit Core',
    color: 'rgba(0, 242, 254, 0.15)',
    strokeColor: '#00f2fe',
    bounds: [
      { x: 0.38, y: 0.30 },
      { x: 0.62, y: 0.30 },
      { x: 0.65, y: 0.58 },
      { x: 0.35, y: 0.58 }
    ]
  },
  {
    id: 'dist-hospital',
    name: 'Hospital Zone',
    type: 'Emergency Medical & Bio-Tech',
    color: 'rgba(0, 255, 157, 0.15)',
    strokeColor: '#00ff9d',
    bounds: [
      { x: 0.10, y: 0.15 },
      { x: 0.34, y: 0.15 },
      { x: 0.34, y: 0.42 },
      { x: 0.10, y: 0.42 }
    ]
  },
  {
    id: 'dist-school',
    name: 'School Zone',
    type: 'Academic & Research Campus',
    color: 'rgba(245, 158, 11, 0.15)',
    strokeColor: '#f59e0b',
    bounds: [
      { x: 0.66, y: 0.15 },
      { x: 0.90, y: 0.15 },
      { x: 0.90, y: 0.40 },
      { x: 0.66, y: 0.40 }
    ]
  },
  {
    id: 'dist-residential',
    name: 'Residential District',
    type: 'High-Density Smart Living',
    color: 'rgba(184, 41, 255, 0.15)',
    strokeColor: '#b829ff',
    bounds: [
      { x: 0.10, y: 0.48 },
      { x: 0.32, y: 0.48 },
      { x: 0.32, y: 0.85 },
      { x: 0.10, y: 0.85 }
    ]
  },
  {
    id: 'dist-commercial',
    name: 'Commercial District',
    type: 'Cyber Finance & Retail Arc',
    color: 'rgba(59, 130, 246, 0.15)',
    strokeColor: '#3b82f6',
    bounds: [
      { x: 0.36, y: 0.62 },
      { x: 0.64, y: 0.62 },
      { x: 0.64, y: 0.88 },
      { x: 0.36, y: 0.88 }
    ]
  },
  {
    id: 'dist-industrial',
    name: 'Industrial Zone',
    type: 'Autonomous Energy & Manufacturing',
    color: 'rgba(239, 68, 68, 0.15)',
    strokeColor: '#ef4444',
    bounds: [
      { x: 0.68, y: 0.45 },
      { x: 0.90, y: 0.45 },
      { x: 0.90, y: 0.85 },
      { x: 0.68, y: 0.85 }
    ]
  }
];

export const cityLocationsData = [
  {
    id: 'loc-hospital-main',
    name: 'Aegis Central Medical Complex',
    district: 'Hospital Zone',
    type: 'Emergency Medical',
    status: 'Normal Operations',
    statusBadge: 'STABLE',
    statusColor: '#00ff9d',
    relX: 0.22,
    relY: 0.28,
    metric: 'Ambulance Response: 2.1 mins | ICU Beds: 68% Available',
    desc: 'Primary Level-1 trauma center connected directly to Emergency Route Alpha for zero-delay patient transport.'
  },
  {
    id: 'loc-central-plaza',
    name: 'Metropolis Core Station',
    district: 'Central District',
    type: 'Transit & Civic Hub',
    status: 'High Density Flow',
    statusBadge: 'OPTIMIZED',
    statusColor: '#00f2fe',
    relX: 0.50,
    relY: 0.44,
    metric: 'Traffic Throughput: 42,000 cars/hr | Delay Index: 0.0s',
    desc: 'Central automated traffic hub controlling signals across all 6 connected city corridors.'
  },
  {
    id: 'loc-school-academy',
    name: 'Neo-Genesis University Campus',
    district: 'School Zone',
    type: 'Educational & Research',
    status: 'Active Campus Hours',
    statusBadge: 'NORMAL',
    statusColor: '#f59e0b',
    relX: 0.78,
    relY: 0.28,
    metric: 'Student Population: 18,500 | Pedestrian Safety: 99.8%',
    desc: 'Autonomous school zone with synchronized speed limiters and pedestrian protection fields.'
  },
  {
    id: 'loc-residential-towers',
    name: 'Aetheria Arc Arcologies',
    district: 'Residential District',
    type: 'Smart Residential Complex',
    status: 'Standard Grid Mode',
    statusBadge: 'STABLE',
    statusColor: '#b829ff',
    relX: 0.21,
    relY: 0.66,
    metric: 'Energy Consumption: 14.2 MW | Micro-Climate: 22.4°C',
    desc: 'High-density eco-towers housing 120,000 citizens with integrated solar facade energy harvesting.'
  },
  {
    id: 'loc-finance-center',
    name: 'Cyber Quantum Exchange',
    district: 'Commercial District',
    type: 'Commercial & Financial',
    status: 'Peak Trading Stream',
    statusBadge: 'HIGH LOAD',
    statusColor: '#3b82f6',
    relX: 0.50,
    relY: 0.75,
    metric: 'Network Transactions: 1.2M/sec | Power draw: 8.4 MW',
    desc: 'Financial nerve center processing high-frequency automated trade routing and local commerce.'
  },
  {
    id: 'loc-industrial-power',
    name: 'Hyperion Fusion & Substation 09',
    district: 'Industrial Zone',
    type: 'Industrial Power Grid',
    status: 'Grid Peak Load',
    statusBadge: 'OPTIMAL',
    statusColor: '#ef4444',
    relX: 0.79,
    relY: 0.65,
    metric: 'Output Capacity: 450 MW | Thermal Stability: 98.9%',
    desc: 'Primary energy generation station supplying high-voltage current to central grid corridors.'
  },
  {
    id: 'loc-emergency-node',
    name: 'Emergency Arterial Relay 01',
    district: 'Emergency Route',
    type: 'Priority Transit Corridor',
    status: 'Priority Corridor Clear',
    statusBadge: 'PRIORITY',
    statusColor: '#00ff9d',
    relX: 0.35,
    relY: 0.40,
    metric: 'Emergency Override: Armed | Clearance Time: < 3 secs',
    desc: 'High-speed emergency priority avenue allowing instant signal preempting for emergency vehicles.'
  }
];

const cityRoads = [
  {
    isEmergency: true,
    points: [
      { x: 0.10, y: 0.28 },
      { x: 0.35, y: 0.28 },
      { x: 0.35, y: 0.44 },
      { x: 0.50, y: 0.44 },
      { x: 0.50, y: 0.75 },
      { x: 0.79, y: 0.75 }
    ]
  },
  {
    isEmergency: false,
    points: [{ x: 0.22, y: 0.15 }, { x: 0.22, y: 0.85 }]
  },
  {
    isEmergency: false,
    points: [{ x: 0.50, y: 0.15 }, { x: 0.50, y: 0.88 }]
  },
  {
    isEmergency: false,
    points: [{ x: 0.78, y: 0.15 }, { x: 0.78, y: 0.85 }]
  },
  {
    isEmergency: false,
    points: [{ x: 0.10, y: 0.28 }, { x: 0.90, y: 0.28 }]
  },
  {
    isEmergency: false,
    points: [{ x: 0.10, y: 0.66 }, { x: 0.90, y: 0.66 }]
  }
];

const cityBuildings = [
  { x: 0.14, y: 0.18, w: 0.06, h: 0.07, color: 'rgba(0, 255, 157, 0.2)' },
  { x: 0.26, y: 0.18, w: 0.05, h: 0.07, color: 'rgba(0, 255, 157, 0.2)' },
  { x: 0.14, y: 0.32, w: 0.07, h: 0.07, color: 'rgba(0, 255, 157, 0.2)' },
  { x: 0.70, y: 0.18, w: 0.06, h: 0.07, color: 'rgba(245, 158, 11, 0.2)' },
  { x: 0.82, y: 0.18, w: 0.06, h: 0.07, color: 'rgba(245, 158, 11, 0.2)' },
  { x: 0.42, y: 0.34, w: 0.06, h: 0.07, color: 'rgba(0, 242, 254, 0.25)' },
  { x: 0.54, y: 0.34, w: 0.06, h: 0.07, color: 'rgba(0, 242, 254, 0.25)' },
  { x: 0.42, y: 0.48, w: 0.06, h: 0.08, color: 'rgba(0, 242, 254, 0.25)' },
  { x: 0.54, y: 0.48, w: 0.06, h: 0.08, color: 'rgba(0, 242, 254, 0.25)' },
  { x: 0.14, y: 0.52, w: 0.06, h: 0.10, color: 'rgba(184, 41, 255, 0.2)' },
  { x: 0.24, y: 0.52, w: 0.06, h: 0.10, color: 'rgba(184, 41, 255, 0.2)' },
  { x: 0.14, y: 0.72, w: 0.06, h: 0.10, color: 'rgba(184, 41, 255, 0.2)' },
  { x: 0.24, y: 0.72, w: 0.06, h: 0.10, color: 'rgba(184, 41, 255, 0.2)' },
  { x: 0.40, y: 0.68, w: 0.08, h: 0.06, color: 'rgba(59, 130, 246, 0.2)' },
  { x: 0.54, y: 0.68, w: 0.08, h: 0.06, color: 'rgba(59, 130, 246, 0.2)' },
  { x: 0.72, y: 0.50, w: 0.06, h: 0.10, color: 'rgba(239, 68, 68, 0.2)' },
  { x: 0.82, y: 0.50, w: 0.06, h: 0.10, color: 'rgba(239, 68, 68, 0.2)' },
  { x: 0.72, y: 0.70, w: 0.06, h: 0.10, color: 'rgba(239, 68, 68, 0.2)' },
  { x: 0.82, y: 0.70, w: 0.06, h: 0.10, color: 'rgba(239, 68, 68, 0.2)' }
];

let trafficDots = [];

class TrafficDot {
  constructor(road) {
    this.road = road;
    this.progress = Math.random();
    this.speed = 0.002 + Math.random() * 0.003;
    this.color = road.isEmergency ? '#00ff9d' : (Math.random() > 0.5 ? '#00f2fe' : '#b829ff');
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.progress = 0;
    }
  }

  getPosition(w, h) {
    const pts = this.road.points;
    if (pts.length === 2) {
      return {
        x: (pts[0].x + (pts[1].x - pts[0].x) * this.progress) * w,
        y: (pts[0].y + (pts[1].y - pts[0].y) * this.progress) * h
      };
    } else {
      const totalSegs = pts.length - 1;
      const scaledProgress = this.progress * totalSegs;
      const segIndex = Math.min(Math.floor(scaledProgress), totalSegs - 1);
      const segProgress = scaledProgress - segIndex;
      const p1 = pts[segIndex];
      const p2 = pts[segIndex + 1];
      return {
        x: (p1.x + (p2.x - p1.x) * segProgress) * w,
        y: (p1.y + (p2.y - p1.y) * segProgress) * h
      };
    }
  }
}

let activeLocation = cityLocationsData[0];
let hoverLocation = null;
let onSelectCallback = null;

export function initSimCityMap(canvasElement, callback) {
  if (!canvasElement) return;
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  onSelectCallback = callback;

  resize();
  window.addEventListener('resize', resize);

  trafficDots = [];
  cityRoads.forEach(road => {
    for (let i = 0; i < 4; i++) {
      trafficDots.push(new TrafficDot(road));
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let foundHover = null;
    cityLocationsData.forEach(loc => {
      const lx = loc.relX * width;
      const ly = loc.relY * height;
      if (Math.hypot(mx - lx, my - ly) < 20) {
        foundHover = loc;
      }
    });

    hoverLocation = foundHover;
    canvas.style.cursor = foundHover ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    cityLocationsData.forEach(loc => {
      const lx = loc.relX * width;
      const ly = loc.relY * height;
      if (Math.hypot(mx - lx, my - ly) < 22) {
        activeLocation = loc;
        playPulseSound();
        if (onSelectCallback) onSelectCallback(loc);
      }
    });
  });

  startLoop();
}

function resize() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  width = rect.width || 600;
  height = rect.height || 500;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const SIM_FPS = 30;
const SIM_INTERVAL = 1000 / SIM_FPS;
let simLastFrame = 0;

function startLoop() {
  if (animId) cancelAnimationFrame(animId);

  let pulseTimer = 0;

  function render(timestamp) {
    animId = requestAnimationFrame(render);
    if (!ctx || width === 0 || height === 0) return;
    if (timestamp - simLastFrame < SIM_INTERVAL) return;
    simLastFrame = timestamp;

    pulseTimer += 0.04;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    districtsData.forEach(dist => {
      ctx.fillStyle = dist.color;
      ctx.strokeStyle = dist.strokeColor;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      dist.bounds.forEach((pt, idx) => {
        const px = pt.x * width;
        const py = pt.y * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const firstPt = dist.bounds[0];
      ctx.fillStyle = dist.strokeColor;
      ctx.font = `600 11px 'Orbitron', sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(dist.name.toUpperCase(), firstPt.x * width + 10, firstPt.y * height + 18);
    });

    cityBuildings.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.fillRect(b.x * width, b.y * height, b.w * width, b.h * height);
      ctx.strokeRect(b.x * width, b.y * height, b.w * width, b.h * height);
    });

    cityRoads.forEach(road => {
      ctx.beginPath();
      road.points.forEach((pt, idx) => {
        const rx = pt.x * width;
        const ry = pt.y * height;
        if (idx === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });

      if (road.isEmergency) {
        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ff9d';
        ctx.shadowBlur = 12;
      } else {
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Batch traffic dots by color to avoid per-dot shadowBlur
    const dotGroups = {};
    trafficDots.forEach(dot => {
      dot.update();
      if (!dotGroups[dot.color]) dotGroups[dot.color] = [];
      dotGroups[dot.color].push(dot.getPosition(width, height));
    });
    for (const color in dotGroups) {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      dotGroups[color].forEach(pos => {
        ctx.moveTo(pos.x + 3, pos.y);
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      });
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    cityLocationsData.forEach(loc => {
      const lx = loc.relX * width;
      const ly = loc.relY * height;
      const isSelected = activeLocation && activeLocation.id === loc.id;
      const isHovered = hoverLocation && hoverLocation.id === loc.id;

      const ringR = 12 + Math.sin(pulseTimer * 3) * 3 + (isSelected ? 5 : 0);
      ctx.strokeStyle = isSelected ? loc.statusColor : (isHovered ? '#00f2fe' : 'rgba(255,255,255,0.4)');
      ctx.lineWidth = isSelected ? 2.5 : 1.5;

      ctx.beginPath();
      ctx.arc(lx, ly, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = loc.statusColor;
      ctx.shadowColor = loc.statusColor;
      ctx.shadowBlur = isSelected ? 18 : 8;

      ctx.beginPath();
      ctx.arc(lx, ly, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = `600 ${isSelected ? '12px' : '10px'} 'Outfit', sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(loc.name, lx, ly + 22);
    });

    ctx.strokeStyle = 'rgba(184, 41, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cityLocationsData[0].relX * width, cityLocationsData[0].relY * height);
    ctx.lineTo(cityLocationsData[1].relX * width, cityLocationsData[1].relY * height);
    ctx.lineTo(cityLocationsData[5].relX * width, cityLocationsData[5].relY * height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  render();
}
