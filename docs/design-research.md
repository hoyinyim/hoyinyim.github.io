# 日本網頁案例研究：書畫、文字與留白

查核日：2026 年 11 月 20 日。用途為嚴浩然個人學術網站的本機設計示範；不引入參考站的程式、圖像、字體或聲音。

## 查核方法

- **實站觀察**：瀏覽器直接觀察的畫面、操作與狀態；看得到某個效果不等於知道其實作。
- **官方記載**：獎項頁與設計公司或作品官方說明；「WebGL」若只是官方標籤，不據此判定某片畫面使用哪個 shader。
- **技術證據**：可見的 HTML、CSS、載入資產或執行狀態。載入一個函式庫不代表全站皆以它製作。
- **推測／構想**：推測的技術路徑，或本專案自己的延伸設計。遇到不能操作或不能確認之處，按項標為「未完成實際互動驗證」或「未驗證」。

完整逐站記錄（作者、首頁、排印、指標、捲動、轉場、圖文、桌面／手機、技術、取捨）：[A．書法與傳統文化](design-research-a.md)、[B．留白與文字](design-research-b.md)、[C．藝術展示與敘事](design-research-c.md)。以下保留正式獎名；Special Kudos 不等同 Website of the Day。

| 作品與獎項來源 | 獎項／日期 | 對學術網站的取材方向（本專案判斷） |
| --- | --- | --- |
| [toisyojp](https://www.cssdesignawards.com/sites/toisyojp/46162/) | Special Kudos・2024-08-25 | 書寫承擔身分識別，正文保留可選取的現代正字 |
| [DAIKUHARA Kintsugi & Antique](https://www.cssdesignawards.com/sites/daikuhara-kintsugi-antique/47674/) | Special Kudos・2025-06-24 | 通卷與局部並存，先看材料，再查解說 |
| [Shogakuji Temple](https://www.cssdesignawards.com/sites/shogakuji-temple/43383/) | Special Kudos・2023-04-25 | 以單一文化意象統一節奏，不讓多層背景同時動 |
| [Kimono Benntenn](https://www.cssdesignawards.com/sites/kimono-benntenn/49090/) | Special Kudos・2026-03-25 | 保留靜態排印層次，局部動作只暗示出入次序 |
| [4C's ad. — Brush to Digital](https://www.cssdesignawards.com/sites/4cs-ad/50390/) | Special Kudos・2026-10-19 | 書畫到數位顯示的關係可用短遮罩表達 |
| [MA / The Space Between](https://www.cssdesignawards.com/sites/ma-the-space-between/49701/) | Special Kudos・2026-07-08 | 用段距與圖文先後表現停頓；不鎖住正文 |
| [STUDIO ROW](https://www.cssdesignawards.com/sites/studio-row/47432/) | Special Kudos・2025-05-01 | 先定對齊基準；圖像大小和欄寬建立主次 |
| [Writing & Design Inc.](https://www.cssdesignawards.com/sites/writing-design-inc/47948/) | Special Kudos・2025-09-01 | 可動的是展示字形副本，學術題名及書目維持穩定 |
| [SOIL](https://cssdesignawards.com/sites/soil/48210/) | Special Kudos・2025-10-08 | 網格服務資料索引，欄寬以內容決定 |
| [TBWAHAKUHODO](https://www.cssdesignawards.com/sites/tbwahakuhodo/49947/) | Special Kudos・2026-08-14 | 網格作為對齊基準，文字扭曲不成為導覽必要狀態 |
| [ris. ArtWork](https://cssdesignawards.com/sites/ris-artwork/44985/) | Special Kudos・2024-01-24 | 展示、選作與說明具備可分別操作的入口 |
| [MILEZ](https://cssdesignawards.com/sites/milez/48734/) | Website of the Day・2026-01-23 | 文化材料按章分組；本期不採自動播放聲音 |
| [THE TAWARAYA](https://cssdesignawards.com/sites/the-tawaraya/49158/) | Special Kudos・2026-04-05 | 留一段靜景交代情境，閱讀入口保持可達 |
| [Tamaki Yoshida — Portfolio](https://cssdesignawards.com/sites/tamaki-yoshida/49502/) | Special Kudos・2026-06-05 | 圖名及題跋沿邊排列，作品周圍留空間 |
| [45R Denim Karuta](https://cssdesignawards.com/sites/45r-denim-karuta/47168/) | Website of the Day・2025-03-10 | 互動用於辨認材料，學術解說不設闖關門檻 |

## 技術研究筆記

### 文字設計

- 日文假名與漢字可同字族；繁中段落須回到繁中字形。英文字母可配人文襯線，年份、按鈕與標籤仍用易辨黑體。用真實 HTML 標題保留搜尋、朗讀和選取；原字形只負責章首、印記或示例。
- 先分主標、段落、文獻說明，再定字級；正文行高約 1.8 倍，寬版約 32–34 個全形字寬。章際與段內留白分開。縱書以短題籤為限，用 [CSS Writing Modes](https://www.w3.org/TR/css-writing-modes-3/#block-flow)；窄版橫排。
- 淡入、遮罩、逐字及變形是四種不同決策。前兩者只用於展示副本或自願重播；正文按段且預設可讀。逐字拆分可能破壞分詞、朗讀與複製；書法變形易誤示古文字筆畫，故不對語意文字使用。

### 捲動互動

- 觸發是入視口等離散事件，可用 Intersection Observer；位置綁定以捲動位置導出連續進度，可用 [CSS 捲動驅動動畫](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)。速度映射另需取樣、插值，不能視為同一機制；閱讀頁不必採用。
- 低幅視差及裁揭只宜用在輔助圖像；停頓由段距和圖文次序構成。不攔滾輪、不把垂直操作強制改成橫移。章節用錨點；寬版只釘住側欄，正文不被封成播放幕。
- 畫卷的橫捲限於局部容器，用接近式 Scroll Snap；保留可見捲軸、原生手勢及逐圖控制。窄螢幕仍能正常向下閱讀。

### 動態設計

- 淡入、低幅位移和縮放宜用 opacity／transform；滑鼠和鍵盤聚焦獲得等效回饋。圖像 clip-path 或遮罩仍可能重繪，只做局部短時間揭示，原圖預設可見。
- 跨頁優先用同源原生連結；支援 [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) 才做短淡接。返回、修改鍵和開新分頁仍是瀏覽器原生行為。SVG 路徑虛線動畫適用於自繪線條，不視為真實書寫筆序。
- 指標跟隨若引入，只限細指標、低位移展示區，不能取代真游標。這次不以持續背景迴圈營造高級感。參見 [減少動態](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) 與 [W3C：互動動畫](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)。

### 水墨、紙張與畫卷

- 書法筆序、像素裁揭、墨色濃淡、墨跡消散須區分。沒有經授權且可考的分筆資料，不製造「真實筆順」。本期只做原圖遮罩；圖層混合可做墨色變化，柔邊遮罩可研究消散，不需物理流體。
- 紙紋用低透明度靜態小型 SVG。不在小字上疊過強噪點；強制色彩與列印停用。逐幅畫卷連同題跋閱讀；圖集選作更新對應圖說，放大另附原圖連結。
- 古籍翻頁以可返回的頁面、章節或圖版切換為先。卷軸與註解可互相提示，動畫不冒充原件裝幀。示範使用本站既有山水插圖，標明是設計插圖，不能當古畫證據。

### 進階取捨

| 技術 | 本期選擇與限制 |
| --- | --- |
| CSS、原生 JS、SVG 動畫 | 排印、畫卷、短遮罩、章節與選作狀態均由此解決 |
| Canvas 2D／指標互動 | 適用於局部標記或粒子，但繪製文字失去文件語意；不引入連續游標渲染 |
| WebGL／Three.js／Shader 位移 | 可處理逐像素流體、幾何與光照；增加低階 GPU 風險及後備需求，目前不採用 |
| 互動圖集／高解析局部放大 | 採原生連結與選作；既有圖寬 1440px，只提供局部查看，不宣稱典藏解析度或 IIIF |

60 FPS 是目標而不是裝置保證。限制同時動畫數、圖片大小及捲動讀寫；後續先在低階手機比較同段內容的 GPU 版與靜態版，再決定是否升級。
