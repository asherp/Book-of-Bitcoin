// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/editorial.mjs — the editorial layer, off disk, for the tools that run
// in Node: the deploy's pre-renderer, the reply bot, and their tests.
//
// The browser fetches web/notables.yaml and web/commentary/*.md over HTTP; a
// tool reads the same files from the working tree. Same parser, same
// normalizer, same rules about what an entry means (web/btc-notables.js) — so
// a curated title or a reading can never mean one thing on the site and
// another in a reply.
//
// Load once at start-up, then read notables() / places() synchronously, exactly
// as a page does.

import { readFile } from 'node:fs/promises';
import { loadNotables } from '../web/btc-notables.js';

const WEB = new URL('../web/', import.meta.url);

// The reader btc-notables.js and btc-commentary.js take: a path relative to
// web/ ('notables.yaml', 'commentary/pizza-day.md') to its contents.
export const readEditorial = (path) => readFile(new URL(path, WEB), 'utf8');

export const loadEditorial = () => loadNotables({ read: readEditorial });
