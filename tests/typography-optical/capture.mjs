import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const phase = process.env.OPTICAL_PHASE || 'final';
const outDir = resolve(root, 'docs/qa/typography-optical', phase);
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pages = ['index.html', 'about.html', 'research.html', 'publications.html', 'journal-papers.html', 'conference-papers.html', 'translations.html', 'teaching.html', 'certificates.html', 'cv.html', 'contact.html'];
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
const scenarios = phase === 'before'
  ? [{ id: 'light', colorScheme: 'light', zoom: 1 }, { id: 'zoom-200', colorScheme: 'light', zoom: 2 }]
  : [
      { id: 'light', colorScheme: 'light', zoom: 1 },
      { id: 'dark', colorScheme: 'dark', zoom: 1 },
      { id: 'zoom-125', colorScheme: 'light', zoom: 1.25 },
      { id: 'zoom-150', colorScheme: 'light', zoom: 1.5 },
      { id: 'zoom-200', colorScheme: 'light', zoom: 2 },
      { id: 'reduced-motion', colorScheme: 'light', zoom: 1, reducedMotion: 'reduce' }
    ];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];

try {
  for (const scenario of scenarios) {
    for (const width of widths) {
      const context = await browser.newContext({
        locale: 'zh-TW', colorScheme: scenario.colorScheme,
        reducedMotion: scenario.reducedMotion || 'no-preference',
        viewport: { width, height: width <= 430 ? 844 : 1000 }
      });
      const page = await context.newPage();
      for (const route of pages) {
        await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });
        if (scenario.zoom !== 1) await page.evaluate((zoom) => { document.documentElement.style.zoom = String(zoom); }, scenario.zoom);
        const audit = await page.evaluate(() => {
          const selectors = 'h1,h2,h3,h4,p,li,a,dt,dd,time';
          const nodes = [...document.querySelectorAll(selectors)].filter((node) => {
            const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          });
          const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
          const lineData = nodes.map((node) => {
            const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
            const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;
            return { tag: node.tagName, cls: node.className || '', text: (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 220), width: Math.round(rect.width), lines: Math.max(1, Math.round(rect.height / lineHeight)), fontSize: style.fontSize, lineHeight: style.lineHeight, fontFamily: style.fontFamily, wordBreak: style.wordBreak, lineBreak: style.lineBreak, textWrap: style.textWrap, whiteSpace: style.whiteSpace };
          });
          return { overflow, title: document.title, lineData };
        });
        const slug = route.replace('.html', '') || 'index';
        const file = `${slug}-${width}-${scenario.id}.jpg`;
        await page.screenshot({ path: resolve(outDir, file), type: 'jpeg', quality: 62, fullPage: true });
        results.push({ route, width, scenario: scenario.id, zoom: scenario.zoom, ...audit, screenshot: file });
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(resolve(outDir, 'optical-matrix.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), phase, pages, widths, scenarios, results }, null, 2)}\n`, 'utf8');
console.log(`排印截圖完成：${results.length} 個組合，${outDir}`);
