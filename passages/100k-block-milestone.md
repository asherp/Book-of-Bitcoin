# 100K block milestone

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 100,000 read as a chapter, and its transaction 1
> (of 4) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β50 ■1217 §1 (Volume I, Book 50, Chapter 1217, section 1)
- **Block:** 100,000 — 100K block milestone
- **Block hash:** `000000000003ba27aa200b1cecaad478d2b00432346c3f1f3986da1afd33e506`
- **Transaction id:** `8c14f0db3df150123e6f3dbbf30f8b955a8249b62ac1d1ff16284aefa3d06d87`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8c14f0db3df150123e6f3dbbf30f8b955a8249b62ac1d1ff16284aefa3d06d87

## Chapter frontispiece — block 100,000

Block hash, as prose: ⌘²¹⁰ *Our abstract absurd damp to erupt via row. Yes when see pumpkin. Drink may tongue tree to the history. Cop pave license for giant per chest. Heart produce logic to arctic. The aim measure to inject per copy.* ⓪⁴⁶

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁰ Abstract access the letter. Leopard cram increase to its correct guy. The tie is awesome. Its cop crumble to seek out tax. An angry inquiry is giant over a long sugar. Security get security to genius. Shrimp may parade a cactus. ⓪⁴⁶
  - hex: `000000000002d01c1fccc21636b607dfd930d31d01c3a62104612a1719011250`
- **merkle root:** ⋔ Abandon may see accident. A crawl tumble to engage. Print see helmet per actress via family. Another row may resist divide. Son clean to card. Ghost is boring via due. Tie may observe minute during cop. Guy know to die per hero. Yes enlist to cancel via cabbage to dinosaur.
  - hex: `f3e94742aca4b5ef85488dc37c06c3282295ffec960994b2c0d5ac2a25a95766`
- **timestamp:** 2010-12-29 11:57 UTC
- **difficulty target:** β₄₅ < 296524×256²⁴ — the block hash above reads below this target — nBits 1b04864c — mantissa 296524 (2²·74131) shifted up 24 bytes: the target 000000000004864c000000000000000000000000000000000000000000000000, which a valid block hash must read below (45 leading zero bits) — difficulty 14,484 (relative to the genesis block)
- **nonce:** η 71·3861241

## § 1 — 100K block milestone

Transaction id, as prose: ⌘²⁵⁶ *Abandon account to derive. Injury see elephant per visa via beef out fossil. The ago aid when set our scorpion. Fiber may get mystery. Our bit again power a due sheriff. Guy divert jazz to dice. Ketchup are loyal per peanut. A because. Unknown may scare its muscle.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₅ 296524×256²⁴ η2·7·37
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Abandon see absurd to camp. Our senior is blue. Filter see a cut. An they. Network stem a basket. Its profit taxi each domain. Aid differ captain to the bargain. Novel detail to involve. Its trial shine oil for two beyond people. Sheriff argue mouse to reject. Our notable mystery circle its spring nerve. Tribe may cable swim to ostrich. A case very discover shiver. The due drum get bullet. Its useless bulb neck satoshi to vacuum. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A round number is not an event. Nothing in the rules changes at 100,000; the height is notable only because we count in tens. The entry is kept as a fixed point, and the frontispieces either side of it show the chain treating the milestone no differently from its neighbours.

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
