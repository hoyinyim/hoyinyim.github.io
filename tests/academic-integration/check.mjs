import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../..', import.meta.url));
const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:4173');
const out = resolve(root, 'tmp/academic-integration-qa');
const route = (leaf) => new URL(leaf, `${base.origin}/`).href;
const affected = ['index.html', 'about.html', 'research.html', 'teaching.html', 'journal-papers.html'];
const routes = JSON.parse(await readFile(new URL('../../src/data/routes.json', import.meta.url), 'utf8'))
  .map(({ href }) => href);
const chrome = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : '/usr/bin/google-chrome');
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const scans = [];
const failures = [];
let checks = 0;
await mkdir(out, { recursive: true });

const exercise = async (name, test) => {
  checks += 1;
  try {
    await test();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures.push({ name, error: String(error), stack: error.stack });
    console.error(`✗ ${name}：${error.message}`);
  }
};
const open = async (page, leaf) => {
  const response = await page.goto(route(leaf), { waitUntil: 'load', timeout: 18000 });
  assert.equal(response?.status(), 200, route(leaf));
  await page.evaluate(() => document.fonts.ready);
};

await exercise('正式網頁內部連結及錨點均有效，沒有連往原型', async () => {
  const html = new Map();
  const responses = new Map();
  const manifest = [...new Set([...routes, '404.html'])];
  const getPage = (url) => {
    const key = `${url.origin}${url.pathname}`;
    if (!html.has(key)) html.set(key, (async () => {
      const response = await fetch(key, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, key);
      return load(await response.text());
    })());
    return html.get(key);
  };
  const getResource = (url) => {
    const key = `${url.origin}${url.pathname}`;
    if (!responses.has(key)) responses.set(key, (async () => {
      const response = await fetch(key, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      assert.ok(response.ok, `${key} HTTP ${response.status}`);
    })());
    return responses.get(key);
  };
  const links = [];
  for (const leaf of manifest) {
    const here = route(leaf);
    const $ = await getPage(new URL(here));
    for (const link of $('a[href]')) {
      const href = $(link).attr('href');
      let url = new URL(href, here);
      if (url.hostname === 'hoyinyim.github.io' && url.origin !== base.origin) url = new URL(url.pathname + url.search + url.hash, base);
      if (!/^https?:$/.test(url.protocol) || url.origin !== base.origin) continue;
      assert.ok(!/^\/prototypes(?:\/|$)/.test(url.pathname), `${leaf} 不得導向原型：${href}`);
      links.push([leaf, url]);
    }
  }
  const errors = [];
  for (const [leaf, url] of links) {
    try {
      if (/\.(?:html?)$/i.test(url.pathname) || url.pathname.endsWith('/')) {
        const $ = await getPage(url);
        const hash = decodeURIComponent(url.hash.slice(1));
        if (hash) assert.equal($('[id]').filter((_, el) => $(el).attr('id') === hash).length, 1, `${url.pathname}#${hash}`);
      } else await getResource(url);
    } catch (error) {
      errors.push(`${leaf} → ${url.pathname}${url.hash}：${error.message}`);
    }
  }
  assert.deepEqual([...new Set(errors)], []);
  console.log(`  核對 ${manifest.length} 頁內 ${links.length} 條內部連結（不讀取外站內容）`);
});

const browser = await chromium.launch({ executablePath: chrome, headless: true });
const usePage = async (options, task) => {
  const context = await browser.newContext({ locale: 'zh-TW', ...options });
  const page = await context.newPage();
  const runtimeErrors = [];
  const missing = [];
  page.setDefaultTimeout(3800);
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === base.origin && response.status() >= 400 && url.pathname !== '/favicon.ico') {
      missing.push(`${response.status()} ${url.pathname}`);
    }
  });
  try {
    await task(page);
    assert.deepEqual(runtimeErrors, [], '瀏覽器 JS 例外');
    assert.deepEqual(missing, [], '同源未成功載入的資源');
  } finally {
    await context.close();
  }
};
const assertResponsive = async (page, width) => {
  const status = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    return {
      width: viewport,
      horizontal: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - viewport,
      lang: document.documentElement.lang,
      mains: document.querySelectorAll('main').length,
      primary: document.querySelector('main h1')?.textContent.trim(),
    };
  });
  assert.ok(Math.abs(status.width - width) <= 1, 'viewport meta 尺寸');
  assert.ok(status.horizontal <= 1, `${width}px 有 ${status.horizontal}px 非預期頁面溢出`);
  assert.match(status.lang, /^zh-Hant(?:-|$)/i);
  assert.equal(status.mains, 1);
  assert.ok(status.primary, '主標題保留真實文字');
};
const checkAxe = async (page, leaf, width, theme) => {
  const result = await new AxeBuilder({ page }).include('main').withTags(axeTags).analyze();
  const violations = result.violations.map(({ id, impact, nodes }) => ({
    id, impact, selectors: nodes.map(({ target }) => target.join(' ')),
  }));
  scans.push({ leaf, width, theme, violations });
  assert.deepEqual(violations.filter(({ impact }) => ['critical', 'serious'].includes(impact)), []);
};

