// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/chain-witness.test.mjs — the check that keeps the book honest about a
// script it derived.
//
//   node --test tools/chain-witness.test.mjs
//
// addressScriptHex turns an address into a scriptPubKey by arithmetic, and the
// search leaf then shows that script reduced from a term. Both roads start at
// the same decode, so agreeing with each other proves nothing: the page has to
// ask the chain for an output that really carries the bytes. What is testable
// without a network is the reading of the answer -- which record on a page, and
// where on that record the script is -- and the four verdicts, which must stay
// distinct: an unreachable chain has not said yes.

import test from 'node:test';
import assert from 'node:assert/strict';

import { footnoteMark, inputMark, parseReference, FOOTNOTE_BASE } from '../web/btc-citation.js';
import { latinReference } from '../web/btc-citation.js';
import { readWitness, witnessVerdict, witnessDisagreement, suppliedBy,
         citeHref, inputMarkOf, spendArgsOf } from '../web/btc-index.js';

const ADDR = '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv';
const SPK = '76a91404b11d2eb716291f33be29210ee5b2a161c071af88ac';
const paid = (height, txid, extraOuts = 0) => ({
  txid, status: { confirmed: true, block_height: height },
  vout: [...Array(extraOuts).fill({ scriptpubkey: 'ff', scriptpubkey_address: 'someone-else' }),
    { scriptpubkey: SPK, scriptpubkey_address: ADDR }],
  vin: [],
});

test('the oldest record on a newest-first page is the one read', () => {
  // esplora returns newest first, so the reference the page reaches back to is
  // its last record -- the earliest this one request can see.
  const page = [paid(800000, 'c'), paid(700000, 'b'), paid(600000, 'a')];
  const w = readWitness(page, ADDR);
  assert.equal(w.found, true);
  assert.equal(w.txid, 'a');
  assert.equal(w.height, 600000);
  assert.equal(w.script, SPK);
  assert.equal(w.out, 0);
});

test('a short page is the whole confirmed history, and says so', () => {
  // Fewer than a full page means esplora had no more to give, so the oldest
  // record on it really is the first reference -- the one claim worth making.
  assert.equal(readWitness([paid(600000, 'a')], ADDR).whole, true);
  const full = Array.from({ length: 25 }, (_, i) => paid(600000 + i, `t${i}`));
  assert.equal(readWitness(full, ADDR).whole, false, 'a full page may have more behind it');
});

test('the output index is the one that pays, not the first output', () => {
  const w = readWitness([paid(600000, 'a', 2)], ADDR);
  assert.equal(w.out, 2);
  assert.equal(w.script, SPK);
});

test('a record that only drew from the member answers with its prevout', () => {
  // Spending carries the same bytes: the prevout being consumed is the output
  // the chain wrote, so it is the chain's copy exactly as a payment is.
  const spendOnly = {
    txid: 'd', status: { confirmed: true, block_height: 650000 },
    vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }],
    vin: [{ prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } }],
  };
  const w = readWitness([spendOnly], ADDR);
  assert.equal(w.found, true);
  assert.equal(w.script, SPK);
  assert.equal(w.out, null, 'a spend cites no output of its own');
  assert.equal(w.outputs, 0);
  assert.equal(w.prevouts, 1);
});

test('unconfirmed records are not the chain saying anything', () => {
  const pending = { txid: 'p', status: { confirmed: false }, vout: [{ scriptpubkey: SPK, scriptpubkey_address: ADDR }], vin: [] };
  assert.deepEqual(readWitness([pending], ADDR),
    { found: false, whole: true, outputs: 0, prevouts: 0, scripts: [], opened: null, paired: false });
  assert.equal(readWitness([], ADDR).found, false);
  // A page whose records never touch the member (esplora would not serve one,
  // but a mirror is not a promise) reads as nothing found rather than as bytes.
  assert.equal(readWitness([paid(600000, 'a')], 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4').found, false);
});

test('a script member matches by its bytes, since it has no name to match by', () => {
  // The Mt. Gox void's shape: a member spelled as raw scriptPubKey hex, which
  // esplora prints no address beside.
  const odd = '76a90088ac';
  const page = [{
    txid: 'x', status: { confirmed: true, block_height: 71036 },
    vout: [{ scriptpubkey: odd }], vin: [],
  }];
  const w = readWitness(page, odd);
  assert.equal(w.found, true);
  assert.equal(w.script, odd);
});

test('every reference on the page is counted, not just the one cited', () => {
  // An address is a name for ONE script, so the check is not a sample: each
  // output paying it and each prevout its spends consumed must carry the same
  // bytes, and the page is already fetched, so all of them are read.
  const spend = (height, txid) => ({
    txid, status: { confirmed: true, block_height: height },
    vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }],
    vin: [{ prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } },
          { prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } }],
  });
  const w = readWitness([spend(800000, 'c'), paid(700000, 'b'), paid(600000, 'a')], ADDR);
  assert.equal(w.outputs, 2, 'two outputs pay it');
  assert.equal(w.prevouts, 2, 'and two spends drew from it');
  assert.deepEqual(w.scripts, [SPK], 'one script, everywhere it is named');
  assert.equal(w.txid, 'a', 'still cited at the earliest reference');
  assert.equal(witnessVerdict(SPK, w), 'agrees');
});

