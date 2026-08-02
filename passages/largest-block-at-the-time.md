# Largest block (at the time)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 774,628 read as a chapter, and its transaction 1
> (of 63) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β72 ■1493 §1 (Volume IV, Book 72, Chapter 1493, section 1)
- **Block:** 774,628 — Largest block (at the time)
- **Block hash:** `0000000000000000000515e202c8ae73c8155fc472422d7593af87aa74f2cf3d`
- **Transaction id:** `6bbc98096c36ab96515b11073bfc840ee30ddb28423f3c87db2717fa3613c181`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6bbc98096c36ab96515b11073bfc840ee30ddb28423f3c87db2717fa3613c181

## Chapter frontispiece — block 774,628

Block hash, as prose: ⌘¹⁷⁹ *Guy absorb an abuse. Cow unveil to wish. Our true position style evidence. Pizza may draw normal. Blind clog mango to student per cactus. Fox bench to sue out chimney.* ⓪⁷⁷

- **version:** vulnera pelican — block version 0x28960000 — BIP9 version-bits form; version-rolling bits 0x44b0 (BIP320 scratch entropy) as vulnera pelican; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Our guy absorb absurd. Rub spend year to panic via couch to major. Lip again deposit each pan. Map sustain to cram out visual. Opinion traffic to middle. Wage pill gas via chimney. ⓪⁷⁷
  - hex: `0000000000000000000560268dbd186dbecdd347e6dad829c10c0fd3cffb2b1a`
- **merkle root:** ⋔ Abandon access its toast to code via arrest. Agent also see any energy. Glimpse set our innocent curtain. Meadow may set old. Tourist filter to order. Purchase may see its rare odor. Our casino are various. Upper may see any circle.
  - hex: `498902de19bf91644236aee19cd5cba1d9c4d8902e63508a820e4e3006b4605c`
- **timestamp:** 2023-02-01 20:38 UTC
- **difficulty target:** β₇₇ < 468768×256²⁰ — the block hash above reads below this target — nBits 17072720 — mantissa 468768 (2⁵·3·19·257) shifted up 20 bytes: the target 0000000000000000000727200000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 39,350,942,467,773 (relative to the genesis block)
- **nonce:** η 2²·7·13·31·309713

## § 1 — Largest block (at the time)

Transaction id, as prose: ⌘²⁵⁶ *Abandon account asthma to dynamic. Hospital pause the negative host. Travel dismiss bacon to cycle. Bridge couch our draw via valley. Its genius bacon surround grant. Filter set grocery to age. A glass miracle may see a sir.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■774628“1\ Powered by ” “Luxor Tech” η2⁵·11·67 ⓪⁴ Abuse is absurd to clutch. Each safe is senior. Abuse may set the lady. Pot may submit ability. Minimum people to divorce. ⓪⁷
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 6.25875047 ₿
  - script: ⧉ ⌖ h²⁰ Our absurd acid see broccoli. Its yes idle our certain poverty. Stand may tool its work to a shrug. Sir assume ring via gym. Cop rotate to decide per host to scale. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon abuse to remember. Barrel see whale via scare. Alert alarm genius to force. Sir believe panda per rival. Try get habit to blade via now to leopard. A team puzzle retreat out the bracket. Our bleak social may armor sky.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A single inscription filling almost the whole block: a chapter that is one long section and little else. Block space is what the fee market prices, and here one buyer took nearly all of one block's at once.

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
