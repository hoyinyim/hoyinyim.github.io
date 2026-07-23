# 古文字方向稽核

查核日期：2026-07-23。

- 正式字形改為中央研究院小學堂楚系簡帛文字資料庫之原始文字圖，機讀註冊表位於 `src/data/chu-script-glyphs.json`。
- 網頁字形圖像一律套用 `transform: none !important`。
- `scripts/audit-glyph-orientation.mjs` 會掃描 `src/styles/` 與 `src/scripts/`；若字形相關規則出現旋轉、鏡像或翻轉，會以失敗結束。
- 本輪稽核結果：通過。

原圖、網頁圖與資料庫方向一致；未以動畫改變字形部件關係。
