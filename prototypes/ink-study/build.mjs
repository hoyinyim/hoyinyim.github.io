import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { escapeHtml as e } from '../../src/build/html.mjs';
import {
  AnnotationPanel, ArtworkGallery, ArtworkZoom, CalligraphyHero, InkReveal,
  MinimalNavigation, PageTransition, PaperTexture, ScrollNarrative, ScrollPainting,
  TextReveal, VerticalTypography
} from './components.mjs';

const data = async (name) => JSON.parse(await readFile(new URL(`../../src/data/${name}.json`, import.meta.url), 'utf8'));
const [profile, glyphs, research] = await Promise.all(['profile', 'name-glyphs', 'research'].map(data));
const artworks = [
  { title: '山間', file: 'images/ink/mountains.jpg', width: 1440, height: 480, alt: '淺墨遠山掩入霧中，松與較濃的山石留在右岸', note: '山脊由淡轉濃；左側留下大段水面和霧氣。在這裡，空白給觀者時間辨認前後層次。' },
  { title: '江岸', file: 'images/ink/river.jpg', width: 1440, height: 511, alt: '淺淡的江面與折轉的水岸，遠處有一座小亭', note: '遠亭只佔畫面一角，從近岸望向遠處時，大片水面組成圖中的停頓。' },
  { title: '疏竹', file: 'images/ink/bamboo.jpg', width: 1440, height: 480, alt: '數枝疏竹立在右岸，淡色水面與遠山留在左側', note: '竹枝比遠山清晰，旁側留白讓視線先辨短筆，再及淺墨中的水岸。' }
];
const [mountains, river, bamboo] = artworks;
const notes = [
  { label: '題跋｜留白與視線', body: '留白在此用來分開近景與遠景。文字題跋置於圖框外，先呈現所見，再說明設計取捨；這是觀畫示例，不是對特定古畫的考釋。' },
  { label: '圖版來源', body: '三幅圖均是現有學術網站的設計插圖。原圖可獨立開啟，未使用本次參考站的作品、字型或聲音。' },
  { label: '姓名古文字', body: '此處嚴、浩、然三枚圖形依使用者提供的原圖顯示。圖形用於身分識別；年代、文字系統與歷史來源未作鑑定。' }
];

const shell = (title, page, content) => `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="嚴浩然個人學術網站的書畫與閱讀設計示範。">
  <meta name="robots" content="noindex">
  <title>${e(title)}｜嚴浩然</title>
  <link rel="stylesheet" href="../../assets/webfonts.css">
  <link rel="stylesheet" href="ink-study.css">
  <script src="ink-study.js" defer></script>
</head>
<body class="study-page ${page === 'study' ? 'study-exhibit' : 'study-lab'}">
  <a class="study-skip" href="#study-main">跳至主要內容</a>
  <header class="study-header"><div class="study-shell">
    <a class="study-brand" href="index.html">書畫與閱讀</a>
    ${MinimalNavigation([
      { href: 'index.html', text: '整合示範', current: page === 'study' },
      { href: 'components.html', text: '互動元件', current: page === 'lab' },
      { href: '../../index.html', text: '學術網站' }
    ])}
  </div></header>
  <main id="study-main" tabindex="-1">${content}</main>
  <footer class="study-footer"><div class="study-shell">
    <p>嚴浩然 <span lang="en">YIM HO YIN</span></p>
    <p>書畫設計示範・書目與研究資料以正式網站為準</p>
    ${MinimalNavigation([{ href: '../../docs/design-research.md', text: '設計研究' }, { href: '../../docs/design-system.md', text: '設計系統' }, { href: '../../docs/ink-leaf-artwork.md', text: '插圖來源' }], '研究與圖版來源')}
  </div></footer>
</body>
</html>
`;

const section = (id, label, title, intro, content) => `<section id="${e(id)}" class="study-section" aria-labelledby="${e(id)}-title"><div class="study-shell">
  <header class="section-intro"><p class="eyebrow">${e(label)}</p><h2 id="${e(id)}-title">${e(title)}</h2><p class="study-lead">${e(intro)}</p></header>
  ${content}
</div></section>`;
const paragraphs = (parts) => parts.map((part) => `<p>${e(part)}</p>`).join('');
const chapterLink = '<p><a href="../../research.html#research-focus-title">查看正式研究方向</a></p>';
const exhibit = [
  CalligraphyHero({ profile, glyphs, art: mountains }),
  section('study-scroll', '書畫｜圖版', '展卷', '山間、江岸、疏竹。三幅圖版可於圖框內橫向查看，文章仍可往下讀。', ScrollPainting(artworks, 'exhibit-painting')),
  section('study-reading', '學術閱讀', '中國早期思想與文獻', '以下保留個人學術網站原有的學術簡介與研究方向。', ScrollNarrative([
    { id: 'intro', title: '學術簡介', body: TextReveal(profile.bio) },
    { id: 'early-thought', title: research.current[0].title, body: paragraphs([research.current[0].description]) + chapterLink },
    { id: 'excavated-texts', title: research.current[1].title, body: paragraphs([research.current[1].description]) + chapterLink },
    { id: 'xunzi', title: research.current[2].title, body: paragraphs([research.current[2].description]) + chapterLink }
  ])),
  section('study-artwork', '圖版｜細部', '近看墨色', '選一幅看題跋，或展開江岸局部。這些圖版是網站的設計插圖。', ArtworkGallery(artworks, 'exhibit-gallery') + ArtworkZoom(river, 'exhibit-zoom')),
  section('study-notes', '題識｜來源', '圖與文之間', '插圖與文字各留一處空白，視線可以在兩者之間往返。', VerticalTypography('觀畫讀文', '以短題籤點出圖版與閱讀段落的界線；正文仍使用橫排。') + AnnotationPanel(notes) + '<div class="study-actions">' + PageTransition('components.html#page-transition', '查看獨立元件') + '</div>')
].join('\n');

