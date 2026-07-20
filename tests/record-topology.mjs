import { chromium } from 'playwright-core';
import { mkdir, rename, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const outDir = resolve(root, 'docs/qa/homepage-topology/videos');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

async function record(name, options, action) {
  const viewport = options.viewport || { width: 1440, height: 1000 };
  const context = await browser.newContext({ locale: 'zh-TW', viewport, colorScheme: options.colorScheme || 'light', reducedMotion: options.reducedMotion || 'no-preference', recordVideo: { dir: outDir, size: viewport } });
  const page = await context.newPage();
  const video = page.video();
  await action(page);
  await context.close();
  const target = resolve(outDir, name);
  await rm(target, { force: true });
  await rename(await video.path(), target);
}

try {
  await record('topology-entry.webm', {}, async (page) => {
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-topology]').scrollIntoViewIfNeeded();
    await pause(1700);
  });

  await record('topology-hover-focus.webm', {}, async (page) => {
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    const topology = page.locator('[data-topology]');
    await topology.scrollIntoViewIfNeeded();
    for (const domain of ['research', 'service', 'teaching']) {
      const link = page.locator(`[data-topology-domain="${domain}"]`);
      await link.hover();
      await pause(850);
      await link.focus();
      await pause(550);
    }
  });

  await record('topology-keyboard.webm', {}, async (page) => {
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('[data-topology]').scrollIntoViewIfNeeded();
    await page.locator('[data-topology-domain="research"]').focus();
    await pause(650);
    await page.keyboard.press('Tab');
    await pause(650);
    await page.keyboard.press('Tab');
    await pause(650);
    await page.keyboard.press('Shift+Tab');
    await pause(650);
  });

  await record('topology-mobile-tap.webm', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async (page) => {
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('[data-topology]').scrollIntoViewIfNeeded();
    await pause(900);
    await page.locator('[data-topology-domain="teaching"]').click();
    await page.waitForLoadState('networkidle');
    await pause(1000);
  });

  await record('topology-page-transition.webm', {}, async (page) => {
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('[data-topology]').scrollIntoViewIfNeeded();
    await pause(650);
    await page.locator('[data-topology-domain="research"]').click();
    await page.waitForLoadState('networkidle');
    await pause(900);
    await page.goBack({ waitUntil: 'networkidle' });
    await page.locator('[data-topology]').scrollIntoViewIfNeeded();
    await pause(750);
  });
} finally {
  await browser.close();
}

console.log('三域拓樸錄影已產生：首次進場、Hover／Focus、鍵盤、手機點擊與頁面轉場。');
