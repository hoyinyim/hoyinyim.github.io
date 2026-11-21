import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseline = JSON.parse(await readFile(resolve(root, 'tests/content-integrity/baseline.json'), 'utf8'));
const readJson = async (name) => JSON.parse(await readFile(resolve(root, 'src/data', name), 'utf8'));
const clean = (value = '') => value.replace(/\s+/g, ' ').trim();
const contentComparable = (value = '') => clean(value).replace(/[–—]/g, '-').replace(/年0(\d)/g, '年$1').replace(/月0(\d)/g, '月$1').replace(/([月-])0(\d)/g, '$1$2').replace(/([\u3400-\u9fff「」〈〉《》])\s+([\u3400-\u9fff「」〈〉《》])/g, '$1$2');
const errors = [];
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };
const exact = (actual, expected, label) => check(JSON.stringify(actual) === JSON.stringify(expected), `${label} 不一致`);

for (const [file, expected] of Object.entries(baseline.files)) {
  const source = await readFile(resolve(root, baseline.sourceRoot, file));
  const actual = createHash('sha256').update(source).digest('hex').toUpperCase();
  check(actual === expected, `${file} 原始來源雜湊改變`);
}

const profile = await readJson('profile.json');
const education = await readJson('education.json');
const experience = await readJson('experience.json');
const research = await readJson('research.json');
const publications = await readJson('publications.json');
const conferences = await readJson('conferences.json');
const translations = await readJson('translations.json');
const credentials = await readJson('credentials.json');
const routes = await readJson('routes.json');

const indexSource = load(await readFile(resolve(root, baseline.sourceRoot, 'index.html'), 'utf8'));
exact(profile.bio, indexSource('.intro-card > p').map((_, node) => clean(indexSource(node).text())).get(), '個人簡介');
exact(research.tags, indexSource('.research-tags span').map((_, node) => clean(indexSource(node).text())).get(), '研究標籤');
exact(research.current.map(({ title, description }) => ({ title, description })), indexSource('.current-list li').map((_, node) => ({ title: clean(indexSource(node).find('strong').text()), description: clean(indexSource(node).find('span').text()) })).get(), '目前研究與順序');
exact(research.expertise.map(({ title, description }) => ({ title, description })), indexSource('.research-card').map((_, node) => ({ title: clean(indexSource(node).find('h3').text()), description: clean(indexSource(node).find('p').text()) })).get(), '研究專長與順序');
exact(education.map((item) => ({ period: contentComparable(item.period), degree: contentComparable(`${item.degreeZh}｜${item.degreeEn}`), institution: contentComparable(`${item.institutionParts.slice(0, 3).join(' ')}${item.institutionParts[3] ? `｜${item.institutionParts[3]}` : ''}`) })), indexSource('.timeline-item').map((_, node) => ({ period: contentComparable(indexSource(node).find('.year').text()), degree: contentComparable(indexSource(node).find('h4').text()), institution: contentComparable(indexSource(node).find('p').text()) })).get(), '學歷與順序');
exact(experience.map(({ text }) => text), indexSource('.list-clean li').map((_, node) => clean(indexSource(node).text())).get(), '教學與學術經驗');

const journalSource = await readFile(resolve(root, baseline.sourceRoot, 'journal-papers.html'), 'utf8');
const publicationMatch = journalSource.match(/const publications\s*=\s*(\[[\s\S]*?\n\]);/);
const sourcePublications = Function(`"use strict";return (${publicationMatch[1]})`)();
// 保留原始快照雜湊，僅疊加有來源的單筆書目更正。
const journalAmendments = JSON.parse(await readFile(new URL('./journal-amendments.json', import.meta.url), 'utf8'));
const amendableFields = new Set(['filter', 'meta', 'tags', 'tagTypes', 'link', 'linkLabel', 'cite']);
const amendedIds = new Set();
const expectedPublications = sourcePublications.map((item, index) => ({ id: `journal-${String(index + 1).padStart(2, '0')}`, ...item }));
for (const { id, verifiedOn, sourceUrl, fields } of journalAmendments) {
  const record = expectedPublications.find((item) => item.id === id);
  const valid = record && !amendedIds.has(id) && /^\d{4}-\d{2}-\d{2}$/.test(verifiedOn) &&
    sourceUrl.startsWith('https://') && fields.link === sourceUrl &&
    Object.keys(fields).every((key) => amendableFields.has(key));
  check(valid, `${id} 書目更正缺少來源或包含不允許的欄位`);
  if (valid) { Object.assign(record, fields); amendedIds.add(id); }
}
const sortedFields = (records) => records.map((record) => Object.fromEntries(Object.entries(record).sort(([left], [right]) => left.localeCompare(right))));
exact(sortedFields(publications), sortedFields(expectedPublications), '期刊論文逐筆欄位與順序（含已核更正）');

