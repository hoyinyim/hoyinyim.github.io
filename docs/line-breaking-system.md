# 全站分行系統

- 全站繁中採 `line-break: strict`；正文維持 `word-break: normal`。
- DOI、URL、Email 才使用 `overflow-wrap: anywhere` 與技術字體。
- 標題採 `text-wrap: balance`；內文採自然換行，不插入展示性 `<br>`。
- 書目、會議、證照標題經逐字 Range 掃描，檢查行首標點與末行 1–3 字孤行。
- 320–1920px 及 200% Zoom 共 110 組測試已通過，無橫向溢出與禁用 `nowrap`。

