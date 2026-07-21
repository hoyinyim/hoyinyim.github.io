# 嚴浩然個人學術網站最終發布報告

製作日期：2026-07-21。儲存庫：`https://github.com/hoyinyim/hoyinyim.github.io`。公開網站：`https://hoyinyim.github.io/`。

## 完成範圍

- 八個參照來源的桌機、手機、詳頁、載入、滾動或互動研究證據已保存。
- 五個高擬真原型與「軸線式當代學術平面系統」已定稿。
- 12 個 HTML、Research／Service／Teaching 三域拓樸、著作總覽、古文字 Menu、搜尋、明暗模式、篩選、引用複製、履歷列印／PDF、404、SEO 與結構化資料已完成。
- 10 篇期刊、2 篇已出版研討會論文、17 筆發表、1 筆譯著、11 篇公共寫作、5 筆證照／證書與 4 筆獎項逐筆保留。
- AXIS Font 未使用；網站沒有外部字型或圖片熱連。

## 最終驗收

| 項目 | 結果 |
| --- | ---: |
| 內容完整性 | 169／169 |
| 技術檢查 | 1192／1192 |
| E2E | 86／86 |
| 古文字 Menu／語言／失敗模式 | 110／110 |
| 全站古文字設計系統 | 705／705 |
| 響應式 | 132／132 |
| Axe WCAG 2.2 AA | 48 次，0 violations |
| Lighthouse | 99／100／100／100 |
| CSS／JavaScript | 59,982／13,740 bytes |
| 履歷 PDF | A4，8 頁，已逐頁渲染 |

## 完整參照網址

1. `https://www.details.co.jp/`
2. `https://www.details.co.jp/projects/vermicular/`
3. `https://junni.co.jp/`
4. `https://junni.co.jp/works/basica/`
5. `https://typeproject.com/en/fonts/axisfont/`
6. `https://www.typographicposters.com/100besteplakate`
7. `https://www.543life.com/?srsltid=AfmBOoofsD9hqjoaTlYu6luQURNC89SWUBwhIw57DLSIuHs2hAgyfBhd`
8. `https://www.543life.com/`
9. `https://www.kohfukuji.com/`
10. `https://www.nakagawa-masashichi.jp/shop/default.aspx?srsltid=AfmBOooNsk65crP3EtKreqrP8Z288VMEK-Bq9N0sQfMBv976YpWoK-4H`
11. `https://www.nakagawa-masashichi.jp/shop/default.aspx`
12. `https://prj-foodecon.w.waseda.jp/`

## 必須研討會連結

- `https://chinese.nccu.edu.tw/PageDoc/Detail?fid=8363&id=20873`
- `https://www.airitilibrary.com/Article/Detail/18172903-N202305110002-00020`

## 可核對產物

- 參照證據：`docs/qa/axis-reference-study/`
- 原型證據：`docs/qa/axis-prototypes/`
- 正式 QA：`docs/qa/professional-rebuild/`
- 桌機／手機錄影：`docs/qa/professional-rebuild/videos/`
- 履歷 PDF：`downloads/yim-ho-yin-cv.pdf`
- 三域拓樸映射與設計：`docs/research-service-teaching-content-map.md`、`docs/homepage-topology-design.md`
- 三域拓樸截圖與錄影：`docs/qa/homepage-topology/`
- Food Economics Menu 參照證據：`docs/qa/waseda-foodecon/`
- 古文字 Menu 設計、字形、動效、可及性與響應式文件：`docs/ancient-script-menu-design.md`、`docs/ancient-script-menu-glyph-map.md`、`docs/ancient-script-menu-animation-map.md`、`docs/ancient-script-menu-accessibility.md`、`docs/ancient-script-menu-responsive-qa.md`

## 正式發布與公開複驗

- Pull request：`https://github.com/hoyinyim/hoyinyim.github.io/pull/15`
- 合併版本：`cf4f739ad429ba9c1cbf5eabcbb62ca8cbb803a5`
- GitHub Pages workflow：`https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/29763150123`，結論為 `success`。
- 公開站 11 個 HTML、CSS、JavaScript、CV PDF 與 Open Graph 圖像共 15 個關鍵資源，均回應 HTTP 200。
- 公開站 E2E 67／67；桌機／手機／明暗模式 Axe WCAG 2.2 AA 共 44 次，0 violations；12 種寬度乘 10 頁的響應式複驗 120／120。
- 已實際檢視公開版 1920px 首屏、390px 全頁、手機 Menu、深色模式、期刊論文、研討會論文與證照／證書／獎項頁；未見水平溢出、文字裁切、異常換行或比例失衡。
- 公開驗收紀錄的 `baseUrl` 均為 `https://hoyinyim.github.io`，見 `docs/qa/professional-rebuild/` 下的 JSON 與截圖。

## 三域拓樸追加發布

