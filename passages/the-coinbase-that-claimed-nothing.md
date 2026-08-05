# The coinbase that claimed nothing

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 501,726 read as a chapter, and its transaction 1
> (of 1) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β41 ■1087 §1 (Volume III, Book 41, Chapter 1087, section 1)
- **Block:** 501,726
- **Block hash:** `0000000000000000004b27f9ee7ba33d6f048f684aaeb0eea4befd80f1701126`
- **Transaction id:** `9bf8853b3a823bbfa1e54017ae11a9e1f4d08a854dcce9f24e08114f2c921182`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=9bf8853b3a823bbfa1e54017ae11a9e1f4d08a854dcce9f24e08114f2c921182

## Chapter frontispiece — block 501,726

Block hash, as prose: ⌘¹⁸³ *The champion merit to detect. Acid swim fame via river. Beyond may get engine to dutch. Scissors taxi to surface. Sadness may room ceiling. Pie could enrich benefit to bus. Light is pop per a quote.* ⓪⁷³

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸² Robot get daughter to green. Nut may set hood. Hedgehog might layer rice. Avocado set estate to pair. Bird word our harsh tilt per engine. Climb base cheese to the picnic via quote. ⓪⁷⁴
  - hex: `0000000000000000002b5382b8d2d64f0b7caee90fc9951fd5d4d64b99f926bb`
- **merkle root:** ⋔ Link milk mention to owner. The awesome cherry see slight via tax. Nod may define an eternal clump. Pop reflect truth to box. The match get reunion. Trend toss to assume via sin. Son solve to afford. Photo seed its tiny gate. A sir suggest episode to a diesel.
  - hex: `9bf8853b3a823bbfa1e54017ae11a9e1f4d08a854dcce9f24e08114f2c921182`
- **timestamp:** 2017-12-30 12:55 UTC
- **difficulty target:** β₇₂ < 38469×256²¹ — the block hash above reads below this target — nBits 18009645 — mantissa 38469 (3·12823) shifted up 21 bytes: the target 0000000000000000009645000000000000000000000000000000000000000000, which a valid block hash must read below (72 leading zero bits) — difficulty 1,873,105,475,222 (relative to the genesis block)
- **nonce:** η 13·195048209

## § 1 — The coinbase that claimed nothing

Transaction id, as prose: ⌘²⁵⁶ *Link milk mention to owner. The awesome cherry see slight via tax. Nod may define an eternal clump. Pop reflect truth to box. The match get reunion. Trend toss to assume via sin. Son solve to afford. Photo seed its tiny gate. A sir suggest episode to a diesel.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■501726 η2·3·29·42477979η2³·5·11·197·421·2027·2459 ⓪²
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0 ₿
  - script: ② ③ Tu inferne frusto quincuplex is. Cirratus tu caeliloquus eo. Acidalius is pertimeo is. Magnirostris eo est minervalis. Pessarium ne secta. Eo adsidue oreae. Conditor occurso e illacessitus auraticum. Grassatio quietor condicio. Tu annumero lacto e ultor terminus.
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A chapter of one section, and the section claims nothing: the coinbase's single output carries 0 satoshis where the rules allowed 12.5 ₿. 30 December 2017. A coinbase may claim up to subsidy plus fees — the figure is a ceiling, not a floor — so the unclaimed subsidy was simply never created, and no rule exists by which anyone can create it later. The block being otherwise empty, no fees died with it.

It is the largest single-block subsidy destruction on the chain, and it was noticed within days: Bitcoin Core issue #12057 ("0 block reward at height 501726," January 2018) asked whether a node should even accept such a block, and the answer stands — claiming less than the ceiling breaks no rule. The miner is unidentified and the accepted reading, from the shape of the mistake, is a misconfigured mining template that set the payout to zero. That reading is an inference; the zero is the record.

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
