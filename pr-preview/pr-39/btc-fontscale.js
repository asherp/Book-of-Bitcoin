// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-fontscale.js — the reader's type sizes, one number per region of the
// page: the body (the prose, its in-line notes and quoted voices, and the
// head matter's hash prose -- display type like the chapter title never
// scales), the sigla (the opcode glyphs and push marks set inline in that
// prose -- not the data-type letters, which name what the prose carries and
// so stay at its size), the margins (citations, amounts, forward cites),
// the notation key, and the commentary a passage or a
// ledger carries -- authored prose, read at whatever size suits reading it,
// which is not always the size that suits the record. Each region beyond the body
// FOLLOWS the body until the reader deliberately diverges it -- a page reads
// coherently by default, and only splits where a preference was actually
// expressed.
//
// The witness footnotes are deliberately NOT a region. Their size against
// the body is the BIP141 weight discount set in type (a quarter of the
// page-room per letter -- see the book page's .footnote-entry rule), so it
// is notation, not preference: they size from --scale-body and hold the
// ratio at every scale the reader chooses.
//
// The scales live in --scale-body / --scale-sigla / --scale-margins /
// --scale-notation / --scale-commentary on <html>, always written as
// effective values (a region that follows the body carries the body's
// number), so stylesheets opt sizes in with a plain
// calc(Npx * var(--scale-<region>, 1)) and a page that never loads this
// module simply reads at 100%. The sigla are the one region set INSIDE
// another's text rather than in a place of its own, so the module also
// writes --scale-sigla-ratio -- the sigla scale over the body scale -- and
// the glyph rules multiply 1em by it: at 100% the marks sit flush with the
// prose around them, and a diverged sigla scale means "the size the glyphs
// would have if the body read at that scale", wherever they appear.
// Importing the module applies the saved scales before first paint; the
// choices persist in localStorage alongside the reader's other preferences.

export const REGIONS = ['body', 'sigla', 'margins', 'notation', 'commentary'];
export const FONT_SCALE_MIN = 0.7;    // 19px prose reads at ~13px
export const FONT_SCALE_MAX = 1.6;    // ...and at ~30px
export const FONT_SCALE_STEP = 0.1;   // the settings buttons' stride

const KEY = 'glossia-btc-font-scales';
const LEGACY_KEY = 'glossia-btc-font-scale';   // the one-number predecessor

// Clamp to range and snap to two decimals -- the pinch gesture quantizes
// finer than the buttons' stride, and float noise must not reach the CSS.
const normalize = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  return Math.round(Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, n)) * 100) / 100;
};

// body always holds a number; the other regions hold a number when diverged,
// null while they follow the body.
const scales = { body: 1, sigla: null, margins: null, notation: null, commentary: null };

(() => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    if (stored && typeof stored === 'object') {
      for (const r of REGIONS) if (stored[r] != null) scales[r] = normalize(stored[r]);
    } else {
      // A reader who set the single scale meant the whole page: adopt it as
      // the body (the rest follow), and retire the old key.
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy != null) { scales.body = normalize(legacy); localStorage.removeItem(LEGACY_KEY); }
    }
  } catch { /* no storage / bad JSON: read at 100% */ }
})();

const apply = () => {
  const s = document.documentElement.style;
  const allDefault = scales.body === 1 && REGIONS.every((r) => scales[r] == null || scales[r] === 1);
  for (const r of REGIONS) {
    const v = scales[r] ?? scales.body;
    if (allDefault) s.removeProperty(`--scale-${r}`);
    else s.setProperty(`--scale-${r}`, String(v));
  }
  // The sigla ride inside the body's text, so their rules size in em: write
  // the ratio the ems multiply by. 1 (removed) while the sigla follow along.
  const ratio = Math.round(((scales.sigla ?? scales.body) / scales.body) * 10000) / 10000;
  if (ratio === 1) s.removeProperty('--scale-sigla-ratio');
  else s.setProperty('--scale-sigla-ratio', String(ratio));
};

const persist = () => {
  try {
    const out = {};
    for (const r of REGIONS) if (scales[r] != null) out[r] = scales[r];
    if (scales.body === 1 && REGIONS.every((r) => r === 'body' || scales[r] == null)) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(out));
  } catch { /* no storage: the sizes still hold for this visit */ }
};

// The effective scale of a region: its own number, or the body's while it
// follows along.
export function fontScale(region = 'body') {
  return scales[region] ?? scales.body;
}

// Whether a region has been deliberately split from the body.
export function fontScaleDiverged(region) { return region !== 'body' && scales[region] != null; }

// Set a region's scale (diverging it from the body if it wasn't already),
// apply, persist; returns the normalized value actually applied.
export function setFontScale(region, v) {
  scales[region] = normalize(v);
  apply();
  persist();
  return scales[region];
}

// Back to one coherent page: every region follows the body again, at 100%.
export function resetFontScales() {
  scales.body = 1;
  for (const r of REGIONS) if (r !== 'body') scales[r] = null;
  apply();
  persist();
}

apply();
