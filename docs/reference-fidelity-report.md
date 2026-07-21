# 參考忠實度報告

## 原理是否落實

- AXIS 的通透感：以空間、正常中文字距、低字重正文及清楚角色分工落實，不靠未授權字體。
- Basic／Condensed／Compressed：Basic 用於正文與 UI；Condensed 用於拉丁年份及 Metadata；Compressed 只允許極短拉丁標記，不壓縮繁中。
- 100 Beste Plakate：只在首頁與 Research 各保留一個可控平面構圖；其餘頁面回到編輯式或文件式閱讀。
- 暦生活：把日期和更新順序轉成 Conference、Awards、Recent Publications 的節奏。
- 興福寺：把文化重量轉成克制留白、事實層級和低刺激互動，不使用宗教圖像。
- 中川政七商店：把分類與高密度 UX 轉成 Search、Filter、CV Index，不使用電商卡。
- Details：把精密排印與索引／詳讀結構轉成全站 Header、學術條目及 CV。
- JUNNI：只保留短線條、淡入、狀態切換，不使用循環文字與重動畫。
- 早稻田大學 Food Economics：研究 `https://prj-foodecon.w.waseda.jp/` 的雙線觸發、全畫面開關、圓形舞台與時間節奏；本站重新建構為有語意的按鈕與 Dialog，補足焦點鎖定、Escape、焦點歸還、Reduced Motion、Forced Colors 及無 JavaScript 後備導覽。

## 完整度證據

原七站均有首頁、詳頁、1440／390、首屏、全頁、Hover 或互動、載入錄影、約 20 秒滾動錄影及約 15 秒互動錄影。第八站 Food Economics 另以 Menu 專項規格保存關閉、Hover、120ms 開啟中、700ms 開啟完成、關閉後、390px、Reduced Motion 與錄影證據。JUNNI 詳頁第一次自動導航遭 `net::ERR_ABORTED`，其後以同一 Canonical URL 成功補拍 `detail-1440-full.png`；最終結果檔已記為無未解失敗。

## 版權與授權

所有參考站資產只保留於 QA 證據，不會由公開頁載入。AXIS Font 因無本站授權而不使用。正式 Menu 的六個古文字 SVG 另取自 Wikimedia Commons 可再利用檔案，並以中央研究院「小學堂」甲骨文字形資料庫覆核字形；每字來源、記錄號、授權、資產網址、查核日期及語義限制均寫入 `src/data/ancient-script-menu-glyphs.json` 與 `docs/ancient-script-menu-glyph-map.md`。網站只載入本地副本，不作熱連。

## 不仿站判準

最終網站不得同時複製任何來源的色盤、首屏圖像、Logo 位置、內容分類和動畫。若畫面只移除 Logo 仍能被辨認為某一參考站，視為不通過；若視覺判斷必須依本站姓名、學術內容、獨有網格與單一品牌色才能成立，才符合本次轉化。

## 2026-07-21 原始碼研究補充

本輪新增 Hashi、Kaitaksha、AA Design Rule 三站的 DOM、CSSOM、computed style、色彩與斷點研究。移植內容限於可抽象的比例與編排原理，包括字級比、行長、留白、資訊密度與響應式策略；未複製任何來源的 HTML 結構、CSS 選擇器、字體檔、圖片、品牌識別或互動程式。實測與本站 token 對照分別位於 `docs/source-study/`、`docs/reference-typography-comparison.md` 與 `docs/reference-style-token-map.md`。
