# BIP110 fork

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 961,632 read as a chapter, and its transaction 1
> (of 5,612) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β61 ■673 §1 (Volume V, Book 61, Chapter 673, section 1)
- **Block:** 961,632 — BIP110 fork
- **Block hash:** `00000000000000000000d1e01392faa65ceeaed307f0a3159144b84146ff24ba`
- **Transaction id:** `efa77cf9d328dbecf2ea3bf5079c9a13bc6bb7c6077e885e130993e4164ce517`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=efa77cf9d328dbecf2ea3bf5079c9a13bc6bb7c6077e885e130993e4164ce517

## Chapter frontispiece — block 961,632

Block hash, as prose: ⌘¹⁷⁶ *Riot may set child to spice per lock. Lounge embrace a final lawn. Our amazing output romance rich. Hurry empower exhibit to boss. An advance may confirm tortoise. Dig could deliver the actual jar to what same set.* ⓪⁸⁰

- **version:** vavada abandon — block version 0x20006000 — BIP9 version-bits form; version-rolling bits 0x0003 (BIP320 scratch entropy) as avada abandon; no soft-fork signals
- **previous block:** ⌘¹⁷⁶ Member set illness to its tooth. Some citizen may chunk our blind. Pop unveil to sustain. Champion cause our flush fee. Door may get the tooth. Its sir invest die. An useless address may start its unusual cactus. Our equal uncle team interest. ⓪⁸⁰
  - hex: `00000000000000000000807f9dc917442a67910426d79ebb2f8aa2149327ce8a`
- **merkle root:** ⋔ Our dentist refuse to put. Attitude book music for mimic via dutch. Panel may remind to wreck per a shoulder. A lunar pluck are crystal. Urge may pepper magic. Old would see ethics. Eyebrow get ketchup to our art out call to spy. Habit mix ripple via album. A prison is exotic.
  - hex: `31c3f314d52668baf0a27b574d4d5178e3f8bb969f2332e323995107bb8e963a`
- **timestamp:** 2026-08-08 19:35 UTC
- **difficulty target:** β₇₈ < 144701×256²⁰ — the block hash above reads below this target — nBits 1702353d — mantissa 144701 shifted up 20 bytes: the target 00000000000000000002353d0000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 127,479,855,693,691 (relative to the genesis block)
- **nonce:** η 2·3²·5·27919057

## § 1 — BIP110 fork

Transaction id, as prose: ⌘²⁵⁶ *Blood not see clerk. Aisle since correct each meadow. Kick may average sky. Our amazing cup sustain to join via our cow. A tap defy to evoke per cabin. A polar turtle number cycle. Faculty display salad to panic. The tie there see row. A they. Its odd mouse see its garbage to bet. Lap exist monkey outside violin.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■961632η2·13 “Mined by AntPool” Chymus ut afa. Protelum syndesmosis e inferna. Inpes internecinus axinomantia ex germana. Cyclops vult occursator. Tu debet exhalo adjuvo e latrina. Narbonensis is excerno trepalium. Ibis vult insciens ostentatio. Fructifer eo thesaurizo clientela e quasillum. Tu defugiendus ad abba in pala se is. Tu queror collustrium. Is eximo marathrum e paronomasia. ⓪⁹ η5²·113·1239103 ⓪⁶
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00000546 ₿
  - script: ⌖ h²⁰ Daculum vult prodo vulnus. Camella ut tremo tu. Eo sicunde azuayensis geusiae. Tu attigo conscriptus. Modestia hispidus decacordum e tanos. Is circumtono resupino. Typus vult palinodia. =
- **output 2:** 3.13335554 ₿
  - script: ⌖ h²⁰ Optatio ut consociatio. Is subfectus e amictus. Tu effrenate is. Postquam. Biologicus eo collegialis combretum. Longitanus is perdormisco nazareus strutio. Tu vult absto dravidicus is. Sextilis vessica e prod tu. =
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Fox saddle a broken flush to opera for million. The long mountain may bubble lie. A silly war shall get the aware tenant. Clay may get demise. Pot out reflect snow. Sadness may set its ordinary elder. Cage see our latin job. Doll about see its current match. Our crush see menu. Its shed suffer our sniff.
- **output 4:** 0 ₿
  - script: ¶ ⁴⁵ Drive may see kind to mule via addict to daughter. Kidney tunnel attitude out menu per dad. A civil social set dilemma. Repeat armor dress to our slot. Ear are amused near laugh. Surprise north tattoo seminar. Each jet may prevent to follow. A lap almost detect cargo. The tree may see lizard. The out reduce copy. Box yet argue the diamond parade. Bet exist enemy to hub. Tip may get jet until pie.
- **output 5:** 0 ₿
  - script: ¶ ¹⁸ “EXSAT”
- **output 6:** 0 ₿
  - script: ¶ ³⁹ Son inflict slide to spawn for wrong to odor. One trip good out try. Seminar before see biology. Armor mistake a sin. Its crucial tax is basic. Its wrong best giraffe to comfort. Violin get cake via maid for orbit. Our divorce may set defense. Our cop deliver dune to ability. Ski see the out verb. Pay may ignore to fuel per our smart foil to kiss.
- **output 7:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:q)”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

What changes here is not what a transaction may say but what a block may omit. From this height, under BIP8's mandatory-signaling period, a block that does not set bit 4 of its version is rejected — so every chapter written after it carries the signal in its frontispiece whether its miner meant it or not. The passages themselves read exactly as they did the chapter before: the same scripts, the same amounts, the same grammar. A reader would notice only in the version word at the head of each chapter.

That is the pattern of every signaled fork in this book. The rules that bind transactions arrive later, at activation; what a signaling height binds is the miners, and the record of it is a row of bits above the prose rather than a change to the prose.

Whether these three chapters ever carry these names is a question about the next few thousand blocks, not about arithmetic: the heights are fixed and the fork is not.

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
