import { chromium } from 'playwright-core';
import { mkdir, mkdtemp, open, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Start the generated site with `node scripts/serve.mjs` before running this audit.
if (process.argv.includes('--help')) {
  console.log('node tests/typography/acceptance.mjs\n' +
    'Needs a running preview. SITE_URL defaults to http://127.0.0.1:4173.\n' +
    'Optional: CHROME_PATH, TYPOGRAPHY_REVISION_DIR, TYPOGRAPHY_BASELINE_DIR, TYPOGRAPHY_REQUIRE_BASELINE=1.');
  process.exit(0);
}

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = new URL((process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '') + '/');
const previewOrigin = base.origin;
const knownChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.CHROME_PATH || (existsSync(knownChrome) ? knownChrome : undefined);
const outDir = resolve(root, process.env.TYPOGRAPHY_REVISION_DIR || 'tmp/typography-revision-2026-11-21');
const baselineDir = resolve(root, process.env.TYPOGRAPHY_BASELINE_DIR || 'tmp/typography-audit-2026-11-21');
const requireBaseline = process.env.TYPOGRAPHY_REQUIRE_BASELINE === '1';
const viewports = [{ width: 375, height: 812 }, { width: 768, height: 1024 }, { width: 1440, height: 960 }];
const routeData = JSON.parse(await readFile(new URL('../../src/data/routes.json', import.meta.url), 'utf8'));
const routes = [...routeData.map(({ href }) => href), '404.html'];
if (routes.length !== 12 || new Set(routes).size !== 12 || routes.some((route) => !/^[a-z0-9-]+\.html$/.test(route))) {
  throw new Error('Expected 11 unique public HTML routes plus 404.html. Update the audit together with the route contract.');
}
if (outDir === baselineDir) throw new Error('After evidence and the read-only baseline must be in different directories.');
await mkdir(outDir, { recursive: true });

const timeout = 6000;
const contextOptions = { locale: 'zh-TW', colorScheme: 'light', reducedMotion: 'reduce', deviceScaleFactor: 1 };
const headerSearch = '[data-header] [data-search-open]';
const headerMenu = '[data-header] [data-menu-open]';
const menuDialog = '[data-menu-dialog]';
const searchDialog = '[data-search-dialog]';

// 768px lies between the approved endpoint sizes, not at a prescribed third size.
// Numeric years, labels and metadata use roles separate from section/article headings.
const roleTargets = {
  hero: { selector: '#home-title > :not([lang="en"])', ranges: [[38, 40], [52, 56]], line: [1.12, 1.20] },
  h1: { selector: 'main h1:not(#home-title)', ranges: [[32, 34], [40, 42]], line: [1.18, 1.26] },
  h2: { selector: 'main h2', excludeNumeric: true, ranges: [[24, 25], [28, 30]], line: [1.30, 1.40] },
  entry: { selector: '.home-publications h3,.publication-entry h3,.conference-published h3,.conference-year h4,.credential-ledger h3,.award-timeline h3,.cv-list h3', ranges: [[19, 20], [21, 23]], line: [1.40, 1.55] },
  prose: { selector: '.home-profile-copy > p,.about-biography > div > p,.about-biography .reading-prose p,.translation-feature-details > p,.research-materials-intro', ranges: [[16, 17], [17, 18]], line: [1.70, 1.82] },
  nav: { selector: '[data-header] .primary-nav a,[data-header] .header-control', ranges: [[14, 15], [14, 15]], line: [1.40, 1.55] },
  meta: { selector: '.publication-meta,.publication-venue,.writing-meta,.translation-feature-heading .original-title,.home-publications li time,.conference-year time,.research-material-provenance :is(dt,dd)', ranges: [[14, 15], [14, 15]], line: [1.50, 1.65] }
};
const routeControls = {
  'index.html': ['.home-archive-index a[href="journal-papers.html"]', '#home-title'],
  'research.html': ['[data-material-track]', '[data-material-choice]', '[data-material-step="1"]'],
  'journal-papers.html': ['[data-publication-filter="all"]', '[data-publication] [data-copy]', '[data-publication] details > summary'],
  'conference-papers.html': ['#conference-published article a'],
  'translations.html': ['.translation-feature .axis-link'],
  'cv.html': ['.cv-index a', 'a[download][href$="yim-ho-yin-cv.pdf"]', '[data-print-cv]'],
  'contact.html': ['.contact-email[href^="mailto:"]', '[data-copy]'],
  '404.html': ['main a[href="index.html"]', 'main [data-search-open]']
};

const check = (record, condition, message) => { if (!condition) record.failures.push(message); };
const errorText = (error) => String(error.message || error).split('\n')[0];
const rel = (file) => relative(outDir, file).split(sep).join('/');
const inRange = (value, [min, max], tolerance) => Number.isFinite(value) && value >= min - tolerance && value <= max + tolerance;
const pxf = ([lo, hi]) => `${lo}–${hi}`;

function measure({ roles, controls }) {
  const number = (value) => Math.round(value * 1000) / 1000;
  function visible(el) {
    if (!el || el.closest('[hidden], [aria-hidden="true"]')) return false;
    const { width, height } = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    return width > 0 && height > 0 && css.visibility === 'visible' && css.display !== 'none';
  }
  const descriptor = (el) => {
    const css = getComputedStyle(el), rect = el.getBoundingClientRect();
    const size = parseFloat(css.fontSize), line = parseFloat(css.lineHeight);
    return { text: el.innerText.replace(/\s+/g, ' ').trim().slice(0, 130),
      size: number(size), line: Number.isFinite(line) ? number(line / size) : null,
      family: css.fontFamily, weight: css.fontWeight, width: number(rect.width), height: number(rect.height) };
  };
  const snapshot = Object.fromEntries(Object.entries(roles).map(([role, { selector, excludeNumeric }]) => {
    const all = [...document.querySelectorAll(selector)].filter(visible).map(descriptor).filter((row) => row.text && !(excludeNumeric && /^\d{4}$/.test(row.text)));
    const unique = new Map();
    for (const row of all) {
      const key = [row.size, row.line, row.family, row.weight].join('|');
      if (!unique.has(key)) unique.set(key, { ...row, uses: 0 });
      unique.get(key).uses++;
    }
    return [role, { count: all.length, styles: [...unique.values()] }];
  }));
  const head = document.querySelector('[data-header]');
  const page = document.documentElement;
  return {
    root: parseFloat(getComputedStyle(page).fontSize), viewport: [innerWidth, innerHeight],
    scrollWidth: page.scrollWidth, bodyScrollWidth: document.body.scrollWidth,
    layoutShiftNoInput: window.__typographyShifts?.filter((event) => !event.hadRecentInput).reduce((sum, event) => sum + event.value, 0) ?? null,
    documentOverflow: Math.max(0, page.scrollWidth - page.clientWidth, document.body.scrollWidth - page.clientWidth),
    h1Count: [...document.querySelectorAll('main h1')].filter(visible).length,
    marker: document.querySelector('meta[name="build-commit"]')?.content ?? null,
    siteSheet: [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => new URL(link.href).pathname.endsWith('/assets/site.css') && Boolean(link.sheet)),
    resources: performance.getEntriesByType('resource').filter((entry) => /\.woff2(?:\?|$)/.test(entry.name)).map((entry) => ({ file: new URL(entry.name).pathname.split('/').at(-1), encodedBytes: entry.encodedBodySize })),
    headerHeight: head ? number(head.getBoundingClientRect().height) : null,
    controls: Object.fromEntries(controls.map((selector) => [selector, [...document.querySelectorAll(selector)].filter((el) => visible(el) && !el.disabled).length])),
    roles: snapshot
  };
}

async function pngSize(file) {
  const handle = await open(file, 'r');
  try {
    const buffer = Buffer.alloc(24);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead !== buffer.length || buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a' || buffer.toString('ascii', 12, 16) !== 'IHDR') {
      throw new Error('Invalid PNG header');
    }
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  } finally { await handle.close(); }
}

