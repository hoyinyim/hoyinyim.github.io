import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';

const root = new URL('../../', import.meta.url);
const read = (path, encoding) => readFile(new URL(path, root), encoding);
const routes = JSON.parse(await read('src/data/routes.json', 'utf8'));
const families = {
  home: 'mountains', about: 'mountains', research: 'mountains',
  publications: 'river', journal: 'river', conference: 'river', translations: 'river',
  certificates: 'bamboo', teaching: 'bamboo', cv: 'bamboo', contact: 'bamboo', 'not-found': 'bamboo'
};
const names = ['mountains', 'river', 'bamboo'];
const familyClass = names.map((name) => `.ink-leaf--${name}`).join(',');
const pages = [...routes, { id: 'not-found', href: '404.html' }];
const useCounts = Object.fromEntries(names.map((name) => [name, 0]));

assert.deepEqual(pages.map(({ id }) => id).sort(), Object.keys(families).sort(), 'Update the artwork map when routes change');

for (const { id, href } of pages) {
  const family = families[id];
  const $ = load(await read(href, 'utf8'));
  const leaf = $('.ink-leaf');
  assert.equal(leaf.length, 1, `${href}: exactly one ink leaf for the entire page`);
  assert.equal(leaf.attr('aria-hidden'), 'true', `${href}: decorative artwork is hidden from assistive technology`);
  assert.equal(leaf.filter(`#main-content .scroll-opening .ink-leaf`).length, 1, `${href}: artwork is part of the main opening`);
  assert.equal(leaf.closest('.scroll-opening').find('h1').length, 1, `${href}: ink leaf shares the opening with the page heading`);
  assert.ok(leaf.hasClass(`ink-leaf--${family}`), `${href}: expected ${family} treatment`);
  assert.equal(names.filter((name) => leaf.hasClass(`ink-leaf--${name}`)).length, 1, `${href}: exactly one family modifier`);
  assert.equal($(familyClass).length, 1, `${href}: no duplicate family markup`);
  assert.equal(leaf.attr('tabindex'), undefined, `${href}: decorative wrapper is not focusable`);
  assert.equal(leaf.find('a, button, input, iframe, audio, video, [autoplay], [tabindex], [contenteditable]').length, 0, `${href}: no interactive or autoplay content in the decoration`);

  const image = leaf.find('img');
  assert.equal(image.length, 1, `${href}: exactly one image in the artwork`);
  assert.equal(image.attr('alt'), '', `${href}: image has empty alternative text`);
  assert.equal(image.attr('src'), `images/ink/${family}.jpg`, `${href}: relative image path is recognized by the packaging script`);
  assert.match(image.attr('width') ?? '', /^[1-9]\d*$/, `${href}: reserve image width`);
  assert.match(image.attr('height') ?? '', /^[1-9]\d*$/, `${href}: reserve image height`);
  assert.equal(image.attr('decoding'), 'async', `${href}: decorative artwork decodes asynchronously`);
  assert.equal(image.attr('fetchpriority'), 'low', `${href}: prioritize content over decorative artwork`);
  useCounts[family] += 1;
}

for (const family of names) {
  const file = `images/ink/${family}.jpg`;
  const jpeg = await read(file);
  assert.ok(jpeg.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])), `${file}: local asset must be a JPEG`);
  assert.ok(useCounts[family] > 0, `${file}: every image family is displayed`);
}

const glyphs = JSON.parse(await read('src/data/name-glyphs.json', 'utf8'));
const provenance = await read('docs/name-glyph-provenance.md', 'utf8');
assert.equal(glyphs.length, 3, 'Original user-supplied glyph count is unchanged');
assert.equal([...glyphs].sort((a, b) => a.order - b.order).map(({ character }) => character).join(''), '嚴浩然');
for (const { assetPath, sourceType, independentVerification } of glyphs) {
  assert.equal(sourceType, 'user-supplied', `${assetPath}: source attribution is unchanged`);
  assert.equal(independentVerification, false, `${assetPath}: independent verification remains undocumented`);
  assert.match(assetPath, /^images\/identity\/name-0[123]-[a-z]+\.png$/, `${assetPath}: identity is separate from illustration assets`);
  const recordedHash = provenance.split(/\r?\n/)
    .find((line) => line.includes(`\`${assetPath}\``))?.match(/`([0-9A-F]{64})`/i)?.[1];
  assert.ok(recordedHash, `${assetPath}: provenance documents the source hash`);
  assert.equal(createHash('sha256').update(await read(assetPath)).digest('hex'), recordedHash.toLowerCase(), `${assetPath}: image is byte-identical to the recorded original`);
}

console.log(`Ink-leaf markup/assets pass: ${pages.length} pages, ${names.length} JPEGs (${names.map((name) => `${name}=${useCounts[name]}`).join(', ')}), ${glyphs.length} original glyph hashes.`);
