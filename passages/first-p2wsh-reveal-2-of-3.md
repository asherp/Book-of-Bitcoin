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

Block hash, as prose: ⌘¹⁷⁸ *Our sir absorb accident. Our ban are hungry. Tax get lip into the hungry glass. Jet may extend alien. Theme attract to submit via rack. Piano may maze our reject. Its legal bubble enrich nod. The dig may avoid.* ⓪⁷⁸

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Cow absorb its absurd. Nod vanish toss to girl. The cut apology see an oven. A ready art include a social emotion to dash. Our rich success may convince a coin. Son govern the gym. ⓪⁷⁶
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ An abandon are absurd. Hat far alter anxiety. Our afraid aspect are jealous. Our glide are electric to coil. Our actress may add a cat for our lie. Yes include bunker to cloud. Water catch drum for an annual now for woman. A stone curtain is low.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 (163·7027) shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2·5·230218297

## § 411 — First P2WSH reveal (2-of-3)

Transaction id, as prose: ⌘²⁵⁶ *An abandon access some project. A rapid love set clerk. Champion warm to lend per siege to galaxy. Coil may thank silver per swarm via spring until abandon. Tie may rotate credit to ivory. Elbow may see success. Captain shall filter a pie to out.*

- **version:** 1
- **input 1:** spends output 1 of `46ebe264b0115a439732554b2b390b11b332b5b5692958b1754aa0ee57b64265`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.16602308 ₿
  - script: ⌖ h²⁰ Some absurd access video. Whale set such timber. Scrap may boost crystal to its video decline. Hair approve a virtual symptom. Its ankle may parade a out yes. =
- **output 2:** 0.36898651 ₿
  - script: ⓪ h³² Abandon may see an acid. Tea may expose its online cop. A they. Name may see daughter to the drama. Our silly doctor end to return. Its transfer may scare rhythm. The ordinary abstract season sky. Guy found to sing. Muscle spirit juice via heart. A gadget is low to ear for red to pie.
- **locktime:** III β105 ■335 — locktime: not before block 629998 — volume 3, book 105, chapter 335

### Witness footnotes

a. ∅ · s An abandon access to approve per chapter. Jelly may get a pie. An they. Set may improve miss to a sure hub. Our label rather set a final. Lie yes observe rack. A pan is vague. Actress cry lecture to cheese per penalty. Ketchup see a twelve treat. Cover see asset to each program. Some stage burst owner out its cricket. A frozen love see math. Reunion air to bless. Its guy pave the cruel core. A slender double out set luxury. Pear gather ride to raccoon. Each law get ability. · s Abandon abuse our slide to wasp. Ecology may direct to destroy. Talk thrive assist for napkin. Our card may oppose our oak. Lot may ignore to prepare. Story get scene per ramp. Shaft clean the unhappy injury to fossil via vault. The disease tank its annual sadness. Joy set warrior to pepper for silver. Document trigger coconut to movie via core. Jet adjust our frozen fuel. Evidence may bid the plastic. A slim sin remove click to april. Son then set the low sir. · w ② p³³ Bed get die about absurd. Son bring castle to genre. Final swamp our awkward torch per gadget for nasty via offer. Today set method to play. Mixture may join cost. Option replace our gap. Trap may tilt staff to ability. Despair out to nod for cop via jet. p³³ Guy about get an absurd bunker. Race set system beyond armor. A like nod prepare to enrich. Pan may expect blue via winner. Wine may increase pelican to our hope. That midnight is ugly out pyramid for crawl. Clump release its pet insect. p³³ Die about set its absurd. Buyer remove fringe around a pluck. The sense resemble negative. The six floor unfold video. The cruel lip isolate the burden. Pay may gather weird to its armed panic to hockey. A spoil see bullet. Jet may caught a dignity. ③ ◇

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
