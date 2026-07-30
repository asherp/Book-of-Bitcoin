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

Block hash, as prose: ⌘¹⁷⁷ *Snow pair roof to wrist. Access may set salmon. Addict is alone to sign via artwork. Guy learn to reflect per crazy. Its slim cow avoid mistake to absurd.* ⓪⁷⁹

- **version:** vmuffliato say 100 — block version 0x2fffe004 — BIP9 version-bits form; version-rolling bits 0x7fff (BIP320 scratch entropy) as muffliato say; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁹ Buddy rail its exact blouse. Sin over sell hybrid. Dish may ignore amateur. A pan is eternal. Shiver is immune to our dentist. Peasant is loyal via alcohol. ⓪⁷⁷
  - hex: `00000000000000000006248c28751a176336f5c070f901dc86df190c391d761d`
- **merkle root:** ⋔ Its cattle phone culture to market. Energy purchase smoke per junk. Timber may set tiger to tuna. A next name focus category. Umbrella pluck an awful flower. The bright one answer deer to gas.
  - hex: `534e13aa090e6615a2a6610f49b42ca9caa93f3ce2ca33735ca11444d6705424`
- **timestamp:** 2021-05-30 01:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 1876340370

## § 1 — Difficulty −15.97%

Transaction id, as prose: ⌘²⁵⁶ *Glance spice its canvas blanket. Dolphin may option major. A cop is cute. Our salmon source the matter. Our valid border punch guilt. Hello foam mango to cattle. Shaft see a child. Apology may roast abandon.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■685440Its coconut due sting an opera. Cop surround a digital creek. Our chronic melody print pottery. Our whip may alarm a quote. “I]ϩ<1” Its title may get latin. Its true iron ought warm a trigger. The pan is large. A brisk female may dwarf dune. Abandon ought abandon joke to layer. Son become an amount. “/F2Pool/” Its bamboo may get pay. “Mined by manasi20s” Abandon may abandon abandon to abandon. Abandon abandon abandon via abandon. Abandon abandon to abandon. Abandon is able out lesson. Resource see leopard to abandon.
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.92922309 ₿
  - script: ⧉ ⌖ h²⁰ Sight code kite to torch. Habit mail to avoid. Clump around spawn round. Crawl air throw to project. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Its aware super soon equal wire. Mixture drum to enrich. Its child subject to say. Snow may see the public. A fyi may inform our wall. Rub may develop trouble to the steel. A rude tower is huge. Cap may absorb average to length.
- **output 3:** 0 ₿
  - script: ¶ ⁵² Its tax may embody arm. Pop borrow its coyote. Cop unfold island to pill. Tent pepper our humble release. Deal rocket to maze per flock. The outdoor group time embrace. Stand may set our giant to tap. Its rub adjust our sleep. Aid why bring medal. Its federal tie may agree to learn per pencil. Ban always cancel the jealous guy. Our mixed yes provide blush. Cop how satisfy a travel. Lip yet explain the pop.
- **output 4:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 5:** 0 ₿
  - script: ¶ ³⁶ A rigid angle may swap mesh. The due shall defy horn. Pop provide to please out area. Leg see ability to escape. Whisper get a faith. A tax attend our space. Dig replace to noise. Its canvas trust an usage. Guy exact the chronic present. Donor get fabric to scale.
- **locktime:** Τ2002-08-07 10:26 — locktime: not before 2002-08-07 10:26 UTC (unix 1028715968)

### Witness footnotes

a. ∅

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
