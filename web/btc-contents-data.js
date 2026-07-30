// SPDX-License-Identifier: CC-BY-4.0
//
// btc-contents-data.js — the curated table of contents for the Bitcoin Book:
// which blocks and transactions are worth a reader's attention, what to call
// them, and why.
//
// This file is the editorial layer — a reading of the record, not the record
// itself — and is licensed CC BY 4.0, separately from the machinery that
// renders it (btc-contents.js, MIT OR Apache-2.0) and from the book's prose
// (CC0, the chain's own speech). See the README's License section. The split
// is the book's argument applied to its own source tree: what the chain says
// belongs to no one; what someone decided is worth naming carries their name.
//
// Each `id` is handed straight to the book's lookup: a bare number is a block
// height, a 64-hex value a transaction id. Every entry is cited by its
// reference, never its raw id: a block's is known offline (volume·book·chapter
// from its height); a transaction's is resolved the same way the reader resolves
// a citation -- a /tx/<txid>/merkle-proof lookup gives its block height and
// index, yielding volume·book·chapter·§section. Ordered chronologically (reading
// order).

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
  // Block 0 itself. Its coinbase follows as the next entry -- the chapter
  // precedes its own §1 in reading order.
  { title: 'The Genesis Block', id: '0' },
  { title: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks', id: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b' },
  { title: 'Hal Finney transaction', id: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16' },
  // Four days after the Finney transaction (Jan 16, 2009): the first payment
  // to a hash of a public key rather than the key itself -- the form that
  // would carry most of Bitcoin's history.
  { title: 'First P2PKH payment', id: '6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516' },
  // Dec 30, 2009: sixteen windows in, the retarget first moves -- nBits
  // 1d00ffff -> 1d00d86a, difficulty 1 -> ~1.18. Cited by the window that
  // earned it, I β16 (30,240-32,255), the last book mined at difficulty 1.
  // In the frontispiece's notation the demand holds at β₃₂ while the
  // mantissa slips 65535 -> 55402: the first adjustment lives entirely
  // inside the target's mantissa, below the resolution of a zero-bit count.
  { title: 'First difficulty adjustment', id: '30240', page: 'book' },
  // The difficulty series, each entry citing the BOOK whose pace earned the
  // adjustment rather than the chapter where the new target first bound: a
  // retarget is computed from the 2,016 blocks behind it, and a book is
  // exactly those blocks. Titled only by the percentage moved. The stories
  // behind the swings belong to the annotation layer (a coming PR); the
  // notes below are drafted for it to pick up. Figures from the canonical
  // difficulty history. The five largest climbs are all from 2010; the deep
  // cuts cluster later. The up-clamp (×4) was hit once; the deepest cut ever
  // is −27.94%, against a −75% floor.
  //
  // Only Volume I can be cited this way. Book numbering restarts at each
  // halving and 210,000 is not a multiple of 2016, so from Volume II on a
  // real retarget window straddles two books -- offset 672 blocks in Volume
  // III, 1,008 in Volume IV -- and no book names it. Those later entries
  // stay on their retarget chapter, below.
  { title: 'Difficulty +49%', id: '40320', page: 'book' },   // I β21, closing Feb 24, 2010: 2.53 -> 3.78, the CPU-era climb steepening
  { title: 'Difficulty +51%', id: '50400', page: 'book' },   // I β26, closing Apr 21, 2010: 7.82 -> 11.85, the climb's peak grade
  // I β28, closing May 19, 2010: 12.85 -> 11.46. Sixteen windows flat, then
  // twelve adjustments up -- the thirteenth is the first ever to go down:
  // the earliest wave of curiosity ebbing.
  { title: 'First difficulty decrease (−10.8%)', id: '54432', page: 'book' },
  // I β29, closing May 29, 2010: 11.46 -> 16.62, the ebb reversed inside a
  // single window -- the window Pizza Day sits in, at ■596.
  { title: 'Difficulty +45%', id: '56448', page: 'book' },
  { title: 'Bitcoin Pizza Day', id: '57043' },
  // The July 2010 spike, in two consecutive books: Bitcoin v0.3's
  // announcement hit Slashdot on July 11, 2010, and the newcomers -- among
  // them the first GPU miners on what had been a CPU chain -- doubled the
  // network inside I β33, then quadrupled it inside I β34.
  { title: 'Difficulty +93%', id: '64512', page: 'book' },   // closing Jul 13, 2010: 23.50 -> 45.38
  // Closing Jul 16, 2010: 45.38 -> 181.54 -- 2,016 blocks in under four days,
  // and the only retarget ever to reach the ×4 consensus clamp in either
  // direction.
  { title: 'Difficulty +300%', id: '66528', page: 'book' },
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
  // BIP30's origin story: the coinbases of 91,722 and 91,812 were repeated
  // verbatim by 91,880 and 91,842, overwriting them in the UTXO set -- the
  // only two txids ever confirmed twice:
  //   e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468 (91,722 -> 91,880)
  //   d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599 (91,812 -> 91,842)
  // The ban on duplicate txids switched on by timestamp (Mar 15, 2012) rather
  // than by flag block, with exactly these two offenders grandfathered
  // forever. All four printings are cited by height (§1 of their blocks) --
  // a txid lookup can only ever land on one of a duplicate's two sections --
  // and each printing owns its own page number: pages count positions, not
  // distinct txids, so the chain's page count runs exactly two past its
  // distinct-txid count, and these are the two (see btc-pages.js).
  { title: 'Duplicated coinbase e3bf…468, first printing', id: '91722', index: 0 },
  { title: 'Duplicated coinbase d5d2…599, first printing', id: '91812', index: 0 },
  { title: 'Duplicated coinbase d5d2…599, second printing (BIP30)', id: '91842', index: 0 },
  { title: 'Duplicated coinbase e3bf…468, second printing (BIP30)', id: '91880', index: 0 },
  { title: '100K block milestone', id: '100000' },
  { title: 'Eligius', id: '139690' },
  // I β75, closing Oct 31, 2011: the deepest cut of the chain's first decade
  // -- the first bubble's aftermath. June 2011 had taken the price to ~$32
  // and the headlines with it; by Halloween it sat under $3, and the miners
  // the bubble had drawn were unplugging. The last entry a book can cite.
  { title: 'Difficulty −18.03%', id: '149184', page: 'book' },
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
  // These windows straddle two books apiece (see the note at the head of the
  // series), so each cut below is cited by the chapter where its new target
  // first bound.
  { title: 'Difficulty −15.13%', id: '552384' },  // Dec 3, 2018: the 2018 bear market's capitulation -- price a fifth of its peak, older ASICs shut off at a loss
  { title: 'Difficulty −15.95%', id: '622944' },  // Mar 26, 2020: the covid crash -- Black Thursday (Mar 12) halved the price in a day, and the marginal miners followed it down
  { title: 'The Third Halving', id: '630000' },
  { title: 'Difficulty −16.05%', id: '655200' },  // Nov 3, 2020: Sichuan's wet season ending -- the annual migration off cheap hydro, seasonal weather written into the target
  { title: 'Difficulty −15.97%', id: '685440' },  // May 30, 2021: China's first regulatory squeeze on mining, five weeks before the ban proper
  // The Speedy Trial threshold moment -- the widely cited lock-in block, mined
  // by Slush Pool inside the signaling window, so its frontispiece shows bit 2
  // actually set (…100) the way the activation chapter's no longer does.
  { title: 'Taproot lock-in', id: '687285' },
  // Jul 3, 2021: the largest downward adjustment ever -- China's blanket
  // mining ban, roughly half the network's hashrate unplugged in weeks. The
  // frontispieces on either side of this boundary are the ban in two lines
  // of β; the recovery that follows, as the exiled machines came back online
  // elsewhere, took the rest of the year.
  { title: 'Difficulty −27.94%', id: '689472' },
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
];

