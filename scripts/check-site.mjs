import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const htmlFiles = (await readdir(root)).filter((file) => file.endsWith('.html'));
const required = ['robots.txt', 'sitemap.xml', 'rss.xml'];
for (const file of required) await readFile(resolve(root, file), 'utf8');
for (const file of htmlFiles) {
  const html = await readFile(resolve(root, file), 'utf8');
  for (const pattern of [/<html[^>]+lang=/i, /<meta[^>]+name=["']viewport/i, /<title>[^<]+<\/title>/i]) {
    if (!pattern.test(html)) throw new Error(`${file} lacks required document metadata.`);
  }
  if (!/href=["']assets\/(site|archive-pages)\.css/i.test(html)) throw new Error(`${file} lacks the shared visual system.`);
}
console.log(`網站結構檢查通過：${htmlFiles.length} 個頁面均有語言、viewport、標題與共用視覺資產。`);