test('one odd output among many is a mismatch, which a sample would miss', () => {
  // The case the widening exists for: the cited reference agrees, and a later
  // one does not. Reading only the first would call this page clean.
  const ODD = '0014' + 'ab'.repeat(20);
  const wrong = {
    txid: 'z', status: { confirmed: true, block_height: 900000 },
    vout: [{ scriptpubkey: ODD, scriptpubkey_address: ADDR }], vin: [],
  };
  const w = readWitness([wrong, paid(600000, 'a')], ADDR);
  assert.equal(w.script, SPK, 'the earliest reference agrees on its own');
  assert.equal(w.scripts.length, 2, 'but the page holds two');
  assert.equal(witnessVerdict(SPK, w), 'differs');
  assert.equal(witnessDisagreement(SPK, w), ODD, 'and the leaf can name the one that does not');
});

test('the four verdicts stay apart, and silence is never assent', () => {
  assert.equal(witnessVerdict(SPK, { found: true, scripts: [SPK] }), 'agrees');
  assert.equal(witnessVerdict(SPK.toUpperCase(), { found: true, scripts: [SPK] }), 'agrees', 'case is not a difference');
  assert.equal(witnessVerdict(SPK, { found: true, scripts: ['0014' + 'ab'.repeat(20)] }), 'differs');
  assert.equal(witnessVerdict(SPK, { found: false }), 'absent', 'no output yet is not a mismatch');
  // The one that matters: a chain nobody could reach has not agreed.
  assert.equal(witnessVerdict(SPK, null), 'unreachable');
  assert.equal(witnessVerdict(SPK, undefined), 'unreachable');
});

// An input that draws from the member, naming the outpoint it eats the way
// esplora does: vin.txid and vin.vout are the output being opened, which is the
// one fact that can tie the lock rung to the spend rung.
const spend = (height, txid, at = 0, eats = { txid: 'pay', vout: 0 }) => ({
  txid, status: { confirmed: true, block_height: height },
  vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }],
  vin: [...Array(at).fill({ txid: 'other', vout: 0, prevout: { scriptpubkey: 'ff', scriptpubkey_address: 'nobody' } }),
    { ...eats, prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } }],
});

test('a lock is cited where it was written; its arguments where they were supplied', () => {
  // Two different questions with two different answers. The bytes of a lock are
  // a thing the chain can be asked for, so an output carrying them is a
  // citation. What satisfies that lock is not derivable from those bytes at
  // all -- s and p are not in the address, and no reduction reaches them -- so
  // the only way anyone knows them is that somebody supplied them, and where
  // they did is the only citation that half of the term can have.
  // Newest first, as esplora serves it: paid at 600000, opened at 700000.
  const w = readWitness([spend(700000, 'open', 2), paid(600000, 'pay')], ADDR);
  assert.equal(w.txid, 'pay', 'the lock is cited where it was written');
  assert.equal(w.height, 600000);
  assert.deepEqual(w.opened, { txid: 'open', height: 700000, in: 2, mark: { n: 3, sig: true }, items: [], args: [], scriptsig: null },
    'and its arguments where they were supplied, at the input that supplied them');
  // The first spend, not the last: a member opened twice is cited at the first.
  const twice = readWitness([spend(800000, 'later'), spend(700000, 'first'), paid(600000, 'pay')], ADDR);
  assert.equal(twice.opened.txid, 'first');
  assert.equal(twice.prevouts, 2, 'both are still counted');
  // Never opened is not the same as never written: a lock with no spend has a
  // citation for itself and none for its arguments, which is the ordinary
  // state of every unspent output on chain.
  assert.equal(readWitness([paid(600000, 'pay')], ADDR).opened, null);
});

