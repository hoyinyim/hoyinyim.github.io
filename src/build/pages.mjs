import { escapeHtml, externalAttrs, groupBy, unique } from './html.mjs';

const tags = (items = []) => items.length ? `<ul class="status-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';

const educationLedger = (education) => `<ol class="education-ledger">${education.map((item) => `<li><time>${escapeHtml(item.period)}</time><div><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.institution)}</p></div></li>`).join('')}</ol>`;

export function homePage({ profile, research, education }) {
  return `<section class="home-intro axis-grid" aria-labelledby="home-title">
    <p class="overline">Academic Profile / Chinese Thought</p>
    <h1 id="home-title"><span>${escapeHtml(profile.nameZh)}</span><small>${escapeHtml(profile.nameEn)}</small></h1>
    <div class="home-identity"><strong>${escapeHtml(profile.roleZh)}</strong><p>${escapeHtml(profile.roleEn)}</p><a class="axis-link" href="journal-papers.html">View publications</a></div>
    <i class="home-axis" aria-hidden="true"></i>
  </section>
  <section class="home-profile axis-grid" aria-labelledby="home-profile-title"><figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption>${escapeHtml(profile.institutionEn)}</figcaption></figure><div><p class="overline">Profile</p><h2 id="home-profile-title">中國思想研究</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<a class="axis-link" href="about.html">完整個人資料</a></div></section>
  <section class="home-portals" aria-labelledby="home-portals-title"><header class="section-index"><p>Selected Archives</p><h2 id="home-portals-title">學術成果</h2></header><div class="portal-grid">${profile.quickLinks.map((item) => `<a href="${item.href}"><span>${escapeHtml(item.id)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><small>Open archive ↗</small></a>`).join('')}</div></section>
  <section class="home-focus axis-grid" aria-labelledby="home-focus-title"><header><p class="overline">Current Research</p><h2 id="home-focus-title">目前研究</h2></header><div>${research.current.map((item, index) => `<article><span>0${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>
  <section class="home-expertise" aria-labelledby="home-expertise-title"><header class="section-index"><p>Research Matrix</p><h2 id="home-expertise-title">研究專長</h2></header><div class="expertise-matrix">${research.expertise.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>
  <section class="home-education axis-grid" aria-labelledby="home-education-title"><header><p class="overline">Education</p><h2 id="home-education-title">教育背景</h2></header>${educationLedger(education)}</section>`;
}

export function aboutPage({ profile, education }) {
  return `<section class="about-opening axis-grid" aria-labelledby="about-title"><figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption>${escapeHtml(profile.nameEn)} / ${escapeHtml(profile.institutionZh)}</figcaption></figure><div><p class="overline">About / Academic Profile</p><h1 id="about-title">${escapeHtml(profile.nameZh)}</h1><p class="about-role">${escapeHtml(profile.roleZh)}</p><p class="about-role-en">${escapeHtml(profile.roleEn)}</p></div></section>
  <section class="about-biography axis-grid" aria-labelledby="biography-title"><h2 id="biography-title">學術簡介</h2><div>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></section>
  <section class="about-education axis-grid" id="education" aria-labelledby="about-education-title"><header><p class="overline">Education / 2016—Present</p><h2 id="about-education-title">教育背景</h2></header>${educationLedger(education)}</section>
  <nav class="next-links" aria-label="延伸閱讀"><a href="research.html">Research <span>研究</span></a><a href="cv.html">CV <span>履歷</span></a><a href="contact.html">Contact <span>聯絡</span></a></nav>`;
}

export function researchPage({ research }) {
  return `<header class="research-opening axis-grid"><p class="overline">Research / Chinese Thought</p><h1>研究</h1><div><strong>${research.current.length} Focus Areas</strong><p>${research.tags.map(escapeHtml).join('／')}</p></div></header>
  <section class="research-focus-list" aria-labelledby="research-focus-title"><h2 id="research-focus-title" class="visually-hidden">目前研究方向</h2>${research.current.map((item, index) => `<article class="focus-${index + 1} axis-grid"><p class="focus-number">0${index + 1}</p><p class="overline">Current Focus</p><h3>${escapeHtml(item.title)}</h3><p class="focus-copy">${escapeHtml(item.description)}</p></article>`).join('')}</section>
  <section class="research-matrix-section" aria-labelledby="research-matrix-title"><header class="section-index"><p>Research Matrix</p><h2 id="research-matrix-title">研究專長</h2></header><div class="expertise-matrix">${research.expertise.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>`;
}

export function journalPage({ publications, pageIntros }) {
  const groups = groupBy(publications, 'year');
  const years = unique(publications.map((item) => item.year));
  const filters = [{ id: 'all', label: '全部' }, { id: 'forthcoming', label: '待刊' }, ...years.map((year) => ({ id: year, label: year })), { id: 'thci', label: 'THCI' }];
  const entries = years.map((year) => `<section class="publication-year" id="year-${year}" data-publication-year><header><h2>${year}</h2><p>${groups[year].length} entries</p></header><ol>${groups[year].map((pub) => `<li class="publication-entry" data-publication data-filters="${escapeHtml(pub.filter.join(' '))}"><article><p class="publication-venue">${escapeHtml(pub.venue)}</p><h3>${escapeHtml(pub.title)}</h3><p class="publication-meta">${escapeHtml(pub.meta)}</p>${tags(pub.tags)}<div class="entry-actions">${pub.link ? `<a href="${pub.link}" ${externalAttrs}>電子全文 ↗</a>` : '<span>全文連結待補</span>'}<button type="button" data-copy="${escapeHtml(pub.cite)}">複製引用</button></div><details><summary>引用格式</summary><p>${escapeHtml(pub.cite)}</p></details></article></li>`).join('')}</ol></section>`).join('');
  return `<header class="journal-opening axis-grid"><p class="overline">Journal-led Bibliography</p><h1>期刊論文</h1><div><strong>${publications.length} Entries</strong><p>${escapeHtml(pageIntros.journal.lead)}</p></div></header><div class="archive-toolbar" id="journal-top"><p>Filter</p><div class="filter-strip" role="group" aria-label="篩選期刊論文">${filters.map((filter, index) => `<button type="button" data-publication-filter="${filter.id}" aria-pressed="${index === 0}">${escapeHtml(filter.label)}</button>`).join('')}</div><p><span data-publication-count>${publications.length}</span> 筆書目</p></div><div class="publication-archive" data-publication-archive>${entries}</div>`;
}

export function conferencePage({ conferences, pageIntros }) {
  const groups = groupBy(conferences.presentations, 'year');
  return `<header class="conference-opening axis-grid"><p class="overline">Conference Papers / Presentations</p><h1>研討會論文</h1><div><strong>${conferences.published.length} Published / ${conferences.presentations.length} Presented</strong><p>${escapeHtml(pageIntros.conference.lead)}</p></div></header>
  <section class="conference-published" aria-labelledby="published-title"><header class="section-index"><p>Published Proceedings</p><h2 id="published-title">研討會論文集（已出版）</h2></header>${conferences.published.map((item) => `<article><p class="publication-venue">${escapeHtml(item.venue)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.meta)}</p><a href="${item.link}" ${externalAttrs}>電子全文 ↗</a></article>`).join('')}</section>
  <section class="conference-ledger" aria-labelledby="presentations-title"><header class="section-index"><p>Academic Presentations</p><h2 id="presentations-title">研討會發表</h2></header>${Object.entries(groups).map(([year, items]) => `<section class="conference-year"><h3>${escapeHtml(year)}</h3><ol>${items.map((item) => `<li><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.meta)}</p></li>`).join('')}</ol></section>`).join('')}</section>`;
}

