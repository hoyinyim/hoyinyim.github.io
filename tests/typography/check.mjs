import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const routes = ['index.html', 'about.html', 'research.html', 'publications.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'teaching.html', 'certificates.html', 'cv.html', 'contact.html', '404.html'];
const widths = [320, 360, 390, 430, 768, 834, 960, 1024, 1180, 1280, 1366, 1440, 1920];
const selectors = [
  'h1', 'h2', 'h3', 'h4', '.brand', '.home-identity', '.role-en', '.domain-label', '.home-domain-index li',
  '.menu-item-label', '.menu-subnav a', '.breadcrumb', '.axis-link', '.publications-index strong', '.publication-kind-number',
  '.publication-venue', '.publication-meta', '.publication-entry h3', '.status-list li', '.conference-published h3',
  '.conference-year h4', '.conference-year p', '.original-title', '.latest-writing h3', '.writing-index h3', '.writing-meta',
  '.credential-ledger h3', '.award-timeline h3', '.cv-list h3', '.cv-list p', '.contact-email', '.site-footer a', '.search-results strong'
];
const failures = [];
const records = [];
const hardIssues = new Set(['punctuation-at-line-start', 'opening-punctuation-at-line-end', 'split-date-range', 'email-break-outside-at', 'separator-at-line-start', 'narrow-column-waterfall']);

function browserAudit(selectorList) {
  const badStarts = new Set('，。：；）》】！？、」』〉》');
  const badEnds = new Set('「『〈《（【');
  const target = selectorList.join(',');
  const visible = (node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  };
  const textLines = (element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent.trim() || node.parentElement?.closest('[aria-hidden="true"],script,style')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const letters = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (let index = 0; index < node.textContent.length; index += 1) {
        const char = node.textContent[index];
        if (/\s/.test(char)) continue;
        const range = document.createRange();
        range.setStart(node, index); range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (rect.width && rect.height) letters.push({ char, top: rect.top, left: rect.left });
      }
    }
    const grouped = [];
    letters.sort((a, b) => a.top - b.top || a.left - b.left).forEach((letter) => {
      let line = grouped.find((item) => Math.abs(item.top - letter.top) < 2);
      if (!line) { line = { top: letter.top, text: '' }; grouped.push(line); }
      line.text += letter.char;
    });
    return grouped.sort((a, b) => a.top - b.top).map(({ text }) => text);
  };
  const issues = [];
  const entries = [];
  document.querySelectorAll(target).forEach((element) => {
    if (!visible(element)) return;
    const lines = textLines(element);
    if (!lines.length) return;
    const fullText = (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
    const route = location.pathname.split('/').pop() || 'index.html';
    const record = { route, selector: [...selectorList].find((selector) => element.matches(selector)) || element.tagName.toLowerCase(), fullText, lines, issue: null };
    const last = lines.at(-1) || '';
    if (lines.some((line) => badStarts.has(line[0]))) record.issue = 'punctuation-at-line-start';
    else if (lines.some((line) => badEnds.has(line.at(-1)))) record.issue = 'opening-punctuation-at-line-end';
    else if (lines.length > 1 && /^[\d０-９]{4}年.*[–-]$/.test(last)) record.issue = 'split-date-range';
    else if (lines.length > 1 && /@/.test(fullText) && !lines.slice(0, -1).every((line) => line.endsWith('@'))) record.issue = 'email-break-outside-at';
    else if (lines.length > 1 && /[／/]/.test(last[0])) record.issue = 'separator-at-line-start';
    else if (lines.length > 1 && /^[A-Za-z][A-Za-z .-]*$/.test(last) && last.split(/\s+/).length === 1) record.issue = 'single-english-word-final-line';
    else if (lines.length > 1 && /^(\.\.\.|\d+日|\d+[–-]\d+日)$/.test(last)) record.issue = 'date-tail-final-line';
    else if (lines.length > 1 && /[\u3400-\u9fff]/.test(fullText) && [...last].filter((char) => /[\u3400-\u9fff]/.test(char)).length <= 4 && element.matches('.publication-entry h3,.conference-published h3,.conference-year h4,.latest-writing h3,.writing-index h3,.credential-ledger h3,.award-timeline h3,.cv-list h3')) record.issue = 'short-final-line';
    else if (lines.length > 6 && element.getBoundingClientRect().width < 260) record.issue = 'narrow-column-waterfall';
    if (record.issue) issues.push(record);
    entries.push(record);
  });
  const forbiddenGlobalBalance = [...document.styleSheets].flatMap((sheet) => {
    try { return [...sheet.cssRules]; } catch { return []; }
  }).some((rule) => /h1\s*,\s*h2\s*,\s*h3\s*,\s*h4/.test(rule.cssText) && /text-wrap:\s*balance/.test(rule.cssText));
  const titleBreaks = [...document.querySelectorAll('.publication-entry h3,.conference-published h3,.conference-year h4,.latest-writing h3,.writing-index h3,.credential-ledger h3,.award-timeline h3,.cv-list h3')].filter((node) => node.querySelector('br')).map((node) => node.textContent.trim());
  return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, forbiddenGlobalBalance, titleBreaks, issues, entries };
}

