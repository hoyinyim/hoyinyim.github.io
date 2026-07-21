# 戰國楚系文字 Logo 無障礙規格

- 首頁品牌連結必須保留可讀名稱與 `aria-label="嚴浩然首頁"`。
- 正式姓名必須是 HTML 文字，不得只存在 SVG path。
- 若日後有 Symbol，裝飾性 SVG 使用 `aria-hidden="true"`；不可讓讀屏軟體猜測古文字。
- SVG 載入失敗時，姓名與首頁連結仍須存在，Header 不得改變高度或崩潰。
- 深色、高對比、Reduced Motion 與 16／32／64px 均需另測。
- 現階段因無核定楚系資產，最安全的降級方案正是目前的純文字 Wordmark。
