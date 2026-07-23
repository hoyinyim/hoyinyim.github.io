# 發布狀態報告

## 已完成的本機工作

- 靜態建置：12 頁。
- 靜態技術檢查：1,171 項通過。
- 楚系字形方向稽核：通過。
- 端對端流程：88 項通過。
- 響應式／視覺：132 組頁面／尺寸通過。
- 瀏覽器字形回歸：705 項通過，涵蓋 11 頁與多種寬度、模式、缺圖與列印。
- WCAG 2.2 AA：48 次桌機／手機／明暗模式掃描，0 項違規。
- Lighthouse：Performance 95、Accessibility 100、Best Practices 100、SEO 100。

## 公開發布

已推送至 GitHub `main`，公開網址為 https://hoyinyim.github.io/ 。GitHub Pages 已完成本次網站建置與發布： https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/30020672347 。

公開頁面實測確認：首頁同時有「查看學術著作 →」與「查看研究 →」；主字形為 `chu-study`；「關於」頁有兩個教育背景分組與兩枚官方校徽；人物照片使用 `object-fit: contain` 與 `object-position: 50% 0%`，沒有裁切頭部。

發布前的兩項覆核已記錄如下：

1. 楚系文字資料庫公開頁明示「歡迎大家使用」；網站保留逐筆資料庫 URL、出處 ID 與原始 PNG，並以資料庫名稱標示來源。既有 CC0 記錄未作超出官方頁面可見內容的法律主張。
2. `content-source/original/` 的五個來源雜湊已完成封存快照核對並更新為現行 main 快照；詳細過程見 `docs/content-baseline-reconciliation-2026-07-23.md`。

視覺參考登錄保留於既有研究文件；其中 Food Economics 參考網址為 https://prj-foodecon.w.waseda.jp/ ，僅作版面節奏、資訊層級與留白分析，未複製其原始碼或內容。
