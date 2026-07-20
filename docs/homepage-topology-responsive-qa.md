# 首頁三域拓樸響應式 QA

驗收日期：2026-07-21。

## 驗收矩陣

| 尺寸／狀態 | 檢查重點 | 結果 |
| --- | --- | --- |
| 320px | 三圓重疊、文字與入口可讀、無水平捲動 | 通過 |
| 390px | 圓形占寬約 110–125％、觸控入口直接可用 | 通過 |
| 768px | 手機與桌面之間重新構圖穩定 | 通過 |
| 1024px | 三圓尺寸與首屏後留白平衡 | 通過 |
| 1440px | 非對稱構圖、三種 Focus 狀態 | 通過 |
| 1920px | 圓形服從寬版網格、不過度放大 | 通過 |
| 200％ Zoom | 無水平捲動、入口仍有足夠可視點擊區 | 通過 |
| Dark Mode | 低彩度、無發光與高飽和混色 | 通過 |
| Reduced Motion | 無描線或文字延遲動畫 | 通過 |
| Forced Colors | 圓形輪廓與軸線可辨識 | 通過 |

## 必要證據

截圖與錄影存放於 `docs/qa/homepage-topology/`。已實際檢查桌機、手機、深色、三種 Focus、Reduced Motion 與 200％ Zoom 畫面。

## 測試結果

- 內容完整性：169 項通過，三域資料皆可追溯既有資料檔。
- E2E：83 項通過，包含三個入口、Tab 順序、Enter、Browser Back、手機觸控與 Reduced Motion。
- 響應式：10 頁 × 12 種寬度，共 120 組通過。
- Axe WCAG 2.2 AA：44 次桌機／手機／明暗模式掃描，0 violations。
- Lighthouse：Performance 100、Accessibility 100、Best Practices 100、SEO 100。
- 正式 CSS／JavaScript：42,044／9,859 bytes。

## 截圖

- `screenshots/topology-1920-default.png`
- `screenshots/topology-1440-default.png`
- `screenshots/topology-1024-default.png`
- `screenshots/topology-768-default.png`
- `screenshots/topology-390-default.png`
- `screenshots/topology-320-default.png`
- `screenshots/topology-dark-1440.png`
- `screenshots/topology-research-focus.png`
- `screenshots/topology-service-focus.png`
- `screenshots/topology-teaching-focus.png`
- `screenshots/topology-reduced-motion-1440.png`
- `screenshots/topology-200-percent.png`

## 錄影

- `videos/topology-entry.webm`
- `videos/topology-hover-focus.webm`
- `videos/topology-keyboard.webm`
- `videos/topology-mobile-tap.webm`
- `videos/topology-page-transition.webm`

## 公開部署複驗

- GitHub Pages workflow：`https://github.com/hoyinyim/hoyinyim.github.io/actions/runs/29765478982`，結論為 `success`。
- 正式發布版本：`b27f6be36c41843747bd082075bfbe105c4e377f`；HTML 內建置標記為實作版本 `3d64daf81ee6`。
- 公開 `index.html`、`assets/site.css`、`assets/site.js` 與 GitHub `main` 原始位元組雜湊一致。
- 公開站 E2E 83／83 通過；Research、Service、Teaching 三個入口與目的頁面均正確。
- 已在實際公開瀏覽器檢查深色首頁與三域拓樸，三圓交疊、文字、細線與低透明色階皆正常。
