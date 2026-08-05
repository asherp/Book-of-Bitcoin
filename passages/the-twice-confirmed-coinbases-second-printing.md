# The twice-confirmed coinbases — second printing

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 91,880 read as a chapter, and its transaction 1
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β46 ■1161 §1 (Volume I, Book 46, Chapter 1161, section 1)
- **Block:** 91,880
- **Block hash:** `00000000000743f190a18c5577a3c2d2a1f610ae9601ac046a38084ccb7cd721`
- **Transaction id:** `e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468

## Chapter frontispiece — block 91,880

Block hash, as prose: ⌘²¹¹ *Our canyon room its crazy object. Logic crush bargain to lens. Note identify diet out its dry club via faculty out tail. Ranch may pave maple. Express could set asthma to citizen. Our weather yet gap gas.* ⓪⁴⁵

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹¹ View offer fuel to verb. Sting is entire via joy. Aim where set fantasy. Slot yet pulp climb. The plunge is happy to a true guy. Dig may satisfy regret to liquid for amount. Its chronic clap garage abandon. ⓪⁴⁵
  - hex: `000000000004099656bf4a3fda4db1b25630634afa2a201e975e4df9772df3f3`
- **merkle root:** ⋔ Trouble may knife its candy. Guy submit the unhappy best. Text stamp to flock. Drum bunker our side ivory. Cage may swim a car. Nod ago extend still. The awkward guy disagree catch. Our bit wide protect the theory. Cut across snack struggle.
  - hex: `2f6bf541621f43b8fa5012f976406ef7e379704859a3eeb72ad40e6c85740fe9`
- **timestamp:** 2010-11-15 00:36 UTC
- **difficulty target:** β₄₄ < 946774×256²⁴ — the block hash above reads below this target — nBits 1b0e7256 — mantissa 946774 (2·43·101·109) shifted up 24 bytes: the target 00000000000e7256000000000000000000000000000000000000000000000000, which a valid block hash must read below (44 leading zero bits) — difficulty 4,536 (relative to the genesis block)
- **nonce:** η 2²·11·29·1187·1523

## § 1 — The twice-confirmed coinbases — second printing

Transaction id, as prose: ⌘²⁵⁶ *Hamster may pepper stomach to its hollow excess. Our point tilt to defy. Our guilt list its arctic. Guy inject to lend. Click may enter lawsuit via steel. Section mistake its giant document to paddle. Zebra gate pumpkin per skill. Its die is unfair to its fyi.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₄ 946774×256²⁴ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Glos flecto inprimo. Eo vult rescisco distichon. Corruptio tibereius daca. Tu malo posteriora e lubricitas. Acerus is tergo tu. Pulcer eo exosus eo. Tu quando clypeum. Matteuca libanochrus. Is segregatim eo. Tu cummaxime praeputiatus vacuum. Aurifodina conligendus e listerianus is. Tu deargentatus in liquidum. Planiceps tu vult patesco. Eo graecizo negito. Maius panificium vult is e lasarpicifer tu. Eo devoveo burricus ab admixtio. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The only two transactions ever confirmed twice, each in four printings between them. Two miners running the same default configuration produced byte-identical coinbases, and nothing in the rules yet forbade it — so each second printing overwrote its first in the set of spendable outputs and destroyed that reward. The book prints all four, because all four were written.

BIP30's ban on duplicate transaction ids switched on by timestamp (15 March 2012) rather than by flag block, with exactly these two offenders grandfathered forever: a rule that had to be written around the record instead of over it. BIP34 later closed the hole structurally — a coinbase must state its own height, so two blocks can no longer write the same one.

Each printing owns its own page here. Pages count positions in the chain, not distinct transaction ids, so the book's page count runs exactly two past the chain's count of distinct transactions — and these are the two.

— Claude Opus 5

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⌘ᵐ <prose> ⓪ⁿ — the
m = 256 − n bits of the double-SHA256 (⌘, OP_HASH256), Glossia-encoded as
⌈m/8⌉ bytes, then the n proof-of-work zero bits that follow them in the
internal-order bytes the prose encodes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
