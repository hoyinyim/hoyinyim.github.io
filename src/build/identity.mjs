import { escapeHtml } from './html.mjs';

export function nameGlyphSequence(glyphs = [], role = 'default') {
  const ordered = [...glyphs].sort((left, right) => left.order - right.order);
  if (!ordered.length) return '';
  return `<span class="name-glyph-sequence name-glyph-sequence--${escapeHtml(role)}" aria-hidden="true">${ordered.map((glyph) => `<img src="${escapeHtml(glyph.assetPath)}" width="401" height="401" alt="" decoding="async" fetchpriority="low">`).join('')}</span>`;
}

export function nameStrokeTransition(glyphs = [], chapterGlyph) {
  const chapter = Boolean(chapterGlyph);
  const ordered = chapter ? [{ order: 1, assetPath: chapterGlyph.assetPath }] : [...glyphs].sort((left, right) => left.order - right.order);
  if (!chapter && ordered.length !== 3) return '';
  const size = chapter ? 300 : 401;
  return `<div class="ink-transition${chapter ? ' ink-transition--chapter' : ''}" data-ink-glyph="${escapeHtml(chapterGlyph?.id ?? 'name')}" aria-hidden="true"><span class="ink-paper"></span>${ordered.map((glyph) =>
    `<span class="ink-character ink-character--${glyph.order}">${['upper', 'middle', 'lower'].map((band) =>
      `<span class="ink-fragment ink-${band} ink-${glyph.order}-${band}"><img src="${escapeHtml(glyph.assetPath)}" width="${size}" height="${size}" alt="" decoding="async" fetchpriority="low"></span>`
    ).join('')}</span>`
  ).join('')}</div>`;
}
