import { chromium } from 'playwright-core';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDir = resolve(root, 'docs/qa/professional-rebuild/videos');
const tempDir = resolve(outputDir, `capture-${Date.now()}`);
const baseUrl = (process.env.SITE_URL || 'https://hoyinyim.github.io').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const pause = (ms = 700) => new Promise((done) => setTimeout(done, ms));

await mkdir(tempDir, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

async function recordDesktop() {
  const context = await browser.newContext({
    locale: 'zh-TW',
    viewport: { width: 1280, height: 720 },
    permissions: ['clipboard-read', 'clipboard-write'],
    recordVideo: { dir: tempDir, size: { width: 1280, height: 720 } }
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/index.html?recording=desktop`, { waitUntil: 'networkidle' });
  await pause(1200);
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const ratio of [.18, .4, .65, .88, 1]) {
    await page.evaluate((top) => scrollTo({ top, behavior: 'smooth' }), Math.round(maxScroll * ratio));
    await pause(750);
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' }));
  await pause(900);
  await page.locator('[data-menu-open]').click();
  await pause(1100);
  await page.locator('[data-menu-close]').click();
  await page.keyboard.press('Control+KeyK');
  await page.locator('[data-search-input]').fill('畏天用身');
  await page.locator('[data-search-results] a').first().waitFor({ state: 'visible' });
  await pause(1200);
  await page.keyboard.press('Escape');

  await page.goto(`${baseUrl}/journal-papers.html?recording=desktop`, { waitUntil: 'networkidle' });
  await page.locator('[data-publication-filter="2024"]').click();
  await pause(900);
  const visibleEntry = page.locator('[data-publication]:visible').first();
  await visibleEntry.scrollIntoViewIfNeeded();
  await visibleEntry.locator('summary').click();
  await pause(900);
  await visibleEntry.locator('[data-copy]').click();
  await pause(800);

  await page.goto(`${baseUrl}/conference-papers.html?recording=desktop`, { waitUntil: 'networkidle' });
  await page.locator('.conference-published').scrollIntoViewIfNeeded();
  await pause(1000);
  await page.locator('.conference-published a').first().focus();
  await pause(900);
  await page.locator('.conference-ledger').scrollIntoViewIfNeeded();
  await pause(900);

  await page.goto(`${baseUrl}/about.html?recording=desktop`, { waitUntil: 'networkidle' });
  await page.locator('.education-section').scrollIntoViewIfNeeded();
  await page.locator('[data-timeline-tab="1"]').click();
  await pause(1200);

  await page.goto(`${baseUrl}/certificates.html?recording=desktop`, { waitUntil: 'networkidle' });
  await page.locator('.credential-archive').scrollIntoViewIfNeeded();
  await pause(1000);
  await page.locator('.award-archive').scrollIntoViewIfNeeded();
  await pause(1200);
  const video = page.video();
  await context.close();
  await copyFile(await video.path(), resolve(outputDir, 'desktop-walkthrough.webm'));
}

async function recordMobile() {
  const context = await browser.newContext({
    locale: 'zh-TW',
    viewport: { width: 390, height: 844 },
    recordVideo: { dir: tempDir, size: { width: 390, height: 844 } }
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/index.html?recording=mobile`, { waitUntil: 'networkidle' });
  await pause(1100);
  await page.locator('[data-menu-open]').click();
  await pause(1100);
  await page.keyboard.press('Escape');
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * .42, behavior: 'smooth' }));
  await pause(1000);
  await page.goto(`${baseUrl}/conference-papers.html?recording=mobile`, { waitUntil: 'networkidle' });
  await page.locator('.conference-published').scrollIntoViewIfNeeded();
  await pause(1000);
  await page.locator('.conference-ledger').scrollIntoViewIfNeeded();
  await pause(1200);
  const video = page.video();
  await context.close();
  await copyFile(await video.path(), resolve(outputDir, 'mobile-walkthrough.webm'));
}

try {
  await recordDesktop();
  await recordMobile();
} finally {
  await browser.close();
  await rm(tempDir, { recursive: true, force: true });
}

console.log(`操作錄影完成：${resolve(outputDir, 'desktop-walkthrough.webm')}、${resolve(outputDir, 'mobile-walkthrough.webm')}`);
