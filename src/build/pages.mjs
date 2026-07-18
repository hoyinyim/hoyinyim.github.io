import { escapeHtml, externalAttrs, groupBy, number, unique } from './html.mjs';
import { pageHero } from './components.mjs';

const sectionHeading = (kicker, title, note = '') => `<header class="section-heading"><p>${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2>${note ? `<span>${escapeHtml(note)}</span>` : ''}</header>`;

const educationTimeline = (education, id = 'education-timeline') => `<div class="education-timeline" data-timeline id="${id}">
  <div class="timeline-tabs" role="tablist" aria-label="教育背景年份">
    ${education.map((item, index) => `<button type="button" role="tab" id="${id}-tab-${index}" aria-controls="${id}-panel-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-timeline-tab="${index}"><span>${escapeHtml(item.period)}</span><small>${number(index + 1)}</small></button>`).join('')}
  </div>
  <div class="timeline-panels">
    ${education.map((item, index) => `<article role="tabpanel" id="${id}-panel-${index}" aria-labelledby="${id}-tab-${index}"${index ? ' hidden' : ''} data-timeline-panel="${index}">
      <div class="timeline-mark">${item.logo ? `<img src="${item.logo}" width="529" height="532" loading="lazy" decoding="async" alt="國立成功大學校徽">` : `<span aria-hidden="true">${number(index + 1)}</span>`}</div>
      <p>${escapeHtml(item.period)}</p><h3>${escapeHtml(item.degree)}</h3><div>${escapeHtml(item.institution)}</div>
    </article>`).join('')}
  </div>
</div>`;

const researchCurrent = (items, heading = '目前研究方向') => `<section class="research-sequence" aria-labelledby="research-current-title">
  ${sectionHeading('Current Research', heading, `${number(items.length)} ITEMS`)}
  <ol>${items.map((item, index) => `<li><span>${number(index + 1)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`).join('')}</ol>
</section>`;

const researchIndex = (items) => `<section class="research-index" aria-labelledby="research-index-title">
  ${sectionHeading('Research Index', '研究專長', `${number(items.length)} FIELDS`)}
  <ol>${items.map((item, index) => `<li tabindex="0"><span>${number(index + 1)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></li>`).join('')}</ol>
