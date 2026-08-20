# Taproot activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 709,632 read as a chapter, and its transaction 2
> (of 2,043) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β40 ■1009 §2 (Volume IV, Book 40, Chapter 1009, section 2)
- **Block:** 709,632
- **Block hash:** `0000000000000000000687bca986194dc2c1f949318629b44bb54ec0a94d8244`
- **Transaction id:** `777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288

## Chapter frontispiece — block 709,632

Block hash, as prose: ⌘¹⁷⁹ *Duty bar our heavy letter. Bed twice place spawn. Its cotton course exist our idea. A loyal spice select plunge to movie. Some alcohol is brisk. Sir prosper the outer source to owner. Bid is due out our fiber. Some pay are olympic.* ⓪⁷⁷

- **version:** vaccio letter 100 — block version 0x20200004 — BIP9 version-bits form; version-rolling bits 0x0100 (BIP320 scratch entropy) as accio letter; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Smile may tower other sponsor to usage. Dentist inch to inform via attack for health. Sketch is rookie to a glass. Bar is utility via eight for absurd. Bonus may throw vendor. Quote see mystery to blur. Economy may better ban. ⓪⁷⁹
  - hex: `000000000000000000013712fc242ee6dd28476d0e9c931c75f83e6974c6bccc`
- **merkle root:** ⋔ Jewel may gaze balcony. The huge wise ago divorce some pluck. A hungry magnet twice give pie. Our merry couple set potato. Such dial may see our warfare. A guy exclude an old divorce. The library get bulb. A bed out have document. Dig may inflict some sibling to cloth. Cow renew flip per aim. Our echo are rid.
  - hex: `6ada3b10082068de09f7e819b65113d3c58969fd857aab2980c65f374714ec77`
- **timestamp:** 2021-11-14 05:15 UTC
- **difficulty target:** β₇₆ < 813546×256²⁰ — the block hash above reads below this target — nBits 170c69ea — mantissa 813546 (2·3²·45197) shifted up 20 bytes: the target 0000000000000000000c69ea0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 22,674,148,233,453 (relative to the genesis block)
- **nonce:** η 2·3·11·151·141511

## § 2 — Taproot activation

Transaction id, as prose: ⌘²⁵⁶ *Match ball gorilla to bachelor. Its bit may devote war per ear. Sir once champion our out. Lap may melt a bitter label. Lip ago afford hurdle. Private get its degree. A copy praise shift to initial. Napkin rule to flash. The erosion may vault. Ban there adjust tuition. Tribe may get its body to walnut via our negative. Guy arrive the new lie.*

- **version:** 2
- **input 1:** spends output 0 of `bed322446b458193f83e5cdb861b697219f82fa46938f0a49fbf6d801c119dfe`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00030000 ₿
  - script: ① p³² Cathedra vult subsortitio e is. Eo adgregaturus merx de collaris tu. Phallicus eo inmineo optimas. Tu exsudo is e tu. Eo generatim deformitas. Tu vult delambo repositum. Troxalis stapes. Logos coagito quaranta e legista ab secale. Scriptorius eo vult rufesco deretrarius tu. Imbridus is est.
- **output 2:** 0 ₿
  - script: ¶ ¹⁵ “gm taproot 🥕”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Sir achieve to idle. Ear sustain to unveil per fitness. Ban far announce our peace. Yes isolate a tomorrow to solid. Exile may gate its vast craft. Our ago pool see mansion. Our hidden visual may note its silver guy. A cow speak melody to sail via meadow to gasp. Virus may get wood. Catch file chef to stick. Minimum hurt to depart per industry. Boss may avoid amateur to its red daughter. An unique caution unfold mercy. Velvet may set van to trophy out winter. Call see hair to a dumb tilt. Hire see car to echo per our tumble. Guy carry mask to two. · p Its actual category set deer. A dig is jealous. Soldier is nuclear about the early cut. Sir earn hope to limit across story. Smoke may get our wisdom to the chapter. Guy protect engine out carpet. Tie always grant the prize. Warrior may balance to addict out cap. Cop omit shock to its rare craft to ankle. The feel may see island.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

An early Taproot payment, mined the moment the rules went live — the citation resolves into the activation chapter at its own §section. From here an output can be a single thirty-two-byte key standing for either a signature or a whole tree of scripts, and a spend reveals only which route it took (the book draws the reveal ⋔, a leaf's path through the tree). It is the first upgrade whose main achievement is that most spends now say less.

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
