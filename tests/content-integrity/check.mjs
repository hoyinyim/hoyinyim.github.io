import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(new URL('../..', import.meta.url).pathname);
const baseline = JSON.parse(await readFile(resolve(root, 'tests/content-integrity/baseline.json'), 'utf8'));
const mismatches = [];

for (const [file, expected] of Object.entries(baseline.files)) {
  const source = await readFile(resolve(root, baseline.sourceRoot, file));
  const actual = createHash('sha256').update(source).digest('hex').toUpperCase();
  if (actual !== expected) mismatches.push(`${file}: ${actual} !== ${expected}`);
}

if (mismatches.length) {
  console.error('內容完整性基準失敗。');
  console.error(mismatches.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`內容完整性基準通過：${Object.keys(baseline.files).length} 個原始來源檔逐位元一致。`);
}