async function waitAfterEscape(page, dialog, focus, isMenu) {
  await page.keyboard.press('Escape');
  // `close` fires asynchronously even when dialog.open has already become false.
  await page.waitForFunction(({ dialog, focus, isMenu }) => {
    const trigger = document.querySelector(focus);
    return !document.querySelector(dialog)?.open && document.activeElement === trigger &&
      !document.body.classList.contains('dialog-open') && (!isMenu || trigger?.getAttribute('aria-expanded') === 'false');
  }, { dialog, focus, isMenu }, { timeout });
}

async function inspectDialog(page, record, kind) {
  const isMenu = kind === 'menu';
  const focus = isMenu ? headerMenu : headerSearch;
  const dialog = isMenu ? menuDialog : searchDialog;
  const trigger = page.locator(focus);
  const info = record.interactions[kind] = {};
  try {
    await trigger.waitFor({ state: 'visible', timeout });
    info.hit = await trigger.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
      const target = document.elementFromPoint(x, y);
      return { x, y, width: rect.width, height: rect.height, hit: Boolean(target && el.contains(target)),
        target: target ? `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ''}${target.getAttribute('class') ? `.${target.getAttribute('class').replace(/\s+/g, '.')}` : ''}` : null };
    });
    check(record, info.hit.hit, `${kind} center is covered by ${info.hit.target || 'out-of-viewport space'}`);
    check(record, info.hit.width >= 44 && info.hit.height >= 44, `${kind} target smaller than 44×44 CSS px`);
    if (!info.hit.hit) return;
    await page.mouse.click(info.hit.x, info.hit.y);
    const surface = page.locator(dialog);
    await surface.waitFor({ state: 'visible', timeout });
    info.open = await surface.evaluate((el) => el.open);
    check(record, info.open, `${kind} dialog is visible but not open`);
    if (isMenu) {
      check(record, await trigger.getAttribute('aria-expanded') === 'true', 'menu trigger did not set aria-expanded');
      info.links = await surface.locator('nav a[href]').count();
      check(record, info.links >= 10, 'menu lost primary or publication links');
    } else {
      const input = surface.getByRole('searchbox');
      await input.waitFor({ state: 'visible', timeout });
      await page.waitForFunction(() => document.activeElement?.matches('[data-search-input]'), null, { timeout });
      await input.fill('荀子');
      const results = surface.locator('[data-search-results] a');
      await results.first().waitFor({ state: 'visible', timeout });
      info.results = await results.count();
      check(record, info.results > 0, 'search did not return results for 荀子');
      // Move to the first result before Escape to test keyboard navigation as well;
      // native search fields otherwise may consume Escape to clear their value.
      await input.press('ArrowDown');
      await page.waitForFunction(() => document.activeElement?.matches('[data-search-results] a'), null, { timeout });
      info.keyboardResult = true;
    }
    await waitAfterEscape(page, dialog, focus, isMenu);
    info.escapeRestoredFocus = true;
  } catch (error) {
    info.error = errorText(error);
    check(record, false, `${kind} action failed: ${info.error}`);
    // Let the other control run despite an interaction failure; the original failure stays recorded.
    await page.locator(`${dialog}[open]`).evaluateAll((items) => items.forEach((item) => item.close())).catch(() => {});
  }
}

