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
    doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191d19' : '#f6f3ea');
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
    menuCloseTimer = setTimeout(() => closeDialog(menu, restore), 200);
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
  menuGlyphs.forEach((glyph) => {
    const layers = [...(glyph.nextElementSibling?.querySelectorAll('.menu-ink-fragment') || [])];
    const markReady = () => {
      if (layers.length === 3 && [glyph, ...layers].every((image) => image.complete && image.naturalWidth > 0 && image.src === glyph.src)) {
        glyph.dataset.inkReady = 'true';
      }
    };
    [glyph, ...layers].forEach((image) => image.addEventListener('load', markReady));
    const markFailed = () => {
      delete glyph.dataset.inkReady;
      glyph.dataset.loadFailed = 'true';
      glyph.hidden = true;
      if (glyph.dataset.active === 'true') menu.classList.add('glyph-unavailable');
    };
    glyph.addEventListener('error', markFailed);
    if (glyph.complete && glyph.naturalWidth === 0) markFailed();
    else markReady();
  });

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
  const searchShortcuts = doc.querySelector('[data-search-shortcuts]');
  const normalizeQuery = (value) => value.normalize('NFKC').toLocaleLowerCase('zh-Hant');
  let searchIndex;
  let searchRequest;
  const loadSearch = async () => {
    if (searchIndex) return searchIndex;
    if (searchRequest) return searchRequest;
    searchStatus.textContent = '正在載入搜尋索引…';
    searchRequest = fetch('assets/search-index.json').then(async (response) => {
      if (!response.ok) throw new Error(String(response.status));
      searchIndex = await response.json();
      searchStatus.textContent = '輸入關鍵字，搜尋全站公開資料。';
      return searchIndex;
    }).catch(() => {
      searchStatus.textContent = '搜尋索引暫時無法載入，請使用常用入口或網站選單。';
      if (searchShortcuts) searchShortcuts.hidden = false;
      return null;
    }).finally(() => { searchRequest = null; });
    return searchRequest;
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
    const terms = normalizeQuery(raw).split(/\s+/).filter(Boolean);
    if (searchShortcuts) searchShortcuts.hidden = terms.length > 0;
    const index = await loadSearch();
    if (!index || raw !== searchInput.value.trim()) return;
    if (!terms.length) { searchResults.innerHTML = ''; searchStatus.textContent = '輸入關鍵字，搜尋全站公開資料。'; return; }
    const allMatches = index.map((item) => {
      const title = normalizeQuery(item.title);
      const searchable = normalizeQuery(`${item.title} ${item.text} ${item.type}`);
      return { item, relevant: terms.every((term) => searchable.includes(term)), score: terms.filter((term) => title.includes(term)).length };
    }).filter(({ relevant }) => relevant).sort((a, b) => b.score - a.score);
    const matches = allMatches.slice(0, 12).map(({ item }) => item);
    searchResults.innerHTML = matches.map((item) => `<li><a href="${escapeHtml(item.href)}"><small>${escapeHtml(item.type)}</small><span><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.text)}</span></a></li>`).join('');
    searchStatus.textContent = matches.length ? `找到 ${allMatches.length} 筆結果。${allMatches.length > matches.length ? `目前顯示最相關的 ${matches.length} 筆，可增加關鍵字縮小範圍。` : ''}` : `沒有符合「${raw}」的結果。可改用較短的關鍵字。`;
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
    const ratio = max > 0 ? scrollY / max : 0;
    progress?.style.setProperty('--progress', String(ratio));
    root.style.setProperty('--glyph-shift', `${Math.max(-18, -scrollY * .025).toFixed(2)}px`);
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

  // Local previews never intercept a link or alter the supplied source images.
  const nameStamp = doc.querySelector('[data-name-stamp]');
  const stampTrigger = nameStamp?.querySelector('[data-name-stamp-trigger]');
  if (window.CSS?.supports('clip-path', 'inset(50%)')) {
    const addInkFragments = (image) => {
      const frame = doc.createElement('span');
      frame.className = 'ink-local-glyph';
      frame.style.setProperty('--ink-local-source', `url(${JSON.stringify(image.currentSrc || image.src)})`);
      image.before(frame);
      frame.append(image);
    };
    const isLoaded = (image) => image.complete && image.naturalWidth > 0;
    if (stampTrigger) {
      const stampImages = [...nameStamp.querySelectorAll('img')];
      const revealStamp = () => {
        if (nameStamp.hasAttribute('data-ink-ready') || stampImages.length !== 3 || !stampImages.every(isLoaded)) return;
        stampImages.forEach(addInkFragments);
        nameStamp.setAttribute('data-ink-ready', '');
        stampTrigger.hidden = false;
      };
      stampImages.forEach((image) => image.addEventListener('load', revealStamp, { once: true }));
      revealStamp();
      stampTrigger.addEventListener('click', () => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { announce('維持完整姓名字形。'); return; }
        if (nameStamp.hasAttribute('data-ink-pulse')) return;
        nameStamp.setAttribute('data-ink-pulse', '');
        setTimeout(() => {
          nameStamp.removeAttribute('data-ink-pulse');
          announce('姓名古文字與墨圖預覽完成。');
        }, 490);
      });
    }
    doc.querySelectorAll('.domain-link .mini-glyph img, .publications-index a .mini-glyph img, .journal-topic-glyph img').forEach((image) => {
      if (isLoaded(image)) addInkFragments(image);
      else image.addEventListener('load', () => addInkFragments(image), { once: true });
    });
  }

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
  if (archive) {
    const topicIndex = doc.querySelector('[data-publication-topics]');
    const filters = doc.querySelector('[data-publication-filters]');
    const topics = [...topicIndex.querySelectorAll('[data-publication-topic]')];
    const yearFilters = [...filters.querySelectorAll('[data-publication-filter]')];
    const groups = [...archive.querySelectorAll('[data-publication-year]')];
    const entries = [...archive.querySelectorAll('[data-publication]')];
    const count = doc.querySelector('[data-publication-count]');
    const empty = archive.querySelector('[data-publication-empty]');
    const emptyMessage = empty.querySelector('[data-publication-empty-message]');
    let topic = 'all';
    let filter = 'all';
    const hasTopic = (entry) => topic === 'all' || entry.dataset.publicationTopicIds.split(' ').includes(topic);

    const renderFilters = () => {
      let visibleCount = 0;
      const filterByYear = /^\d{4}$/.test(filter);
      for (const group of groups) {
        let groupCount = 0;
        for (const entry of group.querySelectorAll('[data-publication]')) {
          const matchesFilter = filter === 'all' || (filterByYear ? filter === group.dataset.publicationYear : entry.dataset.filters.split(' ').includes(filter));
          entry.hidden = !(hasTopic(entry) && matchesFilter);
          if (!entry.hidden) groupCount += 1;
        }
        group.hidden = groupCount === 0;
        group.querySelector('[data-publication-year-count]').textContent = String(groupCount);
        visibleCount += groupCount;
      }
      topics.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.publicationTopic === topic)));
      yearFilters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.publicationFilter === filter)));
      count.textContent = String(visibleCount);
      empty.hidden = visibleCount > 0;
      if (empty.hidden) {
        announce(`目前顯示 ${visibleCount} 筆期刊論文。`);
      } else {
        const label = topics.find((button) => button.dataset.publicationTopic === topic)?.querySelector('.journal-topic-label')?.textContent;
        const message = label && !entries.some(hasTopic) ? `目前尚無「${label}」主題的期刊書目。` : '沒有符合目前篩選條件的期刊書目。';
        emptyMessage.textContent = message;
        announce(message);
      }
    };

    topics.forEach((button) => button.addEventListener('click', () => {
      topic = button.dataset.publicationTopic;
      renderFilters();
    }));
    yearFilters.forEach((button) => button.addEventListener('click', () => {
      filter = button.dataset.publicationFilter;
      renderFilters();
    }));
    const resetFilters = () => {
      topic = filter = 'all';
      renderFilters();
    };
    empty.querySelector('[data-publication-reset]').addEventListener('click', () => {
      resetFilters();
      topics[0].focus();
    });
    addEventListener('hashchange', () => {
      const target = doc.getElementById(location.hash.slice(1));
      if (target?.matches('[data-publication-year][hidden]')) {
        resetFilters();
        target.scrollIntoView();
      }
    });
    topicIndex.hidden = filters.hidden = false;
  }

  doc.querySelector('[data-print-cv]')?.addEventListener('click', () => print());
  doc.querySelector('[data-back-top]')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

})();