const topic = (page, id) => page.locator(`[data-publication-topic="${id}"]`);
const filter = (page, id) => page.locator(`[data-publication-filter="${id}"]`);
const visiblePapers = (page) => page.locator('[data-publication]:visible').evaluateAll((els) =>
  els.map((el) => el.dataset.publicationId));
const nativeChapters = async (page, ids) => {
  for (const id of ids) {
    const link = page.locator(`main [data-chapter-index] a[href="#${id}"]:visible`);
    assert.equal(await link.count(), 1, `缺少可用的章節目次 ${id}`);
    await link.press('Enter');
    await page.waitForURL((url) => url.hash === `#${id}`);
    const target = page.locator(`[id="${id}"]`);
    assert.equal(await target.count(), 1);
    assert.ok(await target.isVisible(), '目標章節保持可見');
    assert.ok((await target.innerText()).trim().length > 0, '排除空錨點');
  }
};
const motion = (locator) => locator.evaluate((el) => el.getAnimations({ subtree: true })
  .filter((animation) => animation.playState === 'running' && Number(animation.effect?.getTiming().duration) > 1)
  .map((animation) => animation.animationName || animation.transitionProperty || 'WAAPI'));
const assertAnnotation = async (page) => {
  const item = page.locator('main details.reading-annotation').first();
  assert.equal(await item.count(), 1, '缺少原生展開註解');
  const summary = item.locator('summary');
  assert.equal(await summary.count(), 1);
  const initial = await item.evaluate((el) => el.open);
  await summary.press('Space');
  assert.equal(await item.evaluate((el) => el.open), !initial, '鍵盤可改變展開狀態');
  if (!initial) {
    const detail = item.locator('p').first();
    assert.ok(await detail.isVisible(), '展開後能讀到註解');
    assert.ok((await detail.innerText()).trim(), '註解不能為空');
  }
  await summary.press('Enter');
  assert.equal(await item.evaluate((el) => el.open), initial, '可以回到原本狀態');
};
const material = (page) => page.locator('#research-materials');
const choice = (page, n) => material(page).locator('[data-material-choice]').nth(n);
const expectSelection = async (page, n) => {
  const target = await choice(page, n).getAttribute('href');
  const slide = material(page).locator(`[id="${target.slice(1)}"]`);
  const ch = await slide.getAttribute('data-material-character');
  assert.ok(ch, '選項應指向帶標題的原始字形');
  const database = await slide.locator('[data-material-database]').getAttribute('href');
  await page.waitForFunction(({ ch, database }) => {
    const status = document.querySelector('[data-material-status]');
    const source = document.querySelector('[data-material-current-source]');
    return status?.textContent.includes(ch) && source?.getAttribute('href') === database;
  }, { ch, database });
  assert.equal(await choice(page, n).getAttribute('aria-current'), 'true', '同一選作需對讀者標記');
};

