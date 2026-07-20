# 古文字 Menu 響應式 QA

測試網址包括本機建置版與正式公開版；參考來源固定為 `https://prj-foodecon.w.waseda.jp/`。

| 寬度／模式 | 驗收內容 | 結果 |
| --- | --- | --- |
| 320px | 六項導覽、古文字舞台、關閉、捲動、無水平溢出 | 通過 |
| 390px | 手機主版、Focus 切換、搜尋、Theme | 通過 |
| 768px | 平板雙區比例、觸控目標 | 通過 |
| 1024px | 桌面過渡版、無裁切 | 通過 |
| 1440px | 完整雙區、動畫、深淺模式 | 通過 |
| 1920px | 大畫面比例與最大字級 | 通過 |
| 200％ Zoom | 所有連結可見、無水平溢出、目標≥44px | 通過 |
| Reduced Motion | 無底板、組字或收束動畫 | 通過 |
| Forced Colors | 系統色邊界與操作區可用 | 通過 |
| JavaScript 關閉 | 六項繁中備援導覽可見 | 通過 |
| 字形載入失敗 | 視覺層隱藏，導覽仍可用 | 通過 |

本機正式建置機讀結果：110／110。全站 12 種寬度乘 10 頁的響應式量測為 120／120；桌機、390px 與 320px Menu 截圖均已人工檢查，檔案位於 `docs/qa/professional-rebuild/screenshots/`。

公開站部署後再次以 `https://hoyinyim.github.io` 執行：E2E 83／83、Menu／繁體中文／失敗模式 110／110。公開版機讀結果見 `docs/qa/ancient-script-menu/menu-language-results.json` 與 `docs/qa/professional-rebuild/e2e-results.json`；並已在實際公開瀏覽器開啟 Menu 作桌面視覺核對。
