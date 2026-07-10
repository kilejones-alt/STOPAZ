(function () {
  const intro = document.getElementById('intro');
  const enterSite = document.getElementById('enterSite');
  const skipIntro = document.getElementById('skipIntro');
  const replayIntro = document.getElementById('replayIntro');
  const main = document.getElementById('main');
  const menuButton = document.getElementById('menuButton');
  const siteNav = document.getElementById('siteNav');
  const liquidBlobs = Array.from(document.querySelectorAll('.liquid-blob'));

  let readyTimer;
  let animationFrame;
  let viewport = { width: window.innerWidth, height: window.innerHeight };
  let pointer = { x: window.innerWidth * 0.62, y: window.innerHeight * 0.52 };
  let trail = Array.from({ length: 7 }, (_, i) => ({ x: pointer.x - i * 16, y: pointer.y + i * 10 }));

  function resizeViewport() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
  }

  function updatePointerLight(event) {
    if (!intro || intro.classList.contains('closed')) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    intro.style.setProperty('--mx', `${event.clientX}px`);
    intro.style.setProperty('--my', `${event.clientY}px`);
  }

  function updateLiquidReveal(time) {
    if (!liquidBlobs.length) return;

    trail[0].x += (pointer.x - trail[0].x) * 0.105;
    trail[0].y += (pointer.y - trail[0].y) * 0.105;

    for (let i = 1; i < trail.length; i += 1) {
      const drag = Math.max(0.045, 0.105 - i * 0.009);
      trail[i].x += (trail[i - 1].x - trail[i].x) * drag;
      trail[i].y += (trail[i - 1].y - trail[i].y) * drag;
    }

    const t = time * 0.001;
    const mapX = (value) => (value / viewport.width) * 1000;
    const mapY = (value) => (value / viewport.height) * 1000;

    const configs = [
      { index: 0, x: trail[0].x, y: trail[0].y, r: 176 + Math.sin(t * 1.2) * 7 },
      { index: 1, x: trail[1].x - 72 + Math.cos(t * 1.6) * 18, y: trail[1].y - 28 + Math.sin(t * 1.8) * 14, r: 110 },
      { index: 2, x: trail[2].x - 120 + Math.sin(t * 1.3) * 12, y: trail[2].y + 32 + Math.cos(t * 1.7) * 12, r: 94 },
      { index: 3, x: trail[2].x + 102 + Math.sin(t * 1.2) * 18, y: trail[2].y + 54 + Math.cos(t * 1.5) * 10, r: 82 },
      { index: 4, x: trail[3].x + 48 + Math.cos(t * 1.7) * 10, y: trail[3].y - 94 + Math.sin(t * 1.9) * 14, r: 64 },
      { index: 5, x: trail[4].x + 160 + Math.sin(t * 1.4) * 16, y: trail[4].y - 10 + Math.cos(t * 2.1) * 10, r: 56 },
      { index: 6, x: trail[5].x - 174 + Math.cos(t * 1.8) * 16, y: trail[5].y - 52 + Math.sin(t * 1.6) * 10, r: 48 }
    ];

    configs.forEach(({ index, x, y, r }) => {
      const blob = liquidBlobs[index];
      if (!blob) return;
      blob.setAttribute('cx', mapX(x).toFixed(1));
      blob.setAttribute('cy', mapY(y).toFixed(1));
      blob.setAttribute('r', r.toFixed(1));
    });

    animationFrame = window.requestAnimationFrame(updateLiquidReveal);
  }

  function setIntroReady() {
    if (!intro) return;
    intro.classList.add('ready');
  }

  function openSite() {
    if (!intro) return;
    intro.classList.add('closed');
    document.body.classList.add('site-open');
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    window.setTimeout(() => {
      if (main) main.focus({ preventScroll: true });
    }, 650);
  }

  function replay() {
    if (!intro) return;
    window.clearTimeout(readyTimer);
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    intro.classList.remove('closed', 'ready');
    document.body.classList.remove('site-open');
    pointer.x = viewport.width * 0.62;
    pointer.y = viewport.height * 0.52;
    trail = Array.from({ length: 7 }, (_, i) => ({ x: pointer.x - i * 16, y: pointer.y + i * 10 }));
    void intro.offsetWidth;
    readyTimer = window.setTimeout(setIntroReady, 5400);
    animationFrame = window.requestAnimationFrame(updateLiquidReveal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readyTimer = window.setTimeout(setIntroReady, 5400);
  document.addEventListener('pointermove', updatePointerLight, { passive: true });
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
})();
