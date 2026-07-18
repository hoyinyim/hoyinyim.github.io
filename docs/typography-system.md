# 字體與可讀性系統

## 基準

- 正文：`clamp(1.0625rem, .25vw + 1rem, 1.1875rem)`，約 17–19px；行高 1.72。
- Metadata：最小 14px；主要狀態與卷期頁碼不以顏色作唯一訊息。
- Desktop 主導覽：16px。
- Mobile Menu 頁名：最小 28px。
- 頁面標題：`clamp(2.8rem, 6vw + 1rem, 7.5rem)`；只讓首頁姓名使用品牌事件級比例。

## 字型策略

網站不依賴外部網路字型。中文 Serif 優先使用系統可用的 `Noto Serif TC`／`Source Han Serif TC`／`PMingLiU`，中文 Sans 優先使用 `Noto Sans TC`／`PingFang TC`／`Microsoft JhengHei`。字型失敗時仍由本機中文字型完整顯示。

## 長題名

所有正式題名均採自然換行與 `text-wrap: pretty`，不使用單行 Ellipsis、不截斷、不以極小字體塞入固定高度。Grid 子項均允許收縮，320px 與高倍率縮放由自動測試檢查溢出與裁切。