async function openPage(page, route) {
  const response = await page.goto(new URL(route, base).href, { waitUntil: 'load', timeout: 20000 });
  await page.waitForFunction(() => ([...document.querySelectorAll('link[rel="stylesheet"]')]
    .some((link) => new URL(link.href).pathname.endsWith('/assets/site.css') && Boolean(link.sheet))), null, { timeout });
  // The webfont stylesheet is optional to rendering, and becomes active after its link load.
  await page.waitForFunction(() => {
    const fontSheet = [...document.querySelectorAll('link[rel="stylesheet"]')].find((link) => new URL(link.href).pathname.endsWith('/assets/webfonts.css'));
    const hasLoader = document.querySelector('[data-webfont-css]') || [...document.scripts].some((script) => script.textContent.includes('webfonts.css')) ||
      [...document.querySelectorAll('noscript')].some((item) => item.textContent.includes('assets/webfonts.css'));
    return fontSheet ? Boolean(fontSheet.sheet) && (!fontSheet.media || matchMedia(fontSheet.media).matches) : !hasLoader;
  }, null, { timeout });
  await page.waitForFunction(() => !document.fonts || document.fonts.status === 'loaded', null, { timeout });
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  return response?.status() ?? null;
}

function inspectType(record, normalMetrics) {
  const { metrics, width, route, mode } = record;
  // Leave room for CSS subpixel interpolation and browser rounding, not whole-pixel redesigns.
  for (const [role, target] of Object.entries(roleTargets)) {
    const [mobile, desktop] = target.ranges;
    const range = width === 375 ? mobile : width === 1440 ? desktop : [mobile[0], desktop[1]];
    const rows = metrics.roles[role].styles;
    const mustExist = role === (route === 'index.html' ? 'hero' : 'h1') || role === 'nav' ||
      (role === 'prose' && ['index.html', 'about.html', 'research.html', 'translations.html'].includes(route)) ||
      (role === 'meta' && ['index.html', 'journal-papers.html', 'conference-papers.html'].includes(route)) ||
      (role === 'entry' && ['index.html', 'journal-papers.html', 'conference-papers.html', 'cv.html', 'certificates.html'].includes(route));
    if (mustExist) check(record, rows.length > 0, `${role} has no measurable type sample`);
    const normalRows = normalMetrics?.roles[role].styles ?? [];
    for (const style of rows) {
      if (mode === 'normal') check(record, inRange(style.size, range, .35), `${role} ${style.size}px outside ${pxf(range)}px: ${style.text}`);
      else if (normalRows.length) {
        // The approved ranges are normal settings; mixed rem/vw interpolation need not produce an exact ×2.
        // Verify a meaningful response to the native setting, even if different navigation items are now visible.
        const normal = normalRows.find((item) => item.text === style.text)?.size ?? Math.min(...normalRows.map((item) => item.size));
        check(record, style.size >= normal * 1.5 - .35, `${role} only resized from ${normal}px to ${style.size}px at native 200%: ${style.text}`);
      }
      if (style.line != null) {
        check(record, inRange(style.line, target.line, .025), `${role} line-height ${style.line} outside ${pxf(target.line)}: ${style.text}`);
      } else {
        check(record, false, `${role} does not specify a measurable line-height: ${style.text}`);
      }
    }
  }
}

