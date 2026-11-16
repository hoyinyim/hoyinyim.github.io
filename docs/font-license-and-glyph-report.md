# 字體授權與繁體中文字形報告

## AXIS Font 授權結論

官方來源：

- `https://typeproject.com/en/fonts/axisfont/`
- `https://typeproject.com/en/support`
- `https://typeproject.com/en/support/detail/?page=fonts_5`

AXIS Font 為商業字體，官方提供購買、訂閱、Web Font 與個別授權途徑。License 頁明示一般授權以電腦／CPU 為基礎，伺服器、網絡、裝置嵌入及部分再散布情境另需協議。使用者未提供本網域的 Web Font 授權或合法自託管檔案，因此本專案：

1. 不下載 AXIS Font。
2. 不從參考頁抽取字體檔。
3. 不轉檔、不子集化、不 Base64 嵌入。
4. 不提交任何 AXIS Font 檔案。
5. 不在網站或報告宣稱「本站使用 AXIS Font」。

「AXIS Scholarly Poster System」是設計原理名稱，不是字體使用聲明。

## 合法字體鏈

```css
--font-sans: Inter, "Noto Sans TC", "Source Han Sans TC", system-ui, sans-serif;
--font-condensed: "Arial Narrow", "Roboto Condensed", "IBM Plex Sans Condensed", var(--font-sans);
--font-serif: "Noto Serif TC", "Source Han Serif TC", serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
```

未提供合法自託管檔時，上述名稱只作本機可用字體及系統 Fallback，不從 Google Fonts 或第三方 CDN 載入。這避免追蹤、外部阻塞及未確認再散布授權。

## 角色比例

- Sans 約 70％：Header、Menu、H1、H2、UI、機構、角色、證照、獎項。
- Serif 約 20％：論文題名、書名、譯著題名、長敘事與少數研究題名。
- Condensed／Mono 約 10％：年份、日期、卷期、頁碼、Filter、狀態與 Email。

## 繁體中文字形規則

- HTML 固定 `lang="zh-Hant"`。
- 中文使用 TC 字體優先，不以日文字體作首選。
- 禁止 `font-stretch` 或 `transform: scaleX()` 壓縮中文字。
- 中文 `letter-spacing` 正文為 `0`；標題最多極小調整，不以大字距製造風格。
- `word-break: normal`、`line-break: strict`；只對 URL、Email、DOI 使用 `overflow-wrap: anywhere`。
- 測試字串涵蓋「嚴、臺、學、術、體、證、獎、禮、樂、荀、觀、譯、冊、會、議」。

## 驗證方式

建置後以 Chrome、Firefox、WebKit 可用環境在 320–1920px、200％ Zoom、Light／Dark 下檢查；Canvas 字形量測只作輔助，最終以實際截圖、可選取文字及 DOM 字符一致性為準。若系統缺少首選字體，Fallback 必須保持繁中字形、正常字寬與完整標點。

## 2026-07-21 排印角色更新

- UI／導航：`Source Han Sans TC`、`Noto Sans TC`、`PingFang TC`、`Microsoft JhengHei`、system-ui。
- 長文／論著題名：`Source Han Serif TC`、`Noto Serif TC`、`Songti TC`、`PMingLiU`、serif。
- 拉丁識別：`Inter Tight`、`IBM Plex Sans`、`Aptos`、system-ui；只在拉丁字串中使用。
- Condensed：`IBM Plex Sans Condensed`、`Archivo SemiCondensed`、`Aptos Narrow`；不得用 transform 壓縮中文。
- Mono：`IBM Plex Mono`、`Cascadia Mono`、`SFMono-Regular`、`Consolas`；限 Email、URL、DOI 與機器識別碼。

網站不下載或熱連上述字體；字體名稱只構成本機 fallback 鏈。楚系 Logo 候選另見 `src/data/chu-script-glyphs.json`，未核准候選不得進入公開頁。

## 2026-11-16 正式自託管字體更新

本輪排印重構改用合法自託管、依本站實際字符子集化的 WOFF2 字體，不再依賴訪客電腦是否安裝中文字體，也不在瀏覽時連線至第三方字體服務：

| 排印角色 | 字體 | 字重 | 子集檔案 | 授權 |
| --- | --- | ---: | --- | --- |
| 中文大標題、品牌姓名、全站 Menu | GenWan Min TC（源雲明體丹版） | 400 | `assets/fonts/genwan-min-tc-400.woff2` | SIL Open Font License 1.1 |
| 札記式小標與少量手寫語氣 | LXGW WenKai TC | 400 | `assets/fonts/lxgw-wenkai-tc-400.woff2` | SIL Open Font License 1.1；附加許可允許純網頁傳送用途之子集化 WOFF2 |
| 正文、論文題名、學術敘述 | Noto Serif TC | 400 | `assets/fonts/noto-serif-tc-400.woff2` | SIL Open Font License 1.1 |
| 導覽、年份、狀態與介面文字 | Noto Sans TC | 400 | `assets/fonts/noto-sans-tc-400.woff2` | SIL Open Font License 1.1 |
| 英文姓名與人文標題 | Cormorant Garamond | 400 | `assets/fonts/cormorant-garamond-400.woff2` | SIL Open Font License 1.1 |
| 英文年份、卷期與介面資料 | Inter | 400 | `assets/fonts/inter-400.woff2` | SIL Open Font License 1.1 |

完整授權文字保存在 `assets/fonts/OFL-*.txt`。字體檔只包含網站公開頁面所需字符，不作桌面字體散布。字體樣式於主要圖片完成載入後啟用，以免字體下載與首頁最大內容元素互相競爭；無 JavaScript 環境仍由 `<noscript>` 載入。正式驗收須同時檢查 `document.fonts` 的繁體中文字串覆蓋與實際畫面，不得只檢查 CSS `font-family` 名稱。

Shippori Mincho、Zen Old Mincho 等日文字體作為墨暈、字面比例與老明朝氣質的視覺參考，不直接套用於繁體中文主標題。正式中文標題使用源雲明體 TC「丹版」：其保留傳統鉛字印刷字形與墨水暈染感，同時避免日文字體在「學、體、獎、會、議」等字出現缺字、日文新字體或逐字 fallback 混排。
