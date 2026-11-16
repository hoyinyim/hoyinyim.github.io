import { escapeHtml } from './html.mjs';

export function nameGlyphSequence(glyphs = [], role = 'default') {
  const ordered = [...glyphs].sort((left, right) => left.order - right.order);
  if (!ordered.length) return '';
  return `<span class="name-glyph-sequence name-glyph-sequence--${escapeHtml(role)}" aria-hidden="true">${ordered.map((glyph) => `<img src="${escapeHtml(glyph.assetPath)}" width="401" height="401" alt="" decoding="async" fetchpriority="low">`).join('')}</span>`;
}
