import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
let checks = 0;
const check = (condition, message, detail = {}) => { checks += 1; if (!condition) errors.push({ message, ...detail }); };
const widths = [320, 390, 768, 1024, 1440, 1920];
const expectedLabels = ['關於', '研究', '著作', '教學', '履歷', '聯絡'];

try {
  const context = await browser.newContext({ locale: 'zh-TW', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    check(await page.locator('html').getAttribute('lang') === 'zh-Hant', 'HTML 主要語言不是繁體中文', { width });
    check(await page.locator('.primary-nav a').evaluateAll((nodes) => nodes.every((node) => ['研究', '著作', '關於', '履歷'].includes(node.textContent.trim()))), '桌面主導覽含非繁中介面標籤', { width });
    check(await page.locator('a[href^="en/"],a[href*="/en/"]').count() === 0, '正式介面輸出尚未完成的英文路由', { width });

    const trigger = page.locator('[data-menu-open]');
    await trigger.click();
    const dialog = page.locator('[data-menu-dialog]');
    check(await dialog.evaluate((node) => node.open), '選單未開啟', { width });
    check(await trigger.getAttribute('aria-expanded') === 'true', '選單按鈕未宣告展開狀態', { width });
    check(await page.locator('body').evaluate((node) => node.classList.contains('dialog-open') && getComputedStyle(node).overflow === 'hidden'), '選單開啟時背景未鎖定', { width });
    check(JSON.stringify(await page.locator('[data-menu-target] .menu-item-label').allTextContents()) === JSON.stringify(expectedLabels), '主要選單不是六項繁體中文導覽', { width });
    check(await page.locator('[data-menu-glyph]').count() === 6, '楚系文字主圖不是六個已核定資產', { width });
    check(await page.locator('[data-menu-glyph][data-active="true"]:visible').count() === 1, '選單開啟後沒有單一有效楚系文字主圖', { width });
    check(await dialog.evaluate((node) => node.scrollWidth <= innerWidth + 1), '選單水平溢出', { width });
    check(await dialog.locator('.dialog-close').isVisible(), '關閉按鈕不可見', { width });

    const publications = page.locator('[data-menu-target="publications"]');
    await publications.focus();
    check(await dialog.getAttribute('data-active-glyph') === 'publications', '鍵盤聚焦著作後楚系文字未切換', { width });
    check(await page.locator('[data-menu-glyph="publications"][data-active="true"]').count() === 1, '著作未對應「冊」字形', { width });

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-menu-dialog]').open);
    check(await trigger.getAttribute('aria-expanded') === 'false', '選單關閉後 aria-expanded 未還原', { width });
    check(await trigger.evaluate((node) => node === document.activeElement), '選單關閉後焦點未返回', { width });
    check(!await page.locator('body').evaluate((node) => node.classList.contains('dialog-open')), '選單關閉後仍鎖定背景', { width });
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
  await page.locator('[data-menu-open]').click();
  check(await page.locator('[data-menu-dialog]').evaluate((node) => node.scrollWidth <= innerWidth + 1), '200％ Zoom 選單水平溢出');
  check(await page.locator('[data-menu-target]').evaluateAll((nodes) => nodes.every((node) => { const box = node.getBoundingClientRect(); return box.width >= 44 && box.height >= 44 && box.right <= innerWidth + 1; })), '200％ Zoom 選單觸控目標遭裁切');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-menu-dialog]').open);

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.locator('[data-menu-open]').click();
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('[data-menu-dialog] [data-theme-toggle]').click();
  check(await page.locator('html').getAttribute('data-theme') !== initialTheme, '選單內深淺模式無法操作');
  await page.locator('[data-search-from-menu]').click();
  check(await page.locator('[data-search-dialog]').evaluate((node) => node.open), '選單內搜尋無法開啟');
  await page.keyboard.press('Escape');

  await page.locator('[data-menu-open]').click();
  await Promise.all([page.waitForURL('**/research.html'), page.locator('[data-menu-target="research"]').click()]);
  check((await page.locator('h1').innerText()) === '研究', '選單頁面轉場未到研究頁');
  await page.goBack({ waitUntil: 'networkidle' });
  check(page.url().endsWith('/index.html'), '選單導航後 Browser Back 未回首頁');

  await page.locator('[data-menu-glyph="research"]').evaluate((node) => { node.src = 'images/chu-script/missing-test.png'; });
  await page.locator('[data-menu-open]').click();
  await page.locator('[data-menu-glyph="research"]').waitFor({ state: 'hidden' });
  check(await page.locator('[data-menu-target]').count() === 6 && await page.locator('[data-menu-dialog]').evaluate((node) => node.open), '楚系文字載入失敗導致選單失效');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-menu-dialog]').open);
  await context.close();

  const reducedContext = await browser.newContext({ locale: 'zh-TW', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await reducedPage.locator('[data-menu-open]').click();
  check(await reducedPage.locator('[data-menu-dialog]').evaluate((node) => node.open), 'Reduced Motion 選單未開啟');
  check(await reducedPage.locator('[data-menu-dialog]').evaluate((node) => node.getAnimations({ subtree: true }).every((animation) => Number(animation.effect.getComputedTiming().duration) <= 1)), 'Reduced Motion 仍播放組字或底板動畫');
  await reducedPage.keyboard.press('Escape');
  check(!await reducedPage.locator('[data-menu-dialog]').evaluate((node) => node.open), 'Reduced Motion 關閉未立即完成');
  await reducedContext.close();

  const darkContext = await browser.newContext({ locale: 'zh-TW', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const darkPage = await darkContext.newPage();
  await darkPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await darkPage.locator('[data-menu-open]').click();
  check(await darkPage.locator('[data-menu-glyph][data-active="true"]').isVisible(), '深色模式楚系文字不可見');
  await darkContext.close();

  const contrastContext = await browser.newContext({ locale: 'zh-TW', viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
  const contrastPage = await contrastContext.newPage();
  await contrastPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await contrastPage.locator('[data-menu-open]').click();
  check(await contrastPage.locator('[data-menu-target]').evaluateAll((nodes) => nodes.every((node) => { const box = node.getBoundingClientRect(); return box.width >= 44 && box.height >= 44; })), '高對比模式選單操作區失效');
  await contrastContext.close();

  const noScriptContext = await browser.newContext({ locale: 'zh-TW', viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto(`${baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
  check(await noScriptPage.locator('.noscript-menu a').count() === 6, '停用 JavaScript 後沒有六項備援導覽');
  check(await noScriptPage.locator('.noscript-menu').isVisible(), '停用 JavaScript 後備援導覽不可見');
  await noScriptContext.close();
} finally {
  await browser.close();
}

const report = { generatedAt: new Date().toISOString(), baseUrl, widths, checks, passed: errors.length === 0, errors };
await mkdir(resolve(root, 'docs/qa/chu-script-menu'), { recursive: true });
await writeFile(resolve(root, 'docs/qa/chu-script-menu/menu-language-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (errors.length) {
  console.error(`楚系文字選單／語言測試失敗：${errors.length} 項／${checks} 項。`);
  errors.forEach((error) => console.error(`- ${JSON.stringify(error)}`));
  process.exitCode = 1;
} else console.log(`楚系文字選單／語言測試通過：${checks} 項，涵蓋六種寬度、200％ Zoom、繁體中文、字形失敗、無 JavaScript、Reduced Motion、深色與高對比模式。`);
