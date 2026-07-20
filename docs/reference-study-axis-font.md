# AXIS Font 參考研究

## 查核範圍

- 字體頁：`https://typeproject.com/en/fonts/axisfont/`
- Support：`https://typeproject.com/en/support`
- License：`https://typeproject.com/en/support/detail/?page=fonts_5`
- 證據：`docs/qa/axis-reference-study/axis-font/`

## 實際觀察

官方以「simple and airy」描述 AXIS Font，畫面以白底、黑字、少量淺藍和規律分隔線呈現。其家族不只把同一字形水平壓縮：Basic、Condensed、Compressed 針對漢字、假名與拉丁字母設定不同適當字寬。官方說明 Condensed 的漢字約為正常字寬 80％、假名約 76％；Compressed 的漢字約 60％、假名約 50％，目的在增加信息密度而不犧牲可讀性。

字體頁提供 Features、Specimen、FontInUse、Buy、試排文字框、字級滑桿與黑／白模式。Family／Specification 說明 Standard 及 Pro 字符集；購買區列出訂閱、套裝及單一字重。Support 明列 License、Web Font、EULA 等獨立入口。

## 授權判斷

AXIS Font 是需購買或訂閱的商業字體。官方 License 頁說明下載／光碟版按 CPU 授權，伺服器、網絡、裝置嵌入另需專門授權；Web Font 另由服務提供。使用者未提供本站 Web Font 或自託管授權，因此本專案不下載、不轉檔、不嵌入、不提交 AXIS Font，也不宣稱本站使用 AXIS Font。

## 可轉化原理

- Basic 角色：正文、Header、一般 UI。
- Condensed 角色：年份、卷期、日期、機構、Metadata 與 Filter。
- Compressed 角色：只限極短的拉丁文標記；繁中不以 CSS 強行壓縮。
- 大量白空間與緊湊信息並存，而不是以字距製造「高級感」。

## 合法替代

介面採系統 Sans 與 Noto Sans TC／Source Han Sans TC 可用字形鏈；拉丁 Metadata 以 `Arial Narrow`、`Roboto Condensed` 或系統窄體作漸進增強。題名及少量長文採 Noto Serif TC／Source Han Serif TC。若未自託管合法檔案，不增加外部字體請求。

## 刻意不採用

不複製 AXIS 字形、官方淺藍主視覺、Specimen 圖、字符樣張或互動試排器；只將「角色分工」轉為本站排印規則。
