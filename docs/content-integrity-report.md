# 內容完整性報告

核對日期：2026-07-19。核對環境：公開部署版 `https://hoyinyim.github.io` 與本機結構化資料來源。

## 方法

`tests/content-integrity/check.mjs` 驗證五個原始來源檔的 SHA-256，逐筆比對受保護可見文字與生成後 HTML，並核對期刊、研討會、譯著、公共寫作、證照及獎項數量。原始來源保存在 `content-source/original/`，基準備份為 `backups/professional-rebuild-baseline-f8f7acb.zip`。

## 實際結果

| 項目 | 數量 | 結果 |
| --- | ---: | --- |
| 自動完整性檢查 | 158 | 全部通過 |
| 期刊論文 | 10 | 全部保留 |
| 已出版研討會論文 | 2 | 全部保留 |
| 研討會發表 | 17 | 全部保留 |
| 譯著 | 1 | 全部保留 |
| 哲學普及／公共寫作 | 11 | 全部保留 |
| 證照／證書 | 5 | 全部保留 |
| 獎項 | 4 | 全部保留 |

未改寫題名、個人簡介、學歷、職稱、會議名稱、年份或獎項內容；未加入 AI 摘要、無來源分類或無來源關鍵詞。機器可讀結果見 `docs/qa/professional-rebuild/content-integrity-results.json`。
