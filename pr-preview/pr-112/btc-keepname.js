// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-keepname.js — what a keep must be called.
//
// A keep is a row in the table of contents, and a row is read by its title.
// So a keep has to be named, and no two keeps may take the same name: two
// rows reading alike would be two places a reader cannot tell apart, in the
// one list built to tell them apart.
//
// The rule lives here rather than in the page that enforces it because the
// page is not the only thing that has to agree with it: the form that offers
// Save and the store that accepts the write must decide identically, or a
// reader is refused for a reason the form never showed them.

import { pathSegments } from './btc-path.js';

// A name as it COMPARES, which is not quite as it prints. pathSegments already
// trims each segment and drops the empty ones, so a slash is a filing mark
// rather than a character a reader has to place exactly. Only the comparison
// is folded: what the reader typed is what the store keeps and what the
// contents prints -- these decide sameness, never spelling.
//
// The WHOLE path is the name, never its leaf: filing exists so that
// `Thefts/Mt. Gox` and `Donations/Mt. Gox` can both stand, each under the
// heading that says which is which.
//
// The path as it is STORED and PRINTED: trimmed segment by segment, spelled
// as the reader spelled it. This is what a title becomes and what a URL
// carries -- never the thing two names are compared by.
export const namePath = (title) => pathSegments(title).join('/');

// …and the one comparison. Case folds away because nobody means it: a reader
// typing `Coldcard Hack` beside a shelved `Coldcard hack` has made a typing
// accident, not a distinction, and the book already treats a name as what
// they MEANT rather than as a literal string -- pathSegments trims the space
// around a separator for exactly that reason.
//
// One comparison, two actions. A bookmark REFUSES a name already taken, since
// two contents rows reading alike are two places a reader cannot tell apart;
// a ledger FOLDS into it, since that is how one keeper's addresses gather
// into one record. What is done about sameness differs. Whether two names ARE
// the same must not, or the book answers one question two ways.
export const nameKey = (title) => namePath(title).toLowerCase();

// …so an empty key is a keep with no name at all, and one helper answers both
// halves of the rule.
export const isNamed = (title) => Boolean(nameKey(title));

// What is wrong with a name, in the words the form shows -- or null when
// nothing is. `taken` is the set of nameKeys already spoken for, which the
// caller builds without the keep being retitled: a name is not taken from
// itself, or no keep could ever be renamed to what it is already called.
export const UNNAMED = 'A keep is a row in the contents — give it a name.';
export const TAKEN = 'Another keep already has this name.';
export function nameFault(title, taken = new Set()) {
  const key = nameKey(title);
  if (!key) return UNNAMED;
  return taken.has(key) ? TAKEN : null;
}

// The names already spoken for, from the keeps as stored. `keyOf` says which
// keep is which -- the caller's own identity for them -- so the keep being
// retitled can be left out by its key rather than by its name, which is the
// very thing about to change.
export function takenNames(keeps, keyOf, exceptKey = null) {
  const taken = new Set();
  for (const keep of keeps) {
    if (exceptKey != null && keyOf(keep) === exceptKey) continue;
    const key = nameKey(keep.title);
    if (key) taken.add(key);
  }
  return taken;
}


// ── Which of the two a keeper is doing ────────────────────────────────────
// A ledger is not a bookmark. Keeping under a name already used FOLDS into
// that ledger (keepLedger), which is how one keeper's addresses gather into
// one record -- so the question a reader needs answered before they press is
// not "is this name allowed" but "which of the two am I about to do".
// Silence answered it only after the fact, on a shelf they had to go and look
// at.
//
// `shelf` is shelfLedgers()'s rows -- what the reader can actually see -- so
// the promise made here and the list offered beside it describe one thing.
export function ledgerOutcome(title, shelf = []) {
  const key = nameKey(title);
  if (!key) return null;                       // nothing typed yet: nothing to promise
  // Folded, so a name differing from a shelved one only in case JOINS it --
  // and the note names the shelf's own spelling, which is the one that will
  // stand. There is no near miss left to warn about: the fold that used to
  // slip past on a capital now catches it.
  const joined = shelf.find((l) => nameKey(l.title) === key);
  return joined ? { kind: 'joins', ledger: joined } : { kind: 'new' };
}

// …said in the words the form shows, so both keep forms phrase it alike.
export function ledgerOutcomeSaid(outcome) {
  if (!outcome) return '';
  if (outcome.kind === 'joins') {
    const n = outcome.ledger.addresses.length;
    return `Joins ${outcome.ledger.name} — ${n} passage${n === 1 ? '' : 's'}`;
  }
  return 'New ledger';
}
