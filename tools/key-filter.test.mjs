// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/key-filter.test.mjs — the notation key cut down to a page.
//
//   node --test tools/key-filter.test.mjs
//
// The filter reads each key row's own glyph cell to learn what it teaches, so
// the thing most worth testing is that reading: a row that resolves to nothing
// findable would never show, and the reader would look up a mark on the page
// and not find it. Every row here is checked against the marks a page really
// renders, and the two directions that would embarrass the key -- a bare
// operator caught by a chapter head's arithmetic, a value-carrying mark missed
// because the page prints a number after it -- are pinned by name.

import test from 'node:test';
import assert from 'node:assert/strict';

import { marksOf, rowShows, isHidden } from '../web/btc-key-filter.js';
import { NOTATION_HTML } from '../web/btc-notation.js';

// Every glyph row as the filter sees it: the cell's markup and its data-marks.
const ROWS = [...NOTATION_HTML.matchAll(
  /<div class="glyph-row"(?: data-marks="([^"]*)")?><span class="g">(.*?)<\/span><span class="m">(.*?)<\/span>/g,
)].map((m) => ({ dataMarks: m[1] ?? null, glyph: m[2], gloss: m[3] }));

test('the key still parses into rows', () => {
  assert.ok(ROWS.length > 90, `only ${ROWS.length} rows matched`);
});

test('every row resolves to something the filter can look for', () => {
  const empty = [];
  for (const row of ROWS) {
    const tokens = marksOf(row.glyph, row.dataMarks);
    // The page-number row is all placeholder and names no mark: it is the one
    // row that stays on every page by never being characterised.
    if (tokens.length === 0) { empty.push(row.glyph); continue; }
    for (const t of tokens) {
      assert.ok(t.template !== undefined || t.pattern !== undefined || t.text.length > 0,
        `empty token in ${row.glyph}`);
    }
  }
  assert.deepEqual(empty, ['<i>n</i>'], 'only the folio row should name no mark');
});

test('a value-carrying mark is found behind its value', () => {
  // ■<i>n</i> is written on the page as ■840000, β<i>n</i> as β₇₈, and the
  // locktime as a whole citation.
  const marks = new Set(['■840000', 'β₇₈', 'III β2 ■5', 'η₂¹₃¹₇¹', '⓪²⁵⁶']);
  const shows = (glyph, dm = null) => rowShows(marksOf(glyph, dm), marks);
  assert.ok(shows('■<i>n</i>'));
  assert.ok(shows('β<i>n</i>'));
  // η's value is a product now, so the glyph carries an ellipsis and the row
  // names the mark itself: the prefix is all that was ever being matched.
  assert.ok(shows('η<sub><i>p</i></sub><sup><i>k</i></sup>…', 'η*'));
  assert.ok(shows('<i>v</i> β<i>b</i> ■<i>c</i>'));
  assert.ok(shows('⓪<sup>256</sup>', '⓪²⁵⁶'));
});

test('a bare operator is not caught by a number that contains it', () => {
  // The chapter head prints its target as 2¹⁶⁰213529¹ and the book leaf a
  // difficulty move as −2.53%. Neither is Script arithmetic.
  const marks = new Set(['β₇₈', '2¹⁶⁰213529¹', 'difficulty −2.53%']);
  assert.ok(!rowShows(marksOf('+ − × ÷ %'), marks), 'arithmetic should stay shut');
  assert.ok(!rowShows(marksOf('&lt; &gt; ≤ ≥'), marks), 'comparisons should stay shut');
  // The target is a shape rather than a string -- every character of
  // 2¹⁶⁰213529¹ is a digit the retarget chose -- so its row is found by the
  // pattern only a factorization makes: a plain digit carrying a raised one.
  const FACTORS = 're:[0-9][⁰¹²³⁴⁵⁶⁷⁸⁹]';
  const target = (m) => rowShows(marksOf('2<sup><i>k</i></sup><i>p</i><sup><i>l</i></sup>…', FACTORS), m);
  assert.ok(target(marks), 'the target should open its row');
  assert.ok(target(new Set(['β₃₂ < 2²⁰⁸3¹5¹17¹257¹'])), 'genesis too, mark and all');
  // And the raised digits a page prints elsewhere are not products: a push
  // count, a hash's bit counts, the genesis chapter's empty predecessor -- nor
  // is an extranonce, whose product is written in the lowered register, so a
  // post-BIP34 coinbase page (a counter, and no target on it) stays shut.
  assert.ok(!target(new Set(['β₇₈', '²⁰', '↧²⁰', '⌘²²⁴', '⓪²⁵⁶', '■840000', 'η₅¹₈₃₉¹₄₂₅₆₀₉¹'])),
    'no factorization on the page, no row');
  // The header's nonce does match, and should: it is a product in the same
  // register, and it never appears on a page without the target beside it.
  assert.ok(target(new Set(['η19¹97¹1130351¹', 'β₃₂ < 2²⁰⁸3¹5¹17¹257¹'])), 'a chapter head, both fields');
  // But the same marks as Script opcodes do open those rows.
  const script = new Set(['×', '≤']);
  assert.ok(rowShows(marksOf('+ − × ÷ %'), script));
  assert.ok(rowShows(marksOf('&lt; &gt; ≤ ≥'), script));
});

test('a bare push answers to its count, since it has no glyph', () => {
  const marks = new Set(['²⁰', 'push:count']);
  assert.ok(rowShows(marksOf('²⁰', 'push:count'), marks));
  assert.ok(!rowShows(marksOf('²⁰', 'push:count'), new Set(['⧉'])));
  // The extended pushes keep their arrow, so they are found behind the count.
  assert.ok(rowShows(marksOf('↧<i>n</i> ⇊<i>n</i> ⤋<i>n</i>'), new Set(['↧²⁰'])));
});