export function translationsPage({ translations, pageIntros }) {
  const { translation, publicWriting } = translations;
  const latest = publicWriting.slice(0, 3);
  const archive = publicWriting.slice(3);
  return `<header class="translations-opening axis-grid"><p class="overline">Translations / Public Philosophy</p><h1>譯著／<br>哲學普及作品</h1><p>${escapeHtml(pageIntros.translations.lead)}</p></header>
  <section class="translation-feature" aria-labelledby="translation-title"><figure><img src="${translation.cover}" width="500" height="700" loading="lazy" decoding="async" alt="${escapeHtml(translation.coverAlt)}"></figure><div><p class="overline">Book Translation / 2024</p><h2 id="translation-title">${escapeHtml(translation.title)}</h2><p class="original-title">${escapeHtml(translation.originalTitle)}</p><dl><div><dt>作者</dt><dd>${escapeHtml(translation.author)}</dd></div><div><dt>譯者</dt><dd>${escapeHtml(translation.translator)}</dd></div><div><dt>出版社</dt><dd>${escapeHtml(translation.publisher)}</dd></div><div><dt>出版日</dt><dd>${escapeHtml(translation.publicationDate)}</dd></div></dl><p>${escapeHtml(translation.description)}</p><a class="axis-link" href="${translation.link}" ${externalAttrs}>前往出版社 ↗</a></div></section>
  <section class="latest-writing" aria-labelledby="latest-writing-title"><header class="section-index"><p>Latest Public Writing</p><h2 id="latest-writing-title">最新公共寫作</h2></header><div>${latest.map((item) => `<article><p>${escapeHtml(item.source)}</p><h3><a href="${item.link}" ${externalAttrs}>${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>
  <section class="writing-index" aria-labelledby="writing-index-title"><header class="section-index"><p>Complete Index</p><h2 id="writing-index-title">作品索引</h2></header><ol>${archive.map((item) => `<li><p>${escapeHtml(item.source)}</p><h3><a href="${item.link}" ${externalAttrs}>${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></li>`).join('')}</ol></section>`;
}

export function certificatesPage({ credentials, pageIntros }) {
  return `<header class="credentials-opening axis-grid"><p class="overline">Credentials / Honors</p><h1>證照、證書<br>與獎項</h1><p>${escapeHtml(pageIntros.certificates.lead)}</p></header>
  <section class="credential-ledger" aria-labelledby="credentials-title"><header class="section-index"><p>Professional Credentials</p><h2 id="credentials-title">專業證照與證書</h2></header><ol>${credentials.credentials.map((item) => `<li><p>${escapeHtml(item.category)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.issuer)}</p></li>`).join('')}</ol></section>
  <section class="award-timeline" aria-labelledby="awards-title"><header class="section-index"><p>Academic Honors</p><h2 id="awards-title">學業與研究獎項</h2></header><ol>${credentials.awards.map((item) => `<li><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`).join('')}</ol><p class="archive-note">${escapeHtml(pageIntros.certificates.closing)}</p></section>`;
}

export function teachingPage({ experience }) {
  const [teaching, ...practice] = experience;
  return `<header class="teaching-opening axis-grid"><p class="overline">Teaching / Academic Practice</p><h1>教學</h1><p>教學工作與學術、翻譯及公共實踐紀錄。</p></header><section class="teaching-primary axis-grid" aria-labelledby="teaching-title"><p class="overline">Teaching</p><h2 id="teaching-title">實際教學經驗</h2><article><p>${escapeHtml(teaching.text)}</p></article></section><section class="practice-ledger" aria-labelledby="practice-title"><header class="section-index"><p>Academic / Professional Practice</p><h2 id="practice-title">學術與專業實踐</h2></header><ol>${practice.map((item) => `<li><p>${escapeHtml(item.text)}</p></li>`).join('')}</ol><a class="axis-link" href="certificates.html">查看專業證照與獎項 ↗</a></section>`;
}

const cvList = (items, render) => `<ol class="cv-list">${items.map(render).join('')}</ol>`;
export function cvPage({ profile, education, experience, research, publications, conferences, translations, credentials }) {
  const translationItems = [translations.translation, ...translations.publicWriting];
  const sections = [['cv-profile', '個人資料'], ['cv-education', '教育'], ['cv-experience', '職歷與教學'], ['cv-research', '研究領域'], ['cv-journal', '期刊論文'], ['cv-conference', '研討會論文'], ['cv-translations', '譯著與公共寫作'], ['cv-projects', '研究計畫'], ['cv-credentials', '證照與獎項']];
  return `<header class="cv-header"><p class="overline">Curriculum Vitae</p><h1>${escapeHtml(profile.nameZh)} <span>${escapeHtml(profile.nameEn)}</span></h1><div><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><a href="downloads/yim-ho-yin-cv.pdf" download>下載 PDF</a><button type="button" data-print-cv>列印／儲存 PDF</button></div></header><div class="cv-layout"><nav class="cv-index" aria-label="履歷頁內索引">${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav><div class="cv-document">
    <section id="cv-profile"><h2>個人資料</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>
    <section id="cv-education"><h2>教育</h2>${cvList(education, (item) => `<li><time>${escapeHtml(item.period)}</time><div><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.institution)}</p></div></li>`)}</section>
    <section id="cv-experience"><h2>職歷與教學</h2>${cvList(experience, (item) => `<li><span></span><p>${escapeHtml(item.text)}</p></li>`)}</section>
    <section id="cv-research"><h2>研究領域</h2>${cvList(research.expertise, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`)}</section>
    <section id="cv-journal"><h2>期刊論文</h2>${cvList(publications, (item) => `<li><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue)}　${escapeHtml(item.meta)}</p>${tags(item.tags)}</div></li>`)}</section>
    <section id="cv-conference"><h2>研討會論文</h2>${cvList([...conferences.published, ...conferences.presentations], (item) => `<li><time>${escapeHtml(item.year || '')}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue || '')}${item.venue ? '　' : ''}${escapeHtml(item.meta)}</p></div></li>`)}</section>
    <section id="cv-translations"><h2>譯著與公共寫作</h2>${cvList(translationItems, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || item.originalTitle || '')}</p><small>${escapeHtml(item.source || item.publisher || '')}</small></div></li>`)}</section>
    <section id="cv-projects"><h2>研究計畫</h2>${cvList(research.current, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`)}</section>
    <section id="cv-credentials"><h2>證照與獎項</h2>${cvList([...credentials.credentials, ...credentials.awards], (item) => `<li><time>${escapeHtml(item.year || '')}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.issuer || item.description || '')}</p></div></li>`)}</section>
  </div></div>`;
}

