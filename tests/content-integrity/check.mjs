import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const baseline = JSON.parse(await readFile(resolve(root, 'tests/content-integrity/baseline.json'), 'utf8'));
const mismatches = [];

function normalise(text) {
  return text.replace(/\s+/gu, ' ').trim();
}

function sourceFragments(html) {
  const markupOnly = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/giu, '');
  return [...markupOnly.matchAll(/>([^<>]+)</gu)]
    .map((match) => normalise(match[1]))
    .filter((text) => text.length >= 3 && /[\p{L}\p{N}]/u.test(text));
}

for (const [file, expected] of Object.entries(baseline.files)) {
  const source = await readFile(resolve(root, baseline.sourceRoot, file));
  const actual = createHash('sha256').update(source).digest('hex').toUpperCase();
  if (actual !== expected) mismatches.push(`${file}: ${actual} !== ${expected}`);

  const publicPage = normalise(await readFile(resolve(root, file), 'utf8'));
  for (const fragment of sourceFragments(source.toString('utf8'))) {
    if (!publicPage.includes(fragment)) mismatches.push(`${file}: missing protected text “${fragment}”`);
  }
}

if (mismatches.length) {
  console.error('內容完整性基準失敗。');
  console.error(mismatches.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`內容完整性基準通過：${Object.keys(baseline.files).length} 個原始來源檔逐位元一致，且受保護可見文字均保留於公開頁面。`);
}