test('the off-chain apparatus follows its table, not the page', () => {
  const ln = new Set(['lightning']);
  assert.ok(rowShows(marksOf('<b>k</b>', 'tpl:lightning'), new Set(), ln));
  assert.ok(!rowShows(marksOf('<b>k</b>', 'tpl:lightning'), new Set(['⧉']), new Set()));
});

test('a plain P2PKH page opens the rows it needs and no others', () => {
  // What a P2PKH section actually renders: the lock's opcodes, the spend's
  // data marks, the § number, an amount, a sequence mark.
  const marks = new Set(['⧉', '⌖', '≡', '∇', 'push:count', '²⁰', 's', 'p', 'h',
    '§ 1', '0.015 ₿', '●', '□']);
  const opens = (glyph, dm = null) => rowShows(marksOf(glyph, dm), marks);
  assert.ok(opens('⧉'), 'duplicate');
  assert.ok(opens('∇'), 'check a signature');
  assert.ok(opens('⌖'), 'address hash');
  assert.ok(opens('= ≡'), 'bytes equal');
  assert.ok(opens('<b>s</b>'), 'signature');
  assert.ok(opens('●'), 'final');
  assert.ok(opens('□'), 'no locktime');
  assert.ok(opens('(<i>n</i> ₿)', '₿*'), 'the amount');
  // And the rows a P2PKH page has no use for.
  assert.ok(!opens('▼'), 'CHECKSIGVERIFY is not on this page');
  assert.ok(!opens('Σ'), 'SHA-256 is not on this page');
  assert.ok(!opens('τ'), 'no absolute timelock here');
  assert.ok(!opens('⥀'), 'no roll');
  assert.ok(!opens('☒'), 'no invalid opcode');
  assert.ok(!opens('<b>t</b>'), 'no tapscript');
  assert.ok(!opens('<b>k</b>', 'tpl:lightning'), 'no channel');
});

test('the key emits the structure the filter reaches for', () => {
  // applyKeyFilter walks .notation-group / .glyph-row > .g / .pattern-table
  // with its .phead and [data-row] cells. A rename on either side that lost
  // one of these would silently stop filtering, so they are pinned here.
  const count = (re) => (NOTATION_HTML.match(re) ?? []).length;
  assert.ok(count(/class="notation-group"/g) > 10, 'groups');
  assert.ok(count(/class="glyph-row"/g) + count(/class="glyph-row" data-marks=/g) > 90, 'rows');
  assert.equal(count(/<span class="g">/g), count(/<span class="m">/g), 'every row has a glyph and a gloss');
  assert.equal(count(/class="pattern-table/g), 2, 'the two pattern tables');
  assert.ok(count(/class="phead"/g) >= 12, 'column heads');
  // Every pattern cell is tagged, and every tag names a template the
  // classifier can actually produce.
  const KNOWN = new Set(['p2pk', 'p2pkh', 'multisig', 'p2sh', 'p2sh-multisig', 'p2wpkh',
    'p2wsh', 'p2tr-key', 'p2tr-script', 'data', 'lightning']);
  const tagged = [...NOTATION_HTML.matchAll(/data-row="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(tagged.length > 80, `only ${tagged.length} cells tagged`);
  for (const id of new Set(tagged)) assert.ok(KNOWN.has(id), `unknown template id ${id}`);
  // Each of the common table's rows is tagged across all five of its cells.
  for (const id of KNOWN) {
    if (id === 'lightning') continue;
    assert.equal(tagged.filter((t) => t === id).length, 5, `${id} should tag five cells`);
  }
  // Every pname carries a tag -- an untagged row could never be shown.
  assert.equal(count(/<span class="pname"/g), count(/<span class="pname" data-row=/g));
});

test('a template id in the key is one the classifier hands back', async () => {
  const { outputTemplates } = await import('../web/btc-templates.js');
  // Spot-check the mapping in the direction that matters: a lock the reader
  // sees must name a row that exists in the key.
  const P = (n) => (n <= 0x4b ? n.toString(16).padStart(2, '0') : '') + 'ab'.repeat(n);
  const tagged = new Set([...NOTATION_HTML.matchAll(/data-row="([^"]+)"/g)].map((m) => m[1]));
  for (const id of outputTemplates('76a9' + P(20) + '88ac')) assert.ok(tagged.has(id), id);
  for (const id of outputTemplates('51' + P(32))) assert.ok(tagged.has(id), id);
  for (const id of outputTemplates('00' + P(32))) assert.ok(tagged.has(id), id);
});

test('what the page has folded away is not on the page', () => {
  // The shape a section page really has: the chapter's head still in the
  // document, hidden, holding the last chapter page's header marks, with the
  // transaction's own marks live beside it.
  const node = (cls, parent) => {
    const n = { classList: { contains: (c) => cls.split(' ').includes(c) }, parentElement: parent };
    return n;
  };
  const slide = node('', null);
  const head = node('chapter-head', slide);
  const frontispiece = node('chapter-frontispiece hidden', head);   // folded away on a section
  const beta = node('cfx cfx-gold', frontispiece);                  // β₇₈, from the last chapter page
  const body = node('chapter-body', slide);
  const dup = node('op', body);                                     // ⧉, the transaction's own

  assert.equal(isHidden(beta, slide), true, "a section must not show the chapter's header marks");
  assert.equal(isHidden(dup, slide), false, "the transaction's own marks are on the page");
  // The walk stops at the root: a hidden ancestor above it is not this
  // collector's business, and must not blank the whole page.
  const outer = node('hidden', null);
  slide.parentElement = outer;
  assert.equal(isHidden(dup, slide), false);
});
