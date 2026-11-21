import { escapeHtml, externalAttrs, groupBy, unique } from './html.mjs';
import { miniGlyph, pageGlyph, sectionGlyph } from './glyphs.mjs';
import { nameGlyphSequence } from './identity.mjs';
import { inkLeaf } from './ink-leaves.mjs';

const tags = (items = []) => items.length ? `<ul class="status-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';

const roleEn = (value) => `<p class="role-en" lang="en">${value.split(',').map((part) => `<span>${escapeHtml(part.trim())}</span>`).join('')}</p>`;
const degreeTitle = (item) => `<h4><span class="degree-zh">${escapeHtml(item.degreeZh)}</span><span class="degree-en" lang="en">${escapeHtml(item.degreeEn)}</span></h4>`;
const institutionPath = (item) => `<p class="institution-path">${item.institutionParts.map((part) => `<span>${escapeHtml(part)}</span>`).join('')}</p>`;
// Keep short academic terms intact on narrow lines without altering the title text.
const titleWithBreaks = (value) => escapeHtml(value)
  .replace(/─{2,3}/g, (separator) => `<wbr>${separator}<wbr>`)
  .replace(/倫理|政治思想|出土文獻/g, (term) => `<span class="nowrap-token">${term}</span>`);
const metaTokens = (value) => value.split('，').map((part, index) => `${index ? '<span aria-hidden="true">，</span>' : ''}<span class="nowrap-token">${escapeHtml(part.replace(/[。．.]$/, ''))}</span>`).join('') + (/[。．.]$/.test(value) ? '。' : '');
const citationWithPageRanges = (value) => escapeHtml(value)
  .replace(/(?:頁\s*)?\d+[-–]\d+/g, (range) => `<span class="nowrap-token">${range}</span>`);
const writingMeta = (value) => {
  const [source, date] = value.split('｜');
  return `<p class="writing-meta"><span>${escapeHtml(source)}</span>${date ? `<time datetime="${escapeHtml(date.replaceAll('/', '-'))}">${escapeHtml(date)}</time>` : ''}</p>`;
};
const conferenceMeta = (value) => {
  const match = value.match(/^(.*?)(（於.*）)$/);
  return match ? `<p class="conference-meta"><span class="conference-event">${escapeHtml(match[1])}</span><span class="conference-place-date">${escapeHtml(match[2])}</span></p>` : `<p class="conference-meta"><span class="conference-event">${escapeHtml(value)}</span></p>`;
};

const educationLedger = (education) => Object.values(groupBy(education, 'schoolId')).map((items) => {
  const school = items[0];
  return `<section class="education-school education-school--${escapeHtml(school.schoolId)}"><header><img src="${escapeHtml(school.logo)}" alt="${escapeHtml(school.logoAlt)}" width="108" height="72"><div><p class="overline">${escapeHtml(school.schoolName)}</p><h3>${escapeHtml(school.schoolName)}</h3></div></header><ol>${items.map((item) => `<li><time class="nowrap-token">${escapeHtml(item.period)}</time><div>${degreeTitle(item)}${institutionPath(item)}</div></li>`).join('')}</ol></section>`;
}).join('');

export function homePage({ profile, research, experience, translations, credentials, publications, conferences, siteGlyphs, nameGlyphs }) {
  const serviceItems = [
    translations.publicWriting[0].title,
    credentials.credentials.find((item) => item.id === 'credential-03').title,
    credentials.credentials.find((item) => item.id === 'credential-04').title
  ];
  const teachingItems = [
    experience[0].text,
    credentials.credentials.find((item) => item.id === 'credential-01').title,
    credentials.credentials.find((item) => item.id === 'credential-02').title
  ];
  const recentPublications = publications.slice(0, 4);
  const homeRole = profile.roleZh.startsWith(profile.institutionZh)
    ? `<span>${escapeHtml(profile.institutionZh)}</span><wbr><span class="home-role-title">${escapeHtml(profile.roleZh.slice(profile.institutionZh.length))}</span>`
    : escapeHtml(profile.roleZh);
  return `<section class="home-intro scroll-opening axis-grid" aria-labelledby="home-title">${inkLeaf('mountains', 'home-intro')}
    ${pageGlyph(siteGlyphs, 'chu-study', 'home')}
    <div class="home-editorial-copy">
      <div class="home-heading"><p class="overline"><span>中國思想／</span><wbr><span>先秦哲學／</span><wbr><span>出土文獻</span></p><h1 id="home-title"><span>${escapeHtml(profile.nameZh)}</span><small lang="en">${escapeHtml(profile.nameEn)}</small></h1></div>
      <div class="home-identity"><strong>${homeRole}</strong>${roleEn(profile.roleEn)}</div>
      <nav class="hero-actions" aria-label="主要學術入口"><a class="axis-link axis-link--primary" href="research.html">研究方向</a><a class="axis-link" href="publications.html">學術著作</a><a class="axis-link" href="cv.html">學術履歷</a></nav>
      <span class="name-glyph-sequence--hero home-name-stamp" data-name-stamp>
        ${nameGlyphSequence(nameGlyphs, 'stamp')}
        <button class="home-stamp-trigger" type="button" aria-label="預覽姓名古文字分合" data-name-stamp-trigger hidden></button>
      </span>
    </div>
    <figure class="home-portrait"><img src="${escapeHtml(profile.portraitWeb || profile.portrait)}" width="523" height="648" fetchpriority="high" alt="${escapeHtml(profile.portraitAlt)}"><figcaption lang="en"><span>National Cheng Kung University</span><span>Department of Chinese Literature</span></figcaption></figure>
  </section>
  <nav class="home-archive-index" aria-label="學術資料索引"><a href="journal-papers.html"><strong>期刊論文</strong><span>${publications.length} 筆</span></a><a href="conference-papers.html"><strong>研討會發表</strong><span>${conferences.presentations.length} 次</span></a><a href="certificates.html"><strong>證照與獎項</strong><span>${credentials.credentials.length + credentials.awards.length} 筆</span></a></nav>
  <section class="home-profile axis-grid" aria-labelledby="home-profile-title">${sectionGlyph(siteGlyphs, 'chu-person', 'home-profile')}<div class="home-profile-heading"><p class="overline">學術簡介</p><h2 id="home-profile-title">中國早期思想與文獻</h2></div><div class="home-profile-copy">${profile.bio.slice(0, 3).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<a class="axis-link" href="about.html">完整個人資料</a></div></section>
  <section class="home-publications" aria-labelledby="home-publications-title"><header class="section-index"><p>近期成果</p><h2 id="home-publications-title">期刊論文</h2><a class="axis-link" href="journal-papers.html">查看全部 ${publications.length} 筆 <span>→</span></a></header><ol>${recentPublications.map((item) => `<li><time>${escapeHtml(item.year)}</time><div><h3><a href="journal-papers.html#year-${escapeHtml(item.year)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.venue)}　${metaTokens(item.meta)}</p></div></li>`).join('')}</ol></section>
  <section class="home-topology" aria-labelledby="topology-title" data-topology>
    <h2 id="topology-title" class="visually-hidden">學術實踐拓樸：研究、服務與教學</h2>
    <p class="topology-kicker">學術實踐／研究・服務・教學</p>
    <nav class="topology-canvas" aria-label="學術實踐領域">
      <a class="domain-link domain-research" href="research.html" data-topology-domain="research" aria-label="研究：前往研究頁">
        ${miniGlyph(siteGlyphs, 'chu-study', 'topology-research')}
        <span class="domain-label"><strong>研究</strong><small>思想史、概念史與出土文獻</small><em>查看研究</em></span>
      </a>
      <a class="domain-link domain-service" href="translations.html" data-topology-domain="service" aria-label="服務：前往譯著與公共寫作頁">
        ${miniGlyph(siteGlyphs, 'chu-speech', 'topology-service')}
        <span class="domain-label"><strong>服務</strong><small>翻譯、編輯與公共寫作</small><em>查看服務</em></span>
      </a>
      <a class="domain-link domain-teaching" href="teaching.html" data-topology-domain="teaching" aria-label="教學：前往教學頁">
        ${miniGlyph(siteGlyphs, 'chu-teaching', 'topology-teaching')}
        <span class="domain-label"><strong>教學</strong><small>課程設計與教學實踐</small><em>查看教學</em></span>
      </a>
      <i class="topology-axis" aria-hidden="true"></i>
    </nav>
  <div class="home-domain-index" role="group" aria-labelledby="home-domain-index-title">
    <h2 id="home-domain-index-title" class="visually-hidden">研究、服務與教學內容索引</h2>
    <article data-domain-summary="research"><header>${miniGlyph(siteGlyphs, 'chu-thinking', 'domain-index')}<p>01／研究</p><h3>研究重點</h3></header><ol>${research.current.map((item) => `<li>${escapeHtml(item.title)}</li>`).join('')}</ol><a class="axis-link" href="research.html">完整研究資料 <span>→</span></a></article>
    <article data-domain-summary="service"><header>${miniGlyph(siteGlyphs, 'chu-transmission', 'domain-index')}<p>02／學術服務</p><h3>公共成果</h3></header><ol>${serviceItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol><a class="axis-link" href="translations.html">譯著與公共寫作 <span>→</span></a></article>
    <article data-domain-summary="teaching"><header>${miniGlyph(siteGlyphs, 'chu-teaching', 'domain-index')}<p>03／教學</p><h3>教學實踐</h3></header><ol>${teachingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol><a class="axis-link" href="teaching.html">完整教學資料 <span>→</span></a></article>
  </div></section>
  `;
}

export function aboutPage({ profile, education, siteGlyphs, nameGlyphs }) {
  return `<section class="about-opening scroll-opening axis-grid" aria-labelledby="about-title">${inkLeaf('mountains', 'about-opening')}${pageGlyph(siteGlyphs, 'chu-person', 'about')}<figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption><span lang="en">${escapeHtml(profile.nameEn)}</span><span>${escapeHtml(profile.institutionZh)}</span></figcaption></figure><div><p class="overline">關於／學術簡介</p><h1 id="about-title">${escapeHtml(profile.nameZh)}</h1>${nameGlyphSequence(nameGlyphs, 'about')}<p class="about-role">${escapeHtml(profile.roleZh)}</p>${roleEn(profile.roleEn)}</div></section>
  ${chapterIndex([{ id: 'biography', text: '學術簡介' }, { id: 'education', text: '教育背景' }])}
  <section class="about-biography axis-grid" id="biography" data-reading-section tabindex="-1" aria-labelledby="biography-title"><h2 id="biography-title" data-reading-reveal>學術簡介</h2><div>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<details class="reading-annotation"><summary>姓名字形來源</summary><p>姓名字形由網站作者提供，僅用作姓名識別；文字系統、年代與原件出處尚未獨立查證。</p></details></div></section>
  <section class="about-education axis-grid" id="education" data-reading-section tabindex="-1" aria-labelledby="about-education-title">${sectionGlyph(siteGlyphs, 'chu-path', 'education')}<header><p class="overline">教育背景／2016年至今</p><h2 id="about-education-title" data-reading-reveal>教育背景</h2></header><div class="education-ledger">${educationLedger(education)}</div></section>
  <nav class="next-links" aria-label="延伸閱讀"><a href="research.html">研究 <span>研究方向</span></a><a href="cv.html">履歷 <span>完整經歷</span></a><a href="contact.html">聯絡 <span>學術通信</span></a></nav>`;
}

const readingIndexItems = (items) => items.map(({ id, text, count }) => `<li><a href="#${escapeHtml(id)}">${escapeHtml(text)}${count ? ` <span class="reading-index-count">${escapeHtml(count)}</span>` : ''}</a></li>`).join('');
const readingIndex = (label, items) =>
  `<nav class="reading-index" aria-label="${escapeHtml(label)}"><p>${escapeHtml(label)}</p><ul>${readingIndexItems(items)}</ul></nav>`;
const chapterIndex = (items, records = []) =>
  `<nav class="reading-index reading-index--chapter" data-chapter-index aria-label="本頁目錄"><p>本頁目錄</p><ul>${readingIndexItems(items)}</ul>${records.length ? `<details class="reading-subtopics"><summary>研究題目</summary><ul>${readingIndexItems(records)}</ul></details>` : ''}</nav>`;
const readingRecord = ({ id }) => `id="${escapeHtml(id)}" data-reading-record tabindex="-1"`;

export function researchPage({ research, siteGlyphs }) {
  const focusGlyphs = ['study-oracle', 'book-oracle', 'speech-oracle'];
  const chapters = [{ id: 'research-focus', text: '目前研究方向' }, { id: 'research-specialties', text: '研究專長' }];
  return `<header class="research-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('mountains', 'research-opening')}${pageGlyph(siteGlyphs, 'study-oracle', 'research')}<p class="overline">研究／中國思想</p><h1>研究</h1><div><strong>${research.current.length} 項研究重點</strong><ul class="research-tags">${research.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul></div></header>
  ${chapterIndex(chapters, research.current.map(({ id, title }) => ({ id, text: title })))}
  <section class="research-focus-list" id="research-focus" data-reading-section tabindex="-1" aria-labelledby="research-focus-title"><h2 id="research-focus-title" class="visually-hidden">目前研究方向</h2>${research.current.map((item, index) => `<article class="focus-${index + 1} axis-grid" data-glyph-focus ${readingRecord(item)}>${sectionGlyph(siteGlyphs, focusGlyphs[index], `research-focus-${index + 1}`)}<p class="focus-number">0${index + 1}</p><p class="overline">目前研究重點</p><h3 data-reading-reveal>${escapeHtml(item.title)}</h3><p class="focus-copy">${escapeHtml(item.description)}</p></article>`).join('')}</section>
  <section class="research-matrix-section" id="research-specialties" data-reading-section tabindex="-1" aria-labelledby="research-matrix-title">${sectionGlyph(siteGlyphs, 'study-oracle', 'research-matrix')}<header class="section-index"><p>研究領域</p><h2 id="research-matrix-title" data-reading-reveal>研究專長</h2></header><div class="expertise-matrix">${research.expertise.map((item) => `<article ${readingRecord(item)}><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>`;
}

export function publicationsPage({ publications, conferences, translations, siteGlyphs }) {
  const categories = [
    { id: 'journal', href: 'journal-papers.html', number: '01', label: ['期刊論文'], glyph: 'chu-writing', count: `${publications.length} 筆`, detail: '經同儕審查與正式刊載之期刊研究成果' },
    { id: 'conference', href: 'conference-papers.html', number: '02', label: ['研討會論文'], glyph: 'chu-meeting', count: `${conferences.published.length} 篇出版／${conferences.presentations.length} 次發表`, detail: '已出版論文集與學術會議發表紀錄' },
    { id: 'translations', href: 'translations.html', number: '03', label: '譯著與公共寫作', glyph: 'chu-translation', count: `1 筆譯著／${translations.publicWriting.length} 篇文章`, detail: '翻譯作品及面向公共讀者的哲學寫作' }
  ];
  return `<header class="publications-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('river', 'publications-opening')}${pageGlyph(siteGlyphs, 'chu-register', 'publications')}<p class="overline">著作／書目與公共寫作</p><h1>著作</h1><p>以書目類型建立可核對、可閱讀的學術成果入口。</p></header>
  <nav class="publications-index" aria-label="著作分類">${categories.map((item) => `<a href="${item.href}" data-publication-kind="${item.id}">${miniGlyph(siteGlyphs, item.glyph, `publication-kind-${item.id}`)}<span class="publication-kind-number">${item.number}</span><strong class="publication-kind-title">${escapeHtml(item.label).replace('與', '與<wbr>')}</strong><span class="publication-count">${item.count.split('／').map((part, index) => `${index ? '<span aria-hidden="true">／</span>' : ''}<span class="nowrap-token">${escapeHtml(part)}</span>`).join('')}</span><p>${item.detail}</p></a>`).join('')}</nav>`;
}

export function journalPage({ publications, journalTopics, pageIntros, siteGlyphs }) {
  const groups = groupBy(publications, 'year');
  const years = unique(publications.map((item) => item.year));
  const filters = [{ id: 'all', label: '全部' }, { id: 'forthcoming', label: '待刊' }, ...years.map((year) => ({ id: year, label: year })), { id: 'thci', label: 'THCI' }];
  const topicIds = (id) => journalTopics.filter((topic) => topic.papers.includes(id)).map((topic) => topic.id).join(' ');
  const topicName = (label) => escapeHtml(label).split('／').map((part, index, parts) =>
    `<span class="journal-topic-part">${part.replace(/[《》]/g, (bracket) => `<span class="journal-topic-bracket">${bracket}</span>`)}${index < parts.length - 1 ? '／' : ''}</span>`
  ).join('<wbr>');
  const topicChips = journalTopics.map(({ id, character, label, width, height, papers }) => `<button type="button" class="journal-topic-chip" data-publication-topic="${escapeHtml(id)}" aria-pressed="false" aria-controls="journal-results">
    <span class="journal-topic-glyph site-glyph" aria-hidden="true"><img src="images/journal-topics/${escapeHtml(id)}.png" alt="" width="${width}" height="${height}" decoding="async"></span>
    <span class="visually-hidden">${escapeHtml(character)}：</span><span class="journal-topic-label">${topicName(label)}</span><span class="journal-topic-count">${papers.length} 筆</span>
  </button>`).join('');
  const entries = years.map((year) => `<section class="publication-year" id="year-${year}" data-publication-year="${year}"><header>${miniGlyph(siteGlyphs, 'book-oracle', 'year-index')}<h2>${year}</h2><p><span data-publication-year-count>${groups[year].length}</span> 筆</p></header><ol>${groups[year].map((pub) => `<li class="publication-entry" data-publication data-publication-id="${escapeHtml(pub.id)}" data-publication-topic-ids="${escapeHtml(topicIds(pub.id))}" data-filters="${escapeHtml(pub.filter.join(' '))}"><article><p class="publication-venue">${escapeHtml(pub.venue)}</p><h3>${titleWithBreaks(pub.title)}</h3><p class="publication-meta">${metaTokens(pub.meta)}</p>${tags(pub.tags)}<div class="entry-actions">${pub.link ? `<a href="${escapeHtml(pub.link)}" ${externalAttrs}>${escapeHtml(pub.linkLabel || '電子全文')} ↗</a>` : '<span>全文連結待補</span>'}<button type="button" data-copy="${escapeHtml(pub.cite)}">複製引用</button></div><details><summary>引用格式</summary><p>${citationWithPageRanges(pub.cite)}</p></details></article></li>`).join('')}</ol></section>`).join('');
  return `<header class="journal-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('river', 'journal-opening')}${pageGlyph(siteGlyphs, 'book-oracle', 'journal')}<p class="overline">期刊論文／書目檔案</p><h1>期刊論文</h1><div><strong>${publications.length} 筆著作</strong><p>${escapeHtml(pageIntros.journal.lead)}</p></div></header>
  <section class="journal-topics" aria-labelledby="journal-topic-title" data-publication-topics hidden>
    <div class="journal-topic-index" role="group" aria-labelledby="journal-topic-title">
      <h2 id="journal-topic-title">主題索引</h2>
      <button type="button" class="journal-topic-all" data-publication-topic="all" aria-pressed="true" aria-controls="journal-results">全部主題</button>
      <div class="journal-topic-strip">${topicChips}</div>
    </div>
  </section>
  <div class="archive-toolbar" id="journal-top"><p>${miniGlyph(siteGlyphs, 'book-oracle', 'filter')}書目篩選</p><div class="filter-strip" role="group" aria-label="年份與刊登狀態" data-publication-filters hidden>${filters.map((filter, index) => `<button type="button" data-publication-filter="${filter.id}" aria-pressed="${index === 0}" aria-controls="journal-results">${escapeHtml(filter.label)}</button>`).join('')}</div><p><span data-publication-count>${publications.length}</span> 筆書目</p></div>
  <div class="publication-archive" id="journal-results" data-publication-archive>
    <div class="journal-empty" data-publication-empty hidden><p data-publication-empty-message></p><button type="button" data-publication-reset>清除篩選</button></div>
    ${entries}
  </div>`;
}

export function conferencePage({ conferences, pageIntros, siteGlyphs }) {
  const groups = groupBy(conferences.presentations, 'year');
  // Numeric object keys enumerate oldest first; render the newest year first.
  const years = Object.keys(groups).sort((left, right) => Number(right) - Number(left));
  return `<header class="conference-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('river', 'conference-opening')}${pageGlyph(siteGlyphs, 'speech-oracle', 'conference')}<p class="overline">研討會論文／學術發表</p><h1>研討會論文</h1><div><strong>${conferences.published.length} 篇已出版／${conferences.presentations.length} 次發表</strong><p>${escapeHtml(pageIntros.conference.lead)}</p></div></header>
  ${readingIndex('本頁目錄', [{ id: 'conference-published', text: '已出版論文', count: `${conferences.published.length} 篇` }, { id: 'conference-presentations', text: '研討會發表', count: `${conferences.presentations.length} 次` }])}
  <section class="conference-published" id="conference-published" data-reading-section tabindex="-1" aria-labelledby="published-title">${sectionGlyph(siteGlyphs, 'book-oracle', 'conference-published')}<header class="section-index"><p>出版紀錄</p><h2 id="published-title">已出版論文集</h2></header>${conferences.published.map((item) => `<article ${readingRecord(item)}><p class="publication-venue">${escapeHtml(item.venue)}</p><h3>${titleWithBreaks(item.title)}</h3><p class="publication-meta">${metaTokens(item.meta)}</p><a href="${item.link}" ${externalAttrs} aria-label="電子全文：${escapeHtml(item.title)}（在新分頁開啟）">電子全文</a></article>`).join('')}</section>
  <section class="conference-ledger" id="conference-presentations" data-reading-section tabindex="-1" aria-labelledby="presentations-title">${sectionGlyph(siteGlyphs, 'journey-oracle', 'conference-timeline')}<header class="section-index"><p>學術發表</p><h2 id="presentations-title">研討會發表</h2></header>
  ${readingIndex('依年份查看', years.map((year) => ({ id: `conference-year-${year}`, text: year, count: `${groups[year].length} 次` })))}
  ${years.map((year) => `<section class="conference-year" id="conference-year-${escapeHtml(year)}" data-reading-section tabindex="-1" aria-labelledby="conference-heading-${escapeHtml(year)}">${miniGlyph(siteGlyphs, 'journey-oracle', 'conference-year')}<h3 id="conference-heading-${escapeHtml(year)}">${escapeHtml(year)}</h3><ol>${groups[year].map((item) => `<li ${readingRecord(item)}><h4>${titleWithBreaks(item.title)}</h4>${conferenceMeta(item.meta)}</li>`).join('')}</ol></section>`).join('')}</section>`;
}

export function translationsPage({ translations, pageIntros, siteGlyphs }) {
  const { translation, publicWriting } = translations;
  const latest = publicWriting.slice(0, 3);
  const archive = publicWriting.slice(3);
  return `<header class="translations-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('river', 'translations-opening')}${pageGlyph(siteGlyphs, 'speech-oracle', 'translations')}<p class="overline">譯著與公共寫作</p><h1 class="translations-title"><span>譯著與</span><span>公共寫作</span></h1><p>${escapeHtml(pageIntros.translations.lead)}</p></header>
  ${readingIndex('本頁目錄', [{ id: translation.id, text: '書籍翻譯' }, { id: 'latest-writing', text: '最新公共寫作' }, { id: 'writing-index', text: '作品索引' }])}
  <section class="translation-feature" ${readingRecord(translation)} aria-labelledby="translation-title">${sectionGlyph(siteGlyphs, 'book-oracle', 'translation-book')}<div class="translation-feature-heading"><p class="overline">書籍翻譯／2024</p><h2 id="translation-title">${escapeHtml(translation.title)}</h2><p class="original-title" lang="en">${escapeHtml(translation.originalTitle)}</p></div><figure><img src="${translation.cover}" width="500" height="700" loading="lazy" decoding="async" alt="${escapeHtml(translation.coverAlt)}"></figure><div class="translation-feature-details"><dl><div><dt>作者</dt><dd>${escapeHtml(translation.author)}</dd></div><div><dt>譯者</dt><dd>${escapeHtml(translation.translator)}</dd></div><div><dt>出版社</dt><dd>${escapeHtml(translation.publisher)}</dd></div><div><dt>出版日</dt><dd>${escapeHtml(translation.publicationDate)}</dd></div></dl><p>${escapeHtml(translation.description)}</p><a class="axis-link" href="${translation.link}" ${externalAttrs}>前往出版社</a></div></section>
  <section class="latest-writing" id="latest-writing" data-reading-section tabindex="-1" aria-labelledby="latest-writing-title">${sectionGlyph(siteGlyphs, 'speech-oracle', 'public-writing')}<header class="section-index"><p>最新公共寫作</p><h2 id="latest-writing-title">最新公共寫作</h2></header><div>${latest.map((item) => `<article ${readingRecord(item)}>${writingMeta(item.source)}<h3><a href="${item.link}" ${externalAttrs}>${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>
  <section class="writing-index" id="writing-index" data-reading-section tabindex="-1" aria-labelledby="writing-index-title"><header class="section-index"><p>完整索引</p><h2 id="writing-index-title">作品索引</h2></header><ol>${archive.map((item) => `<li ${readingRecord(item)}>${writingMeta(item.source)}<h3><a href="${item.link}" ${externalAttrs}>${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></li>`).join('')}</ol></section>`;
}

export function certificatesPage({ credentials, pageIntros, siteGlyphs }) {
  return `<header class="credentials-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('bamboo', 'credentials-opening')}${pageGlyph(siteGlyphs, 'journey-oracle', 'credentials')}<p class="overline">證照與獎項</p><h1>證照與獎項</h1><p>${escapeHtml(pageIntros.certificates.lead)}</p></header>
  ${readingIndex('本頁目錄', [{ id: 'credentials', text: '專業證照與證書', count: `${credentials.credentials.length} 筆` }, { id: 'awards', text: '學業與研究獎項', count: `${credentials.awards.length} 筆` }])}
  <section class="credential-ledger" id="credentials" data-reading-section tabindex="-1" aria-labelledby="credentials-title">${sectionGlyph(siteGlyphs, 'book-oracle', 'credentials-record')}<header class="section-index"><p>專業資格</p><h2 id="credentials-title">專業證照與證書</h2></header><ol>${credentials.credentials.map((item) => `<li ${readingRecord(item)}><p>${escapeHtml(item.category)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.issuer)}</p></li>`).join('')}</ol></section>
  <section class="award-timeline" id="awards" data-reading-section tabindex="-1" aria-labelledby="awards-title">${sectionGlyph(siteGlyphs, 'journey-oracle', 'recognition-timeline')}<header class="section-index"><p>學術榮譽</p><h2 id="awards-title">學業與研究獎項</h2></header><ol>${credentials.awards.map((item) => `<li ${readingRecord(item)}><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`).join('')}</ol><div class="archive-note"><p>${escapeHtml(pageIntros.certificates.closing)}</p><a class="axis-link" href="contact.html">查看聯絡方式</a></div></section>`;
}

export function teachingPage({ experience, siteGlyphs }) {
  const [teaching, ...practice] = experience;
  return `<header class="teaching-opening scroll-opening scroll-opening--catalogue axis-grid">${inkLeaf('bamboo', 'teaching-opening')}${pageGlyph(siteGlyphs, 'teach-oracle', 'teaching')}<p class="overline">教學／學術實踐</p><h1>教學</h1><p>教學工作與學術、翻譯及公共實踐紀錄。</p></header>
  ${chapterIndex([{ id: 'teaching-experience', text: '實際教學經驗' }, { id: 'teaching-practice', text: '學術與專業實踐' }])}
  <section class="teaching-primary axis-grid" id="teaching-experience" data-reading-section tabindex="-1" aria-labelledby="teaching-title">${sectionGlyph(siteGlyphs, 'study-oracle', 'teaching-study')}<p class="overline">教學經驗</p><h2 id="teaching-title" data-reading-reveal>實際教學經驗</h2><article><p>${escapeHtml(teaching.text)}</p></article></section>
  <section class="practice-ledger" id="teaching-practice" data-reading-section tabindex="-1" aria-labelledby="practice-title">${sectionGlyph(siteGlyphs, 'journey-oracle', 'practice-path')}<header class="section-index"><p>學術與專業實踐</p><h2 id="practice-title" data-reading-reveal>學術與專業實踐</h2></header><ol>${practice.map((item) => `<li><p>${escapeHtml(item.text)}</p></li>`).join('')}</ol><a class="axis-link" href="certificates.html">查看專業證照與獎項 ↗</a></section>`;
}

const cvList = (items, render) => `<ol class="cv-list">${items.map(render).join('')}</ol>`;
// Keep each supplied glyph tied to its research record, independent of list order.
const cvResearchGlyphs = {
  'expertise-01': ['pre-qin', 97],
  'expertise-02': ['xunzi', 97],
  'expertise-03': ['laozi', 97],
  'expertise-04': ['excavated-texts', 99],
  'expertise-05': ['ethics-politics', 97],
  'expertise-06': ['wei-jin', 97]
};
const cvResearchEntry = (item) => {
  const glyph = cvResearchGlyphs[item.id];
  const artwork = glyph ? `<img class="cv-entry-glyph" src="images/cv/${glyph[0]}.png" width="${glyph[1]}" height="97" alt="" decoding="async" fetchpriority="low">` : '';
  return `<li data-cv-expertise="${escapeHtml(item.id)}">${artwork}<div class="cv-entry-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`;
};
export function cvPage({ profile, education, experience, research, publications, conferences, translations, credentials, siteGlyphs }) {
  const translationItems = [translations.translation, ...translations.publicWriting];
  const sections = [['cv-profile', '個人資料'], ['cv-education', '教育'], ['cv-experience', '職歷與教學'], ['cv-research', '研究領域'], ['cv-journal', '期刊論文'], ['cv-conference', '研討會論文'], ['cv-translations', '譯著與公共寫作'], ['cv-projects', '研究計畫'], ['cv-credentials', '證照與獎項']];
  const [emailLocal, emailDomain] = profile.email.split('@');
  return `<header class="cv-header scroll-opening">${inkLeaf('bamboo', 'cv-header')}${pageGlyph(siteGlyphs, 'journey-oracle', 'cv')}<p class="overline">個人履歷</p><h1>${escapeHtml(profile.nameZh)} <span>${escapeHtml(profile.nameEn)}</span></h1><div><a href="mailto:${escapeHtml(profile.email)}"><span>${escapeHtml(emailLocal)}@</span><wbr><span>${escapeHtml(emailDomain)}</span></a><a href="downloads/yim-ho-yin-cv.pdf" download>下載 PDF</a><button type="button" data-print-cv>列印／儲存 PDF</button></div></header><div class="cv-layout"><nav class="cv-index" aria-label="履歷頁內索引">${miniGlyph(siteGlyphs, 'journey-oracle', 'cv-index')}${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav><div class="cv-document">
    <section id="cv-profile"><h2>個人資料</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>
    <section id="cv-education"><h2>教育</h2>${cvList(education, (item) => `<li><time class="nowrap-token">${escapeHtml(item.period)}</time><div><h3><span class="degree-zh">${escapeHtml(item.degreeZh)}</span><span class="degree-en" lang="en">${escapeHtml(item.degreeEn)}</span></h3>${institutionPath(item)}</div></li>`)}</section>
    <section id="cv-experience"><h2>職歷與教學</h2>${cvList(experience, (item) => `<li><span></span><p>${escapeHtml(item.text)}</p></li>`)}</section>
    <section id="cv-research"><h2>研究領域</h2>${cvList(research.expertise, cvResearchEntry)}</section>
    <section id="cv-journal"><h2>期刊論文</h2>${cvList(publications, (item) => `<li><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue)}　${escapeHtml(item.meta)}</p>${tags(item.tags)}</div></li>`)}</section>
    <section id="cv-conference"><h2>研討會論文</h2>${cvList([...conferences.published, ...conferences.presentations], (item) => `<li><time>${escapeHtml(item.year || '')}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue || '')}${item.venue ? '　' : ''}${escapeHtml(item.meta)}</p></div></li>`)}</section>
    <section id="cv-translations"><h2>譯著與公共寫作</h2>${cvList(translationItems, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || item.originalTitle || '')}</p><small>${escapeHtml(item.source || item.publisher || '')}</small></div></li>`)}</section>
    <section id="cv-projects"><h2>研究計畫</h2>${cvList(research.current, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`)}</section>
    <section id="cv-credentials"><h2>證照與獎項</h2>${cvList([...credentials.credentials, ...credentials.awards], (item) => `<li>${item.year ? `<time class="nowrap-token">${escapeHtml(item.year)}</time>` : '<span aria-hidden="true"></span>'}<div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.issuer || item.description || '')}</p></div></li>`)}</section>
  </div></div>`;
}