// A block entry may carry an `index`: the transaction's position within the
// block (0-based), rendered as its §section and passed to the book as ?index=.
// e.g. { title: '…', id: '100000', index: 1 } opens block 100000, §2.

// ── The appendices ────────────────────────────────────────────────────────
// A chain with no last block has no back, which is why the sigla sit in the
// front matter (see the README). What can still be gathered at the end of
// the CONTENTS is what belongs to the book but not to its reading order --
// reading order being the order blocks were mined.
//
// Three, numbered like volumes and rendered in this order:
//
//   I   The Mempool -- the chapters the queue is already forming, which is
//       why it comes first: it opens where the volumes close, so the turn
//       from the chain tip to the next provisional chapter stays a single
//       step down the page. Built live by the page from the queue itself
//       (bitcoin-contents.html); nothing to list here but its heading.
//   II  Future Chapters -- heights consensus has already fixed, too far out
//       for any queue to reach: flag days, activations, the 21M cap. A
//       height is a citation the moment consensus fixes it, whether or not
//       a block has reached it -- the reference is exact and computable
//       today and only the ■ is unearned, so these print the expected mark
//       □, the same mark the mempool's projections wear, and their lookups
//       answer with a date instead of a page. Listed apart rather than in
//       reading order because a chapter cited before it exists cannot be
//       read in sequence with chapters that do: dropped in among the
//       volumes, BIP42 alone opened a Volume LXV two centuries wide.
//   III Ledgers -- the shelf of curated ledgers (btc-index-data.js), and
//       any the reader keeps. Addresses, not chapters: an entry here cites
//       no one place but a run of them, discovered at read time, so it
//       carries its address where a chapter carries its reference. The
//       contents and the index are inverses; this is where the contents
//       points at the other one.
//
// A part's `kind` says who fills it: 'entries' is listed below, 'mempool'
// and 'ledgers' are gathered by the page. Entries take the same shape as
// NOTABLE's -- `id` is handed to the same lookup -- with a `note` carrying
// the caveat the row shows on hover. Editorial, like the titles: what is
// promised is a citation, not a prophecy.
export const APPENDIX = [
  {
    kind: 'mempool',
    title: 'The Mempool',
    note: 'The chapters the queue is already forming, ordered as a miner would take them — provisional numbers that hold only while the queue does, and only the first is a real forecast.',
  },
  {
    kind: 'entries',
    title: 'Future Chapters',
    note: 'Chapters whose citations are fixed but whose blocks are unmined: consensus has named the height, the chain has yet to reach it. Each reference carries □, the expected-chapter mark, until a block earns it the ■.',
    entries: [
      // BIP110 (reduced_data, the 2026 temporary data-limit attempt; bit 4,
      // 55% of a signaling window): nothing has activated to cite -- ~0.5%
      // signaling as of July 2026 -- but its BIP8-style heights are citable
      // sight unseen, three real retarget boundaries one book apart, sharing
      // a chapter number. Conditional in a way BIP42's height is not: the
      // blocks will be mined either way, on schedule, and will carry these
      // names only if the fork locks in. The signaling story's exemplar is
      // already in the contents proper: the first bit-4 block, V β50 ■120.
      { title: 'BIP110 mandatory signaling', id: '961632',
        note: 'BIP8-style flag height — mandatory signaling from 961,632, should BIP110 lock in. ~0.5% of blocks signaling as of July 2026, against a 55% threshold.' },
      { title: 'BIP110 lock-in', id: '963648',
        note: 'Lock-in by 963,648, one book on, should the threshold be met.' },
      { title: 'BIP110 activation', id: '965664',
        note: 'Activation at 965,664, one book after lock-in — the height where the reduced data limit would first bind.' },
      // The one activation block whose height is already consensus and still
      // will not exist for two centuries: BIP42 (April 1, 2014) capped the
      // subsidy schedule where the 64th halving's undefined bit-shift would
      // have resurrected the 50-BTC reward. Cited now, mineable later; until
      // then its lookup answers "Block not found. Come back in the year 2262."
      { title: 'BIP42 activation (21M cap)', id: '13440000',
        note: 'The book’s last chapter, and the only one whose date is already known: BIP42’s cap first binds at 13,440,000, the opening chapter of Volume LXV, due around the year 2262.' },
    ],
  },
  {
    kind: 'ledgers',
    title: 'Ledgers',
    note: 'Addresses the book keeps a ledger for, and any the reader keeps. A ledger cites no single chapter but the run of them its address appears in, discovered from the chain as it is read — so each is named by its address where a chapter is named by its reference.',
  },
];

// More transaction-level entries still to confirm against the chain before
// adding: the first P2TR output ever (a purse.io withdrawal of 5,431 sats,
// Dec 17, 2019, pre-activation -- txid still to confirm) and the first P2TR
// key-path and script-path spends; a Lightning force-close revealing an HTLC
// (the famous first LN payment, Dec 28, 2017, was off-chain, so it needs an
// on-chain artifact). For the version story, still to confirm: the first
// version-rolled (overt-AsicBoost, BIP320) block -- no canonical height
// exists, so it needs a chain scan to identify a good exemplar whose
// frontispiece breaks the accio.abandon idiom.
//
// These are candidates, not citations, so they stay comments: the appendix's
// provisional part lists chapters whose references are already exact, not
// chapters whose subjects are still being looked for.
