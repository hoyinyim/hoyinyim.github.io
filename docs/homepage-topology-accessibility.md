# 首頁三域拓樸無障礙說明

## 語意結構

- 拓樸使用 `<nav aria-label="學術實踐領域">`。
- 三個圓形本身都是原生 `<a>`，不是 SVG Click Handler 或只有滑鼠才能操作的圖層。
- 每個入口具有可辨識的中文 Accessible Name，並保留可選取的中英文文字。
- Screen Reader 順序固定為 Research、Service、Teaching，與視覺及 Tab 順序一致。

## 鍵盤與焦點

- Tab 可依序進入三個入口；Enter 直接導向目的頁面。
- 使用全站既有三像素 Focus Ring，且圓形聚焦時提供與 Hover 相同的對比回饋。
- Browser Back 可返回首頁，不攔截瀏覽器歷程。

## 感知與動態

- 領域不只以色彩區分，同時提供中文、英文及行動提示。
- `prefers-reduced-motion: reduce` 下取消描線、填色與文字進場動畫。
- `forced-colors: active` 下以系統 CanvasText 顯示圓形邊界與軸線。
- 手機行動提示直接顯示，不依賴 Hover；每個圓形的可點擊範圍遠大於 44 × 44px。

## 縮放與重新排版

- 320px、390px 與 200％ Zoom 均保留重疊拓樸，不改成三張卡片。
- 圓形可視部分仍保有足夠點擊面積，文字不互相覆蓋，頁面不產生水平捲動。

