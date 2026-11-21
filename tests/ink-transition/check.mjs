import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const screenshots = process.env.INK_QA_DIR;
const browser = await chromium.launch({ executablePath: chromePath });
const measure = () => {
  const box = (selector) => document.querySelector(selector).getBoundingClientRect();
  return {
    indexBottom: box('.home-archive-index').bottom,
    screen: innerHeight,
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
    portraitWidth: box('.home-portrait').width,
    portraitSeparated: box('.home-identity').right <= box('.home-portrait').left,
    controls: [...document.querySelectorAll('.hero-actions a, .home-archive-index a')].map((item) => item.getBoundingClientRect().height)
  };
};

try {
  if (screenshots) await mkdir(screenshots, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript((capture) => {
    addEventListener('pagereveal', (event) => {
      window.inkQa = { native: Boolean(event.viewTransition) };
      event.viewTransition?.ready.then(() => {
        const animations = document.getAnimations().filter((animation) => animation.animationName?.startsWith('ink-'));
        window.inkQa.names = animations.map((animation) => animation.animationName);
        if (capture) animations.forEach((animation) => animation.pause());
      }, (error) => { window.inkQa.error = String(error); });
      event.viewTransition?.finished.then(() => { window.inkQa.finished = true; });
    });
  }, Boolean(screenshots));
  for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(measure);
    assert.ok(result.indexBottom < result.screen && result.overflow <= 1, `${width}px academic index is in first fold, no overflow: ${JSON.stringify(result)}`);
    assert.ok(result.portraitSeparated && result.portraitWidth >= 80 && result.controls.every((height) => height >= 44), `${width}px portrait and touch targets`);
    assert.equal(await page.locator('.ink-transition').isVisible(), false, 'No first-load overlay');
    if (screenshots && width === 390) await page.screenshot({ path: `${screenshots}/home-mobile.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.hero-actions a[href="research.html"]').click();
  await page.waitForURL('**/research.html');
  await page.waitForFunction(() => window.inkQa?.names || window.inkQa?.error);
  const ink = await page.evaluate(() => window.inkQa);
  assert.equal(ink.error, undefined);
  assert.equal(await page.locator('.ink-transition').getAttribute('data-ink-glyph'), 'chu-study');
  assert.equal(ink.names.filter((name) => name === 'ink-fold').length, 3, 'Native navigation animates the three fragments of the destination glyph');
  if (screenshots) {
    for (const [phase, time] of [['separate', 88], ['join', 221]]) {
      await page.evaluate((time) => document.getAnimations().filter((animation) => animation.animationName?.startsWith('ink-')).forEach((animation) => { animation.currentTime = time; }), time);
      await page.screenshot({ path: `${screenshots}/ink-${phase}.png` });
    }
    await page.evaluate(() => document.getAnimations().filter((animation) => animation.animationName?.startsWith('ink-')).forEach((animation) => animation.play()));
  }
  await page.waitForFunction(() => window.inkQa?.finished);
  assert.equal(await page.locator('.ink-transition').isVisible(), false, 'Overlay is removed at the end');
  await page.locator('.brand').click();
  await page.waitForURL('**/index.html');
  await page.waitForFunction(() => window.inkQa?.names || window.inkQa?.error);
  const homeInk = await page.evaluate(() => window.inkQa);
  assert.equal(homeInk.error, undefined);
  assert.equal(await page.locator('.ink-transition').getAttribute('data-ink-glyph'), 'name');
  assert.equal(homeInk.names.filter((name) => name === 'ink-fold').length, 9, 'Returning home still assembles the three personal glyphs');
  if (screenshots) await page.evaluate(() => document.getAnimations().filter((animation) => animation.animationName?.startsWith('ink-')).forEach((animation) => animation.play()));
  await page.waitForFunction(() => window.inkQa?.finished);
  await page.close();

  for (const preferences of [{ reducedMotion: 'reduce' }, { forcedColors: 'active' }]) {
    const fallback = await browser.newPage({ ...preferences, viewport: { width: 390, height: 844 } });
    await fallback.addInitScript(() => addEventListener('pagereveal', (event) => { window.inkNative = Boolean(event.viewTransition); }));
    await fallback.goto(`${base}/index.html`);
    await fallback.locator('.hero-actions a[href="research.html"]').click();
    await fallback.waitForURL('**/research.html');
    await fallback.waitForFunction(() => window.inkNative !== undefined);
    assert.equal(await fallback.evaluate(() => window.inkNative), false, 'Accessible mode uses ordinary navigation');
    assert.equal(await fallback.locator('.ink-transition').isVisible(), false);
    await fallback.close();
  }
  console.log('手機首屏及古文字轉場通過：320／390／430px，目的頁三分片、首頁九分片；減少動態、高對比及首次進站不播放。');
} finally {
  await browser.close();
}
