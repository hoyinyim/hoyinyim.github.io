# 全站響應式與斷行驗收報告

驗收日期：2026-07-21。

## 測試矩陣

- 10 個正式內容頁 × 12 種寬度，共 120 組。
- 寬度：320、360、375、390、430、540、768、820、1024、1280、1440、1920px。
- 檢查：文件寬度、正文 17–19px、Metadata ≥ 14px、桌機導覽 ≥ 16px、唯一 H1、文字裁切、Main 寬度與 200% Zoom。

## 結果

120／120 通過；0 水平溢位、0 文字裁切、0 字級違規。手機由 4 欄網格承接，桌機 16 欄；長題名自然換行，沒有 Ellipsis 或固定高度遮蔽。Menu 截圖加入 400ms 穩定等待，排除動畫首幀造成的空白誤判，最終桌機與手機選單均已人工檢視。

結果檔：`docs/qa/professional-rebuild/visual-responsive-results.json`；截圖：`docs/qa/professional-rebuild/screenshots/`。