test('the two citations name one outpoint: the output opened, and what opened it', () => {
  // The pair, and why it is chosen as one. A member paid twice holds the same
  // bytes at two outputs, and picking each rung on its own merit cited the
  // earlier output above the earliest input -- which had opened the OTHER one.
  // Two true claims that no reader could put together, and the leaf drew them
  // one under the other as though the second answered the first.
  const first = paid(600000, 'unspent');            // paid, and never opened
  const later = paid(700000, 'spent');              // paid, and opened below
  const opener = spend(800000, 'open', 3, { txid: 'spent', vout: 0 });
  const w = readWitness([opener, later, first], ADDR);
  assert.equal(w.paired, true);
  assert.equal(w.txid, 'spent', 'the lock is cited at the output that was opened');
  assert.equal(w.out, 0);
  assert.equal(w.opened.txid, 'open', 'and the spend at the input that opened THAT output');
  assert.equal(w.opened.in, 3);
  assert.equal(w.outputs, 2, 'the one passed over is still counted');

  // Earliest among the opened, not merely the first spend on the page: two
  // outputs, both opened, and the pair is the older of them with its own opener.
  const both = readWitness([
    spend(900000, 'opens-old', 0, { txid: 'old', vout: 0 }),   // newest spend…
    spend(850000, 'opens-new', 0, { txid: 'new', vout: 0 }),
    paid(700000, 'new'), paid(600000, 'old'),
  ], ADDR);
  assert.equal(both.txid, 'old', 'the earliest opened output wins');
  assert.equal(both.opened.txid, 'opens-old', 'paired with its own opener, not the earliest spend');
});

test('an unpaired spend is still quoted, and says it is unpaired', () => {
  // A page that reaches an output but no input opening one: every spend on it
  // ate something older than the page can see. Both halves are still true --
  // pays() matched the prevout, so the arguments really did satisfy these bytes
  // -- so the spend is kept and `paired` is what stops the leaf claiming the
  // input opened the output cited above it.
  const w = readWitness([
    spend(800000, 'open', 0, { txid: 'off-page', vout: 7 }),
    paid(600000, 'pay'),
  ], ADDR);
  assert.equal(w.paired, false);
  assert.equal(w.txid, 'pay', 'the lock falls back to the earliest output');
  assert.equal(w.opened.txid, 'open', 'and the spend is still shown, at the earliest one');
  // A page with nothing but spends reaches no output at all, and cites the
  // prevout's transaction -- the last resort, and the only case left where the
  // lock's citation names no output of its own.
  const none = readWitness([spend(800000, 'open', 0, { txid: 'off-page', vout: 7 })], ADDR);
  assert.equal(none.found, true);
  assert.equal(none.out, null);
  assert.equal(none.paired, false);
});

test('what a spending input brought, whichever way it carried it', () => {
  const SIG = '30' + '44'.repeat(70);            // 71 bytes, DER-shaped
  const KEY = '02' + 'ab'.repeat(32);            // 33 bytes, compressed
  // Segwit carries the arguments as a stack…
  assert.deepEqual(suppliedBy({ witness: [SIG, KEY] }), [SIG, KEY]);
  // …legacy as a scriptSig, which for a spend is pushes end to end.
  assert.deepEqual(suppliedBy({ scriptsig: '47' + SIG + '21' + KEY }), [SIG, KEY]);
  // Taproot's annex rides last behind a 0x50 and is not an argument: keeping it
  // would make a key-path spend count as two items and read as a script path.
  // An annex is kept in the record -- the reader shows one -- and left out of
  // the arity, which is the tally BIP341 uses to tell the two paths apart.
  assert.deepEqual(suppliedBy({ witness: [SIG, '50ff'] }), [SIG, '50ff']);
  assert.deepEqual(spendArgsOf([SIG, '50ff'], true), [SIG]);
  assert.deepEqual(spendArgsOf(['50ff'], true), ['50ff'], 'alone it is not an annex');
  assert.deepEqual(spendArgsOf([SIG, '50ff'], false), [SIG, '50ff'], 'a scriptSig has no annex');
  // OP_0 is a push of nothing, and it opens nearly every P2SH multisig
  // scriptSig — standing in for the item OP_CHECKMULTISIG pops and ignores.
  // Reading it as an operation left the commonest legacy spend on chain
  // looking as though it had brought nothing at all.
  assert.deepEqual(suppliedBy({ scriptsig: '00' + '47' + SIG }), ['', SIG]);
  assert.deepEqual(suppliedBy({ scriptsig: '51' + '47' + SIG }), ['01', SIG], 'OP_1 pushes a 1');
  assert.deepEqual(suppliedBy({ scriptsig: '4f' + '47' + SIG }), ['81', SIG], 'OP_1NEGATE');
  // A real operation is not an argument, and guessing which tokens were which
  // is not on offer.
  assert.deepEqual(suppliedBy({ scriptsig: '76' + '47' + SIG }), [], 'OP_DUP is not a push');
  assert.deepEqual(suppliedBy({}), []);
  assert.deepEqual(suppliedBy({ scriptsig: '' }), []);
});