const samples = [
  ['calligraphy-hero', 'CalligraphyHero', '書法式卷首', '輸入真實姓名、英文附標、身分、三枚字形與主圖；窄版改為上下配置，姓名仍是文字。', CalligraphyHero({ profile, glyphs, art: mountains, heading: 'h3', sample: true })],
  ['ink-reveal', 'InkReveal', '墨圖揭示', '依 data-duration 設定單次揭示時間，建議 420–560ms。這是原圖的裁切顯現，不是歷史筆順復原。', InkReveal(bamboo)],
  ['scroll-painting', 'ScrollPainting', '可橫讀的畫卷', '傳入圖組和唯一容器 ID。原生滑動、方向鍵及前後按鈕皆在圖版區域內作用。', ScrollPainting(artworks, 'sample-painting')],
  ['scroll-narrative', 'ScrollNarrative', '章節敘讀', '傳入有錨點的章節與標題。寬版固定目次，窄版在正文上方；不固定正文或攔截滾輪。', ScrollNarrative([
    { id: 'sample-reading-one', title: '材料與題名', body: paragraphs([research.current[1].description]) },
    { id: 'sample-reading-two', title: '脈絡與說明', body: paragraphs([research.current[0].description]) }
  ])],
  ['vertical-typography', 'VerticalTypography', '短題籤縱書', '輸入一至六個字的題籤與橫書說明，520px 以下回到橫排。', VerticalTypography('觀畫讀文', '短題籤把圖與文字分開；註解、年份和長文維持橫排。')],
  ['artwork-gallery', 'ArtworkGallery', '圖集與題跋', '傳入圖組與 ID；選圖同步標題、題跋及原圖連結。無 JavaScript 時各縮圖仍可直接開啟。', ArtworkGallery(artworks, 'sample-gallery')],
  ['artwork-zoom', 'ArtworkZoom', '局部放大', '傳入來源圖版和唯一控制 ID；可修改 range 的初始值與上下界。本例為 100–200%，可用鍵盤調整。', ArtworkZoom(river, 'sample-zoom')],
  ['text-reveal', 'TextReveal', '段落呈現', '每段保持完整，以 data-duration 設定淡入時間。沒有動畫時，所有字立即可見。', TextReveal([profile.bio[0], research.current[2].description])],
  ['minimal-navigation', 'MinimalNavigation', '輕量導覽', '傳入連結和當前狀態。示範以下連結有獨立焦點，手機可以換行。', MinimalNavigation([{ href: 'index.html#study-scroll', text: '展卷' }, { href: 'index.html#study-reading', text: '學術閱讀' }, { href: 'index.html#study-notes', text: '題跋' }], '示範導覽連結')],
  ['page-transition', 'PageTransition', '紙面淡接', '同源跨頁在支援 View Transition 時淡接，時間可在 CSS 設定；無支援仍直接開頁。請由本機 HTTP 預覽測試。', '<div class="study-actions">' + PageTransition('index.html', '回整合示範看轉場') + '</div>'],
  ['paper-texture', 'PaperTexture', '紙面紋理', '以 CSS 變數控制紋理透明度。靜態 SVG 不逐幀重畫，列印與強制色彩移除。', PaperTexture()],
  ['annotation-panel', 'AnnotationPanel', '題跋與學術註解', '傳入標籤與文字。原生 details 可用鍵盤或觸控展合，也能在無 JavaScript 時工作。', AnnotationPanel(notes)]
];
const lab = `<section class="lab-intro study-shell"><p class="eyebrow">書畫設計系統</p><h1>互動元件</h1><p class="study-lead">先看一個元件如何工作，再回整合示範看圖、字與閱讀次序如何配合。十二項各有獨立錨點、操作和參數註記。</p>
  <nav aria-label="元件目次" class="component-index">${samples.map(([id, , title]) => `<a href="#${id}">${e(title)}</a>`).join('')}</nav></section>
  <div class="sample-grid study-shell">
  ${samples.map(([id, name, title, parameters, preview]) => `<section class="sample-card" id="${id}" data-component="${id}" aria-labelledby="${id}-title"><header class="sample-heading"><p class="eyebrow" lang="en">${e(name)}</p><h2 id="${id}-title">${e(title)}</h2><details class="sample-params"><summary>使用方式與參數</summary><p>${e(parameters)}</p></details></header><div class="sample-preview">${preview}</div></section>`).join('\n')}
</div>`;

const here = new URL('./', import.meta.url);
await mkdir(here, { recursive: true });
await Promise.all([
  writeFile(new URL('index.html', here), shell('書畫與閱讀', 'study', exhibit), 'utf8'),
  writeFile(new URL('components.html', here), shell('互動元件', 'lab', lab), 'utf8')
]);
console.log('書畫設計原型：整合示範與十二元件展示已建置。');
