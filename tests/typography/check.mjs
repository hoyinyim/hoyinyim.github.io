import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const routes = ['index.html', 'about.html', 'research.html', 'publications.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'teaching.html', 'certificates.html', 'cv.html', 'contact.html'];
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
const failures = [];
const records = [];
const browser = await chromium.launch({ executablePath, headless: true });

function browserAudit() {
  const forbiddenNowrap = [...document.querySelectorAll('h1,h2,h3,h4,.menu-item-label,.contact-email,.credential-ledger li,.publication-entry')].filter((node) => !node.classList.contains('visually-hidden') && getComputedStyle(node).whiteSpace === 'nowrap').map((node) => ({ tag: node.tagName, className: node.className, text: (node.textContent || '').trim().slice(0, 80) }));
  const bibliographyBreaks = [...document.querySelectorAll('.publication-entry h3,.conference-published h3,.conference-year h4,.credential-ledger h3,.cv-list h3')].filter((node) => node.querySelector('br')).map((node) => (node.textContent || '').trim());
  const badStarts = new Set('，。：；）》】！？、');
  const issues = [];
  const lineScan = (node) => {
    const textNode = [...node.childNodes].find((item) => item.nodeType === Node.TEXT_NODE && item.textContent.trim());
    if (!textNode) return;
    const text = textNode.textContent; const lines = [];
    for (let index = 0; index < text.length; index += 1) {
      if (/\s/.test(text[index])) continue;
      const range = document.createRange(); range.setStart(textNode, index); range.setEnd(textNode, index + 1);
      const rect = range.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
      const line = lines.find((item) => Math.abs(item.top - rect.top) < 2) || { top: rect.top, text: '' };
      if (!lines.includes(line)) lines.push(line); line.text += text[index];
    }
    lines.sort((a, b) => a.top - b.top);
    lines.forEach((line, index) => { if (badStarts.has(line.text[0])) issues.push({ kind: 'punctuation-at-line-start', text: line.text, element: node.textContent.trim().slice(0, 120) }); });
    const last = lines.at(-1)?.text || '';
    if (lines.length > 1 && last.length <= 3 && node.matches('.publication-entry h3,.conference-published h3,.conference-year h4,.credential-ledger h3,.award-timeline h3')) issues.push({ kind: 'short-final-line', text: last, element: node.textContent.trim().slice(0, 120) });
  };
  document.querySelectorAll('.publication-entry h3,.conference-published h3,.conference-year h4,.credential-ledger h3,.award-timeline h3').forEach(lineScan);
  const body = getComputedStyle(document.body);
  return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, forbiddenNowrap, bibliographyBreaks, issues, body: { fontFamily: body.fontFamily, fontSize: body.fontSize, lineHeight: body.lineHeight, wordBreak: body.wordBreak, lineBreak: body.lineBreak }, cssBytes: Number(document.querySelector('meta[name="x-css-bytes"]')?.content || 0) };
}

try {
  for (const width of widths) {
    const context = await browser.newContext({ locale: 'zh-TW', viewport: { width, height: width <= 430 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
      const audit = await page.evaluate(browserAudit);
      records.push({ width, route, zoom: 1, ...audit });
      if (audit.overflow > 1) failures.push(`${width}px ${route} 橫向溢出 ${audit.overflow}px`);
      if (audit.forbiddenNowrap.length) failures.push(`${width}px ${route} 禁用 nowrap：${audit.forbiddenNowrap.length}`);
      if (audit.bibliographyBreaks.length) failures.push(`${width}px ${route} 書目含 br：${audit.bibliographyBreaks.length}`);
      if (audit.issues.length) failures.push(`${width}px ${route} 分行問題：${audit.issues.map((item) => `${item.kind}:${item.text}`).join('、')}`);
      if (audit.body.lineBreak !== 'strict') failures.push(`${width}px ${route} 未啟用 strict line-break`);
    }
    await context.close();
  }
  const zoomContext = await browser.newContext({ locale: 'zh-TW', viewport: { width: 320, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const zoomPage = await zoomContext.newPage();
  for (const route of routes) {
    await zoomPage.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
    await zoomPage.evaluate(() => { document.documentElement.style.zoom = '2'; });
    const audit = await zoomPage.evaluate(browserAudit); records.push({ width: 320, route, zoom: 2, ...audit });
    if (audit.overflow > 1) failures.push(`320px 200% ${route} 橫向溢出 ${audit.overflow}px`);
    if (audit.forbiddenNowrap.length) failures.push(`320px 200% ${route} 禁用 nowrap`);
  }
  await zoomContext.close();
} finally { await browser.close(); }

const outDir = resolve(root, 'docs/qa/typography-optical'); await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'typography-test-results.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), checks: records.length, failures, records }, null, 2)}\n`, 'utf8');
if (failures.length) { console.error(`排印測試失敗：${failures.length} 項。`); failures.slice(0, 40).forEach((item) => console.error(`- ${item}`)); process.exitCode = 1; }
else console.log(`排印測試通過：${records.length} 組頁面／寬度／Zoom。`);
