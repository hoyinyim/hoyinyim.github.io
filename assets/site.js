(() => {
  document.documentElement.classList.add('js');
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('site-theme');
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = storedTheme || (preferredDark ? 'dark' : 'light');

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      localStorage.setItem('site-theme', next);
      button.setAttribute('aria-label', next === 'dark' ? '切換為亮色模式' : '切換為暗色模式');
    });
  });

  const header = document.querySelector('.site-header');
  document.querySelectorAll('[data-menu-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const open = header?.dataset.menuOpen !== 'true';
      if (header) header.dataset.menuOpen = String(open);
      button.setAttribute('aria-expanded', String(open));
    });
  });

  const createCommandDialog = () => {
    if (document.querySelector('[data-command-dialog]')) return;
    const dialogElement = document.createElement('dialog');
    dialogElement.className = 'command-dialog';
    dialogElement.dataset.commandDialog = '';
    dialogElement.innerHTML = '<form class="command-form" method="dialog"><label for="site-search">全站搜尋</label><input id="site-search" type="search" autocomplete="off" placeholder="輸入關鍵字" data-command-input><button type="submit">關閉</button></form><ul class="command-list" data-command-list aria-live="polite"><li>輸入關鍵字以搜尋網站既有資料。</li></ul>';
    document.body.append(dialogElement);
  };
  createCommandDialog();
  const dialog = document.querySelector('[data-command-dialog]');
  const commandInput = dialog?.querySelector('input');
  const openCommand = () => { if (dialog && !dialog.open) { dialog.showModal(); commandInput?.focus(); } };
  document.querySelectorAll('[data-command-open]').forEach((button) => button.addEventListener('click', openCommand));
  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); }
  });
  const searchPages = ['index.html', 'about.html', 'research.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'certificates.html', 'teaching.html', 'cv.html', 'contact.html'];
  let searchablePages;
  const getSearchablePages = async () => {
    if (searchablePages) return searchablePages;
    searchablePages = await Promise.all(searchPages.map(async (href) => {
      try {
        const response = await fetch(href, { cache: 'force-cache' });
        const html = await response.text();
        const documentView = new DOMParser().parseFromString(html, 'text/html');
        documentView.querySelectorAll('script, style, noscript').forEach((node) => node.remove());
        return { href, title: documentView.title, text: documentView.body.textContent.replace(/\\s+/g, ' ').trim() };
      } catch { return null; }
    }));
    return searchablePages.filter(Boolean);
  };
  commandInput?.addEventListener('input', async () => {
    const query = commandInput.value.trim().toLocaleLowerCase();
    const list = dialog.querySelector('[data-command-list]');
    if (!query) { list.innerHTML = '<li>輸入關鍵字以搜尋網站既有資料。</li>'; return; }
    list.innerHTML = '<li>搜尋中…</li>';
    const pages = await getSearchablePages();
    const matches = pages.filter((page) => page.text.toLocaleLowerCase().includes(query)).slice(0, 12);
    list.innerHTML = matches.length ? matches.map((page) => {
      const at = page.text.toLocaleLowerCase().indexOf(query);
      const excerpt = page.text.slice(Math.max(0, at - 44), at + query.length + 84);
      return `<li><a data-command-item href="${page.href}"><span>${page.title}</span><small>${excerpt}</small></a></li>`;
    }).join('') : '<li>沒有符合的既有資料。</li>';
  });

  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(year); });

  const canvas = document.querySelector('[data-text-field]');
  const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && motionAllowed) {
    const tokenNode = document.getElementById('field-tokens');
    const tokens = tokenNode ? JSON.parse(tokenNode.textContent) : [];
    const context = canvas.getContext('2d');
    let frame = 0;
    let active = true;
    let points = [];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.75);
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = tokens.map((text, index) => ({ text, x: (index * 151 + 43) % rect.width, y: (index * 97 + 71) % rect.height, speed: .08 + (index % 4) * .025, opacity: .17 + (index % 5) * .035 }));
    };
    const draw = () => {
      if (!active) return;
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = 'rgba(220, 225, 215, .035)';
      for (let x = 32; x < rect.width; x += 84) context.fillRect(x, 0, 1, rect.height);
      points.forEach((point, index) => {
        const y = (point.y + Math.sin(frame * .005 + index) * 16 + frame * point.speed) % (rect.height + 80) - 40;
        context.strokeStyle = `rgba(213, 189, 133, ${point.opacity * .38})`;
        context.beginPath(); context.moveTo(point.x, y - 30); context.lineTo(point.x, y + 30); context.stroke();
        context.fillStyle = `rgba(229, 233, 222, ${point.opacity})`;
        context.font = `${index % 3 === 0 ? 16 : 13}px serif`;
        context.fillText(point.text, point.x + 8, y);
      });
      frame += 1; requestAnimationFrame(draw);
    };
    resize(); window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => { active = !document.hidden; if (active) requestAnimationFrame(draw); });
    requestAnimationFrame(draw);
  }
})();

