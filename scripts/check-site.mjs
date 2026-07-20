import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { load } from 'cheerio';
import { HtmlValidate } from 'html-validate';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const routes = JSON.parse(await readFile(resolve(root, 'src/data/routes.json'), 'utf8'));
const htmlFiles = [...routes.map((route) => route.href), '404.html'];
const referenceUrl = 'https://prj-foodecon.w.waseda.jp/';
const requiredMenuDocs = [
  'docs/reference-study-waseda-foodecon.md',
  'docs/traditional-chinese-site-policy.md',
  'docs/future-english-site-plan.md',
  'docs/ancient-script-menu-design.md',
  'docs/ancient-script-menu-glyph-map.md',
  'docs/ancient-script-menu-animation-map.md',
  'docs/ancient-script-menu-accessibility.md',
  'docs/ancient-script-menu-responsive-qa.md',
  'docs/reference-url-registry.md',
  'docs/reference-synthesis-matrix.md',
  'docs/reference-to-component-mapping.md',
  'docs/reference-fidelity-report.md',
  'docs/final-release-report.md'
];
const referenceRegistryDocs = [
  'docs/reference-study-waseda-foodecon.md',
  'docs/reference-url-registry.md',
  'docs/reference-synthesis-matrix.md',
  'docs/reference-to-component-mapping.md',
  'docs/reference-fidelity-report.md',
  'docs/final-release-report.md'
];
const errors = [];
let checks = 0;
const check = (condition, message) => { checks += 1; if (!condition) errors.push(message); };
const validator = new HtmlValidate({ extends: ['html-validate:recommended'], rules: { 'no-inline-style': 'error', 'wcag/h30': 'off' } });

for (const required of ['robots.txt', 'sitemap.xml', 'rss.xml', 'assets/site.css', 'assets/site.js', 'assets/search-index.json']) await access(resolve(root, required));
for (const required of requiredMenuDocs) {
  await access(resolve(root, required));
  check((await stat(resolve(root, required))).size > 0, `${required} 為空白文件`);
}
for (const required of referenceRegistryDocs) {
  const content = await readFile(resolve(root, required), 'utf8');
  check(content.includes(referenceUrl), `${required} 遺漏 Food Economics 完整網址`);
}
check(routes.every((route) => route.locale === 'zh-Hant'), '並非所有路由均明確標記 zh-Hant');
check(routes.every((route) => route.futureLocaleHref === null), '未完成的英文路由不應公開');
check(routes.every((route) => !route.href.startsWith('en/')), '正式路由意外包含 /en/');
check(!(await readdir(resolve(root, 'assets'))).includes('archive-pages.css'), 'archive-pages.css 尚未移除');
check(!(await readdir(resolve(root, 'assets'))).includes('third-stage.css'), 'third-stage.css 尚未移除');

