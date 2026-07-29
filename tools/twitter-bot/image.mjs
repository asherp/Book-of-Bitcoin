// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/image.mjs — render a passage page (quote.mjs's
// passageHtml) to a PNG of a fixed size, via headless Chromium under
// Playwright.
//
// The page is set from a single root font size (every measure in
// passageHtml is an em off it), so fitting a passage to the image is a
// search on that one number: binary-search the largest size at which the
// whole passage still fits the page, and render there. A short passage
// therefore comes out set large and airy; a long one set small and dense;
// and one too long even at the floor keeps the floor and shows its opening
// — the top of the page — with the colophon still pinned beneath it, which
// is what the .content clip in passageHtml is for.
//
// Playwright is the bot's one OPTIONAL dependency (`npm install` in this
// directory), needed only for the overflow path. When it isn't installed,
// loadRenderer() returns null and the bot posts the ellipsized text alone;
// nothing else degrades.
//
// The screenshot is taken at deviceScaleFactor 2, so the serif reads
// crisply in X's timeline.

import { existsSync } from 'node:fs';

import { passageHtml, PAGE_WIDTH, PAGE_HEIGHT, FONT_MIN, FONT_MAX } from './quote.mjs';

// Chromium binaries that stand in when Playwright's own download isn't
// present (a pinned system browser, a CI image): the CHROMIUM_PATH
// environment variable first, then the common preinstalled location.
const FALLBACK_CHROMIUM = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);

// Enough passes to land within ~0.05px on the [8, 30] range — the search
// is over a continuous size, so this is precision, not iteration count.
const FIT_PASSES = 9;

async function launch(pw) {
  try {
    return await pw.chromium.launch();
  } catch (e) {
    for (const path of FALLBACK_CHROMIUM) {
      if (existsSync(path)) {
        try { return await pw.chromium.launch({ executablePath: path }); } catch { /* next */ }
      }
    }
    throw e;
  }
}

// Does the passage fit the page at this root size? Measured on the
// clipping element, so it answers the same question the render will.
const FITS = `(() => {
  const c = document.getElementById('content');
  return c.scrollHeight <= c.clientHeight;
})()`;

// Returns { render(passage, opts) -> Buffer, close() }, or null when
// Playwright (or a Chromium it can drive) is unavailable. One browser and
// one page serve the whole pass; call close() when done.
export async function loadRenderer() {
  let pw;
  try { pw = await import('playwright'); }
  catch {
    try { pw = await import('playwright-core'); }
    catch { return null; }
  }

  let browser;
  try { browser = await launch(pw); }
  catch { return null; }

  return {
    // `passage` is composeReply's passage object; `site` the book's origin.
    // Returns { png, fontSize, fitted }: the image sized exactly
    // width × height (times the device scale), the root size it was set
    // from, and whether the whole passage fitted (false means the page
    // shows its opening and the rest is clipped). `fontSize`, if given,
    // skips the search — the tests use it to render deterministically.
    async render(passage, { site, width = PAGE_WIDTH, height = PAGE_HEIGHT, fontSize = null } = {}) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
      try {
        const setAt = async (size, clipped = false) => {
          await page.setContent(passageHtml({ ...passage, site, fontSize: size, width, height, clipped }),
            { waitUntil: 'load' });
        };

        let size = fontSize;
        if (size === null) {
          // Binary search the largest root size that still fits. If even
          // the floor overflows, the floor is what we keep: the passage is
          // clipped to its opening rather than set unreadably small.
          let lo = FONT_MIN, hi = FONT_MAX;
          await setAt(hi);
          if (await page.evaluate(FITS)) {
            lo = hi;
          } else {
            for (let i = 0; i < FIT_PASSES; i++) {
              const mid = (lo + hi) / 2;
              await setAt(mid);
              if (await page.evaluate(FITS)) lo = mid; else hi = mid;
            }
          }
          size = lo;
          if (size !== FONT_MAX) await setAt(size);      // settle on the size we chose
        } else {
          await setAt(size);
        }

        // A passage that overflows even the floor is shown from its
        // opening; re-set it with the continues mark so the page says so
        // rather than stopping mid-word.
        const fitted = await page.evaluate(FITS);
        if (!fitted) await setAt(size, true);

        const png = await page.locator('.page').screenshot({ type: 'png' });
        return { png, fontSize: size, fitted };
      } finally {
        await page.close();
      }
    },
    close: () => browser.close(),
  };
}