async function capture(page, route, viewport, mode, normalMetrics) {
  const { width, height } = viewport;
  const stem = `${route.replace(/\.html$/, '')}-${width}`;
  const suffix = mode === 'normal' ? 'after' : 'native-text200-after';
  const file = resolve(outDir, `${stem}-${suffix}.png`);
  const record = { route, width, height, mode, status: null, metrics: null, interactions: {}, screenshot: null, baseline: null, failures: [], pageErrors: [] };
  const uncaught = (error) => record.pageErrors.push(errorText(error));
  page.on('pageerror', uncaught);
  try {
    record.status = await openPage(page, route);
    check(record, record.status === 200 || (route === '404.html' && record.status === 404), `unexpected page HTTP status ${record.status}`);
    record.metrics = await page.evaluate(measure, { roles: roleTargets, controls: routeControls[route] || [] });
    const metrics = record.metrics;
    check(record, metrics.root === (mode === 'normal' ? 16 : 32), `page root is ${metrics.root}px; expected ${mode === 'normal' ? 16 : 32}px`);
    check(record, metrics.viewport[0] === width && metrics.viewport[1] === height, `unexpected viewport ${metrics.viewport.join('×')}`);
    check(record, metrics.siteSheet, 'site stylesheet not applied');
    check(record, metrics.h1Count === 1, `expected one visible main H1; found ${metrics.h1Count}`);
    check(record, metrics.documentOverflow === 0, `document has ${metrics.documentOverflow}px horizontal overflow`);
    for (const [selector, count] of Object.entries(metrics.controls)) check(record, count > 0, `missing, hidden or disabled control: ${selector}`);
    inspectType(record, normalMetrics);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: file, animations: 'disabled' });
    record.screenshot = rel(file);
    if (mode === 'normal') {
      const candidate = resolve(baselineDir, `${stem}-before.png`);
      try {
        const [beforeWidth, beforeHeight] = await pngSize(candidate);
        if (beforeWidth !== width || beforeHeight !== height) throw new Error(`unexpected PNG dimensions ${beforeWidth}×${beforeHeight}`);
        record.baseline = rel(candidate);
      } catch (error) {
        record.baselineNote = error.code === 'ENOENT' ? 'matching before PNG not present' : errorText(error);
        check(record, !requireBaseline || record.baseline !== null, `baseline: ${record.baselineNote}`);
      }
    }
    await inspectDialog(page, record, 'search');
    await inspectDialog(page, record, 'menu');
    if (record.pageErrors.length) check(record, false, `uncaught JS error: ${record.pageErrors.join('; ')}`);
  } catch (error) { check(record, false, errorText(error)); }
  finally { page.off('pageerror', uncaught); }
  return record;
}

