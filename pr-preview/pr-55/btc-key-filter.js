// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-key-filter.js — the notation key, cut down to the page in hand.
//
// The key explains every mark the book uses. Read at rest, in the front
// matter's sigla leaf, that is the point of it. Opened over a transaction it
// is mostly other people's marks, and the one being looked up is somewhere in
// the scroll. So the book page's toggle keeps the rows whose marks are on the
// page and folds the rest away — the same key, opened to the right place.
//
// Two questions decide a row. A glyph row asks whether any mark it teaches is
// rendered on the page; a pattern row asks whether the transaction carries its
// template (btc-templates.js). Neither is a claim about Bitcoin — it is a
// claim about what is printed — so the filter errs toward showing: an
// unrecognised script hides nothing, and the sheet's own control opens the key
// in full whenever the reader wants the rest of it.
//
// The front matter's sigla leaf never calls this. The key at rest stays whole.

// Every element that carries a mark rather than prose: script marks and their
// data letters, the chapter head's fields, an input's sequence and amount, the
// transaction's locktime, the § number, and .mk where a mark would otherwise
// go unclassed.
const MARK_SELECTOR = '.op, .dt, .cfx, .cfx-gold, .fx-mark, .merkle-mark, '
  + '.tx-seq, .tx-locktime, .cite-amount, .tx-out-value, .section-num, .mk, .pool-sig';

// Is this element inside something the page has folded away?
//
// A chapter and a section share one set of elements and take turns in them.
// A section page keeps the chapter's own head -- the hash prose and the
// header frontispiece -- in the document and merely hides it, still holding
// the marks of whichever chapter page was last drawn. Read literally that
// makes every transaction look as though it were showing a block header, so
// what is folded away is not on the page and does not open a row. Walks to
// the root inclusive; above it is the caller's business.
export function isHidden(el, root) {
  for (let n = el; n; n = n.parentElement) {
    if (n.classList && n.classList.contains('hidden')) return true;
    if (n === root) break;
  }
  return false;
}

// The marks a rendered page is actually showing, as the exact strings their
// spans carry -- '⧉', '■840000', 'β₇₈', 'III β2 ■5'.
//
// Three marks have no glyph of their own and answer to a synthetic token
// instead. A bare push is written as the byte count alone (²⁰, ³³), so no
// literal finds it: 'push:count'. A coinbase's template timestamp is written
// as a date, which differs in every block that carries one and could only be
// matched by a prefix loose enough to catch anything: 'time:template'. And a
// pool's signature is whatever that pool wrote -- the mark is the quotation
// itself: 'sig:pool'. A margin's run of zeros writes ⓪ with a byte count,
// which the chapter head's ⓪ⁿ (zero BITS of the block hash) would answer for
// on a prefix match, so it takes 'zero:run' and opens its own row.
export function collectMarks(root) {
  const marks = new Set();
  if (!root) return marks;
  for (const el of root.querySelectorAll(MARK_SELECTOR)) {
    if (isHidden(el, root)) continue;
    const text = el.textContent.trim();
    if (text) marks.add(text);
    if (el.classList.contains('op-count')) marks.add('push:count');
    if (el.classList.contains('op-tpltime')) marks.add('time:template');
    if (el.classList.contains('pool-sig')) marks.add('sig:pool');
    if (el.classList.contains('op-zeros')) marks.add('zero:run');
  }
  return marks;
}

// What a key row teaches, read off the row's own glyph cell.
//
// A mark written bare -- × in "+ − × ÷ %" -- must be matched exactly, so that
// a number containing one (a difficulty move of −2.53%) cannot drag the
// arithmetic group onto a page that holds no arithmetic. A mark written with a
// placeholder after it -- ■<i>n</i>, β<i>n</i>, η<sub><i>n</i></sub> -- carries
// a value on the page and is matched as a prefix instead, so ■ finds ■840000
// and β finds both β₇₈ and the locktime's III β2 ■5.
//
// Rows whose glyph cell is an example rather than a literal (²⁰ standing for
// any push, ①–⑯ for a run) say so with data-marks, where a trailing * asks for
// the same prefix match, and tpl:<id> ties a row to a pattern table instead.
//
// One mark in the book is a shape and not a string at all: the difficulty
// target, printed as its mantissa in primes times a whole-byte shift
// (167009×256²⁰), whose primes are whatever the last retarget left. Nothing in
// the primes is fixed enough to look for -- so that row names re:<pattern>
// instead, and is shown where the page prints something of that form.
//
// The shift is the fixed part: every target on this chain ends in 256 with a
// raised digit after it, and nothing else in the book is written that way. The
// nonces are products in the same notation and used to answer for the target's
// row on a power-of-two pattern; against 256ᵉ they cannot, so the rule is now
// exact rather than a probability argument about how often a counter divides
// by a tenth power.
// Pure string work, so it is testable without a DOM.

