import { chromium } from 'playwright-core';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outDir = resolve(root, 'docs/qa/waseda-foodecon');
const url = 'https://prj-foodecon.w.waseda.jp/';
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const observations = { capturedAt: new Date().toISOString(), url, desktop: {}, mobile: {}, reducedMotion: {} };

const inspect = async (page) => page.evaluate(() => {
  const toggle = document.querySelector('.toggle');
  const menu = document.querySelector('#menu');
  const dish = document.querySelector('.dish');
  const links = [...document.querySelectorAll('#menu .navi a')];
  const css = (node) => node ? getComputedStyle(node) : null;
  return {
    toggle: toggle ? { tag: toggle.tagName, className: toggle.className, role: toggle.getAttribute('role'), tabIndex: toggle.tabIndex, transition: css(toggle.querySelector('span'))?.transition } : null,
    menu: menu ? { className: menu.className, opacity: css(menu).opacity, pointerEvents: css(menu).pointerEvents, transition: css(menu).transition } : null,
    dish: dish ? { width: css(dish).width, height: css(dish).height, left: css(dish).left, top: css(dish).top } : null,
    body: { className: document.body.className, overflow: css(document.body).overflow },
    links: links.map((link) => link.textContent.replace(/\s+/g, ' ').trim()),
    activeElement: document.activeElement?.tagName,
    reducedMotionRules: [...document.styleSheets].flatMap((sheet) => { try { return [...sheet.cssRules].map((rule) => rule.cssText); } catch { return []; } }).filter((text) => /prefers-reduced-motion/.test(text)).length
  };
});

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: outDir, size: { width: 1440, height: 900 } } });
const desktop = await desktopContext.newPage();
const response = await desktop.goto(url, { waitUntil: 'networkidle' });
observations.desktop.httpStatus = response?.status();
observations.desktop.closed = await inspect(desktop);
await desktop.screenshot({ path: resolve(outDir, 'desktop-closed-1440.png') });
await desktop.locator('.toggle').hover();
await desktop.screenshot({ path: resolve(outDir, 'desktop-hover-1440.png') });
await desktop.locator('.toggle').click();
await desktop.waitForTimeout(120);
observations.desktop.open120ms = await inspect(desktop);
await desktop.screenshot({ path: resolve(outDir, 'desktop-opening-120ms.png') });
await desktop.waitForTimeout(580);
observations.desktop.open700ms = await inspect(desktop);
await desktop.screenshot({ path: resolve(outDir, 'desktop-open-700ms.png') });
await desktop.locator('.toggle').click();
await desktop.waitForTimeout(650);
observations.desktop.closedAfter = await inspect(desktop);
await desktop.screenshot({ path: resolve(outDir, 'desktop-closed-after.png') });
const video = desktop.video();
await desktop.close();
await desktopContext.close();
if (video) await rename(await video.path(), resolve(outDir, 'desktop-open-close.webm'));

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobile = await mobileContext.newPage();
await mobile.goto(url, { waitUntil: 'networkidle' });
observations.mobile.closed = await inspect(mobile);
await mobile.screenshot({ path: resolve(outDir, 'mobile-closed-390.png'), fullPage: false });
await mobile.locator('.toggle').click();
await mobile.waitForTimeout(700);
observations.mobile.open = await inspect(mobile);
await mobile.screenshot({ path: resolve(outDir, 'mobile-open-390.png'), fullPage: false });
await mobileContext.close();

const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const reduced = await reducedContext.newPage();
await reduced.goto(url, { waitUntil: 'networkidle' });
await reduced.locator('.toggle').click();
await reduced.waitForTimeout(100);
observations.reducedMotion.open100ms = await inspect(reduced);
await reduced.screenshot({ path: resolve(outDir, 'reduced-motion-open-100ms.png') });
await reducedContext.close();

await browser.close();
await writeFile(resolve(outDir, 'reference-observations.json'), `${JSON.stringify(observations, null, 2)}\n`, 'utf8');
console.log(`早稻田參考選單證據已保存：${outDir}`);
