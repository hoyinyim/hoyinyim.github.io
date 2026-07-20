import { escapeHtml, externalAttrs, groupBy, unique } from './html.mjs';

const tags = (items = []) => items.length ? `<ul class="status-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';

const educationLedger = (education) => `<ol class="education-ledger">${education.map((item) => `<li><time>${escapeHtml(item.period)}</time><div><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.institution)}</p></div></li>`).join('')}</ol>`;

export function homePage({ profile, research, experience, translations, credentials }) {
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
  return `<section class="home-intro axis-grid" aria-labelledby="home-title">
    <p class="overline">個人學術網站／中國思想研究</p>
    <h1 id="home-title"><span>${escapeHtml(profile.nameZh)}</span><small>${escapeHtml(profile.nameEn)}</small></h1>
    <div class="home-identity"><strong>${escapeHtml(profile.roleZh)}</strong><p>${escapeHtml(profile.roleEn)}</p><a class="axis-link" href="journal-papers.html">查看學術著作</a></div>
    <i class="home-axis" aria-hidden="true"></i>
  </section>
  <section class="home-topology" aria-labelledby="topology-title" data-topology>
    <h2 id="topology-title" class="visually-hidden">學術實踐拓樸：研究、服務與教學</h2>
    <p class="topology-kicker" aria-hidden="true">學術實踐／三域拓樸</p>
    <nav class="topology-canvas" aria-label="學術實踐領域">
      <a class="domain-link domain-research" href="research.html" data-topology-domain="research" aria-label="研究：前往研究頁">
        <span class="domain-label"><strong>研究</strong><small>思想與文獻</small><em>查看研究</em></span>
      </a>
      <a class="domain-link domain-service" href="translations.html" data-topology-domain="service" aria-label="服務：前往譯著與哲學普及作品頁">
        <span class="domain-label"><strong>服務</strong><small>翻譯與公共寫作</small><em>查看服務</em></span>
      </a>
      <a class="domain-link domain-teaching" href="teaching.html" data-topology-domain="teaching" aria-label="教學：前往教學頁">
        <span class="domain-label"><strong>教學</strong><small>課程與實踐</small><em>查看教學</em></span>
      </a>
      <i class="topology-axis" aria-hidden="true"></i>
    </nav>
  </section>
  <section class="home-domain-index" aria-labelledby="home-domain-index-title">
    <h2 id="home-domain-index-title" class="visually-hidden">研究、服務與教學內容索引</h2>
    <article data-domain-summary="research"><header><p>01／研究</p><h3>研究</h3></header><ol>${research.current.map((item) => `<li>${escapeHtml(item.title)}</li>`).join('')}</ol><a class="axis-link" href="research.html">完整研究資料 ↗</a></article>
    <article data-domain-summary="service"><header><p>02／服務</p><h3>服務</h3></header><ol>${serviceItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol><a class="axis-link" href="translations.html">譯著與哲學普及作品 ↗</a></article>
    <article data-domain-summary="teaching"><header><p>03／教學</p><h3>教學</h3></header><ol>${teachingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol><a class="axis-link" href="teaching.html">完整教學資料 ↗</a></article>
  </section>
  <section class="home-profile axis-grid" aria-labelledby="home-profile-title"><figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption>${escapeHtml(profile.institutionEn)}</figcaption></figure><div><p class="overline">學術簡介</p><h2 id="home-profile-title">中國思想研究</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<a class="axis-link" href="about.html">完整個人資料</a></div></section>`;
}

export function aboutPage({ profile, education }) {
  return `<section class="about-opening axis-grid" aria-labelledby="about-title"><figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption>${escapeHtml(profile.nameEn)}／${escapeHtml(profile.institutionZh)}</figcaption></figure><div><p class="overline">關於／學術簡介</p><h1 id="about-title">${escapeHtml(profile.nameZh)}</h1><p class="about-role">${escapeHtml(profile.roleZh)}</p><p class="about-role-en">${escapeHtml(profile.roleEn)}</p></div></section>
  <section class="about-biography axis-grid" aria-labelledby="biography-title"><h2 id="biography-title">學術簡介</h2><div>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></section>
  <section class="about-education axis-grid" id="education" aria-labelledby="about-education-title"><header><p class="overline">教育背景／2016年至今</p><h2 id="about-education-title">教育背景</h2></header>${educationLedger(education)}</section>
  <nav class="next-links" aria-label="延伸閱讀"><a href="research.html">研究 <span>研究方向</span></a><a href="cv.html">履歷 <span>完整經歷</span></a><a href="contact.html">聯絡 <span>學術通信</span></a></nav>`;
}

export function researchPage({ research }) {
  return `<header class="research-opening axis-grid"><p class="overline">研究／中國思想</p><h1>研究</h1><div><strong>${research.current.length} 項研究重點</strong><p>${research.tags.map(escapeHtml).join('／')}</p></div></header>
  <section class="research-focus-list" aria-labelledby="research-focus-title"><h2 id="research-focus-title" class="visually-hidden">目前研究方向</h2>${research.current.map((item, index) => `<article class="focus-${index + 1} axis-grid"><p class="focus-number">0${index + 1}</p><p class="overline">目前研究重點</p><h3>${escapeHtml(item.title)}</h3><p class="focus-copy">${escapeHtml(item.description)}</p></article>`).join('')}</section>
  <section class="research-matrix-section" aria-labelledby="research-matrix-title"><header class="section-index"><p>研究矩陣</p><h2 id="research-matrix-title">研究專長</h2></header><div class="expertise-matrix">${research.expertise.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>`;
}

export function journalPage({ publications, pageIntros }) {
  const groups = groupBy(publications, 'year');
  const years = unique(publications.map((item) => item.year));
  const filters = [{ id: 'all', label: '全部' }, { id: 'forthcoming', label: '待刊' }, ...years.map((year) => ({ id: year, label: year })), { id: 'thci', label: 'THCI' }];
  const entries = years.map((year) => `<section class="publication-year" id="year-${year}" data-publication-year><header><h2>${year}</h2><p>${groups[year].length} 筆</p></header><ol>${groups[year].map((pub) => `<li class="publication-entry" data-publication data-filters="${escapeHtml(pub.filter.join(' '))}"><article><p class="publication-venue">${escapeHtml(pub.venue)}</p><h3>${escapeHtml(pub.title)}</h3><p class="publication-meta">${escapeHtml(pub.meta)}</p>${tags(pub.tags)}<div class="entry-actions">${pub.link ? `<a href="${pub.link}" ${externalAttrs}>電子全文 ↗</a>` : '<span>全文連結待補</span>'}<button type="button" data-copy="${escapeHtml(pub.cite)}">複製引用</button></div><details><summary>引用格式</summary><p>${escapeHtml(pub.cite)}</p></details></article></li>`).join('')}</ol></section>`).join('');
  return `<header class="journal-opening axis-grid"><p class="overline">期刊論文／書目檔案</p><h1>期刊論文</h1><div><strong>${publications.length} 筆著作</strong><p>${escapeHtml(pageIntros.journal.lead)}</p></div></header><div class="archive-toolbar" id="journal-top"><p>篩選</p><div class="filter-strip" role="group" aria-label="篩選期刊論文">${filters.map((filter, index) => `<button type="button" data-publication-filter="${filter.id}" aria-pressed="${index === 0}">${escapeHtml(filter.label)}</button>`).join('')}</div><p><span data-publication-count>${publications.length}</span> 筆書目</p></div><div class="publication-archive" data-publication-archive>${entries}</div>`;
}

export function conferencePage({ conferences, pageIntros }) {
  const groups = groupBy(conferences.presentations, 'year');
  return `<header class="conference-opening axis-grid"><p class="overline">研討會論文／學術發表</p><h1>研討會論文</h1><div><strong>${conferences.published.length} 篇已出版／${conferences.presentations.length} 次發表</strong><p>${escapeHtml(pageIntros.conference.lead)}</p></div></header>
  <section class="conference-published" aria-labelledby="published-title"><header class="section-index"><p>已出版論文集</p><h2 id="published-title">研討會論文集（已出版）</h2></header>${conferences.published.map((item) => `<article><p class="publication-venue">${escapeHtml(item.venue)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.meta)}</p><a href="${item.link}" ${externalAttrs}>電子全文 ↗</a></article>`).join('')}</section>
  <section class="conference-ledger" aria-labelledby="presentations-title"><header class="section-index"><p>學術發表</p><h2 id="presentations-title">研討會發表</h2></header>${Object.entries(groups).map(([year, items]) => `<section class="conference-year"><h3>${escapeHtml(year)}</h3><ol>${items.map((item) => `<li><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.meta)}</p></li>`).join('')}</ol></section>`).join('')}</section>`;
}

export function translationsPage({ translations, pageIntros }) {
  const { translation, publicWriting } = translations;
  const latest = publicWriting.slice(0, 3);
  const archive = publicWriting.slice(3);
  return `<header class="translations-opening axis-grid"><p class="overline">譯著／公共哲學</p><h1>譯著／<br>哲學普及作品</h1><p>${escapeHtml(pageIntros.translations.lead)}</p></header>
  <section class="translation-feature" aria-labelledby="translation-title"><figure><img src="${translation.cover}" width="500" height="700" loading="lazy" decoding="async" alt="${escapeHtml(translation.coverAlt)}"></figure><div><p class="overline">書籍翻譯／2024</p><h2 id="translation-title">${escapeHtml(translation.title)}</h2><p class="original-title">${escapeHtml(translation.originalTitle)}</p><dl><div><dt>作者</dt><dd>${escapeHtml(translation.author)}</dd></div><div><dt>譯者</dt><dd>${escapeHtml(translation.translator)}</dd></div><div><dt>出版社</dt><dd>${escapeHtml(translation.publisher)}</dd></div><div><dt>出版日</dt><dd>${escapeHtml(translation.publicationDate)}</dd></div></dl><p>${escapeHtml(translation.description)}</p><a class="axis-link" href="${translation.link}" ${externalAttrs}>前往出版社 ↗</a></div></section>
  <section class="latest-writing" aria-labelledby="latest-writing-title"><header class="section-index"><p>最新公共寫作</p><h2 id="latest-writing-title">最新公共寫作</h2></header><div>${latest.map((item) => `<article><p>${escapeHtml(item.source)}</p><h3><a href="${item.link}" ${externalAttrs}>${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div></section>
  <section class="writing-index" aria-labelledby="writing-index-title"><header class="section-index"><p>完整索引</p><h2 id="writing-index-title">作品索引</h2></header><ol>${archive.map((item) => `<li><p>${escapeHtml(item.source)}</p><h3><a href="${item.link}" ${externalAttrs}>${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.description)}</p></li>`).join('')}</ol></section>`;
}

export function certificatesPage({ credentials, pageIntros }) {
  return `<header class="credentials-opening axis-grid"><p class="overline">證照／榮譽</p><h1>證照、證書<br>與獎項</h1><p>${escapeHtml(pageIntros.certificates.lead)}</p></header>
  <section class="credential-ledger" aria-labelledby="credentials-title"><header class="section-index"><p>專業資格</p><h2 id="credentials-title">專業證照與證書</h2></header><ol>${credentials.credentials.map((item) => `<li><p>${escapeHtml(item.category)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.issuer)}</p></li>`).join('')}</ol></section>
  <section class="award-timeline" aria-labelledby="awards-title"><header class="section-index"><p>學術榮譽</p><h2 id="awards-title">學業與研究獎項</h2></header><ol>${credentials.awards.map((item) => `<li><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`).join('')}</ol><p class="archive-note">${escapeHtml(pageIntros.certificates.closing)}</p></section>`;
}

