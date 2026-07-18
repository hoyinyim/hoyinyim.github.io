import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const paths = ['index.html', 'about.html', 'research.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'certificates.html', 'teaching.html', 'cv.html', 'contact.html', '404.html'];
const browser = await chromium.launch({ executablePath, headless: true });
const scans = [];
const loadForScan = async (page, url) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
};
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, locale: 'zh-TW', reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const path of paths) {
      await loadForScan(page, `${baseUrl}/${path}`);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      scans.push({ viewport: viewport.width, path, violations: result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })) });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const violations = scans.flatMap((scan) => scan.violations.map((violation) => ({ viewport: scan.viewport, path: scan.path, ...violation })));
const report = { generatedAt: new Date().toISOString(), baseUrl, scans: scans.length, passed: violations.length === 0, violations };
await mkdir(resolve(root, 'docs/qa/professional-rebuild'), { recursive: true });
await writeFile(resolve(root, 'docs/qa/professional-rebuild/accessibility-results.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (violations.length) {
  console.error(`Axe 無障礙測試失敗：${violations.length} 個頁面違規集合。`);
  violations.slice(0, 30).forEach((item) => console.error(`- ${item.viewport}px ${item.path}: ${item.id} (${item.impact})`));
  process.exitCode = 1;
} else console.log(`Axe 無障礙測試通過：${scans.length} 次桌面／手機 WCAG 2.2 AA 掃描，0 violations。`);