// Never reuse the user's default Chrome profile. Confirm ownership before cleaning ours up.
const tempParent = await realpath(tmpdir());
const prefix = 'hoyinyim-type-qa-';
const profileDir = await mkdtemp(join(tempParent, prefix));
const profilePath = await realpath(profileDir);
const defaultDir = join(profileDir, 'Default');
const cleanup = async () => {
  if (dirname(profilePath) !== tempParent || !basename(profilePath).startsWith(prefix) || await realpath(profileDir) !== profilePath) {
    throw new Error('Unexpected temporary profile path; refused to delete');
  }
  await rm(profilePath, { recursive: true, force: true, maxRetries: 4, retryDelay: 150 });
};
const records = [], fallback = [], setup = { normalBlankRoot: null, nativeBlankRoot: null }, globalFailures = [];
let browser, native;
try {
  await mkdir(defaultDir);
  await writeFile(join(defaultDir, 'Preferences'), JSON.stringify({ webkit: { webprefs: { default_font_size: 32 } } }), { flag: 'wx' });
  browser = await chromium.launch({ headless: true, executablePath });
  setup.browser = browser.version();
  const normal = await browser.newContext(contextOptions);
  native = await chromium.launchPersistentContext(profileDir, { headless: true, executablePath, ...contextOptions });
  for (const [context, mode, expected] of [[normal, 'normal', 16], [native, 'native-text-200', 32]]) {
    await context.addInitScript(() => {
      window.__typographyShifts = [];
      if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        new PerformanceObserver((list) => window.__typographyShifts.push(...list.getEntries())).observe({ type: 'layout-shift', buffered: true });
      }
    });
    const page = await context.newPage();
    const blank = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    setup[mode === 'normal' ? 'normalBlankRoot' : 'nativeBlankRoot'] = blank;
    if (blank !== expected) {
      globalFailures.push(`${mode} isolated blank document computed ${blank}px, expected ${expected}px; this matrix was not run.`);
      await page.close();
      continue;
    }
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const route of routes) {
        const normal = mode === 'native-text-200' ? records.find((row) => row.mode === 'normal' && row.route === route && row.width === viewport.width)?.metrics : null;
        records.push(await capture(page, route, viewport, mode, normal));
      }
      console.log(`${mode} ${viewport.width}px: captured ${records.filter((r) => r.mode === mode && r.width === viewport.width && r.screenshot).length}/${routes.length}`);
    }
    await page.close();
  }

  // Failure injection stays in this preview tab; official site CSS and page files are unchanged.
  // A blocked webfont stylesheet / WOFF2 should still leave usable type and search controls.
  const noFonts = await browser.newContext(contextOptions);
  const page = await noFonts.newPage();
  let blocked = 0;
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === previewOrigin && /\/assets\/(?:webfonts\.css$|fonts\/.*\.woff2$)/.test(url.pathname)) { blocked++; await route.abort('blockedbyclient'); }
    else await route.continue();
  });
  for (const [route, viewport] of [['index.html', viewports[0]], ['journal-papers.html', viewports[1]], ['cv.html', viewports[2]]]) {
    const row = { route, width: viewport.width, failedWebfontRequests: 0, interactions: {}, failures: [] };
    const previous = blocked;
    await page.setViewportSize(viewport);
    try {
      const response = await page.goto(new URL(route, base).href, { waitUntil: 'load', timeout: 20000 });
      await page.waitForFunction(() => document.readyState === 'complete', null, { timeout });
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
      row.failedWebfontRequests = blocked - previous;
      row.status = response?.status();
      row.metrics = await page.evaluate(measure, { roles: roleTargets, controls: routeControls[route] || [] });
      check(row, row.status === 200 && row.metrics.siteSheet, 'page or primary stylesheet failed in font-only fallback probe');
      check(row, row.failedWebfontRequests > 0, 'no webfont request was intercepted; fallback was not exercised');
      check(row, row.metrics.h1Count === 1 && row.metrics.documentOverflow === 0, 'font fallback hid the heading or introduced horizontal overflow');
      await inspectDialog(page, row, 'search');
    } catch (error) { check(row, false, errorText(error)); }
    fallback.push(row);
  }
  await noFonts.close();
} catch (error) { globalFailures.push(errorText(error)); }
finally {
  await native?.close().catch((error) => globalFailures.push(errorText(error)));
  await browser?.close().catch((error) => globalFailures.push(errorText(error)));
  await cleanup().catch((error) => globalFailures.push(errorText(error)));
}

