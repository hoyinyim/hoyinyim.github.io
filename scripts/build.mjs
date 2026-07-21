import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { layout } from '../src/build/components.mjs';
import {
  aboutPage, certificatesPage, conferencePage, contactPage, cvPage, homePage,
  journalPage, notFoundPage, publicationsPage, researchPage, searchIndex, sitemapRoutes,
  teachingPage, translationsPage
} from '../src/build/pages.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const readJson = async (name) => JSON.parse(await readFile(resolve(root, 'src/data', name), 'utf8'));
const data = {
  profile: await readJson('profile.json'),
  routes: await readJson('routes.json'),
  education: await readJson('education.json'),
  experience: await readJson('experience.json'),
  research: await readJson('research.json'),
  publications: await readJson('publications.json'),
  conferences: await readJson('conferences.json'),
  translations: await readJson('translations.json'),
  credentials: await readJson('credentials.json'),
  pageIntros: await readJson('page-intros.json'),
  menuGlyphs: await readJson('ancient-script-menu-glyphs.json'),
  siteGlyphs: await readJson('ancient-script-glyphs.json')
};
const buildCommit = process.env.BUILD_COMMIT || execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();

const route = (id) => data.routes.find((item) => item.id === id);
const description = (label) => `嚴浩然個人學術網站的${label}頁面。`;
const personJsonLd = {
  '@context': 'https://schema.org', '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person', name: data.profile.nameZh, alternateName: data.profile.nameEn,
    jobTitle: data.profile.roleZh, email: `mailto:${data.profile.email}`,
    affiliation: { '@type': 'CollegeOrUniversity', name: data.profile.institutionZh },
    url: 'https://hoyinyim.github.io/index.html'
  }
};
const journalJsonLd = {
  '@context': 'https://schema.org', '@type': 'ItemList',
  itemListElement: data.publications.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: `https://hoyinyim.github.io/journal-papers.html#year-${item.year}` }))
};
const conferenceJsonLd = {
  '@context': 'https://schema.org', '@type': 'ItemList',
  itemListElement: [...data.conferences.published, ...data.conferences.presentations].map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title, url: item.link || 'https://hoyinyim.github.io/conference-papers.html' }))
};

const pages = [
  { id: 'home', title: '嚴浩然 YIM HO YIN｜個人學術網站', body: homePage(data), jsonLd: personJsonLd },
  { id: 'about', title: '關於｜嚴浩然 YIM HO YIN', body: aboutPage(data) },
  { id: 'research', title: '研究｜嚴浩然 YIM HO YIN', body: researchPage(data) },
  { id: 'publications', title: '著作總覽｜嚴浩然 YIM HO YIN', body: publicationsPage(data) },
  { id: 'journal', title: '期刊論文｜嚴浩然 YIM HO YIN', body: journalPage(data), jsonLd: journalJsonLd },
  { id: 'conference', title: '研討會論文｜嚴浩然 YIM HO YIN', body: conferencePage(data), jsonLd: conferenceJsonLd },
  { id: 'translations', title: '譯著／哲學普及作品｜嚴浩然 YIM HO YIN', body: translationsPage(data) },
  { id: 'certificates', title: '證照／證書／獎項｜嚴浩然 YIM HO YIN', body: certificatesPage(data) },
  { id: 'teaching', title: '教學｜嚴浩然 YIM HO YIN', body: teachingPage(data) },
  { id: 'cv', title: '履歷｜嚴浩然 YIM HO YIN', body: cvPage(data), bodyClass: 'cv-page' },
  { id: 'contact', title: '聯絡｜嚴浩然 YIM HO YIN', body: contactPage(data) }
];

await mkdir(resolve(root, 'assets'), { recursive: true });
for (const page of pages) {
  const currentRoute = route(page.id);
  await writeFile(resolve(root, currentRoute.href), layout({ route: currentRoute, routes: data.routes, profile: data.profile, menuGlyphs: data.menuGlyphs, siteGlyphs: data.siteGlyphs, title: page.title, description: description(currentRoute.labelZh), body: page.body, jsonLd: page.jsonLd, bodyClass: page.bodyClass, buildCommit }), 'utf8');
}
const notFoundRoute = { id: 'not-found', href: '404.html', labelZh: '找不到頁面', labelEn: 'Not Found' };
await writeFile(resolve(root, '404.html'), layout({ route: notFoundRoute, routes: data.routes, profile: data.profile, menuGlyphs: data.menuGlyphs, siteGlyphs: data.siteGlyphs, title: '找不到頁面｜嚴浩然 YIM HO YIN', description: '找不到指定頁面，可返回首頁或搜尋嚴浩然個人學術網站。', body: notFoundPage(), buildCommit }), 'utf8');

const styleFiles = ['tokens.css', 'reset.css', 'typography.css', 'layout.css', 'navigation.css', 'glyphs.css', 'pages.css', 'responsive.css', 'accessibility.css', 'print.css'];
const cssSource = (await Promise.all(styleFiles.map((file) => readFile(resolve(root, 'src/styles', file), 'utf8')))).map((content, index) => `/* ${styleFiles[index]} */\n${content.trim()}`).join('\n\n');
const css = cssSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*{\s*/g, '{').replace(/;\s*}/g, '}').replace(/\s*}\s*/g, '}').replace(/\s*,\s*/g, ',').trim();
await writeFile(resolve(root, 'assets/site.css'), `${css}\n`, 'utf8');
await writeFile(resolve(root, 'assets/site.js'), await readFile(resolve(root, 'src/scripts/site.js'), 'utf8'), 'utf8');
await writeFile(resolve(root, 'assets/search-index.json'), `${JSON.stringify(searchIndex(data))}\n`, 'utf8');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes(data.routes).filter((href) => href !== '404.html').map((href) => `  <url><loc>https://hoyinyim.github.io/${href}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(root, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(resolve(root, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://hoyinyim.github.io/sitemap.xml\n', 'utf8');

for (const legacy of ['assets/archive-pages.css', 'assets/third-stage.css']) {
  await rm(resolve(root, legacy), { force: true });
}

const cssSize = (await stat(resolve(root, 'assets/site.css'))).size;
const jsSize = (await stat(resolve(root, 'assets/site.js'))).size;
console.log(`靜態網站建置完成：${pages.length + 1} 個 HTML；CSS ${cssSize} bytes；JavaScript ${jsSize} bytes。`);
