# Accessibility

最終公開版的完整結果見 `docs/accessibility-report.md`。2026-07-19 實測：22 次 Axe WCAG 2.2 AA 掃描，0 violations；鍵盤 Menu、Search、焦點返回、Reduced Motion、Forced Colors、200％ Zoom 及 `aria-live` 複製狀態均通過。

- 每個新頁面都有 `lang="zh-Hant"`、viewport、主要標題與跳至主要內容連結。
- 導覽、深淺模式、行動選單與搜尋均可由鍵盤操作。
- 顯示焦點、強制色彩與 Reduced Motion 均有 CSS 降級。
- Canvas 不是唯一資訊來源；原始姓名與資料文字均在 HTML 中。
- CV 可使用瀏覽器列印／另存 PDF，並有列印樣式。
