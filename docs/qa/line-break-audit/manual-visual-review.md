# 全站文字分行人工驗收

檢查日期：2026-07-25
範圍：`index.html`、`about.html`、`research.html`、`publications.html`、`journal-papers.html`、`conference-papers.html`、`translations.html`、`teaching.html`、`certificates.html`、`cv.html`、`contact.html`、`404.html`。

## 檢查方法

逐頁閱讀 `line-break-final/` 的 320、390、768、834、1024、1440px 完整頁、首屏與頁尾截圖；並核對桌面與手機 Menu、搜尋視窗，以及 200% 放大之研討會頁。自動稽核另涵蓋 13 種寬度及 125%、150%、175%、200% 放大倍率。

## 結果

| 區域 | 人工判定 |
| --- | --- |
| Header、Breadcrumb、Footer、Menu | 中文姓名、英文姓名與功能按鈕維持完整；長子導覽改為單欄，頁尾與 Email 均有可預期斷點。 |
| 首頁與 About | 英文身分改為三段次要資訊；照片說明、中英文姓名與機構路徑均依語意分行。 |
| Research、Teaching | 研究標籤不再以斜線串接；768–960px 提前堆疊，不以縮字維持桌面欄位。 |
| 著作、期刊、研討會、CV | 題名一律採自然／pretty 分行；卷期、日期與狀態拆為短資料單位；研討會的活動名稱與地點日期分列。 |
| 譯著與公共寫作、證照與獎項 | 移除標題硬換行，名稱統一；開場文字擴為可讀欄寬，三欄公共寫作於平板即改兩欄。 |
| Contact、200% Zoom | Email 最低 16px，僅可於 `@` 後斷行；放大檢查保持來源順序與可讀性。 |

## 前後對照

- 修正前：`../line-break-before/`
- 修正後：`../line-break-final/`
- 自動逐行資料：`line-break-results.json`
- 自動稽核摘要：`line-break-summary.md`

自動掃描仍會列出「英文獨立次行」及手機上短學術題名末行作為肉眼覆核項；這些項目不再作為阻擋錯誤，因為其斷行來自已明確標示的英文次行或狹窄螢幕下保持原題名的自然分行。標點、日期範圍、Email 斷點、橫向溢出與窄欄瀑布則仍為阻擋條件；本輪為零項。
