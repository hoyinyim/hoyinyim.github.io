import { escapeHtml } from './html.mjs';

const SITE_URL = 'https://hoyinyim.github.io';

export function header(routes, current) {
  const labels = { research: 'Research', journal: 'Publications', about: 'About', cv: 'CV' };
  const primary = ['research', 'journal', 'about', 'cv'].map((id) => routes.find((route) => route.id === id));
  return `<header class="site-header" data-header>
    <a class="brand" href="index.html" aria-label="嚴浩然首頁"><strong>嚴浩然</strong><span>YIM HO YIN</span></a>
    <nav class="primary-nav" aria-label="主要導覽">${primary.map((route) => `<a href="${route.href}"${route.id === current ? ' aria-current="page"' : ''}>${labels[route.id]}</a>`).join('')}</nav>
    <div class="header-actions">
      <button class="header-control search-trigger" type="button" data-search-open aria-haspopup="dialog">Search</button>
      <button class="header-control theme-control" type="button" data-theme-toggle aria-label="目前為淺色模式；切換為深色模式" aria-pressed="false"><span data-theme-label>Light</span></button>
      <button class="header-control menu-trigger" type="button" data-menu-open aria-haspopup="dialog"><span>Menu</span><i aria-hidden="true"></i></button>
    </div>
  </header>`;
}

export function menu(routes, profile, current) {
  const byId = Object.fromEntries(routes.map((route) => [route.id, route]));
  const groups = [
    ['PROFILE', ['about', 'cv', 'certificates']],
    ['RESEARCH &amp; WORK', ['research', 'journal', 'conference', 'translations']],
    ['PRACTICE', ['teaching', 'contact']]
  ];
  return `<dialog class="menu-dialog" data-menu-dialog aria-labelledby="menu-title">
    <div class="menu-shell">
      <div class="dialog-topline"><h2 id="menu-title">Menu</h2><button class="dialog-close" type="button" data-menu-close>Close</button></div>
      <nav class="menu-groups" aria-label="完整網站導覽">${groups.map(([label, ids]) => `<section><h3>${label}</h3>${ids.map((id) => { const route = byId[id]; return `<a href="${route.href}"${id === current ? ' aria-current="page"' : ''}><span>${escapeHtml(route.labelEn)}</span><small>${escapeHtml(route.labelZh)}</small></a>`; }).join('')}</section>`).join('')}</nav>
      <div class="menu-utility"><button type="button" data-search-from-menu>Search the archive</button><button type="button" data-theme-toggle><span data-theme-label>Light</span> theme</button><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></div>
    </div>
  </dialog>`;
}

export function searchDialog() {
  return `<dialog class="search-dialog" data-search-dialog aria-labelledby="search-title">
    <div class="dialog-topline"><h2 id="search-title">Search</h2><button class="dialog-close" type="button" data-search-close>Close</button></div>
    <div class="search-field"><label for="site-search">搜尋頁面、論文或作品</label><input id="site-search" type="search" autocomplete="off" spellcheck="false" data-search-input aria-controls="search-results" aria-describedby="search-status"></div>
    <p class="search-status" id="search-status" data-search-status aria-live="polite">輸入關鍵字，搜尋全站公開資料。</p>
    <ol class="search-results" id="search-results" data-search-results></ol>
    <p class="search-help"><kbd>↑</kbd><kbd>↓</kbd> 移動　<kbd>Enter</kbd> 開啟　<kbd>Esc</kbd> 關閉</p>
  </dialog>`;
}

export function footer(routes, profile) {
  const links = routes.filter((route) => route.id !== 'home').map((route) => `<a href="${route.href}">${escapeHtml(route.labelEn)}</a>`).join('');
  return `<footer class="site-footer">
    <div class="footer-identity"><strong>${escapeHtml(profile.nameZh)}</strong><span>${escapeHtml(profile.nameEn)}</span><p>${escapeHtml(profile.roleZh)}</p></div>
    <nav aria-label="頁尾導覽">${links}</nav>
    <div class="footer-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><button type="button" data-back-top>Back to top ↑</button></div>
    <p class="copyright">© <span data-year></span> YIM HO YIN</p>
  </footer>`;
}

export function breadcrumb(route) {
  if (route.id === 'home') return '';
  return `<nav class="breadcrumb" aria-label="麵包屑"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(route.labelEn)}</span></nav>`;
}

export function layout({ route, routes, profile, title, description, body, jsonLd = null, bodyClass = '', buildCommit = 'local' }) {
  const canonical = `${SITE_URL}/${route.href}`;
  const image = `${SITE_URL}/images/og-default.png`;
  const schemas = Array.isArray(jsonLd) ? jsonLd : (jsonLd ? [jsonLd] : []);
  return `<!DOCTYPE html>
<html lang="zh-Hant" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="build-commit" content="${escapeHtml(buildCommit)}">
  <meta name="color-scheme" content="light dark">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="嚴浩然個人學術網站">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1730">
  <meta property="og:image:height" content="909">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta name="theme-color" content="#f4f5f3">
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/site.css" as="style">
  <link rel="stylesheet" href="assets/site.css">
  <script src="assets/site.js" defer></script>
  ${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`).join('\n  ')}
</head>
<body class="page-${route.id} ${bodyClass}" data-page="${route.id}">
  <a class="skip-link" href="#main-content">跳至主要內容</a>
  <div class="scroll-progress" aria-hidden="true"><i data-scroll-progress></i></div>
  ${header(routes, route.id)}
  ${menu(routes, profile, route.id)}
  ${searchDialog()}
  <main id="main-content" tabindex="-1">${breadcrumb(route)}${body}</main>
  ${footer(routes, profile)}
  <div class="live-region" data-live-region aria-live="polite" aria-atomic="true"></div>
</body>
</html>\n`.replace(/[ \t]+$/gm, '');
}