export function contactPage({ profile }) {
  return `<section class="contact-scene axis-grid" aria-labelledby="contact-title"><p class="overline">Contact / Academic Correspondence</p><h1 id="contact-title">聯絡</h1><div class="contact-identity"><strong>${escapeHtml(profile.nameZh)} / ${escapeHtml(profile.nameEn)}</strong><p>${escapeHtml(profile.roleZh)}</p><p>${escapeHtml(profile.institutionZh)}</p></div><a class="contact-email" href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><div class="contact-actions"><a href="mailto:${escapeHtml(profile.email)}">撰寫郵件</a><button type="button" data-copy="${escapeHtml(profile.email)}">複製 Email</button></div></section>`;
}

export function notFoundPage() {
  return `<section class="not-found axis-grid"><p class="overline">Error / 404</p><h1>找不到頁面</h1><p>指定頁面不存在或已移動。您可以返回首頁，或搜尋全站公開資料。</p><div><a href="index.html">返回首頁</a><button type="button" data-search-open>搜尋全站</button></div></section>`;
}

export function searchIndex(data) {
  const { routes, publications, conferences, translations, credentials, research, education, experience } = data;
  const items = routes.map((route) => ({ id: `route-${route.id}`, href: route.href, type: '頁面', title: route.labelZh, text: route.labelEn }));
  publications.forEach((item) => items.push({ id: item.id, href: `journal-papers.html#year-${item.year}`, type: '期刊論文', title: item.title, text: `${item.venue} ${item.meta} ${item.tags.join(' ')}` }));
  conferences.published.forEach((item) => items.push({ id: item.id, href: 'conference-papers.html', type: '已出版研討會論文', title: item.title, text: `${item.venue} ${item.meta}` }));
  conferences.presentations.forEach((item) => items.push({ id: item.id, href: 'conference-papers.html', type: '研討會發表', title: item.title, text: item.meta }));
  items.push({ id: translations.translation.id, href: 'translations.html', type: '譯著', title: translations.translation.title, text: `${translations.translation.originalTitle} ${translations.translation.author} ${translations.translation.publisher}` });
  translations.publicWriting.forEach((item) => items.push({ id: item.id, href: 'translations.html', type: '哲學普及作品', title: item.title, text: `${item.description} ${item.source}` }));
  credentials.credentials.forEach((item) => items.push({ id: item.id, href: 'certificates.html', type: '證照／證書', title: item.title, text: `${item.issuer} ${item.category}` }));
  credentials.awards.forEach((item) => items.push({ id: item.id, href: 'certificates.html', type: '獎項', title: item.title, text: `${item.year} ${item.description}` }));
  research.current.forEach((item) => items.push({ id: item.id, href: 'research.html', type: '目前研究', title: item.title, text: item.description }));
  research.expertise.forEach((item) => items.push({ id: item.id, href: 'research.html', type: '研究專長', title: item.title, text: item.description }));
  education.forEach((item) => items.push({ id: item.id, href: 'about.html#education', type: '學歷', title: item.degree, text: `${item.period} ${item.institution}` }));
  experience.forEach((item) => items.push({ id: item.id, href: 'teaching.html', type: '教學與學術經驗', title: item.text, text: '' }));
  return items;
}

export function sitemapRoutes(routes) { return unique([...routes.map((route) => route.href), '404.html']); }
