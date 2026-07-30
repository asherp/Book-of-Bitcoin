# The Second Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 420,000 read as a chapter, and its transaction 1
> (of 1,257) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β1 ■1 §1 (Volume III, Book 1, Chapter 1, section 1)
- **Block:** 420,000 — The Second Halving
- **Block hash:** `000000000000000002cce816c0ab2c5c269cb081896b7dcb34b8422d6b74ffa1`
- **Transaction id:** `5787c3d0740f13f280118404405f1c93fb7a63a953fa482b13e23c3b03a14bd4`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=5787c3d0740f13f280118404405f1c93fb7a63a953fa482b13e23c3b03a14bd4

## Chapter frontispiece — block 420,000

Block hash, as prose: ⌘¹⁸⁶ *Peanut wing bracket to fold. Our clog bounce combine. Its pulp maze assault. Check see an erosion. Security yes field cow. A bed is able. Some tackle slot to avoid.* ⓪⁷⁰

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁶ Its sorry alien grunt payment. Beef may scheme fiber. Its pumpkin rebel cop. Our brisk lap may open. Our guy endorse to unfold. Mass grow its hidden son. Our low pie adapt blossom. ⓪⁷⁰
  - hex: `000000000000000003035bc31911d3eea46c8a23b36d6d558141d1d09cc960cf`
- **merkle root:** ⋔ The wheel too see language. Son may predict main. A son oppose soap. Reform get turtle to our hidden lip. The over bulk may cave layer. Rebel around fruit map. Our inner mother see history to floor. Ski may mushroom the army via its divorce.
  - hex: `028323a5bcacb0057274ee0a4366e5671278bc736b57176d9bb929c3a69e0ffa`
- **timestamp:** 2016-07-09 16:46 UTC
- **difficulty target:** β₆₉ < 337661×256²¹ — the block hash above reads below this target — nBits 180526fd — mantissa 337661 shifted up 21 bytes: the target 00000000000000000526fd000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 213,398,925,331 (relative to the genesis block)
- **nonce:** η 2193437364

## § 1 — The Second Halving

Transaction id, as prose: ⌘²⁵⁶ *Stairs fringe dolphin to island. Soda see another pudding. Butter father to enrich. Team warm a crack. Cook yes abandon mountain. Our bag always see its luggage. A bus escape gift to bubble. Its theme may see cop.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■420000Its audit may get pay. “七彩神仙鱼 Chandler Guo loves YangYang Jin.” Agent lumber tomorrow to dignity. Our sin is useless. “Mined by zzhhzz” Abandon may abandon abandon to abandon. Abandon abandon abandon via abandon. Abandon abandon to abandon. Abandon abandon abandon per abandon. Abandon may abandon abandon to abandon.
  - sequence: ■40089 — replaceable; relative locktime 40089 blocks after the input's confirmation
- **output 1:** 13.07569681 ₿
  - script: ⧉ ⌖ h²⁰ Sight code kite to torch. Habit mail to avoid. Clump around spawn round. Crawl air throw to project. ≡ ∇
- **locktime:** Τ1996-02-29 14:24 — locktime: not before 1996-02-29 14:24 UTC (unix 825603862)

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Twelve and a half coins from here (9 July 2016), and the first chapter of Volume III. The first halving happened to a few thousand people; this one had an audience, a countdown, and a price chart — none of which the schedule consults.

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
