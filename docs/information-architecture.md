# 資訊架構

## 核心入口

桌機 Header 只保留 Research、Publications、About、CV；Search、Theme、Menu 位於右側。手機 Header 保留品牌、Theme、Menu。完整導覽由三組選單承接：

| 組別 | 頁面 |
| --- | --- |
| PROFILE | About、CV、Credentials |
| RESEARCH & WORK | Research、Journal、Conference、Translations |
| PRACTICE | Teaching、Contact |

## 路由職責

| 路由 | 唯一任務 |
| --- | --- |
| `index.html` | 六段式身分與工作總覽 |
| `about.html` | 肖像、完整簡介、教育時間線 |
| `research.html` | 三項目前研究與研究專長矩陣 |
| `journal-articles.html` | 完整期刊書目帳冊、篩選、全文與引用 |
| `conference-papers.html` | 已出版會議論文與歷年發表帳冊 |
| `translations.html` | 主要譯著、最新公共寫作、完整索引 |
| `certificates.html` | 證照／證書帳冊與獎項時間線 |
| `teaching.html` | 教學經驗與學術／專業實踐分區 |
| `cv.html` | 全站資料共源履歷、頁內索引、列印與 PDF |
| `contact.html` | Email、正式身分與聯絡說明 |
| `404.html` | 搜尋與返回主要入口 |

## 資料與重複控制

`src/data/routes.json` 是導覽來源，其他 JSON 是內容來源；HTML 由建置程式生成。首頁只做摘要與入口，完整條目留在專屬頁面；Footer 只生成一次；CV 不另維護第二份人工資料。
