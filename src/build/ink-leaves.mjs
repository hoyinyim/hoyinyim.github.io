// Generated editorial illustrations; the original name glyphs are separate assets.
const heights = { mountains: 480, river: 511, bamboo: 480 };

export function inkLeaf(motif, opening) {
  if (!Object.hasOwn(heights, motif)) throw new Error(`Unknown ink motif: ${motif}`);
  const home = opening === 'home-intro';
  return `<span class="ink-leaf ink-leaf--${motif}" aria-hidden="true"${home ? ' data-home-ink-art' : ''}><img src="images/ink/${motif}.jpg" width="1440" height="${heights[motif]}" alt="" decoding="async" fetchpriority="low"${home ? ' loading="lazy"' : ''}></span>`;
}
