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
