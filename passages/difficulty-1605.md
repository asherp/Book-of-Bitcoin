# Difficulty −16.05%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 655,200 read as a chapter, and its transaction 1
> (of 2,108) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β13 ■1009 §1 (Volume IV, Book 13, Chapter 1009, section 1)
- **Block:** 655,200 — Difficulty −16.05%
- **Block hash:** `0000000000000000000be6439455cefcb61e62eb9b0f47f2c99d2de2ce8dd144`
- **Transaction id:** `78dbdb668bbabb86d671952324f4bb8d946fff18d5a82cedb1d9b4b7aac5393a`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=78dbdb668bbabb86d671952324f4bb8d946fff18d5a82cedb1d9b4b7aac5393a

## Chapter frontispiece — block 655,200

Block hash, as prose: ⌘¹⁸⁰ *Pop absorb access to charge. Gloom may get oven. Carpet might solve chief. Our employ are auto. Tent is sudden to dice. Our hurt grunt film mask toward fix.* ⓪⁷⁶

- **version:** vmuffliato that — block version 0x37ffe000 — BIP9 version-bits form; version-rolling bits 0xbfff (BIP320 scratch entropy) as muffliato that; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Bed may absorb access. Friend pink some person. Each catalog not get crisp. Pan may satisfy a stable ride. Abandon get a crystal gloom to film. Quiz far see meat. Cow may hover three to chimney. ⓪⁷⁷
  - hex: `00000000000000000005e17383e25f65b531d50060b99ed66f673ea251949e4b`
- **merkle root:** ⋔ Abandon is acid to our warfare. The bad pop together get a out height. Twenty knife wasp to exhaust. Its aisle is insane. Evidence is small to toilet. The bed is vivid. The cruel space never style due. The sorry armor may shell an elevator. Set is federal to tackle.
  - hex: `e81ed58f56fc853dfb1a9582264dea3d3e66379dae057be27df7b25eb58ee3fe`
- **timestamp:** 2020-11-03 08:28 UTC
- **difficulty target:** β₇₅ < 1098803×256²⁰ — the block hash above reads below this target — nBits 1710c433 — mantissa 1098803 shifted up 20 bytes: the target 00000000000000000010c4330000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,787,779,609,933 (relative to the genesis block)
- **nonce:** η 3²·691·488503

## § 1 — Difficulty −16.05%

Transaction id, as prose: ⌘²⁵⁶ *The abandon how abuse spike. Son imitate fever to kitten. Holiday get sibling per pitch. Our potato may see a due potato. Cow divert tennis to emotion. Target is spatial out love. A nice sin may modify payment. Jazz ought post recall to hunt. A humor are pop.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■655200 2020-11-03 08:28η3⁶·43 “/BTC.com/” An able acid not sting an opera. Lot may surround trend. A cow foster to explain. The vague high breeze to undo per a logic. Each sky soon fork the cut victory. Lie may reflect vault. Fuel ought get chaos. The boil lift a ritual. Our intact banana may set art. Amateur blind advice to abandon. Abandon get crater for kidney per pyramid. Arena pitch to lift. Cousin may oppose a sin. ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 8.33134574 ₿
  - script: ⓪ h²⁰ Absurd account its salmon to vault. Silk is copper via december. Witness set elevator to art. Sir evoke frost per upgrade. Giant reason the green theme.
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon account our solid upon inch. Wrist tip a mobile venue. Hollow team to slow. Fiber may rate ship via clog. The rub soon see the weird liar. Area hurt to merge out general to a stereo. Venture may see its aid.
- **output 3:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:x”
- **output 4:** 0 ₿
  - script: ¶ ³⁶ An ability may accuse our sin. A someone. An egg is swift to oak. Wisdom may cluster main. Brown might get cake to wool. The metal scatter exhaust. Pistol may lift its heavy yes. Cop explain to dial per task. Our coyote carry few skirt. This dig may see guy during hit. The awkward fyi are odd to ban.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

3 November 2020: the end of Sichuan's wet season. Miners on seasonal hydropower shut down as it ended, and the target recorded the exit — an annual, physical cause, the clearest in the series.

— Claude Fable 5

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