- 正式發布版本：`b27f6be36c41843747bd082075bfbe105c4e377f`。
- GitHub Pages workflow：`https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/29765478982`，結論為 `success`。
- 公開站 E2E 83／83；三個入口、鍵盤順序、Enter、Browser Back、手機觸控與 Reduced Motion 均通過。
- 已使用公開瀏覽器實際檢視首頁及拓樸，並核對公開 HTML、CSS、JavaScript 與 GitHub `main` 雜湊一致。

## 繁體中文與古文字 Menu 追加發布

- 主要介面統一為繁體中文；英文姓名、職稱、機構名及論著題名等學術事實依原資料保留，不把專名誤當介面翻譯。
- 主 Menu 固定為「關於、研究、著作、教學、履歷、聯絡」六項，並保留期刊論文、研討會論文、譯著與公共寫作、證照與獎項等既有入口。
- 六個古文字圖形均有逐字來源、原始記錄、授權與查核紀錄；圖形只作視覺索引，不宣稱現代分類與古文字本義完全相等。
- 參考研究網址為 `https://prj-foodecon.w.waseda.jp/`；正式實作沒有載入或複製該站資產、DOM、CSS、品牌色盤或程式。
- 功能發布版本：`8c9f3caa79018b850083d8556e3a327fe9522bdd`；GitHub Pages workflow：`https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/29768669944`，結論為 `success`。
- 公開站 E2E 83／83；古文字 Menu／繁體中文／失敗模式 110／110；11 個 HTML、CSS、JavaScript 與六個本地古文字 SVG 共 19 個關鍵資源均回應 HTTP 200，SVG MIME 均為 `image/svg+xml`。
- 已以公開網址在實際瀏覽器開啟 Menu，核對六項繁體中文主導覽、六個古文字圖形、著作子導覽、搜尋、明暗模式、關閉與鍵盤焦點狀態；桌機畫面比例正常。320／390／768／1024／1440／1920 與 200％ Zoom 另由公開站自動瀏覽器測試逐項通過。
- 公開 HTML 不含 Food Economics 參考站資產或熱連；正式頁只載入 `images/ancient-script/` 下的本地字形檔。

## 全站古文字設計系統追加發布

- 功能發布版本：`7937ae694b6ecc67646ded292f7bf374a68af38f`；GitHub Pages workflow：[29803564195](https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/29803564195)，結論為 `success`。
- 新增 `publications.html` 著作總覽，主路由增至 11 頁；連同 404 共 12 個 HTML。每個主頁均配置唯一 A 級字形，B／C 級字形依內容結構節制使用。
- 六筆全站字形登錄完整記錄現代字、古文字類型、年代、來源、記錄號、資產頁、授權、允許用途、禁止情境、裁切與動畫限制；只使用本地 SVG，沒有 AI 生成或未核實字形。
- 全站古文字專項測試 705／705，涵蓋 11 頁、320／360／390／430／768／1024／1440／1920、200％ Zoom、深色、Reduced Motion、Forced Colors、缺圖降級與 CV 列印。
- 公開站 E2E 86／86、古文字 Menu／繁體中文／失敗模式 110／110、Axe 48 次 0 violations；11 個主頁、CSS、JavaScript 與六個 SVG 共 19 個資源均回應 HTTP 200，SVG MIME 皆為 `image/svg+xml`。
- 已在公開瀏覽器逐頁開啟 11 個主頁，核對 H1、18px 正文基準、唯一主字形、三個 Footer 微型字形與水平溢出；並實際檢視著作總覽深色首屏。未見遮擋、異常分行或比例失衡。
- 系統規格、逐頁配置、來源、動態、無障礙、效能與響應式文件位於 `docs/ancient-script-*.md`；測試報告與模式截圖位於 `docs/qa/ancient-script-site/`。

## 原始碼層級排印重構與楚系 Logo 候選（2026-07-21）

- Hashi、Kaitaksha 與 AA Design Rule 已完成 DOM、CSSOM、computed style、配色、斷點與 10 種指定 viewport 的原始碼層級研究；共保存 126 個參照量測情境，原始資料位於 `docs/qa/typography-reference/`。
- 正式站建立繁中 UI、繁中長文、拉丁字、Condensed 與 Mono 五種字體角色，正文最小 17px，Metadata 最小 14px；中文採 `line-break: strict` 與自然分行，只有 URL、Email、DOI 可任意斷行。
- 11 個主頁已完成 before 198 組、first-pass 594 組、final 594 組光學檢查；Git 只保留每頁具代表性的桌機、手機、深色、200% Zoom 與 Reduced Motion 截圖，完整量測數記錄於各階段 JSON。
- 最新驗收為內容 169／169、技術 1192／1192、E2E 86／86、古文字 Menu 110／110、全站古文字 705／705、響應式 132／132、排印 110／110、Axe 48 次 0 violations；Lighthouse 為 99／100／100／100。
- 小學堂楚系簡帛文字資料庫已登錄 8 個可追溯候選：四個「心」與四個「文」，均記錄資料庫字形 ID、出處、索引與 CC0 授權。候選尚未經使用者看圖核准，因此全部保持 `productionEnabled: false`；正式站不以假字形或現代字體冒充楚系文字。
