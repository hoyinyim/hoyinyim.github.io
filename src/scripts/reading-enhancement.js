(() => {
  'use strict';

  const index = document.querySelector('[data-chapter-index]');
  if (!index) return;

  const chapters = [...index.querySelectorAll('a[href^="#"]')].map((link) => ({
    link,
    target: document.getElementById(link.hash.slice(1)),
    group: link.closest('details')
  })).filter(({ target }) => target).sort(({ target: left }, { target: right }) =>
    left === right ? 0 : (left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const header = document.querySelector('.site-header');
  let frame = 0;
  let current;

  const updateChapter = () => {
    frame = 0;
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0);
    const indexBox = index.getBoundingClientRect();
    const pinned = getComputedStyle(index).position === 'sticky' && indexBox.top <= headerBottom + 2 && indexBox.bottom > headerBottom;
    const edge = (pinned ? indexBox.bottom : headerBottom) + 24;
    const closeToEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let next;
    for (const { link, target, group } of chapters) {
      if (group && !group.open) continue;
      const top = target.getBoundingClientRect().top;
      if (top <= edge || (closeToEnd && top < innerHeight)) next = link;
    }
    if (next === current) return;
    current?.removeAttribute('aria-current');
    next?.setAttribute('aria-current', 'location');
    current = next;
  };
  const scheduleChapter = () => {
    if (!frame) frame = requestAnimationFrame(updateChapter);
  };
  addEventListener('scroll', scheduleChapter, { passive: true });
  addEventListener('resize', scheduleChapter, { passive: true });
  addEventListener('hashchange', scheduleChapter);
  addEventListener('pageshow', scheduleChapter);
  index.addEventListener('toggle', scheduleChapter, true);
  document.fonts?.ready.then(scheduleChapter);
  scheduleChapter();

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || typeof IntersectionObserver !== 'function' || typeof Element.prototype.animate !== 'function') return;
  const animations = new Set();
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (motion.matches) continue;
      const animation = target.animate(
        [{ transform: 'translateY(4px)', opacity: 0.85 }, { transform: 'translateY(0)', opacity: 1 }],
        { duration: 250, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
      animations.add(animation);
      const cleanup = () => animations.delete(animation);
      animation.finished.then(cleanup, cleanup);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reading-reveal]').forEach((heading) => {
    // Nothing initially visible is masked or displaced, including a direct fragment visit.
    if (!location.hash && heading.getBoundingClientRect().top >= innerHeight) reveal.observe(heading);
  });
  motion.addEventListener('change', () => {
    if (motion.matches) animations.forEach((animation) => animation.cancel());
  });
})();
