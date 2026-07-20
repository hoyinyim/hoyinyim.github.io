# 參考來源到元件映射

## 五個高擬真原型規格

### 1. 首頁 Hero

- 來源：`https://typeproject.com/en/fonts/axisfont/` 的通透排印、`https://www.typographicposters.com/100besteplakate` 的非對稱張力、`https://www.details.co.jp/` 的完成度。
- 1440：16 欄，姓名跨 10 欄，身分及主入口位於右側 5 欄；只使用文字、線條與自然色肖像，不使用背景影片。
- 390：4 欄，姓名完整換行，身分與入口依序排列；不裁掉中文姓名。
- Light／Dark：白／近黑背景，單一品牌色分別為 `#3f575c`／`#9eb5be`。
- Motion Storyboard：頁面載入 0–240ms 顯示姓名；120–420ms 線條延展；240–520ms 身分與入口淡入；Reduced Motion 立即顯示。
- 未採用：Details 影像、JUNNI 拆字、海報圖。

### 2. Research

- 來源：100 Beste Plakate 的單一平面構圖、AXIS 的窄體 Metadata、Details 的段落定位。
- 1440：左 6 欄題名固定於段落可見範圍，右 9 欄依序顯示三個原研究方向；下方六項專長為可聚焦矩陣。
- 390：每一研究方向成獨立上下節奏；專長按鈕顯示說明，不依賴 Hover。
- Motion Storyboard：焦點項目提至 100％對比，其餘降至 42％；切換 220ms；Reduced Motion 無漸變。
- 未採用：巨大連續編號、海報背景圖、無作用 `tabindex`。

### 3. Journal Articles

- 來源：中川的分類密度、AXIS 的角色分工、Details 的精密條目、暦生活的年份節奏。
- 1440：左側年份索引 2 欄、中央條目 10 欄、右側結果數與 Filter 3 欄；不使用巨大年份。
- 390：Filter 成可換行工具列；期刊名、題名、Metadata、狀態、全文、引用依固定順序。
- Motion Storyboard：Filter 只做 160ms 對比切換；條目不位移；無 JavaScript 時全部可讀。
- 未採用：條目 01／02、固定卡高、全頁 Sticky Filter。

### 4. About／Education

- 來源：興福寺的安靜重量、暦生活的時間、AXIS 的留白、Details 的肖像完成度。
- 1440：肖像 6 欄、姓名與身分 8 欄；三段既有簡介分欄；教育為捲動時間線。
- 390：肖像自然比例，姓名、身分、簡介、教育垂直排列；校徽小尺寸顯示。
- Motion Storyboard：肖像不濾色，只以 280ms 透明度進場；時間線在進入視窗時線條延展。
- 未採用：灰黃濾鏡、圓形肖像、Tab Panel、巨大頁碼。

### 5. 古文字 Menu

- 主要來源：`https://prj-foodecon.w.waseda.jp/` 的雙線觸發、全畫面轉場與圓形視覺重心；輔以興福寺的層級與中川的高密度導航。
- 主項目：關於、研究、著作、教學、履歷、聯絡；著作下保留期刊論文、研討會論文、譯著與公共寫作，另保留證照與獎項入口。
- 1440：原生 Dialog，左側古文字舞台、右側六項繁體中文主導覽；焦點移動時切換相應古文字，右下提供搜尋及明暗模式。
- 390：轉為單欄可捲動，古文字舞台縮小但保留，關閉鈕固定且不遮擋內容。
- Motion Storyboard：面板 620ms、古文字 680ms、主項目依序錯開；關閉 410ms；Reduced Motion 立即顯示所有狀態。
- 觸發圖形：三段由古文字輪廓抽象出的細長標記，在 Hover、開啟與關閉時作短距旋轉／位移，不複製參考站筷形圖檔。
- 未採用：原站色盤、品牌圖形、DOM／CSS、無語意 `div` 按鈕、焦點留在頁面背景及缺少 Reduced Motion 的做法。

## 主要元件映射表

| 元件 | 參考網址 | 學習原理 | 最終應用 | 未採用／風險 |
| --- | --- | --- | --- | --- |
| Site Header | `https://www.details.co.jp/` | 固定、稀疏、位置穩定 | Research／Publications／About／CV＋Search／Theme／Menu | 不用影像背景及 Contact 抽屜 |
| Menu Dialog | `https://prj-foodecon.w.waseda.jp/`、`https://www.kohfukuji.com/` | 雙線觸發、全畫面狀態、圓形重心、文化層級 | 六項繁體中文主導覽、古文字焦點索引、手機完整可用 | 不複製原站資產／程式，不犧牲鍵盤、Reduced Motion 或焦點管理 |
| Search | `https://www.nakagawa-masashichi.jp/shop/default.aspx` | 高密度資料可發現 | 靜態索引、鍵盤、結果類型 | 不提交搜尋資料至外站 |
| Home Poster Moment | `https://www.typographicposters.com/100besteplakate` | 非對稱與字級張力 | 姓名／身分／主要路徑 | 每頁最多一處、無海報圖 |
| Timeline | `https://www.543life.com/` | 日期作內容骨架 | Education、Conference、Awards | 不用節氣、插畫、商品卡 |
| Journal Ledger | `https://typeproject.com/en/fonts/axisfont/`、中川首頁 | 字體角色與分類 | 書目、狀態、年份、引用 | 不用 AXIS 字體檔、電商 UI |
| CV Index | `https://www.details.co.jp/projects/vermicular/` | 段落錨點與長閱讀 | Sticky Index、A4 Print | 手機取消 Sticky |

所有桌面版以 16 欄、平板 8 欄、手機 4 欄重新構成；沒有一個元件直接複製參考站座標、圖片、CSS 或程式。