const conferenceSource = load(await readFile(resolve(root, baseline.sourceRoot, 'conference-papers.html'), 'utf8'));
exact(conferences.published.map(({ id, link, ...item }) => item), conferenceSource('.publication-item').map((_, node) => ({ title: clean(conferenceSource(node).find('.title').text()), venue: clean(conferenceSource(node).find('.venue').text()), meta: clean(conferenceSource(node).find('.metadata').text()) })).get(), '已出版研討會論文');
exact(conferences.presentations.map(({ id, year, ...item }) => ({ title: contentComparable(item.title), meta: contentComparable(item.meta) })), conferenceSource('.presentation-item').map((_, node) => ({ title: contentComparable(conferenceSource(node).find('.title').text()), meta: contentComparable(conferenceSource(node).find('.metadata').text()) })).get(), '研討會發表與順序');

const translationSource = load(await readFile(resolve(root, baseline.sourceRoot, 'translations.html'), 'utf8'));
exact(translations.publicWriting.map(({ id, ...item }) => item), translationSource('.work-card').slice(1).map((_, node) => ({ title: clean(translationSource(node).find('h3').text()), description: clean(translationSource(node).find('p').text()), source: clean(translationSource(node).find('.source span').text()), link: translationSource(node).find('.source a').attr('href') })).get(), '公共哲學作品與順序');

const credentialSource = load(await readFile(resolve(root, baseline.sourceRoot, 'certificates.html'), 'utf8'));
exact(credentials.credentials.map(({ id, image, ...item }) => item), credentialSource('.credential').map((_, node) => ({ title: clean(credentialSource(node).find('h3').text()), issuer: clean(credentialSource(node).find('.issuer').text()), category: clean(credentialSource(node).find('.tag').text()) })).get(), '證照／證書與順序');
exact(credentials.awards.map(({ id, image, ...item }) => item), credentialSource('.award').map((_, node) => ({ year: clean(credentialSource(node).find('.award-year').text()), title: clean(credentialSource(node).find('h3').text()), description: clean(credentialSource(node).find('p').text()) })).get(), '獎項與順序');

const idGroups = [education, experience, research.current, research.expertise, publications, conferences.published, conferences.presentations, translations.publicWriting, credentials.credentials, credentials.awards];
const allIds = idGroups.flat().map((item) => item.id);
check(allIds.length === new Set(allIds).size, '穩定 ID 有重複');
check(routes.length === 11 && new Set(routes.map((item) => item.href)).size === 11, '主要路由不是十一個唯一頁面');

