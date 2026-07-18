(() => {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const live = doc.querySelector('[data-live-region]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const announce = (message) => {
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  };

  doc.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  const savedTheme = localStorage.getItem('site-theme');
  const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = savedTheme || preferredTheme;
  doc.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('site-theme', next);
    announce(next === 'dark' ? '已切換為深色模式' : '已切換為淺色模式');
  });

  const openDialog = (dialog, trigger, focusTarget) => {
    if (!dialog || dialog.open) return;
    dialog._returnFocus = trigger || doc.activeElement;
    dialog.showModal();
    doc.body.classList.add('dialog-open');
    requestAnimationFrame(() => (focusTarget || dialog.querySelector('button, a, input'))?.focus());
  };
  const closeDialog = (dialog) => {
    if (!dialog?.open) return;
    dialog.close();
  };
  doc.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (![...doc.querySelectorAll('dialog')].some((item) => item.open)) doc.body.classList.remove('dialog-open');
      dialog._returnFocus?.focus();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  const menu = doc.querySelector('[data-menu-dialog]');
  doc.querySelectorAll('[data-menu-open]').forEach((button) => button.addEventListener('click', () => openDialog(menu, button)));
  doc.querySelector('[data-menu-close]')?.addEventListener('click', () => closeDialog(menu));

  const search = doc.querySelector('[data-search-dialog]');
  const searchInput = doc.querySelector('[data-search-input]');
  const searchResults = doc.querySelector('[data-search-results]');
  const searchStatus = doc.querySelector('[data-search-status]');
  let searchIndex = null;
  let activeResult = -1;

  const loadSearch = async () => {
    if (searchIndex) return searchIndex;
    searchStatus.textContent = '正在載入搜尋索引…';
    try {
      const response = await fetch('assets/search-index.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      searchIndex = await response.json();
      searchStatus.textContent = '開始輸入以搜尋全部靜態資料。';
    } catch {
      searchStatus.textContent = '搜尋索引暫時無法載入，請使用網站選單。';
      searchIndex = [];
    }
    return searchIndex;
  };
  const openSearch = async (button) => {
    if (menu?.open) menu.close();
    openDialog(search, button, searchInput);
    await loadSearch();
  };
  doc.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', () => openSearch(button)));
  doc.querySelector('[data-search-from-menu]')?.addEventListener('click', (event) => openSearch(event.currentTarget));
  doc.querySelector('[data-search-close]')?.addEventListener('click', () => closeDialog(search));
  addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch(doc.querySelector('[data-search-open]'));
    }
  });

  const renderSearch = async () => {
    const query = searchInput.value.trim().toLocaleLowerCase('zh-Hant');
    const index = await loadSearch();
    activeResult = -1;
    if (!query) {
      searchResults.innerHTML = '';
      searchStatus.textContent = '開始輸入以搜尋全部靜態資料。';
      return;
    }
    const matches = index.filter((item) => `${item.title} ${item.text} ${item.type}`.toLocaleLowerCase('zh-Hant').includes(query)).slice(0, 12);
    searchResults.innerHTML = matches.map((item, indexValue) => `<li><a href="${item.href}" data-search-result="${indexValue}"><span>${item.type}</span><strong>${item.title}</strong><small>${item.text}</small></a></li>`).join('');
    searchStatus.textContent = matches.length ? `找到 ${matches.length} 筆結果。` : `沒有符合「${searchInput.value.trim()}」的結果。`;
  };
  searchInput?.addEventListener('input', renderSearch);
  searchInput?.addEventListener('keydown', (event) => {
    const results = [...searchResults.querySelectorAll('a')];
    if (!results.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeResult = event.key === 'ArrowDown' ? (activeResult + 1) % results.length : (activeResult - 1 + results.length) % results.length;
      results[activeResult].focus();
    }
    if (event.key === 'Enter' && results[0]) results[0].click();
  });
  searchResults?.addEventListener('keydown', (event) => {
    const results = [...searchResults.querySelectorAll('a')];
    const current = results.indexOf(doc.activeElement);
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
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
  let scrollQueued = false;
  addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { updateScroll(); scrollQueued = false; });
  }, { passive: true });
  updateScroll();

  doc.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      announce('已複製到剪貼簿');
      const original = button.textContent;
      button.textContent = '已複製';
      setTimeout(() => { button.textContent = original; }, 1600);
    } catch {
      announce('無法自動複製，請手動選取文字。');
    }
  }));

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
    archive?.querySelectorAll('[data-publication-year]').forEach((group) => {
      group.hidden = !group.querySelector('[data-publication]:not([hidden])');
    });
    const count = doc.querySelector('[data-publication-count]');
    if (count) count.textContent = String(visibleCount);
    announce(`目前顯示 ${visibleCount} 筆期刊論文。`);
  }));

  doc.querySelectorAll('[data-timeline]').forEach((timeline) => {
    const tabs = [...timeline.querySelectorAll('[data-timeline-tab]')];
    const panels = [...timeline.querySelectorAll('[data-timeline-panel]')];
    const activate = (index, focus = false) => {
      tabs.forEach((tab, tabIndex) => {
        tab.setAttribute('aria-selected', String(tabIndex === index));
        tab.tabIndex = tabIndex === index ? 0 : -1;
        if (focus && tabIndex === index) tab.focus();
      });
      panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index; });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
        event.preventDefault();
        const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
        activate((index + direction + tabs.length) % tabs.length, true);
      });
    });
  });

  const horizontal = doc.querySelector('[data-horizontal-archive]');
  doc.querySelectorAll('[data-scroll-archive]').forEach((button) => button.addEventListener('click', () => {
    horizontal?.scrollBy({ left: (button.dataset.scrollArchive === 'next' ? 1 : -1) * Math.min(horizontal.clientWidth * 0.8, 720), behavior: reducedMotion ? 'auto' : 'smooth' });
  }));
  horizontal?.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    horizontal.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * 320, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  doc.querySelector('[data-print-cv]')?.addEventListener('click', () => window.print());
  doc.querySelector('[data-back-top]')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
})();
