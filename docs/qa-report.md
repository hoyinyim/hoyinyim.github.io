# AXIS 全站重構 QA 報告

驗收日期：2026-07-21。驗收對象：`feat/axis-scholarly-poster-rebuild`。

| 項目 | 結果 |
| --- | ---: |
| 內容逐筆核對 | 169／169 |
| 靜態 HTML、連結、資產與結構 | 492／492 |
| E2E 操作流程 | 83／83 |
| 響應式頁面／寬度組合 | 120／120 |
| Axe WCAG 2.2 AA | 44 次掃描，0 violations |
| Lighthouse | 100／100／100／100 |

## 覆蓋

- 11 個 HTML：首頁、關於、研究、期刊、研討會、譯著／公共寫作、證照／獎項、教學、履歷、聯絡、404。
- 12 種寬度：320、360、375、390、430、540、768、820、1024、1280、1440、1920px。
- 淺色／深色、桌機／手機、Reduced Motion、Forced Colors、200% 放大。
- 首頁 Research／Service／Teaching 三域拓樸、Tab／Enter／Back、手機觸控、三種 Focus 狀態、Menu 焦點與 Escape、Search、Theme 保存、期刊 Filter、引用 Disclosure／Copy、CV Print、Email Copy、指定研討會連結。

機器可讀結果與全站驗收證據位於 `docs/qa/professional-rebuild/`；三域拓樸的 12 張指定狀態截圖與 5 段操作錄影位於 `docs/qa/homepage-topology/`。
