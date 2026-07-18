import { access, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const required = ['index.html', 'journal-papers.html', 'translations.html', 'conference-papers.html', 'certificates.html', 'assets/site.css', 'assets/site.js'];
for (const file of required) await access(resolve(root, file));
const pages = (await readdir(root)).filter((file) => file.endsWith('.html'));
for (const page of pages) {
  const details = await stat(resolve(root, page));
  if (!details.size) throw new Error(`${page} is empty.`);
}
console.log(`靜態建置檢查通過：${pages.length} 個 HTML 頁面與共用資產均存在。`);
