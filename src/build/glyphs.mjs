import { escapeHtml } from './html.mjs';

export const glyphMap = (glyphs = []) => Object.fromEntries(glyphs.filter((glyph) => glyph.verified === true).map((glyph) => [glyph.id, glyph]));

export function glyphImage(glyphs, id, { className = '', role = 'inline', interactive = false, loading = 'eager' } = {}) {
  const glyph = glyphMap(glyphs)[id];
  if (!glyph) return '';
  return `<span class="site-glyph site-glyph--${escapeHtml(role)}${className ? ` ${escapeHtml(className)}` : ''}" data-site-glyph="${escapeHtml(id)}" data-glyph-role="${escapeHtml(role)}"${interactive ? ' data-glyph-interactive="true"' : ''} aria-hidden="true"><img src="${escapeHtml(glyph.assetPath)}" width="300" height="300" loading="${loading}" decoding="async" alt=""><i class="site-glyph-axis"></i></span>`;
}

export function pageGlyph(glyphs, id, modifier) {
  return glyphImage(glyphs, id, { className: `page-glyph page-glyph--${modifier}`, role: 'primary' });
}

export function sectionGlyph(glyphs, id, modifier = '') {
  return glyphImage(glyphs, id, { className: `section-glyph${modifier ? ` section-glyph--${modifier}` : ''}`, role: 'section', loading: 'lazy' });
}

export function miniGlyph(glyphs, id, modifier = '') {
  return glyphImage(glyphs, id, { className: `mini-glyph${modifier ? ` mini-glyph--${modifier}` : ''}`, role: 'micro', loading: 'lazy' });
}
