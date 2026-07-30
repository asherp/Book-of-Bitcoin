# First SegWit spend

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 13
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §13 (Volume III, Book 31, Chapter 1345, section 13)
- **Block:** 481,824 — SegWit activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c

## Chapter frontispiece — block 481,824

Block hash, as prose: ⌘¹⁸¹ *Its tax near sentence sheriff. The aerobic net is lazy. A mirror is huge. A velvet penalty set lady. Friend may dry tourist to good. Cow avoid its bright hit via aid.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Length swing flavor to chapter. Episode may elbow type. Runway ago wine usage. Check may crack buzz. Border ought style bulb to slam. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin get its mixture to limb. Zone get wrist per world. The total timber rival alcohol to body. Sun oppose item per faculty. Cupboard yes abuse dynamic. A red may approve matter. Cow speak the rub. Some pan barely thunder length.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 575995682

## § 13 — First SegWit spend

Transaction id, as prose: ⌘²⁵⁶ *Its brisk tree fire strategy. Few drink is arch. Aid due adjust symbol. Fault see column to file. A want then see our pie. Lot between get a tie. Its amazing son away club a weird. Stumble set car to rubber. Drama may theme pot.*

- **version:** 1
- **input 1:** spends output 0 of `38c8c6473f149aa698c9868f266102def0e370ddfd4c5adb5916417940963658`
  - script: ²² Abandon pigeon badge to sphere. Liquid may web magnet. Profit ago get animal. Ski bench rice to alien. A park may fork a home.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00311000 ₿
  - script: ⌖ h²⁰ Carpet is armed to its light. A cow carry to reduce. Chunk see salmon for age. Leopard divorce abandon to hello. Company may bounce catch. =
- **output 2:** 0 ₿
  - script: ¶ ⁷⁵ “BIP141 \o/ Hello SegWit :-) keep it strong! LLAP Bitcoin twitter.com/khs9ne”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Its primary beef job its season. Ring see food to menu. The pass garage sand. Film may mix output. Angle reform edit to train. A fyi enrich to topple. Uncle get zoo per our arena. A strategy exist column to the ago gossip. Its hit is rude. Son enhance seat to castle per fury. Cube okay reason figure. Month may set canvas. Its lap vanish onion. Orchard may choose silver. Sir dismiss to let. Lip again floor pop. A due is tired. Source may see cactus. · p The acoustic voyage see blue. Our layer is brisk. Aid may inject illness to gravity. Its aerobic damp is just. Plastic whip cigar to spare. Spring see a nasty balcony. Report may soldier swim. A big copy shall vault the panda.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first witness ever used, in the activation block itself: it spends a P2SH-wrapped P2WPKH output funded 159 blocks early, parked looking like any ordinary P2SH payment and revealed the moment the rules went live. Somebody had the transaction ready and waiting.

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
