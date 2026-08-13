// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-lookup.js — everything the book will answer to, in one place: the grammar
// the search box takes, the book page's ?block= lookup reads, and a curated
// entry's `id:` is written in. One parser, so a form that works in the search
// box works in the contents, and a reader who learns one has learned the other.
//
// The forms:
//
//   height        0, 57043            a block, by its place in the chain
//   relative      -1, -6              counted back from the chain tip (-1 is
//                                     the latest block), resolved online
//   64 hex        4a5e1e…33b          a transaction id or a block hash --
//                                     indistinguishable by shape, so the book
//                                     tries a block first and a transaction
//                                     second
//   reference     III β2 ■5           the book's own citation, in either
//                 I β29 ■596 §85      spelling and to any depth (btc-citation.js
//                 v1b29c596s85        parses it; the sigils are optional)
//   address       an address entire   not a place but a name, and so not a
//                                     chapter: the search box answers these
//                                     where they were typed, by writing the
//                                     term the address binds (btc-term.js)
//   spelled       ⧉ ⌖ h²⁰ and prose   the same script in the book's own hand:
//                                     sigla for the opcodes, the byte count on
//                                     the mark, Glossia prose for the datum.
//                                     The alphabet is a bijection, so this
//                                     resolves to Script and to nothing else --
//                                     an address format needing no version byte
//                                     and no table of patterns (btc-address-form.js)
//   locking hex   the script's bytes  a locking script, by its own bytes, bare:
//                                     whole bytes that tokenize as a script and
//                                     are not already something else here --
//                                     see isWholeScript in btc-address-form.js,
//                                     which excludes exactly two shapes, both
//                                     of them another form of this grammar
//   script        script:840000       the same, forced, and now only for the
//                                     two shapes bare hex gives up: all-digit
//                                     hex, which is how a height is written,
//                                     and exactly 64 characters, which is an
//                                     id. Nothing else needs it -- every script
//                                     the book shelves reads bare
//
// Address recognition is injected rather than imported: the real test decodes
// base58 and bech32 (isAddress in btc-index.js, the ledger's own machinery),
// which no other page should have to pull in to classify a string. Callers that
// have it pass it; callers that only need to tell a reader "that looks like an
// address" use the shape test below.

import { parseReference } from './btc-citation.js';

export const isHeight = (s) => /^[0-9]+$/.test(s);
export const isRelativeHeight = (s) => /^-[0-9]+$/.test(s);
export const isHex64 = (s) => /^[0-9a-fA-F]{64}$/.test(s);

// The written form of a script name: the `script:` prefix and whole bytes of
// hex. The prefix disambiguates -- bare hex can spell a height ("5121") or a
// txid -- and parses to the bytes alone, lowercased: downstream, a script
// member IS its hex, compared and stored as such.
export const isScriptQuery = (s) => /^script:(?:[0-9a-fA-F]{2})+$/.test(s);

// Shape alone -- enough to say "this is an address, and addresses are ledger
// entries", never enough to accept one as valid. base58 (1…, 3…) and bech32
// (bc1…), at plausible lengths.
export const looksLikeAddress = (s) => /^(?:[13][a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[02-9ac-hj-np-z]{11,71})$/.test(s);

// What a query is, and what it resolves to. `kind` is one of 'height',
// 'relative', 'hex', 'reference', 'address', or null when the string is none of
// them. A reference carries its parse (see btc-citation.js); everything else
// carries the query as written, trimmed.
// Recognition is injected for the three forms whose real test is a decode. An
// address's is the ledger's (isAddress, above); a spelled script's is the
// alphabet's own (looksSpelled in btc-address-form.js); a bare locking
// script's is whether the bytes bind a term at all. Each defaults to off, so
// no page pays for the opcode table to answer a question about a height, and a
// caller that means to take a form passes its recognizer.
export function parseLookup(query, {
  isAddress = looksLikeAddress, isSpelled = () => false, isLockingScript = () => false,
} = {}) {
  const q = String(query ?? '').trim();
  if (!q) return { kind: null, query: q };
  // Addresses first: bech32 is all-lowercase in the form the ledger queries,
  // but a QR scan yields the uppercase spelling, so both are admitted (base58
  // keeps its case, which is significant).
  if (isAddress(q)) return { kind: 'address', query: q, address: q };
  if (isAddress(q.toLowerCase())) return { kind: 'address', query: q, address: q.toLowerCase() };
  if (isScriptQuery(q)) return { kind: 'script', query: q, script: q.slice(7).toLowerCase() };
  // Bare hex that is a whole script. Not a guess about what the reader meant:
  // the two shapes this grammar already spends -- an all-digit height, a
  // 64-character id -- are refused by the recognizer, and nothing else it takes
  // can be read as hex at all.
  if (isLockingScript(q)) return { kind: 'script', query: q, script: q.toLowerCase() };
  // The book's own spelling of a script. It carries its bytes rather than
  // pointing at them, so what comes back is the text: reading it is the
  // engine's job and belongs to whoever asked. No other form here can hold a
  // glyph or a push mark, so the shapes never contend.
  if (isSpelled(q)) return { kind: 'spelled', query: q, spelled: q };
  if (isHeight(q)) return { kind: 'height', query: q, height: Number(q) };
  if (isRelativeHeight(q)) return { kind: 'relative', query: q, offset: Number(q) };
  if (isHex64(q)) return { kind: 'hex', query: q, hex: q.toLowerCase() };
  const reference = parseReference(q);
  if (reference) return { kind: 'reference', query: q, reference };
  return { kind: null, query: q };
}