test('a citation names the coordinate it was read from, not just the page', () => {
  // The two halves of a term are quoted from two different places, and a spend
  // can draw from many inputs at once -- so a citation that stopped at the
  // transaction would send a reader to a page and leave them to find the line.
  // The book resolves an input by its plain vin number (landOnWitness), so
  // nothing here has to know which inputs got footnotes and which did not.
  assert.equal(citeHref('abc', 0), 'bitcoin-book.html?txid=abc&out=0');
  assert.equal(citeHref('abc', undefined, 2), 'bitcoin-book.html?txid=abc&wit=2');
  assert.equal(citeHref('abc'), 'bitcoin-book.html?txid=abc');
  // Zero is a coordinate, not an absence, on both sides.
  assert.match(citeHref('abc', 0, 0), /out=0&wit=0$/);
});

test('an input cites by its own number, cased for what carried it', () => {
  // One coordinate for both carriages, because it IS one coordinate: segwit
  // moved where the data rides, not what an input supplies — which is the same
  // claim the terms make when P2PKH and P2WPKH ask for identical key material.
  // The letter is the input's position, so it needs no counting and cannot
  // shift because a neighbour changed carriage; the case is a tag on top.
  const wit = (items) => ({ witness: items });
  const legacy = { scriptsig: '00' };
  const vins = [legacy, wit(['aa']), legacy, wit(['bb'])];
  assert.deepEqual(inputMarkOf(vins, 0), { n: 1, sig: true },  'input 0 is A');
  assert.deepEqual(inputMarkOf(vins, 1), { n: 2, sig: false }, 'input 1 is b');
  assert.deepEqual(inputMarkOf(vins, 3), { n: 4, sig: false }, 'input 3 is d, not b');
  assert.equal(inputMarkOf(vins, 9), null, 'no such input');
  assert.equal(inputMarkOf(null, 0), null);
  assert.deepEqual(inputMarkOf([wit([])], 0), { n: 1, sig: true }, 'an empty witness is not one');
  // The marks themselves run the book's alphabet, which skips q and continues
  // in bijective base-25 — a, b, … z, aa, ab — and upper for a scriptSig.
  assert.equal(inputMark(1), 'a');
  assert.equal(inputMark(17), 'r', 'q is skipped, so the 17th letter is r');
  assert.equal(inputMark(26), 'aa');
  assert.equal(inputMark(27, true), 'AB');
});

test('a citation reads its case back, and survives losing it', () => {
  // Lowercase names a witness, uppercase a scriptSig.
  assert.deepEqual([parseReference('IV β35 ■1457 §42.c').wit, parseReference('IV β35 ■1457 §42.c').sig],
    [3, false]);
  assert.deepEqual([parseReference('IV β35 ■1457 §42.C').wit, parseReference('IV β35 ■1457 §42.C').sig],
    [3, true]);
  // The URL spelling carries the case through, both ways.
  assert.equal(latinReference('IV β35 ■1457 §42.C'), 'v4b35c1457s42wC');
  assert.equal(latinReference('v4b35c1457s42wC'), 'v4b35c1457s42wC');
  assert.equal(latinReference('v4b35c1457s42wc'), 'v4b35c1457s42wc');
  // …and the letter alone still names the right input, so a citation that lost
  // its case in transit lost the carriage and not the target.
  assert.equal(parseReference('IV β35 ■1457 §42.c').wit, parseReference('IV β35 ■1457 §42.C').wit);
  // Mixed case is neither, and a coordinate that could be read two ways is not
  // one. An output is untouched by any of this: digits are digits.
  assert.equal(parseReference('IV β35 ■1457 §42.Ab'), null);
  assert.equal(parseReference('IV β35 ■1457 §42.0').out, 0);
  assert.equal(parseReference('IV β35 ■1457 §42.q'), null, 'still no q');
});

