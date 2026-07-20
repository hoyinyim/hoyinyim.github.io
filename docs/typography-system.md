# 字體與可讀性系統

## 授權策略

不使用 AXIS Font：官方資料顯示其為購買／訂閱制商業字型，Webfont 與嵌入用途另有授權，而專案沒有授權證明。網站不載入外部字型、不熱連任何參照網站資源，改以使用者裝置既有字族提供完整中日英文字形。

## 字族

- Sans：`Arial Narrow`、`Aptos Narrow`、`Noto Sans TC`、`PingFang TC`、`Microsoft JhengHei`、sans-serif。
- Serif：`Noto Serif TC`、`Source Han Serif TC`、`PMingLiU`、serif。
- Mono：`Cascadia Mono`、`SFMono-Regular`、`Consolas`、monospace。

## 比例

- 正文：`clamp(1rem, .22vw + .96rem, 1.125rem)`，行高 1.72。
- 書目題名：`clamp(1.18rem, .7vw + 1rem, 1.75rem)`，行高 1.38。
- Metadata：最小 14px，行高 1.5。
- 導覽：15–16px。
- 頁名：`clamp(3rem, 7vw, 7.5rem)`；只在頁面開場使用。
- 首頁姓名：桌機上限 12rem，手機依視窗縮放但不得遮蔽身分資料。

## 中文斷行

題名使用 `text-wrap: pretty`、`word-break: normal`、`overflow-wrap: break-word`；姓名、學校、學位與固定書名可用 `word-break: keep-all`。不得用單行省略號、極小字級或固定高度隱藏內容。
