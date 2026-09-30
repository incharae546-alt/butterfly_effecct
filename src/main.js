import { createIcons, PlayCircle, ArrowRight, Sliders, Activity, Zap, Share2, RadioReceiver, Cpu, Ship, Leaf, Navigation, Sun, MousePointerClick, Volume2, VolumeX, Menu, X, MapPin } from 'lucide';
import { initBgParticles } from './bg-particles.js';
import { initButterflyCanvas, setButterflyMode } from './butterfly-canvas.js';
import { initCityNetworkCanvas, cityNodesData, triggerNodePulse, pulseAllNodes } from './city-network.js';
import { initSimCityMap, cityLocationsData } from './sim-city-map.js';
import { toggleAudio, playBeep, playPulseSound } from './audio.js';

// Initialize Lucide Icons
createIcons({
  icons: {
    PlayCircle,
    ArrowRight,
    Sliders,
    Activity,
    Zap,
    Share2,
    RadioReceiver,
    Cpu,
    Ship,
    Leaf,
    Navigation,
    Sun,
    MousePointerClick,
    Volume2,
    VolumeX,
    Menu,
    X,
    MapPin
  }
});

// DOM Loaded Initialization
document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth Scrolling for Navigation Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // 2. Ambient Background Particles
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) initBgParticles(bgCanvas);

  // 3. Butterfly Hero Canvas Engine
  const butterflyCanvas = document.getElementById('butterfly-canvas');
  if (butterflyCanvas) initButterflyCanvas(butterflyCanvas);

  // 4. City Network Canvas Engine
  const cityCanvas = document.getElementById('city-network-canvas');
  if (cityCanvas) {
    initCityNetworkCanvas(cityCanvas, (node) => {
      updateNodeTelemetrySidebar(node);
    });
  }

  // 5. Large Fictional Simulator City Map Canvas Engine
  const simMapCanvas = document.getElementById('sim-city-map-canvas');
  if (simMapCanvas) {
    initSimCityMap(simMapCanvas, (location) => {
      updateMapInfoModal(location);
    });
  }

  // 6. MAKE ONE TINY CHANGE — Interactive Decision Cards logic
  const decisionCards = [
    document.getElementById('decision-card-1'),
    document.getElementById('decision-card-2'),
    document.getElementById('decision-card-3')
  ];
  const selectedDecisionBox = document.getElementById('selected-decision-box');
  const selectedDecisionText = document.getElementById('selected-decision-text');
  const simulateConsequencesBtn = document.getElementById('simulate-consequences-btn');

  let activeDecision = null;

  decisionCards.forEach((card, index) => {
    if (!card) return;
    card.addEventListener('click', () => {
      decisionCards.forEach(c => c?.classList.remove('selected'));
      card.classList.add('selected');
      playBeep(850 + index * 50, 0.1);

      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');
      const icon = card.querySelector('.card-icon-wrapper')?.textContent?.trim() || '';

      activeDecision = { title, desc, icon };

      if (selectedDecisionBox && selectedDecisionText) {
        selectedDecisionBox.classList.remove('opacity-40');
        selectedDecisionText.innerHTML = `<span class="text-cyan-300 font-bold">${icon} ${title}</span> — <span class="text-slate-300 font-normal">${desc}</span>`;
      }

      if (simulateConsequencesBtn) {
        simulateConsequencesBtn.removeAttribute('disabled');
        simulateConsequencesBtn.classList.remove('opacity-40', 'cursor-not-allowed');
      }
    });
  });

  if (simulateConsequencesBtn) {
    simulateConsequencesBtn.addEventListener('click', () => {
      if (simulateConsequencesBtn.hasAttribute('disabled')) return;
      playPulseSound();
      triggerNodePulse('dt-alpha');
      triggerNodePulse('loc-hospital-main');
    });
  }

  // 7. Mode Switchers for Butterfly Canvas
  const lorenzBtn = document.getElementById('butterfly-mode-lorenz');
  const quantumBtn = document.getElementById('butterfly-mode-quantum');
  const neuralBtn = document.getElementById('butterfly-mode-neural');
  const modeBtns = [lorenzBtn, quantumBtn, neuralBtn];

  function setActiveModeBtn(selectedBtn, modeName) {
    modeBtns.forEach(btn => {
      if (btn) {
        btn.classList.remove('active', 'bg-cyan-950', 'text-cyan-300', 'border-cyan-500/40');
        btn.classList.add('text-slate-400');
      }
    });
    if (selectedBtn) {
      selectedBtn.classList.add('active', 'bg-cyan-950', 'text-cyan-300', 'border-cyan-500/40');
      selectedBtn.classList.remove('text-slate-400');
    }
    setButterflyMode(modeName);
  }

  if (lorenzBtn) lorenzBtn.addEventListener('click', () => setActiveModeBtn(lorenzBtn, 'lorenz'));
  if (quantumBtn) quantumBtn.addEventListener('click', () => setActiveModeBtn(quantumBtn, 'quantum'));
  if (neuralBtn) neuralBtn.addEventListener('click', () => setActiveModeBtn(neuralBtn, 'neural'));

  // 8. Card 1 Interactive Perturbation Slider
  const slider = document.getElementById('card-decision-slider');
  const sliderVal = document.getElementById('card-slider-val');
  const cascadeMult = document.getElementById('cascade-multiplier');

  if (slider && sliderVal) {
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value).toFixed(2);
      sliderVal.textContent = `+${val} SEC`;
      if (cascadeMult) {
        const mult = Math.round(val * 11875);
        cascadeMult.textContent = `${mult.toLocaleString()}x`;
      }
    });
  }

  // 9. City Network Sidebar & Pulse Controls
  const pulseAllBtn = document.getElementById('city-pulse-all-btn');
  if (pulseAllBtn) {
    pulseAllBtn.addEventListener('click', () => {
      pulseAllNodes();
    });
  }

  const triggerRippleBtn = document.getElementById('trigger-node-ripple-btn');
  if (triggerRippleBtn) {
    triggerRippleBtn.addEventListener('click', () => {
      const selectedNameEl = document.getElementById('selected-node-name');
      const selectedNode = cityNodesData.find(n => n.name === selectedNameEl?.textContent) || cityNodesData[0];
      triggerNodePulse(selectedNode.id);
    });
  }

  // 11. Audio Sound FX Toggle
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const enabled = toggleAudio();
      if (audioIcon) {
        audioIcon.setAttribute('data-lucide', enabled ? 'volume-2' : 'volume-x');
        createIcons({ icons: { Volume2, VolumeX } });
      }
    });
  }

  // 12. Mobile Navigation Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // 13. FPS Counter
  const fpsEl = document.getElementById('fps-counter');
  let frameCount = 0;
  let lastTime = performance.now();

  function calcFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsEl) fpsEl.textContent = `${fps} FPS`;
      frameCount = 0;
      lastTime = now;
    }
    requestAnimationFrame(calcFPS);
  }
  requestAnimationFrame(calcFPS);
});

