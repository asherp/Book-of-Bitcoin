// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/image.mjs — render a passage page (quote.mjs's
// passageHtml) to a PNG, via headless Chromium under Playwright.
//
// Playwright is the bot's one OPTIONAL dependency (`npm install` in this
// directory), needed only for the overflow path — a verse too long for the
// tweet, rendered as an attached image instead. When it isn't installed,
// loadRenderer() returns null and the bot posts the ellipsized text alone;
// nothing else degrades.
//
// The screenshot is of the .card element at deviceScaleFactor 2 (2400px
// wide), so the serif reads crisply in X's timeline.

import { existsSync } from 'node:fs';

// Chromium binaries that stand in when Playwright's own download isn't
// present (a pinned system browser, a CI image): the CHROMIUM_PATH
// environment variable first, then the common preinstalled location.
const FALLBACK_CHROMIUM = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium'].filter(Boolean);

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

// Returns { render(html) -> Buffer, close() }, or null when Playwright (or
// a Chromium it can drive) is unavailable. One browser serves the whole
// pass; call close() when done.
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
    async render(html) {
      const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
      try {
        await page.setContent(html, { waitUntil: 'load' });
        return await page.locator('.card').screenshot({ type: 'png' });
      } finally {
        await page.close();
      }
    },
    close: () => browser.close(),
  };
}
