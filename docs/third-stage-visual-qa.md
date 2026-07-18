# 第三階段視覺 QA

檢查日期：2026-07-19。

## 視覺核對結論

- 首頁：六種內容結構已清楚分流；研究方向採深色橫幅、研究專長採不對稱網格、教育背景採校徽＋互動時間線、教學經歷採年份索引。手機版 Hero 已縮短過量空白，主標題、身份文字與 Metadata 均能正常換行。
- 全螢幕 Menu：桌面為左側身份資料＋右側大型頁面索引；手機改為緊湊單欄。長中文頁名沒有被裁切，EMAIL 不再逐字直排，當前頁以朱色標示。
- 證照／證書／獎項：舊版一般列表改為檔案清單＋固定典藏預覽；手機變為預覽在前、清單在後，沒有隱性 Grid 欄位造成的大面積錯位。
- 研討會論文與期刊論文：Hero 改為內容驅動高度；年份、標籤、會議資訊與長題名維持完整，320px 仍不水平溢位。
- 譯著／哲學普及作品：跑馬區保持局部動態，但不再把其寬度洩漏至整個文件；回退字型情境仍無溢位。
- 全站：正文 17–19px，必要 Metadata 至少 14px，桌面主導覽至少 16px；Reduced Motion 會移除不必要轉場。

## 前後截圖

改造前：

- `docs/qa/third-stage/before/home-1280.png`
- `docs/qa/third-stage/before/menu-1280.png`
- `docs/qa/third-stage/before/certificates-1280.png`

改造後：

- `docs/qa/third-stage/after/home-1440.png`
- `docs/qa/third-stage/after/home-390.png`
- `docs/qa/third-stage/after/menu-1440.png`
- `docs/qa/third-stage/after/menu-390.png`
- `docs/qa/third-stage/after/certificates-1280.png`
- `docs/qa/third-stage/after/conference-200-percent.png`
- `docs/qa/third-stage/after/journal-fallback-font-390.png`

## 鍵盤與互動

- Menu 開啟時焦點立即移至「CLOSE」。
- Menu 內 Tab／Shift＋Tab 循環，不會落到背景內容。
- Escape 關閉後，焦點回到原本的 MENU 按鈕。
- 目前頁面具有唯一 `aria-current="page"`。
- 教育時間線可用 Tab 聚焦及左右方向鍵、Home、End 切換。
- 證照與獎項清單可用 Tab、Enter、Space 更新預覽。

## 限制與待部署核對

- 本機沒有可供 Playwright 使用的 Firefox、WebKit 與錄影器，因此沒有捏造跨引擎結果或影片。已保存足以逐頁核對的自動截圖與完整量測 JSON。
- 首次公開部署核對時發現瀏覽器仍沿用舊版 `site.js`；已為第三階段 CSS 與 JavaScript 加入版本查詢字串，避免 GitHub Pages／瀏覽器快取混用新舊介面。
- 快取修正部署後，須再開啟首頁、Menu、研討會論文與證照頁，確認公開版本已使用新導覽結構。
