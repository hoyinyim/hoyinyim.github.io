import { escapeHtml } from './html.mjs';

export const glyphMap = (glyphs = []) => Object.fromEntries(glyphs.filter((glyph) => glyph.verified === true && glyph.semanticVerified === true && glyph.orientationVerified === true && glyph.approvedForUse === true).map((glyph) => [glyph.id, glyph]));
const legacyAlias = { 'person-oracle': 'chu-person', 'study-oracle': 'chu-study', 'book-oracle': 'chu-register', 'teach-oracle': 'chu-teaching', 'journey-oracle': 'chu-path', 'speech-oracle': 'chu-speech' };

export function glyphImage(glyphs, id, { className = '', role = 'inline', interactive = false, loading = 'eager' } = {}) {
  const resolvedId = legacyAlias[id] || id;
  const glyph = glyphMap(glyphs)[resolvedId];
  if (!glyph) return '';
  return `<span class="site-glyph site-glyph--${escapeHtml(role)}${className ? ` ${escapeHtml(className)}` : ''}" data-site-glyph="${escapeHtml(resolvedId)}" data-glyph-role="${escapeHtml(role)}"${interactive ? ' data-glyph-interactive="true"' : ''} aria-hidden="true"><img src="${escapeHtml(glyph.assetPath)}" width="300" height="300" loading="${loading}" decoding="async" alt=""><i class="site-glyph-axis"></i></span>`;
}

export function pageGlyph(glyphs, id, modifier) {
  const pageAlias = { journal: 'chu-writing', conference: 'chu-meeting', translations: 'chu-translation', credentials: 'chu-notice', teaching: 'chu-teaching', cv: 'chu-cv', contact: 'chu-contact' };
  return glyphImage(glyphs, pageAlias[modifier] || id, { className: `page-glyph page-glyph--${modifier}`, role: 'primary' });
}

export function sectionGlyph(glyphs, id, modifier = '') {
  return glyphImage(glyphs, id, { className: `section-glyph${modifier ? ` section-glyph--${modifier}` : ''}`, role: 'section', loading: 'lazy' });
}

export function miniGlyph(glyphs, id, modifier = '') {
  return glyphImage(glyphs, id, { className: `mini-glyph${modifier ? ` mini-glyph--${modifier}` : ''}`, role: 'micro', loading: 'lazy' });
}
