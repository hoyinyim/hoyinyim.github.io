import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const outDir = resolve(root, 'docs/qa/professional-rebuild/screenshots');
const topologyOutDir = resolve(root, 'docs/qa/homepage-topology/screenshots');
await mkdir(outDir, { recursive: true });
await mkdir(topologyOutDir, { recursive: true });
const widths = [320, 360, 375, 390, 430, 540, 768, 820, 1024, 1280, 1440, 1920];
const pages = ['index.html', 'about.html', 'research.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'certificates.html', 'teaching.html', 'cv.html', 'contact.html'];
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ locale: 'zh-TW', colorScheme: 'light', reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
const measurements = [];
const check = (condition, message, detail = {}) => { if (!condition) errors.push({ message, ...detail }); };

try {
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 540 ? 844 : 900 });
    for (const path of pages) {
      await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
        };
        const metadata = [...document.querySelectorAll('.overline,.publication-meta,.publication-venue,.status-list,.conference-year p,.credential-ledger li > p,.cv-list time,.cv-list small,.section-index > p,figcaption')]
          .filter(visible).map((element) => parseFloat(getComputedStyle(element).fontSize));
        const clipped = [...document.querySelectorAll('h1,h2,h3,h4,p,a,button,dd')].filter((element) => !element.classList.contains('visually-hidden')).filter(visible).filter((element) => {
          const style = getComputedStyle(element);
          return (['hidden', 'clip'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2) || (['hidden', 'clip'].includes(style.overflowY) && element.scrollHeight > element.clientHeight + 2);
        }).slice(0, 5).map((element) => element.textContent.trim().slice(0, 80));
        const touchTargets = innerWidth <= 540 ? [...document.querySelectorAll('button,a[href]')].filter(visible).filter((element) => {
          const box = element.getBoundingClientRect();
          return box.width < 42 || box.height < 42;
        }).slice(0, 5).map((element) => element.textContent.trim().slice(0, 50)) : [];
        return {
          bodyFont: parseFloat(getComputedStyle(document.body).fontSize),
          navFont: document.querySelector('.primary-nav') && visible(document.querySelector('.primary-nav')) ? parseFloat(getComputedStyle(document.querySelector('.primary-nav')).fontSize) : null,
          minMetadata: metadata.length ? Math.min(...metadata) : null,
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          clipped, touchTargets,
          h1: document.querySelectorAll('h1').length,
          mainWidth: document.querySelector('main').getBoundingClientRect().width
        };
      });
      measurements.push({ width, path, ...result });
      check(result.overflow <= 1, '水平溢出', { width, path, overflow: result.overflow });
      check(result.bodyFont >= 17 && result.bodyFont <= 19.1, '正文基準字級不在 17–19px', { width, path, bodyFont: result.bodyFont });
      if (result.minMetadata !== null) check(result.minMetadata >= 14, 'Metadata 小於 14px', { width, path, minMetadata: result.minMetadata });
      if (result.navFont !== null) check(result.navFont >= 16, '桌面導覽小於 16px', { width, path, navFont: result.navFont });
      check(result.clipped.length === 0, '文字遭裁切', { width, path, samples: result.clipped });
      check(result.h1 === 1, 'H1 不是唯一', { width, path, count: result.h1 });
      check(result.mainWidth <= width + 1, 'Main 超出視窗', { width, path, mainWidth: result.mainWidth });
    }
  }

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: resolve(outDir, 'home-hero-1920x1080.png') });
  await page.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, 'topology-1920-default.png') });

  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, `topology-${width}-default.png`) });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const path of pages) {
    await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: resolve(outDir, `${path.replace('.html', '')}-1440-full.png`), fullPage: true });
  }
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, 'topology-1440-default.png') });
  for (const domain of ['research', 'service', 'teaching']) {
    const link = page.locator(`[data-topology-domain="${domain}"]`);
    await link.focus();
    check(await link.evaluate((node) => node === document.activeElement), `拓樸 ${domain} Focus 狀態失敗`, { domain });
    await page.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, `topology-${domain}-focus.png`) });
  }
  await page.locator('body').click({ position: { x: 4, y: 4 } });
  await page.locator('[data-menu-open]').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(outDir, 'menu-desktop-1440.png') });
  const desktopMenuFont = await page.locator('.menu-item-label').first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  check(desktopMenuFont >= 32, '桌面 Menu 頁名小於 32px', { desktopMenuFont });
  await page.keyboard.press('Escape');
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+KeyK' : 'Control+KeyK');
  await page.screenshot({ path: resolve(outDir, 'search-desktop-1440.png') });
  await page.keyboard.press('Escape');
  await page.goto(`${baseUrl}/about.html`, { waitUntil: 'networkidle' });
  await page.locator('.about-education').screenshot({ path: resolve(outDir, 'education-timeline-1440.png') });
  await page.locator('.site-footer').screenshot({ path: resolve(outDir, 'footer-1440.png') });

  await page.goto(`${baseUrl}/certificates.html`, { waitUntil: 'networkidle' });
  await page.locator('.credential-ledger').screenshot({ path: resolve(outDir, 'certificate-archive-1440.png') });

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: resolve(outDir, `home-${width}-full.png`), fullPage: true });
    await page.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, `topology-${width}-default.png`) });
    await page.locator('[data-menu-open]').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: resolve(outDir, `menu-${width}.png`) });
    const menuFont = await page.locator('.menu-item-label').first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    check(menuFont >= 28, '手機 Menu 頁名小於 28px', { width, menuFont });
    await page.keyboard.press('Escape');
  }

  const darkContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' });
  const darkPage = await darkContext.newPage();
  await darkPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await darkPage.screenshot({ path: resolve(outDir, 'home-dark-1440.png'), fullPage: true });
  await darkPage.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, 'topology-dark-1440.png') });
  await darkContext.close();

  const motionContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const motionPage = await motionContext.newPage();
  await motionPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  check(await motionPage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), 'Reduced Motion 未生效');
  await motionPage.screenshot({ path: resolve(outDir, 'home-reduced-motion-1440.png') });
  await motionPage.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, 'topology-reduced-motion-1440.png') });
  await motionContext.close();

  const contrastContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, forcedColors: 'active' });
  const contrastPage = await contrastContext.newPage();
  await contrastPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  check(await contrastPage.evaluate(() => matchMedia('(forced-colors: active)').matches), 'Forced Colors 高對比模式未生效');
  await contrastPage.screenshot({ path: resolve(outDir, 'home-forced-colors-1440.png') });
  await contrastContext.close();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}/conference-papers.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
  const zoomResult = await page.evaluate(() => ({ overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth, controls: [...document.querySelectorAll('button,a[href]')].filter((element) => { const box = element.getBoundingClientRect(); return box.right > innerWidth + 1; }).length }));
  check(zoomResult.overflow <= 1 && zoomResult.controls === 0, '200% Zoom 模擬出現溢出或不可見控制項', zoomResult);
  await page.screenshot({ path: resolve(outDir, 'conference-200-percent.png'), fullPage: true });

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
  const topologyZoom = await page.evaluate(() => ({ overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth, links: [...document.querySelectorAll('[data-topology-domain]')].map((element) => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height, visibleWidth: Math.min(box.right, innerWidth) - Math.max(box.left, 0), visibleHeight: Math.min(box.bottom, innerHeight) - Math.max(box.top, 0) }; }) }));
  check(topologyZoom.overflow <= 1 && topologyZoom.links.every((link) => link.width >= 44 && link.height >= 44 && link.visibleWidth >= 44), '三域拓樸 200% Zoom 溢出或觸控區失效', topologyZoom);
  await page.locator('[data-topology]').screenshot({ path: resolve(topologyOutDir, 'topology-200-percent.png') });
} finally {
  await browser.close();
}

const report = { generatedAt: new Date().toISOString(), baseUrl, widths, pages, checks: measurements.length, passed: errors.length === 0, errors, measurements };
await writeFile(resolve(root, 'docs/qa/professional-rebuild/visual-responsive-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (errors.length) {
  console.error(`響應式／視覺測試失敗：${errors.length} 項。`);
  errors.slice(0, 30).forEach((error) => console.error(`- ${JSON.stringify(error)}`));
  process.exitCode = 1;
} else console.log(`響應式／視覺測試通過：${measurements.length} 個頁面／尺寸組合，並產生全站與三域拓樸驗收截圖。`);
