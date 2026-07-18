# 嚴浩然個人學術網站

此專案是以建置期生成的 GitHub Pages 靜態學術網站。個人與學術資料集中於 `src/data/`；十一個 HTML、搜尋索引、Sitemap、Header、Menu、Search、Footer 與 CV 均由同一資料系統生成。

## 本機啟動

需要 Node.js 20 以上與 pnpm。

```bash
pnpm install
pnpm build
pnpm serve
```

瀏覽 `http://127.0.0.1:4173/index.html`。建置輸出仍位於專案根目錄，以維持 GitHub Pages 根路徑。

## 建置與測試

```bash
pnpm build          # 生成十一個 HTML、CSS、JS、Search Index、Sitemap
pnpm test           # 內容完整性、建置、HTML／連結／SEO／結構檢查
pnpm test:browser   # E2E、Axe、響應式、截圖與 Lighthouse
pnpm test:all       # 完整測試
pnpm package:site   # 產生最小化 _site/ 發布包
```

瀏覽器測試結果與截圖位於 `docs/qa/professional-rebuild/`。

## 新增經確認資料

只有取得已核對的正式資料後才可修改 `src/data/`。新增條目必須保留原文標點、作者順序、日期、狀態與來源網址，並使用不依賴題名全文的穩定 ID。修改後依序執行：

```bash
pnpm build
pnpm test:content
pnpm test:site
```

如原始公開來源同步更新，須一併更新 `content-source/original/`、`tests/content-integrity/baseline.json`、`docs/content-inventory.md` 與 `docs/content-source-map.md`；不可只改生成後 HTML。

## 更新書目

- 期刊論文：`src/data/publications.json`
- 研討會論文與發表：`src/data/conferences.json`
- 譯著與公共寫作：`src/data/translations.json`

期刊頁由建置期產生完整 HTML；JavaScript 只處理篩選、Disclosure 與複製。

## 更新 CV

`cv.html` 不另存獨立履歷資料。它自動彙整 `profile.json`、`education.json`、`experience.json`、`research.json`、全部成果、證照與獎項。更新任何來源後重新 `pnpm build` 即可同步 CV。

## 更新證書圖片

在取得真實證書圖片後，先放入 `images/`，再於 `src/data/credentials.json` 對應條目的 `image` 欄填入相對路徑並補上可核對的替代文字欄位。不得生成假證書。沒有圖片時維持「文字檔案」呈現。

## 更新導覽

只修改 `src/data/routes.json`。Desktop Header、全螢幕 Menu、搜尋、Footer、Breadcrumb 與 Sitemap 會同步生成；不得在 HTML 手工加入另一套路由。

## Reduced Motion 與 Canvas

全站遵守系統 `prefers-reduced-motion`。目前首頁採純 CSS 紙材空間構圖，沒有 Canvas 或持續 RAF；因此不需另外停用 Canvas。如未來加入 Canvas，必須在離開 Hero、頁籤隱藏及 Reduced Motion 時停止。

## 部署

Pull Request 先由 `.github/workflows/ci.yml` 執行完整驗證；合併 `main` 後，`.github/workflows/pages.yml` 建置最小 `_site/` 並部署 GitHub Pages。

## 回復上一版本

先在 GitHub 找到重構合併 Commit，再建立回復分支並執行：

```bash
git switch -c revert/professional-rebuild origin/main
git revert -m 1 <重構合併-commit>
```

通過 `pnpm test` 後以 Pull Request 合併。不可用 `git reset --hard` 改寫公開歷史。完整重構前快照另存於 `backups/professional-rebuild-baseline-f8f7acb.zip`。
