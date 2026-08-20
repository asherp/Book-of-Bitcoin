// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/keep-name.test.mjs — a keep has to be named, and no two keeps may
// share a name (web/btc-keepname.js), and the book page enforces it on the
// one path that writes the store (web/bitcoin-book.html).
//
// The rule is about the table of contents: a keep is a row there, and a row
// is read by its title. An unnamed row cannot be read, and two rows reading
// alike are two places a reader cannot tell apart in the one list built to
// tell them apart.
//
// Only writes answer to it. Keeps already in a reader's store are left as
// they were saved — the rule binds what is written from now on, and nothing
// of theirs is rewritten without them asking.
//
//   node --test tools/keep-name.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { nameKey, namePath, isNamed, nameFault, takenNames, ledgerOutcome, ledgerOutcomeSaid,
         UNNAMED, TAKEN } from '../web/btc-keepname.js';

const book = await readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');
const sw = await readFile(new URL('../web/sw.js', import.meta.url), 'utf8');

const keyOf = (k) => k.id;
const keeps = [{ id: 'a', title: 'Bitcoin Pizza Day' }, { id: 'b', title: 'Thefts/Mt. Gox' }];

test('a name compares as the contents files it, not as it is typed', () => {
  // Case folds: two rows reading "Pizza" and "pizza" are the ambiguity the
  // rule exists to prevent, so they are one name.
  assert.equal(nameKey('Pizza'), nameKey('pizza'));
  // A slash is a filing mark, so the space around it is not part of the name.
  assert.equal(nameKey('Thefts / Mt. Gox'), nameKey('Thefts/Mt. Gox'));
  assert.equal(nameKey('  Thefts/Mt. Gox  '), nameKey('Thefts/Mt. Gox'));
  // Empty segments are dropped, so a stray separator names nothing new.
  assert.equal(nameKey('Thefts//Mt. Gox'), nameKey('Thefts/Mt. Gox'));
  // …but the folding decides SAMENESS only. Spelling is the reader's.
  assert.notEqual('Pizza', 'pizza');
});

test('an unnamed keep is exactly one with no key', () => {
  for (const empty of ['', '   ', '/', ' / / ', null, undefined, 42]) {
    assert.equal(nameKey(empty), '', `${JSON.stringify(empty)} names nothing`);
    assert.equal(isNamed(empty), false);
    assert.equal(nameFault(empty), UNNAMED);
  }
  assert.equal(isNamed('Pizza'), true);
  assert.equal(nameFault('Pizza'), null);
});

test('the whole path is the name, never its leaf', () => {
  // Filing exists so a leaf may repeat under different headings; if the leaf
  // were the name, the second of these could never be kept.
  const taken = takenNames([{ id: 'a', title: 'Thefts/Mt. Gox' }], keyOf);
  assert.equal(nameFault('Donations/Mt. Gox', taken), null, 'a repeated leaf is a different name');
  assert.equal(nameFault('Thefts/Mt. Gox', taken), TAKEN, 'the same path is the same name');
  // A one-segment name and that name as a leaf are still different names.
  assert.equal(nameFault('Mt. Gox', taken), null);
});

test('a name already spoken for is refused', () => {
  const taken = takenNames(keeps, keyOf);
  assert.equal(nameFault('Bitcoin Pizza Day', taken), TAKEN);
  assert.equal(nameFault('bitcoin pizza day', taken), TAKEN, 'and refused however it is cased');
  assert.equal(nameFault('Bitcoin Pizza Night', taken), null);
});

test('a name is never taken from the keep being retitled', () => {
  // Renaming a keep to what it is already called, or changing only its case,
  // must not be refused by its own entry in the store.
  const taken = takenNames(keeps, keyOf, 'a');
  assert.equal(nameFault('Bitcoin Pizza Day', taken), null);
  assert.equal(nameFault('BITCOIN PIZZA DAY', taken), null);
  // …while every other keep's name is still spoken for.
  assert.equal(nameFault('Thefts/Mt. Gox', taken), TAKEN);
  // And with nothing excluded, its own name is taken again.
  assert.equal(nameFault('Bitcoin Pizza Day', takenNames(keeps, keyOf)), TAKEN);
});

