import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const root = fileURLToPath(new URL('../..', import.meta.url));
const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:4183');
const out = resolve(root, 'tmp/ink-study-qa');
const route = (leaf) => new URL(`/prototypes/ink-study/${leaf}.html`, base).href;
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ?
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const componentIds = [
  'calligraphy-hero', 'ink-reveal', 'scroll-painting', 'scroll-narrative',
  'vertical-typography', 'artwork-gallery', 'artwork-zoom', 'text-reveal',
  'minimal-navigation', 'page-transition', 'paper-texture', 'annotation-panel',
];
const axeTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const browser = await chromium.launch({ executablePath, headless: true });
const scans = [];
const rejects = [];
const assetWarnings = [];
let checks = 0;
await mkdir(out, { recursive: true });

const open = async (page, leaf) => {
  const res = await page.goto(route(leaf), { waitUntil: 'load', timeout: 15000 });
  assert.equal(res?.status(), 200, route(leaf));
  await page.evaluate(() => document.fonts.ready);
};
const exercise = async (name, test) => {
  checks += 1;
  try {
    await test();
    console.log(`✓ ${name}`);
  } catch (err) {
    rejects.push({ name, error: String(err) });
    console.error(`✗ ${name}：${err.message}`);
  }
};
const suitePage = async (options, run) => {
  const context = await browser.newContext({ locale: 'zh-TW', ...options });
  const page = await context.newPage();
  page.setDefaultTimeout(3200);
  const jsErrors = [];
  const requests = [];
  page.on('pageerror', (error) => jsErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) requests.push(response.url());
  });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== base.origin) {
      assetWarnings.push(`Unexpected external request: ${url.origin}${url.pathname}`);
    }
  });
  try {
    await run(page);
    assert.deepEqual(jsErrors, [], '瀏覽器 JS 例外');
    assert.deepEqual(requests, [], '未成功載入的資源');
  } finally {
    await context.close();
  }
};
const titleOf = (page) => page.locator('[data-gallery-title]').first().innerText();
const imageSource = (page) => page.locator('[data-gallery-image]').first()
  .evaluate((im) => im.currentSrc || im.src || im.getAttribute('src') || '');
const activeMotion = (page) => page.evaluate(() => document.getAnimations().filter((animation) => {
  const timing = animation.effect?.getTiming();
  return animation.playState === 'running' && timing && Number(timing.duration) > 1;
}).map((animation) => [
  animation.animationName || animation.transitionProperty || 'WAAPI',
  animation.effect?.target?.tagName || 'pseudo-element',
]));

const shape = async (page, width, leaf) => {
  const box = await page.evaluate(() => {
    const max = document.documentElement.clientWidth;
    const bounds = [...document.querySelectorAll('h1,h2,h3,summary,button,input[type="range"]')]
      .flatMap((el) => {
        if (el.closest('[data-painting-track]')) return [];
        const rect = el.getBoundingClientRect();
        const css = getComputedStyle(el);
        if (rect.width < 2 || rect.height < 2 || css.visibility === 'hidden') return [];
        return rect.x < -1 || rect.right > max + 1 ? [el.textContent.trim().slice(0, 52) || el.tagName] : [];
      });
    const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
    return {
      lang: document.documentElement.lang,
      viewport: max,
      rootOverflow: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - max,
      main: document.querySelectorAll('main').length,
      badBounds: bounds,
      repeatedIds: ids.filter((item, i) => ids.indexOf(item) !== i),
    };
  });
  assert.match(box.lang, /^zh-Hant(?:-|$)/i, `${leaf} 須聲明繁體中文`);
  assert.ok(Math.abs(box.viewport - width) <= 1, `${leaf} viewport：${box.viewport}／${width}`);
  assert.ok(box.rootOverflow <= 1, `${leaf} ${width}px 有 ${box.rootOverflow}px 不預期的橫向溢出`);
  assert.equal(box.main, 1, `${leaf} main 地標`);
  assert.deepEqual(box.badBounds, [], `${leaf} ${width}px 有標題或控制被裁切`);
  assert.deepEqual(box.repeatedIds, [], `${leaf} ID 須唯一`);
  assert.equal(await page.locator('h1:visible').count(), 1, `${leaf} 僅一個頁級標題`);
};

