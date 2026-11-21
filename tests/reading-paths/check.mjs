import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';
import { certificatesPage, conferencePage, researchPage, searchIndex, translationsPage } from '../../src/build/pages.mjs';

const dataFiles = {
  routes: 'routes', publications: 'publications', conferences: 'conferences', translations: 'translations',
  credentials: 'credentials', research: 'research', education: 'education', experience: 'experience',
  pageIntros: 'page-intros', siteGlyphs: 'chu-script-glyphs'
};
const data = Object.fromEntries(await Promise.all(Object.entries(dataFiles).map(async ([key, file]) =>
  [key, JSON.parse(await readFile(new URL(`../../src/data/${file}.json`, import.meta.url), 'utf8'))]
)));
const pages = new Map([
  ['conference-papers.html', load(conferencePage(data))],
  ['certificates.html', load(certificatesPage(data))],
  ['translations.html', load(translationsPage(data))],
  ['research.html', load(researchPage(data))]
]);
let fragments = 0;
for (const [page, $] of pages) {
  $('.reading-index a').each((_, link) => {
    const href = $(link).attr('href');
    assert.match(href, /^#[a-z0-9-]+$/, `${page} chapter link`);
    assert.equal($(href).length, 1, `${page}${href} is a unique target`);
    assert.equal($(href).attr('tabindex'), '-1', `${page}${href} is focusable on direct navigation`);
    fragments += 1;
  });
}

const conference = pages.get('conference-papers.html');
const years = [...new Set(data.conferences.presentations.map(({ year }) => year))].sort((left, right) => Number(right) - Number(left));
assert.deepEqual(conference('.conference-year > h3').map((_, heading) => conference(heading).text()).get(), years);
assert.equal(conference('.conference-year li').length, data.conferences.presentations.length);
for (const item of data.conferences.published) {
  const link = conference(`#${item.id} a`);
  assert.equal(link.attr('href'), item.link, `${item.id} external link stays intact`);
  assert.equal(link.attr('rel'), 'noopener noreferrer');
}

const records = searchIndex(data).filter(({ id, href }) => href.endsWith(`#${id}`));
for (const item of records) {
  const [page, fragment] = item.href.split('#');
  const $ = pages.get(page);
  if (!$) continue;
  const target = $(`#${fragment}`);
  assert.equal(target.length, 1, `${item.href} has exactly one result target`);
  assert.equal(target.attr('tabindex'), '-1', `${item.href} is focusable on direct navigation`);
  assert.ok(target.find('h2,h3,h4').text().includes(item.title), `${item.href} shows the matched record title`);
}
const count = records.filter(({ href }) => pages.has(href.split('#')[0])).length;
const sourceCount = data.conferences.published.length + data.conferences.presentations.length +
  data.credentials.credentials.length + data.credentials.awards.length +
  1 + data.translations.publicWriting.length + data.research.current.length + data.research.expertise.length;
assert.equal(count, sourceCount, 'Every expected search record has an exact link');
console.log(`閱讀路徑通過：${fragments} 個章節與年份連結、${count} 筆精確搜尋連結。`);
