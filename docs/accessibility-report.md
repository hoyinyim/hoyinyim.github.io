# 無障礙驗收報告

驗收日期：2026-07-21。目標：WCAG 2.2 AA。

- 11 頁 × 1440px／390px × 淺色／深色，共 44 次 Axe 掃描：0 violations。
- 每頁只有一個 H1；Skip Link、Landmark、Dialog 名稱與圖片替代文字完整。
- 原生 Menu／Search Dialog 通過焦點進入、焦點限制、Escape 關閉與焦點返回。
- Theme 按鈕同步更新可見文字、`aria-label` 與 `aria-pressed`。
- 複製引用／Email 的結果以 `aria-live="polite"` 宣告。
- Reduced Motion 取消動畫；Forced Colors 保留結構；200% 放大無水平溢位。
- 正文基準 17–18px，必要 Metadata 不小於 14px；正式題名不截斷。

結果檔：`docs/qa/professional-rebuild/accessibility-results.json`。