// Update Node Telemetry Sidebar UI
function updateNodeTelemetrySidebar(node) {
  const nameEl = document.getElementById('selected-node-name');
  const codeEl = document.getElementById('selected-node-code');
  const statusEl = document.getElementById('selected-node-status');
  const descEl = document.getElementById('selected-node-desc');
  const loadText = document.getElementById('selected-node-load-text');
  const loadBar = document.getElementById('selected-node-load-bar');
  const upstream = document.getElementById('selected-node-upstream');
  const downstream = document.getElementById('selected-node-downstream');

  if (nameEl) nameEl.textContent = node.name;
  if (codeEl) codeEl.textContent = node.code;
  if (statusEl) {
    statusEl.textContent = node.status;
    statusEl.className = `px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full uppercase border ${
      node.status === 'HIGH LOAD' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
      node.status === 'QUANTUM LOCKED' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    }`;
  }
  if (descEl) descEl.textContent = node.desc;
  if (loadText) loadText.textContent = `${node.load}%`;
  if (loadBar) loadBar.style.width = `${node.load}%`;
  if (upstream) upstream.textContent = `${node.upstream} Channels`;
  if (downstream) downstream.textContent = `${node.downstream} Pathways`;
}

// Update Map Info Modal Overlay on Location Click
function updateMapInfoModal(loc) {
  const titleEl = document.getElementById('sim-info-title');
  const descEl = document.getElementById('sim-info-desc');
  const districtEl = document.getElementById('sim-info-district');
  const typeEl = document.getElementById('sim-info-type');
  const badgeEl = document.getElementById('sim-info-badge');
  const metricEl = document.getElementById('sim-info-metric');

  if (titleEl) titleEl.textContent = loc.name;
  if (descEl) descEl.textContent = loc.desc;
  if (districtEl) districtEl.textContent = loc.district;
  if (typeEl) typeEl.textContent = loc.type;
  if (badgeEl) {
    badgeEl.textContent = loc.statusBadge;
    badgeEl.style.color = loc.statusColor;
    badgeEl.style.borderColor = loc.statusColor;
  }
  if (metricEl) metricEl.textContent = loc.metric;
}