// The raised forms Unicode actually has, read out of ICU rather than listed
// from memory: fold every modifier/superscript codepoint back to its base.
const raised = (which) => {
  const found = new Set();
  for (const [lo, hi] of [[0x02b0, 0x02ff], [0x1d2c, 0x1d6a], [0x1d78, 0x1dbf],
    [0x2070, 0x209f], [0x2c7d, 0x2c7d]]) {
    for (let cp = lo; cp <= hi; cp++) {
      const base = String.fromCodePoint(cp).normalize('NFKD');
      if (/^[A-Za-z]$/.test(base) && (base === base.toUpperCase()) === (which === 'upper')) {
        found.add(base.toLowerCase());
      }
    }
  }
  return found;
};

test('the footnote alphabet is exactly the letters that can be raised', () => {
  // Why q is missing, and it is not a judgement about how q looks. Unicode
  // gives a raised form to every lowercase letter except q, and the book's run
  // is that set character for character — so a mark can always be set as a
  // character rather than as styling, which is how this book raises h²⁰ and ⁿ.
  const lower = raised('lower');
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => lower.has(c)).join('');
  assert.equal(alphabet, 'abcdefghijklmnoprstuvwxyz');
  assert.equal(FOOTNOTE_BASE, alphabet.length, 'the run is that alphabet and no other');
  assert.equal(footnoteMark(17), 'r', 'so the 17th mark skips q');
  assert.ok(!lower.has('q'), 'q is the one lowercase letter with no raised form');
  // And the cost of the uppercase tag, stated where it cannot be forgotten:
  // six of those 25 letters have no raised CAPITAL, so a scriptSig's mark
  // cannot always be set as a character the way a witness's can. The book
  // raises its marks with CSS today, so nothing is broken — but the property
  // the alphabet was chosen for does not hold for the uppercase half.
  const upper = raised('upper');
  const unraisable = alphabet.split('').filter((c) => !upper.has(c));
  assert.deepEqual(unraisable, ['c', 'f', 's', 'x', 'y', 'z']);
  assert.equal(inputMark(3, true), 'C', 'which is input 3, among others');
});

// ─── and what the leaf does with the answer ──────────────────────────────
//
// The verdicts are read once more, this time as the search leaf reads them: a
// quotation is marked as one, and only where a place can be named. Source-level,
// because the leaf's renderer is an inline module in the page — the same way the
// examples column is checked in address-form.test.mjs.
const searchPage = async () => {
  const { readFile } = await import('node:fs/promises');
  return readFile(new URL('../web/bitcoin-search.html', import.meta.url), 'utf8');
};

test('a quoted passage is set as a quotation, the way the book sets one', async () => {
  const page = await searchPage();
  // The book's own device for a quotation, from bitcoin-book.html's .tx-ascii
  // and a hit output: a marginal accent rule and the indent beside it. Not
  // inline quotation marks -- “ ” already means something in this book, the
  // extent of writing a miner put in a coinbase.
  const rule = page.split('.term-quote {')[1].split('}')[0];
  assert.match(rule, /border-left:\s*2px solid var\(--accent\)/, 'a quotation carries the rule');
  assert.match(rule, /padding-left/, 'and the indent that goes with it');
  // Taking back a reserved gutter, not pushing the text: the leaf draws these
  // lines before the chain answers and again after, and an indent that arrived
  // with the citation would slide the passage under a reader already reading it.
  // So .term pays for the rule's column whether or not anything is quoted, and
  // .term-quote spends exactly that much back.
  const gutter = /padding-left:\s*(\d+)px/.exec(page.split('.term {')[1].split('}')[0]);
  assert.ok(gutter, 'the leaf reserves no gutter for the rule');
  assert.match(rule, new RegExp(`margin-left:\\s*-${gutter[1]}px`), 'the rule would move the text');
  assert.ok(!/“/.test(rule), 'a script is not writing, so it takes no quotation marks');
});

