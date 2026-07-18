import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseUrl = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const chromePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
let result;
try {
  result = await lighthouse(`${baseUrl}/index.html`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
} finally {
  await chrome.kill();
}
const lhr = result.lhr;
const assetSize = async (path) => (await stat(resolve(root, path))).size;
const imageFiles = (await readdir(resolve(root, '_site/images'), { withFileTypes: true })).filter((item) => item.isFile()).map((item) => item.name);
const imageBytes = (await Promise.all(imageFiles.map((file) => assetSize(`_site/images/${file}`)))).reduce((sum, value) => sum + value, 0);
const summary = {
  generatedAt: new Date().toISOString(), url: lhr.finalDisplayedUrl,
  scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)])),
  metrics: {
    lcpMs: lhr.audits['largest-contentful-paint'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
    tbtMs: lhr.audits['total-blocking-time'].numericValue,
    speedIndexMs: lhr.audits['speed-index'].numericValue
  },
  assets: {
    javascriptBytes: await assetSize('assets/site.js'),
    cssBytes: await assetSize('assets/site.css'),
    deployedImageFiles: imageFiles.length,
    deployedImageBytes: imageBytes
  }
};
const errors = [];
for (const [category, score] of Object.entries(summary.scores)) if (score < 90) errors.push(`${category} 分數 ${score} 低於 90`);
if (summary.metrics.lcpMs > 2500) errors.push(`LCP ${summary.metrics.lcpMs.toFixed(0)}ms 超過 2500ms`);
if (summary.metrics.cls > 0.1) errors.push(`CLS ${summary.metrics.cls.toFixed(3)} 超過 0.1`);
if (summary.assets.javascriptBytes > 30_000) errors.push(`JavaScript ${summary.assets.javascriptBytes} bytes 超過 30KB`);
if (summary.assets.cssBytes > 60_000) errors.push(`CSS ${summary.assets.cssBytes} bytes 超過 60KB`);
summary.passed = errors.length === 0;
summary.errors = errors;
await mkdir(resolve(root, 'docs/qa/professional-rebuild'), { recursive: true });
await writeFile(resolve(root, 'docs/qa/professional-rebuild/lighthouse-report.json'), result.report, 'utf8');
await writeFile(resolve(root, 'docs/qa/professional-rebuild/performance-results.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
if (errors.length) {
  console.error(`Lighthouse／效能檢查失敗：${errors.length} 項。`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else console.log(`Lighthouse 通過：Performance ${summary.scores.performance}、Accessibility ${summary.scores.accessibility}、Best Practices ${summary.scores['best-practices']}、SEO ${summary.scores.seo}。`);