</section>`;

export function homePage(data) {
  const { profile, research, education, experience, routes } = data;
  const portalItems = profile.quickLinks.map((item) => ({ ...item, route: routes.find((route) => route.href === item.href) }));
  return `<section class="home-hero" aria-labelledby="home-title">
    <div class="home-hero-copy">
      <p class="eyebrow">Academic Profile · Chinese Thought</p>
      <h1 id="home-title"><span>${escapeHtml(profile.nameZh)}</span><small>${escapeHtml(profile.nameEn)}</small></h1>
      <p class="home-role">${escapeHtml(profile.roleZh)}</p>
      <p class="home-role-en">${escapeHtml(profile.roleEn)}</p>
      <div class="home-actions"><a href="journal-papers.html">查看期刊論文</a><a href="conference-papers.html" data-conference-cta>查看研討會論文</a><a href="mailto:${escapeHtml(profile.email)}">聯繫方式</a></div>
    </div>
    <div class="home-material" aria-hidden="true"><i></i><i></i><i></i><span>01</span></div>
    <a class="scroll-cue" href="#profile">向下閱讀 <span aria-hidden="true">↓</span></a>
  </section>
  <section class="profile-diptych" id="profile" aria-labelledby="profile-title">
    <figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption>${escapeHtml(profile.institutionZh)}</figcaption></figure>
    <div class="profile-copy">${sectionHeading('Academic Profile', '個人學術檔案')}<h2 id="profile-title" class="sr-only">個人學術檔案</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<div class="profile-tags">${research.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div>
  </section>
  <section class="publication-portal" aria-labelledby="portal-title">
    ${sectionHeading('Selected Portals', '學術成果與榮譽', '04 ARCHIVES')}
    <div class="portal-shelf">${portalItems.map((item) => `<a href="${item.href}"><span>${escapeHtml(item.id)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><small>${escapeHtml(item.route?.labelEn || '')} ↗</small></a>`).join('')}</div>
  </section>
  ${researchCurrent(research.current)}
  ${researchIndex(research.expertise)}
  <section class="education-section" aria-labelledby="education-title">${sectionHeading('Education', '教育背景', '2016—迄今')}<h2 id="education-title" class="sr-only">教育背景</h2>${educationTimeline(education, 'home-education')}</section>
  <section class="experience-ledger" aria-labelledby="experience-title">${sectionHeading('Experience Ledger', '教學與學術經驗', `${number(experience.length)} RECORDS`)}<h2 id="experience-title" class="sr-only">教學與學術經驗</h2><ol>${experience.map((item, index) => `<li><span>${number(index + 1)}</span><p>${escapeHtml(item.text)}</p></li>`).join('')}</ol></section>`;
}

export function aboutPage({ profile, education }) {
  return `${pageHero({ eyebrow: 'About · Academic Profile', title: '關於', index: '02' })}
  <section class="about-profile" aria-labelledby="about-name"><div class="about-margin" aria-hidden="true">PROFILE<br>02—11</div><figure><img src="${profile.portrait}" width="523" height="648" decoding="async" alt="${escapeHtml(profile.portraitAlt)}"><figcaption>${escapeHtml(profile.nameEn)}</figcaption></figure><div><p class="eyebrow">${escapeHtml(profile.institutionEn)}</p><h2 id="about-name">${escapeHtml(profile.nameZh)}</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div></section>
  <section class="education-section about-education">${sectionHeading('Education', '教育背景', '2016—迄今')}${educationTimeline(education, 'about-timeline')}</section>
  <nav class="next-links" aria-label="延伸閱讀"><a href="research.html"><span>01</span>研究</a><a href="cv.html"><span>02</span>履歷</a><a href="contact.html"><span>03</span>聯絡</a></nav>`;
}

export function researchPage({ research }) {
  return `${pageHero({ eyebrow: 'Research · Chinese Thought', title: '研究', index: '03' })}${researchCurrent(research.current)}${researchIndex(research.expertise)}`;
}

export function journalPage({ publications, pageIntros }) {
  const groups = groupBy(publications, 'year');
  const years = Object.keys(groups);
  const entries = years.map((year) => `<section class="publication-year" id="year-${year}" data-publication-year>
    <header><p>Year</p><h2>${year}</h2><a href="#journal-top">返回篩選 ↑</a></header>
    <ol>${groups[year].map((pub, index) => `<li class="publication-entry" data-publication data-filters="${escapeHtml(pub.filter.join(' '))}">
      <article><span class="entry-index">${number(index + 1)}</span><div class="publication-main"><h3>${escapeHtml(pub.title)}</h3><p class="publication-venue">${escapeHtml(pub.venue)}</p><p class="publication-meta">${escapeHtml(pub.meta)}</p>${pub.tags.length ? `<ul class="status-list">${pub.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>` : ''}<div class="entry-actions">${pub.link ? `<a href="${pub.link}" ${externalAttrs}>電子全文 <span aria-hidden="true">↗</span></a>` : ''}<button type="button" data-copy="${escapeHtml(pub.cite)}">複製引用</button></div><details><summary>引用格式</summary><p>${escapeHtml(pub.cite)}</p></details></div></article>
    </li>`).join('')}</ol>
  </section>`).join('');
  const filters = [{ id: 'all', label: '全部' }, { id: 'forthcoming', label: '待刊' }, ...years.map((year) => ({ id: year, label: year })), { id: 'thci', label: 'THCI' }];
  return `${pageHero({ eyebrow: 'Journal Articles · Bibliography', title: '期刊論文', index: '04', lead: pageIntros.journal.lead })}
  <div class="archive-toolbar" id="journal-top"><div class="filter-strip" role="group" aria-label="篩選期刊論文">${filters.map((filter, index) => `<button type="button" data-publication-filter="${filter.id}" aria-pressed="${index === 0}">${escapeHtml(filter.label)}</button>`).join('')}</div><p><span data-publication-count>${publications.length}</span> 筆書目</p></div>
  <div class="publication-archive" data-publication-archive>${entries}</div>`;
}

export function conferencePage({ conferences, pageIntros }) {
  const groups = groupBy(conferences.presentations, 'year');
  return `${pageHero({ eyebrow: 'Conference Papers · Presentations', title: '研討會論文', index: '05', lead: pageIntros.conference.lead })}
  <section class="conference-published" aria-labelledby="published-title">${sectionHeading('Published Proceedings', '研討會論文集（已出版）', `${number(conferences.published.length)} PAPERS`)}<div class="published-diptych">${conferences.published.map((item, index) => `<article><span>${number(index + 1)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue)}</p><p>${escapeHtml(item.meta)}</p><a href="${item.link}" ${externalAttrs}>電子全文 <span aria-hidden="true">↗</span></a></article>`).join('')}</div></section>
  <section class="conference-ledger" aria-labelledby="presentations-title">${sectionHeading('Academic Presentations', '研討會發表', `${number(conferences.presentations.length)} RECORDS`)}<h2 id="presentations-title" class="sr-only">研討會發表</h2>${Object.entries(groups).map(([year, items]) => `<section class="conference-year"><h3>${escapeHtml(year)}</h3><ol>${items.map((item, index) => `<li><span>${number(index + 1)}</span><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.meta)}</p></li>`).join('')}</ol></section>`).join('')}</section>`;
}

export function translationsPage({ translations, pageIntros }) {
  const { translation, publicWriting } = translations;
  return `${pageHero({ eyebrow: 'Translations · Public Philosophy', title: '譯著／哲學普及作品', index: '06', lead: pageIntros.translations.lead })}
  <p class="page-intro-note">${escapeHtml(pageIntros.translations.note)}</p>
  <section class="translation-feature" aria-labelledby="translation-title"><figure><img src="${translation.cover}" width="500" height="700" loading="lazy" decoding="async" alt="${escapeHtml(translation.coverAlt)}"></figure><div><p class="eyebrow">Book Translation</p><h2 id="translation-title">${escapeHtml(translation.title)}</h2><p class="original-title">${escapeHtml(translation.originalTitle)}</p><dl><div><dt>作者</dt><dd>${escapeHtml(translation.author)}</dd></div><div><dt>譯者</dt><dd>${escapeHtml(translation.translator)}</dd></div><div><dt>出版社</dt><dd>${escapeHtml(translation.publisher)}</dd></div><div><dt>出版日</dt><dd>${escapeHtml(translation.publicationDate)}</dd></div></dl><p>${escapeHtml(translation.description)}</p><a href="${translation.link}" ${externalAttrs}>前往五南圖書 <span aria-hidden="true">↗</span></a></div></section>
  <section class="public-writing" aria-labelledby="public-writing-title">${sectionHeading('Public Writing Archive', '哲學普及作品', `${number(publicWriting.length)} WORKS`)}<h2 id="public-writing-title" class="sr-only">哲學普及作品</h2><div class="scroll-controls"><button type="button" data-scroll-archive="previous" aria-label="向前瀏覽作品">←</button><button type="button" data-scroll-archive="next" aria-label="向後瀏覽作品">→</button></div><ol data-horizontal-archive tabindex="0" aria-label="哲學普及作品橫向索引">${publicWriting.map((item, index) => `<li><article><span>${number(index + 1)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><footer><small>${escapeHtml(item.source)}</small><a href="${item.link}" ${externalAttrs}>閱讀 <span aria-hidden="true">↗</span></a></footer></article></li>`).join('')}</ol></section>`;
}

export function certificatesPage({ credentials, pageIntros }) {
  return `${pageHero({ eyebrow: 'Credentials · Honors', title: '證照／證書／獎項', index: '07', lead: pageIntros.certificates.lead })}
  <p class="page-intro-note">${escapeHtml(pageIntros.certificates.note)}</p>
  <section class="credential-archive" aria-labelledby="credentials-title">${sectionHeading('Academic Archive', '專業證照與證書', `${number(credentials.credentials.length)} RECORDS`)}<h2 id="credentials-title" class="sr-only">專業證照與證書</h2><ol>${credentials.credentials.map((item, index) => `<li><span>${number(index + 1)}</span><article><p>${escapeHtml(item.category)}</p><h3>${escapeHtml(item.title)}</h3><div>${escapeHtml(item.issuer)}</div></article><div class="credential-format">${item.image ? `<button type="button">檢視證書</button>` : '<span>文字檔案</span>'}</div></li>`).join('')}</ol></section>
  <section class="award-archive" aria-labelledby="awards-title">${sectionHeading('Academic Honors', '學業與研究獎項', `${number(credentials.awards.length)} RECORDS`)}<h2 id="awards-title" class="sr-only">學業與研究獎項</h2><ol>${credentials.awards.map((item, index) => `<li><div><span>${escapeHtml(item.year)}</span><small>${number(index + 1)}</small></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></li>`).join('')}</ol><p class="archive-note">${escapeHtml(pageIntros.certificates.closing)}</p></section>`;
}

export function teachingPage({ experience }) {
  return `${pageHero({ eyebrow: 'Teaching · Academic Experience', title: '教學', index: '08' })}<section class="teaching-ledger" aria-labelledby="teaching-title">${sectionHeading('Course Ledger', '教學與學術經驗', `${number(experience.length)} RECORDS`)}<h2 id="teaching-title" class="sr-only">教學與學術經驗</h2><ol>${experience.map((item, index) => `<li><span>${number(index + 1)}</span><p>${escapeHtml(item.text)}</p></li>`).join('')}</ol><a class="related-link" href="certificates.html">查看證照／證書／獎項 <span aria-hidden="true">↗</span></a></section>`;
}

const cvList = (items, render) => `<ol class="cv-list">${items.map(render).join('')}</ol>`;
export function cvPage({ profile, education, experience, research, publications, conferences, translations, credentials }) {
  const translationItems = [translations.translation, ...translations.publicWriting];
  return `<header class="cv-header"><p>Curriculum Vitae</p><h1>${escapeHtml(profile.nameZh)} <span>${escapeHtml(profile.nameEn)}</span></h1><div><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><button type="button" data-print-cv>列印／儲存 PDF</button></div></header>
  <div class="cv-document">
    <section><h2>個人資料</h2>${profile.bio.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</section>
    <section><h2>教育</h2>${cvList(education, (item) => `<li><time>${escapeHtml(item.period)}</time><div><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.institution)}</p></div></li>`)}</section>
    <section><h2>職歷與教學</h2>${cvList(experience, (item) => `<li><span></span><p>${escapeHtml(item.text)}</p></li>`)}</section>
    <section><h2>研究領域</h2>${cvList(research.expertise, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`)}</section>
    <section><h2>期刊論文</h2>${cvList(publications, (item) => `<li><time>${escapeHtml(item.year)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue)}　${escapeHtml(item.meta)}</p>${item.tags.length ? `<small>${item.tags.map(escapeHtml).join('／')}</small>` : ''}</div></li>`)}</section>
    <section><h2>研討會論文</h2>${cvList([...conferences.published, ...conferences.presentations], (item) => `<li><time>${escapeHtml(item.year || '')}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.venue || '')}${item.venue ? '　' : ''}${escapeHtml(item.meta)}</p></div></li>`)}</section>
    <section><h2>譯著與公共寫作</h2>${cvList(translationItems, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || item.originalTitle || '')}</p><small>${escapeHtml(item.source || item.publisher || '')}</small></div></li>`)}</section>
    <section><h2>計畫</h2>${cvList(research.current, (item) => `<li><span></span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`)}</section>
    <section><h2>證照與獎項</h2>${cvList([...credentials.credentials, ...credentials.awards], (item) => `<li><time>${escapeHtml(item.year || '')}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.issuer || item.description || '')}</p></div></li>`)}</section>
  </div>`;
}

export function contactPage({ profile }) {
  return `<section class="contact-scene" aria-labelledby="contact-title"><p class="eyebrow">Contact · Academic Correspondence</p><h1 id="contact-title">聯絡</h1><p>${escapeHtml(profile.roleZh)}</p><a class="contact-email" href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><div><a href="mailto:${escapeHtml(profile.email)}">撰寫郵件</a><button type="button" data-copy="${escapeHtml(profile.email)}">複製 Email</button></div><footer><strong>${escapeHtml(profile.nameZh)}</strong><span>${escapeHtml(profile.nameEn)}</span><p>${escapeHtml(profile.institutionZh)}</p></footer></section>`;
}

export function notFoundPage() {
  return `<section class="not-found"><p class="eyebrow">404 · Page Not Found</p><h1>找不到頁面</h1><p>請返回首頁，或使用全站搜尋。</p><div><a href="index.html">返回首頁</a><button type="button" data-search-open>搜尋全站</button></div></section>`;
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
  education.forEach((item) => items.push({ id: item.id, href: 'about.html', type: '學歷', title: item.degree, text: `${item.period} ${item.institution}` }));
  experience.forEach((item) => items.push({ id: item.id, href: 'teaching.html', type: '教學與學術經驗', title: item.text, text: '' }));
  return items;
}

export function sitemapRoutes(routes) {
  return unique([...routes.map((route) => route.href), '404.html']);
}
