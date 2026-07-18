# 視覺驗收報告

驗收日期：2026-07-19。所有影像均由公開網址 `https://hoyinyim.github.io` 實際載入後擷取。

## 結果

- 10 個主要頁面 × 12 種寬度，共 120 個組合全部通過。
- 22 張正式截圖已產生，涵蓋 1920 × 1080 Hero、1440px 全頁、390px、320px、桌機／手機 Menu、Search、Education Timeline、Certificate Archive、Footer、Dark Mode、Reduced Motion、Forced Colors 及 200％ Zoom。
- 820px 研討會頁曾出現 45px 溢出，已調整為 896px 以下單欄並於公開版重測通過。
- 「證照／證書／獎項」曾因斜線產生三行斷裂，已改為流體單行標題並完成公開截圖覆核。

截圖位於 `docs/qa/professional-rebuild/screenshots/`；量測資料位於 `docs/qa/professional-rebuild/visual-responsive-results.json`。

## 改造前後證據

前一階段已保存三張真實「改造前」截圖：

- `docs/qa/third-stage/before/home-1280.png`。
- `docs/qa/third-stage/before/certificates-1280.png`。
- `docs/qa/third-stage/before/menu-1280.png`。

本次「改造後」對應證據位於 `docs/qa/professional-rebuild/screenshots/`，包括首頁、證照頁、桌機 Menu 與其餘主要頁面。改造前程式與內容另封存於 `backups/professional-rebuild-baseline-f8f7acb.zip`，並保留 SHA-256 基準。由於舊版在本次驗收時已不再由 GitHub Pages 提供，沒有重新擷取或偽造舊版畫面；證據使用先前保存的真實截圖與不可變備份。
