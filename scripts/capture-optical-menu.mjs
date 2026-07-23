import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = resolve(root, process.env.OPTICAL_AUDIT_DIR || 'docs/qa/optical-scale-after', 'menu-state');
const targets = [{ name: 'desktop-1440x900', viewport: { width: 1440, height: 900 } }, { name: 'mobile-390x844', viewport: { width: 390, height: 844 } }];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
try {
  const page = await browser.newPage();
  const report = [];
  for (const target of targets) {
    await page.setViewportSize(target.viewport);
    await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
    await page.click('[data-menu-open]');
    await page.waitForTimeout(900);
    const menu = await page.locator('[data-menu-dialog]').evaluate((node) => ({
      open: node.open,
      height: node.getBoundingClientRect().height,
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      labels: [...node.querySelectorAll('.menu-item-label')].map((item) => ({ text: item.textContent.trim(), size: getComputedStyle(item).fontSize })),
      utilitySize: getComputedStyle(node.querySelector('.menu-utility a')).fontSize
    }));
    await page.screenshot({ path: resolve(outDir, `${target.name}.jpg`), type: 'jpeg', quality: 82 });
    report.push({ ...target, ...menu, screenshot: `menu-state/${target.name}.jpg` });
  }
  await writeFile(resolve(outDir, 'menu-state-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
} finally {
  await browser.close();
}