for (const file of htmlFiles) {
  const html = await readFile(resolve(root, file), 'utf8');
  const $ = load(html);
  check($('html[lang="zh-Hant"]').length === 1, `${file} 語言標記錯誤`);
  check($('meta[name="viewport"]').length === 1, `${file} viewport 遺漏或重複`);
  check($('title').length === 1 && $('title').text().trim(), `${file} title 遺漏或重複`);
  check($('meta[name="description"]').length === 1, `${file} meta description 遺漏或重複`);
  check($('link[rel="canonical"]').length === 1, `${file} canonical 遺漏或重複`);
  check($('meta[property="og:title"]').length === 1 && $('meta[property="og:url"]').length === 1, `${file} Open Graph 不完整`);
  check($('h1').length === 1, `${file} 必須只有一個 H1，目前 ${$('h1').length}`);
  check($('.site-header').length === 1 && $('.site-footer').length === 1, `${file} Header／Footer 不是唯一共用元件`);
  check($('[data-menu-dialog]').length === 1 && $('[data-search-dialog]').length === 1, `${file} Menu／Search Dialog 不是唯一元件`);
  const menuLabels = $('[data-menu-dialog] .menu-item-label').map((_, node) => $(node).text().trim()).get();
  check(JSON.stringify(menuLabels) === JSON.stringify(['關於', '研究', '著作', '教學', '履歷', '聯絡']), `${file} 六項繁體中文主 Menu 順序錯誤：${menuLabels.join('、')}`);
  check($('[data-menu-open][aria-controls="site-menu"]').length === 1, `${file} Menu 觸發器語意不完整`);
  const noscriptMenu = html.match(/<noscript><nav class="noscript-menu"[\s\S]*?<\/nav><\/noscript>/)?.[0] ?? '';
  check((noscriptMenu.match(/<a\s/g) || []).length === 6, `${file} 無 JavaScript 六項後備導覽不完整`);
  check($('link[rel="stylesheet"][href="assets/site.css"]').length === 1 && $('script[src="assets/site.js"]').length === 1, `${file} 共用資產引用錯誤`);
  check($('style').length === 0 && $('[style]').length === 0, `${file} 仍有內嵌 CSS`);
  check($('script:not([src]):not([type="application/ld+json"])').length === 0, `${file} 仍有內嵌 JavaScript`);
  check($('a[href^="javascript:"]').length === 0, `${file} 仍有 javascript: URL`);
  check($('.skip-link[href="#main-content"]').length === 1 && $('#main-content').length === 1, `${file} Skip Link 不完整`);
  $('img').each((_, node) => {
    const image = $(node);
    check(image.attr('alt') !== undefined, `${file} 圖片缺少 alt`);
    check(Boolean(image.attr('width') && image.attr('height')), `${file} 圖片缺少寬高屬性：${image.attr('src')}`);
  });
  $('a[href^="http"]').each((_, node) => {
    const link = $(node);
    check(link.attr('target') === '_blank' && link.attr('rel')?.split(/\s+/).includes('noopener') && link.attr('rel')?.split(/\s+/).includes('noreferrer'), `${file} 外部連結安全屬性不完整：${link.attr('href')}`);
  });
  $('a[href]').each((_, node) => {
    const href = $(node).attr('href');
    if (!href || /^(https?:|mailto:|#)/.test(href)) return;
    const [target] = href.split('#');
    check(htmlFiles.includes(target) || existsSync(resolve(root, target)), `${file} 內部連結目標不存在：${href}`);
  });
  $('script[type="application/ld+json"]').each((_, node) => {
    try { JSON.parse($(node).html()); check(true, `${file} JSON-LD 可解析`); } catch { check(false, `${file} JSON-LD 無法解析`); }
  });
  const validation = await validator.validateString(html, file);
  check(validation.valid, `${file} HTML 驗證失敗：${validation.results.flatMap((result) => result.messages.map((message) => `${message.ruleId}@${message.line}:${message.column}`)).join('、')}`);
}

const css = await readFile(resolve(root, 'assets/site.css'), 'utf8');
const js = await readFile(resolve(root, 'assets/site.js'), 'utf8');
check(!/body:has\(/.test(css), 'CSS 仍有 body:has 頁面覆寫');
check(!/overflow-x:\s*(hidden|clip)/.test(css), 'CSS 使用 overflow-x 掩蓋問題');
check((css.match(/!important/g) || []).length <= 8, 'CSS !important 使用過量');
check(!/fetch\([^)]*\.html/.test(js), '搜尋仍在抓取完整 HTML');
check((js.match(/addEventListener\(['"]scroll/g) || []).length === 1, 'Scroll Listener 不是唯一系統');
check((js.match(/requestAnimationFrame/g) || []).length <= 3, 'RAF 控制點異常增加');
check((await stat(resolve(root, 'assets/site.js'))).size < 30_000, 'JavaScript 超過 30 KB 預算');
check((await stat(resolve(root, 'assets/site.css'))).size < 60_000, 'CSS 超過 60 KB 預算');

const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
for (const route of routes) check(sitemap.includes(`https://hoyinyim.github.io/${route.href}`), `Sitemap 遺漏 ${route.href}`);
const searchIndex = JSON.parse(await readFile(resolve(root, 'assets/search-index.json'), 'utf8'));
check(searchIndex.length >= 70, `搜尋索引筆數異常：${searchIndex.length}`);

const glyphs = JSON.parse(await readFile(resolve(root, 'src/data/ancient-script-menu-glyphs.json'), 'utf8'));
check(glyphs.length === 6, `古文字 Menu 必須恰有六筆字形，目前 ${glyphs.length}`);
check(glyphs.every((glyph) => glyph.verified === true), '古文字 Menu 含未核實字形');
check(glyphs.every((glyph) => glyph.sourceUrl && glyph.assetSourceUrl && glyph.license && glyph.licenseUrl && glyph.checkedAt), '古文字字形來源或授權欄位不完整');
check(new Set(glyphs.map((glyph) => glyph.assetPath)).size === 6, '古文字資產路徑重複');
for (const glyph of glyphs) {
  check(existsSync(resolve(root, glyph.assetPath)), `古文字資產不存在：${glyph.assetPath}`);
}

if (errors.length) {
  console.error(`網站技術檢查失敗：${errors.length} 項／${checks} 項。`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`網站技術檢查通過：${checks} 項；${htmlFiles.length} 頁使用單一導覽、Menu、搜尋、CSS 與 JavaScript 系統。`);
}
