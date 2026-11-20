import { escapeHtml as e } from '../../src/build/html.mjs';

export const asset = (path) => `../../${path}`;
const picture = (art, extra = '') => `<img src="${e(asset(art.file))}" width="${art.width}" height="${art.height}" alt="${e(art.alt)}" decoding="async"${extra}>`;

export const MinimalNavigation = (items, label = '示範導覽') => `<nav class="study-nav" aria-label="${e(label)}">${items.map(({ href, text, current }) => `<a href="${e(href)}"${current ? ' aria-current="page"' : ''}>${e(text)}</a>`).join('')}</nav>`;

export const PageTransition = (href, label) => `<a class="transition-link" href="${e(href)}">${e(label)}</a>`;

export function ArtworkFrame(art, { eager = false, motion = false } = {}) {
  return `<figure class="art-frame">${picture(art, (eager ? ' fetchpriority="high"' : ' loading="lazy"') + (motion ? ' data-motion-item' : ''))}<figcaption><span>${e(art.title)}</span><span class="art-source">網站設計插圖</span></figcaption></figure>`;
}

export function CalligraphyHero({ profile, glyphs, art, heading = 'h1', sample = false }) {
  const tag = sample ? 'div' : 'section';
  return `<${tag} class="study-hero${sample ? ' study-hero--sample' : ' study-shell'}"${sample ? '' : ' aria-label="書法式卷首"'}><div class="hero-copy">
    <p class="eyebrow">${sample ? '卷首示範' : '個人學術網站・書畫示範'}</p>
    <${heading}>${e(profile.nameZh)}</${heading}>
    <p class="hero-roman" lang="en">${e(profile.nameEn)}</p>
    <p class="study-lead">${e(profile.roleZh)}</p>
    <div class="hero-signature" aria-hidden="true">${glyphs.map((glyph) => `<img src="${e(asset(glyph.assetPath))}" alt="" width="401" height="401" decoding="async">`).join('')}</div>${sample ? '' : '\n    <div class="study-actions"><a href="#study-reading">閱讀研究簡介</a><a href="#study-scroll">展卷</a></div>'}
  </div><div class="hero-leaf" data-effect="ink" data-duration="500">
    ${ArtworkFrame(art, { eager: !sample, motion: true })}${sample ? '' : '\n    <div class="study-actions"><button type="button" data-replay hidden>重看墨圖揭示</button></div>'}
  </div></${tag}>`;
}

export function InkReveal(art, duration = 500) {
  return `<div data-effect="ink" data-duration="${duration}">${ArtworkFrame(art, { motion: true })}<div class="study-actions"><button type="button" data-replay hidden>重看墨圖揭示</button></div></div>`;
}

export function ScrollPainting(works, id) {
  return `<div class="scroll-painting" data-painting>
    <div class="study-actions painting-actions">
      <button type="button" data-painting-step="-1" aria-controls="${e(id)}" hidden>前一幅</button>
      <button type="button" data-painting-step="1" aria-controls="${e(id)}" hidden>後一幅</button>
      <p data-painting-position role="status"></p>
    </div>
    <ol id="${e(id)}" data-painting-track tabindex="0" aria-label="畫卷圖版，可橫向捲動">${works.map((art) => `<li>${ArtworkFrame(art)}</li>`).join('')}</ol>
  </div>`;
}

export function ScrollNarrative(chapters, heading = 'h3') {
  return `<div class="reading-grid" data-narrative>
    <aside class="reading-index"><nav aria-label="本文目次"><p class="eyebrow">本文目次</p><ul>${chapters.map(({ id, title }) => `<li><a href="#${e(id)}" data-chapter-link>${e(title)}</a></li>`).join('')}</ul></nav></aside>
    <div class="reading-body">${chapters.map(({ id, title, body }) => `<section class="reading-chapter" id="${e(id)}" data-chapter tabindex="-1"><${heading}>${e(title)}</${heading}>${body}</section>`).join('')}</div>
  </div>`;
}

export function VerticalTypography(title, text) {
  return `<div class="vertical-sample"><p class="vertical-title">${e(title)}</p><p>${e(text)}</p></div>`;
}

export function ArtworkGallery(works, id) {
  const [first] = works;
  return `<div class="art-gallery" data-gallery>
    <figure class="art-frame gallery-display" id="${e(id)}">
      ${picture(first, ' data-gallery-image loading="lazy"')}
      <figcaption><span data-gallery-title>${e(first.title)}</span><a href="${e(asset(first.file))}" data-gallery-source>查看原圖</a></figcaption>
    </figure>
    <p class="art-description" data-gallery-caption aria-live="polite">${e(first.note)}</p>
    <ul class="gallery-choices" aria-label="選擇圖版">
      ${works.map((art, i) => `<li><a href="${e(asset(art.file))}" aria-controls="${e(id)}" data-gallery-choice data-title="${e(art.title)}" data-caption="${e(art.note)}"${i === 0 ? ' aria-current="true"' : ''}>${picture(art, ' loading="lazy"')}<span>${e(art.title)}</span></a></li>`).join('')}
    </ul>
  </div>`;
}

export function ArtworkZoom(art, id) {
  return `<details class="art-zoom" data-zoom>
    <summary>${e(art.title)}：查看局部</summary>
    <div class="zoom-controls" data-zoom-controls hidden><label for="${e(id)}">圖版比例</label><input id="${e(id)}" type="range" min="100" max="200" step="10" value="100" data-zoom-range><output for="${e(id)}" data-zoom-value>100%</output></div>
    <section class="zoom-viewport" data-zoom-viewport tabindex="0" aria-label="圖版細節，可在區內捲動">${picture(art, ' loading="lazy"')}</section>
    <p class="art-description">這是網站圖版，不是古畫原件掃描。放大後可在圖框內捲動，或<a href="${e(asset(art.file))}">直接開啟原圖</a>。</p>
  </details>`;
}

export function TextReveal(paragraphs, duration = 280) {
  return `<div class="text-reveal" data-effect="text" data-duration="${duration}">${paragraphs.map((paragraph) => `<p data-motion-item>${e(paragraph)}</p>`).join('')}<div class="study-actions"><button type="button" data-replay hidden>重看段落呈現</button></div></div>`;
}

export const PaperTexture = () => `<div class="paper-example"><p class="eyebrow">紙面樣本</p><p>紙面保留淡淡的紋理，題跋、書目和按鈕不靠紋理辨識。</p></div>`;

export function AnnotationPanel(notes) {
  return `<div class="annotation-panel">${notes.map(({ label, body }) => `<details><summary>${e(label)}</summary><p>${e(body)}</p></details>`).join('')}</div>`;
}
