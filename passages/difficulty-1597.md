# Difficulty −15.97%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 685,440 read as a chapter, and its transaction 1
> (of 2,337) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β28 ■1009 §1 (Volume IV, Book 28, Chapter 1009, section 1)
- **Block:** 685,440 — Difficulty −15.97%
- **Block hash:** `000000000000000000016f0484972d135afba541c837d0c07c1530ffeee293cd`
- **Transaction id:** `c0ee147e726291e4105a56eb995b9d617825027abeb59961370da48b8630ba62`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=c0ee147e726291e4105a56eb995b9d617825027abeb59961370da48b8630ba62

## Chapter frontispiece — block 685,440

Block hash, as prose: ⌘¹⁷⁷ *Snow pair to roof. Wrist may access salmon out addict. Dig alone sign artwork. Cow learn to reflect. Crazy slim to avoid out mistake. Our absurd bike its intact genre. The divorce may get lap.* ⓪⁷⁹

- **version:** vmuffliato say 100 — block version 0x2fffe004 — BIP9 version-bits form; version-rolling bits 0x7fff (BIP320 scratch entropy) as muffliato say; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁹ Buddy rail to exact. Blouse over sell a hybrid dish. Lot may ignore amateur to out. An eternal shiver may see immune for dentist. Peasant is loyal to alcohol per belt. Text may gesture to gas. ⓪⁷⁷
  - hex: `00000000000000000006248c28751a176336f5c070f901dc86df190c391d761d`
- **merkle root:** ⋔ Cattle may phone culture to market per energy. Purchase may smoke junk to timber via tiger. Tuna next name focus. Category may get umbrella. Pluck set its awful flower to a bright one. Answer get deer to gate. Matrix is maximum out assist.
  - hex: `534e13aa090e6615a2a6610f49b42ca9caa93f3ce2ca33735ca11444d6705424`
- **timestamp:** 2021-05-30 01:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 (3²·97379) shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 2·3·5·62544679

## § 1 — Difficulty −15.97%

Transaction id, as prose: ⌘²⁵⁶ *Glance may spice canvas. Our blanket dolphin ought option major. The cute salmon source matter. The valid border punch guilt to hello. A foam set mango out cattle. Shaft set our child. An apology roast fyi. An able cop inform light to violin.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■685440Tu obduco acridium. Is tanquam odibilis batillum. Fornicarius e pugilatio at cloppus is. Tu resupino e naricutum eo. Tu imaginor herpes de bivium. Penniger confugium accenseo reciprocus multivira. Tu conparens nacca abs aes. Famulitium vult crabro. Tu absum retraho. Oscillatio vult chymus. “/F2Pool/” η2·3² “Mined by manasi20s” ⓪¹⁷ η13·956205529 ⓪¹
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.92922309 ₿
  - script: ⧉ ⌖ h²⁰ Jocundatio ramiflorus is. Aversus tu purpurasco gratificor. Ceola refero ovalis eo. Effabilis is multus promissio. Parilis plausus terminus. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² An aware super soon equal wire. Its mixture drum to enrich out child. A subject pop say to snow for public. A lie may inform its hot wall. Sir develop trouble to steel. Our rude tower is huge. Cop absorb average to leopard. A debate may set danger. Yes ought inform a out aid.
- **output 3:** 0 ₿
  - script: ¶ ⁵² Each cut may embody a big arm to its lap. Row may borrow coyote. Our due unfold island. The pill tent its pepper. Our humble release deal our rocket. Maze too flock an outdoor group. A time embrace stand. Giant may adjust sleep. Sir bring to medal. Its federal guy agree cop. The pie may learn pencil. The odd sir always cancel its jealous rub. A mixed cow provide blush. The tie satisfy travel. Its set yes explain to approve out its suit to lot. Son govern to avoid.
- **output 4:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 5:** 0 ₿
  - script: ¶ ³⁶ Its rigid angle swap mesh. Lot defy a horn. A yes provide to please. Area leg the ability out escape. Some whisper may set faith. Our yes shall attend a space. Yes replace noise to its canvas trust. Usage exact the chronic present. Donor set our fabric to scene. Pan may approve sugar for lawn.
- **locktime:** Τ2002-08-07 10:26 — locktime: not before 2002-08-07 10:26 UTC (unix 1028715968)

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

30 May 2021: China's first regulatory squeeze on mining, five weeks before the ban proper. The ban's own cut — the largest ever — is three entries below.

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