export function contactPage({ profile, siteGlyphs }) {
  const [emailLocal, emailDomain] = profile.email.split('@');
  return `<section class="contact-scene scroll-opening axis-grid" aria-labelledby="contact-title">${inkLeaf('bamboo', 'contact-scene')}${pageGlyph(siteGlyphs, 'speech-oracle', 'contact')}<p class="overline">聯絡／學術通信</p><h1 id="contact-title">聯絡</h1><div class="contact-identity"><strong><span>${escapeHtml(profile.nameZh)}</span><span lang="en">${escapeHtml(profile.nameEn)}</span></strong><p>${escapeHtml(profile.roleZh)}</p><p>${escapeHtml(profile.institutionZh)}</p></div><a class="contact-email" href="mailto:${escapeHtml(profile.email)}"><span>${escapeHtml(emailLocal)}@</span><wbr><span>${escapeHtml(emailDomain)}</span></a><div class="contact-actions"><a href="mailto:${escapeHtml(profile.email)}">撰寫郵件</a><button type="button" data-copy="${escapeHtml(profile.email)}" data-glyph-copy>複製 Email</button></div></section>`;
}

export function notFoundPage() {
  return `<section class="not-found scroll-opening axis-grid">${inkLeaf('bamboo', 'not-found')}<p class="overline">錯誤／404</p><h1>找不到頁面</h1><p>指定頁面不存在或已移動。您可以返回首頁，或搜尋全站公開資料。</p><div><a href="index.html">返回首頁</a><button type="button" data-search-open>搜尋全站</button></div></section>`;
}

