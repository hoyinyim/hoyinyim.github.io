import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = resolve(root, '_site');
const routes = JSON.parse(await readFile(resolve(root, 'src/data/routes.json'), 'utf8'));
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const htmlFiles = [...routes.map((route) => route.href), '404.html'];
for (const file of [...htmlFiles, 'robots.txt', 'sitemap.xml', 'rss.xml']) await cp(resolve(root, file), resolve(out, file));
await cp(resolve(root, 'assets'), resolve(out, 'assets'), { recursive: true });
await cp(resolve(root, 'downloads'), resolve(out, 'downloads'), { recursive: true });
await mkdir(resolve(out, 'images'), { recursive: true });
const localImages = new Set();
localImages.add('images/og-default.png');
for (const file of htmlFiles) {
  const html = await readFile(resolve(root, file), 'utf8');
  for (const match of html.matchAll(/(?:src|content|href)="(images\/[^"]+)"/g)) localImages.add(match[1]);
}
for (const image of localImages) await cp(resolve(root, image), resolve(out, image));
await writeFile(resolve(out, '.nojekyll'), '', 'utf8');
console.log(`GitHub Pages 發布包完成：${out}`);
