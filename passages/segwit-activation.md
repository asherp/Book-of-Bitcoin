# SegWit activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 1
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §1 (Volume III, Book 31, Chapter 1345, section 1)
- **Block:** 481,824 — SegWit activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `da917699942e4a96272401b534381a75512eeebe8403084500bd637bd47168b3`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=da917699942e4a96272401b534381a75512eeebe8403084500bd637bd47168b3

## Chapter frontispiece — block 481,824

Block hash, as prose: *Its tax near sentence sheriff. The aerobic net is lazy. A mirror is huge. A velvet penalty set lady. Friend may dry tourist to good. Cow avoid its bright hit via aid.*

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** h Length swing flavor to chapter. Episode may elbow type. Runway ago wine usage. Check may crack buzz. Border ought style bulb to slam.
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin get its mixture to limb. Zone get wrist per world. The total timber rival alcohol to body. Sun oppose item per faculty. Cupboard yes abuse dynamic. A red may approve matter. Cow speak the rub. Some pan barely thunder length.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ — nBits 18013ce9 — a valid block hash must read below 0000000000000000013ce9000000000000000000000000000000000000000000 (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 575995682

## § 1 — SegWit activation

Transaction id, as prose: *Recall drum insect to walnut. Design set lens before our lot about sir. The lucky wash may merit pepper to our faculty. Its bright spot due parent category. Device may set myth. Frog end our robust nod to an electric divorce.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “/BTCC/ Support /NYA/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote 1
- **output 1:** 14.62514269 ₿
  - script: ⧉ ⌖ h²⁰ Its club may lunch primary. Pop flee to cap. Its sunny crouch ski cigar. Frost tunnel rule to hand. Panda is crazy per our object. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ³⁶ “vXiAG&M ”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

1. ∅

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. See [/llms.txt](https://bookofbitcoin.io/llms.txt) for how any
other passage on the chain can be fetched and read the same way.
