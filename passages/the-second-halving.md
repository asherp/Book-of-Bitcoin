# The Second Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 420,000 read as a chapter, and its transaction 1
> (of 1,257) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β1 ■1 §1 (Volume III, Book 1, Chapter 1, section 1)
- **Block:** 420,000
- **Block hash:** `000000000000000002cce816c0ab2c5c269cb081896b7dcb34b8422d6b74ffa1`
- **Transaction id:** `5787c3d0740f13f280118404405f1c93fb7a63a953fa482b13e23c3b03a14bd4`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=5787c3d0740f13f280118404405f1c93fb7a63a953fa482b13e23c3b03a14bd4

## Chapter frontispiece — block 420,000

Block hash, as prose: ⌘¹⁸⁶ *Peanut wing bracket to fold via clog. Bounce combine pulp to maze out assault. Check see erosion to security. The field are able. Tackle slot to avoid for its salmon. Our gentle sniff see length.* ⓪⁷⁰

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁶ A sorry alien grunt its payment. Beef scheme a fiber. Pumpkin rebel the brisk rub. Our open cop endorse to unfold. Mass may grow row. The hidden son adapt blossom. A merry bracket may set secret to some abandon. ⓪⁷⁰
  - hex: `000000000000000003035bc31911d3eea46c8a23b36d6d558141d1d09cc960cf`
- **merkle root:** ⋔ Wheel get the language. Son predict its main sin. Tea may oppose soap. Reform set turtle to a hidden pie over bulk. Cave layer rebel around fruit. The inner mother set history. Floor ski to mushroom per army. A doctor is vivid to old via leg.
  - hex: `028323a5bcacb0057274ee0a4366e5671278bc736b57176d9bb929c3a69e0ffa`
- **timestamp:** 2016-07-09 16:46 UTC
- **difficulty target:** β₆₉ < 337661×256²¹ — the block hash above reads below this target — nBits 180526fd — mantissa 337661 shifted up 21 bytes: the target 00000000000000000526fd000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 213,398,925,331 (relative to the genesis block)
- **nonce:** η 2²·3·31·71·83047

## § 1 — The Second Halving

Transaction id, as prose: ⌘²⁵⁶ *Stairs may fringe dolphin to island. Soda see another pudding via the butter. Father enrich a team. Its warm crack cook abandon. Mountain may bag tea. Lap always get our luggage. Bus escape gift to bubble. Theory increase bonus per nephew.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■420000η3·5 “七彩神仙鱼” “ Chandler Guo loves YangYang Jin.” η2²·4294500154369 “Mined by zzhhzz” ⓪²⁶
  - sequence: ■40089 — replaceable; relative locktime 40089 blocks after the input's confirmation
- **output 1:** 13.07569681 ₿
  - script: ⧉ ⌖ h²⁰ Jocundatio ramiflorus is. Aversus tu purpurasco gratificor. Ceola refero ovalis eo. Effabilis is multus promissio. Parilis plausus terminus. ≡ ∇
- **locktime:** Τ1996-02-29 14:24 — locktime: not before 1996-02-29 14:24 UTC (unix 825603862)

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The subsidy drops to 12.5 coins here, 9 July 2016, and the coinbase output on this page shows it. This block also opens Volume III. The second halving was widely watched — countdowns, price charts — but none of that reached the record; the changed amount is the whole of what the chain wrote down.

The output carries 13.07569681 ₿: the halved subsidy, plus 0.57569681 ₿ in fees from the 1,256 transactions that made the era's first chapter — the coinbase collects its block's fees on top of the subsidy, so every section that pressed into this page paid into this line.

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
