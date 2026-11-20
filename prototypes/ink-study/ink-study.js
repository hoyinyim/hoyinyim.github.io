(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const replayButtons = Array.from(document.querySelectorAll('[data-replay]'));
  const activeAnimations = new Set();
  const canAnimate = typeof Element.prototype.animate === 'function';
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(value, maximum));

  const syncReplay = () => {
    const enabled = canAnimate && !reducedMotion.matches;
    replayButtons.forEach((button) => { button.hidden = !enabled; });
    if (!enabled) {
      activeAnimations.forEach((animation) => animation.cancel());
      activeAnimations.clear();
    }
  };
  syncReplay();
  reducedMotion.addEventListener('change', syncReplay);

  replayButtons.forEach((button) => {
    const effect = button.closest('[data-effect]');
    if (!effect || !['ink', 'text'].includes(effect.dataset.effect)) {
      button.hidden = true;
      return;
    }
    const items = Array.from(effect.querySelectorAll('[data-motion-item]'));
    let previous = [];
    button.addEventListener('click', () => {
      if (reducedMotion.matches || !canAnimate) return;
      previous.forEach((animation) => animation.cancel());
      const ink = effect.dataset.effect === 'ink';
      const maximum = ink ? 560 : 280;
      const configured = Number(button.dataset.duration ?? effect.dataset.duration);
      const duration = Number.isFinite(configured) && configured > 0 ? clamp(configured, 120, maximum) : (ink ? 500 : 280);
      const frames = ink ? [
        { clipPath: 'inset(0 42% 0 0)', opacity: 0.38 },
        { clipPath: 'inset(0)', opacity: 1 }
      ] : [
        { transform: 'translateY(7px)', opacity: 0.48 },
        { transform: 'translateY(0)', opacity: 1 }
      ];
      previous = items.map((item, index) => {
        const animation = item.animate(frames, {
          duration, delay: ink ? 0 : Math.min(index * 35, 70),
          easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards'
        });
        activeAnimations.add(animation);
        const clear = () => activeAnimations.delete(animation);
        animation.finished.then(clear, clear);
        return animation;
      });
    });
  });

  document.querySelectorAll('[data-painting]').forEach((painting) => {
    const track = painting.querySelector('[data-painting-track]');
    const status = painting.querySelector('[data-painting-position]');
    const controls = Array.from(painting.querySelectorAll('[data-painting-step]'))
      .filter((button) => ['-1', '1'].includes(button.dataset.paintingStep));
    if (!track || !track.children.length) return;

    const getStops = () => {
      const box = track.getBoundingClientRect();
      const inset = Number.parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      const limit = Math.max(0, track.scrollWidth - track.clientWidth);
      return Array.from(track.children).reduce((stops, card) => {
        const left = Math.round(clamp(card.getBoundingClientRect().left - box.left + track.scrollLeft - inset, 0, limit));
        if (left > (stops.at(-1) ?? -2) + 1) stops.push(left);
        return stops;
      }, []);
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      const stops = getStops();
      const index = stops.reduce((nearest, stop, position) =>
        Math.abs(stop - track.scrollLeft) < Math.abs(stops[nearest] - track.scrollLeft) ? position : nearest, 0);
      controls.forEach((button) => {
        button.hidden = stops.length < 2;
        button.disabled = button.dataset.paintingStep === '-1' ? index === 0 : index >= stops.length - 1;
      });
      if (status && stops.length) {
        const label = `${index + 1} ／ ${stops.length}`;
        if (status.textContent !== label) status.textContent = label;
      }
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    controls.forEach((button) => button.addEventListener('click', () => {
      const stops = getStops();
      const delta = Number(button.dataset.paintingStep);
      const next = delta > 0
        ? stops.find((stop) => stop > track.scrollLeft + 1)
        : [...stops].reverse().find((stop) => stop < track.scrollLeft - 1);
      if (next === undefined) return;
      track.scrollTo({ left: next, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      scheduleUpdate();
    }));
    track.addEventListener('scroll', scheduleUpdate, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(track);
    else window.addEventListener('resize', scheduleUpdate);
    update();
  });

  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const image = gallery.querySelector('[data-gallery-image]');
    const title = gallery.querySelector('[data-gallery-title]');
    const caption = gallery.querySelector('[data-gallery-caption]');
    const source = gallery.querySelector('[data-gallery-source]');
    const choices = Array.from(gallery.querySelectorAll('a[data-gallery-choice][href]'));
    if (!image || !choices.length) return;

    choices.forEach((choice) => choice.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (choice.hasAttribute('download') || (choice.target && choice.target !== '_self')) return;
      const thumbnail = choice.querySelector('img');
      const href = choice.getAttribute('href');
      if (!thumbnail || !href) return;
      event.preventDefault();
      choices.forEach((item) => item.removeAttribute('aria-current'));
      choice.setAttribute('aria-current', 'true');
      image.alt = thumbnail.alt;
      for (const attribute of ['width', 'height']) {
        if (thumbnail.hasAttribute(attribute)) image.setAttribute(attribute, thumbnail.getAttribute(attribute));
      }
      image.setAttribute('src', href);
      if (title) title.textContent = choice.dataset.title ?? '';
      if (caption) caption.textContent = choice.dataset.caption ?? '';
      if (source) source.setAttribute('href', href);
    }));
  });

  document.querySelectorAll('[data-zoom]').forEach((zoom) => {
    const controls = zoom.querySelector('[data-zoom-controls]');
    const range = controls?.querySelector('input[data-zoom-range]');
    const value = zoom.querySelector('[data-zoom-value]');
    const viewport = zoom.querySelector('.zoom-viewport');
    if (!range || !viewport) return;
    const update = () => {
      const number = range.valueAsNumber;
      if (!Number.isFinite(number)) return;
      const scale = Number(range.max) > 10 ? number / 100 : number;
      viewport.style.setProperty('--art-zoom', String(scale));
      if (value) value.textContent = `${Math.round(scale * 100)}%`;
    };
    range.addEventListener('input', update);
    controls.hidden = false;
    update();
  });
})();
