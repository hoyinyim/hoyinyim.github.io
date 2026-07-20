# AXIS Scholarly Poster System 最終發布報告

製作日期：2026-07-21。儲存庫：`https://github.com/hoyinyim/hoyinyim.github.io`。公開網站：`https://hoyinyim.github.io/`。

## 完成範圍

- 七個參照來源的桌機、手機、詳頁、載入、滾動與互動研究證據已保存。
- 五個高擬真原型與「軸線式當代學術平面系統」已定稿。
- 11 個 HTML、Grouped Menu、Search、Theme、Filter、Citation Copy、CV Print／PDF、404、SEO 與結構化資料已完成。
- 10 篇期刊、2 篇已出版研討會論文、17 筆發表、1 筆譯著、11 篇公共寫作、5 筆證照／證書與 4 筆獎項逐筆保留。
- AXIS Font 未使用；網站沒有外部字型或圖片熱連。

## 最終驗收

| 項目 | 結果 |
| --- | ---: |
| 內容完整性 | 158／158 |
| 技術檢查 | 490／490 |
| E2E | 67／67 |
| 響應式 | 120／120 |
| Axe WCAG 2.2 AA | 44 次，0 violations |
| Lighthouse | 99／100／100／100 |
| CSS／JavaScript | 35,465／8,436 bytes |
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

## 必須研討會連結

- `https://chinese.nccu.edu.tw/PageDoc/Detail?fid=8363&id=20873`
- `https://www.airitilibrary.com/Article/Detail/18172903-N202305110002-00020`

## 可核對產物

- 參照證據：`docs/qa/axis-reference-study/`
- 原型證據：`docs/qa/axis-prototypes/`
- 正式 QA：`docs/qa/professional-rebuild/`
- 桌機／手機錄影：`docs/qa/professional-rebuild/videos/`
- 履歷 PDF：`downloads/yim-ho-yin-cv.pdf`

## 正式發布與公開複驗

- Pull request：`https://github.com/hoyinyim/hoyinyim.github.io/pull/15`
- 合併版本：`cf4f739ad429ba9c1cbf5eabcbb62ca8cbb803a5`
- GitHub Pages workflow：`https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/29763150123`，結論為 `success`。
- 公開站 11 個 HTML、CSS、JavaScript、CV PDF 與 Open Graph 圖像共 15 個關鍵資源，均回應 HTTP 200。
- 公開站 E2E 67／67；桌機／手機／明暗模式 Axe WCAG 2.2 AA 共 44 次，0 violations；12 種寬度乘 10 頁的響應式複驗 120／120。
- 已實際檢視公開版 1920px 首屏、390px 全頁、手機 Menu、深色模式、期刊論文、研討會論文與證照／證書／獎項頁；未見水平溢出、文字裁切、異常換行或比例失衡。
- 公開驗收紀錄的 `baseUrl` 均為 `https://hoyinyim.github.io`，見 `docs/qa/professional-rebuild/` 下的 JSON 與截圖。
