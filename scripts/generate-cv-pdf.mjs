import { chromium } from 'playwright-core';
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputDir = resolve(root, 'output/pdf');
const downloadDir = resolve(root, 'downloads');
const output = resolve(outputDir, 'yim-ho-yin-cv.pdf');
const download = resolve(downloadDir, 'yim-ho-yin-cv.pdf');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const siteUrl = process.env.SITE_URL || 'http://127.0.0.1:4176/cv.html';

await Promise.all([mkdir(outputDir, { recursive: true }), mkdir(downloadDir, { recursive: true })]);
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(siteUrl, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print', colorScheme: 'light', reducedMotion: 'reduce' });
  await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="width:100%;font:8px Arial;color:#555;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>', margin: { top: '16mm', right: '14mm', bottom: '18mm', left: '14mm' } });
} finally { await browser.close(); }
await copyFile(output, download);
console.log(`履歷 PDF 已產生：${output}`);
