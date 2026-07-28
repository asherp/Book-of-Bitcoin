# 500K block milestone

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 500,000 read as a chapter, and its transaction 1
> (of 2,701) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β40 ■1377 §1 (Volume III, Book 40, Chapter 1377, section 1)
- **Block:** 500,000 — 500K block milestone
- **Block hash:** `00000000000000000024fb37364cbf81fd49cc2d51c09c75c35433c3a1945d04`
- **Transaction id:** `2157b554dcfda405233906e461ee593875ae4b1b97615872db6a25130ecc1dd6`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=2157b554dcfda405233906e461ee593875ae4b1b97615872db6a25130ecc1dd6

## Chapter frontispiece — block 500,000

Block hash, as prose: ⓪⁷⁴ ⌘¹⁸² *Affair may uncover a chronic major. Crystal is giant to stool. Object eye to hover. A bar wild brief plastic. Sugar are youth to catch.*

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⓪⁷³ ⌘¹⁸³ Bomb exercise throw to belt. Son is low during aid. Yes direct baby to the boring hero to metal. Its season alone filter grit. Pot reduce slush to jungle.
  - hex: `0000000000000000007962066dcd6675830883516bcf40047d42740a85eb2919`
- **merkle root:** ⋔ Buyer bag its kitten to knock. Our ear already people bit. Sir submit work to clay via snow. Sir reduce daughter to seed. Vacuum dawn husband per fabric. A frog set century. Behind charge mixture to feel per cactus.
  - hex: `31951c69428a95a46b517ffb0de12fec1bd0b2392aec07b64573e03ded31621f`
- **timestamp:** 2017-12-18 18:35 UTC
- **difficulty target:** β₇₂ < 38469×256²¹ — the block hash above reads below this target — nBits 18009645 — mantissa 38469 shifted up 21 bytes: the target 0000000000000000009645000000000000000000000000000000000000000000, which a valid block hash must read below (72 leading zero bits) — difficulty 1,873,105,475,222 (relative to the genesis block)
- **nonce:** η 1560058197

## § 1 — 500K block milestone

Transaction id, as prose: ⌘²⁵⁶ *The stock unveil to adjust. Chaos may find horror. Siren around get novel. Surge twist a tuna. Machine yes warm maple. Liar may decrease blouse to pop. Our hard wing may shed to follow. Frame may set a cactus.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “o8Zc/BTC.COM/”
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote 1
- **output 1:** 15.89351625 ₿
  - script: ⌖ h²⁰ Card get its kingdom to fancy. Cop leave grocery per result. Industry agree task to matrix via rib. Pluck spend the very way. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Pop avoid lumber to spray. An aim is physical. A hip raven park to pencil. Its elite muscle monitor rebel. Love carry arm to quarter. Blood neglect to deny. Minimum may clog ozone via a length.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

1. ∅

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⓪ⁿ ⌘ᵐ — n leading
proof-of-work zero bits, then the remaining m = 256 − n bits of the
double-SHA256 (⌘, OP_HASH256), Glossia-encoded as ⌈m/8⌉ bytes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
