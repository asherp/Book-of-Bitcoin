# First native SegWit outputs

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 533
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §533 (Volume III, Book 31, Chapter 1345, section 533)
- **Block:** 481,824 — SegWit activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `dfcec48bb8491856c353306ab5febeb7e99e4d783eedf3de98f3ee0812b92bad`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=dfcec48bb8491856c353306ab5febeb7e99e4d783eedf3de98f3ee0812b92bad

## Chapter frontispiece — block 481,824

Block hash, as prose: ⌘¹⁸¹ *Its tax near sentence sheriff. The aerobic net is lazy. A mirror is huge. A velvet penalty set lady. Friend may dry tourist to good. Cow avoid its bright hit via aid.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Length swing flavor to chapter. Episode may elbow type. Runway ago wine usage. Check may crack buzz. Border ought style bulb to slam. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin get its mixture to limb. Zone get wrist per world. The total timber rival alcohol to body. Sun oppose item per faculty. Cupboard yes abuse dynamic. A red may approve matter. Cow speak the rub. Some pan barely thunder length.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 533 — First native SegWit outputs

Transaction id, as prose: ⌘²⁵⁶ *Pudding may fruit duty to balcony. Upset is small for knock. Laundry see dinosaur to second. The guilt square to know. Leg may stick ecology. Fatigue would see boy to maid out nature to master. The tiny cow derive theme.*

- **version:** 1
- **input 1:** spends output 1 of `9f37d671d8adb470a8bada662fb0216dc4c907964f329fc79d5e8c0191e30574`
  - script: ²² The abandon too piece future. Sir behave ecology to vault. Some cattle may tongue a tourist. An used row again get the deer. Parade see dentist to blouse per paper.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00194300 ₿
  - script: ⓪ h²⁰ Miracle space minimum to sense. Decade may merit moon. Sausage way get neutral. A row are clever. Abstract may expire all winter.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Its marine may base divide. Cow remove to hawk. Pan may obtain coyote. A world bag see bonus. Fyi resist deal to opinion. Fee enrich chaos for change. Day see hero to broom. Basket may set muffin. Wagon exile to inhale. Text target fish for a cliff. Firm grace public to example out frown to gym. A muscle due see food. Yes decorate the reunion. Swift emerge update to stereo out marble to water via wait. Scale may set cactus. · p Action borrow its cereal raven. Fiber may repair cow. Its indoor journey combine grit. Guy inspire the select rival. Goddess may radio a virtual father. Its power century get envelope to hire. The slice may forward math.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first outputs written in the new form outright — a P2WPKH and a P2WSH, in the activation block — rather than wrapped in a P2SH hash for the benefit of software that had not been upgraded. The book sets them ⓪ h²⁰ and ⓪ h³²: a version byte, then a commitment, and nothing else.

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
