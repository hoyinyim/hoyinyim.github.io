# 光學尺寸 Before／After 對照

「Before」為本輪修正前的 `docs/qa/optical-scale/` 素材；「After」為最終驗收的 `docs/qa/optical-scale-final/`。檔案均保留於本機，便於逐項追溯。

| 必要元件 | Before | After | 調整結果 |
| --- | --- | --- | --- |
| Header | `full/index-1440x900-100.jpg` | `full/index-1440x900-100.jpg` | 小型操作與品牌文字提升至 16px；控制按鈕視覺一致。 |
| 首頁 Hero／CTA | `full/index-1440x900-100.jpg` | `full/index-1440x900-100.jpg` | Hero 最大高度由近全窗改為 44rem；CTA 在身份資料下更容易辨認。 |
| 首頁學術簡介 | `full/index-1440x900-100.jpg` | `full/index-1920x1080-100.jpg` | 人物照完整保留，簡介提前至第二視窗起始。 |
| 三域拓撲 | `full/index-1440x900-100.jpg` | `full/index-1920x1080-100.jpg` | Canvas 880px→720px、卡片 460px→400px。 |
| About 人物照 | `full/about-1440x900-100.jpg` | `full/about-1920x1080-100.jpg` | 維持完整頭部與自然比例；字形退為背景。 |
| 教育背景及校徽 | `full/about-1440x900-100.jpg` | `full/about-1920x1080-100.jpg` | 臺北市立大學橫式標誌調為 108×62px，與成大標記光學平衡。 |
| Menu | `docs/qa/professional-rebuild/screenshots/menu-desktop-1440.png` | `menu-state/desktop-1440x900.jpg` | 字形舞台縮小、主項收至 72px，六項與輔助連結完整可見。 |
| 著作分類 | `full/publications-1440x900-100.jpg` | `full/publications-1920x1080-100.jpg` | 主字形由最大約 736px 收至 528px；資料分類提前。 |
| 期刊書目 | `full/journal-papers-1440x900-100.jpg` | `full/journal-papers-1920x1080-100.jpg` | 首頁資料型 Hero 收束；篩選與年份不再被大字壓縮。 |
| Footer | `full/translations-1440x900-100.jpg` | `full/translations-1920x1080-100.jpg` | Email 提升為 16px；無額外 footer 前空白。 |
| 古文字主視覺 | `full/publications-1440x900-100.jpg` | `full/publications-1920x1080-100.jpg` | 全站透明度 .08→.06；著作頁特別縮小。 |
| 手機首頁 | `full/index-390x844-100.jpg` | `full/index-390x844-100.jpg` | 人物照、簡介、拓撲與索引改為單欄，功能文字至少 16px。 |
| 手機 Menu | 舊 `menu-390-verified.png` 僅作歷史參照，不作通過證據。 | `menu-state/mobile-390x844.jpg` | 390×844 一屏可理解六項、次選單與 email；無溢出。 |
| 200％ Zoom | `zoom/journal-papers-1440x900-200.jpg` | `zoom/journal-papers-1440x900-200.jpg` | H1、篩選、年份、條目與操作維持閱讀順序，水平溢出為 0。 |

備註：本文件的相對路徑分別以 `docs/qa/optical-scale/` 與 `docs/qa/optical-scale-final/` 為根。Menu 的 After 另有 `menu-state-report.json`，記錄桌面主項 72px、手機主項 39px、工具文字 16px、overflow 0。
