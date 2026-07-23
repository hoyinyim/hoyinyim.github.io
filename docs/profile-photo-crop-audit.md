# 人物照片裁切稽核

首頁與「關於」頁照片皆使用原檔比例 `523 × 648`，CSS 為 `height: auto; max-height: none; object-fit: contain; object-position: 50% 0%`。

本機瀏覽器量測「關於」頁實際渲染為 `511 × 633`，頭部、髮際、眼鏡與肩線均在圖片框內。檔案 `output/visual-regression-2026-07-23/about-after-photo-education.png` 為首屏稽核證據。
