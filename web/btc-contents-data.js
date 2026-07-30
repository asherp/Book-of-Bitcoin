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

// ── The commentary ────────────────────────────────────────────────────────
//
// An entry may also carry a reading of the passage it names -- why the block
// matters, what the record does and does not say about it. The book page
// offers it as a sheet beside the notation key, over the passage rather than
// in it, and only where there is one; the static passages under /passages/
// carry the same text for readers without JavaScript. The machinery that
// matches and sets it is btc-commentary.js (MIT OR Apache-2.0); the words are
// editorial and stay here, under this file's CC BY 4.0.
//
//   note: 'One paragraph.'          the book's own reading -- the house voice,
//   note: ['First.', 'Second.']     unsigned, because the book is its author
//   commentary: [                   readings by others: their copyright, kept
//     { note: '…', by: 'Name',      under their own name and published here
//       href: 'https://…' },        under CC BY 4.0 (see CONTRIBUTING.md)
//   ]
//
// Most entries carry nothing, and that is the normal state of an annotation
// layer: a place can be worth keeping before anyone has finished saying why.
// The one rule the notes hold to is the book's: state what the record says,
// then say plainly whose claim the rest is. Where a story is not yet checked
// against the chain it stays a source comment rather than becoming a note --
// commentary is published matter, and publishing it is the assertion.

