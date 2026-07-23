import { escapeHtml } from './html.mjs';
import { miniGlyph } from './glyphs.mjs';

const SITE_URL = 'https://hoyinyim.github.io';

export function header(routes, current) {
  const labels = { research: '研究', publications: '著作', about: '關於', cv: '履歷' };
  const primary = ['research', 'publications', 'about', 'cv'].map((id) => routes.find((route) => route.id === id));
  return `<header class="site-header" data-header>
    <a class="brand" href="index.html" aria-label="嚴浩然首頁"><strong>嚴浩然</strong><span>YIM HO YIN</span></a>
    <nav class="primary-nav" aria-label="主要導覽">${primary.map((route) => `<a href="${route.href}"${route.id === current ? ' aria-current="page"' : ''}>${labels[route.id]}</a>`).join('')}</nav>
    <div class="header-actions">
      <button class="header-control search-trigger" type="button" data-search-open aria-haspopup="dialog">搜尋</button>
      <button class="header-control theme-control" type="button" data-theme-toggle aria-label="目前為淺色模式；切換為深色模式" aria-pressed="false"><span data-theme-label>淺色</span></button>
      <button class="header-control menu-trigger" type="button" data-menu-open aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu"><span>選單</span><span class="menu-trigger-glyph" aria-hidden="true"><i></i><i></i><i></i></span></button>
    </div>
  </header>`;
}

export function menu(routes, profile, current, routeGlyphMap = {}, siteGlyphs = []) {
  const byId = Object.fromEntries(routes.map((route) => [route.id, route]));
  const items = [
    ['about', '關於', 'about'],
    ['research', '研究', 'research'],
    ['publications', '著作', 'publications'],
    ['teaching', '教學', 'teaching'],
    ['cv', '履歷', 'cv'],
    ['contact', '聯絡', 'contact']
  ];
  const currentMenuId = current === 'about' ? 'about' : current === 'research' ? 'research' : ['publications', 'journal', 'conference', 'translations', 'certificates'].includes(current) ? 'publications' : ['teaching', 'cv', 'contact'].includes(current) ? current : 'research';
  const glyphById = Object.fromEntries(siteGlyphs.filter((glyph) => glyph.verified && glyph.semanticVerified && glyph.orientationVerified && glyph.approvedForUse).map((glyph) => [glyph.id, glyph]));
  const primaryLinks = items.map(([menuId, label, routeId], index) => {
    const route = byId[routeId];
    const glyph = glyphById[routeGlyphMap[route.href]];
    const isCurrent = currentMenuId === menuId && current !== 'home' && current !== 'not-found';
    return `<li><a href="${route.href}" data-menu-target="${menuId}"${isCurrent ? ' aria-current="page"' : ''}><span class="menu-item-number">0${index + 1}</span><span class="menu-item-label">${label}</span>${glyph ? `<img src="${glyph.assetPath}" width="300" height="300" alt="" aria-hidden="true">` : ''}</a></li>`;
  }).join('');
  const glyphStage = items.map(([, , routeId]) => byId[routeId]).map((route) => ({ menuId: route.id, glyph: glyphById[routeGlyphMap[route.href]] })).filter(({ glyph }) => glyph).map(({ menuId, glyph }) => `<img src="${glyph.assetPath}" width="300" height="300" alt="" aria-hidden="true" data-menu-glyph="${menuId}"${menuId === currentMenuId ? ' data-active="true"' : ''}>`).join('');
  return `<noscript><nav class="noscript-menu" aria-label="網站導覽"><a href="about.html">關於</a><a href="research.html">研究</a><a href="journal-papers.html">著作</a><a href="teaching.html">教學</a><a href="cv.html">履歷</a><a href="contact.html">聯絡</a></nav></noscript>
  <dialog class="menu-dialog" id="site-menu" data-menu-dialog data-initial-glyph="${currentMenuId}" aria-labelledby="menu-title">
    <div class="menu-shell">
      <div class="dialog-topline"><p id="menu-title">網站導覽</p><button class="dialog-close" type="button" data-menu-close>關閉</button></div>
      <div class="menu-composition">
        <figure class="menu-glyph-stage" aria-hidden="true"><span class="menu-glyph-axis"></span>${glyphStage}</figure>
        <nav class="menu-groups" aria-label="完整網站導覽"><ol>${primaryLinks}</ol><div class="menu-subnav" role="group" aria-label="著作分類"><a href="journal-papers.html"${current === 'journal' ? ' aria-current="page"' : ''}>期刊論文</a><a href="conference-papers.html"${current === 'conference' ? ' aria-current="page"' : ''}>研討會論文</a><a href="translations.html"${current === 'translations' ? ' aria-current="page"' : ''}>譯著與公共寫作</a><a href="certificates.html"${current === 'certificates' ? ' aria-current="page"' : ''}>證照與獎項</a></div></nav>
      </div>
      <div class="menu-utility"><button type="button" data-search-from-menu>搜尋全站</button><button type="button" data-theme-toggle>切換為<span data-theme-action>深色</span>模式</button><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a></div>
    </div>
  </dialog>`;
}

