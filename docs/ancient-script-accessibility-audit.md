# 古文字無障礙稽核

稽核日期：2026-07-21。

## 結果

- 古文字均為裝飾元素：外層 `aria-hidden="true"`，圖片 `alt=""`。
- 現代繁體中文頁名、H1、區段標題、按鈕、日期、機構與狀態均完整保留。
- 主字形 `pointer-events: none`，不攔截滑鼠或觸控。
- 字形載入失敗時，自動隱藏失敗容器；H1、導覽與內容仍正常。
- Forced Colors 隱藏 A／B 級大型裝飾，保留現代文字與必要輪廓。
- Reduced Motion 停止古文字進場、位移與頁面轉換。
- CV 列印模式隱藏全部古文字。
- 深色模式只改變字形色彩，不改變語意或文件順序。

## 自動測試

`tests/ancient-script-site/check.mjs` 覆蓋 11 頁、8 種寬度、200％ Zoom、深色、Reduced Motion、Forced Colors、缺圖與 CV 列印。`tests/accessibility/check.mjs` 另以 axe-core 驗證主要頁面。

## 人工覆核

已檢視首頁、研究、著作總覽、研討會論文、履歷與聯絡頁之桌機與手機構圖。A 級字形位於內容層後方，沒有覆蓋肖像、H1、書目題名或操作控制項。
