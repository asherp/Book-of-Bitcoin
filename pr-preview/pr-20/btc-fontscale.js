// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-fontscale.js — the reader's type size, one number shared by every page
// that sets text in the book's reading voice. The scale multiplies the
// reading matter only -- the prose, its marginalia, the witness footnotes,
// and the notation key (notation.css reads the same variable) -- never the
// chrome around it, so the page's controls hold still while the text grows.
//
// The scale lives in --font-scale on <html>; stylesheets opt sizes in with
// calc(Npx * var(--font-scale, 1)), so a page that never loads this module
// simply reads at 100%. Importing the module applies the saved scale before
// first paint (modules run before rendering the content below them), and the
// choice persists in localStorage alongside the reader's other preferences.

export const FONT_SCALE_MIN = 0.7;    // 19px prose reads at ~13px
export const FONT_SCALE_MAX = 1.6;    // ...and at ~30px
export const FONT_SCALE_STEP = 0.1;   // the settings buttons' stride

const KEY = 'glossia-btc-font-scale';

// Clamp to range and snap to two decimals -- the pinch gesture quantizes
// finer than the buttons' stride, and float noise must not reach the CSS.
const normalize = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  return Math.round(Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, n)) * 100) / 100;
};

let scale = (() => {
  try { return normalize(localStorage.getItem(KEY) ?? 1); } catch { return 1; }
})();

const apply = () => {
  if (scale === 1) document.documentElement.style.removeProperty('--font-scale');
  else document.documentElement.style.setProperty('--font-scale', String(scale));
};

export function fontScale() { return scale; }

// Set, apply, persist; returns the normalized value actually applied.
export function setFontScale(v) {
  scale = normalize(v);
  apply();
  try {
    if (scale === 1) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(scale));
  } catch { /* no storage: the size still holds for this visit */ }
  return scale;
}

apply();
