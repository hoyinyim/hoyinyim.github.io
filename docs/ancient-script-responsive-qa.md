# 古文字響應式驗收

測試日期：2026-07-21。

| 模式 | 驗收項目 | 通過條件 |
| --- | --- | --- |
| 320／360／390／430 | 手機 | 單一 A 級字形、B 級隱藏、無水平捲動、H1 可讀 |
| 768／1024 | 平板／小桌機 | 網格轉換正常、字形不壓文字、觸控與鍵盤可用 |
| 1440／1920 | 桌機／寬螢幕 | 主構圖維持比例，不以無限放大填滿空間 |
| 200％ Zoom | 放大 | 全頁無水平溢出，H1 與控制項仍可見 |
| 深色 | 色彩 | 字形轉為低對比淺色，不消失也不搶過正文 |
| Reduced Motion | 動態 | 進場、位移、線條轉換與頁面轉場停止 |
| Forced Colors | 高對比 | A／B 級隱藏，現代文字與控制項保持可辨識 |
| Missing Assets | 缺圖 | 失敗字形隱藏，正文、導覽與版面不受影響 |
| Print | CV 列印 | 全部古文字隱藏，A4 內容順序不變 |

自動矩陣由 `tests/visual-responsive/check.mjs` 與 `tests/ancient-script-site/check.mjs` 執行。桌機全頁截圖位於 `docs/qa/professional-rebuild/screenshots/`；古文字模式截圖位於 `docs/qa/ancient-script-site/screenshots/`。
