# 無障礙驗收報告

驗收日期：2026-07-19。目標：WCAG 2.2 AA。

## 自動與互動測試

| 檢查 | 結果 |
| --- | --- |
| Axe：11 頁 × 1440px／390px | 22 次掃描，0 violations |
| E2E | 68／68 通過 |
| 每頁 H1 | 唯一 |
| Menu | 原生 Dialog、Escape、Focus Trap、焦點返回均通過 |
| Search | Ctrl／Command + K、鍵盤選取與 Enter 跳轉均通過 |
| 複製狀態 | `aria-live="polite"` 實際宣告通過 |
| Reduced Motion | 媒體查詢與實際頁面通過 |
| Forced Colors | 實際模擬與截圖通過 |
| 200％ Zoom | 無溢出、無不可見控制項 |

首次公開 Axe 掃描曾指出共用淡色頁碼對比不足；最終調整頁碼尺度與前景混合比例後，22 次掃描全部清零。機器可讀結果見 `docs/qa/professional-rebuild/accessibility-results.json`。