(() => {
  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const header = document.querySelector('.site-header');

  const loader = document.createElement('div');
  loader.className = 'site-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = '<strong>嚴浩然</strong>';
  document.body.append(loader);
  requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add('is-done')));
  window.setTimeout(() => loader.remove(), motionReduced ? 0 : 1500);

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  const updateScroll = () => {
    const maximum = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${maximum > 0 ? scrollY / maximum : 0})`;
    header?.classList.toggle('is-scrolled', scrollY > 48);
  };
  addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  const routes = [
    ['01', 'HOME', 'index.html'], ['02', '關於', 'about.html'], ['03', '研究', 'research.html'],
    ['04', '期刊論文', 'journal-papers.html'], ['05', '研討會論文', 'conference-papers.html'],
    ['06', '譯著／哲學普及作品', 'translations.html'], ['07', '證照／證書／獎項', 'certificates.html'],
    ['08', '教學', 'teaching.html'], ['09', '履歷', 'cv.html'], ['10', '聯絡', 'contact.html']
  ];
  const navScene = document.createElement('div');
  navScene.className = 'nav-scene';
  navScene.setAttribute('aria-hidden', 'true');
  navScene.innerHTML = `<button class="nav-close" type="button">CLOSE</button><ol>${routes.map(([index, label, href]) => `<li><a href="${href}"><small>${index}</small><span>${label}</span></a></li>`).join('')}</ol>`;
  document.body.append(navScene);
  const closeNav = () => { navScene.classList.remove('is-open'); navScene.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  const openNav = () => { navScene.classList.add('is-open'); navScene.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; navScene.querySelector('.nav-close').focus(); };
  const menuButton = document.createElement('button');
  menuButton.className = 'stage-menu-trigger'; menuButton.type = 'button'; menuButton.textContent = 'MENU'; menuButton.setAttribute('aria-label', '展開主要導覽');
  document.body.append(menuButton);
  const menuButtons = [menuButton, ...document.querySelectorAll('[data-menu-toggle]')];
  menuButtons.forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); openNav(); }));
  navScene.querySelector('.nav-close').addEventListener('click', closeNav);
  addEventListener('keydown', (event) => { if (event.key === 'Escape') closeNav(); });

  const backTop = document.createElement('button');
  backTop.className = 'back-top'; backTop.type = 'button'; backTop.textContent = 'PAGE TOP ↑';
  document.querySelector('.site-footer,.footer')?.append(backTop);
  backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: motionReduced ? 'auto' : 'smooth' }));

  document.querySelectorAll('.chapter,.record,.data-row,.timeline-item,.field-item,.translation-feature,.pub-card,.work-card').forEach((element) => element.setAttribute('data-stage-reveal', ''));
  if (!motionReduced) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-stage-reveal],.portrait-strip,.image-reveal').forEach((element) => observer.observe(element));
  } else document.querySelectorAll('[data-stage-reveal],.portrait-strip,.image-reveal').forEach((element) => element.classList.add('is-visible'));

  const wipe = document.createElement('div');
  wipe.className = 'page-wipe'; wipe.setAttribute('aria-hidden', 'true'); document.body.append(wipe);
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:') || link.target === '_blank') return;
    let destination;
    try { destination = new URL(href, location.href); } catch { return; }
    if (destination.origin !== location.origin) return;
    link.addEventListener('click', (event) => {
      if (motionReduced || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault(); closeNav(); wipe.classList.add('is-active');
      window.setTimeout(() => { location.href = destination.href; }, 620);
    });
  });

  if (!coarsePointer) {
    const dot = document.createElement('span'); const ring = document.createElement('span');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let pointerX = innerWidth / 2, pointerY = innerHeight / 2, ringX = pointerX, ringY = pointerY;
    addEventListener('pointermove', (event) => { pointerX = event.clientX; pointerY = event.clientY; dot.style.transform = `translate(${pointerX}px,${pointerY}px)`; }, { passive: true });
    const drawCursor = () => { ringX += (pointerX - ringX) * .16; ringY += (pointerY - ringY) * .16; ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`; requestAnimationFrame(drawCursor); };
    requestAnimationFrame(drawCursor);
    document.querySelectorAll('a,button,.field-item,.record,.pub-card,.work-card').forEach((element) => {
      element.addEventListener('pointerenter', () => { ring.classList.add('is-link'); ring.textContent = element.matches('a[target="_blank"]') ? '↗' : 'VIEW'; });
      element.addEventListener('pointerleave', () => { ring.classList.remove('is-link'); ring.textContent = ''; });
    });
  }

  const hero = document.querySelector('.field-hero');
  if (hero && !motionReduced && !coarsePointer) hero.addEventListener('pointermove', (event) => {
    const x = (event.clientX / innerWidth - .5) * 2;
    const y = (event.clientY / innerHeight - .5) * 2;
    hero.querySelector('canvas')?.style.setProperty('transform', `translate3d(${x * 5}px,${y * 4}px,0)`);
  }, { passive: true });
})();
