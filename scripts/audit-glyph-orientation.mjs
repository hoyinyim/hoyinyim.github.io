import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const roots = ['src/styles', 'src/scripts'];
const prohibited = /(?:rotate\(|rotateX\(|rotateY\(|scaleX\(\s*-1\s*\)|scaleY\(\s*-1\s*\))/i;

async function files(directory) {
  const entries = await readdir(resolve(root, directory), { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]))).flat();
}

const findings = [];
for (const directory of roots) {
  for (const file of await files(directory)) {
    const lines = (await readFile(resolve(root, file), 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      if ((/glyph|site-glyph|menu-glyph|ancient-script|chu-/i.test(line) || /glyph/i.test(lines[Math.max(0, index - 1)] || '')) && prohibited.test(line)) findings.push(`${file}:${index + 1}: ${line.trim()}`);
    });
  }
}

if (findings.length) {
  console.error('古文字方向稽核失敗：');
  findings.forEach((item) => console.error(item));
  process.exitCode = 1;
} else {
  console.log('古文字方向稽核通過：未發現 rotate、翻轉或鏡像規則。');
}
