import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const base = new URL(`${(process.env.SITE_URL || 'http://127.0.0.1:4196').replace(/\/+$/, '')}/`);
const url = new URL('cv.html', base);
if (process.env.CV_EXPECTED_BUILD) url.searchParams.set('cv-qa', process.env.CV_EXPECTED_BUILD);
const chrome = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome');
const out = new URL('../../tmp/cv-research-glyphs-qa/', import.meta.url);
const viewports = [{ width: 320, height: 720 }, { width: 375, height: 812 },
  { width: 768, height: 1024 }, { width: 1440, height: 960 }];
const experience = [
  '兼任講師，樹人醫護管理專科學校通識教育中心（2021/02－2023/07）。',
  '參與國際漢學、英語學術發表、EMI 與跨文化研究相關工作。',
  '長期從事中英翻譯、學術寫作、哲學普及與研究資料整理。',
];
const expertise = [
  ['expertise-01', '先秦思想', 'pre-qin', '2e0df3e217e9c13b464d1159e30cfd247401e951ea118ec6e95b58344469bdcf'],
  ['expertise-02', '荀子哲學', 'xunzi', '26a0e6eae0fa72cd28a7961f67ddf4a05e9c4ebde262a8dab64d36e2dc53be95'],
  ['expertise-03', '老子思想', 'laozi', 'db9dacf99116e9a16afbecf9a5b999142727fe0c7d3b15cf52dc6962b8d64c3c'],
  ['expertise-04', '出土文獻思想', 'excavated-texts', 'c236eadf374015d5ce8b92119ed963be67118d35858ed0557fa3d87c1cf9c4d3'],
  ['expertise-05', '中國倫理與政治思想', 'ethics-politics', '5d23a62742b75d9ae09becdd51400f49b8164f213c3ff49e5ff8071872472215'],
  ['expertise-06', '魏晉思想', 'wei-jin', '4a49bb481739ebaaa8904b3ac702af2bc672fcc9f7b4bf67d17f0a657a18b86e'],
];
const glyphUrl = (name) => new URL(`images/cv/${name}.png`, base).href;
const pdfPath = 'downloads/yim-ho-yin-cv.pdf';
const pdfHash = 'decb495d928ddde2ad1e00390527235514376c771b4c3c6cd7b377ab886d6c9f';

