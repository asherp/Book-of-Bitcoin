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

Block hash, as prose: ⌘¹⁸¹ *Its tax near sentence sheriff. The aerobic net is lazy. A mirror is huge. A velvet penalty set lady. Friend may dry tourist to good. Cow avoid its bright hit via aid.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Length swing flavor to chapter. Episode may elbow type. Runway ago wine usage. Check may crack buzz. Border ought style bulb to slam. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin get its mixture to limb. Zone get wrist per world. The total timber rival alcohol to body. Sun oppose item per faculty. Cupboard yes abuse dynamic. A red may approve matter. Cow speak the rub. Some pan barely thunder length.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 1 — SegWit activation

Transaction id, as prose: ⌘²⁵⁶ *Recall drum insect to walnut. Design set lens before our lot about sir. The lucky wash may merit pepper to our faculty. Its bright spot due parent category. Device may set myth. Frog end our robust nod to an electric divorce.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■481824A visit due get our panther. Ear may isolate battle. Sort detect arctic to decrease via hobby. Anchor fog twelve to valley. Finish decorate vendor per lumber. An actor multiply bamboo. Its fancy dose rain to eye. Orient how set crime. A divorce is acoustic. ⓪⁸ Cop swear siege to divorce. Scheme see its coconut. Our base gasp fly task. “/BTCC/ Support /NYA/” ⓪¹⁸
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 14.62514269 ₿
  - script: ⧉ ⌖ h²⁰ Its club may lunch primary. Pop flee to cap. Its sunny crouch ski cigar. Frost tunnel rule to hand. Panda is crazy per our object. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² History is tiny to lemon. Uniform first allow giant. Choice ago elbow crash. Pan else see artist. Our page not set our adult. Its angry skull network category. Slogan approve turn to kiss for number to abandon.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

From 24 August 2017 the witness — the signatures and the scripts that satisfy a lock — is committed to the block through a tree of its own and left out of the name of the transaction it authorizes.

Which is why this book has footnotes. A section's witness is quoted beneath its passage, bound into the chapter through the witness commitment in §1, never inside the transaction's own identity. Transaction malleability ends here, and for the same reason a payment channel can be built out of transactions that have been signed but not yet published.

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