export function teachingPage({ experience }) {
  const [teaching, ...practice] = experience;
  return `<header class="teaching-opening axis-grid"><p class="overline">教學／學術實踐</p><h1>教學</h1><p>教學工作與學術、翻譯及公共實踐紀錄。</p></header><section class="teaching-primary axis-grid" aria-labelledby="teaching-title"><p class="overline">教學經驗</p><h2 id="teaching-title">實際教學經驗</h2><article><p>${escapeHtml(teaching.text)}</p></article></section><section class="practice-ledger" aria-labelledby="practice-title"><header class="section-index"><p>學術與專業實踐</p><h2 id="practice-title">學術與專業實踐</h2></header><ol>${practice.map((item) => `<li><p>${escapeHtml(item.text)}</p></li>`).join('')}</ol><a class="axis-link" href="certificates.html">查看專業證照與獎項 ↗</a></section>`;
}

const cvList = (items, render) => `<ol class="cv-list">${items.map(render).join('')}</ol>`;
export function cvPage({ profile, education, experience, research, publications, conferences, translations, credentials }) {
  const translationItems = [translations.translation, ...translations.publicWriting];
  const sections = [['cv-profile', '個人資料'], ['cv-education', '教育'], ['cv-experience', '職歷與教學'], ['cv-research', '研究領域'], ['cv-journal', '期刊論文'], ['cv-conference', '研討會論文'], ['cv-translations', '譯著與公共寫作'], ['cv-projects', '研究計畫'], ['cv-credentials', '證照與獎項']];
  return `<header class="cv-header"><p class="overline">個人履歷</p><h1>${escapeHtml(profile.nameZh)} <span>${escapeHtml(profile.nameEn)}</span></h1><div><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><a href="downloads/yim-ho-yin-cv.pdf" download>下載 PDF</a><button type="button" data-print-cv>列印／儲存 PDF</button></div></header><div class="cv-layout"><nav class="cv-index" aria-label="履歷頁內索引">${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav><div class="cv-document">
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
  return `<section class="contact-scene axis-grid" aria-labelledby="contact-title"><p class="overline">聯絡／學術通信</p><h1 id="contact-title">聯絡</h1><div class="contact-identity"><strong>${escapeHtml(profile.nameZh)}／${escapeHtml(profile.nameEn)}</strong><p>${escapeHtml(profile.roleZh)}</p><p>${escapeHtml(profile.institutionZh)}</p></div><a class="contact-email" href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><div class="contact-actions"><a href="mailto:${escapeHtml(profile.email)}">撰寫郵件</a><button type="button" data-copy="${escapeHtml(profile.email)}">複製 Email</button></div></section>`;
}

export function notFoundPage() {
  return `<section class="not-found axis-grid"><p class="overline">錯誤／404</p><h1>找不到頁面</h1><p>指定頁面不存在或已移動。您可以返回首頁，或搜尋全站公開資料。</p><div><a href="index.html">返回首頁</a><button type="button" data-search-open>搜尋全站</button></div></section>`;
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
