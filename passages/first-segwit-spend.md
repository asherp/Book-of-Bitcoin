# First SegWit spend

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 13
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §13 (Volume III, Book 31, Chapter 1345, section 13)
- **Block:** 481,824 — SegWit/activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c

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

## § 13 — First SegWit spend

Transaction id, as prose: ⌘²⁵⁶ *Its brisk tree fire strategy to few drink. Arch adjust symbol for fault via column per file. Its set want then get bet. Map between set son. Its amazing row get bit. Our hot bet away club its weird stumble. Our car rubber drama. Theory are material to child. An used sir cap to dig.*

- **version:** 1
- **input 1:** spends output 0 of `38c8c6473f149aa698c9868f266102def0e370ddfd4c5adb5916417940963658`
  - script: ²² Alx iccirco murarius. Lanx votum e praefinitio. Eo excido belluinus tu. Tumidus secale foedus. Eo dilapido morior. Sus terminus e tu.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00311000 ₿
  - script: ⌖ h²⁰ Dexter is commonstro sebaceus e collisio. Seris effervesco pes abs torsio. Eo impedico scaber is. Tu rivatim renascor iucunditas. =
- **output 2:** 0 ₿
  - script: ¶ ⁷⁵ “BIP141 \o/ Hello SegWit :-) keep it strong! LLAP Bitcoin twitter.com/khs9ne”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Primary may beef job to season per ring to food. Menu pass garage via sand. Film mix output to angle per reform. Edit train to enrich for tax. Aid may topple uncle to zoo. Arena may set a new strategy. Lap exist the column. A gossip is rude. Ear enhance seat to castle. Fury cube an okay reason. Figure see month to canvas. Set vanish onion for orchard. Our guy may choose silver. Pop dismiss our aid. Bet again floor jet. A die is tired. Source may see cake. Its tie are intact. Segment may man a yes. · p An acoustic voyage get blue. The layer set a brisk die. Cop inject illness to gravity. Our aerobic damp is just. Plastic may whip cigar. Spare spring its nasty balcony. Report soldier swim to copy. The vault may set panda via its action. Our crucial six see a village.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first witness ever used, in the activation block itself: it spends a P2SH-wrapped P2WPKH output funded 159 blocks early, parked looking like any ordinary P2SH payment and revealed the moment the rules went live. Somebody had the transaction ready and waiting.

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
