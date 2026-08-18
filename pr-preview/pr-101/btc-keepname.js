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
// rather than a character a reader has to place exactly; case folds away too,
// since a row printing "Pizza" beside one printing "pizza" is precisely the
// ambiguity this rule exists to prevent.
//
// Only the comparison is folded. What the reader typed is what the store keeps
// and what the contents prints -- this decides sameness, never spelling.
//
// The WHOLE path is the name, never its leaf: filing exists so that
// `Thefts/Mt. Gox` and `Donations/Mt. Gox` can both stand, each under the
// heading that says which is which.
export const nameKey = (title) => pathSegments(title).join('/').toLowerCase();

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
