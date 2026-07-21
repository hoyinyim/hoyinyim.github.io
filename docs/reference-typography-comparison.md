# 三個參考站排印比較與本站轉化

## 比較

| 面向 | ヤマチク | 開宅舎 | AA Design Lab | 本站決策 |
| --- | --- | --- | --- | --- |
| 主要字體 | 明體 | 商業黑體 | Noto Sans JP | 中文 UI 黑體；長文與題名明體 |
| 正文行高 | 15／36 等高行距 | 16.2／40.5 | 16／32 | 長文 1.78–1.92；一般 UI 1.5–1.72 |
| 宣言欄寬 | 約 198px | 約 445px | 約 800px | 首頁短句窄；長文約 34em |
| 手動分行 | 很多，只用敘事 | 很多，只用敘事 | 選擇性 H2／段落 | 只允許首頁姓名、特殊 H1 |
| 字重 | 多為 400 | 500–600 | 400–500 | 正文 400、題名 500、H1 550 |
| Menu | 直排、細字 | 品牌式目錄 | 大型 Dialog | 繁中主項＋古文字舞台，手機重排 |
| 主要可用原理 | 短句節奏 | 圖文空白 | 俐落層級 | 依頁型組合，不仿站 |

## 本站四種字體角色

1. `--font-zh-ui`：Header、Menu、按鈕、標題、機構與狀態。
2. `--font-zh-reading`：個人簡介、研究長文、論文題名、書名。
3. `--font-latin`／`--font-condensed`：英語、日期、年份、數量。
4. `--font-mono`：只保留 Email、URL、DOI 與技術字串。

AXIS 未取得本站 Webfont 授權，因此沒有提交字體檔。繁中正文不用全面 `palt`；實測中系統 fallback 對比例標點支援不一致，故正式正文保持正常全形字面。大型標題也不強制啟用 `palt`，避免 Windows、macOS 與手機瀏覽器產生不同標點位置。

## Type Scale 與節奏

正式 Token 為 `--text-xs`、`--text-sm`、`--text-base`、`--text-lead`、`--text-entry`、`--text-subsection`、`--text-section`、`--text-page`、`--text-display`。空間只由 `--space-1` 至 `--space-9` 延伸。書目題名固定使用 `--text-entry`、1.5 左右行高及約 27em 上限；長篇閱讀以 34em 為上限。

## 證據界線

參考站畫面只作 QA 證據，不由公開網站載入。本站沒有複製 Logo、字體檔、圖片、文案、DOM、CSS 或 JavaScript。
