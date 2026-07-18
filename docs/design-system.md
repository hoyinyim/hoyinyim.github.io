# 全站設計系統

藝術方向為「MUJI Spatial Editorialism／無印式空間編輯設計」：以未漂白紙白、墨色、灰木、乾燥苔綠、低飽和靛藍與少量朱砂建立材料層次；以編輯網格、細線、行寬及方向性空白取代浮起卡片、金色漸層、大圓角與陰影。

## CSS 分層

1. `tokens.css`：顏色、字體、字級、空間、容器、動態、Z-index。
2. `reset.css`：一致的盒模型與原生元素基準。
3. `typography.css`：繁體中文排印、頁面與章節層級。
4. `layout.css`：Header、Hero、Footer 與全站框架。
5. `navigation.css`：Menu、Search 與 Dialog。
6. `pages.css`：逐頁獨立構圖。
7. `responsive.css`：手機與中型裝置的獨立重排。
8. `accessibility.css`：Reduced Motion、對比、強制色彩與觸控。
9. `print.css`：A4 CV。

建置後只發布 `assets/site.css`。不存在 `archive-pages.css`、`third-stage.css`、`body:has(...)` 頁面覆寫或頁面內嵌 `<style>`。

## 構圖原則

- Home 使用身份場景、肖像雙幅、成果書架、研究序列、研究索引、教育時間線及經驗帳冊。
- 資料類型決定容器：書目使用年份軌道，會議使用年份帳冊，證照使用文字檔案索引，公共寫作使用可水平操作的單一索引。
- 頁面 Hero、章節標題與 Footer 不重複首頁姓名比例。
- 深色模式重新指定紙材與墨色，不作機械反相。
