import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const evidenceRoot = path.resolve("docs/qa/typography-optical");
const phases = ["before", "first-pass", "final"];

const keepRules = {
  before: {
    light: new Set([390, 1440]),
    "zoom-200": new Set([390]),
  },
  "first-pass": {
    light: new Set([390, 1440]),
    "zoom-200": new Set([390]),
  },
  final: {
    light: new Set([320, 390, 768, 1440, 1920]),
    dark: new Set([390, 1440]),
    "zoom-200": new Set([320, 390, 1440]),
    "reduced-motion": new Set([390, 1440]),
  },
};

function isInsideEvidenceRoot(target) {
  const resolved = path.resolve(target);
  return resolved === evidenceRoot || resolved.startsWith(`${evidenceRoot}${path.sep}`);
}

function shouldKeep(filename, phase) {
  const match = filename.match(/-(\d+)-(light|dark|zoom-125|zoom-150|zoom-200|reduced-motion)\.jpg$/);
  if (!match) return false;
  const [, width, mode] = match;
  return keepRules[phase][mode]?.has(Number(width)) ?? false;
}

for (const phase of phases) {
  const phaseDirectory = path.join(evidenceRoot, phase);
  if (!isInsideEvidenceRoot(phaseDirectory)) {
    throw new Error(`拒絕處理證據目錄以外的路徑：${phaseDirectory}`);
  }

  const entries = await readdir(phaseDirectory, { withFileTypes: true });
  const retained = new Set(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".jpg") && shouldKeep(entry.name, phase))
      .map((entry) => entry.name),
  );

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".jpg") || retained.has(entry.name)) continue;
    const target = path.join(phaseDirectory, entry.name);
    if (!isInsideEvidenceRoot(target)) throw new Error(`拒絕刪除：${target}`);
    await unlink(target);
  }

  const matrixPath = path.join(phaseDirectory, "optical-matrix.json");
  const matrix = JSON.parse(await readFile(matrixPath, "utf8"));
  matrix.fullCaptureCount = Math.max(matrix.fullCaptureCount || 0, matrix.results.length);
  matrix.retainedEvidenceCount = retained.size;
  matrix.retainedEvidencePolicy =
    phase === "final"
      ? "每頁保留五種 light 寬度、兩種 dark 寬度、三種 200% Zoom 寬度及兩種 Reduced Motion 寬度。"
      : "每頁保留 390px、1440px light 與 390px 200% Zoom，供前後對照。";
  matrix.results = matrix.results.filter((result) => retained.has(path.basename(result.screenshot)));
  await writeFile(matrixPath, `${JSON.stringify(matrix, null, 2)}\n`, "utf8");

  console.log(`${phase}: 保留 ${retained.size} 張，完整量測原為 ${matrix.fullCaptureCount} 組。`);
}