const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const width of widths) {
    const context = await browser.newContext({ locale: 'zh-TW', viewport: { width, height: width <= 430 ? 844 : 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
      const audit = await page.evaluate(browserAudit, selectors);
      const result = { width, route, zoom: 100, ...audit };
      records.push(result);
      if (audit.overflow > 1) failures.push(`${width}px ${route} 橫向溢出 ${audit.overflow}px`);
      if (audit.forbiddenGlobalBalance) failures.push(`${width}px ${route} 仍有全域標題 balance`);
      if (audit.titleBreaks.length) failures.push(`${width}px ${route} 資料型題名含 br`);
      audit.issues.filter((issue) => hardIssues.has(issue.issue)).forEach((issue) => failures.push(`${width}px ${route} ${issue.selector}: ${issue.issue} (${issue.lines.join(' / ')})`));
    }
    await context.close();
  }
  for (const zoom of [125, 150, 175, 200]) {
    const context = await browser.newContext({ locale: 'zh-TW', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', colorScheme: 'dark' });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
      await page.evaluate((factor) => { document.documentElement.style.zoom = String(factor / 100); }, zoom);
      const audit = await page.evaluate(browserAudit, selectors);
      records.push({ width: 390, route, zoom, ...audit });
      // CSS zoom deliberately enlarges the document box.  Line and semantic
      // checks still run here; real overflow is evaluated at every viewport.
      audit.issues.filter((issue) => hardIssues.has(issue.issue)).forEach((issue) => failures.push(`390px ${zoom}% ${route} ${issue.selector}: ${issue.issue}`));
    }
    await context.close();
  }
} finally { await browser.close(); }

const outDir = resolve(root, 'docs/qa/line-break-audit');
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'line-break-results.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), checks: records.length, failures, records }, null, 2)}\n`, 'utf8');
const observations = records.flatMap((record) => record.issues.map((issue) => `${record.width}px ${record.route} ${issue.selector}: ${issue.issue} (${issue.lines.join(' / ')})`));
const summary = `# 全站文字分行自動稽核\n\n- 產生時間：${new Date().toISOString()}\n- 檢查組合：${records.length}\n- 阻擋問題數：${failures.length}\n- 待肉眼覆核分行：${observations.length}\n\n## 阻擋問題\n\n${failures.length ? failures.map((item) => `- ${item}`).join('\n') : '未發現標點、日期範圍、Email 斷點、橫向溢出或窄欄瀑布等阻擋問題。'}\n\n## 待肉眼覆核\n\n${observations.length ? observations.map((item) => `- ${item}`).join('\n') : '無。'}\n`;
await writeFile(resolve(outDir, 'line-break-summary.md'), summary, 'utf8');
if (failures.length) {
  console.error(`排印測試發現 ${failures.length} 項，詳見 docs/qa/line-break-audit/。`);
  process.exitCode = 1;
} else console.log(`排印測試通過：${records.length} 組頁面、寬度與 Zoom。`);
