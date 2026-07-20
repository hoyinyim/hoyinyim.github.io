import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const out = resolve(root, 'docs/qa/axis-prototypes');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const base = (process.env.SITE_URL || 'http://127.0.0.1:4176').replace(/\/$/, '');
const pages = ['home', 'research', 'journal', 'about', 'menu'];
const records = [];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const width of [1440, 390]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme });
      const page = await context.newPage();
      for (const name of pages) {
        const url = `${base}/prototypes/axis/${name}.html?theme=${theme}`;
        await page.goto(url, { waitUntil: 'networkidle' });
        const measurements = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth, theme: document.documentElement.dataset.theme }));
        await page.screenshot({ path: resolve(out, `${name}-${width}-${theme}.png`), fullPage: true });
        records.push({ name, width, requestedTheme: theme, url, ...measurements });
      }
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(resolve(out, 'prototype-results.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`, 'utf8');
if (records.some((record) => record.h1 !== 1 || record.overflow > 1 || record.theme !== record.requestedTheme)) process.exitCode = 1;
else console.log(`原型驗證完成：${records.length} 個桌面／手機／明暗組合。`);
