# 動態系統

## 範圍

動態只用於說明狀態與空間關係：Menu／Search 開合、Theme 切換、篩選結果、複製引用回饋、Header 捲動狀態。沒有姓名 Loader、無限循環、磁吸游標、視差背景或逐字表演。

## 參數

- 即時回饋：120–180ms。
- 結構開合：240–360ms。
- 緩動：`cubic-bezier(.22, 1, .36, 1)`。
- 移動距離不超過 24px；透明度不可讓正式內容長時間不可見。

## 降級

`prefers-reduced-motion: reduce` 會取消平滑捲動、動畫與非必要轉場。沒有 JavaScript 時，正式資料仍存在於初始 HTML；Menu 與 Search 之外的頁面內容不依賴動畫才顯示。
