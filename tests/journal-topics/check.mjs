import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';

const base = (process.env.SITE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const executablePath = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const journal = `${base}/journal-papers.html`;
const allIds = Array.from({ length: 10 }, (_, index) => `journal-${String(index + 1).padStart(2, '0')}`);
const topicAssets = [
  { id: 'si', width: 97, height: 97, hash: '7e0e647ade9e498a6f52cde945a68c610da29487b8f7c9aaa1f1adf28652311c' },
  { id: 'qun', width: 97, height: 97, hash: 'a2aa1285c6c016baa5ba76d72338c8176e0d38119ac34c251b50bfb2bbf91409' },
  { id: 'xuan', width: 403, height: 401, hash: '843eddb52adcad06c2498f83e9182de274501d570c841e4e32c04ebaaa2982d1' }
];
const topic = (page, id) => page.locator(`[data-publication-topic="${id}"]`);
const filter = (page, id) => page.locator(`[data-publication-filter="${id}"]`);
const openJournal = (page, fragment = '') => page.goto(journal + fragment, { waitUntil: 'networkidle' });
const visibleIds = (page) => page.locator('[data-publication]:visible').evaluateAll((nodes) => nodes.map((node) => node.dataset.publicationId));
const assertResults = async (page, ids, label) => {
  assert.deepEqual(await visibleIds(page), ids, label);
  assert.equal((await page.locator('[data-publication-count]').innerText()).trim(), String(ids.length), `${label}：總筆數`);
  const groups = await page.locator('[data-publication-year]:visible').evaluateAll((nodes) => nodes.map((node) => ({
    displayed: Number(node.querySelector('[data-publication-year-count]').textContent),
    actual: node.querySelectorAll('[data-publication]:not([hidden])').length
  })));
  assert.ok(groups.every(({ displayed, actual }) => displayed === actual && actual > 0), `${label}：年份筆數`);
};
const browser = await chromium.launch({ executablePath });

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await openJournal(desktop);
  await assertResults(desktop, allIds, '預設顯示全部書目');
  assert.equal(await desktop.getByRole('button', { name: /羣：.*群書治要/ }).count(), 1, '羣的入口有可讀取的主題名稱');
  await Promise.all(topicAssets.map(async ({ id, width, height, hash }) => {
    const image = topic(desktop, id).locator('img');
    const src = `images/journal-topics/${id}.png`;
    assert.equal(await image.getAttribute('src'), src);
    assert.deepEqual(await image.evaluate((node) => [node.naturalWidth, node.naturalHeight]), [width, height], `${id} 原圖在瀏覽器載入`);
    const response = await desktop.request.get(`${base}/${src}`);
    assert.ok(response.ok(), `${id} 原圖 HTTP ${response.status()}`);
    assert.equal(createHash('sha256').update(await response.body()).digest('hex'), hash, `${id} 原圖位元未變`);
  }));

  await topic(desktop, 'si').focus();
  await topic(desktop, 'si').press('Enter');
  await desktop.waitForFunction(() => document.querySelector('[data-publication-topic="si"]').getAnimations({ subtree: true })
    .some((animation) => animation.animationName === 'stamp-impression'));
  await assertResults(desktop, ['journal-01', 'journal-03', 'journal-04', 'journal-05', 'journal-06', 'journal-09'], '思不含《群書治要》');
  assert.equal(desktop.url(), journal, '選主題留在同一頁');
  await filter(desktop, '2025').click();
  await assertResults(desktop, ['journal-03', 'journal-04', 'journal-05', 'journal-06'], '思與 2025 年交集');
  assert.equal(await topic(desktop, 'si').getAttribute('aria-pressed'), 'true');
  await topic(desktop, 'qun').click();
  await assertResults(desktop, [], '羣與 2025 年無交集');
  assert.match(await desktop.locator('[data-publication-empty-message]').innerText(), /沒有符合目前篩選條件/);
  assert.equal(await filter(desktop, '2025').getAttribute('aria-pressed'), 'true', '切換主題保留年份');
  await filter(desktop, 'all').click();
  await assertResults(desktop, ['journal-02'], '羣只對應《群書治要》');
  await filter(desktop, 'forthcoming').click();
  await assertResults(desktop, ['journal-02'], '羣與待刊狀態交集');
  await topic(desktop, 'all').click();
  await assertResults(desktop, ['journal-02'], '移除已刊登的第48期論文後，只列出仍待刊的書目');
  await filter(desktop, '2026').click();
  await assertResults(desktop, ['journal-01', 'journal-02'], '2026 年同時包含已刊與待刊書目');

  await topic(desktop, 'xuan').click();
  await assertResults(desktop, [], '玄目前無期刊書目');
  assert.match(await desktop.locator('[data-publication-empty-message]').innerText(), /尚無「魏晉思想」主題/);
  const reset = desktop.locator('[data-publication-reset]');
  await reset.focus();
  await reset.press('Space');
  await assertResults(desktop, allIds, '清除主題及年份／狀態');
  assert.equal(await topic(desktop, 'all').evaluate((node) => node === document.activeElement), true, '清除後焦點回到全部主題');
  assert.equal(await filter(desktop, 'all').getAttribute('aria-pressed'), 'true');
  assert.equal(await desktop.locator('[data-publication-empty]').isVisible(), false);

  await topic(desktop, 'qun').click();
  await desktop.evaluate(() => { location.hash = 'year-2025'; });
  await desktop.locator('#year-2025').waitFor({ state: 'visible' });
  await assertResults(desktop, allIds, '同頁年份深連結不會落在被隱藏的書目');
  await desktop.close();

  for (const width of [320, 390]) {
    const phone = await browser.newPage({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await openJournal(phone);
    const measure = await phone.evaluate(() => ({
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
      chips: [...document.querySelectorAll('[data-publication-topic], [data-publication-filter]')].map((node) => {
        const { height, left, right } = node.getBoundingClientRect();
        return { height, inView: left >= -1 && right <= innerWidth + 1 };
      })
    }));
    assert.ok(measure.overflow <= 1, `${width}px 水平溢出：${measure.overflow}px`);
    assert.ok(measure.chips.every(({ height, inView }) => height >= 44 && inView), `${width}px 所有篩選按鈕完整顯示且可觸控`);
    await topic(phone, 'qun').tap();
    await assertResults(phone, ['journal-02'], `${width}px 一次觸控選取羣`);
    const glyph = topic(phone, 'qun').locator('.ink-local-glyph');
    assert.deepEqual(await glyph.evaluate((node) => [
      getComputedStyle(node, '::before').animationName,
      getComputedStyle(node.querySelector('img')).clipPath
    ]), ['none', 'none'], '減少動態時字形不切分、不播放動畫');
    assert.equal(phone.url(), journal);
    await phone.close();
  }

  const noScript = await browser.newPage({ javaScriptEnabled: false });
  await openJournal(noScript, '#year-2025');
  assert.equal(await noScript.locator('[data-publication-topics]').isVisible(), false);
  assert.equal(await noScript.locator('[data-publication-filters]').isVisible(), false);
  assert.equal(await noScript.locator('#year-2025').isVisible(), true);
  await assertResults(noScript, allIds, '停用 JavaScript 仍可讀全部書目及年份連結');
  assert.equal(await noScript.locator('[data-publication] a[href^="https:"]:visible').count() > 0, true, '無 JavaScript 仍可開啟既有全文');
  await noScript.close();
  console.log('期刊主題瀏覽器測試通過：三張原檔、單主題及交集、2026 年、零筆重設、年份深連結、320／390px、減少動態與無 JavaScript。');
} finally {
  await browser.close();
}
