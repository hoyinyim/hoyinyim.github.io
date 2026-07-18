# 專業級全站重構基準

- 基準日期：2026-07-19（Asia/Taipei）
- 上游基準：`origin/main`／`f8f7acb`
- 工作分支：`feat/professional-academic-site-rebuild`
- 完整備份：`backups/professional-rebuild-baseline-f8f7acb.zip`
- 備份 SHA-256：`96B0BD29AF49D00EFAE2D3F3C585CCDC669DC623CCC661925A4C924E7B240C31`

## 基準範圍

備份包含根目錄全部 HTML、`assets/`、`images/`、`content-source/`、套件清單、Sitemap 與 Robots。原始學術內容另由 `content-source/original/` 的固定雜湊保護，不以目前介面文案替代原始來源。

## 發布阻斷基準

| 項目 | 基準狀態 | 重構目標 |
| --- | --- | --- |
| 期刊論文初始 HTML | 依賴頁內 JavaScript 生成 | 建置期產生完整語意 HTML |
| 搜尋 | Dialog 與控制器結構不一致 | 單一靜態索引與單一 Dialog |
| 導覽 | 各頁複製 Header，另有全螢幕 Menu | 由同一路由資料生成 |
| Menu | 兩套開關／事件邏輯 | 單一原生 `dialog` 控制器 |
| 動畫 | 多套進度條、轉場、揭露與監聽器 | 單一全站控制器 |
| 研討會電子全文 | 指定兩筆待以授權網址固定 | 每筆一個「電子全文」外部連結 |
| 首頁研討會 CTA | 僅有既有功能，未納入正式公開 E2E | 本機、部署後及返回行為驗證 |

## 完成門檻

只有在 P0 為零、內容完整性、建置、E2E、響應式、無障礙、SEO 與正式 GitHub Pages 驗證均有實際結果後，才可宣告完成。無法執行的項目必須列入限制，不以推測代替實測。
