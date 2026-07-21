# 古文字效能報告

測試日期：2026-07-21。

## 策略

- 六個字形均為本地單色 SVG，不使用外部字體、Canvas 或影片。
- 每頁 A 級字形使用 eager；頁面下方 B／C 級使用 lazy loading。
- HTML 統一輸出固定寬高，避免圖片載入造成版面位移。
- 動畫只使用 opacity、transform 與 clip-path；沒有古文字專用 scroll listener。
- CSS 建置後壓縮，總預算低於 60 KB；JavaScript 低於 30 KB。

## 測試結果

本機 Lighthouse：Performance 100、Accessibility 100、Best Practices 100、SEO 100。最終建置 CSS 56,077 bytes、JavaScript 13,740 bytes，並由 `scripts/check-site.mjs` 自動守住 60 KB／30 KB 預算。所有古文字皆從 GitHub Pages 同源載入，沒有第三方執行階段依賴。

## 風險控制

若 SVG 遺失，網站只失去裝飾層，不會重新排版正文。未來新增字形前須同時評估檔案大小、首屏載入層級與實際頁面必要性，不得因視覺填充而無限制增加資產。
