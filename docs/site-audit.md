# 網站盤點

盤點日期：2026-07-18  
基準提交：`93c865fd405b25678efb64b8f963ff80fbc0ddbd`

## 技術架構

目前為五個獨立的 UTF-8 靜態 HTML 頁面，樣式與互動腳本均內嵌於各頁，未使用套件管理、建置工具、測試架構、GitHub Actions、CNAME 或自訂部署設定。GitHub Pages 目前由 `main` 分支根目錄提供服務。

## 公開頁面

| 檔案 | 既有頁面內容 | 資料狀態 |
| --- | --- | --- |
| `index.html` | 個人資料、研究領域、學歷、教學與學術經驗 | 受保護原始資料 |
| `journal-papers.html` | 期刊論文與既有篩選、引用格式功能 | 受保護原始資料 |
| `translations.html` | 譯著與哲學普及作品 | 受保護原始資料 |
| `conference-papers.html` | 研討會論文集與會議發表 | 受保護原始資料 |
| `certificates.html` | 證照、證書與獎項 | 受保護原始資料 |

## 資產與部署

- 本機圖片位於 `images/`，已逐檔複製至 `content-source/original/images/`。
- `translations.html` 另使用五南圖書之外部書封網址；它屬既有資料呈現，重構時不得自行替換內容或下載後偽稱來源。
- 未發現 `.github/workflows/`、`package.json`、`astro.config.*`、`.openai/hosting.json`、`CNAME`、`robots.txt` 或 sitemap。

## 初步風險

1. 各頁頁首、字體、色彩與動態系統不一致。
2. 內容與顯示程式混置，難以保證資料完整性與後續維護。
3. 多處初始淡出互動可能使內容在首次載入時看似未呈現。
4. 現有頁面未提供統一的無障礙、搜尋、列印、SEO 與測試流程。

