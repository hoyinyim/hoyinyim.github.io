(() => {
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
