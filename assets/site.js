(() => {
  'use strict';
  const doc = document;
  const root = doc.documentElement;
  const live = doc.querySelector('[data-live-region]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const announce = (message) => {
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  };

  doc.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  try { root.dataset.theme = localStorage.getItem('site-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch {}
  const updateThemeControls = () => {
    const dark = root.dataset.theme === 'dark';
    doc.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? '目前為深色模式；切換為淺色模式' : '目前為淺色模式；切換為深色模式');
    });
    doc.querySelectorAll('[data-theme-label]').forEach((label) => { label.textContent = dark ? '深色' : '淺色'; });
    doc.querySelectorAll('[data-theme-action]').forEach((label) => { label.textContent = dark ? '淺色' : '深色'; });
    doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e1110' : '#f4f5f3');
  };
  updateThemeControls();
  doc.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('site-theme', root.dataset.theme); } catch {}
    updateThemeControls();
    announce(root.dataset.theme === 'dark' ? '已切換為深色模式' : '已切換為淺色模式');
  }));

  const openDialog = (dialog, trigger, focusTarget) => {
    if (!dialog || dialog.open) return;
    dialog._returnFocus = trigger || doc.activeElement;
    dialog.showModal();
    doc.body.classList.add('dialog-open');
    requestAnimationFrame(() => (focusTarget || dialog.querySelector('button, a, input'))?.focus());
  };
  const closeDialog = (dialog, restore = true) => {
    if (!dialog?.open) return;
    dialog._restoreFocus = restore;
    dialog.close();
  };
  doc.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (![...doc.querySelectorAll('dialog')].some((item) => item.open)) doc.body.classList.remove('dialog-open');
      if (dialog._restoreFocus !== false) dialog._returnFocus?.focus();
      dialog._restoreFocus = true;
    });
    dialog.addEventListener('click', (event) => { if (event.target === dialog && !dialog.matches('[data-menu-dialog]')) closeDialog(dialog); });
  });

  const menu = doc.querySelector('[data-menu-dialog]');
  const menuTriggers = [...doc.querySelectorAll('[data-menu-open]')];
  const menuGlyphs = [...doc.querySelectorAll('[data-menu-glyph]')];
  let menuCloseTimer;
  const setMenuGlyph = (menuId) => {
    if (!menuId) return;
    menu.dataset.activeGlyph = menuId;
    menuGlyphs.forEach((glyph) => {
      if (glyph.dataset.menuGlyph === menuId && !glyph.dataset.loadFailed) glyph.dataset.active = 'true';
      else delete glyph.dataset.active;
    });
  };
  const openMenu = (button) => {
    clearTimeout(menuCloseTimer);
    menu.classList.remove('is-closing');
    openDialog(menu, button, menu.querySelector('[data-menu-target][aria-current="page"]') || menu.querySelector('[data-menu-target]'));
    menuTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'true'));
    setMenuGlyph(menu.dataset.initialGlyph);
  };
  const closeMenu = (restore = true) => {
    if (!menu?.open || menu.classList.contains('is-closing')) return;
    if (reducedMotion) { closeDialog(menu, restore); return; }
    menu._restoreFocus = restore;
    menu.classList.add('is-closing');
    menuCloseTimer = setTimeout(() => closeDialog(menu, restore), 410);
  };
  menuTriggers.forEach((button) => button.addEventListener('click', () => openMenu(button)));
  doc.querySelector('[data-menu-close]')?.addEventListener('click', () => closeMenu());
  menu?.addEventListener('cancel', (event) => { event.preventDefault(); closeMenu(); });
  menu?.addEventListener('click', (event) => { if (event.target === menu) closeMenu(); });
  menu?.addEventListener('close', () => {
    clearTimeout(menuCloseTimer);
    menu.classList.remove('is-closing');
    menuTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
  });
  doc.querySelectorAll('[data-menu-target]').forEach((link) => {
    link.addEventListener('focus', () => setMenuGlyph(link.dataset.menuTarget));
    link.addEventListener('pointerenter', () => setMenuGlyph(link.dataset.menuTarget));
  });
  menuGlyphs.forEach((glyph) => glyph.addEventListener('error', () => {
    glyph.dataset.loadFailed = 'true';
    glyph.hidden = true;
    if (glyph.dataset.active === 'true') menu.classList.add('glyph-unavailable');
  }));

  const siteGlyphs = [...doc.querySelectorAll('[data-site-glyph]')];
  siteGlyphs.forEach((glyph) => {
    const image = glyph.querySelector('img');
    const markFailed = () => { glyph.dataset.loadFailed = 'true'; };
    image?.addEventListener('error', markFailed);
    if (image?.complete && image.naturalWidth === 0) markFailed();
  });
  if ('IntersectionObserver' in window) {
    const glyphObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.revealed = 'true';
      glyphObserver.unobserve(entry.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    doc.querySelectorAll('.section-glyph').forEach((glyph) => glyphObserver.observe(glyph));
  } else doc.querySelectorAll('.section-glyph').forEach((glyph) => { glyph.dataset.revealed = 'true'; });

  const search = doc.querySelector('[data-search-dialog]');
  const searchInput = doc.querySelector('[data-search-input]');
  const searchResults = doc.querySelector('[data-search-results]');
  const searchStatus = doc.querySelector('[data-search-status]');
  let searchIndex;
  const loadSearch = async () => {
    if (searchIndex) return searchIndex;
    searchStatus.textContent = '正在載入搜尋索引…';
    try {
      const response = await fetch('assets/search-index.json');
      if (!response.ok) throw new Error(String(response.status));
      searchIndex = await response.json();
      searchStatus.textContent = '輸入關鍵字，搜尋全站公開資料。';
    } catch {
      searchIndex = [];
      searchStatus.textContent = '搜尋索引暫時無法載入，請使用網站選單。';
    }
    return searchIndex;
  };
  const openSearch = async (button) => {
    const returnButton = menu?.open ? doc.querySelector('[data-search-open]') : button;
    if (menu?.open) closeDialog(menu, false);
    openDialog(search, returnButton, searchInput);
    await loadSearch();
  };
  doc.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', () => openSearch(button)));
  doc.querySelector('[data-search-from-menu]')?.addEventListener('click', (event) => openSearch(event.currentTarget));
  doc.querySelector('[data-search-close]')?.addEventListener('click', () => closeDialog(search));
  addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(doc.querySelector('[data-search-open]')); }
  });

  const renderSearch = async () => {
    const raw = searchInput.value.trim();
    const query = raw.toLocaleLowerCase('zh-Hant');
    const index = await loadSearch();
    if (!query) { searchResults.innerHTML = ''; searchStatus.textContent = '輸入關鍵字，搜尋全站公開資料。'; return; }
    const matches = index.filter((item) => `${item.title} ${item.text} ${item.type}`.toLocaleLowerCase('zh-Hant').includes(query)).slice(0, 12);
    searchResults.innerHTML = matches.map((item) => `<li><a href="${escapeHtml(item.href)}"><small>${escapeHtml(item.type)}</small><span><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</span></a></li>`).join('');
    searchStatus.textContent = matches.length ? `找到 ${matches.length} 筆結果。` : `沒有符合「${raw}」的結果。`;
  };
  searchInput?.addEventListener('input', renderSearch);
  searchInput?.addEventListener('keydown', (event) => {
    const results = [...searchResults.querySelectorAll('a')];
    if (!results.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    results[event.key === 'ArrowDown' ? 0 : results.length - 1].focus();
  });
  searchResults?.addEventListener('keydown', (event) => {
    const results = [...searchResults.querySelectorAll('a')];
    const current = results.indexOf(doc.activeElement);
    if (!results.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? (current + 1) % results.length : (current - 1 + results.length) % results.length;
    results[next].focus();
  });

  const progress = doc.querySelector('[data-scroll-progress]');
  const updateScroll = () => {
    const max = doc.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty('--progress', String(max > 0 ? scrollY / max : 0));
    doc.querySelector('[data-header]')?.classList.toggle('is-scrolled', scrollY > 24);
  };
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { updateScroll(); queued = false; });
  }, { passive: true });
  updateScroll();

  doc.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      const original = button.textContent;
      button.textContent = '已複製';
      announce('已複製到剪貼簿');
      const contactScene = button.dataset.glyphCopy !== undefined ? button.closest('.contact-scene') : null;
      contactScene?.classList.add('is-copy-confirmed');
      setTimeout(() => { button.textContent = original; contactScene?.classList.remove('is-copy-confirmed'); }, 1600);
    } catch { announce('無法自動複製，請手動選取文字。'); }
  }));

  const topology = doc.querySelector('[data-topology]');
  const topologyDomains = [...doc.querySelectorAll('[data-topology-domain]')];
  const setTopologyState = (domain = '') => {
    if (!topology) return;
    if (domain) topology.dataset.activeDomain = domain;
    else delete topology.dataset.activeDomain;
  };
  topologyDomains.forEach((link) => {
    link.addEventListener('pointerenter', () => setTopologyState(link.dataset.topologyDomain));
    link.addEventListener('focus', () => setTopologyState(link.dataset.topologyDomain));
    link.addEventListener('blur', () => setTopologyState());
    link.addEventListener('pointerleave', () => {
      link.style.setProperty('--pointer-x', '0px');
      link.style.setProperty('--pointer-y', '0px');
      if (!link.matches(':focus-visible')) setTopologyState();
    });
    if (!reducedMotion && matchMedia('(pointer: fine)').matches) link.addEventListener('pointermove', (event) => {
      const box = link.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - .5) * 4;
      const y = ((event.clientY - box.top) / box.height - .5) * 4;
      link.style.setProperty('--pointer-x', `${x.toFixed(2)}px`);
      link.style.setProperty('--pointer-y', `${y.toFixed(2)}px`);
    });
  });

  const archive = doc.querySelector('[data-publication-archive]');
  doc.querySelectorAll('[data-publication-filter]').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.publicationFilter;
    doc.querySelectorAll('[data-publication-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let visibleCount = 0;
    archive?.querySelectorAll('[data-publication]').forEach((entry) => {
      const visible = filter === 'all' || entry.dataset.filters.split(' ').includes(filter);
      entry.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    archive?.querySelectorAll('[data-publication-year]').forEach((group) => { group.hidden = !group.querySelector('[data-publication]:not([hidden])'); });
    const count = doc.querySelector('[data-publication-count]');
    if (count) count.textContent = String(visibleCount);
    announce(`目前顯示 ${visibleCount} 筆期刊論文。`);
  }));

  doc.querySelector('[data-print-cv]')?.addEventListener('click', () => print());
  doc.querySelector('[data-back-top]')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  doc.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.protocol !== location.protocol || url.hash || reducedMotion) return;
    event.preventDefault();
    doc.body.classList.add('is-leaving');
    setTimeout(() => location.assign(url.href), 220);
  });
})();
