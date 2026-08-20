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

Block hash, as prose: ⌘²¹¹ *Canyon room crazy to object via logic. Crush bargain lens to note. Guy not identify the diet. Our dry club see faculty. A tail ranch to pave. Maple express asthma per dilemma out kite. Other parade may identify its belt to pluck via its garbage.* ⓪⁴⁵

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹¹ View offer fuel to verb. Sting is entire for joy. Its aim where get fantasy. Slot pulp climb to plunge. A happy bet is true. Jet may satisfy regret. Its liquid not amount disease. Cow prevent its outdoor scale to its banner holiday over embrace. ⓪⁴⁵
  - hex: `000000000004099656bf4a3fda4db1b25630634afa2a201e975e4df9772df3f3`
- **merkle root:** ⋔ Its trouble may knife candy. Its cop submit war. An unhappy best text stamp. Flock drum bunker to side. Ivory cage our swim for car. Tea may extend a still. An awkward cop disagree catch. Our wide fyi why protect due. Red there inspire virus. Version may slush pet. Delay would trigger our bit.
  - hex: `2f6bf541621f43b8fa5012f976406ef7e379704859a3eeb72ad40e6c85740fe9`
- **timestamp:** 2010-11-15 00:36 UTC
- **difficulty target:** β₄₄ < 946774×256²⁴ — the block hash above reads below this target — nBits 1b0e7256 — mantissa 946774 (2·43·101·109) shifted up 24 bytes: the target 00000000000e7256000000000000000000000000000000000000000000000000, which a valid block hash must read below (44 leading zero bits) — difficulty 4,536 (relative to the genesis block)
- **nonce:** η 2²·11·29·1187·1523

## § 1 — The twice-confirmed coinbases — second printing

Transaction id, as prose: ⌘²⁵⁶ *Hamster pepper stomach to hollow. Our excess too point tilt. Sin may defy guilt to list. Arctic inject to lend. Click enter lawsuit out steel for section via mistake. Giant document paddle to zebra. Sir gather survey via view. Silk empty to page. Its need point our cow.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₄ 946774×256²⁴ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Glos flecto inprimo. Eo rescisco distichon e corruptio. Tibereius daca malo posteriora ad lubricitas. Acerus eo tergo tu e pulcer eo. Exosus is quando clypeum. Matteuca ni libanochrus. Tu segregatim is. Eo cummaxime praeputiatus vacuum. Aurifodina vult conligendus listerianus eo. Tu deargentatus liquidum e planiceps is. Eo patesco graecizo. Tu negito maius panificium. Lasarpicifer direptio vult sallo prophetizo. Macilentia absconsa e foetalis tu ob insubiectus iurandum. ∇
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
