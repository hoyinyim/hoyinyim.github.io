import { spawn } from 'node:child_process';

const port = Number(process.env.TEST_PORT || 4174);
const baseUrl = process.env.SITE_URL || `http://127.0.0.1:${port}`;
const env = { ...process.env, PORT: String(port), SITE_URL: baseUrl };
const server = process.env.SITE_URL ? null : spawn(process.execPath, ['scripts/serve.mjs'], { env, stdio: ['ignore', 'pipe', 'inherit'] });

const waitForServer = async () => {
  if (process.env.SITE_URL) return;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
};

const run = (script) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [script], { env, stdio: 'inherit' });
  child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${script} failed with exit code ${code}`)));
  child.on('error', reject);
});

try {
  await waitForServer();
  for (const script of ['scripts/package-site.mjs', 'tests/e2e/check.mjs', 'tests/accessibility/check.mjs', 'tests/visual-responsive/check.mjs', 'tests/performance/check.mjs']) await run(script);
} finally {
  server?.kill('SIGTERM');
}
