# Bitcoin Cash fork

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 478,558 read as a chapter, and its transaction 1
> (of 331) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β30 ■95 §1 (Volume III, Book 30, Chapter 95, section 1)
- **Block:** 478,558 — Bitcoin Cash fork
- **Block hash:** `0000000000000000011865af4122fe3b144e2cbeea86142e8ff2fb4107352d43`
- **Transaction id:** `d89853f0fb659caad5b7680656b0aaca8f3093fffe525d4ba422b93f8a52f070`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=d89853f0fb659caad5b7680656b0aaca8f3093fffe525d4ba422b93f8a52f070

## Chapter frontispiece — block 478,558

Block hash, as prose: ⌘¹⁸⁵ *Abuse access bonus to its essence. Pop attend cabbage per our welcome out device. Secret manage the field to mention. Order may dry yellow via math. A curious yes govern to scale out divorce.* ⓪⁷¹

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Yes absorb acid to candy. Gas see our gravity. Rescue may engage wink. Ski kit produce to ride. Its panther clutch salt via fitness per deal. Each orbit fix ban. ⓪⁷²
  - hex: `000000000000000000eb9bc1f9557dc9e2cfe576f57a52f6be94720b338029e4`
- **merkle root:** ⋔ An abandon may access february. Its able scissors consider creek to sniff. Draft may set envelope. Its nod yet execute jungle. Its exact garden see tiger to dress. Its lunar start far frequent faint. Our lawsuit see main. Its pole face problem.
  - hex: `5b65144f6518bf4795abd428acd0c3fb2527e4e5c94b0f5a7366f4826001884a`
- **timestamp:** 2017-08-01 13:16 UTC
- **difficulty target:** β₇₁ < 83765×256²¹ — the block hash above reads below this target — nBits 18014735 — mantissa 83765 (5·11·1523) shifted up 21 bytes: the target 0000000000000000014735000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 860,221,984,436 (relative to the genesis block)
- **nonce:** η 2·3089·318683

## § 1 — Bitcoin Cash fork

Transaction id, as prose: ⌘²⁵⁶ *Abandon get our accident. Maple believe to behave. Wine see mule out muffin. Hill fancy wave to our tooth. Genre witness to fetch per the scout. School get hamster to salt. Height decide to garden. Wealth get example out a brand.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■478558 2017-08-01 13:16“/BTC.COM/” Its absent access may index to expect per garment. A out program is cute. Bit may remind spoon. Deposit cement rack to coach. The base two develop its strong alarm. Pop relax decade to each despair. Head get some tornado. Cannon differ slight to company. Reject sniff luxury per key. Our advice is set. ⓪⁷ η49362083·204369941537 ⓪⁴
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 12.61890202 ₿
  - script: ⌖ h²⁰ Absurd is acid to advice. The sure hit may reflect the annual train. Kingdom is diamond to book via diary. Tray clap purchase to paddle. A sir choose gas. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon abuse letter to an idea. Pie barely get our tax. A curious congress essay to attract. Despair ignore option out frown. Worth anger a motion. Switch out get eagle. Each mention set entry. The better radio may arm. Its yes crumble to say.
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The last chapter both chains share. On 1 August 2017 a competing implementation began building on this block under different rules, and everything after it is two records rather than one. Nothing in this chapter marks the split: a chain fork is not an event inside a block, it is a disagreement about which blocks come next. This book reads one of the two, and says so here rather than leaving a reader to assume there is only one.

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