export const NOTABLE = [
  // Block 0 itself. Its coinbase follows as the next entry -- the chapter
  // precedes its own §1 in reading order.
  {
    title: 'The Genesis Block', id: '0',
    note: [
      "The one chapter with no predecessor. Every other block cites the hash of the one before it; this header carries 256 zero bits where that citation goes — the book writes it as it is, an empty slot rather than a beginning.",
      "It is also the only chapter nobody had to fetch: the genesis block ships inside the software, hardcoded into every node that has ever validated anything, so no reader takes it on anyone's authority. Its fifty coins have never moved, and by a quirk of the original code the reward was never entered into the set of spendable outputs at all. The book opens with a page of speech that cannot be answered and a coin that cannot be spent.",
    ],
  },
  {
    title: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
    id: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    note: [
      "A coinbase input spends nothing, so its script is a slot a miner may write anything into. The first one holds the front-page headline of The Times of London for 3 January 2009.",
      "It does two things at once. It is a date stamp — a block cannot have been made before the newspaper it quotes, which is how anyone reading later can see the chain was not backdated. And it is an argument: the rescue of the banks, named in the opening sentence of a system built so that nobody has to be rescued. It is the closest thing to an editorial line anywhere in this book, and the chain itself wrote it.",
    ],
  },
  {
    title: 'Hal Finney transaction', id: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16',
    note: [
      "Nine days into the chain, the first transaction that is a payment rather than a reward: ten coins from Satoshi Nakamoto to Hal Finney, who was running the second node on the network and had written “Running bitcoin” two days earlier.",
      "Read the outputs and the book's grammar explains itself. Forty coins come back as change, because a spend does not move an amount — it consumes a coin whole and writes new ones. Every section after this one is built the same way, and this is where a reader first sees it.",
    ],
  },
  {
    title: 'First P2PKH payment', id: '6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516',
    note: "Four days after the Finney transaction (16 January 2009): the first payment made to the hash of a public key rather than to the key itself — the form that would carry most of Bitcoin's history. Paying a hash keeps the key out of sight until the coin is spent, and shortens what has to be written down, read aloud, or printed on paper. The book sets the pattern ⧉ ⌖ h²⁰ ≡ ∇, and a reader will meet those five marks more often than any other line in the manuscript.",
  },
  {
    title: 'First difficulty adjustment', id: '30240', page: 'book',
    note: "Sixteen windows in, the target moves for the first time (30 December 2009): nBits 1d00ffff → 1d00d86a, difficulty 1 → about 1.18. The entry cites the window that earned the change rather than the chapter where the new target first bound — a retarget is computed from the 2,016 blocks behind it, and a book is exactly those blocks. In the frontispiece's notation the demand holds at β₃₂ while the mantissa slips 65535 → 55402: the first adjustment lives entirely inside the target's mantissa, below the resolution of a zero-bit count.",
  },
  // The difficulty series, each entry citing the BOOK whose pace earned the
  // adjustment rather than the chapter where the new target first bound: a
  // retarget is computed from the 2,016 blocks behind it, and a book is
  // exactly those blocks. Titled only by the percentage moved -- the story
  // behind each swing is its note. Figures from the canonical difficulty
  // history. The five largest climbs are all from 2010; the deep cuts cluster
  // later. The up-clamp (×4) was hit once; the deepest cut ever is −27.94%,
  // against a −75% floor.
  //
  // Only Volume I can be cited this way. Book numbering restarts at each
  // halving and 210,000 is not a multiple of 2016, so from Volume II on a
  // real retarget window straddles two books -- offset 672 blocks in Volume
  // III, 1,008 in Volume IV -- and no book names it. Those later entries
  // stay on their retarget chapter, below.
  {
    title: 'Difficulty +49%', id: '40320', page: 'book',
    note: "Closing 24 February 2010: 2.53 → 3.78, the CPU era's climb steepening. Nothing decided this; the target is not a policy but a census, taken every 2,016 blocks, of how many machines bothered to show up.",
  },
  {
    title: 'Difficulty +51%', id: '50400', page: 'book',
    note: "Closing 21 April 2010: 7.82 → 11.85, the steepest grade of the first climb — a fifty-per-cent rise twice inside two months, on a network still small enough that a single enthusiast's new computer moved the number.",
  },
  {
    title: 'First difficulty decrease (−10.8%)', id: '54432', page: 'book',
    note: "Closing 19 May 2010: 12.85 → 11.46. Sixteen windows flat, then twelve adjustments up — and the thirteenth is the first ever to go down. The earliest wave of curiosity ebbing, recorded by the only instrument that was watching.",
  },
  {
    title: 'Difficulty +45%', id: '56448', page: 'book',
    note: "Closing 29 May 2010: 11.46 → 16.62, the ebb reversed inside a single window. This is the book Pizza Day sits in, at ■596: the week the chain got its most famous lunch and its fastest recovery in the same 2,016 blocks.",
  },
  {
    title: 'Bitcoin Pizza Day', id: '57043',
    note: [
      "Ten thousand coins for two pizzas, 22 May 2010 — arranged on a forum between a man who offered the coins and a man who ordered the food, and remembered ever since as the first time bitcoin bought a physical thing.",
      "What the record says is that ten thousand coins moved to a script. That they bought pizza is testimony from the people involved; no node checked it, and nothing in this passage carries it. Everything the day is famous for lives in that gap — the implied price, the regret, the anniversary. The chain has no opinion about lunch, which is exactly why the claim needs a name on it.",
    ],
  },
  // The July 2010 spike, in two consecutive books: Bitcoin v0.3's
  // announcement hit Slashdot on July 11, 2010, and the newcomers -- among
  // them the first GPU miners on what had been a CPU chain -- doubled the
  // network inside I β33, then quadrupled it inside I β34.
  {
    title: 'Difficulty +93%', id: '64512', page: 'book',
    note: "Closing 13 July 2010: 23.50 → 45.38. Bitcoin v0.3's announcement reached Slashdot on 11 July and the newcomers arrived inside the window — among them the first GPU miners on what had until then been a CPU chain.",
  },
  {
    title: 'Difficulty +300%', id: '66528', page: 'book',
    note: "Closing 16 July 2010: 45.38 → 181.54 — 2,016 blocks in under four days, and the only retarget ever to reach the fourfold clamp consensus puts on a single adjustment in either direction. The rules allow the target to be wrong for a fortnight rather than let it be corrected all at once.",
  },
  // The supply-cap incident, cited at I β37 ■1846 §3 (block 74,421, section
  // 3): the ~184.4B-BTC overflow the corrective fork went on to excise. Left
  // as a source comment rather than a published note until the section is
  // re-checked against the chain the book reads from -- the story is well
  // known, this passage's exact place in it less so.
  { title: 'Supply cap bug fix', id: '74421', index: 2 },
  {
    title: 'Script opcode purge', id: '74638',
    note: "The corrective fork of 15 August 2010 carried a second ruleset with it: 0.3.10 also disabled a dozen script opcodes — OP_CAT, the shifts and the splices — following 0.3.6's forced-fail OP_RETURN a fortnight earlier. Both are release-based soft forks with no flag height, so the fork block that put the patched rules in charge of the chain is the closest thing they have to an activation chapter. A good part of the sigla leaf is a list of things a script may no longer do; most of them stopped here.",
  },
  {
    title: '1 MB size limit activation', id: '79400',
    note: "Satoshi's quiet cap: from height 79,400 a block may not exceed 1,000,000 bytes. The first height-flagged soft fork (12 September 2010), announced almost nowhere, and the seed of the block size wars — seven years of argument over one sentence about how long a chapter may be, and who gets to write it.",
  },
  // BIP30's origin story: the coinbases of 91,722 and 91,812 were repeated
  // verbatim by 91,880 and 91,842, overwriting them in the UTXO set -- the
  // only two txids ever confirmed twice:
  //   e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468 (91,722 -> 91,880)
  //   d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599 (91,812 -> 91,842)
  // All four printings are cited by height (§1 of their blocks) -- a txid
  // lookup can only ever land on one of a duplicate's two sections -- and
  // each printing owns its own page number: pages count positions, not
  // distinct txids, so the chain's page count runs exactly two past its
  // distinct-txid count, and these are the two (see btc-pages.js).
  {
    title: 'Duplicated coinbase e3bf…468, first printing', id: '91722', index: 0,
    note: "One of only two transactions ever confirmed twice. Two miners running the same default configuration produced byte-identical coinbases, and nothing in the rules yet forbade it — so the second printing (block 91,880) overwrote this one in the set of spendable outputs and destroyed its reward. The book prints both, because both were written.",
  },
  {
    title: 'Duplicated coinbase d5d2…599, first printing', id: '91812', index: 0,
    note: "The other of the two. Its second printing follows thirty chapters later, at block 91,842, and takes this reward with it.",
  },
  {
    title: 'Duplicated coinbase d5d2…599, second printing (BIP30)', id: '91842', index: 0,
    note: "The same transaction, written a second time. BIP30's ban on duplicate transaction ids switched on by timestamp (15 March 2012) rather than by flag block, with exactly these two offenders grandfathered forever — a rule that had to be written around the record instead of over it.",
  },
  {
    title: 'Duplicated coinbase e3bf…468, second printing (BIP30)', id: '91880', index: 0,
    note: "The last of the four printings. Each owns its own page in this book: pages count positions in the chain, not distinct transaction ids, so the book's page count runs exactly two past the chain's count of distinct transactions — and these are the two.",
  },
  {
    title: '100K block milestone', id: '100000',
    note: "A round number is not an event. Nothing in the rules changes at one hundred thousand; the only reason to stop here is that we count in tens. The book keeps such chapters anyway, because a reader wants somewhere to stand — and because the frontispieces either side of the milestone show how little the chain notices it.",
  },
  { title: 'Eligius', id: '139690' },
  {
    title: 'Difficulty −18.03%', id: '149184', page: 'book',
    note: "I β75, closing 31 October 2011: the deepest cut of the chain's first decade, and the first bubble's aftermath. June 2011 had taken the price to about $32 and the headlines with it; by Halloween it sat under $3, and the miners the bubble had drawn were unplugging. The last entry a book can cite — from Volume II on, retarget windows straddle two books and no book names them.",
  },
  {
    title: 'First multisig (1-of-2)', id: '60a20bd93aa49ab4b28d514ec10b06e1829ce6818ec06cd3aabd013ebcdc4bb1',
    note: "Block 164,467 (30 January 2012): the first bare-multisig output — one signature from a choice of two keys (BIP11). Written into the output itself rather than hidden behind a hash, so the terms are legible to anyone reading the block. It is the last generation of lock that tells you how it works before it is opened; the entry after next is where that stops.",
  },
  {
    title: 'First P2SH spend', id: 'e5779b9e78f9650debc2893fd9636d827b26b4ddfa6a8172fe8708c924f5c39d',
    note: "The first spend of a pay-to-script-hash output — a lock that says only “the script whose hash is this” and leaves the terms to the spend that reveals them. This one predates enforcement: before BIP16 activated, such an output could be spent under the old rules with the redeem script alone. The same bytes meant one thing the week this section was written and another a few weeks later, which is what a soft fork is. The book renders the reveal as (r): the run of a script the chain had never seen until it was needed.",
  },
  {
    title: 'BIP16 activation (P2SH)', id: '173805',
    note: "1 April 2012, no joke: the first block mined under BIP16 rules. An activation chapter for a soft fork looks like any other chapter — the change is in what the chain will no longer accept, not in anything printed here. From this page on, a hash in an output can stand for terms of any complexity, and the reader learns them only when someone spends it.",
  },
  {
    title: 'The First Halving', id: '210000',
    note: "This chapter opens Volume II. Every 210,000 blocks the subsidy halves — fifty coins to twenty-five, 28 November 2012 — which is why this book's volumes are halving eras rather than a shelf's convenience: they are the unit of the chain's own arithmetic. The whole monetary policy is one line of that arithmetic, checked by every node against a block it did not make.",
  },
  // The block-version story, told through the chapters where each version era
  // begins (heights are Bitcoin Core chainparams consensus constants). Their
  // frontispieces walk the whole notation: v1 (genesis) -> v2/v3/v4 (the
  // integer-bump era, BIP34/66/65) -> word-pair form once BIP9 version bits
  // arrive (CSV is the first version-bits fork; SegWit and Taproot follow).
  {
    title: 'BIP34', id: '226128', page: 'book',
    note: "The window whose signals closed the first of the three supermajority forks: miners set their block version to 2, and at 95% the new rule bound on everyone. For a fork counted in block versions the difficulty window is the ballot box, which is why the entry names a book's leaf and not a chapter.",
  },
  {
    title: 'BIP34 activation (v2)', id: '227931',
    note: "From this chapter a coinbase must state the height of the block it sits in — the chain's first self-referential rule. It also ends the duplicate-coinbase problem structurally: two blocks at different heights can no longer write the same coinbase, so the accident BIP30 had to grandfather cannot recur.",
  },
  { title: 'First coinbase OP_RETURN', id: '246816' },
  {
    title: 'First standard OP_RETURN', id: '8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684',
    note: "The first OP_RETURN under 0.9.0's standardness rules (March 2014), and the words it chose to keep: “charley loves heidi”. A provably unspendable output — ¶ in the book's notation — is the courteous way to write data into a ledger: it pays a fee, carries no coin, and never sits in anyone's set of spendable outputs waiting to be swept up. Bitcoin's long argument about data on the chain starts here, in a sentence about two people.",
  },
  {
    title: 'BIP66', id: '363216', page: 'book',
    note: "The window that closed the strict-DER fork — the second supermajority vote counted in block versions, and the last quiet one.",
  },
  {
    title: 'BIP66 activation (v3)', id: '363725',
    note: [
      "Strict DER encoding: a signature must from here be written one way only. The rule closed a class of disagreement that came from asking a general-purpose cryptography library what counted as a signature — a consensus system cannot delegate that question.",
      "Its activation also produced the chain's most instructive accident: miners building on a block they had not themselves validated extended an invalid chain for several blocks, and the split was resolved by hash power and phone calls rather than by rules. A soft fork is only as strong as the validation standing behind the signals.",
    ],
  },
  {
    title: 'BIP65', id: '387408', page: 'book',
    note: "The third and last of the supermajority windows, closing the fork that gave scripts a clock.",
  },
  {
    title: 'BIP65 activation (v4)', id: '388381',
    note: "CHECKLOCKTIMEVERIFY: from December 2015 an output can refuse to be spent before a stated time or height. The book draws it τ. It is the first opcode that lets a lock make a promise about the future rather than about a key, and everything later built on delay — escrows, vaults, payment channels — begins with a mark for “not before”.",
  },
  {
    title: 'CSV', id: '417648', page: 'book',
    note: "The first fork ever counted by version bits (BIP9) rather than by a version number: nine signaling bits, each an independent question, in place of one integer that could only be bumped. Every activation later in this book is counted the way this window counted.",
  },
  {
    title: 'CSV activation (version bits)', id: '419328',
    note: "Relative timelocks (BIP68, 112, 113) — Δ in the book's notation: not before so many blocks after the coin being spent was itself confirmed. Absolute time says when; relative time says how long after, which is what a payment channel needs to give a wronged party a window in which to react. The Lightning table in the notation key is written almost entirely in this mark and the last one.",
  },
  {
    title: 'The Second Halving', id: '420000',
    note: "Twelve and a half coins from here (9 July 2016), and the first chapter of Volume III. The first halving happened to a few thousand people; this one had an audience, a countdown, and a price chart — none of which the schedule consults.",
  },
  {
    title: 'BIP91', id: '476448', page: 'book',
    note: "The blocksize war's wedge, and its whole drama inside one book: III β29 opens, BIP91 locks in at ■321, and it activates at ■673. It signaled over its own 336-block epochs, which no book aligns with — but a book still holds the story end to end.",
  },
  {
    title: 'BIP91 activation (SegWit mandate)', id: '477120',
    note: "From 22 July 2017 signaling for SegWit was briefly mandatory: a block that did not set bit 1 was rejected, squeezing BIP141 over its own 95% threshold. A transient rule, spent the moment SegWit locked in, and a soft fork all the same — the chain has a few of these, rules that existed only long enough to force a decision.",
  },
  {
    title: 'Bitcoin Cash fork', id: '478558',
    note: "The last chapter both chains share. On 1 August 2017 a competing implementation began building on this block under different rules, and everything after it is two records rather than one. Nothing in this chapter marks the split: a chain fork is not an event inside a block, it is a disagreement about which blocks come next. This book reads one of the two, and says so here rather than leaving a reader to assume there is only one.",
  },
  {
    title: 'SegWit', id: '480480', page: 'book',
    note: "The window whose signaling finally carried BIP141 — after the mandate a book earlier had made not signaling a way to lose blocks.",
  },
  {
    title: 'SegWit activation', id: '481824',
    note: [
      "From 24 August 2017 the witness — the signatures and the scripts that satisfy a lock — is committed to the block through a tree of its own and left out of the name of the transaction it authorizes.",
      "Which is why this book has footnotes. A section's witness is quoted beneath its passage, bound into the chapter through the witness commitment in §1, never inside the transaction's own identity. Transaction malleability ends here, and for the same reason a payment channel can be built out of transactions that have been signed but not yet published.",
    ],
  },
  {
    title: 'First SegWit spend', id: '8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c',
    note: "The first witness ever used, in the activation block itself: it spends a P2SH-wrapped P2WPKH output funded 159 blocks early, parked looking like any ordinary P2SH payment and revealed the moment the rules went live. Somebody had the transaction ready and waiting.",
  },
  {
    title: 'First native SegWit outputs', id: 'dfcec48bb8491856c353306ab5febeb7e99e4d783eedf3de98f3ee0812b92bad',
    note: "The first outputs written in the new form outright — a P2WPKH and a P2WSH, in the activation block — rather than wrapped in a P2SH hash for the benefit of software that had not been upgraded. The book sets them ⓪ h²⁰ and ⓪ h³²: a version byte, then a commitment, and nothing else.",
  },
  {
    title: 'First P2WSH reveal (2-of-3)', id: 'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255',
    note: "A P2WSH output says only which hash the script must match; the terms arrive with the spend. Here they turn out to be a 2-of-3 multisig, and this is the section where the chain first learns it — the entry's citation resolves to wherever that spend landed, not to the block that funded it.",
  },
  {
    title: '500K block milestone', id: '500000',
    note: "Another round number, and this one arrived in December 2017 — the month the queue for block space grew long enough that a fee stopped being a rounding error and became a bid. Everyone who had spent the previous seven years arguing about a limit found out that month what one feels like.",
  },
  // These windows straddle two books apiece (see the note at the head of the
  // series), so each cut below is cited by the chapter where its new target
  // first bound.
  {
    title: 'Difficulty −15.13%', id: '552384',
    note: "3 December 2018: the 2018 bear market's capitulation. The price sat at a fifth of its peak, and older machines that had been marginal became losses — the target recording, a fortnight late as always, that they had been switched off.",
  },
  {
    title: 'Difficulty −15.95%', id: '622944',
    note: "26 March 2020: the covid crash. Black Thursday, two weeks earlier, halved the price in a day and the marginal miners followed it down. Read the series and the target is a slow, honest instrument — it never predicts anything, and it never misses anything either.",
  },
  {
    title: 'The Third Halving', id: '630000',
    note: "Six and a quarter coins from here (11 May 2020), and the first chapter of Volume IV. Third time, same arithmetic: the block that pays half of what the block before it paid, because 630,000 divides three times and not because anyone decided anything in 2020.",
  },
  {
    title: 'Difficulty −16.05%', id: '655200',
    note: "3 November 2020: Sichuan's wet season ending. The annual migration off cheap hydro, written into the chain's target as plainly as weather is written into a river gauge — and the clearest case in the series of the chain recording something entirely physical.",
  },
  {
    title: 'Difficulty −15.97%', id: '685440',
    note: "30 May 2021: China's first regulatory squeeze on mining, five weeks before the ban proper. The cut that reads, in hindsight, like the tremor before the entry three below.",
  },
  {
    title: 'Taproot lock-in', id: '687285',
    note: "The Speedy Trial threshold moment: the widely cited lock-in block, mined inside the signaling window, so its frontispiece still shows bit 2 actually set (…100) the way the activation chapter's no longer does. A version-bits fork leaves its ballot in the record; this is the page where the count crossed.",
  },
  {
    title: 'Difficulty −27.94%', id: '689472',
    note: "3 July 2021: the largest downward adjustment ever recorded, against a floor of −75%. China's blanket ban on mining unplugged roughly half the network's hash power in a matter of weeks. The frontispieces either side of this boundary are the ban in two lines of β; the recovery, as the exiled machines came back online elsewhere, took the rest of the year.",
  },
  { title: 'Romans 12:21', id: '057954bb28527ff9c7701c6fd2b7f770163718ded09745da56cc95e7606afe99' },
  {
    title: 'Taproot', id: '708624', page: 'book',
    note: "The last window in the book so far to close a fork, and the first to do it under Speedy Trial — a signaling period with a deadline, designed so that a failed vote fails quickly instead of hanging over the chain.",
  },
  {
    title: 'Taproot activation', id: '777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288',
    note: "An early Taproot payment, mined the moment the rules went live — the citation resolves into the activation chapter at its own §section. From here an output can be a single thirty-two-byte key standing for either a signature or a whole tree of scripts, and a spend reveals only which route it took (the book draws the reveal ⋔, a leaf's path through the tree). It is the first upgrade whose main achievement is that most spends now say less.",
  },
  {
    title: 'First Ordinals inscription', id: '6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799',
    note: "A file written into a witness — the part of a transaction SegWit had discounted and Taproot had freed from the old script limits — and read back out by software that agrees where to look. The chain records the bytes. That they are an image, and that this one is the first of a numbered series, is a convention held by people, not a rule held by nodes. Which makes it the ideal passage for this book's argument: the record and a reading of it, in one section, and only one of the two verifiable.",
  },
  {
    title: 'Largest block (at the time)', id: '774628',
    note: "A single inscription filling almost the whole block: a chapter that is one long section and little else. Block space is the scarce good this entire system prices, and this is what it looks like when one buyer takes nearly all of it at once.",
  },
  {
    title: 'The Fourth Halving', id: '840000',
    note: "Three and an eighth coins from here (April 2024), and the first chapter of Volume V. By this halving the subsidy was no longer most of what a miner earned — this very block carried a fee market louder than its own reward, which is the transition the schedule has been arranging since the genesis chapter.",
  },
  { title: 'Sermon on the Mount', id: 'e53ac3be05bbeb8ea3bbfb7854a4d47eea556daea25f45ad3fe953f375ff7fd8' },
  {
    title: 'First BIP110 signaling block', id: '938903',
    note: "The first block to signal for BIP110 (reduced_data): its frontispiece shows bit 4 set (…10000) — the same bit BIP91 once flew. A signal is not an activation and this one may never become one; the book keeps the chapter because a ballot cast is part of the record whatever the count turns out to be.",
  },
  {
    title: 'Latest block', id: '-1',
    note: "The one entry that is not a place but a position: whatever chapter stands at the tip when you open it. Ten minutes on average, and this reference points somewhere else.",
  },
  // The one activation block that does not exist yet: BIP42 (April 1, 2014)
  // capped the subsidy schedule where the 64th halving's undefined bit-shift
  // would have resurrected the 50-BTC reward.
  {
    title: 'BIP42 activation (21M cap)', id: '13440000',
    note: "BIP42 (1 April 2014, and not a joke either) capped the subsidy schedule where the 64th halving's undefined bit-shift would otherwise have resurrected the fifty-coin reward. Its rules first bind at height 13,440,000 — LXV β1 ■1, the opening chapter of Volume 65, due around the year 2262. Cited now, mineable later: until then the lookup answers “Block not found. Come back in the year 2262.” A book with no last page still has a citation for one.",
  },
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
//
// Entries still waiting on a note rather than on a citation: Eligius, the
// first coinbase OP_RETURN, Romans 12:21, the Sermon on the Mount. Each is
// kept because the passage is worth reading; none has a published reading
// yet, and an annotation layer that guesses is worse than one with gaps.

// BIP110 (reduced_data, the 2026 temporary data-limit attempt; bit 4, 55% of
// a signaling window): nothing activated to cite -- ~0.5% signaling as of
// July 2026. Its BIP8-style heights are citable sight unseen should it ever
// lock in: mandatory signaling from 961,632 (V β61 ■673), lock-in by 963,648
// (V β62 ■673), activation at 965,664 (V β63 ■673) -- three real retarget
// boundaries, one book apart, sharing a chapter number. The signaling story's
// exemplar is already in the list: the first bit-4 block, V β50 ■120.
