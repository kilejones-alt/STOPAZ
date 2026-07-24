(function () {
  const intro = document.getElementById('intro');
  const enterSite = document.getElementById('enterSite');
  const skipIntro = document.getElementById('skipIntro');
  const replayIntro = document.getElementById('replayIntro');
  const main = document.getElementById('main');
  const menuButton = document.getElementById('menuButton');
  const siteNav = document.getElementById('siteNav');
  const liquidBlobs = Array.from(document.querySelectorAll('.liquid-blob'));
  const siteMusic = document.getElementById('siteMusic');
  const musicToggle = document.getElementById('musicToggle');


  let musicStarted = false;

  function setMusicState(isPlaying) {
    if (!musicToggle) return;
    musicToggle.classList.toggle('playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.textContent = isPlaying ? 'Music On' : 'Music';
  }

  async function startMusic() {
    if (!siteMusic || musicStarted) return;
    try {
      siteMusic.volume = 0.38;
      await siteMusic.play();
      musicStarted = true;
      setMusicState(true);
    } catch (error) {
      setMusicState(false);
    }
  }

  function toggleMusic() {
    if (!siteMusic) return;
    if (siteMusic.paused) {
      musicStarted = false;
      startMusic();
    } else {
      siteMusic.pause();
      musicStarted = false;
      setMusicState(false);
    }
  }

  let readyTimer;
  let finalTimer;
  let animationFrame;
  let pointerActive = false;
  let viewport = { width: window.innerWidth, height: window.innerHeight };
  let pointer = { x: window.innerWidth * 0.72, y: window.innerHeight * 0.54 };
  let trail = Array.from({ length: 11 }, (_, i) => ({ x: pointer.x - i * 12, y: pointer.y + Math.sin(i * 0.45) * 3 }));

  function resizeViewport() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
  }

  function updatePointerLight(event) {
    if (!intro || intro.classList.contains('closed')) return;
    pointerActive = true;
    intro.style.setProperty('--cursor-window-opacity', '1');
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    intro.style.setProperty('--mx', `${event.clientX}px`);
    intro.style.setProperty('--my', `${event.clientY}px`);
  }

  function updateLiquidReveal(time) {
    if (!liquidBlobs.length) return;

    trail[0].x += (pointer.x - trail[0].x) * 0.07;
    trail[0].y += (pointer.y - trail[0].y) * 0.07;

    for (let i = 1; i < trail.length; i += 1) {
      const drag = Math.max(0.038, 0.088 - i * 0.0045);
      trail[i].x += (trail[i - 1].x - 10 - trail[i].x) * drag;
      trail[i].y += (trail[i - 1].y - trail[i].y) * drag;
    }

    const t = time * 0.001;
    const mapX = (value) => (value / viewport.width) * 1000;
    const mapY = (value) => (value / viewport.height) * 1000;
    const radii = pointerActive ? [84, 68, 52, 36, 24, 14, 0, 0, 0, 0] : [0,0,0,0,0,0,0,0,0,0];

    radii.forEach((radius, index) => {
      const blob = liquidBlobs[index];
      const point = trail[index];
      if (!blob || !point) return;
      const wobbleY = Math.sin(t * 1.1 + index * 0.42) * (index < 3 ? 8 : 4);
      const wobbleX = Math.cos(t * 0.8 + index * 0.33) * (index === 0 ? 6 : 3);
      blob.setAttribute('cx', mapX(point.x + wobbleX).toFixed(1));
      blob.setAttribute('cy', mapY(point.y + wobbleY).toFixed(1));
      blob.setAttribute('r', Math.max(0, radius + Math.sin(t * 1.3 + index * 0.2) * (index < 2 ? 3 : 1.5)).toFixed(1));
    });

    const headLobe = liquidBlobs[10];
    if (headLobe) {
      headLobe.setAttribute('cx', mapX(trail[0].x + 22).toFixed(1));
      headLobe.setAttribute('cy', mapY(trail[0].y + 34 + Math.sin(t * 1.5) * 7).toFixed(1));
      headLobe.setAttribute('r', pointerActive ? (36 + Math.sin(t * 1.2) * 3).toFixed(1) : '0');
    }

    animationFrame = window.requestAnimationFrame(updateLiquidReveal);
  }

  function setIntroReady() {
    if (!intro) return;
    intro.classList.add('zooming');
    window.clearTimeout(finalTimer);
    finalTimer = window.setTimeout(() => {
      if (!intro) return;
      intro.classList.add('ready');
    }, 1550);
  }

  function openSite() {
    startMusic();
    if (!intro) return;
    intro.classList.add('closed');
    document.body.classList.add('site-open');
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    window.setTimeout(() => {
      if (main) { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
    }, 650);
  }

  function replay() {
    if (!intro) return;
    window.clearTimeout(readyTimer);
    window.clearTimeout(finalTimer);
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    intro.classList.remove('closed', 'ready', 'zooming');
    document.body.classList.remove('site-open');
    pointerActive = false;
    intro.style.setProperty('--cursor-window-opacity', '0');
    pointer.x = viewport.width * 0.72;
    pointer.y = viewport.height * 0.54;
    trail = Array.from({ length: 11 }, (_, i) => ({ x: pointer.x - i * 12, y: pointer.y + Math.sin(i * 0.45) * 3 }));
    void intro.offsetWidth;
    readyTimer = window.setTimeout(setIntroReady, 9800);
    animationFrame = window.requestAnimationFrame(updateLiquidReveal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readyTimer = window.setTimeout(setIntroReady, 9800);

  function startMusicFromMovement() {
    if (musicStarted) {
      document.removeEventListener('pointermove', startMusicFromMovement);
      document.removeEventListener('mousemove', startMusicFromMovement);
      return;
    }
    startMusic();
  }

  document.addEventListener('pointerdown', startMusic, { once: true, passive: true });
  document.addEventListener('click', startMusic, { once: true, passive: true });
  document.addEventListener('keydown', startMusic, { once: true });
  document.addEventListener('pointermove', startMusicFromMovement, { passive: true });
  document.addEventListener('mousemove', startMusicFromMovement, { passive: true });
  if (musicToggle) musicToggle.addEventListener('click', toggleMusic);

  document.addEventListener('pointermove', updatePointerLight, { passive: true });
  if (intro) {
    intro.addEventListener('pointerleave', () => {
      pointerActive = false;
      intro.style.setProperty('--cursor-window-opacity', '0');
    });
    intro.addEventListener('pointerenter', () => {
      intro.style.setProperty('--cursor-window-opacity', pointerActive ? '1' : '0');
    });
  }
  window.addEventListener('resize', resizeViewport, { passive: true });
  resizeViewport();
  animationFrame = window.requestAnimationFrame(updateLiquidReveal);

  if (enterSite) enterSite.addEventListener('click', openSite);
  if (skipIntro) skipIntro.addEventListener('click', openSite);
  if (replayIntro) replayIntro.addEventListener('click', replay);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && intro && intro.classList.contains('ready') && !intro.classList.contains('closed')) {
      openSite();
    }
    if (event.key === 'Escape' && intro && !intro.classList.contains('closed')) {
      openSite();
    }
  });

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function updatePageParallax(event) {
    const x = (event.clientX / window.innerWidth - 0.5) * 100;
    const y = (event.clientY / window.innerHeight - 0.5) * 100;
    document.documentElement.style.setProperty('--px', `${x.toFixed(2)}px`);
    document.documentElement.style.setProperty('--py', `${y.toFixed(2)}px`);
  }

  document.addEventListener('pointermove', updatePageParallax, { passive: true });
  document.addEventListener('mousemove', updatePageParallax, { passive: true });

})();
