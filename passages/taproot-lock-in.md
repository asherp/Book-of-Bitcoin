# Taproot lock-in

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 687,285 read as a chapter, and its transaction 1
> (of 1,662) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β29 ■838 §1 (Volume IV, Book 29, Chapter 838, section 1)
- **Block:** 687,285 — Taproot lock-in
- **Block hash:** `0000000000000000000c1c6ccceb78d9f17895b7c0a376865d02e9eb836c6ca5`
- **Transaction id:** `05f28c48022268a3490c00b6386b8fdead5b78913baf11436ce1eb17fef8ceb3`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=05f28c48022268a3490c00b6386b8fdead5b78913baf11436ce1eb17fef8ceb3

## Chapter frontispiece — block 687,285

Block hash, as prose: ⌘¹⁸⁰ *Guy absorb to accuse. Our clock is brass. Some due is amazing. Salon may license invite to solution. Phrase set an aisle for torch. Vehicle may budget round. Quality mirror its bright gas.* ⓪⁷⁶

- **version:** vdensaugeo zoo 100 — block version 0x3fff0004 — BIP9 version-bits form; version-rolling bits 0xfff8 (BIP320 scratch entropy) as densaugeo zoo; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Cow absorb our access. Its iron see carbon. Our various gallery rifle tap. A lucky original like a neutral tribe. Kangaroo see its plastic weird. Echo see river to wrap for amount. ⓪⁷⁹
  - hex: `00000000000000000001fed67d51f261ca3ca19fb281e52c6173f1c5f889c84e`
- **merkle root:** ⋔ Abandon may get accident. Pan differ luggage to our twelve crystal. Health choose the amazing refuse. A pluck get its movie to bind out map. Guy wrestle luggage to decade. Slide may sentence the genius tenant. Ceiling spell our latin february to lawn.
  - hex: `f013d5fa127d127c1fecc35c268e09e52f8b43d674b43e104ad454837513ba67`
- **timestamp:** 2021-06-12 12:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 (3²·97379) shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 2·3·7·49789423

## § 1 — Taproot lock-in

Transaction id, as prose: ⌘²⁵⁶ *Abandon accuse oyster to sail. Wire leaf the vague rain. Giraffe get quality to symptom. Fun may resemble target for element. Sir provide a bitter abandon. Girl may hand space. Cage get cattle to critic. Doll may see cop.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■687285Its above acid sting opera. A swift hundred better ankle. Broccoli sand to require via slush. Company drill to please out message. Gain may window aunt. Video address arena to purity. Slot lock cotton per tennis. Its new orchard is acoustic. ⓪⁷ Abandon may account its arctic dragon. Our aerobic sir define cover. Hazard may cage our son. ⓪⁵ η5·21467·342211 “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.52032931 ₿
  - script: ⧉ ⌖ h²⁰ Absurd see accident to thing. Father photo the sheriff. Raccoon jump pill to produce. Notice may get slight. Element flash traffic to country via cactus. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Its abandon abuse dog. Our lucky law donate brass. Valley may set owner. Its merry yes uncover security. Our fresh son is quick. Music is armed to its lounge. Fence set a corn per fitness. Rent noodle the insane despair to rocket.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The Speedy Trial threshold moment: the widely cited lock-in block, mined inside the signaling window, so its frontispiece still shows bit 2 actually set (…100) the way the activation chapter's no longer does. A version-bits fork leaves its ballot in the record; this is the page where the count crossed.

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
