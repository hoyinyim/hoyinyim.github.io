# 參考站逐案查核 A：筆墨、工藝與分章

查核日期：2026 年 11 月 20 日（臺北）。典據為獎項官方頁、現行網站及其公開前端。用獨立 Chromium 工作階段檢查 1440×900 桌面與 390×844 觸控模擬；用游標、滾輪與觸控滑動取樣，能找到安全且可見的站內連結時才操作。截圖僅用於本次判讀，不搬入網站、不散布；以下的「瀏覽」整合畫面與 DOM 量測，並註明超時與未驗證部分。頭部載入的字體僅表示樣式宣告或資源引用，不能單獨證明實際逐字用了該字型。數值為本次取樣，不是全裝置保證；不把官方作品標籤當作行為證明。

## 01｜問書（toisyojp）

- **1–3｜名稱、作者、獎項：** [問書](https://toisyo.jp/)，Taishi Jinno，合作 Karen Aoki；[CSS Design Awards 官方](https://www.cssdesignawards.com/sites/toisyojp/46162/)：Special Kudos，2024-08-25，評審 6.44，不是 Website of the Day。
- **4–5、9｜開場、排版、圖文：** 淺灰 `rgb(239,239,239)` 的近全屏留白，小型左上字標、中央一行動畫字形，下緣設新聞帶。一條纖細黑線橫過畫面而不是讓書法當滿版貼花。正文樣式為 16px Sawarabi Mincho、首次下捲可見的「問書とは」為 25px；深灰字、中央軸與段間留白共同維持層級。「字標—線—新聞」各有用途，只有細線承擔長時間動態。
- **6–8、10｜游標、捲動、轉場、裝置：** 桌面具細線逐幀移動，移動游標期間像素會變，但線本身也是持續運行，不能把本次畫面差異歸因於游標；新聞文字連結懸停未見測得的顏色、透明度或 transform 改變。桌面下滾約 930px，從 `.top-1` 切進 `.top-2`、右上選單顯現，底層 Canvas 仍在視窗。點擊首頁新聞，已抵達[該站文章頁](https://toisyo.jp/20261001-2/)；未驗證跨頁是否做特殊合成。手機同主軸，Canvas 配置一度達 465px，根布局測得 390px 而內容 470px；直向觸控合成沒有帶動頁面，手機捲動與跨頁效果**未完成實際互動驗證**，不作反應性保證。
- **11｜前端：** [首頁](https://toisyo.jp/)列出 Lottie、Swiper、GSAP 3.7、ScrollTrigger；運行後可見 SVG 的 Lottie clip 及 Canvas。[公開繪圖程式](https://toisyo.jp/wp-content/themes/toisyo/js/script.js)有 Three.js WebGLRenderer、Perlin 與 requestAnimationFrame。出現 canvas 和 API 可確認渲染路徑；仍不代表任何指標座標必定對應波形。
- **12–13｜採用／不採用：** 借「一條線即可立住識別」：可在學術首屏的小字形旁配置短筆線或章節進度，讓字形和正文都有寧靜的背景；不移植整頁遮罩、持續波形 Canvas、手機超出視窗的背景，這些無助閱讀或查資料。

## 02｜DAIKUHARA Kintsugi & Antique

- **1–3｜名稱、作者、獎項：** [DAIKUHARA Kintsugi & Antique](https://daikuhara.jp/)，Shhh inc.；[製作方專案](https://shhh.jp/project/daikuhara)記載 2025 年 6 月的網站企劃、撰寫、翻譯、命名、設計與攝影；[CSS Design Awards 官方](https://www.cssdesignawards.com/sites/daikuhara-kintsugi-antique/47674/)：Special Kudos，2025-06-24，評審 7.58。
- **4–5、9｜開場、排版、圖文：** 灰橄欖底 `rgb(146,148,121)`、墨色近黑，英文導句和日文段落錯開，字標放在視覺另一端；矩形裁切內是物件圖片／無聲影片，而不是兩者都貼滿。宣告英文字型 Tobias，首段約桌面 32/41.6px、手機 17/23.8px；日文梯隊列 TsukuMinPr6N-D 和游明朝等，手機首段取樣 12/24px。字行使用逐行遮罩顯現，素材本身未被拿來替代內文。
- **6–8、10｜游標、捲動、轉場、裝置：** 游標移動期間有初始淡入／transform，但無法排除開場時間影響，未確認獨立游標效果。桌面 930px 滾輪輸入後，實測 `scrollX` 約 919、`scrollY=0`，影片由右進入中心；跟當前原始碼和[製作團隊受訪說明](https://www.commarts.com/webpicks/daikuhara-kintsugi-and-antique)所述手卷邏輯一致。手機首屏是縱向布局，根視寬 390px，文件可達 23,000px 以上；原生滑動合成此輪未帶動頁面。站內產品連結試點只見首頁遮罩／動畫變化，沒有進入新 URL；手機手勢與跨頁轉場**未完成實際互動驗證**。
- **11｜前端：** [站方公開 JS](https://daikuhara.jp/wp-content/themes/daikuhara/assets/js/common.js?1750382248)可辨識 Lenis、水平 orientation、IntersectionObserver、ResizeObserver；桌面 DOM 測得影片封面的 polygon clip，內文字行使用 inset clip 與 `fadeInSlide`。因此可說「水平輸入映射及遮罩」，但不把視覺深淺一律解釋成 GPU 特效。
- **12–13｜採用／不採用：** 借「固定排版軸上的目次、先文字後素材、逐段留白」給研究章節及著作分類；開場有選擇地使用小範圍遮罩。不採全站橫向捲動、12px 作學術正文、無聲影片作必要內容；書目導航需線性、可捲動、可鍵盤直達。

## 03｜実相山 正覚寺（Shogakuji Temple）

- **1–3｜名稱、作者、獎項：** [正覺寺現行官網](https://nakameguro-shogakuji.or.jp/)，Nippon Design Center。[製作團隊](https://www.ndc.co.jp/en/projects/shogakuji-web/)列藝術指導 Ayumu Uchida、設計 Tomoko Tsuruta 等、開發 Naokazu Terada，作品年份 2020；[CSS Design Awards 官方](https://www.cssdesignawards.com/sites/shogakuji-temple/43383/)是 2023-04-25 Special Kudos（評審 7.34）。作品年與獎項年不同。
- **4–5、9｜開場、排版、圖文：** 首屏中央一個大色光剪影；四周只保留暗面暖紅、金黃、靛與碧青，右側白色直排導覽，左下細小捲動提示。下一幕白色直書位居暗色背景中間；桌面 14/41px、手機 12/30px，樣式指向 Adobe Fonts 的 UD 黎明明朝系列。製作方指稱以互動主視覺、四支影片與社群元素傳達寺方日常，CSSDA 以燭光閃動概括其界面。相較平均分配裝飾，畫面每次只突顯一標誌或一段文字。
- **6–8、10｜游標、捲動、轉場、裝置：** 移動桌面游標後，未量得 Canvas 外框或測量對象的 transform 變化；不能因此推定 Canvas 像素必定無游標回應。桌面滾輪與手機觸控均把完整視窗由首屏移到概念段，`scrollY` 留在 0 而 `.fullpage-wrapper` 的 transform 改變，手機取樣約 -840px。桌面點右側「縁起」確實進入[同站關於頁](https://nakameguro-shogakuji.or.jp/about/)；觀測到透明度、位移動畫，但未逐幀釐清是跨文件或路由遮罩。手機導覽收成頂部橫條，圖形縮窄，縱排理念段仍可見。
- **11｜前端：** [官網](https://nakameguro-shogakuji.or.jp/)運行時有 `/_nuxt/` bundles、兩個 Canvas、背景 video、`fullpage-wrapper`、Adobe TypeKit；其中第三方舊 polyfill 被測試 Chromium 阻擋，已見場景仍能運作。不以 DOM 類名推定套件版本或 shader 名稱。
- **12–13｜採用／不採用：** 借「少數焦點 + 靜區」：古文字印記只作精簡開場，題名始終正常顯示，分章可用小標、線和材質的變換。不採整屏翻頁、直排正文、滿版持續影片／閃光；學術內頁需能停在任意段落，在低動效模式完全可讀。

## 04｜弁天 KIMINO KIMONO（Kimono Benntenn）

- **1–3｜名稱、作者、獎項：** [弁天 KIMINO KIMONO](https://kimono-benntenn.com/)，Reiro；[CSS Design Awards 官方](https://www.cssdesignawards.com/sites/kimono-benntenn/49090/)：Special Kudos，2026-03-25，評審 7.37。
- **4–5、9｜開場、排版、圖文：** 粉白、雲粉、淡青，對比文字是藍灰 `rgb(55,87,117)`。開場有可跳過的滿屏雲景影片；背後首屏以置中的標誌配合兩側獨立 PNG/WebP 插畫、消息框及品牌層。實測根樣式 16px Shippori Antique B1，消息字採 Shippori Mincho B1 直排（桌面 16px、手機約 10px）；故事桌機首段量得 14/30px。雲彩、山景和敘事段落形成分章，不是商務卡片網格。
- **6–8、10｜游標、捲動、轉場、裝置：** 初次抽樣桌面未量得移動游標產生新變化；開始捲動時實測 `scrollY=1540`、故事框保持在視窗，內部 8928px 寬圖文帶平移約 -285px。開場影片遮罩仍在部分時點覆蓋頁面，首次直接點「イベント情報」超時，不能稱已驗證跨頁轉場。手機 DOM 載入專用 390×844 影片及排列，標誌約 78px 寬而桌面約 173px，故事有不同成組排列；手機捲動與跨頁行為**未完成實際互動驗證**。
- **11｜前端：** [首頁](https://kimono-benntenn.com/)提供 GSAP 3.12.5、ScrollTrigger 及 [桌機 story-pc](https://kimono-benntenn.com/wp-content/themes/benten-hp/js/dist/story-pc.min.js)、[手機 story-sp](https://kimono-benntenn.com/wp-content/themes/benten-hp/js/dist/story-sp.min.js)、[開場 loading](https://kimono-benntenn.com/wp-content/themes/benten-hp/js/dist/loading.min.js) 等分工；影片實測 autoplay + muted，不能把其動畫只歸於 CSS。
- **12–13｜採用／不採用：** 借同一幅場景的桌機／手機獨立構圖、邊角圖與中間文字互不干擾、用色切換提示進章。不採滿屏載入影片、可滑數千像素的水平故事帶與細小直排資訊；在網站模擬的手機寬度，讀者應直接見題名和查找入口。

## 05｜4C’s ad. — Brush to Digital

- **1–3｜名稱、作者、獎項：** [品牌專案](https://branding.4cs-ad.co.jp/)，[4C’s AD Inc.](https://4cs-ad.co.jp/)；[CSS Design Awards 官方](https://www.cssdesignawards.com/sites/4cs-ad/50390/)：Special Kudos，2026-10-19，評審 7.89。官方描述為從浮世繪到數位設計的 WebGL 品牌敘事。
- **4–5、9｜開場、排版、圖文：** 實際截圖先看見整屏黑底白字「LOADING」與細線框、其後數字／時鐘；桌面與手機均顯示兩個全屏 Canvas，頂底細線，巨型拉丁大字與空區有強尺度差。根字體宣告 Cormorant Garamond，外掛字族還有 Shippori Mincho B1、Zen Old Mincho 等；不從宣告推定實際 loading 文字使用的字型。這是**載入景**，不是主內容構圖；正式主視覺及後半段圖文關係未經肉眼證實。
- **6–8、10｜游標、捲動、轉場、裝置：** 桌機和觸控模擬都取得 HTTP 200，至少一輪 7 秒附近仍處載入狀態；桌機移動游標時有 transform、opacity、filter 等運行，不確定由時間軸或指標驅動；滾輪／觸控未越過遮罩，未得可點的安全站內導覽。除了兩尺寸的載入層，正式頁游標、捲動、轉場與裝置差異**未完成實際互動驗證**。
- **11｜前端：** [頁面原始前端](https://branding.4cs-ad.co.jp/)HTTP 200，直接引入 [Three.js 資源](https://branding.4cs-ad.co.jp/assets/three.min.js)；傳送的公開 inline JS 可辨識 WebGLRenderer、ShaderMaterial、fragmentShader、pointermove 等。可確認其實作存在，但不從程式名稱補造特定場景的行為。
- **12–13｜採用／不採用：** 借「材質、線框與有意義的字形動作」表現學術站自己的文獻意象；減至原生 CSS 的短距離過渡，內容不等待任何場景初始化。不採遮擋讀者數秒的 loader、完整 shader 敘事與長時間主執行緒動畫。

## 綜合決策

上列五站皆以可辨識的一個圖形主題組織節奏；最能轉用的是圖文分區、段落尺度、少數有功能的短動態。桌面可以透過留白與低對比原創背景構成展覽感，手機採自己的簡化構圖；期刊、研討會、證照等列表以正常直向文流、可見段落與可操作錨點為主。古文字只用已提供／核定資產，不把裝飾類比成古文字來源、考釋或學術證據。
