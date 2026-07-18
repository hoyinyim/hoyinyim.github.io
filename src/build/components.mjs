import { escapeHtml, number } from './html.mjs';

const SITE_URL = 'https://hoyinyim.github.io';

export function header(routes, current) {
  const primary = routes.filter((route) => ['about', 'research', 'journal', 'conference', 'cv'].includes(route.id));
  const links = primary.map((route) => `<a href="${route.href}"${route.id === current ? ' aria-current="page"' : ''}>${escapeHtml(route.labelZh)}</a>`).join('');
  return `<header class="site-header" data-header>
    <a class="brand" href="index.html" aria-label="嚴浩然首頁"><span>嚴浩然</span><small>YIM HO YIN</small></a>
    <nav class="primary-nav" aria-label="主要導覽">${links}</nav>
    <div class="header-actions">
      <button class="text-control search-trigger" type="button" data-search-open aria-haspopup="dialog"><span>搜尋</span><kbd>Ctrl K</kbd></button>
      <button class="icon-control" type="button" data-theme-toggle aria-label="切換深色或淺色模式"><span aria-hidden="true">◐</span></button>
      <button class="menu-trigger" type="button" data-menu-open aria-haspopup="dialog"><span>選單</span><i aria-hidden="true"></i></button>
    </div>
  </header>`;
}

export function menu(routes, profile, current) {
  const links = routes.map((route, index) => `<li>
    <a href="${route.href}"${route.id === current ? ' aria-current="page"' : ''}>
      <span>${number(index + 1)}</span><strong>${escapeHtml(route.labelZh)}</strong><small>${escapeHtml(route.labelEn)}</small>
    </a>
  </li>`).join('');
  return `<dialog class="menu-dialog" data-menu-dialog aria-labelledby="menu-title">
    <div class="dialog-topline"><p id="menu-title">網站索引</p><button class="dialog-close" type="button" data-menu-close>關閉 <span aria-hidden="true">×</span></button></div>
    <div class="menu-layout">
      <nav aria-label="完整網站導覽"><ol class="menu-index">${links}</ol></nav>
      <aside class="menu-aside">
        <button type="button" class="menu-search" data-search-from-menu>搜尋全站 <span aria-hidden="true">↗</span></button>
        <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>
        <p>${escapeHtml(profile.roleZh)}</p>
      </aside>
    </div>
  </dialog>`;
}

export function searchDialog() {
  return `<dialog class="search-dialog" data-search-dialog aria-labelledby="search-title">
    <div class="dialog-topline"><p id="search-title">搜尋全站</p><button class="dialog-close" type="button" data-search-close>關閉 <span aria-hidden="true">×</span></button></div>
    <div class="search-field">
      <label for="site-search">輸入頁面、論文或作品題名</label>
      <input id="site-search" type="search" autocomplete="off" spellcheck="false" data-search-input aria-controls="search-results" aria-describedby="search-status">
    </div>
    <p class="search-status" id="search-status" data-search-status aria-live="polite">開始輸入以搜尋全部靜態資料。</p>
    <ol class="search-results" id="search-results" data-search-results></ol>
    <p class="search-help"><kbd>↑</kbd><kbd>↓</kbd> 移動　<kbd>Enter</kbd> 開啟　<kbd>Esc</kbd> 關閉</p>
  </dialog>`;
}

export function footer(routes, profile) {
  const links = routes.map((route) => `<a href="${route.href}">${escapeHtml(route.labelZh)}</a>`).join('');
  return `<footer class="site-footer">
    <div class="footer-identity"><strong>${escapeHtml(profile.nameZh)}</strong><span>${escapeHtml(profile.nameEn)}</span></div>
    <nav aria-label="頁尾導覽">${links}</nav>
    <div class="footer-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><button type="button" data-back-top>返回頁首 ↑</button></div>
    <p class="copyright">© <span data-year></span> YIM HO YIN. All Rights Reserved.</p>
  </footer>`;
}

export function breadcrumb(route) {
  if (route.id === 'home') return '';
  return `<nav class="breadcrumb" aria-label="麵包屑"><a href="index.html">首頁</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(route.labelZh)}</span></nav>`;
}

export function pageHero({ eyebrow, title, lead = '', index = '' }) {
  return `<header class="page-hero">
    <div class="page-hero-index" aria-hidden="true">${escapeHtml(index)}</div>
    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
    <h1>${escapeHtml(title)}</h1>
    ${lead ? `<p class="page-lead">${escapeHtml(lead)}</p>` : ''}
  </header>`;
}

export function layout({ route, routes, profile, title, description, body, jsonLd = null, bodyClass = '' }) {
  const canonical = `${SITE_URL}/${route.href}`;
  const image = `${SITE_URL}/images/profile.png.JPG`;
  return `<!DOCTYPE html>
<html lang="zh-Hant" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_TW">
  <meta property="og:site_name" content="嚴浩然個人學術網站">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#f2efe7">
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/site.css" as="style">
  <link rel="stylesheet" href="assets/site.css">
  <script src="assets/site.js" defer></script>
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<', '\\u003c')}</script>` : ''}
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
