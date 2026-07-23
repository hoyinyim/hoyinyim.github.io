import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = resolve(root, process.env.OPTICAL_AUDIT_DIR || 'docs/qa/optical-scale');
const pages = ['index.html', 'about.html', 'research.html', 'publications.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'certificates.html', 'teaching.html', 'cv.html', 'contact.html'];
const viewports = [
  [1920, 1080], [1680, 1050], [1440, 900], [1366, 768], [1280, 800], [1024, 768], [834, 1194],
  [768, 1024], [430, 932], [412, 915], [390, 844], [375, 812], [360, 800], [320, 720]
].map(([width, height]) => ({ width, height }));
const zooms = [100, 110, 125, 150, 175, 200];
const breakpointWidths = [...new Set([...Array.from({ length: 21 }, (_, index) => 320 + index * 80), 740, 760, 780, 880, 900, 920, 980, 1000, 1020])].sort((a, b) => a - b);
const manifestPath = resolve(outDir, 'optical-scale-manifest.json');
const report = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : { generatedAt: new Date().toISOString(), baseUrl, engines: { chrome: existsSync(chromePath), firefox: existsSync('C:\\Program Files\\Mozilla Firefox\\firefox.exe'), safari: false }, viewports, zooms, captures: [], measurements: [], issues: [] };
report.resumedAt = new Date().toISOString();
const writeReport = () => writeFile(manifestPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const safe = (value) => value.replace(/\.html$/, '').replaceAll('/', '-');

await mkdir(outDir, { recursive: true });
if (!report.engines.chrome) throw new Error(`找不到 Chrome：${chromePath}`);
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  const context = await browser.newContext({ locale: 'zh-TW', colorScheme: 'light', deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const path of pages) {
      await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
      const screenshot = `full/${safe(path)}-${viewport.width}x${viewport.height}-100.jpg`;
      if (existsSync(resolve(outDir, screenshot))) continue;
      await mkdir(resolve(outDir, 'full'), { recursive: true });
      await page.screenshot({ path: resolve(outDir, screenshot), fullPage: true, type: 'jpeg', quality: 72 });
      const measurement = await page.evaluate(() => ({
        h1: document.querySelector('h1')?.textContent.trim() || '',
        bodyFont: getComputedStyle(document.body).fontSize,
        h1Font: getComputedStyle(document.querySelector('h1')).fontSize,
        headerHeight: document.querySelector('.site-header')?.getBoundingClientRect().height || 0,
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        glyphs: document.querySelectorAll('[data-site-glyph]').length,
        smallText: [...document.querySelectorAll('.breadcrumb,.overline,figcaption,.publication-meta,.publication-venue,time,.header-control,.footer-contact a')].map((node) => parseFloat(getComputedStyle(node).fontSize)).filter(Boolean),
        firstViewportLinks: [...document.querySelectorAll('main a')].filter((node) => node.getBoundingClientRect().top < innerHeight).map((node) => node.textContent.trim()).slice(0, 8)
      }));
      report.captures.push({ kind: 'full', path, viewport, zoom: 100, screenshot });
      report.measurements.push({ kind: 'full', path, viewport, zoom: 100, ...measurement });
      if (measurement.overflow > 1) report.issues.push({ path, viewport, zoom: 100, component: 'page', issue: `水平溢出 ${measurement.overflow}px` });
      if (measurement.smallText.some((size) => size < 16)) report.issues.push({ path, viewport, zoom: 100, component: 'small-text', issue: '功能性小字低於 16px' });
      await writeReport();
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await mkdir(resolve(outDir, 'zoom'), { recursive: true });
  for (const zoom of zooms) {
    for (const path of pages) {
      await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
      await page.evaluate((value) => { document.documentElement.style.zoom = `${value}%`; }, zoom);
      const screenshot = `zoom/${safe(path)}-1440x900-${zoom}.jpg`;
      if (existsSync(resolve(outDir, screenshot))) { await page.evaluate(() => { document.documentElement.style.zoom = ''; }); continue; }
      await page.screenshot({ path: resolve(outDir, screenshot), fullPage: true, type: 'jpeg', quality: 72 });
      const measurement = await page.evaluate(() => ({ overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth, h1Visible: Boolean(document.querySelector('h1')?.getClientRects().length), readingOrder: [...document.querySelectorAll('h1,h2,h3,p,a,button')].slice(0, 12).map((node) => node.textContent.trim()).filter(Boolean) }));
      report.captures.push({ kind: 'zoom-proxy', path, viewport: { width: 1440, height: 900 }, zoom, screenshot });
      report.measurements.push({ kind: 'zoom-proxy', path, viewport: { width: 1440, height: 900 }, zoom, ...measurement });
      if (measurement.overflow > 1 || !measurement.h1Visible) report.issues.push({ path, viewport: { width: 1440, height: 900 }, zoom, component: 'zoom', issue: '縮放後出現水平溢出或 H1 不可見' });
      await page.evaluate(() => { document.documentElement.style.zoom = ''; });
      await writeReport();
    }
  }
  await mkdir(resolve(outDir, 'critical-widths'), { recursive: true });
  for (const width of breakpointWidths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    const screenshot = `critical-widths/index-${width}x900.jpg`;
    if (existsSync(resolve(outDir, screenshot))) continue;
    await page.screenshot({ path: resolve(outDir, screenshot), fullPage: true, type: 'jpeg', quality: 68 });
    const measurement = await page.evaluate(() => ({ overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth, header: document.querySelector('.site-header')?.getBoundingClientRect().height || 0, h1: getComputedStyle(document.querySelector('h1')).fontSize, menuVisible: getComputedStyle(document.querySelector('[data-menu-open]')).display !== 'none' }));
    report.captures.push({ kind: 'critical-width', path: 'index.html', viewport: { width, height: 900 }, zoom: 100, screenshot });
    report.measurements.push({ kind: 'critical-width', path: 'index.html', viewport: { width, height: 900 }, zoom: 100, ...measurement });
    if (measurement.overflow > 1) report.issues.push({ path: 'index.html', viewport: { width, height: 900 }, zoom: 100, component: 'critical-width', issue: `水平溢出 ${measurement.overflow}px` });
    await writeReport();
  }
  await context.close();
} finally {
  await browser.close();
}
await writeReport();
console.log(`光學驗收素材完成：${report.captures.length} 張截圖；${report.measurements.length} 筆量測；${report.issues.length} 項自動提示。`);
