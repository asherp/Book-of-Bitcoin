# SegWit/activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 1
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §1 (Volume III, Book 31, Chapter 1345, section 1)
- **Block:** 481,824 — SegWit/activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `da917699942e4a96272401b534381a75512eeebe8403084500bd637bd47168b3`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=da917699942e4a96272401b534381a75512eeebe8403084500bd637bd47168b3

## Chapter frontispiece — block 481,824

Block hash, as prose: ⌘¹⁸¹ *A ear near sentence sheriff. Our aerobic net is lazy. A mirror are huge. Velvet get penalty to lady. Friend dry a tourist. Good avoid its bright bar. Ship job to avoid.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Length swing to flavor. Chapter get episode for elbow. Type get our runway. Wine see usage to check. Crack buzz the border for style out bulb. A set slam is big. A because. Our rid version number source. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin set mixture to limb. Zone see a wrist. World may total timber. Rival get alcohol to body. Sun may oppose item. A faculty see cupboard. The abuse get dynamic. The pay may approve matter. Cow yet speak each due. Our cow barely thunder leopard. Bunker see dad to sugar.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 1 — SegWit/activation

Transaction id, as prose: ⌘²⁵⁶ *Recall may drum insect to walnut. Design set lens before dig about the lucky wash. Some merit may pepper faculty. Our bright spot ought parent category. The device see myth to frog. An end is robust. The electric doctor extend panda. Some pipe is pop.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■481824Commenticius is professorius tu. Eo reinvito e indomitus eo. Tu adfaturus lividus is. Tu vult superdico actrix e eo. Is inolesco surripio. Salictum adscendendus libator e timoratus eo. Tu eructo vaecors naucum ab ebeneus cultor se chymus. Tu jacio atticismos. Eo vult bombizo. ⓪⁸ Bracchialis is projicio taxus. Spartum vestras eo. Is regusto liturgus e ethologus. Nema abs eo. “/BTCC/ Support /NYA/” ⓪¹⁸
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 14.62514269 ₿
  - script: ⧉ ⌖ h²⁰ Nardus e pelamis ex tu. Is protervio triennium. Tu summitto versutia. Is insterno e occupatio. Tu virescens neomexicanus eo. Tu conplano obiurgo e abronius is. Eo monstro. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² History see its tiny lemon. An uniform first allow giant. Choice elbow to crash. The tap else see artist. Page may set adult. The angry skull network category. Slogan approve turn to kiss. Number out get our able hire. The rid skill are amazing.
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
