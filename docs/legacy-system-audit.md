# 舊系統稽核

基準：`f8f7acb`。本文件記錄必須被取代的架構，不把舊實作保留作相容層。

| 系統 | 基準證據 | 風險 | 處理決定 |
| --- | ---: | --- | --- |
| CSS | `site.css` 29,097 bytes；`archive-pages.css` 14,583 bytes；`third-stage.css` 22,926 bytes | 三套規則互相覆蓋 | 以分層來源建置唯一 `assets/site.css`；刪除兩個補丁檔 |
| 頁面判斷 | 186 個 `body:has(` | 高耦合、縮放與瀏覽器風險 | 改用語意頁面 class 與共用元件 |
| 頁內 CSS | `journal-papers.html`、`translations.html` 有大型 `<style>` | 與全站 Token 衝突 | 完全移除 |
| 頁內 JavaScript | 期刊與譯著各自有互動控制器 | 進度、轉場、揭露與事件重複 | 只保留單一 `assets/site.js` |
| 期刊內容 | `const publications` 在頁內，執行後才插入 | 無 JS 時無法閱讀、SEO 不完整 | 遷移至 `src/data/publications.json` 並靜態渲染 |
| 搜尋 | HTML Dialog 與動態產生節點並存 | 空節點與焦點錯誤 | 唯一原生 `dialog`＋靜態 JSON 索引 |
| 導覽 | 每頁 Header 與 JavaScript Menu 分開維護 | 路由漂移與當前頁不一致 | `routes.json` 單一來源 |
| Menu | `data-menu-open` 與 `nav-scene` 兩組狀態 | Escape、Focus Return 不可靠 | 單一原生 `dialog` Controller |
| 動態 | 多組 Scroll Progress、Reveal、Transition、Loader | 事件與 RAF 疊加 | 單一 Motion／Scroll Controller |
| 舊視覺 | 藍金白卡片、紅金漸層、大圓角與陰影 | 頁面語言不一致 | 統一為低飽和紙材與編輯式網格 |

## 不移除的內容

`content-source/original/`、既有圖片、全部原始學術文字、原始條目順序與已存在的外部來源網址均保留。只有指令明確授權的兩個研討會電子全文網址屬內容差異。
