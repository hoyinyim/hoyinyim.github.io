import { escapeHtml as e, externalAttrs } from './html.mjs';

const requested = ['chu-study', 'chu-thinking'];
const approved = (glyph) => glyph?.verified && glyph.semanticVerified &&
  glyph.orientationVerified && glyph.approvedForUse &&
  glyph.allowedPages?.includes('research.html') && glyph.allowedRoles?.includes('section') &&
  glyph.assetPath && glyph.sourceTitle && glyph.sourceRecordId && glyph.databaseUrl && glyph.license;
const slideId = (glyph) => `research-material-${glyph.id}`;
const character = (glyph) => `「${glyph.modernCharacter}」`;

function materialSlide(glyph) {
  const id = slideId(glyph);
  const name = character(glyph);
  return `<li id="${e(id)}" class="research-material-card" data-material-slide data-material-character="${e(glyph.modernCharacter)}" tabindex="-1">
    <figure>
      <div class="research-material-view">
        <div class="research-material-picture" id="${e(id)}-picture" data-material-picture>
          <img src="${e(glyph.assetPath)}" width="100" height="97" alt="${e(name)}的楚系字形圖" loading="lazy" decoding="async">
        </div>
        <details class="research-material-zoom" data-material-zoom hidden>
          <summary>放大${e(name)}字形圖</summary>
          <div class="research-material-range">
            <label for="${e(id)}-scale">圖版比例</label>
            <input id="${e(id)}-scale" type="range" min="100" max="200" step="10" value="100" aria-controls="${e(id)}-picture" data-material-range>
            <output for="${e(id)}-scale" data-material-value>100%</output>
          </div>
          <p>放大後，可在上方圖框內捲動細看。</p>
        </details>
      </div>
      <figcaption class="research-material-caption">
        <h3>${e(name)}</h3>
        <dl class="research-material-provenance">
          <div><dt>資料庫</dt><dd>${e(glyph.sourceTitle)}</dd></div>
          <div><dt>紀錄識別</dt><dd>${e(glyph.sourceRecordId)}</dd></div>
          <div><dt>授權紀錄</dt><dd>${e(glyph.license)}</dd></div>
        </dl>
        <p class="research-material-links"><a href="${e(glyph.databaseUrl)}" data-material-database ${externalAttrs}>查閱資料庫紀錄</a><a href="${e(glyph.assetPath)}">開啟原始字形圖</a></p>
      </figcaption>
    </figure>
  </li>`;
}

export function researchMaterials(siteGlyphs = []) {
  const glyphs = requested.map((id) => siteGlyphs.find((glyph) => glyph.id === id)).filter(approved);
  if (glyphs.length !== requested.length) return '';
  const [first] = glyphs;
  return `<section id="research-materials" class="research-materials" data-reading-section tabindex="-1" aria-labelledby="research-materials-title">
    <header class="research-materials-heading">
      <p class="research-materials-spine" aria-hidden="true">字形圖版</p>
      <div><p class="overline">出土文獻／字形資料</p><h2 id="research-materials-title">楚系字形資料</h2><p class="research-materials-intro">從「學」與「思」兩張資料庫字形圖，查看原圖、紀錄識別與授權資訊。</p></div>
    </header>
    <div class="research-material-gallery" data-research-material-gallery>
      <div class="research-material-bar">
        <nav class="research-material-choices" aria-label="選擇字形圖版">${glyphs.map((glyph) => `<a href="#${e(slideId(glyph))}" data-material-choice>${e(character(glyph))}</a>`).join('')}</nav>
        <div class="research-material-steps" data-material-controls hidden>
          <button type="button" data-material-step="-1" aria-controls="research-material-track">前一圖</button>
          <button type="button" data-material-step="1" aria-controls="research-material-track">後一圖</button>
        </div>
      </div>
      <ol class="research-material-track" id="research-material-track" data-material-track aria-label="字形圖版">
        ${glyphs.map(materialSlide).join('')}
      </ol>
      <div class="research-material-selection" data-material-selection hidden>
        <p role="status" data-material-status></p>
        <a href="${e(first.databaseUrl)}" data-material-current-source ${externalAttrs}>查閱所選圖版的資料庫紀錄</a>
      </div>
    </div>
  </section>`;
}
