# 效能驗收報告

驗收日期：2026-07-21。測試網址：本機正式靜態建置。

| 指標 | 實測值 | 門檻 |
| --- | ---: | ---: |
| Lighthouse Performance | 99 | ≥ 90 |
| Accessibility | 100 | ≥ 90 |
| Best Practices | 100 | ≥ 90 |
| SEO | 100 | ≥ 90 |
| LCP | 1802ms | ≤ 2500ms |
| CLS | 0 | ≤ 0.1 |
| TBT | 100ms | 記錄值 |
| Speed Index | 1118ms | 記錄值 |
| JavaScript | 8436 bytes | < 30KB |
| CSS | 35465 bytes | < 60KB |

發布包內含 4 個本機圖像資產，共 1,600,675 bytes；頁面沒有外部字型、外部圖片熱連或執行期 HTML 抓取。完整資料位於 `docs/qa/professional-rebuild/lighthouse-report.json` 與 `performance-results.json`。
