# 動態系統

全站只有 `assets/site.js` 一個控制器。它集中處理：Header 捲動狀態、單一 Scroll Progress、Menu Dialog、Search Dialog、Theme、Copy、期刊篩選、教育時間線、公共寫作捲動及返回頁首。

## 時間與用途

- 快速互動：180ms。
- Menu 與結構切換：420ms。
- 只使用字距、位移、細線、背景與原生 Dialog 轉換；不重播姓名 Loader、不使用每頁不同揭露動畫、不使用磁吸與自訂游標。

## 效能與降級

目前首頁不使用 Canvas，整站沒有持續 RAF。Scroll 只有一個 passive listener，並以單一 `requestAnimationFrame` 合併更新。`prefers-reduced-motion: reduce` 會移除平滑捲動、動畫與轉場，所有內容仍立即可見與操作。
