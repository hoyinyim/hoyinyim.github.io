import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = resolve(root, process.env.EVIDENCE_DIR || 'docs/qa/line-break-final');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const routes = ['index.html', 'about.html', 'research.html', 'publications.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'teaching.html', 'certificates.html', 'cv.html', 'contact.html', '404.html'];
const viewports = [[320, 720], [390, 844], [768, 1024], [834, 1194], [1024, 768], [1440, 900]];
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ locale: 'zh-TW', viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
      const stem = `${route.replace('.html', '')}-${width}`;
      await page.screenshot({ path: resolve(outDir, `${stem}-full.png`), fullPage: true });
      await page.screenshot({ path: resolve(outDir, `${stem}-viewport.png`) });
      const footer = page.locator('.site-footer');
      if (await footer.count()) await footer.screenshot({ path: resolve(outDir, `${stem}-footer.png`) });
    }
    await context.close();
  }
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const context = await browser.newContext({ locale: 'zh-TW', viewport: { width, height }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('[data-menu-open]').click();
    await page.locator('.menu-dialog[open]').screenshot({ path: resolve(outDir, `menu-${width}.png`) });
    await page.locator('[data-menu-close]').click();
    await page.locator('[data-search-open]').click().catch(() => {});
    if (await page.locator('.search-dialog[open]').count()) await page.locator('.search-dialog[open]').screenshot({ path: resolve(outDir, `search-${width}.png`) });
    await context.close();
  }
  const context = await browser.newContext({ locale: 'zh-TW', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/conference-papers.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
  await page.screenshot({ path: resolve(outDir, 'conference-390-200-percent.png'), fullPage: true });
  await context.close();
} finally { await browser.close(); }
console.log(`截圖完成：${outDir}`);
