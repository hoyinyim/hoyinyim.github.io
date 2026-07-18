# Visual QA Report

## 已完成的可重現檢查

- 內容完整性檢查通過。
- 靜態建置檢查通過。
- 網站結構檢查通過：11 個 HTML 頁面均有語言、viewport、標題與共用視覺資產。
- 已檢查 CSS 的手機斷點、Reduced Motion、forced colors 與列印規則。

## 瀏覽器限制

嘗試以本機 HTTP 伺服器與已推送的 GitHub 原始檔實際開啟畫面時，瀏覽器均回報 `net::ERR_BLOCKED_BY_CLIENT`。因此本次沒有產出可被誠實視為「實際頁面截圖」的影像，也沒有把 Lighthouse、Core Web Vitals 或目視截圖宣稱為已通過。

在可用瀏覽器中，應優先檢查 1920、1440、1024、390px，並驗證首頁、About、Research、期刊論文、研討會論文、CV、亮暗模式與 Reduced Motion。