try {
  for (const { width, height, theme, pages } of [
    { width: 1440, height: 900, theme: 'light', pages: affected },
    { width: 768, height: 1024, theme: 'light', pages: affected },
    { width: 390, height: 844, theme: 'light', pages: affected },
    { width: 320, height: 750, theme: 'light', pages: affected },
    { width: 390, height: 844, theme: 'dark', pages: ['research.html', 'journal-papers.html'] },
  ]) {
    for (const leaf of pages) {
      await exercise(`${leaf} ${width}px ${theme}：響應及資源`, () => usePage({
        viewport: { width, height },
        hasTouch: width <= 768,
        isMobile: width <= 768,
        reducedMotion: 'reduce',
        colorScheme: theme,
      }, async (page) => {
        await open(page, leaf);
        await assertResponsive(page, width);
        if ([1440, 390].includes(width)) await checkAxe(page, leaf, width, theme);
        if ([1440, 390].includes(width) && theme === 'light') {
          await page.screenshot({ path: resolve(out, `${leaf.replace('.html', '')}-${width}.png`), animations: 'disabled' });
        }
      }));
    }
  }

  await exercise('關於、研究、教學：鍵盤章節導覽與展開註解不依賴 JavaScript', () => usePage({
    viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce',
  }, async (page) => {
    for (const [leaf, ids] of [
      ['about.html', ['biography', 'education']],
      ['research.html', ['research-focus', 'research-specialties', 'research-materials']],
      ['teaching.html', ['teaching-experience', 'teaching-practice']],
    ]) {
      await open(page, leaf);
      await nativeChapters(page, ids);
      if (leaf === 'about.html') await assertAnnotation(page);
      if (leaf === 'research.html') {
        const items = page.locator('[data-chapter-index] details.reading-subtopics');
        await items.locator('summary').press('Enter');
        assert.equal(await items.evaluate((el) => el.open), true);
        await nativeChapters(page, ['current-01', 'current-02', 'current-03']);
      }
    }
  }));

  await exercise('首頁：按鍵揭示墨圖，保留原始姓名與版面', () => usePage({
    viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference',
  }, async (page) => {
    await open(page, 'index.html');
    const name = page.locator('#home-title');
    const control = page.locator('[data-name-stamp-trigger]');
    const area = page.locator('[data-home-ink-art]');
    assert.match(await name.innerText(), /嚴浩然/);
    const baseline = await name.boundingBox();
    assert.ok(await area.locator('img').isVisible(), '墨圖在重播前已顯示');
    await control.press('Enter');
    await page.waitForFunction(() =>
      document.querySelector('[data-name-stamp][data-ink-pulse]') &&
      document.querySelector('[data-home-ink-art] img')?.getAnimations()
        .some((animation) => animation.animationName === 'academic-ink-unfold' && animation.playState === 'running'));
    assert.equal(page.url(), route('index.html'));
    await page.waitForFunction(() => !document.querySelector('[data-name-stamp][data-ink-pulse]'));
    const final = await name.boundingBox();
    assert.equal(final?.width, baseline?.width);
    assert.equal(final?.height, baseline?.height);
    assert.ok(await name.isVisible());
    assert.ok(await area.locator('img').isVisible());
  }));

  await exercise('首頁減少動態：同一控制不啟動墨圖動畫', () => usePage({
    viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'index.html');
    const area = page.locator('[data-home-ink-art]');
    const control = page.locator('[data-name-stamp-trigger]:visible');
    if (await control.count()) await control.press('Enter');
    assert.equal(await page.locator('[data-name-stamp][data-ink-pulse]').count(), 0);
    assert.deepEqual(await motion(area), []);
    assert.ok(await area.locator('img').isVisible());
    assert.match(await page.locator('#home-title').innerText(), /嚴浩然/);
  }));

  await exercise('研究：前後捲圖、選作狀態與原始來源連結同步', () => usePage({
    viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'research.html');
    await material(page).scrollIntoViewIfNeeded();
    const track = material(page).locator('[data-material-track]');
    assert.equal(await track.locator('[data-material-slide]').count(), 2);
    assert.deepEqual(await track.locator('[data-material-slide]').evaluateAll((els) =>
      els.map((el) => el.dataset.materialCharacter)), ['學', '思']);
    const max = await track.evaluate((el) => el.scrollWidth - el.clientWidth);
    assert.ok(max > 12, '須有可操作的圖版捲動區域');
    await expectSelection(page, 0);
    await material(page).locator('[data-material-step="1"]').press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-material-track]').scrollLeft > 8);
    await expectSelection(page, 1);
    assert.deepEqual(await motion(track), []);
    await choice(page, 0).press('Enter');
    await page.waitForFunction(() => document.querySelector('[data-material-track]').scrollLeft <= 2);
    await expectSelection(page, 0);
    await material(page).screenshot({ path: resolve(out, 'research-materials-1440.png'), animations: 'disabled' });
  }));

  await exercise('研究手機：原生拉桿使用鍵盤放大，限制在局部圖框內', () => usePage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'research.html');
    await choice(page, 1).tap();
    await expectSelection(page, 1);
    const slide = material(page).locator('[data-material-slide]').nth(1);
    const zoom = slide.locator('details[data-material-zoom]');
    const picture = slide.locator('[data-material-picture]');
    assert.equal(await zoom.evaluate((el) => el.open), false);
    await zoom.locator('summary').press('Enter');
    const range = zoom.locator('input[data-material-range]');
    const value = zoom.locator('[data-material-value]');
    await range.press('Home');
    const geometry = () => picture.evaluate((el) => ({
      width: el.querySelector('img').getBoundingClientRect().width,
      overflow: Math.max(el.scrollWidth - el.clientWidth, el.scrollHeight - el.clientHeight),
    }));
    const pictureId = await picture.getAttribute('id');
    const original = await geometry();
    await range.press('End');
    assert.equal(await range.inputValue(), '200');
    assert.match(await value.innerText(), /200\s*%/);
    // Input state can update before Chrome's next rendered style/geometry frame.
    await page.waitForFunction(({ pictureId, original }) =>
      document.getElementById(pictureId).querySelector('img').getBoundingClientRect().width >= original.width * 1.9,
    { pictureId, original });
    const enlarged = await geometry();
    assert.ok(enlarged.width >= original.width * 1.9, '不是只更新比例標籤，圖版寬度也須增加');
    assert.ok(enlarged.overflow > original.overflow + 8, '放大後能在圖框內捲動');
    await assertResponsive(page, 390);
    await picture.screenshot({ path: resolve(out, 'research-zoom-390.png'), animations: 'disabled' });
    await range.press('Home');
    assert.equal(await range.inputValue(), '100');
    await page.waitForFunction(({ pictureId, original }) =>
      document.getElementById(pictureId).querySelector('img').getBoundingClientRect().width === original.width,
    { pictureId, original });
    assert.deepEqual(await geometry(), original);
  }));

  await exercise('研究無 JS：圖版錨點、兩圖及原圖連結保留；首頁內容不缺席', () => usePage({
    viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'research.html');
    assert.equal(await material(page).locator('[data-material-step]:visible').count(), 0);
    assert.equal(await material(page).locator('[data-material-range]:visible').count(), 0);
    const link = choice(page, 1);
    const href = await link.getAttribute('href');
    await link.press('Enter');
    await page.waitForURL((url) => url.hash === href);
    const slide = material(page).locator(`[id="${href.slice(1)}"]`);
    assert.ok((await slide.innerText()).includes('思'));
    await slide.locator('img').evaluate(async (image) => image.decode());
    assert.ok(await slide.getByRole('link', { name: '開啟原始字形圖', exact: true }).isVisible());
    await open(page, 'index.html');
    assert.match(await page.locator('#home-title').innerText(), /嚴浩然/);
    assert.ok(await page.locator('[data-home-ink-art] img').isVisible());
    assert.equal(await page.locator('[data-name-stamp-trigger]:visible').count(), 0);
  }));

  await exercise('期刊：思／羣／玄主題、待刊交集與重設', () => usePage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'journal-papers.html');
    assert.equal((await visiblePapers(page)).length, 10);
    for (const [id, name] of [['si', '思'], ['qun', '羣'], ['xuan', '玄']]) {
      const chip = topic(page, id);
      assert.ok(await chip.isVisible(), id);
      assert.ok((await chip.textContent()).includes(name), `${id} 尚有真實文字供辨識`);
      await chip.locator('img').evaluate(async (im) => im.decode());
    }
    await topic(page, 'si').tap();
    assert.deepEqual(await visiblePapers(page), ['journal-01', 'journal-03', 'journal-04', 'journal-05', 'journal-06', 'journal-09']);
    await filter(page, 'forthcoming').press('Enter');
    assert.deepEqual(await visiblePapers(page), [], '思的第48期論文已刊，不再納入待刊');
    await topic(page, 'qun').tap();
    assert.deepEqual(await visiblePapers(page), ['journal-02']);
    await topic(page, 'xuan').tap();
    assert.deepEqual(await visiblePapers(page), []);
    assert.ok(await page.locator('[data-publication-empty]').isVisible());
    await page.locator('[data-publication-reset]').press('Enter');
    assert.equal((await visiblePapers(page)).length, 10);
    assert.equal(await topic(page, 'all').getAttribute('aria-pressed'), 'true');
  }));

  await exercise('期刊無 JS：全部書目仍可閱讀', () => usePage({
    viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'journal-papers.html#year-2025');
    assert.equal((await visiblePapers(page)).length, 10);
    assert.ok(await page.locator('#year-2025').isVisible());
    assert.equal(await page.locator('[data-publication-topic]:visible').count(), 0);
  }));
} finally {
  await browser.close();
}

const violations = scans.flatMap(({ leaf, width, theme, violations: items }) =>
  items.map((item) => ({ leaf, width, theme, ...item })));
await writeFile(resolve(out, 'results.json'), JSON.stringify({
  generatedAt: new Date().toISOString(), base: base.href, checks, failures, scans, violations,
}, null, 2) + '\n', 'utf8');
console.log(`正式整合驗收：${checks} 項、${scans.length} 組 Axe、${failures.length} 失敗；報告 ${resolve(out, 'results.json')}`);
if (failures.length) process.exitCode = 1;
