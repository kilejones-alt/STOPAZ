(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header state + understated reading progress.
  const header = document.querySelector('.site-header');
  const syncScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(100, Math.max(0, (scrollY / max) * 100)) : 0;
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(2));
  };
  syncScroll();
  addEventListener('scroll', syncScroll, { passive: true });
  addEventListener('resize', syncScroll, { passive: true });

  // Mobile navigation.
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const closeMenu = () => {
    if (!toggle || !links) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    links.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('click', e => {
      if (links.classList.contains('open') && !e.target.closest('.site-header')) closeMenu();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    addEventListener('resize', () => { if (innerWidth > 920) closeMenu(); }, { passive: true });
  }

  // Active primary navigation.
  const page = body.dataset.page || location.pathname.split('/').pop() || 'index.html';
  const activeMap = {
    'educationtraining.html': 'education.html',
    'certificate-program.html': 'education.html',
    'team.html': 'about.html',
    'partners.html': 'about.html',
    'vision-statement.html': 'about.html',
    'donate-1.html': 'support.html'
  };
  const active = activeMap[page] || page;
  document.querySelectorAll('.nav-links a[href]').forEach(link => {
    if (link.getAttribute('href') === active || link.getAttribute('href') === page) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // Editorial reveal system. It is intentionally restrained and section-level.
  const revealSingles = [
    '.page-hero > div', '.hero-copy > *', '.hero-image', '.section-head',
    '.two-col > *', '.intro-grid > *', '.audience > *', '.image-copy > *',
    '.split-feature > *', '.program-feature', '.fact-list', '.event-feature',
    '.enrollment-status > *', '.closing-cta > *', '.donate-layout > *',
    '.contact-form-layout > *', '.partner-process > *', '.support-decision > *',
    '.promo-copy'
  ];
  const revealGroups = [
    '.era-strip', '.work-grid', '.card-grid', '.trust-grid', '.path-grid',
    '.course-grid', '.detail-grid', '.resource-grid', '.resource-list',
    '.leadership-list', '.social-grid', '.audience-list', '.line-list', '.donate-facts'
  ];
  document.querySelectorAll(revealSingles.join(',')).forEach(el => el.classList.add('reveal'));
  document.querySelectorAll(revealGroups.join(',')).forEach(el => el.classList.add('reveal-stagger'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal,.reveal-stagger').forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal,.reveal-stagger').forEach(el => observer.observe(el));
  }

  // Contact form: prepares an email locally. No website-side transmission/storage.
  const inquiryForm = document.querySelector('#inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(inquiryForm);
      const subject = String(data.get('subject') || 'General inquiry');
      const name = String(data.get('name') || '').trim();
      const organization = String(data.get('organization') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const bodyText = [
        `Name: ${name}`,
        organization ? `Organization: ${organization}` : '',
        `Email: ${email}`,
        '',
        message
      ].filter(Boolean).join('\n');
      location.href = `mailto:info@stopaz.org?subject=${encodeURIComponent(`STOPAZ: ${subject}`)}&body=${encodeURIComponent(bodyText)}`;
    });
  }

  // Transition from institutional site into the separate museum environment.
  document.querySelectorAll('a[href="exhibition/"], a[href="./exhibition/"], a[href$="/exhibition/"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
      if (reducedMotion) return;
      event.preventDefault();
      const destination = link.href;
      const overlay = document.createElement('div');
      overlay.className = 'exhibition-transition';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<i></i><i></i><i></i>';
      body.appendChild(overlay);
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('active')));
      setTimeout(() => { location.href = destination; }, 760);
    });
  });

  // Quiet page exit for ordinary same-site navigation.
  document.querySelectorAll('a[href]').forEach(link => {
    const raw = link.getAttribute('href') || '';
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('http') || raw.startsWith('exhibition/')) return;
    link.addEventListener('click', event => {
      if (reducedMotion || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      event.preventDefault();
      body.classList.add('page-leaving');
      setTimeout(() => { location.href = link.href; }, 170);
    });
  });
})();
