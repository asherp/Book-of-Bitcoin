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

Block hash, as prose: ⌘¹⁸¹ *Guy absorb to account for orphan. Cabin clown canoe to pistol. A vicious hockey may invest mouse. Guy behave to tone. Trap may get bulb. Control would cart length. Each theme due get tie.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ The sir absorb our account to its hit. Map may absorb theory. Share might crew gap. The delay get gadget. The typical table label deal to mix out winter to solution. The safe son used to fix. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ The abandon access alley. Income auction year to view. Unknown confirm balance out steak. Copy is sick to skin. Our symbol rent minor per puppy. Sir announce its champion to final. Our son enlist maid. The neutral arrive its low lot.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 1 — SegWit activation

Transaction id, as prose: ⌘²⁵⁶ *Abandon may accuse opera to broccoli. Pottery renew to teach. Its absurd is patient. Pot why adjust chalk. A romance frequent blanket. Minimum may see this note. Abuse cancel tortoise to nephew via a true erosion. A surge see each deputy.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■481824An abstract acid may pledge wrist. Tie reduce onion to label. Toast float siren out ginger. Drive spray flight to mansion. Some return is similar. Muscle why check a better mention. Its motion is nuclear. Arrow see the marriage to maze out tomorrow. An ordinary abandon far avoid the new war. ⓪⁸ Guy absorb to achieve per system to doctor. Yes ago absorb pan. Our row ahead grow number. Access sound its useless pay. “/BTCC/ Support /NYA/” ⓪¹⁸
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 14.62514269 ₿
  - script: ⧉ ⌖ h²⁰ Absurd abuse ghost to claim. Sky may fetch short out sleep. A peace may fall elder. A tax is typical. Feed truly educate will. The notable scale may see hit. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon may get accident. Giggle beach year to hero. Roast cube our artwork. A donor may decrease nation. Pop donate to hammer. Warfare bulk elephant via final. Plate set canyon to gallery. Finger may filter story out roast.
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
