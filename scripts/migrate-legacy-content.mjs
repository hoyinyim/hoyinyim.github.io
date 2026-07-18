import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceRoot = resolve(root, 'content-source/original');
const dataRoot = resolve(root, 'src/data');

const clean = (value = '') => value.replace(/\s+/g, ' ').trim();
const texts = ($, selector) => $(selector).map((_, node) => clean($(node).text())).get();
const writeJson = (name, value) => writeFile(resolve(dataRoot, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');

await mkdir(dataRoot, { recursive: true });

const indexHtml = await readFile(resolve(sourceRoot, 'index.html'), 'utf8');
const $index = load(indexHtml);
const profile = {
  nameZh: clean($index('.profile-card h1').text()),
  nameEn: clean($index('.profile-card .roman').text()),
  roleZh: clean($index('.profile-card .degree').text()),
  roleEn: clean($index('.profile-card .degree-en').text()),
  institutionZh: clean($index('.institution-zh').text()),
  institutionEn: clean($index('.institution-en').text()),
  bio: texts($index, '.intro-card > p'),
  email: ($index('a[href^="mailto:"]').first().attr('href') || '').replace('mailto:', ''),
  portrait: 'images/profile.png.JPG',
  portraitAlt: $index('.profile-card img').attr('alt'),
  institutionLogo: 'images/Bprofile.png',
  institutionLogoAlt: $index('.institution img').attr('alt'),
  quickLinks: $index('.quick-card').map((_, node) => ({
    id: clean($index(node).find('.num').text()),
    href: $index(node).attr('href'),
    title: clean($index(node).find('h3').text()),
    description: clean($index(node).find('p').text())
  })).get(),
  footerIdentity: clean($index('.footer-inner > div').first().text())
};

const education = $index('.timeline-item').map((index, node) => ({
  id: `education-${String(index + 1).padStart(2, '0')}`,
  period: clean($index(node).find('.year').text()),
  degree: clean($index(node).find('h4').text()),
  institution: clean($index(node).find('p').text()),
  logo: clean($index(node).find('p').text()).includes('國立成功大學') ? 'images/Bprofile.png' : null
})).get();

const experience = $index('.list-clean li').map((index, node) => ({
  id: `experience-${String(index + 1).padStart(2, '0')}`,
  text: clean($index(node).text())
})).get();

const research = {
  tags: texts($index, '.research-tags span'),
  current: $index('.current-list li').map((index, node) => ({
    id: `current-${String(index + 1).padStart(2, '0')}`,
    title: clean($index(node).find('strong').text()),
    description: clean($index(node).find('span').text())
  })).get(),
  expertise: $index('.research-card').map((index, node) => ({
    id: `expertise-${String(index + 1).padStart(2, '0')}`,
    title: clean($index(node).find('h3').text()),
    description: clean($index(node).find('p').text())
  })).get()
};

const journalHtml = await readFile(resolve(sourceRoot, 'journal-papers.html'), 'utf8');
const publicationMatch = journalHtml.match(/const publications\s*=\s*(\[[\s\S]*?\n\]);/);
if (!publicationMatch) throw new Error('Cannot locate legacy publications array.');
const legacyPublications = Function(`"use strict";return (${publicationMatch[1]})`)();
const publications = legacyPublications.map((item, index) => ({
  id: `journal-${String(index + 1).padStart(2, '0')}`,
  ...item
}));

const conferenceHtml = await readFile(resolve(sourceRoot, 'conference-papers.html'), 'utf8');
const $conference = load(conferenceHtml);
const publishedLinks = [
  'https://chinese.nccu.edu.tw/PageDoc/Detail?fid=8363&id=20873',
  'https://www.airitilibrary.com/Article/Detail/18172903-N202305110002-00020'
];
const published = $conference('.publication-item').map((index, node) => ({
  id: `conference-published-${String(index + 1).padStart(2, '0')}`,
  title: clean($conference(node).find('.title').text()),
  venue: clean($conference(node).find('.venue').text()),
  meta: clean($conference(node).find('.metadata').text()),
  link: publishedLinks[index]
})).get();
const presentations = $conference('.presentation-item').map((index, node) => {
  const meta = clean($conference(node).find('.metadata').text());
  const year = meta.match(/(?:20\d{2})/g)?.at(-1) || '';
  return {
    id: `conference-presentation-${String(index + 1).padStart(2, '0')}`,
    year,
    title: clean($conference(node).find('.title').text()),
    meta
  };
}).get();

const translationsHtml = await readFile(resolve(sourceRoot, 'translations.html'), 'utf8');
const $translations = load(translationsHtml);
const workCards = $translations('.work-card');
const featureInfo = $translations('.translation-feature');
const translation = {
  id: 'translation-01',
  title: clean(featureInfo.find('.book-info h2').text()),
  originalTitle: clean(featureInfo.find('.original-title').text()),
  author: clean(featureInfo.find('.info-list li').eq(0).clone().children().remove().end().text()),
  translator: clean(featureInfo.find('.info-list li').eq(1).clone().children().remove().end().text()),
  publisher: clean(featureInfo.find('.info-list li').eq(2).clone().children().remove().end().text()),
  publicationDate: clean(featureInfo.find('.info-list li').eq(3).clone().children().remove().end().text()),
  description: clean(workCards.eq(0).find('p').text()),
  cover: featureInfo.find('img').attr('src'),
  coverAlt: featureInfo.find('img').attr('alt'),
  link: featureInfo.find('a[href^="https://www.wunan.com.tw/bookdetail"]').attr('href')
};
const publicWriting = workCards.slice(1).map((index, node) => ({
  id: `public-writing-${String(index + 1).padStart(2, '0')}`,
  title: clean($translations(node).find('h3').text()),
  description: clean($translations(node).find('p').text()),
  source: clean($translations(node).find('.source span').text()),
  link: $translations(node).find('.source a').attr('href')
})).get();

const credentialsHtml = await readFile(resolve(sourceRoot, 'certificates.html'), 'utf8');
const $credentials = load(credentialsHtml);
const credentials = $credentials('.credential').map((index, node) => ({
  id: `credential-${String(index + 1).padStart(2, '0')}`,
  title: clean($credentials(node).find('h3').text()),
  issuer: clean($credentials(node).find('.issuer').text()),
  category: clean($credentials(node).find('.tag').text()),
  image: null
})).get();
const awards = $credentials('.award').map((index, node) => ({
  id: `award-${String(index + 1).padStart(2, '0')}`,
  year: clean($credentials(node).find('.award-year').text()),
  title: clean($credentials(node).find('h3').text()),
  description: clean($credentials(node).find('p').text()),
  image: null
})).get();

const routes = [
  ['home', 'index.html', '首頁', 'Home'],
  ['about', 'about.html', '關於', 'About'],
  ['research', 'research.html', '研究', 'Research'],
  ['journal', 'journal-papers.html', '期刊論文', 'Journal Articles'],
  ['conference', 'conference-papers.html', '研討會論文', 'Conference Papers'],
  ['translations', 'translations.html', '譯著／哲學普及作品', 'Translations'],
  ['certificates', 'certificates.html', '證照／證書／獎項', 'Credentials'],
  ['teaching', 'teaching.html', '教學', 'Teaching'],
  ['cv', 'cv.html', '履歷', 'CV'],
  ['contact', 'contact.html', '聯絡', 'Contact']
].map(([id, href, labelZh, labelEn], index) => ({ id, href, labelZh, labelEn, order: index + 1 }));

await Promise.all([
  writeJson('profile.json', profile),
  writeJson('education.json', education),
  writeJson('experience.json', experience),
  writeJson('research.json', research),
  writeJson('publications.json', publications),
  writeJson('conferences.json', { published, presentations }),
  writeJson('translations.json', { translation, publicWriting }),
  writeJson('credentials.json', { credentials, awards }),
  writeJson('routes.json', routes)
]);

console.log(`內容遷移完成：${publications.length} 篇期刊、${published.length} 篇已出版研討會論文、${presentations.length} 筆發表、${publicWriting.length} 篇公共寫作。`);
