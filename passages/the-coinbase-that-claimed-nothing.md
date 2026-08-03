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

Block hash, as prose: ⌘¹⁸³ *The yes may absorb abuse. The correct cow found toast. Average tent neck to stock out purity to fashion. Cat may angle video. Spider yet use tennis. A chef may fix a fyi.* ⓪⁷³

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸² Sir absorb to accuse. Summer may get salmon. Crater would set runway to a heavy lap. A federal son verify a simple leg. High way reject twin. Enough aware farm may fix bit. ⓪⁷⁴
  - hex: `0000000000000000002b5382b8d2d64f0b7caee90fc9951fd5d4d64b99f926bb`
- **merkle root:** ⋔ Abandon account our awesome goose. Flat valve the loud design. Frog may slush history. The glance shall see the peanut. Guy evoke stand to effort. Seed see domain per code. Our cop hurt jacket. A tea is casual. Build may see blood to beach.
  - hex: `9bf8853b3a823bbfa1e54017ae11a9e1f4d08a854dcce9f24e08114f2c921182`
- **timestamp:** 2017-12-30 12:55 UTC
- **difficulty target:** β₇₂ < 38469×256²¹ — the block hash above reads below this target — nBits 18009645 — mantissa 38469 (3·12823) shifted up 21 bytes: the target 0000000000000000009645000000000000000000000000000000000000000000, which a valid block hash must read below (72 leading zero bits) — difficulty 1,873,105,475,222 (relative to the genesis block)
- **nonce:** η 13·195048209

## § 1 — The coinbase that claimed nothing

Transaction id, as prose: ⌘²⁵⁶ *Abandon account our awesome goose. Flat valve the loud design. Frog may slush history. The glance shall see the peanut. Guy evoke stand to effort. Seed see domain per code. Our cop hurt jacket. A tea is casual. Build may see blood to beach.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■501726 η2·3·29·42477979η2³·5·11·197·421·2027·2459 ⓪²
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0 ₿
  - script: ② ③ Access access its foam. A narrow ozone cruise output. An ivory tuition kiss wise. Young nurse a polar post. Door may grunt a simple antenna to its local distance. Our elegant wreck get demise to address for degree. The turkey under moon our girl. An abandon is new.
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
