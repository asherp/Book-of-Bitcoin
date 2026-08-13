// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/hash-menu.test.mjs — the copy item says what comes back.
//
//   node --test tools/hash-menu.test.mjs
//
// Every hash on a chapter opens the same menu, and its first item used to be
// called "Copy hex" for all ten things the menu is attached to. That names the
// encoding, which is the one thing about a copied value nobody needs told, and
// leaves the reader to find out what they are holding by pasting it somewhere.
// Three of the labels make it worse than vague: an output's menu and a
// witness's both carry their TRANSACTION's id, so a reader who read the head
// ("output") and the item ("Copy hex") had two true words and no way to guess
// they were about to hold a txid.
//
// Source-level, because the menu is an inline module in bitcoin-book.html and
// the page needs the WASM engine to draw a chapter at all — the same way the
// search leaf is checked in chain-witness.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { reference, inputMark, parseReference } from '../web/btc-citation.js';

const bookPage = () => readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');

// The menu's own decision, lifted out of the page and run. These few functions
// are pure -- a label and a chapter's state in, an item name and a string out --
// so they can be exercised for real rather than matched as text, which is the
// difference between checking that the page says something and checking that
// it does it. Everything they touch beyond `state` is imported above, from the
// same module the page imports it from.
async function menuLogic(state) {
  const page = await bookPage();
  const grab = (re) => {
    const m = re.exec(page);
    assert.ok(m, `the page no longer holds ${re}`);
    return m[0];
  };
  const src = [
    grab(/const COPIES = \{[\s\S]*?\n\};/),
    grab(/const copyItem = [^\n]*\n/),
    grab(/const REFERENCED = new Set\([^\n]*\n/),
    grab(/function entryPlacement\(entry\) \{[\s\S]*?\n\}/),
    grab(/function entryRef\(entry\) \{[\s\S]*?\n\}/),
    grab(/function menuCopy\(entry\) \{[\s\S]*?\n\}/),
  ].join('\n');
  return Function('state', 'reference', 'inputMark',
    `${src}\nreturn { menuCopy, entryRef };`)(state, reference, inputMark);
}

// §2053 of ■1749, which is IV β68 — a settled chapter, and a draft of the same.
const SETTLED = { height: 766820, index: 2052, projected: false };
const DRAFT = { height: 766820, index: 2052, projected: true };
const TXID = 'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255';

// The table as the page actually holds it, read out of the source rather than
// copied here: a test that kept its own copy would pass while the page said
// something else.
async function copiesTable() {
  const page = await bookPage();
  const literal = /const COPIES = (\{[\s\S]*?\n\});/.exec(page);
  assert.ok(literal, 'the page no longer names its copy items');
  return Function(`return ${literal[1]}`)();
}

// Every label the hash menu is ever opened with. Two shapes reach it: a literal
// third argument to attachHashCopy, and an entry object built by hand (a header
// field's { menu }, the locking script's). Lowercase only — a menu label is a
// phrase the head prints, and the page's other `label:` fields name proper
// things (Blockstream, mempool.space, USD) or whole sentences.
async function menuLabels() {
  const page = await bookPage();
  return new Set([
    ...[...page.matchAll(/attachHashCopy\([^;]*?,\s*'([a-z ]+)'/g)].map((m) => m[1]),
    ...[...page.matchAll(/\blabel:\s*'([a-z][a-z ]*)'/g)].map((m) => m[1]),
  ]);
}

test('every hash the menu opens on has a copy item that names its value', async () => {
  const labels = await menuLabels();
  // Pinned, so a new hash added to a chapter has to decide what its copy item
  // says rather than inheriting "Copy hex" by silence.
  assert.deepEqual([...labels].sort(), [
    'block hash', 'block version', 'difficulty target', 'locking script',
    'merkle root', 'nonce', 'output', 'previous block hash', 'script sig',
    'transaction id', 'witness',
  ]);
  const COPIES = await copiesTable();
  // The four whose hex is a transaction id, whatever their head says. Three of
  // them only fall back to it -- see the reference test below -- but a draft
  // section has no settled citation, and the fallback has to be honest there.
  for (const label of ['transaction id', 'output', 'witness', 'script sig']) {
    assert.equal(COPIES[label], 'Copy transaction id', `${label} carries a txid`);
  }
  // …and the two that carry a block hash, under two different heads.
  assert.equal(COPIES['block hash'], 'Copy block hash');
  assert.equal(COPIES['previous block hash'], 'Copy block hash');
  assert.equal(COPIES['merkle root'], 'Copy merkle root');
  assert.equal(COPIES['locking script'], 'Copy script');
  // The header's four-byte fields keep the old name. They name no place, can be
  // looked up nowhere, and hex is the truest thing to call them — which is what
  // makes the fallback a reading and not an oversight.
  for (const label of ['block version', 'difficulty target', 'nonce']) {
    assert.equal(COPIES[label], undefined, `${label} is hex and nothing else`);
  }
  // Nothing in the table that no menu opens with.
  for (const label of Object.keys(COPIES)) {
    assert.ok(labels.has(label), `COPIES names ${label}, which no menu carries`);
  }
});

test('the menu asks the table, and the fallback is the old name', async () => {
  const page = await bookPage();
  assert.match(page, /const copyItem = \(label\) => COPIES\[label\] \|\| 'Copy hex';/);
  assert.match(page, /menuCopyBtn\.textContent = tr\(copy\.item\);/,
    'the menu still names its item from the entry it was opened with');
  // One function decides both, so the name on the button and the string in the
  // clipboard cannot drift apart -- which is the failure the whole change is
  // about, one level up.
  assert.match(page, /navigator\.clipboard\.writeText\(menuCopy\(menuEntry\)\.text\)/);
  assert.match(page, /return ref \? \{ item: 'Copy reference', text: ref \}\s*\n\s*: \{ item: copyItem\(entry\.label\), text: entry\.hex \};/);
});

test('a part of a section is named by its citation, not by the whole', async () => {
  // An output, a witness and a scriptSig are PARTS: no chain identifier reaches
  // them, and the txid their menus carry names the transaction they sit in --
  // so a reader who copied it out of an output got a string that opens the
  // section they were already reading. The citation scheme spells all three,
  // the search box takes it, and ?ref= lands on the line it names.
  const { menuCopy } = await menuLogic(SETTLED);
  assert.deepEqual(menuCopy({ label: 'output', hex: TXID, vout: 0 }),
    { item: 'Copy reference', text: 'IV β68 ■1749 §2053.0' });
  assert.deepEqual(menuCopy({ label: 'witness', hex: TXID, vin: 2, wn: 3 }),
    { item: 'Copy reference', text: 'IV β68 ■1749 §2053.c' });
  assert.deepEqual(menuCopy({ label: 'script sig', hex: TXID, vin: 0, wn: 1 }),
    { item: 'Copy reference', text: 'IV β68 ■1749 §2053.A' });
  // Lowercase and uppercase are the same input's letter under two carriages,
  // which is the whole of the scheme's distinction between them.
  assert.equal(menuCopy({ label: 'witness', hex: TXID, vin: 2, wn: 3 }).text.slice(-1), 'c');
  assert.equal(menuCopy({ label: 'script sig', hex: TXID, vin: 2, wn: 3 }).text.slice(-1), 'C');

  // A transaction is not a part, and keeps its id: a txid is what a transaction
  // is called everywhere outside this book, and the section's own reference is
  // one item down as the link. Nor is a chapter, nor a header field.
  for (const [entry, expected] of [
    [{ label: 'transaction id', hex: TXID }, { item: 'Copy transaction id', text: TXID }],
    [{ label: 'block hash', hex: '00'.repeat(32) }, { item: 'Copy block hash', text: '00'.repeat(32) }],
    [{ label: 'merkle root', hex: 'ab'.repeat(32) }, { item: 'Copy merkle root', text: 'ab'.repeat(32) }],
    [{ label: 'nonce', hex: 'deadbeef' }, { item: 'Copy hex', text: 'deadbeef' }],
  ]) assert.deepEqual(menuCopy(entry), expected, entry.label);
});

test('a draft has no settled citation, and the fallback says what it hands back', async () => {
  // The reference is not a promise the page can always keep: a projected
  // section's seat moves until the block is mined, so entryPlacement refuses
  // it. An item still reading "Copy reference" over a txid would be the exact
  // failure this whole change is about, one level down.
  const { menuCopy, entryRef } = await menuLogic(DRAFT);
  for (const entry of [{ label: 'output', hex: TXID, vout: 0 },
    { label: 'witness', hex: TXID, vin: 0, wn: 1 },
    { label: 'script sig', hex: TXID, vin: 0, wn: 1 }]) {
    assert.equal(entryRef(entry), null, `${entry.label} has no place to cite yet`);
    assert.deepEqual(menuCopy(entry), { item: 'Copy transaction id', text: TXID }, entry.label);
  }
});

test('the citation and the link name one place', async () => {
  const page = await bookPage();
  // Both are spelled off the same entryPlacement, in the book's hand and in
  // latin — so `sig` has to reach the link too, or a scriptSig's link would
  // open the witness that shares its input number.
  assert.match(page, /function entryRef\(entry\) \{\s*\n\s*const place = entryPlacement\(entry\);/);
  assert.match(page, /latinRefOf\(place\.height, [^)]*place\.wn \?\? null, Boolean\(place\.sig\)\)/);
  // …and it round-trips through the one parser every page reads a citation with.
  const { menuCopy } = await menuLogic(SETTLED);
  const cited = menuCopy({ label: 'script sig', hex: TXID, vin: 0, wn: 1 }).text;
  assert.deepEqual(parseReference(cited),
    parseReference('v4b68c1749s2053wA'), 'the two spellings are one place');
  assert.equal(parseReference(cited).sig, true, 'and it is read back as a scriptSig');

  // A witness's readable form IS its citation, so with the reference above it
  // Copy text would offer the same string twice.
  assert.match(page, /menuCopyTextBtn\.classList\.toggle\('hidden', !entry\.prose \|\| entry\.prose === copy\.text\);/);
});

test('a scriptSig input carries the mark the scheme always gave it', async () => {
  // Uppercase says scriptSig, lowercase says witness -- the scheme's one
  // distinction between the two carriages, and it round-trips.
  assert.equal(inputMark(3, true), 'C');
  assert.equal(inputMark(3), 'c');
  const sig = parseReference('IV β68 ■1749 §2053.A');
  assert.equal(sig.wit, 1);
  assert.equal(sig.sig, true, 'a raised capital reads back as a scriptSig');
  assert.equal(parseReference('IV β68 ■1749 §2053.a').sig, false);

  const page = await bookPage();
  // It had never been printed, so a reader could not cite the input they were
  // looking at. Now it is set beside the citation exactly where a witness's
  // letter sits — and on every input that spent with a scriptSig, footnote or
  // no. An input can carry both: a wrapped segwit spend pushes its redeem
  // script in the scriptSig and brings the arguments in the witness, which is
  // two things in two places, and the scheme letters them by case for exactly
  // that. `if`, not `else if` — the two carriages do not exclude each other.
  assert.match(page, /\n    if \(inp\.scriptAscii \|\| inp\.script\) \{\s*\n\s*const m = sigRef\(inputIndex\);/,
    'a scriptSig raises its mark whether or not the input also raised a footnote');
  assert.match(page, /attachHashCopy\(m, para\.txid, 'script sig',/);
  assert.match(page, /s\.textContent = inputMark\(n, true\);/, 'and it is the scheme’s own letter');
  // Not a link: a witness's mark leads to its footnote, a scriptSig is on the
  // line beneath its own mark.
  const sigRefFn = /const sigRef = \(n\) => \{[\s\S]*?\n  \};/.exec(page)[0];
  assert.ok(!/createElement\('a'\)|\.href/.test(sigRefFn), 'the scriptSig mark points at nothing');
  assert.match(page, /\.tx-sig-ref \{/, 'and it is raised the way its neighbour is');
});

test('a chrome string carried in one language is carried in all of them', async () => {
  const strings = await readFile(new URL('../web/btc-strings.js', import.meta.url), 'utf8');
  const COPIES = await copiesTable();
  // English is the source and the fallback, so a missing key is never a broken
  // page — but these three items sit in one menu, and one of them dropping into
  // English beside two translated neighbours reads as a bug to everyone who
  // sees it. The tables that carry 'Copy hex' carry the rest.
  const tables = [...strings.matchAll(/^  (\w+): \{$/gm)].map((m) => m[1]);
  assert.ok(tables.length >= 2, 'the chrome has no language tables to check');
  for (const table of tables) {
    const body = strings.split(`  ${table}: {`)[1].split('\n  },')[0];
    if (!body.includes("'Copy hex'")) continue;      // a table that has not reached the menu yet
    for (const item of new Set(Object.values(COPIES))) {
      assert.ok(body.includes(`'${item}':`), `${table} carries 'Copy hex' but not '${item}'`);
    }
  }
});

test('a script is its own handle, and it does not eat the selection', async () => {
  const page = await bookPage();
  // The reader's report: to copy a locking script you first had to bookmark it,
  // then click the bookmark's title. syncScriptKeeps prints a NAME line, and it
  // prints one only for a script the reader has kept or a shelf has curated —
  // so an ordinary output had nothing to click. The bytes were there from the
  // first paint; only the affordance was conditional on a keep.
  assert.match(page, /attachBodyMenu\(scriptCell, \(\) => scriptEntry\(outKeep\), 'locking script/);
  assert.match(page, /attachBodyMenu\(scriptCell, \(\) => sigMark\.__hashMenu, 'scriptSig/);
  assert.match(page, /attachBodyMenu\(p, \(\) => markEl\.__hashMenu, 'witness/);

  const body = /function attachBodyMenu\(el, entryOf, said\) \{[\s\S]*?\n\}/.exec(page);
  assert.ok(body, 'the body handle is gone');
  // Prose is selected, not just clicked. Every mark handle swallows mousedown
  // to stop the browser scrolling it into view; a paragraph that did the same
  // would take the page's own text away from the reader.
  assert.ok(!/mousedown/.test(body[0]), 'a body handle must not swallow mousedown');

  // …and the guard, run rather than read. A stub element collects the wired
  // listeners, a stub selection says whether the reader had one, and what is
  // counted is how often the menu opened.
  const fire = ({ collapsed, entry }, type, ev) => {
    const opened = [];
    const wired = {};
    const el = { addEventListener: (t, f) => { wired[t] = f; }, setAttribute() {} };
    const doc = { getSelection: () => ({ isCollapsed: collapsed }) };
    Function('el', 'document', 'openHashMenu', 'entryOf', 'said',
      `${body[0]}\nattachBodyMenu(el, entryOf, said);`)(
      el, doc, (e, got) => opened.push(got), () => entry, 'a script — click for menu');
    assert.equal(el.tabIndex, 0, 'a handle a keyboard cannot reach is not a handle');
    wired[type](ev);
    return opened.length;
  };
  const CLICK = { type: 'click' };
  const ENTER = { type: 'keydown', key: 'Enter', preventDefault() {} };
  const entry = { label: 'witness' };
  assert.equal(fire({ collapsed: true, entry }, 'click', CLICK), 1, 'a plain click opens it');
  assert.equal(fire({ collapsed: false, entry }, 'click', CLICK), 0,
    'a click that ended a selection was the reader taking the text, not the menu');
  assert.equal(fire({ collapsed: false, entry }, 'keydown', ENTER), 1,
    'the keyboard has no selection to protect');
  assert.equal(fire({ collapsed: true, entry: null }, 'click', CLICK), 0,
    'an entry that has not arrived opens nothing');
  assert.equal(fire({ collapsed: true, entry }, 'keydown',
    { type: 'keydown', key: 'x', preventDefault() {} }), 0, 'and no other key opens it');

  // The keep line and the body build their entry the same way, so the two
  // cannot drift — and the entry survives an output with no address at all.
  assert.match(page, /const entry = scriptEntry\(el\);/, 'the keep line asks the same builder');
  const builder = /function scriptEntry\(keepEl\) \{[\s\S]*?\n\}/.exec(page)[0];
  assert.match(builder, /if \(!hex\) return null;/, 'no bytes, no menu');
  assert.match(builder, /ledgerHref: address\s*\n?\s*\?/,
    'an OP_RETURN has no ledger road, and still has a script to copy');
});

test('the letter’s case picks which of an input’s two carriages is meant', async () => {
  const page = await bookPage();
  // A wrapped segwit input carries a scriptSig AND a witness: the scriptSig
  // pushes the redeem script on its own line, the witness brings the arguments
  // down in the foot. §n.A is the first, §n.a the second, and nothing but the
  // case distinguishes them -- so a landing that looked at what the section
  // held rather than at the mark it was given sent every §n.A on such an input
  // past the scriptSig it named.
  const land = /async function landOnWitness\(raw\) \{[\s\S]*?\n\}/.exec(page);
  assert.ok(land, 'the landing is gone');

  // Run it: a page holding a footnote for input 1, asked for both marks.
  const scrolled = [];
  const el = (id) => ({ id, scrollIntoView: () => scrolled.push(id) });
  const found = new Map([['fn-a', el('fn-a')], ['in-0', el('in-0')]]);
  const { footnoteMark, footnoteIndexOf } = await import('../web/btc-citation.js');
  const go = (raw) => {
    scrolled.length = 0;
    return Function('$', 'footnoteMark', 'footnoteIndexOf', 'currentFootnotes',
      'footnoteStub', 'renderFootnotes', 'renderGen',
      `${land[0]}\nreturn landOnWitness(${JSON.stringify(raw)});`)(
      (id) => found.get(id) ?? null, footnoteMark, footnoteIndexOf,
      [{ n: 1, vin: 0 }], () => {}, async () => {}, 0).then(() => scrolled[0] ?? null);
  };
  assert.equal(await go('a'), 'fn-a', 'the lowercase letter is the witness, in the foot');
  assert.equal(await go('A'), 'in-0', 'the raised capital is the scriptSig, on its own line');
  // An input with no footnote lands on itself either way -- there is only one
  // thing there to land on.
  found.delete('fn-a');
  assert.equal(await go('a'), 'in-0');
  assert.equal(await go('A'), 'in-0');
  // A bare number is the input and not one of its carriages, so it keeps the
  // old reading: whatever that input put on the page.
  found.set('fn-a', el('fn-a'));
  assert.equal(await go('0'), 'fn-a');

  // …and the case has to survive the trip. ?ref= parses the letter into a
  // number plus `sig`, so the mark is written back out cased rather than
  // through footnoteMark, which is always lowercase.
  assert.match(page, /await landOnWitness\(inputMark\(pWit, Boolean\(pParam\.sig\)\)\);/);
});
