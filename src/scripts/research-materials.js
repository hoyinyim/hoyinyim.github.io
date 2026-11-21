(() => {
  'use strict';
  const gallery = document.querySelector('[data-research-material-gallery]');
  if (!gallery) return;

  const track = gallery.querySelector('[data-material-track]');
  const cards = Array.from(gallery.querySelectorAll('[data-material-slide]'));
  const choices = Array.from(gallery.querySelectorAll('[data-material-choice]'));
  const steps = Array.from(gallery.querySelectorAll('[data-material-step]'));
  const status = gallery.querySelector('[data-material-status]');
  const source = gallery.querySelector('[data-material-current-source]');
  if (!track || !cards.length || cards.length !== choices.length || !status || !source) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = -1;
  let scheduled = false;
  let destination = null;
  const leftFor = (card) => Math.min(track.scrollWidth - track.clientWidth,
    Math.max(0, track.scrollLeft + card.getBoundingClientRect().left - track.getBoundingClientRect().left));
  const display = (index) => {
    if (selected === index) return;
    selected = index;
    const card = cards[selected];
    choices.forEach((link, i) => {
      if (selected === i) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    steps.forEach((step) => {
      step.disabled = Number(step.dataset.materialStep) < 0 ? selected === 0 : selected === cards.length - 1;
    });
    const label = card.dataset.materialCharacter;
    status.textContent = `目前圖版：「${label}」　${selected + 1}／${cards.length}`;
    source.href = card.querySelector('[data-material-database]').href;
    source.textContent = `查閱「${label}」的資料庫紀錄`;
  };
  const nearest = () => cards.reduce((best, card, index) =>
    Math.abs(leftFor(card) - track.scrollLeft) < Math.abs(leftFor(cards[best]) - track.scrollLeft) ? index : best, 0);
  const scrollUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (destination !== null && Math.abs(leftFor(cards[destination]) - track.scrollLeft) > 2) return;
      destination = null;
      display(nearest());
    });
  };
  const select = (index) => {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    destination = target;
    const left = leftFor(cards[target]);
    display(target);
    track.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    scrollUpdate();
  };
  const revealFragment = () => {
    const index = cards.findIndex((card) => `#${card.id}` === location.hash);
    if (index < 0) return false;
    track.scrollTo({ left: leftFor(cards[index]), behavior: 'instant' });
    display(index);
    return true;
  };

  gallery.setAttribute('data-enhanced', '');
  gallery.querySelector('[data-material-controls]').hidden = false;
  gallery.querySelector('[data-material-selection]').hidden = false;
  track.tabIndex = 0;
  choices.forEach((link, index) => link.addEventListener('click', (event) => {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(index);
  }));
  steps.forEach((step) => step.addEventListener('click', () => select(selected + Number(step.dataset.materialStep))));
  ['pointerdown', 'wheel', 'keydown'].forEach((event) =>
    track.addEventListener(event, () => { destination = null; }, { passive: true }));
  track.addEventListener('scroll', scrollUpdate, { passive: true });
  track.addEventListener('scrollend', () => { destination = null; scrollUpdate(); }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { destination = null; scrollUpdate(); }).observe(track);
  window.addEventListener('hashchange', revealFragment);
  if (!revealFragment()) display(nearest());

  cards.forEach((card) => {
    const disclosure = card.querySelector('[data-material-zoom]');
    const range = disclosure?.querySelector('[data-material-range]');
    const value = disclosure?.querySelector('[data-material-value]');
    const picture = card.querySelector('[data-material-picture]');
    if (!range || !value || !picture) return;
    const updateZoom = () => {
      const scale = disclosure.open ? range.valueAsNumber : 100;
      const enlarged = scale > 100;
      picture.style.setProperty('--material-zoom', String(scale / 100));
      picture.toggleAttribute('data-material-enlarged', enlarged);
      picture.tabIndex = enlarged ? 0 : -1;
      if (enlarged) {
        picture.setAttribute('role', 'region');
        picture.setAttribute('aria-label', `「${card.dataset.materialCharacter}」字形圖，可捲動查看`);
      } else {
        picture.removeAttribute('role');
        picture.removeAttribute('aria-label');
        picture.scrollTop = 0;
        picture.scrollLeft = 0;
      }
      value.textContent = `${scale}%`;
    };
    range.addEventListener('input', updateZoom);
    disclosure.addEventListener('toggle', updateZoom);
    disclosure.hidden = false;
  });
})();
