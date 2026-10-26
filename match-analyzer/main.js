/**
 * Jerein Sam Thomas — Football Analytics Editorial Portfolio
 * Main Interaction, Scroll Transformations, and Deterministic Recorder
 */

(function () {
  'use strict';

  // DOM Elements
  const heroStage = document.getElementById('heroStage');
  const siteHeader = document.getElementById('siteHeader');
  const editorialStatement = document.getElementById('editorialStatement');
  const analystProfile = document.getElementById('analystProfile');

  // Modal Elements
  const menuToggle = document.getElementById('menuToggle');
  const editorialNavModal = document.getElementById('editorialNavModal');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalLinks = document.querySelectorAll('.modal-link, .modal-studies-list a');

  // URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isRecorderMode = urlParams.get('rec') === '1';

  /* ==========================================================================
     1. SCROLL TRANSFORMATIONS & HEADER CONTRAST
     ========================================================================== */
  function applyScrollEffects(scrollY) {
    const vh = window.innerHeight;

    // Update Nav Bar theme when over paper section (past 60% of viewport)
    if (siteHeader) {
      if (scrollY > vh * 0.6) {
        siteHeader.classList.add('scrolled-paper');
      } else {
        siteHeader.classList.remove('scrolled-paper');
      }
    }
  }

  // Normal Scroll Event Listener
  let ticking = false;
  function onScroll() {
    if (isRecorderMode) return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        applyScrollEffects(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  /* ==========================================================================
     2. NAVIGATION MODAL INTERACTIONS
     ========================================================================== */
  function openModal() {
    editorialNavModal.classList.add('is-open');
    editorialNavModal.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    editorialNavModal.classList.remove('is-open');
    editorialNavModal.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && editorialNavModal) {
    menuToggle.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && editorialNavModal.classList.contains('is-open')) {
        closeModal();
      }
    });

    modalLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeModal();
      });
    });
  }

  /* ==========================================================================
     3. RECORDER MODE (?rec=1)
     Deterministic 6.5s Web Animation translation sequence:
     - 0 -> 1.95s: Hold hero
     - 1.95s -> 3.35s: Glide to Analysis section
     - 3.35s -> 4.25s: Hold Analysis section
     - 4.25s -> 5.55s: Glide to Analyst Profile
     - 5.55s -> 6.5s: Hold final view
     ========================================================================== */
  function initRecorderMode() {
    console.log('[Recorder Mode] Active. Initializing deterministic sequence...');
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const pageWrapper = document.getElementById('pageWrapper');
    if (!pageWrapper) return;

    const statementTop = editorialStatement ? editorialStatement.offsetTop - 40 : window.innerHeight;
    const profileTop = analystProfile ? analystProfile.offsetTop - 40 : window.innerHeight * 2;

    const startTime = performance.now();
    const duration = 6500; // 6.5s total

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function recordFrame(now) {
      const elapsed = (now - startTime) / 1000;
      let simulatedScrollY = 0;

      if (elapsed <= 1.95) {
        simulatedScrollY = 0;
      } else if (elapsed > 1.95 && elapsed <= 3.35) {
        const progress = easeInOutCubic((elapsed - 1.95) / (3.35 - 1.95));
        simulatedScrollY = progress * statementTop;
      } else if (elapsed > 3.35 && elapsed <= 4.25) {
        simulatedScrollY = statementTop;
      } else if (elapsed > 4.25 && elapsed <= 5.55) {
        const progress = easeInOutCubic((elapsed - 4.25) / (5.55 - 4.25));
        simulatedScrollY = statementTop + progress * (profileTop - statementTop);
      } else {
        simulatedScrollY = profileTop;
      }

      pageWrapper.style.transform = `translateY(-${simulatedScrollY}px)`;
      applyScrollEffects(simulatedScrollY);

      if (elapsed * 1000 < duration) {
        requestAnimationFrame(recordFrame);
      }
    }

    requestAnimationFrame(recordFrame);
  }

  /* ==========================================================================
     4. INITIALIZATION
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    if (isRecorderMode) {
      initRecorderMode();
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      applyScrollEffects(window.scrollY);
    }
  });

})();
