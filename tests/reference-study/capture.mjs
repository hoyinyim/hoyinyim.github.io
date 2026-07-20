import { chromium } from 'playwright-core';
import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const outRoot = resolve(root, 'docs/qa/axis-reference-study');
const tempRoot = resolve(outRoot, `_video-${Date.now()}`);
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pause = (ms) => new Promise((done) => setTimeout(done, ms));

const references = [
  {
    slug: 'details',
    url: 'https://www.details.co.jp/',
    detail: 'https://www.details.co.jp/projects/vermicular/',
    hover: 'a[href="/projects/vermicular/"]',
    interact: async (page) => {
      const control = page.locator('button.contactButton');
      if (await control.count()) await control.first().click().catch(() => {});
    }
  },
  {
    slug: 'junni',
    url: 'https://junni.co.jp/',
    detail: 'https://junni.co.jp/works/basica/',
    hover: 'a[href="/works/basica"]',
    interact: async (page) => {
      const control = page.locator('button.menu_btn');
      if (await control.count()) await control.first().click().catch(() => {});
    }
  },
  {
    slug: 'axis-font',
    url: 'https://typeproject.com/en/fonts/axisfont/',
    detail: 'https://typeproject.com/en/support/detail/?page=fonts_5',
    hover: 'a[href="#buy"]',
    interact: async (page) => {
      const input = page.getByRole('textbox', { name: 'Please enter text' });
      if (await input.count()) await input.first().fill('學術研究 Academic Research').catch(() => {});
    }
  },
  {
    slug: 'typographic-posters',
    url: 'https://www.typographicposters.com/100besteplakate',
    detail: 'https://www.typographicposters.com/100besteplakate/6a22bb58ed7efed62d05bbb2',
    hover: 'article a[href*="6a22bb58ed7efed62d05bbb2"]',
    interact: async (page) => {
      const control = page.getByRole('button', { name: 'Year', exact: true });
      if (await control.count()) await control.first().click().catch(() => {});
    }
  },
  {
    slug: '543life',
    url: 'https://www.543life.com/',
    detail: 'https://www.543life.com/content/koyomi/post20260720.html',
    hover: 'a[href*="/content/koyomi/post20260720.html"]',
    interact: async (page) => {
      const control = page.getByRole('button', { name: 'Next slide', exact: true });
      if (await control.count()) await control.first().click().catch(() => {});
    }
  },
  {
    slug: 'kohfukuji',
    url: 'https://www.kohfukuji.com/',
    detail: 'https://www.kohfukuji.com/property/',
    hover: 'a[href*="/news/2979/"]',
    interact: async (page) => {
      const control = page.locator('button.cm-h__menu');
      if (await control.count()) await control.first().click({ timeout: 3000 }).catch(() => {});
    }
  },
  {
    slug: 'nakagawa',
    url: 'https://www.nakagawa-masashichi.jp/shop/default.aspx',
    detail: 'https://www.nakagawa-masashichi.jp/shop/e/ev0720/',
    hover: 'a[href*="/shop/e/ev0720/"]',
    interact: async (page) => {
      const input = page.getByPlaceholder('キーワードを入力');
      if (await input.count()) await input.first().fill('ふきん').catch(() => {});
    }
  }
];

const results = [];
await mkdir(outRoot, { recursive: true });
await mkdir(tempRoot, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });

async function goto(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (error) {
    if (!String(error).includes('Timeout')) throw error;
  }
  await pause(1800);
}

async function saveScreenshots(reference, record) {
  const dir = resolve(outRoot, reference.slug);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({ locale: 'ja-JP', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await goto(page, reference.url);
    await page.screenshot({ path: resolve(dir, 'hero-1920x1080.png') });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await goto(page, reference.url);
    await page.screenshot({ path: resolve(dir, 'desktop-1440-full.png'), fullPage: true });
    const hoverTarget = page.locator(reference.hover);
    if (await hoverTarget.count()) {
      await hoverTarget.first().hover().catch(() => {});
      await pause(500);
    }
    await page.screenshot({ path: resolve(dir, 'hover-1440.png') });
    await reference.interact(page);
    await pause(900);
    await page.screenshot({ path: resolve(dir, 'menu-or-interaction-1440.png') });

    await page.setViewportSize({ width: 390, height: 844 });
    await goto(page, reference.url);
    await page.screenshot({ path: resolve(dir, 'mobile-390-full.png'), fullPage: true });
    await reference.interact(page);
    await pause(700);
    await page.screenshot({ path: resolve(dir, 'mobile-menu-or-interaction-390.png') });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await goto(page, reference.detail);
    await page.screenshot({ path: resolve(dir, 'detail-1440-full.png'), fullPage: true });

    record.title = await page.title();
    record.finalUrl = page.url();
    record.screenshots = [
      'hero-1920x1080.png', 'desktop-1440-full.png', 'hover-1440.png',
      'menu-or-interaction-1440.png', 'mobile-390-full.png',
      'mobile-menu-or-interaction-390.png', 'detail-1440-full.png'
    ];
  } finally {
    await context.close();
  }
}

async function recordVideo(reference, record, kind) {
  const dir = resolve(outRoot, reference.slug);
  const tempDir = resolve(tempRoot, `${reference.slug}-${kind}`);
  await mkdir(tempDir, { recursive: true });
  const context = await browser.newContext({
    locale: 'ja-JP',
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: tempDir, size: { width: 1280, height: 720 } }
  });
  const page = await context.newPage();
  const video = page.video();
  try {
    await goto(page, reference.url);
    if (kind === 'load-and-images') {
      await pause(4500);
    } else if (kind === 'scroll-20s') {
      const max = await page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
      for (let index = 1; index <= 12; index += 1) {
        await page.evaluate((top) => scrollTo({ top, behavior: 'smooth' }), Math.round(max * index / 12));
        await pause(1350);
      }
    } else {
      const hoverTarget = page.locator(reference.hover);
      if (await hoverTarget.count()) await hoverTarget.first().hover().catch(() => {});
      await pause(2500);
      await reference.interact(page);
      await pause(3500);
      await goto(page, reference.detail);
      await pause(4500);
      await page.evaluate(() => scrollTo({ top: Math.min(document.documentElement.scrollHeight * .28, 1800), behavior: 'smooth' }));
      await pause(3000);
    }
  } finally {
    await context.close();
  }
  const outputName = `${kind}.webm`;
  await copyFile(await video.path(), resolve(dir, outputName));
  record.videos ||= [];
  record.videos.push(outputName);
}

try {
  for (const reference of references) {
    const record = { slug: reference.slug, url: reference.url, detail: reference.detail, errors: [] };
    try { await saveScreenshots(reference, record); } catch (error) { record.errors.push(`screenshots: ${error.message}`); }
    for (const kind of ['load-and-images', 'scroll-20s', 'interaction-15s']) {
      try { await recordVideo(reference, record, kind); } catch (error) { record.errors.push(`${kind}: ${error.message}`); }
    }
    results.push(record);
    console.log(`${reference.slug}: ${record.errors.length ? `部分失敗 ${record.errors.join(' | ')}` : '完成'}`);
  }
} finally {
  await browser.close();
  await rm(tempRoot, { recursive: true, force: true });
}

await writeFile(resolve(outRoot, 'reference-capture-results.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), executablePath, results }, null, 2)}\n`, 'utf8');
if (results.some((result) => result.errors.length)) process.exitCode = 1;
else console.log(`七個參考網站截圖與錄影完成：${outRoot}`);