const normalRecords = records.filter((record) => record.mode === 'normal');
const nativeRecords = records.filter((record) => record.mode === 'native-text-200');
for (const [mode, rows] of [['normal', normalRecords], ['native-text-200', nativeRecords]]) {
  const count = rows.filter((row) => row.screenshot).length;
  if (count !== 36) globalFailures.push(`${mode}: expected 36 screenshots, captured ${count}`);
}
if (fallback.length !== 3) globalFailures.push(`expected 3 webfont failure cases, ran ${fallback.length}`);
const pairs = normalRecords.filter((row) => row.baseline && row.screenshot).length;
const failures = [...globalFailures, ...[...records, ...fallback].flatMap((record) => record.failures.map((failure) =>
  `${record.mode || 'font fallback'} ${record.width}px ${record.route}: ${failure}`))];
const generatedAt = new Date().toISOString();
const report = { generatedAt, target: base.href, setup, planned: { viewports, routes, pairs: 36 },
  verifiedPairs: pairs, measurement: { normalRoot: 16, nativeRoot: 32, cssZoomUsed: false, nativeRoleMinimumGrowth: 1.5, roleTargets }, failures, records, fallback };
await writeFile(join(outDir, 'acceptance.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const mdPath = (file) => file.split('/').map(encodeURIComponent).join('/');
const link = (label, value) => value ? `[${label}](${mdPath(value)})` : '—';
const summary = [
  '# 排印修版驗收', '', `- 執行時間：${generatedAt}`, `- 預覽來源：${base.href}`,
  `- Chrome：${setup.browser || '未啟動'}；空白頁原生字級：${setup.normalBlankRoot ?? '未量測'}px／${setup.nativeBlankRoot ?? '未量測'}px。`,
  `- 常態／200% 截圖：${normalRecords.filter((row) => row.screenshot).length}／${nativeRecords.filter((row) => row.screenshot).length}；前後配對 ${pairs}/36；網路字型失效探測 ${fallback.length}/3。`,
  `- 判定：${failures.length ? `${failures.length} 項未通過` : '通過'}。`,
  '- 範圍：Chrome 桌面引擎視窗模擬、淺色、減少動態；不是跨瀏覽器、手機實機、OS 縮放或完整無障礙認證。', '',
  '| 路徑 | 寬度 | 修前 | 修後 | 原生 200% 修後 |', '| --- | ---: | --- | --- | --- |',
  ...normalRecords.map((row) => `| ${row.route} | ${row.width} | ${link('Before', row.baseline)} | ${link('After', row.screenshot)} | ${link('200%', nativeRecords.find((nativeRow) => nativeRow.route === row.route && nativeRow.width === row.width)?.screenshot)} |`),
  '', '## 未通過項目', '', ...(failures.length ? failures.map((failure) => `- ${failure}`) : ['無。']), ''
].join('\n');
await writeFile(join(outDir, 'summary.md'), summary, 'utf8');
console.log(`Typography acceptance: ${records.length}/72 cases, ${pairs}/36 baseline pairs, ${fallback.length}/3 fallback cases; ${failures.length} failures. ${outDir}`);
if (failures.length) process.exitCode = 1;
