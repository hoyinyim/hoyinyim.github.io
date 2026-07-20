# 參考來源綜合矩陣

| 來源 | 核心原理 | 可用頁面／元件 | 手機轉化 | 不採用 | 主要風險 |
| --- | --- | --- | --- | --- | --- |
| Details | 精密排印、固定定位、索引到詳讀 | Header、CV Index、學術條目 | 減少影像裁切、保持題名 | 全屏影片、黑場、品牌影像 | 變成廣告公司仿站 |
| JUNNI | 文字狀態、揭示、互動密度 | Menu、線條揭示、Hover | 巨字轉成上下節奏 | 拆字、循環巨字、Canvas | 動效壓過內容 |
| AXIS Font | 通透留白、Basic／Condensed／Compressed 分工 | 全站排印、Metadata | 中文維持正常字寬 | 未授權字體檔、官方樣張 | 授權與繁中字形 |
| 100 Beste Plakate | 非對稱構圖、過濾器、高低字級對比 | Home Poster Moment、Research、Journal | 由跨欄改為四欄順序 | 海報圖、全頁海報化 | 圖像版權、可讀性 |
| 暦生活 | 日期、更新、柔和時間節奏 | Conference、Recent Publications、Timeline | 日期與題名先行 | 商品卡、季節插畫、購物功能 | 回到生活型錄風格 |
| 興福寺 | 文化重量、實用資訊、安靜留白 | About、Menu、Contact | 垂直導覽改為可捲動 Dialog | 寺廟影像、佛教符號、書法 | 宗教符號誤植 |
| 中川政七商店 | 高密度分類、搜尋、列表形態多樣 | Search、Journal、Credentials、CV | 導覽分層、觸控目標 | 電商卡、價格、會員／購物車 | 變成電商資訊架構 |
| 早稻田大學 Food Economics（`https://prj-foodecon.w.waseda.jp/`） | 雙線觸發、全畫面狀態切換、圓形視覺重心 | 古文字 Menu 觸發器、Dialog、主項目焦點回應 | 雙欄轉單欄、保留清楚關閉與捲動 | 原站資產、DOM、色盤、品牌構圖及無語意 `div` 按鈕 | 近似仿站、鍵盤與 Reduced Motion 缺口 |

## 統一轉化

八站不直接拼貼，而由四條規則統一：

1. 排印以 Sans 為主，Serif 只留給作品題名與長文。
2. 全站使用黑、白、中性灰及單一品牌色；不沿用任何參考站色盤。
3. 每頁最多一個 Poster Moment，其餘以 Editorial Composition 或 Document Reading 承載內容。
4. 動效只說明狀態與時間：線條、淡入、對比、Dialog 與頁面轉場；Reduced Motion 下全部停用。

## 反抄襲檢查

- 沒有參考站資產進入 `images/` 或正式 CSS／HTML。
- 沒有複製 DOM 結構、CSS 類名、動畫程式或圖示。
- 網格、字級、顏色及元件均依本站資料重新推導。
- 所有參考截圖與錄影只存在 `docs/qa/axis-reference-study/`，不由公開頁面載入。
- Food Economics 專項證據只存在 `docs/qa/waseda-foodecon/`；正式 Menu 使用本地、逐字記錄來源與授權的古文字 SVG。
