import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const outDir = resolve(root, 'docs/qa/ancient-script-site');
await mkdir(resolve(outDir, 'screenshots'), { recursive: true });

const pages = {
  'index.html': 'study-oracle',
  'about.html': 'person-oracle',
  'research.html': 'study-oracle',
  'publications.html': 'book-oracle',
  'journal-papers.html': 'book-oracle',
  'conference-papers.html': 'speech-oracle',
  'translations.html': 'speech-oracle',
  'certificates.html': 'journey-oracle',
  'teaching.html': 'teach-oracle',
  'cv.html': 'journey-oracle',
  'contact.html': 'speech-oracle'
};
const widths = [320, 360, 390, 430, 768, 1024, 1440, 1920];
const errors = [];
let checks = 0;
const check = (condition, message, detail = {}) => {
  checks += 1;
  if (!condition) errors.push({ message, ...detail });
};

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const context = await browser.newContext({ locale: 'zh-TW', colorScheme: 'light' });
  const page = await context.newPage();
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    for (const [path, expectedGlyph] of Object.entries(pages)) {
      await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
      const result = await page.evaluate(() => {
        const primary = [...document.querySelectorAll('main .page-glyph')];
        const h1 = document.querySelector('main h1');
        const style = primary[0] ? getComputedStyle(primary[0]) : null;
        return {
          primaryCount: primary.length,
          glyph: primary[0]?.dataset.siteGlyph || null,
          hidden: primary[0]?.getAttribute('aria-hidden') || null,
          alt: primary[0]?.querySelector('img')?.getAttribute('alt') ?? null,
          pointerEvents: style?.pointerEvents || null,
          opacity: style ? Number.parseFloat(style.opacity) : null,
          h1: h1?.textContent.trim() || '',
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          footerGlyphs: document.querySelectorAll('.site-footer .mini-glyph').length
        };
      });
      check(result.primaryCount === 1, '每頁必須只有一個 A 級主字形', { width, path, count: result.primaryCount });
      check(result.glyph === expectedGlyph, '頁面主字形映射錯誤', { width, path, expectedGlyph, actual: result.glyph });
      check(result.hidden === 'true' && result.alt === '', '裝飾字形未正確排除於輔助科技', { width, path });
      check(result.pointerEvents === 'none', '主字形不應攔截操作', { width, path, pointerEvents: result.pointerEvents });
      check(Boolean(result.h1), '現代繁體中文 H1 遺漏', { width, path });
      check(result.overflow <= 1, '古文字構圖造成水平溢出', { width, path, overflow: result.overflow });
      check(result.footerGlyphs === 3, 'Footer 微型字形數量錯誤', { width, path, footerGlyphs: result.footerGlyphs });
    }
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  for (const path of Object.keys(pages)) {
    await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
    const zoom = await page.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      h1Visible: Boolean(document.querySelector('h1')?.getClientRects().length)
    }));
    check(zoom.overflow <= 1 && zoom.h1Visible, '200％ Zoom 下內容溢出或 H1 不可見', { path, ...zoom });
  }
  await context.close();

  for (const mode of ['dark', 'reduced', 'forced']) {
    const options = { viewport: { width: 1440, height: 1000 } };
    if (mode === 'dark') options.colorScheme = 'dark';
    if (mode === 'reduced') options.reducedMotion = 'reduce';
    if (mode === 'forced') options.forcedColors = 'active';
    const modeContext = await browser.newContext(options);
    const modePage = await modeContext.newPage();
    for (const path of Object.keys(pages)) {
      await modePage.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
      const state = await modePage.evaluate((activeMode) => {
        const glyph = document.querySelector('main .page-glyph');
        const image = glyph?.querySelector('img');
        const glyphStyle = glyph ? getComputedStyle(glyph) : null;
        const imageStyle = image ? getComputedStyle(image) : null;
        return {
          h1: document.querySelector('h1')?.textContent.trim() || '',
          glyphDisplay: glyphStyle?.display || null,
          glyphFilter: imageStyle?.filter || null,
          animation: glyphStyle?.animationName || null,
          transition: glyphStyle?.transitionDuration || null,
          mediaActive: activeMode === 'dark' ? matchMedia('(prefers-color-scheme: dark)').matches : activeMode === 'reduced' ? matchMedia('(prefers-reduced-motion: reduce)').matches : matchMedia('(forced-colors: active)').matches
        };
      }, mode);
      check(Boolean(state.h1) && state.mediaActive, `${mode} 模式下內容或媒體條件失效`, { path, ...state });
      if (mode === 'dark') check(state.glyphDisplay !== 'none' && state.glyphFilter !== 'none', '深色模式主字形未轉換', { path, ...state });
      if (mode === 'reduced') check(state.animation === 'none' && Number.parseFloat(state.transition) <= 0.000011, 'Reduced Motion 尚有字形動態', { path, ...state });
      if (mode === 'forced') check(state.glyphDisplay === 'none', 'Forced Colors 未移除大型裝飾字形', { path, ...state });
    }
    if (mode !== 'forced') {
      await modePage.goto(`${baseUrl}/publications.html`, { waitUntil: 'networkidle' });
      await modePage.screenshot({ path: resolve(outDir, 'screenshots', `publications-${mode}-1440.png`), fullPage: true });
    }
    await modeContext.close();
  }

  const missingContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await missingContext.route('**/*', (route) => route.request().url().includes('/images/ancient-script/') ? route.abort() : route.continue());
  const missingPage = await missingContext.newPage();
  for (const path of Object.keys(pages)) {
    await missingPage.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
    await missingPage.waitForTimeout(80);
    const state = await missingPage.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent.trim() || '',
      primaryFailed: document.querySelector('main .page-glyph')?.dataset.loadFailed === 'true',
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth
    }));
    check(Boolean(state.h1) && state.primaryFailed && state.overflow <= 1, '字形資產失敗時內容未正常降級', { path, ...state });
  }
  await missingPage.goto(`${baseUrl}/publications.html`, { waitUntil: 'networkidle' });
  await missingPage.screenshot({ path: resolve(outDir, 'screenshots', 'publications-missing-glyphs-390.png'), fullPage: true });
  await missingContext.close();

  const printContext = await browser.newContext({ viewport: { width: 1024, height: 900 } });
  const printPage = await printContext.newPage();
  await printPage.goto(`${baseUrl}/cv.html`, { waitUntil: 'networkidle' });
  await printPage.emulateMedia({ media: 'print' });
  const printState = await printPage.evaluate(() => ({
    glyphsVisible: [...document.querySelectorAll('.site-glyph')].filter((node) => getComputedStyle(node).display !== 'none').length,
    h1: document.querySelector('h1')?.textContent.trim() || ''
  }));
  check(printState.glyphsVisible === 0 && Boolean(printState.h1), 'CV 列印模式仍顯示古文字或正文遺漏', printState);
  await printContext.close();
} catch (error) {
  errors.push({ message: '測試執行階段錯誤', error: String(error), stack: error?.stack || '' });
} finally {
  const report = { generatedAt: new Date().toISOString(), baseUrl, pages, widths, checks, passed: errors.length === 0, errors };
  await writeFile(resolve(outDir, 'results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  if (errors.length) process.exitCode = 1;
  await browser.close();
}

if (errors.length) {
  console.error(`古文字全站測試失敗：${errors.length} 項／${checks} 項。`);
  errors.slice(0, 40).forEach((error) => console.error(`- ${JSON.stringify(error)}`));
} else {
  console.log(`古文字全站測試通過：${checks} 項，涵蓋 11 頁、8 種寬度、200％、深色、Reduced Motion、Forced Colors、缺圖與 CV 列印。`);
}
