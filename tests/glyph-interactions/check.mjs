import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const base = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const browser = await chromium.launch({ executablePath });
const output = process.env.INK_QA_DIR;
const goHome = (page) => page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
const countMovingBands = (name) => [...document.getAnimations()].filter((animation) => animation.animationName === name).length;
const settle = (page, selector) => page.locator(selector).waitFor({ state: 'hidden' });

try {
  if (output) await mkdir(output, { recursive: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  await goHome(desktop);
  const stamp = desktop.locator('[data-name-stamp-trigger]');
  await stamp.waitFor();
  assert.ok((await stamp.boundingBox()).height >= 44);
  await stamp.focus();
  await desktop.waitForFunction(() => getComputedStyle(document.querySelector('.home-name-stamp .ink-local-glyph'), '::before').translate !== '0px');
  await stamp.press('Enter');
  await desktop.waitForFunction(countMovingBands, 'stamp-impression');
  assert.equal(await desktop.evaluate(countMovingBands, 'stamp-impression'), 6, 'Two outer masks per personal glyph move on keyboard activation');
  assert.ok(desktop.url().endsWith('/index.html'), 'Preview does not navigate');
  await desktop.waitForFunction(() => !document.querySelector('[data-name-stamp]').hasAttribute('data-ink-pulse'));
  await desktop.locator('[data-menu-open]').click();
  await desktop.waitForFunction(() => [...document.querySelectorAll('[data-menu-glyph]')].every((image) => image.dataset.inkReady === 'true'));
  await desktop.locator('[data-menu-target="publications"]').focus();
  await desktop.waitForFunction(countMovingBands, 'menu-ink-rejoin');
  assert.equal(await desktop.evaluate(countMovingBands, 'menu-ink-rejoin'), 3, 'Only the selected menu glyph assembles');
  assert.equal(await desktop.locator('[data-menu-glyph][data-active="true"]').getAttribute('data-menu-glyph'), 'publications');
  if (output) {
    await desktop.evaluate(() => document.getAnimations().filter((a) => /^menu-ink-/.test(a.animationName || '')).forEach((a) => { a.pause(); a.currentTime = 105; }));
    await desktop.screenshot({ path: `${output}/menu-split.png` });
    await desktop.evaluate(() => document.getAnimations().filter((a) => /^menu-ink-/.test(a.animationName || '')).forEach((a) => a.play()));
  }
  await desktop.keyboard.press('Escape');
  await settle(desktop, '[data-menu-dialog]');
  assert.equal(await desktop.locator('[data-menu-open]').evaluate((node) => document.activeElement === node), true);
  const research = desktop.locator('[data-topology-domain="research"]');
  await research.scrollIntoViewIfNeeded();
  await research.locator('.ink-local-glyph').waitFor();
  await research.focus();
  assert.equal(await research.locator('.ink-local-glyph').evaluate((node) => getComputedStyle(node).getPropertyValue('--ink-local-x').trim()), '3.5px');
  await desktop.goto(`${base}/publications.html`, { waitUntil: 'networkidle' });
  const category = desktop.locator('.publications-index a[href="journal-papers.html"]');
  await category.locator('.ink-local-glyph').waitFor();
  await category.focus();
  assert.equal(await category.locator('.ink-local-glyph').evaluate((node) => getComputedStyle(node).getPropertyValue('--ink-local-x').trim()), '3.5px');
  await desktop.close();

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await goHome(phone);
  await phone.locator('[data-name-stamp-trigger]').tap();
  await phone.waitForFunction(countMovingBands, 'stamp-impression');
  assert.ok(phone.url().endsWith('/index.html'), 'Tap on the name stamp previews without navigation');
  await phone.locator('[data-topology-domain="teaching"]').tap();
  await phone.waitForURL('**/teaching.html');
  assert.equal(await phone.locator('.ink-transition').getAttribute('data-ink-glyph'), 'chu-teaching');
  await phone.close();

  const still = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  await goHome(still);
  await still.locator('[data-name-stamp-trigger]').click();
  assert.equal(await still.evaluate(countMovingBands, 'stamp-impression'), 0, 'Reduced motion leaves the strokes assembled');
  await still.locator('[data-menu-open]').click();
  await still.locator('[data-menu-target="publications"]').focus();
  assert.equal(await still.evaluate(countMovingBands, 'menu-ink-rejoin'), 0);
  await still.close();

  const plain = await browser.newPage({ javaScriptEnabled: false });
  await goHome(plain);
  assert.equal(await plain.locator('[data-name-stamp-trigger]').isVisible(), false);
  assert.equal(await plain.locator('[data-name-stamp] img:visible').count(), 3);
  assert.equal(await plain.locator('[data-topology-domain]').count(), 3);
  await plain.close();
  console.log('古文字頁內互動通過：鍵盤、選單單一字形、手機單次點擊、減少動態與無 JavaScript 後備。');
} finally { await browser.close(); }
