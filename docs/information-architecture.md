# 資訊架構

## 一、單一路由來源

`src/data/routes.json` 是十個主要頁面的唯一導覽來源；`404.html` 為系統錯誤頁。實際路徑與標籤見 `route-inventory.md`。

## 二、頁面角色

| 頁面 | 專屬任務 | 不重複的內容策略 |
| --- | --- | --- |
| Home | 身分、個人檔案、成果入口、目前研究、研究索引、教育、經驗 | 使用七種空間構圖作全站入口 |
| About | 肖像、完整既有簡介與教育背景 | 不複製全部研究條目 |
| Research | 目前研究與研究專長的完整索引 | 不補寫貢獻、方法或關係 |
| Journal Articles | 十筆正式書目、年份、篩選、引用 | 初始 HTML 即可完整閱讀 |
| Conference Papers | 兩筆已出版論文與十七筆發表 | 明確分為雙幅出版區及年份帳冊 |
| Translations | 一筆主要譯著與十一筆公共寫作 | 公共寫作只有一套完整索引 |
| Certificates | 五筆證照／證書與四筆獎項 | 無真實圖片時採純文字檔案，不生成預覽 |
| Teaching | 三筆既有教學與學術經驗 | 精簡單場景 Ledger |
| CV | 全站資料彙整及 A4 列印 | 不另維護重複 CV 資料 |
| Contact | Email、正式身分與署名 | 不套用成果列表版型 |
| 404 | 返回首頁及 Search 入口 | 不加入虛構內容 |

## 三、共用元件

每頁只生成一個 Header、Menu Dialog、Search Dialog、Footer、Scroll Progress 與全站控制器。Header 顯示核心入口，完整十頁索引由 Menu 呈現；兩者均由同一路由資料生成。
