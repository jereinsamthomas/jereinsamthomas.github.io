/**
 * ============================================================================
 * JEREIN SAM THOMAS // FOOTBALL ANALYTICS & SPORTS DATA SCIENCE
 * Interactive Tactical Pitch Formation Engine, Sound FX & Smooth Transitions
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. FORMATION DATA & POSITIONAL COORDINATE SYSTEMS (40+ Modeled)
     ========================================================================== */
  const FORMATION_DATABASE = {
    '4-2-3-1': {
      name: '4-2-3-1 (Double Pivot & Wide Overload)',
      space: 'Strong central occupation with two defensive pivots protecting Zone 14 while allowing attacking midfielder to exploit space between opposition lines.',
      attack: 'Wide wingers isolate opposition full-backs 1v1, supported by overlapping full-backs to generate 2v1 crossing overloads.',
      defense: 'Maintains a reliable 3+2 or 2+3 rest defense structure, mitigating central fast-break counter-attacks upon ball loss.',
      weakness: 'Flank exposure when full-backs push high without double-pivot wide coverage; requires disciplined pressing triggers.',
      players: [
        { label: 'GK', top: 50, left: 6, role: 'gk' },
        { label: 'LB', top: 82, left: 24, role: 'def' },
        { label: 'CB', top: 62, left: 20, role: 'def' },
        { label: 'CB', top: 38, left: 20, role: 'def' },
        { label: 'RB', top: 18, left: 24, role: 'def' },
        { label: 'DM', top: 60, left: 40, role: 'mid' },
        { label: 'DM', top: 40, left: 40, role: 'mid' },
        { label: 'AM', top: 50, left: 65, role: 'mid' },
        { label: 'LW', top: 80, left: 70, role: 'att' },
        { label: 'RW', top: 20, left: 70, role: 'att' },
        { label: 'ST', top: 50, left: 88, role: 'att' }
      ]
    },
    '4-3-3': {
      name: '4-3-3 (Single Pivot & High Flank Triangles)',
      space: 'High field tilt with dual #8 midfielders occupying left and right half-spaces, generating natural passing triangles across the pitch.',
      attack: 'Extreme front-three width pins opposition backline, creating vertical channels for interior half-space underlapping runs.',
      defense: 'Vulnerable in transitional rest defense if single #6 pivot gets overloaded before #8s recover into central block.',
      weakness: 'Space conceded behind high-pressing central midfielders if initial counter-press is bypassed.',
      players: [
        { label: 'GK', top: 50, left: 6, role: 'gk' },
        { label: 'LB', top: 84, left: 26, role: 'def' },
        { label: 'CB', top: 64, left: 20, role: 'def' },
        { label: 'CB', top: 36, left: 20, role: 'def' },
        { label: 'RB', top: 16, left: 26, role: 'def' },
        { label: 'DM', top: 50, left: 38, role: 'mid' },
        { label: 'CM', top: 68, left: 56, role: 'mid' },
        { label: 'CM', top: 32, left: 56, role: 'mid' },
        { label: 'LW', top: 85, left: 78, role: 'att' },
        { label: 'RW', top: 15, left: 78, role: 'att' },
        { label: 'ST', top: 50, left: 88, role: 'att' }
      ]
    },
    '4-4-2': {
      name: '4-4-2 (Compact Low/Mid Block & Direct Channels)',
      space: 'Maximum horizontal and vertical compactness. Two rigid banks of four restrict space between lines and force play wide.',
      attack: 'Twin strikers create 2v2 situations against center-backs; rapid wide delivery through traditional crossing avenues.',
      defense: 'Exceptional penalty box protection; central midfield pairing must cover immense ground to avoid half-space occupation.',
      weakness: 'Numerical inferiority against 3-man midfields (3v2 central overload) unless one striker drops deep to press.',
      players: [
        { label: 'GK', top: 50, left: 6, role: 'gk' },
        { label: 'LB', top: 82, left: 22, role: 'def' },
        { label: 'CB', top: 62, left: 18, role: 'def' },
        { label: 'CB', top: 38, left: 18, role: 'def' },
        { label: 'RB', top: 18, left: 22, role: 'def' },
        { label: 'LM', top: 82, left: 52, role: 'mid' },
        { label: 'CM', top: 60, left: 48, role: 'mid' },
        { label: 'CM', top: 40, left: 48, role: 'mid' },
        { label: 'RM', top: 18, left: 52, role: 'mid' },
        { label: 'ST', top: 62, left: 84, role: 'att' },
        { label: 'ST', top: 38, left: 84, role: 'att' }
      ]
    },
    '3-5-2': {
      name: '3-5-2 (Central Density & Dynamic Wing-Backs)',
      space: 'Overwhelming central density with 3 center-backs and 3 central midfielders controlling Zone 14 and second-ball recoveries.',
      attack: 'Wing-backs provide solo width while twin strikers form lethal interplay; central midfielders make third-man box runs.',
      defense: 'Easily morphs into a resilient 5-3-2 low block out of possession; high physical demands on wide wing-backs.',
      weakness: 'Vulnerable in wide defensive transitions if wing-backs are caught high upfield.',
      players: [
        { label: 'GK', top: 50, left: 6, role: 'gk' },
        { label: 'CB', top: 72, left: 20, role: 'def' },
        { label: 'CB', top: 50, left: 17, role: 'def' },
        { label: 'CB', top: 28, left: 20, role: 'def' },
        { label: 'LWB', top: 86, left: 46, role: 'mid' },
        { label: 'DM', top: 50, left: 38, role: 'mid' },
        { label: 'CM', top: 65, left: 58, role: 'mid' },
        { label: 'CM', top: 35, left: 58, role: 'mid' },
        { label: 'RWB', top: 14, left: 46, role: 'mid' },
        { label: 'ST', top: 62, left: 85, role: 'att' },
        { label: 'ST', top: 38, left: 85, role: 'att' }
      ]
    },
    '3-4-3': {
      name: '3-4-3 (Box Midfield & Aggressive Front Press)',
      space: 'Fluid possession structure; wing-backs step into midfield while dual inside forwards tuck into half-spaces to form a 3-2-4-1 in possession.',
      attack: 'Overloads final-third half-spaces with 5 attacking lanes (2 wing-backs + 2 inside forwards + 1 central striker).',
      defense: 'High counter-pressing efficiency; requires rapid lateral shifts from double pivot to protect wide spaces.',
      weakness: 'Requires center-backs with elite recovery pace to defend wide channels on fast breaks.',
      players: [
        { label: 'GK', top: 50, left: 6, role: 'gk' },
        { label: 'CB', top: 72, left: 20, role: 'def' },
        { label: 'CB', top: 50, left: 17, role: 'def' },
        { label: 'CB', top: 28, left: 20, role: 'def' },
        { label: 'LWB', top: 86, left: 48, role: 'mid' },
        { label: 'CM', top: 60, left: 44, role: 'mid' },
        { label: 'CM', top: 40, left: 44, role: 'mid' },
        { label: 'RWB', top: 14, left: 48, role: 'mid' },
        { label: 'LF', top: 68, left: 74, role: 'att' },
        { label: 'RF', top: 32, left: 74, role: 'att' },
        { label: 'ST', top: 50, left: 88, role: 'att' }
      ]
    },
    '4-6-0': {
      name: '4-6-0 (Strikerless Possession & Zone 14 Overload)',
      space: 'Total central midfield dominance. Strikerless system creates defensive ambiguity for opposition center-backs with no fixed target to mark.',
      attack: 'False nine drops deep into Zone 14, dragging defenders and allowing wingers and midfielders to make blindside penetrating runs.',
      defense: 'Extremely compact 6-man midfield web suffocates opposition build-up and forces long hopeful clearances.',
      weakness: 'Lack of fixed penalty box presence can reduce crossing threat against stubborn 5-man low blocks.',
      players: [
        { label: 'GK', top: 50, left: 6, role: 'gk' },
        { label: 'LB', top: 82, left: 24, role: 'def' },
        { label: 'CB', top: 62, left: 20, role: 'def' },
        { label: 'CB', top: 38, left: 20, role: 'def' },
        { label: 'RB', top: 18, left: 24, role: 'def' },
        { label: 'DM', top: 50, left: 38, role: 'mid' },
        { label: 'CM', top: 68, left: 54, role: 'mid' },
        { label: 'CM', top: 32, left: 54, role: 'mid' },
        { label: 'LW', top: 82, left: 74, role: 'att' },
        { label: 'F9', top: 50, left: 66, role: 'mid' },
        { label: 'RW', top: 18, left: 74, role: 'att' }
      ]
    }
  };

  /* ==========================================================================
     2. ACOUSTIC ENGINE (Web Audio SFX)
     ========================================================================== */
  class AcousticEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }

    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + i * 0.06 + 0.25);
      });
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  }

  const sfx = new AcousticEngine();

  /* ==========================================================================
     3. THREE.JS 3D STADIUM ATMOSPHERE VIEWPORT
     ========================================================================== */
  class FootballUniverseScene {
    constructor(container) {
      this.container = container;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.playerNodes = [];
      this.camIndex = 0;

      this.cameras = [
        { pos: { x: 12, y: 15, z: 26 }, look: { x: 0, y: 0, z: 0 } },
        { pos: { x: 0, y: 32, z: 2 }, look: { x: 0, y: 0, z: 0 } },
        { pos: { x: -16, y: 6, z: 14 }, look: { x: 0, y: 1, z: 0 } }
      ];

      this.init();
    }

    init() {
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x030611, 0.018);

      this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(this.cameras[0].pos.x, this.cameras[0].pos.y, this.cameras[0].pos.z);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      const floodlight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
      floodlight1.position.set(20, 35, 18);
      this.scene.add(floodlight1);

      const floodlight2 = new THREE.DirectionalLight(0x10b981, 1.0);
      floodlight2.position.set(-20, 35, -18);
      this.scene.add(floodlight2);

      // 3D Pitch Plane
      const pitchGeo = new THREE.PlaneGeometry(42, 28, 16, 16);
      const pitchMat = new THREE.MeshStandardMaterial({
        color: 0x0a4224,
        roughness: 0.85,
        metalness: 0.1
      });
      const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
      pitchMesh.rotation.x = -Math.PI / 2;
      this.scene.add(pitchMesh);

      // Boundary line
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
      const points = [
        new THREE.Vector3(-20, 0.05, -13),
        new THREE.Vector3(20, 0.05, -13),
        new THREE.Vector3(20, 0.05, 13),
        new THREE.Vector3(-20, 0.05, 13),
        new THREE.Vector3(-20, 0.05, -13)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      this.scene.add(new THREE.Line(lineGeo, lineMat));

      // Player spheres
      for (let i = 0; i < 11; i++) {
        const nodeGeo = new THREE.SphereGeometry(0.45, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: i === 7 ? 0x00f2fe : 0x10b981 });
        const mesh = new THREE.Mesh(nodeGeo, nodeMat);
        mesh.position.set((Math.random() - 0.5) * 30, 0.5, (Math.random() - 0.5) * 18);
        this.scene.add(mesh);
        this.playerNodes.push(mesh);
      }

      window.addEventListener('resize', () => {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      });

      this.animate();
    }

    switchCamera() {
      this.camIndex = (this.camIndex + 1) % this.cameras.length;
      const target = this.cameras[this.camIndex];

      if (typeof gsap !== 'undefined') {
        gsap.to(this.camera.position, {
          x: target.pos.x,
          y: target.pos.y,
          z: target.pos.z,
          duration: 1.2,
          ease: 'power2.inOut'
        });
      } else {
        this.camera.position.set(target.pos.x, target.pos.y, target.pos.z);
      }
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      const t = performance.now() * 0.001;

      this.playerNodes.forEach((node, i) => {
        node.position.y = 0.5 + Math.sin(t * 2 + i) * 0.08;
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  }

  /* ==========================================================================
     4. INTERACTIVE TACTICAL FORMATION BOARD LOGIC
     ========================================================================== */
  function initTacticalBoard() {
    const playersLayer = document.getElementById('players-dots-layer');
    const formationBtns = document.querySelectorAll('.btn-formation');
    const nameEl = document.getElementById('selected-formation-name');
    const spaceEl = document.getElementById('tactics-space-text');
    const attackEl = document.getElementById('tactics-attack-text');
    const defEl = document.getElementById('tactics-def-text');
    const weakEl = document.getElementById('tactics-weak-text');

    if (!playersLayer) return;

    // Render initial 11 player nodes
    function renderFormation(formationKey) {
      const data = FORMATION_DATABASE[formationKey] || FORMATION_DATABASE['4-2-3-1'];

      if (nameEl) nameEl.textContent = data.name;
      if (spaceEl) spaceEl.textContent = data.space;
      if (attackEl) attackEl.textContent = data.attack;
      if (defEl) defEl.textContent = data.defense;
      if (weakEl) weakEl.textContent = data.weakness;

      playersLayer.innerHTML = '';
      data.players.forEach((p, idx) => {
        const dot = document.createElement('div');
        dot.className = `player-dot-node ${p.role}`;
        dot.style.top = `${p.top}%`;
        dot.style.left = `${p.left}%`;
        dot.textContent = p.label;
        dot.title = `Player #${idx + 1} (${p.label})`;
        playersLayer.appendChild(dot);
      });
    }

    formationBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        formationBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        sfx.playTick();
        const formationKey = btn.getAttribute('data-formation');
        renderFormation(formationKey);
      });
    });

    // Initial render
    renderFormation('4-2-3-1');
  }

  /* ==========================================================================
     5. LOADER & CURSOR
     ========================================================================== */
  function initLoader() {
    const loader = document.getElementById('film-loader');
    const progressBar = document.getElementById('loader-progress-bar');
    const pctText = document.getElementById('loader-pct');
    const skipBtn = document.getElementById('btn-skip-intro');

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 12;
      if (progress > 100) progress = 100;

      if (progressBar) progressBar.style.width = `${progress}%`;
      if (pctText) pctText.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(dismiss, 350);
      }
    }, 50);

    function dismiss() {
      loader?.classList.add('hidden');
      sfx.playChime();
    }

    skipBtn?.addEventListener('click', () => {
      clearInterval(interval);
      dismiss();
    });
  }

  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (!dot || !ring) return;

    window.addEventListener('mousemove', (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
    });
  }

  /* ==========================================================================
     6. POWERPOINT-STYLE PRESENTATION DECK ENGINE
     ========================================================================== */
  function initPresentationDeck() {
    const slides = Array.from(document.querySelectorAll('.section-stage'));
    if (!slides.length) return;

    let currentSlide = 0;
    let isTransitioning = false;
    const transitionCooldown = 550;

    const progressBar = document.getElementById('deck-progress-bar');
    const slideNumEl = document.getElementById('deck-slide-num');
    const slideTitleEl = document.getElementById('deck-slide-title');
    const prevBtn = document.getElementById('deck-prev-btn');
    const nextBtn = document.getElementById('deck-next-btn');
    const dockDots = Array.from(document.querySelectorAll('.dock-dot'));
    const navItems = Array.from(document.querySelectorAll('.pro-nav-item, .nav-link-btn, .nav-item'));
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('pro-nav-menu');

    // Mobile menu toggle
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        sfx.playTick();
      });
    }

    function updateDeckUI(index) {
      // 1. Top Progress Bar
      const pct = (index / (slides.length - 1)) * 100;
      if (progressBar) progressBar.style.width = `${Math.max(9, pct)}%`;

      // 2. HUD Numbers & Title
      const currentSection = slides[index];
      const title = currentSection?.getAttribute('data-title') || currentSection?.id || `Slide ${index + 1}`;
      if (slideNumEl) {
        slideNumEl.textContent = `SLIDE ${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      }
      if (slideTitleEl) {
        slideTitleEl.textContent = title;
      }

      // 3. Remote Prev / Next buttons
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === slides.length - 1;

      // 4. Side Dock Dots
      dockDots.forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === index);
      });

      // 5. Top Pro Navbar Active Tab
      const currentId = currentSection?.getAttribute('id');
      navItems.forEach((item) => {
        const href = item.getAttribute('href');
        item.classList.toggle('active', href === `#${currentId}`);
      });
    }

    function goToSlide(targetIndex, withSound = true) {
      if (targetIndex < 0 || targetIndex >= slides.length) return;
      if (targetIndex === currentSlide && slides[currentSlide].classList.contains('active-slide')) {
        updateDeckUI(currentSlide);
        return;
      }

      isTransitioning = true;

      slides.forEach((slide, idx) => {
        slide.classList.remove('active-slide', 'prev-slide', 'next-slide');
        if (idx === targetIndex) {
          slide.classList.add('active-slide');
          slide.scrollTop = 0;
        } else if (idx < targetIndex) {
          slide.classList.add('prev-slide');
        } else {
          slide.classList.add('next-slide');
        }
      });

      currentSlide = targetIndex;
      updateDeckUI(currentSlide);

      if (withSound) {
        sfx.playTick();
      }

      setTimeout(() => {
        isTransitioning = false;
      }, transitionCooldown);
    }

    // Previous / Next Buttons
    prevBtn?.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });

    nextBtn?.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });

    // Side Dock Dots
    dockDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(slideIdx)) {
          goToSlide(slideIdx);
        }
      });
    });

    // Navbar & All Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetIdx = slides.findIndex((s) => s.getAttribute('id') === targetId);
        if (targetIdx !== -1) {
          e.preventDefault();
          goToSlide(targetIdx);
          if (mobileMenu?.classList.contains('open')) {
            mobileMenu.classList.remove('open');
          }
        }
      });
    });

    // Keyboard Navigation (PowerPoint style)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (['ArrowDown', 'ArrowRight', 'PageDown', 'Space'].includes(e.code) || e.key === 'n' || e.key === 'N') {
        if (currentSlide < slides.length - 1) {
          e.preventDefault();
          goToSlide(currentSlide + 1);
        }
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.code) || e.key === 'p' || e.key === 'P') {
        if (currentSlide > 0) {
          e.preventDefault();
          goToSlide(currentSlide - 1);
        }
      } else if (e.code === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        goToSlide(slides.length - 1);
      }
    });

    // Wheel / Trackpad Discrete Slide Flipping
    let wheelTimeout;
    window.addEventListener('wheel', (e) => {
      if (isTransitioning) return;

      const activeSlideEl = slides[currentSlide];
      const isScrollable = activeSlideEl.scrollHeight > activeSlideEl.clientHeight;

      if (isScrollable) {
        const atBottom = activeSlideEl.scrollTop + activeSlideEl.clientHeight >= activeSlideEl.scrollHeight - 12;
        const atTop = activeSlideEl.scrollTop <= 12;

        if (e.deltaY > 20 && !atBottom) return;
        if (e.deltaY < -20 && !atTop) return;
      }

      if (Math.abs(e.deltaY) > 25) {
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          if (e.deltaY > 0) {
            goToSlide(currentSlide + 1);
          } else {
            goToSlide(currentSlide - 1);
          }
        }, 30);
      }
    }, { passive: true });

    // Touch Swipe Navigation for Mobile/Tablet
    let touchStartY = 0;
    let touchStartX = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (isTransitioning) return;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;

      if (Math.abs(deltaY) > 45 || Math.abs(deltaX) > 45) {
        if (deltaY > 45 || deltaX > 45) {
          goToSlide(currentSlide + 1);
        } else if (deltaY < -45 || deltaX < -45) {
          goToSlide(currentSlide - 1);
        }
      }
    }, { passive: true });

    // Initialize slide 0
    goToSlide(0, false);
  }

  /* ==========================================================================
     7. RESUME MODAL HANDLERS
     ========================================================================== */
  function initModals() {
    const resumeModal = document.getElementById('resume-modal');
    const resumeBtns = [
      document.getElementById('btn-hero-resume'),
      document.getElementById('btn-nav-resume'),
      document.getElementById('btn-download-resume-bottom')
    ];
    const closeBtn = document.getElementById('close-resume-modal');

    function openModal() {
      resumeModal?.classList.add('active');
      sfx.playChime();
    }

    function closeModal() {
      resumeModal?.classList.remove('active');
      sfx.playTick();
    }

    resumeBtns.forEach((btn) => btn?.addEventListener('click', openModal));
    closeBtn?.addEventListener('click', closeModal);
    resumeModal?.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ==========================================================================
     8. UI CONTROLS & AUDIO FX
     ========================================================================== */
  function initControls() {
    const sfxBtn = document.getElementById('sfx-toggle-btn');
    const eqBars = document.querySelectorAll('.eq-bar');

    sfxBtn?.addEventListener('click', () => {
      const state = sfx.toggle();
      if (state) {
        sfx.playChime();
        eqBars.forEach((bar) => bar.style.animationPlayState = 'running');
      } else {
        eqBars.forEach((bar) => bar.style.animationPlayState = 'paused');
      }
    });
  }

  /* ==========================================================================
     9. BOOTSTRAP APPLICATION
     ========================================================================== */
  function boot() {
    initLoader();
    initCursor();
    initPresentationDeck();
    initTacticalBoard();
    initModals();
    initControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
