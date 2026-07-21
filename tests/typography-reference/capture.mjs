import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const outDir = resolve(root, 'docs/qa/typography-reference');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const refs = [
  { slug: 'hashi', home: 'https://hashi.co.jp/', detail: 'https://hashi.co.jp/about/', menu: 'button' },
  { slug: 'kaitaksha', home: 'https://kaitaksha.com/', detail: 'https://kaitaksha.com/about/', menuText: 'もくじ' },
  { slug: 'aa-design-rule', home: 'https://aa-design-lab.com/', detail: 'https://aa-design-lab.com/rule', menuText: 'MENU' }
];
const cases = [
  { width: 1920, height: 1080, zoom: 1, id: '1920x1080' },
  { width: 1440, height: 1000, zoom: 1, id: '1440x1000' },
  { width: 1280, height: 800, zoom: 1, id: '1280x800' },
  { width: 1024, height: 768, zoom: 1, id: '1024x768' },
  { width: 820, height: 1180, zoom: 1, id: '820x1180' },
  { width: 768, height: 1024, zoom: 1, id: '768x1024' },
  { width: 430, height: 932, zoom: 1, id: '430x932' },
  { width: 390, height: 844, zoom: 1, id: '390x844' },
  { width: 360, height: 800, zoom: 1, id: '360x800' },
  { width: 320, height: 720, zoom: 1, id: '320x720' },
  { width: 1440, height: 1000, zoom: 1.25, id: 'zoom-125' },
  { width: 1440, height: 1000, zoom: 1.5, id: 'zoom-150' },
  { width: 1440, height: 1000, zoom: 1.75, id: 'zoom-175' },
  { width: 1440, height: 1000, zoom: 2, id: 'zoom-200' }
];

function measure() {
  const candidates = [...document.querySelectorAll('h1,h2,h3,p,header,footer,nav,a,button')].filter((node) => {
    const rect = node.getBoundingClientRect(); const style = getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  }).slice(0, 180);
  return candidates.map((node) => {
    const style = getComputedStyle(node); const rect = node.getBoundingClientRect();
    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;
    const text = (node.textContent || '').trim().replace(/\s+/g, ' ');
    return { tag: node.tagName, className: String(node.className || '').slice(0, 100), text: text.slice(0, 240), chars: text.length, width: Math.round(rect.width), height: Math.round(rect.height), lines: Math.max(1, Math.round(rect.height / lineHeight)), br: node.querySelectorAll('br').length, fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, fontStyle: style.fontStyle, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, wordSpacing: style.wordSpacing, color: style.color, backgroundColor: style.backgroundColor, maxWidth: style.maxWidth, padding: style.padding, margin: style.margin, gap: style.gap, display: style.display, gridTemplateColumns: style.gridTemplateColumns, alignItems: style.alignItems, justifyContent: style.justifyContent, position: style.position, transform: style.transform, transition: style.transition, wordBreak: style.wordBreak, lineBreak: style.lineBreak, textWrap: style.textWrap, fontFeatureSettings: style.fontFeatureSettings, fontVariantEastAsian: style.fontVariantEastAsian };
  });
}

function inspectSource() {
  const styleSheets = [...document.styleSheets].map((sheet, index) => {
    let rules = []; let inaccessible = false;
    try { rules = [...sheet.cssRules]; } catch { inaccessible = true; }
    const media = rules.filter((rule) => rule.type === CSSRule.MEDIA_RULE).map((rule) => rule.conditionText);
    const fontFaces = rules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).map((rule) => rule.cssText.slice(0, 500));
    return { index, href: sheet.href || 'inline', disabled: sheet.disabled, inaccessible, ruleCount: rules.length, media, fontFaces };
  });
  const rootStyle = getComputedStyle(document.documentElement);
  const customProperties = [...document.styleSheets].flatMap((sheet) => { try { return [...sheet.cssRules]; } catch { return []; } }).filter((rule) => rule.style).flatMap((rule) => [...rule.style].filter((name) => name.startsWith('--')).map((name) => ({ name, value: rule.style.getPropertyValue(name).trim() }))).slice(0, 240);
  const fonts = [...document.fonts].map((font) => ({ family: font.family, style: font.style, weight: font.weight, status: font.status }));
  const dom = [...document.body.children].map((node) => ({ tag: node.tagName, id: node.id, className: String(node.className || '').slice(0, 160), children: [...node.children].slice(0, 18).map((child) => ({ tag: child.tagName, id: child.id, className: String(child.className || '').slice(0, 120) })) }));
  const colors = [...document.querySelectorAll('body,header,nav,main,section,article,h1,h2,h3,p,a,button,footer')].slice(0, 320).flatMap((node) => { const style = getComputedStyle(node); return [style.color, style.backgroundColor, style.borderColor].filter((value) => value && value !== 'rgba(0, 0, 0, 0)'); });
  return { styleSheets, customProperties, fonts, dom, colors: [...new Set(colors)], root: { color: rootStyle.color, backgroundColor: rootStyle.backgroundColor } };
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
try {
  for (const ref of refs) {
    const refDir = resolve(outDir, ref.slug); await mkdir(refDir, { recursive: true });
    for (const current of cases) {
      const context = await browser.newContext({ locale: 'ja-JP', viewport: { width: current.width, height: current.height } });
      const page = await context.newPage();
      for (const [pageKind, url] of [['home', ref.home], ['detail', ref.detail]]) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
        await page.waitForTimeout(2500);
        if (current.zoom !== 1) await page.evaluate((zoom) => { document.documentElement.style.zoom = String(zoom); }, current.zoom);
        const metrics = await page.evaluate(measure);
        const source = await page.evaluate(inspectSource);
        const file = `${pageKind}-${current.id}.jpg`;
        await page.screenshot({ path: resolve(refDir, file), type: 'jpeg', quality: 68, fullPage: true });
        results.push({ ref: ref.slug, pageKind, url: page.url(), title: await page.title(), ...current, metrics, source, screenshot: `${ref.slug}/${file}` });
      }
      await page.goto(ref.home, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {}); await page.waitForTimeout(2200);
      const control = ref.menuText ? page.getByText(ref.menuText, { exact: true }).first() : page.locator(ref.menu).first();
      if (await control.count()) await control.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(650);
      const menuFile = `menu-${current.id}.jpg`;
      await page.screenshot({ path: resolve(refDir, menuFile), type: 'jpeg', quality: 68 });
      results.push({ ref: ref.slug, pageKind: 'menu', ...current, metrics: await page.evaluate(measure), screenshot: `${ref.slug}/${menuFile}` });
      await context.close();
    }
  }
} finally { await browser.close(); }

await writeFile(resolve(outDir, 'reference-typography-matrix.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), cases, results }, null, 2)}\n`, 'utf8');
console.log(`參考網站排印實測完成：${results.length} 個情境。`);
