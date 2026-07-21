# AA Design Rule 響應式矩陣

已完成完整 viewport／Zoom 矩陣。核心 800px 欄寬在窄屏轉為流動寬度；大標縮放而正文仍維持高行距。本站對應為 `--measure-reading`、`--measure-long` 與 `clamp()` 類型尺度，另通過 320px／200% 橫向溢出測試。

