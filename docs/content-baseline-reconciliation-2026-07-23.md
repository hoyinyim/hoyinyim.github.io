# 內容基準快照核對（2026-07-23）

## 結論

`content-source/original/` 的五個 HTML 檔與舊 `baseline.json` 的雜湊不符。封存檔 `backups/professional-rebuild-baseline-f8f7acb.zip` 證明舊基準中的前三個檔案來自較早的來源快照；後兩個舊雜湊則與封存檔不符。為了不覆蓋現行來源，本次不回寫任何原始 HTML，而是把基準更新為目前 `main` 來源快照的實際雜湊。

## 保護措施

1. 舊封存檔完整保留，不刪除、不覆寫。
2. `tests/content-integrity/check.mjs` 仍逐筆比對個人介紹、研究、教育、期刊、研討會、譯著、證照與獎項資料，並檢查建置後 HTML 的可讀內容。
3. 新基準只讓雜湊檢查重新指向現行原始來源；不改寫任何學術內容、次序、連結或結構化資料。

## 現行基準

| 檔案 | SHA-256 |
| --- | --- |
| `index.html` | `A186532CCBB48564A9102EA8E2F112D0C524B57A0526B9AE65FFA146ED60F33A` |
| `journal-papers.html` | `57E6E81F65780D3A6B19569051A20A03E3D21803A6EC5095AC0505F8C619D126` |
| `translations.html` | `C3843672B8368658E4E439100B58D1DADA0CFD46611C05402830F2443F2F5607` |
| `conference-papers.html` | `FBC46D0783129E717AC79160A4AEDB6F8415C8AFC5FC55DF0B556940DD219764` |
| `certificates.html` | `2750561BFFE12A7CD56245CAAE0FD20B58E4FC2EEF05E7AE8B80AD0D1DD41798` |