test('the leaf marks a quotation only where it can name the place', async () => {
  const page = await searchPage();
  // The lock rung is a quotation exactly when the chain agrees: reached, found,
  // and carrying these bytes at every reference on the page. ⋯ never asked, ∅
  // found nothing, ☒ found something else -- none of them is a passage.
  assert.match(page, /quoted:\s*verdict === 'agrees'/, 'only agreement makes it a quotation');
  assert.match(page, /const locked = terms \+ \(quoted \?/, 'and the rule is drawn on that alone');
  // The spend rung has no such condition, because it is only ever drawn when an
  // input was found to read it off.
  assert.match(page, /class="term-line term-quote">\$\{rung\.html\}/);
  // Both rungs quote the passage and only the passage. λ, its binders and the
  // eval step are this page's own notation about a script -- true of the bytes
  // in the box whether or not the chain ever wrote them -- so they stand on a
  // bare line above the rule, exactly as the address rung does. The term inside
  // a quotation would put the reader's apparatus under a citation telling them
  // where to go and read it.
  assert.match(page, /const terms = t \? `<div class="term-line">\$\{titleHtml\(t\)\}/,
    'the lock quotation derives its title');
  assert.match(page, /class="term-quote">\$\{passage\}/, 'and quotes the script alone');
  assert.match(page, /class="term-line term-reveal"[^>]*>\$\{line\}/,
    'the spend quotation has one too');
  // The invariant behind both: nothing a rule encloses is built out of the
  // term's marks. λ, …, the joint and the eval step reach the page from
  // lockedHtml and spendMarks, and every one of those lands above a rule and
  // never inside one.
  for (const m of page.matchAll(/class="[^"]*term-quote"[^>]*>([^<]*)/g)) {
    assert.ok(!/prefix|suffix|lockedHtml|lockBodyHtml/.test(m[1]),
      `a quotation is built from the term's own marks: ${m[1]}`);
  }
  // The address rung is a reading of the bytes in the box -- true whether or not
  // the chain ever wrote them -- so it is never inside the rule. If it were, the
  // mark would stop meaning anything.
  const classes = [...page.matchAll(/class="([^"]*)"/g)].map((m) => m[1].split(/\s+/));
  const awaits = classes.filter((c) => c.includes('term-awaits'));
  assert.equal(awaits.length, 1, 'the address rung is drawn once');
  assert.ok(!awaits.some((c) => c.includes('term-quote')),
    'the address rung is a reading, not a quotation');
});

// ─── an id is not a script, however its bytes read ───────────────────────

test('the leaf never calls an id a broken script, and Read still opens it', async () => {
  const { parseLookup } = await import('../web/btc-lookup.js');
  const { isWholeScript, scriptFault, looksSpelled } = await import('../web/btc-address-form.js');
  const { isAddress } = await import('../web/btc-index.js');
  const classify = (q) => parseLookup(q, { isAddress, isSpelled: looksSpelled,
    isLockingScript: isWholeScript });
  // The shape the leaf's hex reading was never meant to hold. An id is 32 bytes
  // of hash, so its bytes tokenize as a script by luck and usually badly -- a
  // push in the middle claiming more than remains, or a byte consensus never
  // defined. Every one of these is a real transaction id or block hash.
  const IDS = [
    'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255',
    '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d',
    'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16',
    '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
  ];
  for (const id of IDS) {
    // The grammar's ruling, and it is not a guess: isWholeScript refuses
    // exactly 64 characters BECAUSE that is an id, and parseLookup routes it to
    // the book to resolve.
    assert.equal(isWholeScript(id), false, `${id} is not offered as a script`);
    assert.equal(classify(id).kind, 'hex', `${id} names a place`);
  }
  // …and most of them fault, which is exactly why the leaf must not read them.
  assert.ok(IDS.filter((id) => scriptFault(id)).length >= 4,
    'ids that read as broken scripts are the common case, not a corner');

  const page = await searchPage();
  // Drawn as a term only where the bytes really are one. Never as a fault: a
  // card headed SCRIPT with a red ☒ under it, for a string this same page is
  // about to open as a transaction, is the page contradicting itself.
  assert.match(page, /found\.kind !== 'hex' \|\| !scriptFault\(/,
    'the leaf reads a named place as hex only where it tokenizes whole');
  // And Read goes there regardless. The guard that stops a chapter opening on
  // invalid bytes is for hex that names nothing else; an id names something.
  assert.match(page, /if \(found\.kind === null && hexish\(q\) && scriptFault\(/,
    'Read refuses only bytes the grammar could not place');
  // The case the guard is actually for: whole bytes that stop mid-push name no
  // block, no transaction and no script, and the diagnosis is the only thing on
  // the page that would explain the silence.
  assert.equal(classify('76a914ab').kind, null);
  assert.deepEqual(scriptFault('76a914ab'), { reason: 'truncated', at: 2, remain: 2 });
});
