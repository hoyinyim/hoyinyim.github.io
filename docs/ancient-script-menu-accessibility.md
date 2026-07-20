# 古文字 Menu 無障礙規格

- 使用原生 `<dialog>`、`showModal()` 與瀏覽器 Focus Trap。
- 「選單」為原生 `<button>`，具有 `aria-haspopup="dialog"`、`aria-controls`、`aria-expanded`。
- 開啟後焦點移到當前頁或第一個主導覽；Escape、背景點擊與「關閉」均可關閉。
- 關閉後焦點返回原按鈕，解除 `body.dialog-open` 背景鎖定，不改變捲動位置。
- 現代繁中連結提供 Accessible Name 與 `aria-current`；古文字 SVG 全部 `aria-hidden` 且空 `alt`。
- Focus Ring 為 3px 品牌色；觸控目標不小於 44px。
- Reduced Motion 下底板、組字、項目與收束動畫均停用，完整古文字靜態顯示。
- Forced Colors 使用系統 `Canvas`／`CanvasText`，不依賴圖片判讀。
- JavaScript 關閉時，`<noscript>` 顯示六項繁中備援導覽。

參考 Menu 網址：`https://prj-foodecon.w.waseda.jp/`。自動驗收見 `docs/qa/ancient-script-menu/menu-language-results.json`。
