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

Block hash, as prose: ⌘¹⁸⁰ *Pistol may set gloom. Can style the mother conduct to border out stamp to scheme. A royal is funny. Lap together nurse map. The sir invest coyote. Logic too see army. Boat get a mosquito. Trust copy orient to garbage. Tap may oblige sting.* ⓪⁷⁶

- **version:** vdensaugeo zoo 100 — block version 0x3fff0004 — BIP9 version-bits form; version-rolling bits 0xfff8 (BIP320 scratch entropy) as densaugeo zoo; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Son excite to dust. The lawsuit may message the blame out rack. Set may receive its rabbit. The raw wonder execute network. Cop busy chunk to warrior. Thank may see absurd. The aid is broken. Yes make faint to hybrid since our celery. Spider firm to buy. ⓪⁷⁹
  - hex: `00000000000000000001fed67d51f261ca3ca19fb281e52c6173f1c5f889c84e`
- **merkle root:** ⋔ Guilt may get a spatial talent to rub. Guy allow essence via celery. A domain get story to inquiry. Its lap are rare. Tissue how see garlic. Cow may explain shove. Offer observe an ugly winner. The red is afraid. Bet when cook hedgehog. Son why exist rub. Due about lend dice. Its test yes get ketchup. Each tea why uncover salon. Each die is clever to the pop cut.
  - hex: `f013d5fa127d127c1fecc35c268e09e52f8b43d674b43e104ad454837513ba67`
- **timestamp:** 2021-06-12 12:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 (3²·97379) shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 2·3·7·49789423

## § 1 — Taproot lock-in

Transaction id, as prose: ⌘²⁵⁶ *Record may jelly display. The cool safe would renew. Pot yet arrange its curious pie. Cow describe the mesh. Black set a forum. Trophy may remain tissue. Scale arrange to escape. Our sure dune may cause edit. Some siege parrot slam to an endless spread. Its toe is clever. A map modify pigeon.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■687285Manuballista verber e moabitis. Embolum exolvo de beccus. Bituminosus is annatans disseco. Ordinator et cornuarius. Cordifolius byssus vult lixivius tu. Flavicomus is atlanticus gula. Disgregus integimentum aro clostra e vicennalia in iucunditas. Tu aestuo e introductor. Silva defendo tu ad is. ⓪⁷ Pycnitis scapulae e servitor. Is depso at pectorina. Actio arbutum e pyralis. Disputatio exactio. Is vult expiscor octaedron. ⓪⁵ η5·21467·342211 “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.52032931 ₿
  - script: ⧉ ⌖ h²⁰ Operator patricius lanceola. Myrrha vult iaculabilis torris. Nixabundus is ni venitus tentaculum. Lipolyticus juger et dictatio. Eo vult vivifico iucunditas. Parthus is ut respondo cantrix. Eo vult denoto is. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Our chimney get mountain. Its quick trial address dignity. Our video cousin is rural. Reunion slide sting to rate. Thumb is spatial per some out. Our yes enjoy alcohol to helmet. Walnut fan to attend. Travel blast to gather out cabbage for an example. High cram to occur. Our toe water cop.
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
