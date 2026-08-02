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

Block hash, as prose: ⌘¹⁷⁷ *Pop absorb to achieve out its hold. Weather target vessel to apple. Vessel may borrow daughter. Dragon harvest wall to patrol out nothing. Fun letter humor to amount.* ⓪⁷⁹

- **version:** vmuffliato say 100 — block version 0x2fffe004 — BIP9 version-bits form; version-rolling bits 0x7fff (BIP320 scratch entropy) as muffliato say; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁹ Cop absorb the absurd two. Mansion ago improve a screen. Our used bread set lens. West far get maid. Diary may holiday cousin to minor. Start may bag catch. The copy is hot. ⓪⁷⁷
  - hex: `00000000000000000006248c28751a176336f5c070f901dc86df190c391d761d`
- **merkle root:** ⋔ Abandon may abuse cargo. Ear would bring to prosper. Donor expose impact per grid out slab for ball out avocado. Some bet is fatal. The pride north spell a capable giant. Crush may see luxury to slot. A they. Steak may essay skill.
  - hex: `534e13aa090e6615a2a6610f49b42ca9caa93f3ce2ca33735ca11444d6705424`
- **timestamp:** 2021-05-30 01:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 (3²·97379) shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 2·3·5·62544679

## § 1 — Difficulty −15.97%

Transaction id, as prose: ⌘²⁵⁶ *Abandon may set accident. Our beyond get method. Artist may ripple alley to talk. Creek remember the video letter. Enough maid see solid. Red may hover dice to film. Our spatial decrease may carpet cheese. Disease father to submit.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■685440Abuse abuse guitar to question. Our suspect stage upset each odor. Drum feed some find. Elevator spread concert to pigeon. Its jaguar far see our vivid jet. Pop may destroy monitor to room. Our pop gap father nut. Its red soon catalog employ. Bargain demand clay to abandon. Abandon may see its adult tap. Son become mountain to weapon. Abandon tax to set. “/F2Pool/” η2·3² “Mined by manasi20s” ⓪¹⁷ η13·956205529 ⓪¹
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.92922309 ₿
  - script: ⧉ ⌖ h²⁰ Absurd may achieve donkey. Half are supreme to clerk for dose to country. Its lens is ginger. Gift may set a mad tobacco. Cut never cloud apple. Gas how get a due cap. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon see the absurd lizard. Soccer may kid genius. Thunder inch the brisk flag. Cow divert sausage to zone per hole to its half ostrich. The red release may top emotion. Cow predict its tree. Cousin not see insect. Alcohol may get its leader.
- **output 3:** 0 ₿
  - script: ¶ ⁵² The absent access drink fringe. The south mistake may harvest recipe to chat. Its wide blast may get jeans. Powder script to swear per era. Its set skin truly dawn a banner dynamic. Piece get artist to broom. Flip may thunder lie. Our false fyi is perfect. A chronic wall bench due. Son destroy an annual route. Immune grow its seven wife. The detail may get lottery.
- **output 4:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 5:** 0 ₿
  - script: ¶ ³⁶ Ability may accuse due. A someone. Egg surround our funny sniff to hole per guilt. Credit may foil wheel to access. A happy stairs set mosquito. Inquiry may live to repair via a purchase to rub. Map may assume evil out labor. Impulse dry to expect. Its due ear apart mesh a yes.
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