test('keeps already stored unnamed do not lay claim to a name', () => {
  // The rule binds writes only, so a reader's old unnamed keeps stay. They
  // must not collectively reserve the empty name and block each other.
  const withBlanks = [{ id: 'a', title: '' }, { id: 'b', title: '   ' }, { id: 'c' }];
  const taken = takenNames(withBlanks, keyOf);
  assert.equal(taken.size, 0, 'an unnamed keep spoke for nothing');
  assert.equal(nameFault('Anything', taken), null);
});

test('the book page asks the shared rule, and asks it in both places', () => {
  // The form that offers Save and the store that accepts the write must
  // decide identically, or a reader is refused for a reason never shown.
  assert.match(book, /import \{[^}]*\bnameFault\b[^}]*\btakenNames\b[^}]*\} from '\.\/btc-keepname\.js';/,
    'the page imports the rule rather than restating it');
  assert.match(book, /const keepNameFault = \(title, exceptKey = null\) =>\s*\n\s*nameFault\(title, takenNames\(bookmarks, keyOf, exceptKey\)\);/,
    'and asks it over its own keeps');
  assert.match(book, /if \(keepNameFault\(title, key\)\) return false;/, 'the store guards the write');
  assert.match(book, /titleSaveBtn\.disabled = Boolean\(fault\);/, 'the form withholds Save');
  assert.match(book, /titleInput\.addEventListener\('input', refreshTitleForm\);/,
    'and re-decides as the reader types');
  // Enter does not consult a disabled button, so saveTitle checks for itself
  // and keeps the form open rather than discarding what was typed.
  assert.match(book, /if \(keepNameFault\(titleInput\.value, key\)\) \{\s*\n\s*refreshTitleForm\(\);/,
    'a faulted save re-states the reason instead of closing');
});

