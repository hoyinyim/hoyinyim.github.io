import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 320, height: 720 }, locale: "zh-TW" });
await page.goto(`${process.env.SITE_URL || "http://127.0.0.1:4173"}/${process.argv[2] || "translations.html"}`, {
  waitUntil: "networkidle",
});
await page.evaluate(() => {
  document.documentElement.style.zoom = "2";
});
const result = await page.evaluate(() => ({
  viewport: innerWidth,
  documentWidth: document.documentElement.scrollWidth,
  offenders: [...document.querySelectorAll("body *")]
    .map((node) => {
      const box = node.getBoundingClientRect();
      return {
        tag: node.tagName,
        className: node.className,
        text: (node.textContent || "").trim().replace(/\s+/g, " ").slice(0, 90),
        left: Math.round(box.left),
        right: Math.round(box.right),
        width: Math.round(box.width),
        scrollWidth: node.scrollWidth,
        clientWidth: node.clientWidth,
      };
    })
    .filter((item) => item.right > innerWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 1)
    .sort((a, b) => b.right - a.right)
    .slice(0, 30),
}));
console.log(JSON.stringify(result, null, 2));
await browser.close();