async function openCv(page) {
  const response = await page.goto(url.href, { waitUntil: 'load', timeout: 20000 });
  assert.equal(response?.status(), 200, url.href);
  if (process.env.CV_EXPECTED_BUILD) {
    assert.equal(await page.locator('meta[name="build-commit"]').getAttribute('content'), process.env.CV_EXPECTED_BUILD);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.cv-entry-glyph').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
}

async function checkEntries(page) {
  const images = await page.locator('.cv-entry-glyph').count();
  assert.equal(images, 6, '研究圖像數量');
  assert.equal(await page.locator('link[rel="stylesheet"][href^="assets/cv-research.css"]').count(), 1);
  assert.equal(await page.locator('.cv-entry-emblem, .credential-mark, #cv-experience img, #cv-projects img').count(), 0);
  assert.deepEqual(await page.locator('#cv-experience .cv-list > li').evaluateAll((rows) =>
    rows.map((row) => row.textContent.trim())), experience, '職歷內容不得更動');
  const rows = await page.locator('#cv-research [data-cv-expertise]').evaluateAll((items) => items.map((row) => ({
    type: row.dataset.cvExpertise,
    name: row.querySelector('h3')?.textContent.trim(),
    description: row.querySelector('p')?.textContent.trim(),
    paths: [...row.querySelectorAll('img')].map((image) => image.src),
  })));
  assert.deepEqual(rows.map(({ type, name, paths }) => [type, name, paths]), expertise.map(([id, name, path]) =>
    [id, name, path ? [glyphUrl(path)] : []]));
  assert.ok(rows.every(({ description }) => description), '既有研究說明不可消失');
  assert.equal(await page.locator('#cv-projects .cv-list > li').count(), 3);
}

async function checkLayout(page, label) {
  const geometry = await page.evaluate(() => {
    const findings = [...document.querySelectorAll('#cv-research .cv-entry-glyph')].map((image) => {
      const row = image.closest('li');
      const text = row.querySelector('.cv-entry-copy');
      const box = image.getBoundingClientRect();
      const copyBox = text.getBoundingClientRect();
      const rowBox = row.getBoundingClientRect();
      const style = getComputedStyle(image);
      const loaded = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
      const declared = Number(image.getAttribute('width')) === image.naturalWidth
        && Number(image.getAttribute('height')) === image.naturalHeight;
      const visible = box.width >= 12 && box.height >= 12 && style.visibility === 'visible' && Number(style.opacity) > 0;
      const fits = box.left >= rowBox.left - 1 && box.right <= copyBox.left + 1
        && copyBox.width > 0 && copyBox.right <= rowBox.right + 1;
      return { id: row.dataset.cvExpertise, loaded, declared, visible, fits, alt: image.hasAttribute('alt') };
    });
    const root = document.documentElement;
    return { findings, width: root.clientWidth, scrollWidth: root.scrollWidth, fontSize: getComputedStyle(root).fontSize };
  });
  assert.equal(geometry.findings.length, 6, label);
  assert.deepEqual(geometry.findings.filter(({ loaded, declared, visible, fits, alt }) =>
    !loaded || !declared || !visible || !fits || !alt), [], label);
  assert.ok(geometry.scrollWidth <= geometry.width + 1, `${label}：頁面橫溢 ${geometry.scrollWidth}/${geometry.width}`);
  return geometry;
}

async function capture(page, label) {
  const clearance = await page.locator('#cv-research').evaluate((section) => {
    const header = document.querySelector('[data-header]');
    const bottom = header?.getBoundingClientRect().bottom || 0;
    scrollTo({ top: Math.max(0, section.getBoundingClientRect().top + scrollY - bottom - 12), behavior: 'instant' });
    return { title: section.querySelector('h2').getBoundingClientRect().top, header: header?.getBoundingClientRect().bottom || 0 };
  });
  assert.ok(clearance.title >= clearance.header - 1, `${label}：固定頁首遮住標題`);
  await page.screenshot({ path: fileURLToPath(new URL(`${label}.png`, out)), animations: 'disabled' });
}

async function checkAsset(page, href, sha256, magic) {
  const target = new URL(href, base);
  if (process.env.CV_EXPECTED_BUILD) target.searchParams.set('cv-qa', process.env.CV_EXPECTED_BUILD);
  const response = await page.request.get(target.href, { timeout: 15000 });
  assert.ok(response.ok(), `${target.pathname} HTTP ${response.status()}`);
  const data = await response.body();
  assert.ok(data.subarray(0, magic.length).equals(magic), `${target.pathname} 檔案類型`);
  assert.equal(createHash('sha256').update(data).digest('hex'), sha256, `${target.pathname} 資料位元須保留`);
}

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, locale: 'zh-TW', colorScheme: 'light', reducedMotion: 'reduce' });
    const label = `screen-${viewport.width}`;
    try {
      await openCv(page);
      await checkEntries(page);
      await checkLayout(page, label);
      await capture(page, label);
      if (viewport.width === 768) {
        const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        for (const [, , file, digest] of expertise.filter((row) => row[2])) {
          await checkAsset(page, glyphUrl(file), digest, pngSignature);
        }
        assert.equal(await page.locator(`a[download][href="${pdfPath}"]`).count(), 1);
        await checkAsset(page, pdfPath, pdfHash, Buffer.from('%PDF-'));
        await page.emulateMedia({ media: 'print' });
        assert.ok(await page.evaluate(() => matchMedia('print').matches));
        await checkLayout(page, 'print');
        await capture(page, 'print');
      }
      console.log(`通過：${label}`);
    } finally {
      await page.close();
    }
  }
  const noJs = await browser.newPage({ viewport: viewports[1], javaScriptEnabled: false });
  await openCv(noJs);
  await checkEntries(noJs);
  await checkLayout(noJs, 'no-js');
  await capture(noJs, 'no-js');
  console.log('通過：停用 JavaScript、列印預覽、六張圖與舊下載 PDF 的 SHA-256');
} finally {
  await browser.close();
}

const enlarged = await chromium.launch({ executablePath: chrome, headless: true, args: ['--blink-settings=defaultFontSize=32'] });
try {
  const page = await enlarged.newPage({ viewport: viewports[1], locale: 'zh-TW', reducedMotion: 'reduce' });
  await openCv(page);
  const label = 'screen-375-native-text200';
  const geometry = await checkLayout(page, label);
  assert.equal(geometry.fontSize, '32px', '未實際啟用瀏覽器 200% 預設字級');
  await capture(page, label);
  console.log(`通過：${label}`);
} finally {
  await enlarged.close();
}