test('a locking-script keep is exempt, because it names a ledger', () => {
  // keepLedger folds an address into the ledger already filed under that name,
  // so there a repeated name is the point rather than the fault: the note says
  // which of the two will happen instead of refusing either.
  assert.match(book, /if \(menuEntry\.ledger\) \{\s*\n\s*titleNote\.textContent = ledgerOutcomeSaid\(/,
    'a ledger keep is told what it will do, not whether it is allowed');
  assert.doesNotMatch(book, /menuEntry\.ledger[\s\S]{0,200}?keepNameFault/,
    'and is never held to the uniqueness rule');
});

test('the new module is in the app shell', () => {
  // Every module is precached by name; one missing from the list 404s for an
  // offline reader, and an import that 404s takes the whole page with it.
  assert.match(sw, /'\.\/btc-keepname\.js',/, 'btc-keepname.js is served offline');
});

// ── Which of the two a keeper is doing ────────────────────────────────────
// A ledger folds where a bookmark refuses, so the form's job is not to permit
// or deny but to say which of the two a name is about to do.
const SHELF = [
  { title: 'Coldcard hack', name: 'Coldcard hack', addresses: ['a', 'b', 'c'] },
  { title: 'Coldcard hack/wave 3', name: 'Coldcard hack / wave 3', addresses: ['c'] },
  { title: 'Donations', name: 'Donations', addresses: ['d'] },
];

test('nothing typed promises nothing', () => {
  for (const empty of ['', '   ', '/', null, undefined]) {
    assert.equal(ledgerOutcome(empty, SHELF), null);
    assert.equal(ledgerOutcomeSaid(ledgerOutcome(empty, SHELF)), '');
  }
});

test('a name already on the shelf joins it, and says how much is there', () => {
  assert.deepEqual(ledgerOutcome('Coldcard hack/wave 3', SHELF).kind, 'joins');
  assert.equal(ledgerOutcomeSaid(ledgerOutcome('Coldcard hack/wave 3', SHELF)),
    'Joins Coldcard hack / wave 3 — 1 passage', 'one passage is singular');
  assert.equal(ledgerOutcomeSaid(ledgerOutcome('Coldcard hack', SHELF)),
    'Joins Coldcard hack — 3 passages', 'a parent totals what is filed beneath it');
  // A slash is a filing mark, so the space around it is not part of the name:
  // a reader typing it out with spaces still joins.
  assert.equal(ledgerOutcomeSaid(ledgerOutcome('  Coldcard hack / wave 3  ', SHELF)),
    'Joins Coldcard hack / wave 3 — 1 passage');
});

test('a name not on the shelf shelves a new ledger', () => {
  assert.equal(ledgerOutcome('My cold wallet', SHELF).kind, 'new');
  assert.equal(ledgerOutcomeSaid(ledgerOutcome('My cold wallet', SHELF)), 'New ledger');
  // A leaf that repeats under a different parent is its own ledger.
  assert.equal(ledgerOutcomeSaid(ledgerOutcome('Thefts/wave 3', SHELF)), 'New ledger');
});

test('a name differing only in case joins, and says so in the shelf’s spelling', () => {
  // It used to shelve a second ledger — a silently split record whose parent
  // no longer totalled the incident. Now it folds, and the note names the
  // spelling that will actually stand rather than the one just typed.
  const out = ledgerOutcome('Coldcard Hack/Wave 3', SHELF);
  assert.equal(out.kind, 'joins', 'a capital is a typing accident, not a distinction');
  assert.equal(ledgerOutcomeSaid(out), 'Joins Coldcard hack / wave 3 — 1 passage');
  assert.equal(ledgerOutcomeSaid(ledgerOutcome('COLDCARD HACK', SHELF)),
    'Joins Coldcard hack — 3 passages');
});

test('one comparison decides sameness; the two rules only differ in what they do', () => {
  // A bookmark refuses a name already taken, a ledger folds into it. What is
  // DONE about sameness differs. Whether two names ARE the same must not, or
  // the book answers one question two ways.
  const a = 'Coldcard hack/wave 3', b = 'Coldcard Hack/Wave 3';
  assert.equal(nameKey(a), nameKey(b), 'both judge them the same name');
  // namePath survives as the spelling — what is stored and printed — and is
  // deliberately NOT a comparison any more.
  assert.notEqual(namePath(a), namePath(b), 'while the spellings stay distinct');
  assert.equal(namePath('  Thefts / Mt. Gox  '), 'Thefts/Mt. Gox', 'trimmed, not folded');
});

test('both keep forms say it, and offer the shelf to pick from', () => {
  const ledgerSrc = readFileSync(new URL('../web/bitcoin-ledger.html', import.meta.url), 'utf8');
  for (const [name, src, list] of [['book', book, 'ledger-paths'], ['ledger', ledgerSrc, 'keep-ledger-paths']]) {
    assert.match(src, new RegExp(`list="${list}"`), `${name}: the field completes from the shelf`);
    assert.match(src, new RegExp(`<datalist id="${list}"></datalist>`), `${name}: and the list is there to fill`);
    assert.match(src, /opt\.value = l\.title;/, `${name}: offered as the path keepLedger folds by`);
    assert.match(src, /opt\.label = l\.name;/, `${name}: and spelled as the shelf prints it`);
    assert.match(src, /ledgerOutcomeSaid\(ledgerOutcome\(/, `${name}: the note says which of the two`);
  }
  // Rebuilt on open, so a ledger kept since the last one is in the list.
  assert.match(book, /fillLedgerPaths\(\);/, 'book: the list is refilled as the form opens');
  assert.match(ledgerSrc, /fillKeepPaths\(\);/, 'ledger: likewise');
});

test('a bookmark is offered no ledger names, since every one would be refused', () => {
  assert.match(book, /if \(!menuEntry \|\| !menuEntry\.ledger\) return;/,
    'the completions stand down for a keep that is not a ledger');
  // A ledger keep is never refused for a name already used -- folding is the
  // point -- but it still has to have one, as the Ledgers page's own form has
  // always required.
  assert.match(book, /titleSaveBtn\.disabled = !titleInput\.value\.trim\(\);/,
    'Save waits only on the field being empty');
  assert.doesNotMatch(book, /menuEntry\.ledger[\s\S]{0,400}?TAKEN/,
    'never on the name being taken');
});
