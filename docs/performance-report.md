# 效能驗收報告

驗收日期：2026-07-19。測試網址：`https://hoyinyim.github.io/index.html`。

| 指標 | 實測值 | 結果 |
| --- | ---: | --- |
| Lighthouse Performance | 93 | 通過 |
| Accessibility | 100 | 通過 |
| Best Practices | 100 | 通過 |
| SEO | 100 | 通過 |
| LCP | 2283ms | 低於 2500ms |
| CLS | 0 | 低於 0.1 |
| TBT | 227ms | 作為本次可取得的 INP 實驗室替代指標 |
| Speed Index | 2747ms | 記錄值 |
| JavaScript | 9681 bytes | 低於 30KB 預算 |
| CSS | 36876 bytes | 低於 60KB 預算 |
| 發布圖片 | 3 個／171296 bytes | 最小化發布包 |

完整 Lighthouse JSON 位於 `docs/qa/professional-rebuild/lighthouse-report.json`，摘要位於 `docs/qa/professional-rebuild/performance-results.json`。
