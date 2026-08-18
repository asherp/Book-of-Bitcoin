// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/ledger-address.test.mjs — the rule the ledger kept badly
// (web/bitcoin-ledger.html).
//
// A member of a ledger is a locking script, and this book prints a locking
// script as prose. The base58/bech32 form is the machine's spelling of the
// same bytes, so it is never set in type — but it is the form every wallet
// and explorer wants pasted into it, so it has to travel some other way. It
// travels by the copy menu the passage itself raises.
//
// The page had three places that printed the raw form instead: the passage
// leaf's engine-absent fallback, the entry card's `address` row, and the name
// an untitled ledger took. All three are static wiring in one large document
// with no module seam to import, so these are static assertions over its
// source — the stance unconfirmed-door.test.mjs takes, and for the same
// reason: every way this can break is silent. A fallback that starts printing
// an address again still renders. A row that loses its menu still shows a
// figure. Neither throws.
//
//   node --test tools/ledger-address.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const ledger = await readFile(new URL('../web/bitcoin-ledger.html', import.meta.url), 'utf8');

test('no member is ever set in type, whole or shortened', () => {
  // The shortener that served all three sites. Its absence is the invariant:
  // there is no other way to print half an address, and a whole one is worse.
  assert.doesNotMatch(ledger, /shortAddr/, 'no address shortener survives');
  // The passage leaf's title stays empty — the passage below is its title —
  // so an address can no longer be pushed into it when the engine is missing.
  assert.doesNotMatch(ledger, /anth-title'\)\.textContent = (?:addr|shortAddr)/,
    'the leaf title is never an address');
  // A ledger with no name of its own is named by what it is, not by the
  // member it starts with.
  assert.doesNotMatch(ledger, /const untitled = \(l\) => l\.addresses\[0\]/,
    'an untitled ledger is not named by its first member');
  assert.match(ledger, /const untitled = \(l\) => \(l\.addresses\.length > 1/,
    'it is named by what it holds');
});

test('the passage is the handle, and it declines rather than guesses', () => {
  // Prose where the engine can say it, the mark where it cannot — and the
  // handle on the slot either way, so the value is one click from the reader
  // whether or not this build can read the bytes aloud.
  assert.match(ledger, /if \(html\) prose\.innerHTML = html;\s*\n\s*else prose\.replaceChildren\(unsaidMark\(\)\);/,
    'the mark stands in for prose the engine cannot say');
  assert.match(ledger, /attachMemberMenu\(prose, addr\);/, 'and the prose carries the menu');
  // The mark says what it is standing in for, and never the bytes themselves.
  assert.match(ledger, /const UNSAID_SCRIPT = 'a locking script, said in prose or not at all/,
    'the claim rides in the hover');
  assert.match(ledger, /mark\.textContent = '…';/, 'the mark is the book’s own ellipsis');
});

test('the menu offers the traditional form, and the bytes behind it', () => {
  assert.match(ledger, /data-act="copy-address"[^>]*>Copy address</,
    'the address is offered in the form a wallet takes');
  assert.match(ledger, /data-act="copy-script"[^>]*>Copy script</,
    'and the script it stands for');
  // A member the book holds as raw script bytes has no address form at all,
  // so the item stands down rather than offering an empty string.
  assert.match(ledger, /const addressed = isAddress\(member\);/, 'which form exists is asked, not assumed');
  assert.match(ledger, /menuAddrBtn\.classList\.toggle\('hidden', !addressed\);/,
    'a nonstandard script offers no address');
  assert.match(ledger, /menuScriptBtn\.classList\.toggle\('hidden', !memberScriptHex\(member\)\);/,
    'and a member with no script offers no script');
});

test('a click that ended a selection is not a click on the handle', () => {
  // A paragraph cannot swallow the gesture that selects it: a reader dragging
  // across the prose to copy a phrase must not be handed a menu instead.
  assert.match(ledger, /if \(ev\.type === 'click' && sel && !sel\.isCollapsed\) return;/,
    'a selection opens nothing');
  assert.match(ledger, /el\.addEventListener\('keydown', \(ev\) => \{\s*\n\s*if \(ev\.key === 'Enter' \|\| ev\.key === ' '\)/,
    'and the handle is reachable from the keyboard');
});

test('the handle belongs to the leaf, and does not follow the reader off it', () => {
  // The prose element is the leaf's, not the passage's: what it is ABOUT
  // changes under it as the reader turns. A handle still offering the last
  // passage's address would be worse than no handle.
  assert.match(ledger, /detachMemberMenu\(prose\);/, 'the handle goes with the prose it was on');
  assert.match(ledger, /closeCopyMenu\(\);\s+\/\/ a menu about the leaf just left/,
    'and an open menu closes with it');
  // Wired once, re-pointed on every turn: the listeners outlive the member.
  assert.match(ledger, /if \(el\.__menuWired\) return;/, 'listeners are wired exactly once');
  assert.match(ledger, /el\.__member = null;/, 'and a null member makes them inert');
});

test('the entry card names which passage, without naming it by its bytes', () => {
  // An index carries no entropy, names the passage exactly, and is the very
  // number the leaf's own pager turns by — so it can be set as a figure where
  // the address cannot.
  assert.match(ledger, /const which = cur\(\)\.addresses\.indexOf\(entryAddr\);/,
    'the member is found by its place in the ledger');
  assert.match(ledger, /row\('passage', which < 0 \? '—'/,
    'the row is a passage number, and declines when there is none');
  assert.match(ledger, /if \(which >= 0\) attachMemberMenu\(vEl, entryAddr\);/,
    'and the address is still one click away');
});