export function searchIndex(data) {
  const { routes, publications, conferences, translations, credentials, research, education, experience } = data;
  const items = routes.map((route) => ({ id: `route-${route.id}`, href: route.href, type: '頁面', title: route.labelZh, text: route.labelEn }));
  publications.forEach((item) => items.push({ id: item.id, href: `journal-papers.html#year-${item.year}`, type: '期刊論文', title: item.title, text: `${item.venue} ${item.meta} ${item.tags.join(' ')}` }));
  conferences.published.forEach((item) => items.push({ id: item.id, href: `conference-papers.html#${item.id}`, type: '已出版研討會論文', title: item.title, text: `${item.venue} ${item.meta}` }));
  conferences.presentations.forEach((item) => items.push({ id: item.id, href: `conference-papers.html#${item.id}`, type: '研討會發表', title: item.title, text: item.meta }));
  items.push({ id: translations.translation.id, href: `translations.html#${translations.translation.id}`, type: '譯著', title: translations.translation.title, text: `${translations.translation.originalTitle} ${translations.translation.author} ${translations.translation.publisher}` });
  translations.publicWriting.forEach((item) => items.push({ id: item.id, href: `translations.html#${item.id}`, type: '公共寫作', title: item.title, text: `${item.description} ${item.source}` }));
  credentials.credentials.forEach((item) => items.push({ id: item.id, href: `certificates.html#${item.id}`, type: '證照與獎項', title: item.title, text: `${item.issuer} ${item.category}` }));
  credentials.awards.forEach((item) => items.push({ id: item.id, href: `certificates.html#${item.id}`, type: '獎項', title: item.title, text: `${item.year} ${item.description}` }));
  research.current.forEach((item) => items.push({ id: item.id, href: `research.html#${item.id}`, type: '目前研究', title: item.title, text: item.description }));
  research.expertise.forEach((item) => items.push({ id: item.id, href: `research.html#${item.id}`, type: '研究專長', title: item.title, text: item.description }));
  education.forEach((item) => items.push({ id: item.id, href: 'about.html#education', type: '學歷', title: `${item.degreeZh} ${item.degreeEn}`, text: `${item.period} ${item.institutionParts.join(' ')}` }));
  experience.forEach((item) => items.push({ id: item.id, href: 'teaching.html', type: '教學與學術經驗', title: item.text, text: '' }));
  return items;
}

export function sitemapRoutes(routes) { return unique([...routes.map((route) => route.href), '404.html']); }
