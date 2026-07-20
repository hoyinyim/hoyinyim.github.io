# JUNNI 參考研究

## 查核範圍

- 首頁：`https://junni.co.jp/`
- 作品索引：`https://junni.co.jp/works`
- 作品詳頁：`https://junni.co.jp/works/basica/`
- 證據：`docs/qa/axis-reference-study/junni/`

## 實際觀察

首頁以深色模組格、巨大 `JUNNI` 字樣與拆字動態建立強烈識別；Menu 為右上獨立入口。往下以 ABOUT、WORKS、SERVICE、AWARDS、RECRUIT 交替，段落間常用巨型輪廓字、重複文字及橫向移動。作品索引以圖片與逐字動畫強化 Hover；詳頁則回到標題、專案說明、圖片、外部網址、Prev／Next 的長閱讀。

首次載入會先呈現模組骨架，約數秒後主字顯現；桌面與手機不是單純等比縮小，手機將巨字、圖片與段落改成獨立節奏。Cookie 條在錄影中可見，未進行同意操作。

## 可轉化原理

- 文字揭示、線條推進與 Hover 對比可縮短為 180–360ms 的低刺激微互動。
- 單一 Menu 入口及清晰 Close 狀態轉化為原生 Dialog。
- 模組格只作設計推導工具，不直接顯示為卡片牆。
- 作品詳頁的 Prev／Next 觀念轉化為頁面底部相關路徑，而不以輪播取代完整內容。

## 刻意不採用

不採用循環巨字、拆字成數十個 DOM 節點、綠色高亮、長時間骨架、WebGL／Canvas、過度 Hover、獎項標誌或招聘場景。本站動效必須服從可讀性並完整支援 Reduced Motion。

## 版權與反抄襲

未使用 JUNNI 商標、影像、手寫字、程式碼或動效曲線。最終只吸收「狀態明確、文字有時間感」的原理。
