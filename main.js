(() => {
  'use strict';

  const root = document.documentElement;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = prefersReduced.matches;

  /* ---------------------------------------------------------------
     Single cached scroll value, read once per animation frame.
     Never read layout inside the scroll event itself.
  --------------------------------------------------------------- */
  let lastScrollY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    ticking = true;
  }, { passive: true });

  let wavePhase = 0;
  const waveEls = Array.from(document.querySelectorAll('.sway'));

  const parallaxEls = Array.from(document.querySelectorAll('.parallax-layer')).map(el => ({
    el,
    rate: parseFloat(el.dataset.rate || '0.5')
  }));

  const progressRail = document.querySelector('.progress-rail');
  const docHeight = () => Math.max(document.body.scrollHeight - window.innerHeight, 1);

  /* ---- Scene 4: the rise, pinned ~150vh, scrubbed by scroll progress ---- */
  const riseSection = document.getElementById('scene-rise');
  const gopuramGroup = document.getElementById('gopuram-group');
  const tiers = Array.from(document.querySelectorAll('.gopuram-tier'));
  const kalasams = Array.from(document.querySelectorAll('.kalasam'));
  const bloom = document.getElementById('bloom');
  const petals = Array.from(document.querySelectorAll('.petal'));
  let riseCompleted = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function updateRise() {
    if (reducedMotion) return;
    const rect = riseSection.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return;
    let progress = (-rect.top) / total;
    progress = Math.min(Math.max(progress, 0), 1);
    const eased = easeOutCubic(progress);

    const startY = window.innerHeight * 0.46;
    gopuramGroup.style.transform = `translateY(${startY * (1 - eased)}px)`;

    tiers.forEach((tier, i) => {
      const threshold = i / (tiers.length + 2);
      const localT = Math.min(Math.max((progress - threshold) * 4, 0), 1);
      tier.style.opacity = localT;
      tier.style.transform = `scale(${0.85 + 0.15 * localT})`;
    });

    if (progress > 0.92 && !riseCompleted) {
      riseCompleted = true;
      kalasams.forEach((k, i) => {
        setTimeout(() => { k.style.opacity = '1'; k.style.transform = 'scale(1)'; }, i * 90);
      });
      if (bloom) {
        bloom.style.transition = 'opacity 0.6s ease-out, transform 1.2s ease-out';
        bloom.style.opacity = '0.9';
        bloom.style.transform = 'scale(2.4)';
        setTimeout(() => { bloom.style.opacity = '0'; }, 900);
      }
      petals.forEach((p, i) => {
        setTimeout(() => {
          p.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
          p.style.opacity = '1';
          p.style.transform = 'translateY(18px) scale(1.4)';
          setTimeout(() => { p.style.opacity = '0'; }, 1000);
        }, 120 + i * 60);
      });
      playChime();
    } else if (progress <= 0.92 && riseCompleted) {
      riseCompleted = false;
      kalasams.forEach(k => { k.style.opacity = '0'; k.style.transform = 'scale(0.6)'; });
    }
  }

  /* ---- Kolam draw-on, scrubbed while scene 2 is in view ---- */
  const kolamScene = document.getElementById('scene-kolam');
  const kolamDots = document.querySelectorAll('#kolam-dots circle');
  const kolamLoop = document.getElementById('kolam-loop');
  const invitationLine = document.getElementById('invitation-line');

  function updateKolam() {
    if (!kolamScene) return;
    const rect = kolamScene.getBoundingClientRect();
    const vh = window.innerHeight;
    let progress = 1 - (rect.top / vh);
    progress = Math.min(Math.max(progress, 0), 1);

    if (progress > 0.15) {
      kolamDots.forEach((d, i) => {
        const t = Math.min(Math.max((progress - 0.15) * 6 - i * 0.15, 0), 1);
        d.style.opacity = t;
      });
    }
    if (progress > 0.35 && kolamLoop) {
      const t = Math.min(Math.max((progress - 0.35) * 1.8, 0), 1);
      kolamLoop.style.strokeDashoffset = String(900 * (1 - t));
    }
    if (progress > 0.7 && invitationLine) {
      invitationLine.classList.add('is-visible');
    }
  }

  function frame() {
    if (ticking) {
      wavePhase += 0.02;
      waveEls.forEach((el, i) => {
        if (!reducedMotion) {
          const amp = 4;
          const deg = Math.sin(wavePhase + i * 0.35) * amp;
          el.style.transform = `rotate(${deg}deg)`;
        }
      });

      if (!reducedMotion) {
        parallaxEls.forEach(({ el, rate }) => {
          const offset = lastScrollY * rate * 0.08;
          el.style.transform = `translateY(${-offset}px)`;
        });
      }

      const railProgress = Math.min(lastScrollY / docHeight(), 1);
      if (progressRail) {
        progressRail.style.setProperty('--rail-fill', (railProgress * 100) + '%');
      }

      updateRise();
      updateKolam();
      ticking = false;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------------------------------------------------------------
     IntersectionObserver reveals — staggered children get a CSS
     custom property index so transition-delay fans out.
  --------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('.reveal, .vignette, .event-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.3 });
  revealTargets.forEach(t => io.observe(t));

  /* ---------------------------------------------------------------
     Mute / unmute — audio always starts muted per brief.
     Repo ships with no audio file by default; drop one at
     assets/temple-bells.mp3 to enable it (see README).
  --------------------------------------------------------------- */
  const audio = document.getElementById('bg-audio');
  const muteBtn = document.getElementById('mute-toggle');
  const muteLabel = document.getElementById('mute-label');
  let muted = true;
  audio.muted = true;
  audio.src = 'assets/temple-bells.mp3';

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    audio.muted = muted;
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteLabel.textContent = muted ? 'Sound off' : 'Sound on';
    if (!muted) {
      audio.play().catch(() => { /* file may not exist yet — fails silently */ });
    }
  });

  function playChime() {
    if (!muted && audio.readyState > 0) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  /* ---- Reduced-motion toggle (manual override, in addition to OS setting) ---- */
  const motionBtn = document.getElementById('motion-toggle');
  function applyReducedMotion(state) {
    reducedMotion = state;
    document.body.classList.toggle('reduced-motion', state);
    motionBtn.setAttribute('aria-pressed', String(state));
  }
  applyReducedMotion(reducedMotion);
  motionBtn.addEventListener('click', () => applyReducedMotion(!reducedMotion));
  prefersReduced.addEventListener('change', (e) => applyReducedMotion(e.matches));

  /* ---- Add to calendar (.ics) for the Muhurtam ---- */
  const calendarBtn = document.getElementById('add-calendar');
  calendarBtn.addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Letsgetmarried-C-P//Wedding Invite//EN',
      'BEGIN:VEVENT',
      'UID:muhurtam-priyadarshini-chirag@letsgetmarried-cp',
      'DTSTAMP:20260101T000000Z',
      'DTSTART:20261204T023000Z',
      'DTEND:20261204T053000Z',
      'SUMMARY:Muhurtam — Priyadarshini & Chirag',
      'DESCRIPTION:Wedding Muhurtam at Arulmigu Subramanyaswamy Thirukovil\\, Thiruttani.',
      'LOCATION:No.8 Tiruthani\\, opp. Murugan Kovil Uzhavarsandhai Road\\, Thiruttani Hill\\, Thiruttani\\, Tamil Nadu 631209',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muhurtam-priyadarshini-chirag.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

})();
