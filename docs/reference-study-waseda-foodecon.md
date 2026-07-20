# 早稻田 Food Economics 網站 Menu 動態研究

研究網址：`https://prj-foodecon.w.waseda.jp/`。查核日期：2026-07-21。研究方式包括一般瀏覽器實際操作、Playwright 桌面 1440×900、手機 390×844、Hover、開啟 120ms／700ms、關閉及 Reduced Motion 模擬；證據位於 `docs/qa/waseda-foodecon/`。

## 實測結構

- 關閉狀態：右上角 70×70px 控制區包含兩層細長 SVG；Hover 分別旋轉約正、負 10 度，文字由 `MENU` 切成 `CLOSE`。
- 開啟狀態：兩層圖形在 0.3 秒內交叉；全螢幕 `#menu` 以 0.6 秒透明度進場。桌面左側識別區約 43.75％，右側導覽約 55％。
- 空間圖形：背景使用直徑約 180vh 的圓形「dish」分隔識別與導覽，形成大面積白色環形留白。
- 導覽：原站導覽文字沒有逐項延遲動畫；整個 Menu 隨底板一起顯示。手機改成單欄可捲動，巨大圓形移到上方背景。
- 關閉：上述圖形與底板反向收束，總長約 0.6 秒。

## 可轉化與不可轉化

可轉化的是「細長構件→交叉／分離→全幕底板→導覽就位→反向收束」的動態語法，以及大留白分隔識別區與導覽區的方法。本站沒有複製其筷子圖、Logo、色盤、DOM、CSS 類名、圓形尺寸或日英混排。

本站改以核定古文字資產與學術網站既有軸線系統重製：按鈕中的三道線性構件提示字形結構；開啟時大型完整古文字由控制區方向展開；導覽依序就位；聚焦不同繁中頁名時只切換完整字形，不進行不同字形之間的液態 Morph。

## 參考站無障礙差距與本站修正

實測原站 `.toggle` 為沒有 `role`、沒有可聚焦次序的 `div`，開啟後焦點仍在 `body`；`body` 的 `overflow` 仍為 `visible`；樣式表未發現 `prefers-reduced-motion` 規則。這些只作研究紀錄，不予沿用。本站使用原生 `button`＋`dialog`、Focus Trap、Escape、Focus Return、背景鎖定、Reduced Motion 靜態顯示及無 JavaScript 備援導覽。

## 證據

- `desktop-closed-1440.png`、`desktop-hover-1440.png`
- `desktop-opening-120ms.png`、`desktop-open-700ms.png`、`desktop-closed-after.png`
- `mobile-closed-390.png`、`mobile-open-390.png`
- `reduced-motion-open-100ms.png`
- `desktop-open-close.webm`
- `reference-observations.json`
