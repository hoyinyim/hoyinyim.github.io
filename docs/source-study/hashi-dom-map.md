# HASHI 原始碼結構圖

查核日：2026-07-21。資料來自 `tests/typography-reference/capture.mjs` 對首頁與內頁的 DOM／CSSOM 實測；完整快照在 `docs/qa/typography-reference/reference-typography-matrix.json`。

首頁以固定側欄 Header、直排敘事區、Projects／Journal 內容區及 Footer 組成。內頁 `/about/` 改用橫向本文欄配直排 H2。實作大量以語意容器加版面 class 控制，內容段落中仍有人工 `<br>`；本網站只移植「層級與節奏」，不複製其 DOM、文案、圖像或直排結構。

| 區域 | HASHI 結構特徵 | 本站對應 |
| --- | --- | --- |
| 全域導覽 | 固定窄側欄、Logo、Menu、Store CTA | 頂部導覽與全螢幕 Menu |
| 首屏敘事 | 多段直排文字，圖片與留白交錯 | 首頁身份、三域拓樸 |
| 內容索引 | 細分隔線、低密度卡列 | 論文年表、履歷資料列 |
| 內頁本文 | 約 604px 主欄，長行距 | `--measure-reading` 閱讀欄 |

