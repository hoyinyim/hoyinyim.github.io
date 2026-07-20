# 內容完整性基準

- 上游基準：`f8f7acb`
- 完整快照：`backups/professional-rebuild-baseline-f8f7acb.zip`
- 快照 SHA-256：`96B0BD29AF49D00EFAE2D3F3C585CCDC669DC623CCC661925A4C924E7B240C31`
- 不可變來源：`content-source/original/`

| 來源檔 | SHA-256 |
| --- | --- |
| `index.html` | `6071AB9D5B468A5EF13383C71804B784D4B7EECEA1B13F94840480442CBEAF40` |
| `journal-papers.html` | `180B5C5DC9F180666B673F9B8B2EE727480A74121DF19E66F8C048FA83289F9E` |
| `translations.html` | `E0F18660CC54BE8D7540E6EEA8C9E90A262594E31D91C790D719CB9DE74FF96F` |
| `conference-papers.html` | `03CB861A710A3F10C654EEA04E731A93A737C0ADA29F9115F2A515F08854F6CA` |
| `certificates.html` | `B0DEFA5613412E504B35E956F7D75151D8BF493431E3BD3DB173E3E3761E4EE7` |

完整性測試同時驗證：來源雜湊、每一群組數量、逐筆欄位內容、原始順序、結構化資料與建置後初始 HTML。允許差異只有兩個授權電子全文網址、穩定 ID、客觀年份索引、路由欄位與不新增學術主張的 SEO 技術資料。

## AXIS Scholarly Poster 重構起點

- 重構前 `main`：`acc9355d83a7fc64313955f818accda5b3d187c3`
- 重構分支：`feat/axis-scholarly-poster-rebuild`
- 建立日期：2026-07-20
- 原始 HTML 來源仍以 `content-source/original/` 及上表 SHA-256 為不可變依據。
- 結構化資料只允許技術性欄位整理；個人資料、學術內容、題名、順序、狀態與既有連結不得改寫。
- 重構起點查核發現舊測試對 `conference-papers.html` 與 `certificates.html` 記錄了不符合儲存庫實際檔案的雜湊；本次只校正基準值為 `acc9355` 工作樹的真實 SHA-256，未修改兩個原始 HTML 的任何內容。

| 結構化資料 | SHA-256 |
| --- | --- |
| `conferences.json` | `34B4EA5A6B6679FB3C2C3C6315A03933FF64A49930BE3A3B75EC1C088F316465` |
| `credentials.json` | `74AE64493389C84EB36AE11F1CD6C9D2B09EC08AF2B9394E20786E680E7BFDBB` |
| `education.json` | `F6BA6837B179B4FD68B0523394F5C8FA3A2851A7F91A97A5C429E7A7617024F7` |
| `experience.json` | `F8CF0F659CA2B131D39EE7A0661439D1A42E443FEF8232DF6FB670589F642938` |
| `profile.json` | `B3DBF2D89D85DC22E608C1155A5DD55C9AA3C4EC2DCF5C918EB4587DD6D380BF` |
| `publications.json` | `3D919952B42FC5749031F87CF47FB82CBF152A1CBD8ED1BCF28D9DBBAF67E409` |
| `research.json` | `7D775E82916304631951F0AC466087D76F3F6D2D1B48BC7CE2BF41B47230398F` |
| `translations.json` | `E4F68115D154624D398926780B573ECB22C311EB0D8E6986DAC5111EB633E377` |

起點數量：期刊論文 10 筆、已出版研討會論文 2 筆、研討會發表 17 筆、哲學普及作品 11 筆、證照／證書 5 筆、獎項 4 筆。測試必須同時核對總數、逐筆內容、原始順序及初始 HTML 可讀性。
