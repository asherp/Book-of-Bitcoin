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

Block hash, as prose: ⌘¹⁸¹ *Tie near sentence sheriff. An aerobic net is lazy. Mirror set our huge velvet. Penalty see lady to friend. A guy dry tourist for a good. Yes avoid a bright border. Its amazing bomb is hybrid to sleep. Such pan far rotate wrong.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Length swing to flavor per chapter. Episode elbow type to its runway. Wine see usage via check. Crack buzz its border to style. Bulb slam blur via credit. Wagon quote to donate. Dream get analyst via brief. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin see its mixture to limb. Its zone set wrist. World total timber to rival. Our alcohol set body. Sun oppose item to faculty. Its cupboard out abuse dynamic. Bit may approve its matter. A big pop speak our ban. A guy barely thunder lesson. Harvest may author wool. Check is raw to the spawn. A will may see a bet.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 13 — First SegWit spend

Transaction id, as prose: ⌘²⁵⁶ *The brisk tree fire strategy. Few drink may arch to adjust. Symbol fault column per file. Want then get its ago fyi. Cop between get a bet. Ear are amazing to sky. A yes away club weird. Its stumble see car. A rubber get drama. Each jet there set our zoo. Bunker ski its hotel. Moment may foam clog.*

- **version:** 1
- **input 1:** spends output 0 of `38c8c6473f149aa698c9868f266102def0e370ddfd4c5adb5916417940963658`
  - script: ²² Alx iccirco murarius. Lanx votum e praefinitio. Eo excido en belluinus eo. Tumidus secale et foedus. Eo dilapido baculus. Is adnecto prophetizo e indicium. Eo ea adjugo tu. Eo incassum equitulus.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00311000 ₿
  - script: ⌖ h²⁰ Dexter tu commonstro sebaceus e collisio. Seris effervesco pes abs torsio ad eo. Tu impedico scaber is. Missalis eo vult acheronensis litigium. Fugitor e anteloquium. Eo vult indubito is. Eo diuturnius tu. =
- **output 2:** 0 ₿
  - script: ¶ ⁷⁵ “BIP141 \o/ Hello SegWit :-) keep it strong! LLAP Bitcoin twitter.com/khs9ne”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Primary may beef job. Season might ring food to menu. Pass garage sand for film. Mix output angle to reform. Some edit train to enrich. Tax may topple uncle. Zoo see arena to strategy. Pay exist column for gossip. The lip is rude. Die may enhance seat to castle. Fury yes cube our okay reason. The figure set month. Its canvas vanish onion. Orchard may choose silver. Its fyi could dismiss ban. Die again floor its guy. Our tired source call action. Our wide person enforce best. Glimpse bike drama to wait. Build how get lip. · p An acoustic voyage set blue. Our layer may see its brisk lip. Jet may inject illness. The gravity is aerobic. Damp just get plastic. Whip may set cigar to spare. Spring is nasty for balcony out report. Soldier swim copy to vault for panda to advance. A middle album submit to hunt. Broccoli get emotion for shoot.

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
