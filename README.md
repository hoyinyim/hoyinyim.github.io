# hoyinyim.github.io

嚴浩然個人學術網站。此專案為 GitHub Pages 靜態網站；原始學術內容視為唯讀資料。

## 本機檢查

需要 Node.js 22 或較新版本。

```bash
npm test
```

此指令依序執行內容完整性、靜態建置與網站結構檢查。GitHub Actions 在主分支、重構分支與 Pull Request 上執行同一組檢查。

## 更新內容

- 原始內容備份：`backups/original-content-93c865f.zip`
- 原始來源副本：`content-source/original/`
- 完整性基準與檢查：`tests/content-integrity/`
- 視覺與遷移說明：`docs/`

新增或更新著作、履歷、照片、中文／英文內容前，請先保留原始檔案並同步更新完整性基準；不得以自動翻譯或自動摘要取代原文。停用動畫時可由系統啟用「減少動態效果」；首頁 Canvas 會自動降級。CV 可由 `cv.html` 使用瀏覽器列印功能另存 PDF。

## 部署

GitHub Pages 從 `main` 分支根目錄發布。重構分支先通過 `npm test` 與視覺檢查，再以 Pull Request 合併；不可直接覆寫主分支。
