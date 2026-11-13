import Lenis from 'lenis';

(function() {
  'use strict';

  /* ------------------------------------------------------------------
     1. ACCESSIBILITY & MOTION PREFERENCES CHECK
     ------------------------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchOrMobile = window.matchMedia('(max-width: 768px), (hover: none)').matches;
  const allow3DParallax = !isTouchOrMobile && !prefersReducedMotion;

  /* ------------------------------------------------------------------
     2. LENIS SMOOTH SCROLL INITIALIZATION
     ------------------------------------------------------------------ */
  const lenis = new Lenis({
    smoothWheel: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0.01 : 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  window.lenis = lenis;

  // Lock scroll while preloader is active
  lenis.stop();
  window.scrollTo(0, 0);

  // Smooth scroll on anchor link clicks (Navbar & Quick Rail & Hero CTAs)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl, { offset: 0, duration: prefersReducedMotion ? 0.01 : 1.25 });
        closeMobileMenu();
      }
    });
  });

  /* ------------------------------------------------------------------
     3. TOP SCROLL PROGRESS BAR & MULTI-LAYER SCROLL PARALLAX
     ------------------------------------------------------------------ */
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const railLinks = document.querySelectorAll('.page-rail-link');
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-item-link');
  let currentScrollVelocity = 0;

  lenis.on('scroll', (e) => {
    // 1. Update Top Scroll Progress Bar
    if (scrollProgressBar) {
      const progress = e.progress || (e.scroll / (document.documentElement.scrollHeight - window.innerHeight));
      scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    }

    currentScrollVelocity = e.velocity || 0;

    // 2. Active Section Detection
    let currentSection = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 250 && rect.bottom >= 250) {
        currentSection = sec.getAttribute('id');
      }
    });

    // Desktop Nav Active State
    navLinks.forEach(link => {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('is-active');
      }
    });

    // Page Quick Rail Active State
    railLinks.forEach(link => {
      link.classList.remove('is-active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('is-active');
      }
    });
  });

  /* ------------------------------------------------------------------
     4. CUSTOM CURSOR & CLICK DYNAMICS
     ------------------------------------------------------------------ */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let followerX = mouseX, followerY = mouseY;

  if (!isTouchOrMobile) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursor) {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    });

    window.addEventListener('mousedown', () => document.body.classList.add('is-clicking'));
    window.addEventListener('mouseup', () => document.body.classList.remove('is-clicking'));

    document.querySelectorAll('a, button, [role="tab"], .project-card, .focus-card, .skill-card, .pitch-layer-btn, .pitch-interactive-node').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
    });
  }

  /* ------------------------------------------------------------------
     5. AMBIENT DATA PARTICLES & CANVAS SETUP
     ------------------------------------------------------------------ */
  const ambientCanvas = document.getElementById('ambient-grid-canvas');
  const ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d') : null;
  const particles = [];

  function resizeAmbient() {
    if (!ambientCanvas) return;
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  }
  resizeAmbient();
  window.addEventListener('resize', resizeAmbient);

  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.35 + 0.12
    });
  }

  function drawAmbientParticles() {
    if (!ambientCtx || prefersReducedMotion) return;
    const w = ambientCanvas.width;
    const h = ambientCanvas.height;
    ambientCtx.clearRect(0, 0, w, h);

    // Subtle drift with scroll velocity
    const scrollDrift = currentScrollVelocity * 0.08;

    ambientCtx.fillStyle = 'rgba(255, 59, 29, 0.65)';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy - scrollDrift;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ambientCtx.globalAlpha = p.alpha;
      ambientCtx.beginPath();
      ambientCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ambientCtx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 125) {
          ambientCtx.strokeStyle = `rgba(243, 241, 234, ${0.08 * (1 - dist / 125)})`;
          ambientCtx.lineWidth = 1;
          ambientCtx.beginPath();
          ambientCtx.moveTo(p.x, p.y);
          ambientCtx.lineTo(p2.x, p2.y);
          ambientCtx.stroke();
        }
      }
    }
    ambientCtx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------
     6. HERO 3D PARALLAX (MOUSE COORDINATE INTERPOLATION)
     ------------------------------------------------------------------ */
  const heroImg = document.getElementById('hero-portrait-img');
  const heroGiantName = document.getElementById('hero-giant-name');
  let targetHeroX = 0, targetHeroY = 0;
  let curHeroX = 0, curHeroY = 0;

  if (allow3DParallax) {
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetHeroX = ((e.clientX - cx) / cx) * 14;
      targetHeroY = ((e.clientY - cy) / cy) * -7;
    });
  }

  function updateHero3D() {
    if (!allow3DParallax) return;
    curHeroX += (targetHeroX - curHeroX) * 0.06;
    curHeroY += (targetHeroY - curHeroY) * 0.06;

    if (heroImg) {
      heroImg.style.transform = `translate3d(${curHeroX}px, ${-curHeroY}px, 20px) rotateY(${curHeroX * 0.45}deg) rotateX(${curHeroY * 0.45}deg)`;
    }
    if (heroGiantName) {
      heroGiantName.style.transform = `translate3d(${-curHeroX * 0.28}px, ${curHeroY * 0.2}px, 0px)`;
    }
  }

  /* ------------------------------------------------------------------
     7. 3D CARD TILT WITH EASE-BACK & SPECULAR SPOTLIGHT
     ------------------------------------------------------------------ */
  const tiltCards = document.querySelectorAll(
    '.project-card, .focus-card, .roadmap-content, .analysis-card, .skill-card, .match-metric-card, .impact-cell'
  );
  const cardTiltStates = [];

  // 1. Mouse specular light tracker
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 2. 3D card tilt for primary cards
  const primaryTiltCards = document.querySelectorAll('.project-card, .focus-card, .roadmap-content, .analysis-card');
  if (!isTouchOrMobile && !prefersReducedMotion) {
    primaryTiltCards.forEach(card => {
      const state = {
        el: card,
        targetX: 0,
        targetY: 0,
        curX: 0,
        curY: 0,
        isHovered: false
      };
      cardTiltStates.push(state);

      card.addEventListener('mouseenter', () => {
        state.isHovered = true;
      });
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        state.targetX = ((e.clientY - cy) / (rect.height / 2)) * -5.5;
        state.targetY = ((e.clientX - cx) / (rect.width / 2)) * 5.5;
      });
      card.addEventListener('mouseleave', () => {
        state.isHovered = false;
        state.targetX = 0;
        state.targetY = 0;
      });
    });
  }

  function updateCardTilts() {
    if (prefersReducedMotion || isTouchOrMobile) return;
    for (let i = 0; i < cardTiltStates.length; i++) {
      const s = cardTiltStates[i];
      const dx = s.targetX - s.curX;
      const dy = s.targetY - s.curY;
      if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005) {
        s.curX += dx * 0.12;
        s.curY += dy * 0.12;
        const scale = s.isHovered ? 1.018 : 1.0;
        s.el.style.transform = `perspective(900px) rotateX(${s.curX.toFixed(2)}deg) rotateY(${s.curY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
      } else if (!s.isHovered && (s.curX !== 0 || s.curY !== 0)) {
        s.curX = 0;
        s.curY = 0;
        s.el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      }
    }
  }

  /* ------------------------------------------------------------------
     8. MAGNETIC BUTTONS & RIPPLE WAVES
     ------------------------------------------------------------------ */
  const magneticEls = document.querySelectorAll('.btn-primary, .btn-secondary, .site-logo, .pitch-layer-btn');
  if (!isTouchOrMobile && !prefersReducedMotion) {
    magneticEls.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate3d(${x * 0.28}px, ${y * 0.28}px, 0) scale(1.02)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // Micro ripple wave on button click
  document.querySelectorAll('.btn-primary, .btn-secondary, .pitch-layer-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('btn-ripple-wave');
      const ripple = this.getElementsByClassName('btn-ripple-wave')[0];
      if (ripple) ripple.remove();
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  /* ------------------------------------------------------------------
     9. MASTER REQUESTANIMATIONFRAME LOOP
     ------------------------------------------------------------------ */
  function masterLoop(time) {
    // 1. Lenis smooth scroll
    lenis.raf(time);

    // 2. Custom cursor follower smoothing
    if (!isTouchOrMobile && follower) {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    }

    // 3. Ambient particles animation
    drawAmbientParticles();

    // 4. Hero 3D parallax
    updateHero3D();

    // 5. Card tilt easing
    updateCardTilts();

    requestAnimationFrame(masterLoop);
  }
  requestAnimationFrame(masterLoop);

  /* ------------------------------------------------------------------
     10. HERO TEXT LETTER SPLITTING
     ------------------------------------------------------------------ */
  function splitTextToLetters(element, baseDelay = 0, letterStagger = 45) {
    if (!element) return;
    const text = element.textContent.trim();
    element.innerHTML = '';
    const letters = text.split('');
    letters.forEach((letter, i) => {
      const slot = document.createElement('span');
      slot.className = 'reveal-letter-slot';
      const span = document.createElement('span');
      span.className = 'reveal-letter';
      span.textContent = letter === ' ' ? '\u00A0' : letter;
      span.style.transitionDelay = `${baseDelay + i * letterStagger}ms`;
      slot.appendChild(span);
      element.appendChild(slot);
    });
  }

  const nameLine1 = document.getElementById('hero-name-line-1');
  const nameLine2 = document.getElementById('hero-name-line-2');
  const nameLine3 = document.getElementById('hero-name-line-3');
  if (nameLine1) splitTextToLetters(nameLine1, 0, 45);
  if (nameLine2) splitTextToLetters(nameLine2, 160, 45);
  if (nameLine3) splitTextToLetters(nameLine3, 320, 45);

  /* ------------------------------------------------------------------
     11. SMOOTH CINEMATIC PRELOADER WITH SPLIT CURTAIN REVEAL
     ------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  const preloaderNum = document.getElementById('preloader-num');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderStatus = document.getElementById('preloader-status');

  function runPreloader() {
    if (prefersReducedMotion) {
      if (preloader) preloader.style.display = 'none';
      document.body.classList.add('hero-active');
      lenis.start();
      return;
    }

    const statusPhases = [
      { t: 0, text: 'CALIBRATING TACTICAL DATA ARCHITECTURE...' },
      { t: 24, text: 'PARSING ISL HISTORICAL MATCHES (~1,100 FIXTURES)...' },
      { t: 50, text: 'SYNCHRONIZING 37 FEATURE VECTORS & SPATIAL VORONOI...' },
      { t: 76, text: 'INITIALIZING 8 PRODUCTION REPOSITORIES...' },
      { t: 96, text: 'SYSTEM ARMED & CALIBRATED • READY' }
    ];

    const start = performance.now();
    const duration = 1850;

    function tick(now) {
      const elapsed = now - start;
      const linearProgress = Math.min(1, elapsed / duration);
      // Silky smooth easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - linearProgress, 3);
      const count = Math.round(easeProgress * 100);

      if (preloaderNum) preloaderNum.textContent = count;
      if (preloaderBar) preloaderBar.style.width = `${count}%`;

      if (preloaderStatus) {
        for (let i = statusPhases.length - 1; i >= 0; i--) {
          if (count >= statusPhases[i].t) {
            preloaderStatus.textContent = statusPhases[i].text;
            break;
          }
        }
      }

      if (linearProgress < 1) {
        requestAnimationFrame(tick);
      } else {
        if (preloader) preloader.classList.add('is-fading');
        setTimeout(() => {
          if (preloader) preloader.classList.add('is-wiped');
          setTimeout(() => {
            document.body.classList.add('hero-active');
            lenis.start();
            if (preloader) {
              preloader.setAttribute('aria-hidden', 'true');
              preloader.style.pointerEvents = 'none';
            }
          }, 600);
        }, 220);
      }
    }
    requestAnimationFrame(tick);
  }
  runPreloader();

  /* ------------------------------------------------------------------
     12. SVG LIQUID SHADER (HERO IMAGE)
     ------------------------------------------------------------------ */
  const heroPortrait = document.getElementById('hero-portrait-figure');
  if (heroPortrait && !isTouchOrMobile && !prefersReducedMotion) {
    const turb = document.getElementById('turb-hero');
    const disp = document.getElementById('disp-hero');
    if (turb && disp) {
      let currentScale = 1;
      let targetScale = 1;
      let currentFreq = 0.009;
      let targetFreq = 0.009;
      let animFrame = null;

      function updateSpring() {
        currentScale += (targetScale - currentScale) * 0.12;
        currentFreq += (targetFreq - currentFreq) * 0.12;

        disp.setAttribute('scale', currentScale.toFixed(2));
        turb.setAttribute('baseFrequency', currentFreq.toFixed(4));

        if (Math.abs(targetScale - currentScale) > 0.05 || Math.abs(targetFreq - currentFreq) > 0.0005) {
          animFrame = requestAnimationFrame(updateSpring);
        }
      }

      heroPortrait.addEventListener('mouseenter', () => {
        targetScale = 22;
        targetFreq = 0.02;
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(updateSpring);
      });

      heroPortrait.addEventListener('mouseleave', () => {
        targetScale = 1;
        targetFreq = 0.009;
        cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(updateSpring);
      });
    }
  }

  /* ------------------------------------------------------------------
     13. FOOTBALL ANALYSIS PITCH LAYER SWITCHER & INTERACTIVE TOOLTIP
     ------------------------------------------------------------------ */
  const pitchBtns = document.querySelectorAll('.pitch-layer-btn');
  const pitchGroups = {
    xg: document.getElementById('layer-xg'),
    passing: document.getElementById('layer-passing'),
    defensive: document.getElementById('layer-defensive'),
    space: document.getElementById('layer-space')
  };

  const pitchContent = {
    xg: {
      tag: "Layer 01 — Attacking xG",
      title: "Shot Locations & Quality",
      desc: "Mapping shot coordinates, angles, goalkeeper positioning, and pressure variables to quantify Expected Goals (xG). Distinguishing high-probability central chances from low-conversion perimeter efforts.",
      s1: ["2.41", "Total Team xG"],
      s2: ["0.17", "Avg xG Per Shot"],
      s3: ["82.4%", "Pass Progression"],
      s4: ["63%", "Final Third Entries"]
    },
    passing: {
      tag: "Layer 02 — Passing Network",
      title: "Progression & Node Centrality",
      desc: "Connecting player nodes with directional passing volume. Identifies primary playmakers, progressive passing corridors through half-spaces, and build-up circulation speed.",
      s1: ["512", "Completed Passes"],
      s2: ["88.6%", "Pass Accuracy"],
      s3: ["64", "Progressive Passes"],
      s4: ["4.2s", "Avg Possession Directness"]
    },
    defensive: {
      tag: "Layer 03 — Defensive & Pressing",
      title: "Defensive Duels & Pressing Triggers",
      desc: "Visualizing duel recovery zones, interceptions, and defensive line compactness. Distinguishing counter-pressing triggers in the mid-block from deep defensive clearances.",
      s1: ["46", "Total Tackles & Ints"],
      s2: ["68.2%", "Ground Duel Win Rate"],
      s3: ["71.4%", "Aerial Duel Win Rate"],
      s4: ["12.4", "PPDA Pressing Intensity"]
    },
    space: {
      tag: "Layer 04 — Spatial Control",
      title: "Voronoi Spatial Pitch Subdivisions",
      desc: "Spatial control polygons mapping dominant territory based on player velocities, reaction times, and positional topology. Quantifies space creation and defensive compactness.",
      s1: ["64%", "Attacking Half Control"],
      s2: ["72%", "Central Box Domination"],
      s3: ["34.2m", "Team Width Spread"],
      s4: ["28.5m", "Team Vertical Compactness"]
    }
  };

  const tagEl = document.getElementById('pitch-active-layer-tag');
  const titleEl = document.getElementById('pitch-active-layer-title');
  const descEl = document.getElementById('pitch-active-layer-desc');
  const val1 = document.getElementById('stat-val-1'), lbl1 = document.getElementById('stat-lbl-1');
  const val2 = document.getElementById('stat-val-2'), lbl2 = document.getElementById('stat-lbl-2');
  const val3 = document.getElementById('stat-val-3'), lbl3 = document.getElementById('stat-lbl-3');
  const val4 = document.getElementById('stat-val-4'), lbl4 = document.getElementById('stat-lbl-4');

  pitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pitchBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const layerKey = btn.getAttribute('data-pitch-layer');

      Object.keys(pitchGroups).forEach(k => {
        if (pitchGroups[k]) {
          pitchGroups[k].style.display = (k === layerKey) ? 'inline' : 'none';
        }
      });

      const data = pitchContent[layerKey];
      if (data) {
        if (tagEl) tagEl.textContent = data.tag;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        if (val1) { val1.textContent = data.s1[0]; animateCounter(val1); }
        if (lbl1) lbl1.textContent = data.s1[1];
        if (val2) { val2.textContent = data.s2[0]; animateCounter(val2); }
        if (lbl2) lbl2.textContent = data.s2[1];
        if (val3) { val3.textContent = data.s3[0]; animateCounter(val3); }
        if (lbl3) lbl3.textContent = data.s3[1];
        if (val4) { val4.textContent = data.s4[0]; animateCounter(val4); }
        if (lbl4) lbl4.textContent = data.s4[1];
      }
    });
  });

  // Pitch Interactive Telemetry Tooltip
  const pitchTooltip = document.getElementById('pitch-tooltip');
  const pitchSvgFrame = document.getElementById('pitch-svg-frame');
  const pitchNodes = document.querySelectorAll('.pitch-interactive-node');

  if (pitchTooltip && pitchSvgFrame) {
    pitchNodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        const tipText = node.getAttribute('data-tooltip');
        if (tipText) {
          pitchTooltip.innerHTML = tipText;
          pitchTooltip.classList.add('is-active');
        }
      });
      node.addEventListener('mousemove', (e) => {
        const rect = pitchSvgFrame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        pitchTooltip.style.left = `${x}px`;
        pitchTooltip.style.top = `${y}px`;
      });
      node.addEventListener('mouseleave', () => {
        pitchTooltip.classList.remove('is-active');
      });
    });
  }

  /* ------------------------------------------------------------------
     14. STAT NUMBER COUNTER MICRO-INTERACTION ENGINE
     ------------------------------------------------------------------ */
  function animateCounter(el) {
    if (!el || el.dataset.animated === 'true') return;
    const rawText = el.textContent.trim();
    const match = rawText.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
    if (!match) return;

    const prefix = match[1] || '';
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetVal = parseFloat(numStr);
    if (isNaN(targetVal)) return;

    const hasDecimals = numStr.includes('.');
    const decimals = hasDecimals ? numStr.split('.')[1].length : 0;
    const isThousands = match[2].includes(',');

    const startVal = 0;
    const duration = 1100;
    const startTime = performance.now();
    el.dataset.animated = 'true';
    el.classList.add('counter-spinning');

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (targetVal - startVal) * ease;

      let formatted = hasDecimals ? current.toFixed(decimals) : Math.round(current).toString();
      if (isThousands) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
      }
      el.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = rawText;
        el.classList.remove('counter-spinning');
      }
    }
    requestAnimationFrame(step);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.impact-figure, .pitch-metric-val, .m-val').forEach(el => {
    statObserver.observe(el);
  });

  /* ------------------------------------------------------------------
     15. COPY EMAIL INTERACTION
     ------------------------------------------------------------------ */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-text');
  if (copyEmailBtn && copyText) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('jereinsamthomas@gmail.com').then(() => {
        copyText.textContent = "Email Copied to Clipboard ✓";
        copyEmailBtn.style.borderColor = "var(--accent-green)";
        copyEmailBtn.style.color = "var(--accent-green)";
        setTimeout(() => {
          copyText.textContent = "Copy Email Address";
          copyEmailBtn.style.borderColor = "";
          copyEmailBtn.style.color = "";
        }, 3000);
      }).catch(() => {
        copyText.textContent = "jereinsamthomas@gmail.com";
      });
    });
  }

  /* ------------------------------------------------------------------
     16. INTERSECTION OBSERVER FOR IN-VIEW REVEALS
     ------------------------------------------------------------------ */
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    sectionObserver.observe(el);
  });

  /* ------------------------------------------------------------------
     17. MOBILE MENU DRAWER
     ------------------------------------------------------------------ */
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMobileMenu() {
    if (!burgerBtn || !mobileMenu) return;
    const isOpen = burgerBtn.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-active', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    if (isOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }

  function closeMobileMenu() {
    if (burgerBtn && mobileMenu && burgerBtn.classList.contains('is-open')) {
      burgerBtn.classList.remove('is-open');
      mobileMenu.classList.remove('is-active');
      mobileMenu.setAttribute('aria-hidden', 'true');
      lenis.start();
    }
  }

  if (burgerBtn) burgerBtn.addEventListener('click', toggleMobileMenu);

})();