// Stands in for a placeholder while tokenizing; never appears in real markup.
const VALUE = '\u0001';
export function marksOf(glyphHtml, dataMarks = null) {
  if (dataMarks) {
    return dataMarks.split(/\s+/).filter(Boolean).map((t) => {
      if (t.startsWith('tpl:')) return { template: t.slice(4) };
      if (t.startsWith('re:')) return { pattern: new RegExp(t.slice(3)) };
      return t.endsWith('*') ? { text: t.slice(0, -1), loose: true } : { text: t, loose: false };
    });
  }
  // A placeholder after a mark makes it value-carrying: drop the placeholder,
  // leaving a sentinel that says the mark is a prefix of what the page prints.
  const flagged = glyphHtml.replace(/(<i>.*?<\/i>|<sub>.*?<\/sub>|<sup>.*?<\/sup>)+/g, VALUE);
  const text = flagged.replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return text.split(/\s+/).filter(Boolean).map((tok) => {
    const bare = tok.split(VALUE).join('');
    return bare ? { text: bare, loose: tok.includes(VALUE) } : null;
  }).filter(Boolean);
}

// Does the page show any mark this row teaches -- in its own form, or, for the
// off-chain apparatus no page ever prints (k, G, a channel's state-scoped
// keys), by carrying the template that row belongs to?
export function rowShows(tokens, marks, templates = new Set()) {
  return tokens.some(({ text, loose, template, pattern }) => {
    if (template !== undefined) return templates.has(template);
    if (pattern !== undefined) return [...marks].some((m) => pattern.test(m));
    return loose ? [...marks].some((m) => m.includes(text)) : marks.has(text);
  });
}

// ─── applying it to a rendered key ───────────────────────────────────────

// Hide an element without disturbing the grids the key is built from: the
// pattern tables are CSS grids whose cells are direct children, so a cell has
// to go out of flow entirely rather than merely turn invisible.
const setHidden = (el, hidden) => el.classList.toggle('key-cut', hidden);

// Filter a rendered notation key in place. `marks` is what the page shows,
// `templates` the script patterns it carries (btc-templates.js). There is no
// unfiltered mode here: the key at rest is the front matter's sigla leaf,
// which never calls this at all, and the sheet links to it.
export function applyKeyFilter(keyRoot, { marks = new Set(), templates = new Set() } = {}) {
  if (!keyRoot) return;

  for (const row of keyRoot.querySelectorAll('.glyph-row')) {
    const g = row.querySelector('.g');
    if (!g) continue;
    const tokens = marksOf(g.innerHTML, row.dataset.marks || null);
    // A row whose glyph cell is all placeholder (the bare page number) names
    // no mark to look for, and stays: the filter hides only what it can name.
    setHidden(row, tokens.length > 0 && !rowShows(tokens, marks, templates));
  }

  // Pattern rows are cells tagged with the template they draw; a table whose
  // rows all go takes its column heads with it.
  for (const table of keyRoot.querySelectorAll('.pattern-table')) {
    let kept = 0;
    for (const cell of table.querySelectorAll('[data-row]')) {
      const show = cell.dataset.row.split(/\s+/).some((id) => templates.has(id));
      setHidden(cell, !show);
      if (show && cell.classList.contains('pname')) kept++;
    }
    for (const head of table.querySelectorAll('.phead')) setHidden(head, kept === 0);
  }

  // A group with nothing left in it is a heading over a gap.
  for (const group of keyRoot.querySelectorAll('.notation-group')) {
    const rows = group.querySelectorAll('.glyph-row, .pattern-table [data-row]');
    const any = [...rows].some((r) => !r.classList.contains('key-cut'));
    setHidden(group, rows.length > 0 && !any);
  }
}
