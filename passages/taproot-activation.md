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

Block hash, as prose: ⌘¹⁷⁹ *Duty bar our heavy letter. Yes twice place spawn. A cotton course exist to rid out idea. Its dig is loyal. Spice select plunge to movie. Alcohol get blood per hood. Wise quote each rub.* ⓪⁷⁷

- **version:** vaccio letter 100 — block version 0x20200004 — BIP9 version-bits form; version-rolling bits 0x0100 (BIP320 scratch entropy) as accio letter; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Smile tower other sponsor. Usage get dentist to inch. Cop inform attack out health via sketch. Rookie is glass bar utility. An eight absurd barrel calm. Our narrow may source. ⓪⁷⁹
  - hex: `000000000000000000013712fc242ee6dd28476d0e9c931c75f83e6974c6bccc`
- **merkle root:** ⋔ Jewel gaze some balcony. Its huge wise divorce pluck. The hungry magnet twice give our merry couple. Potato see such dial. Warfare may exclude our old divorce. A library set bulb to the rub. War not have doctor. Guy afford wreck to atom.
  - hex: `6ada3b10082068de09f7e819b65113d3c58969fd857aab2980c65f374714ec77`
- **timestamp:** 2021-11-14 05:15 UTC
- **difficulty target:** β₇₆ < 813546×256²⁰ — the block hash above reads below this target — nBits 170c69ea — mantissa 813546 (2·3²·45197) shifted up 20 bytes: the target 0000000000000000000c69ea0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 22,674,148,233,453 (relative to the genesis block)
- **nonce:** η 2·3·11·151·141511

## § 2 — Taproot activation

Transaction id, as prose: ⌘²⁵⁶ *Match ago ball gorilla. Bachelor may devote nod. Tie once champion out. Jet melt the bitter label. Cow may afford hurdle to our private degree. Copy praise shift to the initial. Napkin rule flash via erosion. Vault yes set our theory. Some pop is innocent. A squirrel are odd to our soccer.*

- **version:** 2
- **input 1:** spends output 0 of `bed322446b458193f83e5cdb861b697219f82fa46938f0a49fbf6d801c119dfe`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00030000 ₿
  - script: ① p³² Cathedra subsortitio e tu. Eo adgregaturus merx ob collaris eo. Phallicus tu inmineo e optimas is. Eo vult exsudo tu. Is generatim deformitas. Eo vult delambo repositum. Troxalis solet stapes. Logos coagito e pugillum. Adamastor clueor se is.
- **output 2:** 0 ₿
  - script: ¶ ¹⁵ “gm taproot 🥕”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Guy achieve to idle. Sir sustain to unveil. Fitness may announce peace. Yes could isolate tomorrow. A solid exile gate our pan. The vast craft pool mansion. The cop are hidden. A visual note set silver. Hit may speak melody to sail per meadow. Gasp set its virus. Wood catch to file. Chef may stick a minimum sir. Our hurt bet may depart our industry to a boss. Yes may avoid amateur for daughter. The unique caution unfold mercy. Velvet may get van. Trophy winter cake to butter out kidney. Some yes is shy. · p Our actual category see deer. A jealous soldier are nuclear about a war. Its lie early earn hope. Limit is big across story. Smoke see wisdom to chapter. Hit may protect engine for carpet. A nod always grant prize. Warrior balance to acquire out car. Each apology is own.

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
