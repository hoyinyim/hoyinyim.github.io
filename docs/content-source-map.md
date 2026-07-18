# 內容來源對照

| 結構化資料 | 唯一原始來源 | 原始區段 | 顯示消費者 |
| --- | --- | --- | --- |
| `profile.json` | `content-source/original/index.html` | Profile、Intro、Quick Links、Footer | Home、About、CV、Contact、Header、Footer、SEO |
| `education.json` | 同上 | `.timeline-item` | Home、About、CV |
| `experience.json` | 同上 | `.list-clean li` | Home、Teaching、CV |
| `research.json` | 同上 | `.research-tags`、`.current-list`、`.research-card` | Home、Research、CV |
| `publications.json` | `content-source/original/journal-papers.html` | `const publications` | Journal、Home、CV、Search、JSON-LD |
| `conferences.json` | `content-source/original/conference-papers.html` | `.publication-list`、`.presentation-list` | Conference、Home、CV、Search |
| `translations.json` | `content-source/original/translations.html` | `.translation-feature`、`.work-card` | Translations、Home、CV、Search |
| `credentials.json` | `content-source/original/certificates.html` | `.credential-list`、`.award-grid` | Certificates、Home、CV、Search |
| `routes.json` | 本次技術遷移 | 既有路由＋明確補齊的主要頁面 | Header、Menu、Search、Footer、Breadcrumb、Sitemap |

授權差異僅限兩筆已出版研討會論文的 `link` 欄位。各筆新增 `id`、研討會客觀年份索引及路由 ID 只作技術用途。
