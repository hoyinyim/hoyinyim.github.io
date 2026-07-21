import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ locale: 'zh-TW', viewport: { width: 1440, height: 950 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };
const routes = [
  ['index.html', '嚴浩然'], ['about.html', '嚴浩然'], ['research.html', '研究'], ['publications.html', '著作'], ['journal-papers.html', '期刊論文'],
  ['conference-papers.html', '研討會論文'], ['translations.html', '譯著／'], ['certificates.html', '證照、證書'],
  ['teaching.html', '教學'], ['cv.html', '嚴浩然'], ['contact.html', '聯絡'], ['404.html', '找不到頁面']
];
const consoleErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(`${page.url()}: ${message.text()}`); });
page.on('pageerror', (error) => consoleErrors.push(`${page.url()}: ${error.message}`));

try {
  for (const [path, heading] of routes) {
    const response = await page.goto(`${baseUrl}/${path}`, { waitUntil: 'networkidle' });
    check(response?.ok(), `${path} HTTP 狀態失敗`);
    check((await page.locator('h1').count()) === 1, `${path} H1 不是唯一`);
    check((await page.locator('h1').innerText()).includes(heading), `${path} H1 內容錯誤`);
  }

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  const menuTrigger = page.locator('[data-menu-open]');
  check(await menuTrigger.count() === 1, 'Menu 開啟按鈕不唯一');
  await menuTrigger.click();
  check(await page.locator('[data-menu-dialog]').evaluate((dialog) => dialog.open), 'Menu Dialog 未開啟');
  check(await page.evaluate(() => document.querySelector('[data-menu-dialog]').contains(document.activeElement)), 'Menu 開啟後焦點未進入');
  for (let index = 0; index < 14; index += 1) await page.keyboard.press('Tab');
  check(await page.evaluate(() => document.querySelector('[data-menu-dialog]').contains(document.activeElement)), 'Menu Focus Trap 失效');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-menu-dialog]').open);
  check(!await page.locator('[data-menu-dialog]').evaluate((dialog) => dialog.open), 'Escape 未關閉 Menu');
  check(await page.evaluate(() => document.activeElement.matches('[data-menu-open]')), 'Menu 關閉後焦點未返回');

  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+KeyK' : 'Control+KeyK');
  check(await page.locator('[data-search-dialog]').evaluate((dialog) => dialog.open), 'Command Search 未開啟');
  await page.locator('[data-search-input]').fill('畏天用身');
  await page.locator('[data-search-results] a').waitFor({ state: 'visible' });
  check(await page.locator('[data-search-results] a').count() >= 1, '搜尋無法找到既有期刊題名');
  await page.locator('[data-search-input]').press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/journal-papers.html#year-2025');
  check(page.url().includes('journal-papers.html#year-2025'), '搜尋 Enter 未開啟結果');

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('[data-theme-toggle]').first().click();
  check(await page.locator('html').getAttribute('data-theme') !== initialTheme, '主題切換失效');
  await page.reload({ waitUntil: 'networkidle' });
  check(await page.locator('html').getAttribute('data-theme') !== initialTheme, '主題設定未保存');

  const topology = page.locator('[data-topology]');
  const researchDomain = page.locator('[data-topology-domain="research"]');
  const serviceDomain = page.locator('[data-topology-domain="service"]');
  const teachingDomain = page.locator('[data-topology-domain="teaching"]');
  check(await topology.count() === 1, '首頁三域拓樸遺漏或重複');
  check(await page.locator('[data-topology-domain]').count() === 3, '首頁三域入口不是三個');
  check(await researchDomain.getAttribute('href') === 'research.html', 'Research 拓樸入口錯誤');
  check(await serviceDomain.getAttribute('href') === 'translations.html', 'Service 拓樸入口錯誤');
  check(await teachingDomain.getAttribute('href') === 'teaching.html', 'Teaching 拓樸入口錯誤');
  check((await researchDomain.getAttribute('aria-label'))?.includes('研究'), 'Research Accessible Name 遺漏');
  check((await serviceDomain.getAttribute('aria-label'))?.includes('服務'), 'Service Accessible Name 遺漏');
  check((await teachingDomain.getAttribute('aria-label'))?.includes('教學'), 'Teaching Accessible Name 遺漏');
  await researchDomain.focus();
  check(await topology.getAttribute('data-active-domain') === 'research', 'Research Focus 未啟動拓樸狀態');
  await page.keyboard.press('Tab');
  check(await serviceDomain.evaluate((node) => node === document.activeElement), '拓樸 Tab 順序未由 Research 前往 Service');
  await page.keyboard.press('Tab');
  check(await teachingDomain.evaluate((node) => node === document.activeElement), '拓樸 Tab 順序未由 Service 前往 Teaching');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/teaching.html');
  check((await page.locator('h1').innerText()) === '教學', 'Teaching 拓樸入口導向錯誤');
  await page.goBack({ waitUntil: 'networkidle' });
  await Promise.all([page.waitForURL('**/research.html'), page.locator('[data-topology-domain="research"]').click()]);
  check((await page.locator('h1').innerText()) === '研究', 'Research 拓樸入口導向錯誤');
  await page.goBack({ waitUntil: 'networkidle' });
  await Promise.all([page.waitForURL('**/translations.html'), page.locator('[data-topology-domain="service"]').click()]);
  check((await page.locator('h1').innerText()).includes('譯著／'), 'Service 拓樸入口導向錯誤');
  await page.goBack({ waitUntil: 'networkidle' });
  check(page.url().endsWith('/index.html'), '拓樸 Browser Back 未回首頁');

  await page.goto(`${baseUrl}/conference-papers.html`, { waitUntil: 'networkidle' });
  for (const href of ['https://chinese.nccu.edu.tw/PageDoc/Detail?fid=8363&id=20873', 'https://www.airitilibrary.com/Article/Detail/18172903-N202305110002-00020']) {
    const link = page.locator(`a[href="${href}"]`);
    check(await link.count() === 1, `指定研討會連結遺漏：${href}`);
    check(await link.getAttribute('target') === '_blank' && await link.getAttribute('rel') === 'noopener noreferrer', `指定研討會連結安全屬性錯誤：${href}`);
  }

  await page.goto(`${baseUrl}/journal-papers.html`, { waitUntil: 'networkidle' });
  await page.locator('[data-publication-filter="2024"]').click();
  check(await page.locator('[data-publication]:visible').count() === 2, '期刊年份篩選結果錯誤');
  check((await page.locator('[data-publication-count]').innerText()) === '2', '期刊篩選計數錯誤');
  const details = page.locator('[data-publication]:visible details');
  check(await details.count() === 2, '篩選後引用 Disclosure 數量錯誤');
  await details.first().locator('summary').click();
  check(await details.first().getAttribute('open') !== null, '引用 Disclosure 無法展開');
  const copyButton = page.locator('[data-publication]:visible [data-copy]');
  await copyButton.first().click();
  check((await context.pages())[0] === page, '複製引用意外開啟頁面');

  await page.goto(`${baseUrl}/about.html`, { waitUntil: 'networkidle' });
  const educationRows = page.locator('.about-education .education-ledger > li');
  check(await educationRows.count() === 4, '教育時間線節點數錯誤');
  check(await educationRows.nth(3).isVisible(), '教育時間線未完整展開');

  await page.goto(`${baseUrl}/certificates.html`, { waitUntil: 'networkidle' });
  check(await page.locator('.credential-ledger > ol > li').count() === 5, '證照檔案筆數錯誤');
  check(await page.locator('.award-timeline > ol > li').count() === 4, '獎項檔案筆數錯誤');
  check(await page.getByText('文字檔案').count() === 0, '頁面不應以假文件格式呈現無圖片證書');

  await page.goto(`${baseUrl}/cv.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__printCalled = false; window.print = () => { window.__printCalled = true; }; });
  await page.locator('[data-print-cv]').click();
  check(await page.evaluate(() => window.__printCalled), 'CV 列印按鈕未呼叫 window.print()');

  await page.goto(`${baseUrl}/contact.html`, { waitUntil: 'networkidle' });
  check(await page.locator('a[href="mailto:K18111026@gs.ncku.edu.tw"]').count() >= 1, 'Contact mailto 遺漏');
  await page.locator('.contact-scene [data-copy]').click();
  await page.locator('[data-live-region]').filter({ hasText: '已複製' }).waitFor({ state: 'visible' });
  check((await page.locator('[data-live-region]').textContent()).includes('已複製'), 'Contact 複製成功未透過 aria-live 宣告');

  const mobileContext = await browser.newContext({ viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });
  const mobile = await mobileContext.newPage();
  await mobile.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  check(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '320px 首頁水平溢出');
  check(await mobile.locator('[data-topology-domain]').count() === 3, '320px 三域拓樸入口遺漏');
  check(await mobile.locator('[data-topology-domain]').evaluateAll((nodes) => nodes.every((node) => { const box = node.getBoundingClientRect(); return box.width >= 44 && box.height >= 44; })), '320px 三域拓樸觸控區小於 44px');
  check(await mobile.locator('.domain-label em').evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).opacity === '1')), '320px 觸控入口提示未直接顯示');
  check(await mobile.locator('[data-topology-domain="research"]').evaluate((node) => node.getAnimations({ subtree: true }).every((animation) => animation.effect.getComputedTiming().duration <= 1)), 'Reduced Motion 仍播放拓樸動畫');
  await mobile.locator('[data-menu-open]').click();
  check(await mobile.locator('[data-menu-dialog]').evaluate((dialog) => dialog.open), '320px Menu 無法開啟');
  check(await mobile.evaluate(() => document.querySelector('[data-menu-dialog]').scrollWidth <= innerWidth + 1), '320px Menu 水平溢出');
  await mobile.keyboard.press('Escape');
  await mobileContext.close();
} finally {
  await browser.close();
}

errors.push(...consoleErrors.map((error) => `Console Error：${error}`));
const report = { generatedAt: new Date().toISOString(), baseUrl, checks, passed: errors.length === 0, errors };
await mkdir(resolve(root, 'docs/qa/professional-rebuild'), { recursive: true });
await writeFile(resolve(root, 'docs/qa/professional-rebuild/e2e-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (errors.length) {
  console.error(`E2E 測試失敗：${errors.length} 項／${checks} 項。`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else console.log(`E2E 測試通過：${checks} 項，涵蓋 12 頁、三域拓樸、Menu、Search、Theme、Filter、Education、CV、Contact 與 320px Reduced Motion。`);
