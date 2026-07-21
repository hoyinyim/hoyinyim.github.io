# 楚系文字轉場系統

頁面轉場現階段沿用一般淡出，不使用未核准楚系候選。核准後才可將候選作為低透明度章節標記，動效限 opacity、translate 與 clip reveal；不做字形互相變形。`prefers-reduced-motion: reduce` 下停用轉場，失敗時退回真正 HTML 文字與一般頁面導航。

