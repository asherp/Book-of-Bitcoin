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

// An entry may carry `page: 'book'`: its id is then the first block of a book
// (a difficulty window), and the entry opens that book's own leaf rather than
// a chapter. The soft forks that activated by miner signaling -- the 95%
// supermajority forks (BIP34/66/65) and the version-bits forks (CSV, SegWit,
// Taproot) -- each mark the book their activation closed, since for them the
// difficulty window is the ballot box; flag-day and release-based forks get
// no book. BIP91 signaled over its own 336-block epochs, which no book
// aligns with -- but its whole drama still fits one book: III β29 opens,
// locks it in at ■321, and activates it at ■673.

export const NOTABLE = [
  { title: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks', id: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b' },
  { title: 'Hal Finney transaction', id: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16' },
  // Four days after the Finney transaction (Jan 16, 2009): the first payment
  // to a hash of a public key rather than the key itself -- the form that
  // would carry most of Bitcoin's history.
  { title: 'First P2PKH payment', id: '6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516' },
  { title: 'Bitcoin Pizza Day', id: '57043' },
  // The supply-cap incident, cited at I β37 ■1846 §3 (block 74,421, section
  // 3): the ~184.4B-BTC overflow the corrective fork went on to excise.
  { title: 'Supply cap bug fix', id: '74421', index: 2 },
  // The corrective fork carried a second ruleset: 0.3.10 also disabled a
  // dozen script opcodes (OP_CAT, OP_LSHIFT & co., Aug 15, 2010), following
  // 0.3.6's forced-fail OP_RETURN (July 29). Release-based soft forks with no
  // flag height, so the fork block that put the patched rules in charge of
  // the chain is the closest thing they have to an activation chapter.
  { title: 'Script opcode purge', id: '74638' },
  // Satoshi's quiet cap: blocks past height 79,400 may not exceed 1,000,000
  // bytes -- the first height-flagged soft fork (Sept 12, 2010), and the seed
  // of the block size wars.
  { title: '1 MB size limit activation', id: '79400' },
  // BIP30's origin story: the coinbases of 91,812 and 91,722 were repeated
  // verbatim by 91,842 and 91,880, overwriting them in the UTXO set. The ban
  // on duplicate txids switched on by timestamp (Mar 15, 2012) rather than by
  // flag block, with exactly these two offenders grandfathered forever -- so
  // the first of them anchors the chapter.
  { title: 'Duplicate coinbase (BIP30)', id: '91842' },
  { title: '100K block milestone', id: '100000' },
  { title: 'Eligius', id: '139690' },
  // Block 164,467 (Jan 30, 2012): the first bare-multisig output -- 1-of-2,
  // one signature from a choice of two keys (BIP11).
  { title: 'First multisig (1-of-2)', id: '60a20bd93aa49ab4b28d514ec10b06e1829ce6818ec06cd3aabd013ebcdc4bb1' },
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
  { title: 'BIP34', id: '226128', page: 'book' },
  { title: 'BIP34 activation (v2)', id: '227931' },
  { title: 'First coinbase OP_RETURN', id: '246816' },
  // The first OP_RETURN under 0.9.0's standardness (Mar 2014), and the data
  // it chose to immortalize: "charley loves heidi".
  { title: 'First standard OP_RETURN', id: '8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684' },
  { title: 'BIP66', id: '363216', page: 'book' },
  { title: 'BIP66 activation (v3)', id: '363725' },
  { title: 'BIP65', id: '387408', page: 'book' },
  { title: 'BIP65 activation (v4)', id: '388381' },
  { title: 'CSV', id: '417648', page: 'book' },
  { title: 'CSV activation (version bits)', id: '419328' },
  { title: 'The Second Halving', id: '420000' },
  // The blocksize-war wedge: BIP91 locked in at 476,768 and from this block
  // (July 22, 2017) briefly made SegWit signaling mandatory -- blocks not
  // setting bit 1 were rejected -- squeezing BIP141 over its own 95%
  // threshold. A transient rule, spent once SegWit locked in, but a soft
  // fork all the same.
  { title: 'BIP91', id: '476448', page: 'book' },
  { title: 'BIP91 activation (SegWit mandate)', id: '477120' },
  { title: 'Bitcoin Cash fork', id: '478558' },
  { title: 'SegWit', id: '480480', page: 'book' },
  { title: 'SegWit activation', id: '481824' },
  // The activation block's own firsts. The first witness ever used spent a
  // P2SH-wrapped P2WPKH funded 159 blocks early (481,665) -- parked looking
  // like any P2SH payment, revealed the moment the rules went live. The
  // first native outputs (a P2WPKH and a P2WSH) follow in the same block;
  // the P2WSH's reveal -- a 2-of-3 multisig under the hash -- came only when
  // spent, and its citation resolves to wherever that spend landed.
  { title: 'First SegWit spend', id: '8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c' },
  { title: 'First native SegWit outputs', id: 'dfcec48bb8491856c353306ab5febeb7e99e4d783eedf3de98f3ee0812b92bad' },
  { title: 'First P2WSH reveal (2-of-3)', id: 'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255' },
  { title: '500K block milestone', id: '500000' },
  { title: 'The Third Halving', id: '630000' },
  // The Speedy Trial threshold moment -- the widely cited lock-in block, mined
  // by Slush Pool inside the signaling window, so its frontispiece shows bit 2
  // actually set (…100) the way the activation chapter's no longer does.
  { title: 'Taproot lock-in', id: '687285' },
  { title: 'Romans 12:21', id: '057954bb28527ff9c7701c6fd2b7f770163718ded09745da56cc95e7606afe99' },
  { title: 'Taproot', id: '708624', page: 'book' },
  // This txid sits in block 709,632 (Nov 14, 2021), the Taproot activation
  // block, so the citation resolves into the activation chapter at its
  // §section -- an early P2TR payment mined the moment the rules went live.
  { title: 'Taproot activation', id: '777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288' },
  { title: 'First Ordinals inscription', id: '6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799' },
  { title: 'Largest block (at the time)', id: '774628' },
  { title: 'The Fourth Halving', id: '840000' },
  { title: 'Sermon on the Mount', id: 'e53ac3be05bbeb8ea3bbfb7854a4d47eea556daea25f45ad3fe953f375ff7fd8' },
  // Block 0000000000000000000161b65dc9cf0adfdad107b801cd87f1dcf0cfbb454654:
  // the first block to signal for BIP110 (reduced_data) -- its frontispiece
  // shows bit 4 set (…10000), the same bit BIP91 once flew.
  { title: 'First BIP110 signaling block', id: '938903' },
  { title: 'Latest block', id: '-1' },
  // The one activation block that does not exist yet: BIP42 (April 1, 2014)
  // capped the subsidy schedule where the 64th halving's undefined bit-shift
  // would have resurrected the 50-BTC reward. Its rules first bind at height
  // 13,440,000 -- LXV β1 ■1, the opening chapter of Volume 65, due around the
  // year 2262. Cited now, mineable later; until then its lookup answers
  // "Block not found. Come back in the year 2262."
  { title: 'BIP42 activation (21M cap)', id: '13440000' },
];

// A block entry may carry an `index`: the transaction's position within the
// block (0-based), rendered as its §section and passed to the book as ?index=.
// e.g. { title: '…', id: '100000', index: 1 } opens block 100000, §2.

// More transaction-level entries still to confirm against the chain before
// adding: the first P2TR output ever (a purse.io withdrawal of 5,431 sats,
// Dec 17, 2019, pre-activation -- txid still to confirm) and the first P2TR
// key-path and script-path spends; a Lightning force-close revealing an HTLC
// (the famous first LN payment, Dec 28, 2017, was off-chain, so it needs an
// on-chain artifact). For the version story, still to confirm: the first
// version-rolled (overt-AsicBoost, BIP320) block -- no canonical height
// exists, so it needs a chain scan to identify a good exemplar whose
// frontispiece breaks the accio.abandon idiom.

// BIP110 (reduced_data, the 2026 temporary data-limit attempt; bit 4, 55% of
// a signaling window): nothing activated to cite -- ~0.5% signaling as of
// July 2026. Its BIP8-style heights are citable sight unseen should it ever
// lock in: mandatory signaling from 961,632 (V β61 ■673), lock-in by 963,648
// (V β62 ■673), activation at 965,664 (V β63 ■673) -- three real retarget
// boundaries, one book apart, sharing a chapter number. The signaling story's
// exemplar is already in the list: the first bit-4 block, V β50 ■120.

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
// book resolves as a block first and a transaction second. A `page: 'book'`
// entry opens its book's own leaf (?page=book) instead of a chapter.
export function entryHref(id, index, page) {
  const isBlock = isBlockId(id) || isRelativeBlockId(id);
  const q = isBlock ? `block=${id}` : `txid=${id}`;
  if (isBlock && page === 'book') return `bitcoin-book.html?${q}&page=book`;
  const idx = isBlock && index != null ? `&index=${index}` : '';
  return `bitcoin-book.html?${q}${idx}`;
}
