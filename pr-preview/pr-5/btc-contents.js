// btc-contents.js — the curated table of contents for the Bitcoin Book: notable
// blocks and transactions. Shared by bitcoin-book.html (the "Bookmarks" list in
// the lookup card) and bitcoin-contents.html (the table-of-contents page).
//
// Each `id` is handed straight to the book's lookup: a bare number is a block
// height, a 64-hex value a transaction id. Every entry is cited by its
// reference, never its raw id: a block's is known offline (volume·book·chapter
// from its height); a transaction's is resolved the same way the reader resolves
// a citation -- a /tx/<txid>/merkle-proof lookup gives its block height and
// index, yielding volume·book·chapter·§section. Ordered chronologically (reading
// order).

import { reference } from './btc-citation.js';

export const NOTABLE = [
  { title: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks', id: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b' },
  { title: 'Hal Finney transaction', id: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16' },
  { title: 'Bitcoin Pizza Day', id: '57043' },
  // The overflow block/tx were orphaned by the corrective fork; canonical height
  // 74,638 is the honest re-mined block that excised the ~184.4B-BTC overflow, so
  // this entry points at the block itself (no §section) -- the supply cap's repair.
  { title: 'Supply cap bug fix', id: '74638' },
  // Satoshi's quiet cap: blocks past height 79,400 may not exceed 1,000,000
  // bytes -- the first height-flagged soft fork (Sept 12, 2010), and the seed
  // of the block size wars.
  { title: '1 MB size limit activation', id: '79400' },
  { title: '100K block milestone', id: '100000' },
  { title: 'Eligius', id: '139690' },
  { title: 'First P2SH spend', id: 'e5779b9e78f9650debc2893fd9636d827b26b4ddfa6a8172fe8708c924f5c39d' },
  // April 1, 2012 (no joke): the first block mined under BIP16 rules. The
  // first P2SH spend above predates enforcement -- pre-activation, such
  // outputs were spendable under the old rules with the redeem script alone.
  { title: 'BIP16 activation (P2SH)', id: '173805' },
  { title: 'The First Halving', id: '210000' },
  // The block-version story, told through the chapters where each version era
  // begins (heights are Bitcoin Core chainparams consensus constants). Their
  // frontispieces walk the whole notation: v1 (genesis) -> v2/v3/v4 (the
  // integer-bump era, BIP34/66/65) -> word-pair form once BIP9 version bits
  // arrive (CSV is the first version-bits fork; SegWit and Taproot follow).
  { title: 'BIP34 activation (v2)', id: '227931' },
  { title: 'First coinbase OP_RETURN', id: '246816' },
  { title: 'BIP66 activation (v3)', id: '363725' },
  { title: 'BIP65 activation (v4)', id: '388381' },
  { title: 'CSV activation (version bits)', id: '419328' },
  { title: 'The Second Halving', id: '420000' },
  { title: 'Bitcoin Cash fork', id: '478558' },
  { title: 'SegWit activation', id: '481824' },
  { title: '500K block milestone', id: '500000' },
  { title: 'The Third Halving', id: '630000' },
  // The Speedy Trial threshold moment -- the widely cited lock-in block, mined
  // by Slush Pool inside the signaling window, so its frontispiece shows bit 2
  // actually set (…100) the way the activation chapter's no longer does.
  { title: 'Taproot lock-in', id: '687285' },
  { title: 'Romans 12:21', id: '057954bb28527ff9c7701c6fd2b7f770163718ded09745da56cc95e7606afe99' },
  // This txid sits in block 709,632 (Nov 14, 2021), the Taproot activation
  // block, so the citation resolves into the activation chapter at its
  // §section -- an early P2TR payment mined the moment the rules went live.
  { title: 'Taproot activation', id: '777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288' },
  { title: 'First Ordinals inscription', id: '6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799' },
  { title: 'Largest block (at the time)', id: '774628' },
  { title: 'The Fourth Halving', id: '840000' },
  { title: 'Sermon on the Mount', id: 'e53ac3be05bbeb8ea3bbfb7854a4d47eea556daea25f45ad3fe953f375ff7fd8' },
  { title: 'Latest block', id: '-1' },
];

// A block entry may carry an `index`: the transaction's position within the
// block (0-based), rendered as its §section and passed to the book as ?index=.
// e.g. { title: '…', id: '100000', index: 1 } opens block 100000, §2.

// Soft forks with no activation chapter, deliberately absent: the Aug-Sept
// 2010 opcode disablings (OP_CAT and friends, 0.3.x releases) took effect on
// release with no flag height; BIP30 (duplicate-txid ban) switched on by
// timestamp (Mar 15, 2012) and was later applied to nearly the whole chain;
// BIP42 (21M cap fix, Apr 2014) changes nothing until the 2200s. BIP91 (Jul
// 2017) was a transient SegWit-activation aid, not a lasting rule.

// More transaction-level entries still to confirm against the chain before
// adding: payment-type firsts (P2PKH, P2WPKH/P2WSH, P2TR key/script, OP_RETURN
// spend) and a Lightning force-close revealing an HTLC. For the version story,
// still to confirm: the first version-rolled (overt-AsicBoost, BIP320) block --
// no canonical height exists, so it needs a chain scan to identify a good
// exemplar whose frontispiece breaks the accio.abandon idiom.

// A bare non-negative integer is an absolute block height. A negative integer is
// a height relative to the chain tip (-1 = latest block), resolved online.
export const isBlockId = (id) => /^[0-9]+$/.test(id);
export const isRelativeBlockId = (id) => /^-[0-9]+$/.test(id);

// The offline reference for a block id (volume·book·chapter). A transaction id
// has no offline height, so it returns '' and must be resolved at read time.
export function blockRef(id) {
  return isBlockId(id) ? reference(Number(id)) : '';
}

// Format a resolved citation -- a block height and the transaction's index
// within it -- as a full volume·book·chapter·§section reference.
export function refFromProof(height, pos) {
  return reference(height) + (pos != null ? ` §${pos + 1}` : '');
}

// A deep link into the book for a contents entry. An absolute or relative block
// id opens as ?block= (with an optional ?index= selecting a transaction within
// the block); a 64-hex value (block hash or txid) opens as ?txid=, which the
// book resolves as a block first and a transaction second.
export function entryHref(id, index) {
  const isBlock = isBlockId(id) || isRelativeBlockId(id);
  const q = isBlock ? `block=${id}` : `txid=${id}`;
  const idx = isBlock && index != null ? `&index=${index}` : '';
  return `bitcoin-book.html?${q}${idx}`;
}
