# 資料架構

## 一、唯讀資料層

| 檔案 | 內容 | 主要消費者 |
| --- | --- | --- |
| `profile.json` | 姓名、身分、機構、簡介、Email、圖片、成果入口 | Home、About、CV、Contact、SEO、Footer |
| `education.json` | 四筆教育背景 | Home、About、CV |
| `experience.json` | 三筆教學與學術經驗 | Home、Teaching、CV |
| `research.json` | 研究標籤、三筆目前研究、六筆研究專長 | Home、Research、CV、Search |
| `publications.json` | 十筆期刊論文及引用字串 | Journal、CV、Search、JSON-LD |
| `conferences.json` | 兩筆已出版論文及十七筆發表 | Conference、CV、Search |
| `translations.json` | 一筆譯著及十一筆公共寫作 | Translations、CV、Search |
| `credentials.json` | 五筆證照／證書及四筆獎項 | Certificates、CV、Search |
| `routes.json` | 十個主要路由 | Header、Menu、Search、Footer、Breadcrumb、Sitemap |
| `page-intros.json` | 由舊頁抽取的既有頁面說明 | 成果檔案頁 Hero／說明 |

## 二、建置流程

`scripts/build.mjs` 讀取資料，使用 `src/build/components.mjs` 與 `src/build/pages.mjs` 生成根目錄 HTML，再將九層 CSS 來源合併為單一 `assets/site.css`，複製單一 `assets/site.js`，並生成 `assets/search-index.json`、`sitemap.xml` 與 `robots.txt`。

## 三、完整性規則

`scripts/migrate-legacy-content.mjs` 可從 `content-source/original/` 重現初次資料遷移。技術性 ID、客觀年份索引與兩筆授權研討會網址是唯一允許的非原始欄位；任何正式資料更新均須通過逐筆內容與原始順序測試。
