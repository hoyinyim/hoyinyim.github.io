# GitHub Pages 部署一致性報告

- 查核日期：2026-07-20（Asia／Taipei）
- 儲存庫：`https://github.com/hoyinyim/hoyinyim.github.io`
- 公開網站：`https://hoyinyim.github.io/index.html`
- 查核時 `main`：`acc9355d83a7fc64313955f818accda5b3d187c3`
- GitHub Pages 工作流程：`pages build and deployment`
- 工作流程執行編號：`29658342713`
- 工作流程結論：`success`
- 工作流程部署 SHA：`acc9355d83a7fc64313955f818accda5b3d187c3`

## 一致性查核

以下公開檔案已與 GitHub `main` 原始檔及本機工作樹逐字比較；換行正規化後三者完全相同：

| 檔案 | 公開站＝`main` | `main`＝本機 |
| --- | --- | --- |
| `index.html` | 是 | 是 |
| `assets/site.css` | 是 | 是 |
| `assets/site.js` | 是 | 是 |
| `sitemap.xml` | 是 | 是 |
| `robots.txt` | 是 | 是 |

公開首頁回應 `200`，Canonical 為 `https://hoyinyim.github.io/index.html`，CSS 與 JavaScript 均由公開根目錄正確載入。CDN 回應目前採 `Cache-Control: max-age=600`。

## 已知限制與本次修正要求

GitHub REST Pages 設定端點在未帶驗證的查核中回應 `404`；因此來源分支以成功的 GitHub Pages 工作流程、工作流程部署 SHA、GitHub `main` API SHA及公開檔案逐字比對交叉確認。本次重構會在所有頁面加入 `<meta name="build-commit" content="COMMIT_SHA">`，建置時寫入實際提交 SHA，並由公開 E2E 再次驗證。

## 結論

視覺修改開始前，公開 GitHub Pages 與 `main` 的網站成品一致；可在指定功能分支上開始重構。最終發布前必須重新執行相同查核，不得沿用本報告的初始結論。
