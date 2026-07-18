import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE_URL = process.env.SITE_URL || 'http://127.0.0.1:4173';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const REPORT_DIR = path.join(ROOT, 'docs', 'qa', 'third-stage');
const AFTER_DIR = path.join(REPORT_DIR, 'after');
const RESULT_PATH = path.join(REPORT_DIR, 'visual-responsive-results.json');

const widths = [320, 360, 375, 390, 430, 540, 768, 820, 1024, 1280, 1440, 1920];
const pages = [
  'index.html', 'about.html', 'research.html', 'journal-papers.html',
  'conference-papers.html', 'translations.html', 'certificates.html',
  'teaching.html', 'cv.html', 'contact.html'
];
const errors = [];
const measurements = [];

function record(condition, message, context = {}) {
  if (!condition) errors.push({ message, ...context });
}

await fs.mkdir(AFTER_DIR, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({ locale: 'zh-TW', colorScheme: 'light', reducedMotion: 'reduce' });
const page = await context.newPage();

try {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 600 ? 844 : 900 });
    for (const pageName of pages) {
      await page.goto(`${BASE_URL}/${pageName}`, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        };
        const metadataSelector = '.field-meta,.meta,.venue,.source,.tag,.tags,.data-note,.timeline-item time,.record-year,.data-year,.pub-year,.filter-btn,.action-btn,.facet,.side-index,figcaption,.chapter-label,.field-eyebrow,.category';
        const metadataSizes = [...document.querySelectorAll(metadataSelector)]
          .filter(visible)
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
        const readable = [...document.querySelectorAll('.record h2,.record h3,.record p,.data-row h3,.data-row p,.field-item h3,.field-item p,.pub-main h2,.pub-main p,.work-card h3,.work-card p')]
          .filter(visible);
        const clipped = readable.filter((element) => {
          const style = getComputedStyle(element);
          const clipsX = ['hidden', 'clip'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
          const clipsY = ['hidden', 'clip'].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 2;
          return clipsX || clipsY;
        }).slice(0, 5).map((element) => element.textContent.trim().slice(0, 90));
        const offscreenControls = [...document.querySelectorAll('button,a[href]:not(.skip-link)')].filter(visible).filter((element) => {
          const rect = element.getBoundingClientRect();
          const fixed = getComputedStyle(element).position === 'fixed';
          return fixed && (rect.left < -1 || rect.right > innerWidth + 1 || rect.top < -1 || rect.bottom > innerHeight + 1);
        }).slice(0, 5).map((element) => element.getAttribute('aria-label') || element.textContent.trim().slice(0, 50));
        const nav = document.querySelector('.primary-nav');
        return {
          viewport: innerWidth,
          bodyFont: Number.parseFloat(getComputedStyle(document.body).fontSize),
          navFont: nav && visible(nav) ? Number.parseFloat(getComputedStyle(nav).fontSize) : null,
          minMetadata: metadataSizes.length ? Math.min(...metadataSizes) : null,
          horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          clipped,
          offscreenControls
        };
      });
      measurements.push({ width, page: pageName, ...result });
      record(result.horizontalOverflow <= 1, '頁面出現水平溢位', { width, page: pageName, overflow: result.horizontalOverflow });
      record(result.bodyFont >= 17 && result.bodyFont <= 19.1, '正文基準字級不在 17–19px', { width, page: pageName, bodyFont: result.bodyFont });
      if (result.minMetadata !== null) record(result.minMetadata >= 14, '必要中繼資料小於 14px', { width, page: pageName, minMetadata: result.minMetadata });
      if (result.navFont !== null) record(result.navFont >= 16, '桌面主導覽小於 16px', { width, page: pageName, navFont: result.navFont });
      record(result.clipped.length === 0, '正文或長標題被裁切', { width, page: pageName, samples: result.clipped });
      record(result.offscreenControls.length === 0, '固定操作元件超出視窗', { width, page: pageName, controls: result.offscreenControls });
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(AFTER_DIR, 'home-1440.png'), fullPage: true });
  await page.locator('.stage-menu-trigger').click();
  const desktopMenu = await page.evaluate(() => {
    const menu = document.querySelector('.nav-scene');
    const rect = menu.getBoundingClientRect();
    return {
      open: menu.classList.contains('is-open'),
      ariaHidden: menu.getAttribute('aria-hidden'),
      fits: rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1,
      current: menu.querySelectorAll('[aria-current="page"]').length,
      focused: document.activeElement?.classList.contains('nav-close') || false
    };
  });
  record(desktopMenu.open && desktopMenu.ariaHidden === 'false' && desktopMenu.fits, '桌面全螢幕選單未正確展開', desktopMenu);
  record(desktopMenu.current === 1, '全螢幕選單未唯一標示當前頁', desktopMenu);
  record(desktopMenu.focused, '全螢幕選單開啟後焦點未移入', desktopMenu);
  await page.screenshot({ path: path.join(AFTER_DIR, 'menu-1440.png'), fullPage: false });
  await page.keyboard.press('Escape');
  record(await page.locator('.stage-menu-trigger').getAttribute('aria-expanded') === 'false', 'Escape 未關閉選單');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(AFTER_DIR, 'home-390.png'), fullPage: true });
  await page.locator('.stage-menu-trigger').click();
  await page.screenshot({ path: path.join(AFTER_DIR, 'menu-390.png'), fullPage: false });
  record(await page.evaluate(() => document.querySelector('.nav-scene').scrollWidth <= innerWidth + 1), '手機選單出現水平溢位');
  await page.keyboard.press('Escape');

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle' });
  const cta = page.locator('[data-conference-cta]');
  record(await cta.getAttribute('href') === 'conference-papers.html', '首頁「查看研討會論文」連結目的頁錯誤');
  await Promise.all([page.waitForURL(/conference-papers\.html$/, { timeout: 4000 }), cta.click()]);
  record((await page.locator('.page-hero h1').innerText()).includes('研討會論文'), '首頁 CTA 導向後頁首不是研討會論文');

  await page.goto(`${BASE_URL}/conference-papers.html`, { waitUntil: 'networkidle' });
  for (const href of [
    'https://chinese.nccu.edu.tw/PageDoc/Detail?fid=8363&id=20873',
    'https://www.airitilibrary.com/Article/Detail/18172903-N202305110002-00020'
  ]) record(await page.locator(`a[href="${href}"]`).count() === 1, '指定研討會外部連結遺漏或重複', { href });

  await page.goto(`${BASE_URL}/certificates.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(AFTER_DIR, 'certificates-1280.png'), fullPage: true });
  record(await page.locator('[data-archive-preview] h3').count() === 2, '證照與獎項典藏預覽未初始化');

  for (const zoom of [1.25, 1.5, 1.75, 2]) {
    const effectiveWidth = Math.round(1280 / zoom);
    await page.setViewportSize({ width: effectiveWidth, height: 900 });
    await page.goto(`${BASE_URL}/conference-papers.html`, { waitUntil: 'networkidle' });
    const zoomOverflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
    record(zoomOverflow <= 1, '高倍率縮放等效視窗出現水平溢位', { zoom, effectiveWidth, overflow: zoomOverflow });
    if (zoom === 2) await page.screenshot({ path: path.join(AFTER_DIR, 'conference-200-percent.png'), fullPage: false });
  }

  const fallbackContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await fallbackContext.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.goto(`${BASE_URL}/journal-papers.html`, { waitUntil: 'networkidle' });
  const fallbackOverflow = await fallbackPage.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
  record(fallbackOverflow <= 1, '系統回退字型造成水平溢位', { overflow: fallbackOverflow });
  await fallbackPage.screenshot({ path: path.join(AFTER_DIR, 'journal-fallback-font-390.png'), fullPage: true });
  await fallbackContext.close();
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(), baseUrl: BASE_URL,
  engine: 'Chromium via installed Google Chrome', widths, pages,
  checks: measurements.length, passed: errors.length === 0, errors, measurements
};
await fs.writeFile(RESULT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (errors.length) {
  console.error(`響應式視覺測試失敗：${errors.length} 項。詳見 ${RESULT_PATH}`);
  errors.slice(0, 20).forEach((error) => console.error(`- ${JSON.stringify(error)}`));
  process.exitCode = 1;
} else {
  console.log(`響應式視覺測試通過：${measurements.length} 個頁面／尺寸組合。`);
}