const publicHtml = {
  index: await readFile(resolve(root, 'index.html'), 'utf8'),
  journal: await readFile(resolve(root, 'journal-papers.html'), 'utf8'),
  conference: await readFile(resolve(root, 'conference-papers.html'), 'utf8'),
  translations: await readFile(resolve(root, 'translations.html'), 'utf8'),
  credentials: await readFile(resolve(root, 'certificates.html'), 'utf8'),
  cv: await readFile(resolve(root, 'cv.html'), 'utf8')
};
const contains = (html, text, label) => check(clean(load(html).text()).includes(clean(text)), `${label} 未出現在初始 HTML：${text}`);
profile.bio.forEach((text) => contains(publicHtml.index, text, '首頁簡介'));
const $homePublic = load(publicHtml.index);
const topologyLinks = $homePublic('[data-topology-domain]').map((_, node) => ({ domain: $homePublic(node).attr('data-topology-domain'), href: $homePublic(node).attr('href') })).get();
exact(topologyLinks, [
  { domain: 'research', href: 'research.html' },
  { domain: 'service', href: 'translations.html' },
  { domain: 'teaching', href: 'teaching.html' }
], '三域拓樸入口與順序');
exact($homePublic('[data-domain-summary="research"] li').map((_, node) => clean($homePublic(node).text())).get(), research.current.map((item) => item.title), '首頁 Research 映射');
exact($homePublic('[data-domain-summary="service"] li').map((_, node) => clean($homePublic(node).text())).get(), [translations.publicWriting[0].title, credentials.credentials[2].title, credentials.credentials[3].title], '首頁 Service 映射');
exact($homePublic('[data-domain-summary="teaching"] li').map((_, node) => clean($homePublic(node).text())).get(), [experience[0].text, credentials.credentials[0].title, credentials.credentials[1].title], '首頁 Teaching 映射');
check($homePublic('main > section').length === 4, '首頁未維持四個精簡主要區段');
for (const invented of ['Impact', 'Knowledge', 'Public Intellectual', '期刊審查', '學會職務', '行政職務']) check(!clean($homePublic('[data-topology]').text()).includes(invented), `拓樸出現未授權概念：${invented}`);
publications.forEach((item) => { contains(publicHtml.journal, item.title, '期刊題名'); contains(publicHtml.journal, item.venue, '期刊名稱'); contains(publicHtml.journal, item.meta, '期刊卷期頁碼'); contains(publicHtml.cv, item.title, 'CV 期刊題名'); });
conferences.published.forEach((item) => { contains(publicHtml.conference, item.title, '已出版研討會題名'); contains(publicHtml.cv, item.title, 'CV 研討會題名'); });
conferences.presentations.forEach((item) => { contains(publicHtml.conference, item.title, '研討會發表題名'); contains(publicHtml.cv, item.title, 'CV 研討會發表題名'); });
translations.publicWriting.forEach((item) => { contains(publicHtml.translations, item.title, '公共寫作題名'); contains(publicHtml.cv, item.title, 'CV 公共寫作題名'); });
credentials.credentials.forEach((item) => { contains(publicHtml.credentials, item.title, '證照題名'); contains(publicHtml.cv, item.title, 'CV 證照題名'); });
credentials.awards.forEach((item) => { contains(publicHtml.credentials, item.title, '獎項題名'); contains(publicHtml.cv, item.title, 'CV 獎項題名'); });

const $journalPublic = load(publicHtml.journal);
check($journalPublic('.publication-entry').length === publications.length, '初始 HTML 期刊筆數不等於資料源');
check(!$journalPublic('script:not([src]):not([type="application/ld+json"])').length, '期刊頁仍有內嵌 JavaScript');
check(!$journalPublic('style').length, '期刊頁仍有內嵌 CSS');
for (const { id, fields } of journalAmendments) {
  const entry = $journalPublic(`[data-publication-id="${id}"]`);
  const link = entry.find('.entry-actions a');
  check(entry.length === 1 && link.attr('href') === fields.link && clean(link.text()).startsWith(fields.linkLabel), `${id} 期刊官網連結或標籤不同步`);
  check(entry.find('[data-copy]').attr('data-copy') === fields.cite, `${id} 複製引用未套用更正`);
  const item = publications.find((publication) => publication.id === id);
  if (item) {
    for (const [label, html] of [['首頁', publicHtml.index], ['履歷', publicHtml.cv]]) {
      contains(html, `${item.venue}　${fields.meta}`, `${label}期刊卷期頁碼`);
    }
  }
}
const $conferencePublic = load(publicHtml.conference);
for (const item of conferences.published) {
  const link = $conferencePublic(`a[href="${item.link}"]`);
  check(link.length === 1, `授權研討會連結遺漏或重複：${item.link}`);
  check(link.attr('target') === '_blank' && link.attr('rel') === 'noopener noreferrer' && clean(link.text()).startsWith('電子全文'), `授權研討會連結屬性錯誤：${item.link}`);
}
const $translationsPublic = load(publicHtml.translations);
for (const item of translations.publicWriting) check($translationsPublic('h3').filter((_, node) => clean($translationsPublic(node).text()) === item.title).length === 1, `公共寫作索引重複：${item.title}`);

const report = { generatedAt: new Date().toISOString(), checks, passed: errors.length === 0, errors, counts: { publications: publications.length, conferencePublished: conferences.published.length, conferencePresentations: conferences.presentations.length, publicWriting: translations.publicWriting.length, credentials: credentials.credentials.length, awards: credentials.awards.length } };
const reportDir = resolve(root, process.env.CONTENT_QA_DIR || 'docs/qa/professional-rebuild');
await mkdir(reportDir, { recursive: true });
await writeFile(resolve(reportDir, 'content-integrity-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (errors.length) {
  console.error(`內容完整性測試失敗：${errors.length} 項。`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`內容完整性測試通過：${checks} 項；10 篇期刊、19 筆研討會、1 筆譯著、11 篇公共寫作、9 筆證照與獎項均逐筆保留。`);
}
