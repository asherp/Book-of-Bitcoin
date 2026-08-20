# First P2WSH reveal (2-of-3)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 630,000 read as a chapter, and its transaction 411
> (of 3,134) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β1 ■1 §411 (Volume IV, Book 1, Chapter 1, section 411)
- **Block:** 630,000
- **Block hash:** `000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d`
- **Transaction id:** `b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255

## Chapter frontispiece — block 630,000

Block hash, as prose: ⌘¹⁷⁸ *Hospital exchange our social. Era tube this bit. A foster cap may achieve swallow. Bid nest our bachelor to notable. The useful glove enact son. Our acoustic burst may panic double. Our pop quote between set frog. A cake may get visual.* ⓪⁷⁸

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Bullet out frequent proof. Donor inhale a stone screen. Nod are soft to a keen trouble to shoulder. Rescue force echo per our mad hole. The artist brown worry. Elder scale estate to secret. Cheese ago see sphere. ⓪⁷⁶
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ Artwork see each liberty. A genuine above is like. Its humble midnight see an angry grant to doctor. Cop scatter to caught out the soft glow. Grace see year to setup. An anchor license to indicate via display out width for egg. Call may see width to love. Yard rival cement out horn per ozone.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 (163·7027) shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2·5·230218297

## § 411 — First P2WSH reveal (2-of-3)

Transaction id, as prose: ⌘²⁵⁶ *Few bike vacuum grab. Gospel bus a copper weekend. The armed toss are fossil. A suit not swarm a kidney. Cop may differ cactus. The bleak chapter attract trophy to deposit. Dust may get client. Son gather miss to square out the bright chef. Row erode impulse to bean.*

- **version:** 1
- **input 1:** spends output 1 of `46ebe264b0115a439732554b2b390b11b332b5b5692958b1754aa0ee57b64265`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.16602308 ₿
  - script: ⌖ h²⁰ Abilitas baccalaureus e ileos in facultas. Is cavitare ruminor e anglus. Curatio vult eviscero cassabundus tu. Cinerosus eo est biflorus. Racemifer is abs tu. Argenteus eo devasto rhomphaea e samara. =
- **output 2:** 0.36898651 ₿
  - script: ⓪ h³² Peripetasma ubinam moror alligator. Ambro lignum e exuvia. Exarchatus frontalia at archetypum. Gesticulus haruspicalis antisagoge. Longao supter grammaticus chamulcus. Quidquid tesquum e caballatio. Eo exoculo ab bimus eo. Is pilpito rapina e tu.
- **locktime:** III β105 ■335 — locktime: not before block 629998 — volume 3, book 105, chapter 335

### Witness footnotes

a. ∅ · s Donor shadow to humble. Swing see mixture via balance. Swap assist moon to curve. Cop enlist the narrow invite. An own park shop its copper agent. Crowd may monkey word to brother out shiver. Cow like to rely. Whisper set cat out stable. Chapter set hill to rack. Illness may get blade per doll. Glass reflect to make for our maid. Some floor else get radar. February may set army. Jaguar invite exile to theme. Call fancy die via our unaware bit. Son may ensure tonight to vacuum. Sausage may set the oven. Guy wrestle oyster to scan. · s Defense may page match. Its amazing maple desert order to canvas. Spoil tone nature out napkin. Sock set steel to width for object. Normal may joy torch. Its frozen excess clock a wreck to side via brick. A patrol set jeans. Upper page our february. Weekend siege laptop to machine. Velvet may get our pot toward document. A bit is merry. Produce trust security below bonus. Stove torch pattern to our winter call. Churn delay meat to depth via machine. Eagle see drama to fantasy. A civil anchor set ear. · w ② p³³ Pie adjust to caught. Method approve opinion per capital. Syrup get envelope to raven. Creek get ladder via face. Pop crumble to fade out excuse to champion. Recall replace slogan via friend for fox. Box abandon chest to the advance. A movie may pink staff. Its easy forward ago target world. p³³ Adult invite to knee. Some section is scrap. A pot is usual. Release truly set a bad anxiety. Drink garage its youth mixture to reform for ethics. Pop know the war. Its various laugh may bicycle alien. Pitch find the crucial pan. Our huge addict rocket vapor to parade. Debate see its broccoli via the gospel swap. p³³ Advance issue a two account. Guy crumble reveal to street. A fame see weird. Sleep may get laundry. Dinosaur shall shoot mom. Its long metal left see cannon. Stadium pulse our kid duck. Cause ago get guitar. An addict mushroom pop. The sky is hungry. Piano describe a private gown. Fish not see guy. ③ ◇

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A P2WSH output says only which hash the script must match; the terms arrive with the spend. Here they turn out to be a 2-of-3 multisig, and this is the section where the chain first learns it — the entry's citation resolves to wherever that spend landed, not to the block that funded it.

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
