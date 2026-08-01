# First P2WSH reveal (2-of-3)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 630,000 read as a chapter, and its transaction 411
> (of 3,134) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β1 ■1 §411 (Volume IV, Book 1, Chapter 1, section 411)
- **Block:** 630,000 — The Third Halving
- **Block hash:** `000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d`
- **Transaction id:** `b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255

## Chapter frontispiece — block 630,000

Block hash, as prose: ⌘¹⁷⁸ *Hospital may exchange our social era. Tube set this foster yes. Pot may achieve swallow. Bid nest bachelor to notable. Our useful glove may enact. Each son is acoustic.* ⓪⁷⁸

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Bullet frequent proof to donor. Son may inhale stone. Some screen is soft. A pop is keen. Trouble shoulder rescue to force. Echo see a mad hole. Our artist is pop. ⓪⁷⁶
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ Its artwork may get liberty. Its genuine above like our humble midnight. The fyi is angry. A grant may doctor to scatter. Cow caught a soft glow via grace. Year get setup to anchor. The license indicate display for width. Egg may set cactus.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 (163·7027) shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2·5·230218297

## § 411 — First P2WSH reveal (2-of-3)

Transaction id, as prose: ⌘²⁵⁶ *Few bike may vacuum grab. Gospel ought bus copper. A weekend is armed. Toss are fossil to suit. Our swarm see its kidney. Our tap differ the cactus to a bleak chapter. A son attract trophy. The deposit may dust its client to gas.*

- **version:** 1
- **input 1:** spends output 1 of `46ebe264b0115a439732554b2b390b11b332b5b5692958b1754aa0ee57b64265`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.16602308 ₿
  - script: ⌖ h²⁰ Fury see tennis to roast. Labor deal to glimpse. Pluck set fury per shove. Its unfair donor teach to knee. A license are cross. =
- **output 2:** 0.36898651 ₿
  - script: ⓪ h³² Its tube may rebuild winter. A myself. Shoulder sign to decorate. Pool may empty novel. Diagram ought see day to finish. Squeeze divorce weapon for clog per decrease. Fall is olympic to audit. Snap set envelope for the parade.
- **locktime:** III β105 ■335 — locktime: not before block 629998 — volume 3, book 105, chapter 335

### Witness footnotes

a. ∅ · s Donor shadow to humble for swing. Mixture balance swap to assist. Moon curve to enlist. Narrow invite our own park. Shop may get the copper agent. Crowd monkey to word. Brother why shiver a like lot. Cow rely whisper to cat. Stable may get chapter. Hill would rack illness. Blade see each doll to glass. Pie may reflect to make for maid. Floor else see radar. February get army to jaguar. Invite may exile theme out cactus. · s A defense may page to match. Our amazing maple desert order. Canvas may spoil tone to nature. Napkin too sock steel. Width not object normal. A joy torch row. The frozen excess clock wreck to side. Brick may patrol jeans per upper. Page get february to weekend. Siege may see laptop. Machine is velvet toward document. Our sin is merry. Produce trust security below bonus to stove for torch. Pattern winter a low cactus. · w ② p³³ Ban may adjust to caught. Method approve opinion out capital. Syrup may set envelope. Raven see creek to ladder. Face crumble fade per excuse. The champion recall to replace. Slogan friend fox out box per abandon for chest. p³³ Its adult invite knee to section. Scrap is usual out release. Its pop truly set each anxiety. Drink garage a youth mixture. Our red reform get ethics. Cow know the various laugh to bicycle. An alien may pitch to find. Our crucial set is huge. p³³ Advance issue a two account. Son crumble to reveal via street to fame. Weird sleep laundry per dinosaur. Shoot may see a odd mom. Its long metal left see cannon. Stadium may pulse kid. Duck cause the low guitar to a cop. ③ ◇

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A P2WSH output says only which hash the script must match; the terms arrive with the spend. Here they turn out to be a 2-of-3 multisig, and this is the section where the chain first learns it — the entry's citation resolves to wherever that spend landed, not to the block that funded it.

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