export function searchDialog() {
  return `<dialog class="search-dialog" data-search-dialog aria-labelledby="search-title">
    <div class="dialog-topline"><h2 id="search-title">搜尋</h2><button class="dialog-close" type="button" data-search-close>關閉</button></div>
    <div class="search-field"><label for="site-search">搜尋頁面、論文或作品</label><input id="site-search" type="search" autocomplete="off" spellcheck="false" data-search-input aria-controls="search-results" aria-describedby="search-status"></div>
    <p class="search-status" id="search-status" data-search-status aria-live="polite">輸入關鍵字，搜尋全站公開資料。</p>
    <ol class="search-results" id="search-results" data-search-results></ol>
    <p class="search-help"><kbd>↑</kbd><kbd>↓</kbd> 移動　<kbd>Enter</kbd> 開啟　<kbd>Esc</kbd> 關閉</p>
  </dialog>`;
}

export function footer(routes, profile, siteGlyphs = []) {
  const links = routes.filter((route) => route.id !== 'home').map((route) => `<a href="${route.href}">${escapeHtml(route.labelZh)}</a>`).join('');
  return `<footer class="site-footer">
    <div class="footer-identity"><div class="footer-glyphs">${miniGlyph(siteGlyphs, 'chu-study', 'footer-research')}${miniGlyph(siteGlyphs, 'chu-speech', 'footer-service')}${miniGlyph(siteGlyphs, 'chu-teaching', 'footer-teaching')}</div><strong>${escapeHtml(profile.nameZh)}</strong><span>${escapeHtml(profile.nameEn)}</span><p>${escapeHtml(profile.roleZh)}</p></div>
    <nav aria-label="頁尾導覽">${links}</nav>
    <div class="footer-contact"><a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a><button type="button" data-back-top>返回頁首 ↑</button></div>
    <p class="copyright">© <span data-year></span> YIM HO YIN</p>
  </footer>`;
}

export function breadcrumb(route) {
  if (route.id === 'home') return '';
  return `<nav class="breadcrumb" aria-label="麵包屑"><a href="index.html">首頁</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(route.labelZh)}</span></nav>`;
}

export function layout({ route, routes, profile, routeGlyphMap, siteGlyphs, title, description, body, jsonLd = null, bodyClass = '', buildCommit = 'local' }) {
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
  <link rel="preload" href="assets/site.css?v=${escapeHtml(buildCommit)}" as="style">
  <link rel="stylesheet" href="assets/site.css?v=${escapeHtml(buildCommit)}">
  <script src="assets/site.js?v=${escapeHtml(buildCommit)}" defer></script>
  ${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`).join('\n  ')}
</head>
<body class="page-${route.id} ${bodyClass}" data-page="${route.id}" data-route="${route.id}">
  <a class="skip-link" href="#main-content">跳至主要內容</a>
  <div class="scroll-progress" aria-hidden="true"><i data-scroll-progress></i></div>
  ${header(routes, route.id)}
  ${menu(routes, profile, route.id, routeGlyphMap, siteGlyphs)}
  ${searchDialog()}
  <div class="glyph-transition" data-glyph-transition aria-hidden="true">${miniGlyph(siteGlyphs, routeGlyphMap[route.href] || 'chu-study', 'transition-mark')}</div>
  <main id="main-content" tabindex="-1">${breadcrumb(route)}${body}</main>
  ${footer(routes, profile, siteGlyphs)}
  <div class="live-region" data-live-region aria-live="polite" aria-atomic="true"></div>
</body>
</html>\n`.replace(/[ \t]+$/gm, '');
}
