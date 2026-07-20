import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const dir = resolve(root, 'prototypes/axis');
const readJson = async (name) => JSON.parse(await readFile(resolve(root, 'src/data', name), 'utf8'));
const [profile, research, publications, education] = await Promise.all([
  readJson('profile.json'), readJson('research.json'), readJson('publications.json'), readJson('education.json')
]);
const esc = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const shell = (title, body) => `<!doctype html><html lang="zh-Hant" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><link rel="stylesheet" href="prototype.css"><script>document.documentElement.dataset.theme=new URLSearchParams(location.search).get('theme')==='dark'?'dark':'light'</script></head><body><header class="proto-header"><a class="proto-brand" href="home.html">嚴浩然</a><nav class="proto-nav"><a href="research.html">Research</a><a href="journal.html">Publications</a><a href="about.html">About</a><a href="about.html#education">CV</a></nav><div class="proto-tools"><a href="journal.html">Search</a><a href="menu.html">Menu</a></div></header>${body}</body></html>`;

const home = shell('首頁原型', `<main class="proto-hero grid"><h1><span>${esc(profile.nameZh)}</span><span>${esc(profile.nameEn)}</span></h1><div class="identity"><p class="meta">Academic Profile / Chinese Thought</p><strong>${esc(profile.roleZh)}</strong><p>${esc(profile.roleEn)}</p><a href="journal.html">查看學術成果</a></div><i class="axis-line" aria-hidden="true"></i></main>`);

const researchSections = research.current.map((item, index) => `<article class="research-focus"><p class="meta">Focus ${index + 1}</p><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p></article>`).join('');
const researchMatrix = research.expertise.map((item) => `<article><p class="meta">Research Area</p><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></article>`).join('');
const researchPage = shell('研究原型', `<main class="proto-page grid"><h1 class="page-title">研究</h1><div class="page-facts"><span class="meta">Current Research</span><strong>${research.current.length} FOCUS AREAS</strong></div>${researchSections}<section class="research-matrix" aria-label="研究專長">${researchMatrix}</section></main>`);

const publicationRows = publications.slice(0, 5).map((item) => `<article class="journal-entry"><p class="venue">${esc(item.venue)}</p><h2>${esc(item.title)}</h2><p class="publication-meta">${esc(item.meta)}<br>${esc(item.tags.join('／'))}</p></article>`).join('');
const journalPage = shell('期刊論文原型', `<main class="proto-page grid"><h1 class="page-title">期刊論文</h1><div class="page-facts"><span class="meta">Journal-led Bibliography</span><strong>${publications.length} ENTRIES</strong></div><aside class="journal-tools"><p class="meta">Filter</p><button aria-pressed="true">全部</button><button aria-pressed="false">待刊</button><button aria-pressed="false">2024</button><button aria-pressed="false">THCI</button></aside><section class="journal-ledger">${publicationRows}</section></main>`);

const educationRows = education.map((item) => `<li><time>${esc(item.period)}</time><strong>${esc(item.degree)}</strong><span>${esc(item.institution)}</span></li>`).join('');
const aboutPage = shell('關於與教育原型', `<main><section class="about-lead grid"><figure><img src="../../${esc(profile.portrait)}" width="523" height="648" alt="${esc(profile.portraitAlt)}"></figure><div class="about-copy"><p class="meta">Editorial Portrait Profile</p><h1>${esc(profile.nameZh)}</h1><p class="role">${esc(profile.roleZh)}</p><div class="bio">${profile.bio.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div></section><section class="education grid" id="education"><h2>教育背景</h2><ol>${educationRows}</ol></section></main>`);

const menuPage = shell('分組選單原型', `<main class="menu-prototype grid"><h1 class="menu-heading">Menu</h1><button class="menu-close">Close</button><section class="menu-group menu-profile"><h2>PROFILE</h2><a href="about.html">About</a><a href="about.html#education">CV</a><a href="#">Credentials</a></section><section class="menu-group menu-work"><h2>RESEARCH &amp; WORK</h2><a href="research.html">Research</a><a href="journal.html">Journal</a><a href="#">Conference</a><a href="#">Translations</a></section><section class="menu-group menu-practice"><h2>PRACTICE</h2><a href="#">Teaching</a><a href="#">Contact</a></section><div class="menu-utility"><span>Search / Theme: ${'light'}</span><a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></div></main>`);

for (const [file, html] of Object.entries({ 'home.html': home, 'research.html': researchPage, 'journal.html': journalPage, 'about.html': aboutPage, 'menu.html': menuPage })) await writeFile(resolve(dir, file), `${html}\n`, 'utf8');
console.log('AXIS 五個高擬真原型已由正式資料源生成。');