try {
  for (const { width, height, theme } of [
    { width: 1440, height: 900, theme: 'light' },
    { width: 768, height: 1024, theme: 'light' },
    { width: 390, height: 844, theme: 'light' },
    { width: 320, height: 750, theme: 'light' },
    { width: 1440, height: 900, theme: 'dark' },
    { width: 390, height: 844, theme: 'dark' },
  ]) {
    for (const leaf of ['index', 'components']) {
      await exercise(`${leaf} ${width}px ${theme}：版面及 Axe`, () => suitePage({
        viewport: { width, height }, hasTouch: width <= 768, isMobile: width <= 768,
        colorScheme: theme, reducedMotion: 'reduce',
      }, async (page) => {
        await open(page, leaf);
        await shape(page, width, leaf);
        const result = await new AxeBuilder({ page }).withTags(axeTags).analyze();
        const violations = result.violations.map(({ id, impact, nodes }) => ({
          id, impact, selectors: nodes.map(({ target }) => target.join(' ')),
        }));
        scans.push({ leaf, width, theme, violations });
        assert.deepEqual(violations.filter(({ impact }) => impact === 'critical' || impact === 'serious'), [],
          `${leaf}：嚴重/重大可及性問題`);
        assert.deepEqual(await activeMotion(page), [], '減少動態時初始沒有持續動畫');
        if ([1440, 390].includes(width) && theme === 'light') {
          await page.screenshot({ path: resolve(out, `${leaf}-${width}.png`), animations: 'disabled' });
        }
      }));
    }
  }

  await exercise('12 元件皆有獨立展示、可達錨點與可見內容', () => suitePage({
    viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'components');
    const items = page.locator('[data-component]');
    assert.deepEqual(await items.evaluateAll((nodes) => nodes.map((node) => node.dataset.component).sort()), [...componentIds].sort());
    for (const id of componentIds) {
      const marker = page.locator(`[data-component="${id}"]`);
      assert.equal(await marker.count(), 1, id);
      assert.ok(await marker.isVisible(), `${id} 的樣本須可見`);
      assert.ok((await marker.innerText()).trim().length > 0, `${id} 沒有可用的文字說明`);
      assert.ok(await marker.evaluate((node) => {
        const anchor = node.id || node.querySelector('[id]')?.id;
        return anchor && [...document.links].some((link) => link.getAttribute('href') === '#' + anchor);
      }), `${id} 須有頁內索引連結`);
    }
  }));

  await exercise('桌機鍵盤：前後捲畫、圖版切換、局部放大及註解', () => suitePage({
    viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'components');
    const track = page.locator('[data-painting-track]').first();
    const trackId = await track.getAttribute('id');
    const start = await track.evaluate((el) => [el.scrollLeft, el.scrollWidth - el.clientWidth]);
    assert.ok(start[1] > 2, '畫卷須有限定區域的可捲內容');
    const next = page.locator('[data-painting-step="1"]:visible').first();
    const prev = page.locator('[data-painting-step="-1"]:visible').first();
    assert.equal(await next.count(), 1, '畫卷下一段控制');
    assert.equal(await prev.count(), 1, '畫卷前一段控制');
    if (trackId) assert.equal(await page.locator(`[id="${trackId}"]`).count(), 1);
    await next.press('Enter');
    await page.waitForFunction((initial) => document.querySelector('[data-painting-track]').scrollLeft > initial + 8, start[0]);
    const advanced = await track.evaluate((el) => el.scrollLeft);
    await prev.press('Space');
    await page.waitForFunction((forward) => document.querySelector('[data-painting-track]').scrollLeft < forward - 8, advanced);

    const select = page.locator('[data-gallery-choice]:visible');
    assert.ok(await select.count() >= 2, '至少有兩個圖版入口');
    const before = await imageSource(page);
    const title = await titleOf(page);
    await select.nth(1).press('Enter');
    await page.waitForFunction((initial) => {
      const img = document.querySelector('[data-gallery-image]');
      return img?.complete && img.naturalWidth > 0 && (img.currentSrc || img.src) !== initial;
    }, before);
    assert.notEqual(await titleOf(page), title, '選圖後圖說同步');
    assert.equal(page.url(), route('components'), 'JS 展示切換不得離開本頁');

    const zoom = page.locator('[data-component="artwork-zoom"]');
    const zoomDetails = zoom.locator('details[data-zoom]').first();
    if (await zoomDetails.getAttribute('open') === null) await zoomDetails.locator('summary').first().press('Enter');
    const viewport = zoom.locator('[data-zoom-viewport]').first();
    const control = zoom.locator('[data-zoom-range]').first();
    assert.equal(await control.getAttribute('type'), 'range', '放大須可用原生 range');
    await control.press('Home');
    const wideBefore = await viewport.evaluate((el) => el.scrollWidth);
    await control.press('End');
    assert.equal(await control.inputValue(), await control.getAttribute('max'));
    await page.waitForFunction((initial) => document.querySelector('[data-zoom-viewport]').scrollWidth > initial + 8, wideBefore);
    await control.press('Home');
    await page.waitForFunction((initial) => document.querySelector('[data-zoom-viewport]').scrollWidth <= initial + 2, wideBefore);

    const annotation = page.locator('[data-component="annotation-panel"] .annotation-panel details').first();
    const beforeOpen = await annotation.evaluate((el) => el.open);
    await annotation.locator('summary').first().press('Space');
    assert.equal(await annotation.evaluate((el) => el.open), !beforeOpen);
    assert.deepEqual(await activeMotion(page), [], '有狀態變化但不得播放動畫');
  }));

  await exercise('手機：長文直達、頁間同源導覽，瀏覽器可返回', () => suitePage({
    viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'index');
    const link = page.locator('a[href="#study-reading"]:visible').first();
    await link.press('Enter');
    await page.waitForURL((url) => url.hash === '#study-reading');
    const article = page.locator('#study-reading');
    assert.ok((await article.innerText()).trim().length >= 80, '整合示範須真的呈現長文');
    const from = page.url();
    const next = page.locator('a[href*="components.html"]:visible').first();
    assert.equal(new URL(await next.getAttribute('href'), from).origin, base.origin);
    await next.scrollIntoViewIfNeeded();
    await next.tap();
    await page.waitForURL(route('components'));
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForURL(from);
    assert.ok(await article.isVisible(), '原生返回能回到原章節');
  }));

  await exercise('一般動態：鍵盤重播墨圖與文字，結束後保留閱讀內容', () => suitePage({
    viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference',
  }, async (page) => {
    await open(page, 'components');
    for (const [id, effect] of [['ink-reveal', 'ink'], ['text-reveal', 'text']]) {
      const selector = `[data-component="${id}"]`;
      const sample = page.locator(selector);
      const button = sample.locator('[data-replay]:visible').first();
      const effectMarker = sample.locator(`[data-effect="${effect}"]`);
      assert.ok(await effectMarker.count() || (await sample.getAttribute('data-effect')) === effect,
        `${id} 缺少可定位的 ${effect} 效果`);
      await button.press('Enter');
      await page.waitForFunction((sel) => document.querySelector(sel).getAnimations({ subtree: true })
        .some((animation) => animation.playState === 'running' && Number(animation.effect?.getTiming().duration) > 1), selector);
      await page.waitForFunction((sel) => document.querySelector(sel).getAnimations({ subtree: true })
        .every((animation) => animation.playState !== 'running'), selector);
      for (const item of await sample.locator('[data-motion-item]').all()) {
        assert.ok(await item.isVisible(), `${id} 動作完成後的原文或圖像仍可見`);
      }
    }
  }));

  await exercise('減少動態：揭示按鈕保留內容，不播放筆畫或文字動畫', () => suitePage({
    viewport: { width: 768, height: 1024 }, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'components');
    for (const id of ['ink-reveal', 'text-reveal']) {
      const sample = page.locator(`[data-component="${id}"]`);
      const button = sample.locator('[data-replay]:visible').first();
      if (await button.count()) await button.press('Enter');
      const items = sample.locator('[data-motion-item]');
      assert.ok(await items.count() > 0, `${id} 有可驗證的動態目標`);
      for (const item of await items.all()) {
        assert.ok(await item.isVisible(), `${id} 無動態時不能遮住內容`);
        assert.ok(await item.evaluate((el) => {
          const style = getComputedStyle(el);
          return Number(style.opacity) > 0 && !/^inset\(100%(?:\s|\))/.test(style.clipPath);
        }), `${id} 沒有全透明或全遮罩`);
      }
      assert.deepEqual(await activeMotion(page), [], `${id} 減少動態時仍播放動畫`);
    }
  }));

  await exercise('未啟用 JavaScript：原生章節、原圖與題跋操作仍可用', () => suitePage({
    viewport: { width: 390, height: 844 }, javaScriptEnabled: false, reducedMotion: 'reduce',
  }, async (page) => {
    await open(page, 'index');
    await page.locator('a[href="#study-reading"]:visible').first().press('Enter');
    await page.waitForURL((url) => url.hash === '#study-reading');
    assert.ok((await page.locator('#study-reading').innerText()).trim().length >= 80);
    await page.locator('a[href*="components.html"]:visible').first().press('Enter');
    await page.waitForURL(route('components'));
    assert.equal(await page.locator('[data-component]:visible').count(), 12);
    assert.equal(await page.locator('[data-replay]:visible').count(), 0, '無 JS 應隱藏不會運作的重播鍵');
    assert.equal(await page.locator('[data-painting-step]:visible').count(), 0, '無 JS 應隱藏不會運作的方向鍵');
    const track = page.locator('[data-painting-track]').first();
    assert.ok(Number(await track.getAttribute('tabindex')) >= 0 && await track.getAttribute('tabindex') !== null);
    await track.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('[data-painting-track]').scrollLeft > 0);

    const annotation = page.locator('[data-component="annotation-panel"] .annotation-panel details').first();
    const before = await annotation.evaluate((el) => el.open);
    await annotation.locator('summary').first().press('Enter');
    assert.equal(await annotation.evaluate((el) => el.open), !before);
    const fallback = page.locator('[data-gallery-choice]:visible').first();
    const dest = new URL(await fallback.getAttribute('href'), page.url());
    assert.equal(dest.origin, base.origin, '原圖後備連結須是本站');
    assert.ok((await page.request.get(dest.href)).ok(), '原圖應可直接開啟');
  }));
} finally {
  await browser.close();
}

const warnings = scans.flatMap(({ leaf, width, theme, violations }) => violations.map((v) => ({ leaf, width, theme, ...v })));
const report = { at: new Date().toISOString(), checks, rejected: rejects, assetWarnings: [...new Set(assetWarnings)], scans, violations: warnings };
await writeFile(resolve(out, 'results.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(`墨卷示範驗收：${checks} 項（Axe ${scans.length} 組），${rejects.length} 項失敗，${warnings.filter((v) => ['serious','critical'].includes(v.impact)).length} 個嚴重/重大掃描問題；報告 ${resolve(out, 'results.json')}`);
if (rejects.length || assetWarnings.length) process.exitCode = 1;
