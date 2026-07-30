# Difficulty −15.13%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 552,384 read as a chapter, and its transaction 1
> (of 2,245) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β66 ■1345 §1 (Volume III, Book 66, Chapter 1345, section 1)
- **Block:** 552,384 — Difficulty −15.13%
- **Block hash:** `00000000000000000015038a38aa780723a79ae8fc6f1881240dac31aea9189d`
- **Transaction id:** `54a76dc37d15e4f2354a23a5a7261bfc49b6896d05dc1a2f33581cdcca93b25f`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=54a76dc37d15e4f2354a23a5a7261bfc49b6896d05dc1a2f33581cdcca93b25f

## Chapter frontispiece — block 552,384

Block hash, as prose: ⌘¹⁸¹ *Other shed high get globe. School may see cow. A myself. Yes afford to assume. Our woman not see our dynamic. Sky may prefer an ecology. Our jealous fence get timber. Document may bench sir.* ⓪⁷⁵

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸¹ Tap see its tired grain. What cow develop the tone. Buddy split a south squeeze. Auction yes prepare pluck. Title may get effort to sky. Our keen cop divert bench. ⓪⁷⁵
  - hex: `00000000000000000015fe695e8d2e5ed3a7de81d3818ef43a444e1ee7b3ace2`
- **merkle root:** ⋔ Its left fine mass to oppose. Enough low tag is raw. A host is awful. Luggage too set hybrid. Edge coach puzzle since what swallow. Leisure host the youth device. Crash may rival its scale.
  - hex: `aeee64cab37fb8f50fdbce4ff25dcb2223c099b01070a36cbaafc44d22da2a7f`
- **timestamp:** 2018-12-03 11:59 UTC
- **difficulty target:** β₇₄ < 3266940×256²⁰ — the block hash above reads below this target — nBits 1731d97c — mantissa 3266940 shifted up 20 bytes: the target 00000000000000000031d97c0000000000000000000000000000000000000000, which a valid block hash must read below (74 leading zero bits) — difficulty 5,646,403,851,535 (relative to the genesis block)
- **nonce:** η 512160369

## § 1 — Difficulty −15.13%

Transaction id, as prose: ⌘²⁵⁶ *Garden may nest to verify. Return see its sheriff. Book round fortune to air. Hobby see horn via negative. Script may see nation to ozone. Piece enforce question for ribbon per cliff. Switch replace the outer length.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■552384Dove may retreat our cut faculty. Cow evolve act to cry. Lot also see red. Sky then get effort. Each copy is rid. “a,/BTC.TOP/” Aid wide see its vibrant fork. Buddy are great to ginger. Eagle far see chest. Soup may crawl yes. Its rapid fade glue cap. A bitter pottery used fat to our crush. The dutch woman flame the boring sir. Its just kid strike to involve. Cactus abandon abandon for abandon per abandon out abandon. Scissors always set a wisdom. Its abandon is actual. Yes thrive the live next. Its pool may owe.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.76129339 ₿
  - script: ⧉ ⌖ h²⁰ Its ripple long our two bullet. Goddess may truck few abandon. The sketch set cupboard. Equal damp alley until its project. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Its proud month is happy. Beauty side to coast. Run ago correct response. Marriage may set mobile. A silly knife ought draft village. Soccer bracket excess to march. Our son may confirm. Lot then source sense. The abandon get our ago tax.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

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
