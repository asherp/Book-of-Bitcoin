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

Block hash, as prose: ⌘¹⁷⁸ *Hospital exchange the social era. Our tube may get this foster tie. Sir achieve to swallow. Bid nest bachelor via notable. Its useful glove enact war. A pay is acoustic. Lie may betray fury to calm. Each source is red.* ⓪⁷⁸

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Bullet may frequent proof to our donor. Sir inhale a stone screen. Bit soft get pay. Our keen trouble shoulder to rescue via force. Echo is mad to hole. Artist birth despair for chapter per parade. ⓪⁷⁶
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ Artwork may see the liberty. Its die is genuine. Above like a humble midnight. The angry grant doctor tie. A guy scatter to caught. The soft glow grace year. Our setup may anchor license. Guy indicate display to width. The egg get cake via miss. Our sadness swap set.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 (163·7027) shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2·5·230218297

## § 411 — First P2WSH reveal (2-of-3)

Transaction id, as prose: ⌘²⁵⁶ *Few bike vacuum grab to the gospel bus. Its copper weekend our armed toss. Fossil may suit swarm. Kidney differ cactus to the bleak chapter. Cop attract a trophy. Deposit may dust client. Gate could see width to turtle. Due define to cap.*

- **version:** 1
- **input 1:** spends output 1 of `46ebe264b0115a439732554b2b390b11b332b5b5692958b1754aa0ee57b64265`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.16602308 ₿
  - script: ⌖ h²⁰ Abilitas baccalaureus e ileos. Facultas cavitare ruminor. Anglus e curatio. Is eviscero cassabundus tu. Cinerosus eo iantare is. Admirabilis tu stragulus tu. =
- **output 2:** 0.36898651 ₿
  - script: ⓪ h³² Peripetasma ubinam moror alligator. Ambro lignum e exuvia ob exarchatus. Frontalia archetypum e gesticulus. Haruspicalis antisagoge longao supter grammaticus. Chamulcus puerilis eo. Expavidus is perpetior tu.
- **locktime:** III β105 ■335 — locktime: not before block 629998 — volume 3, book 105, chapter 335

### Witness footnotes

a. ∅ · s Donor shadow our humble swing. Its mixture balance swap to assist. The moon curve to enlist. Narrow may invite our own park per shop. Our copper agent crowd to monkey. Word see the brother out shiver. Our like son may rely whisper. Cat get the stable chapter. Hill rack illness to blade. A doll due see glass. Pop reflect to make. Maid is red via the floor out our pay. War else set the radar. February see army to jaguar for invite. Exile not theme cake. Chalk may sting human to sir. · s Its defense may page to match. An amazing maple desert order. Canvas spoil tone to nature via napkin to sock. A steel width object normal. Joy torch its frozen excess to clock. Wreck side to brick out patrol. Its jeans set the upper page. February weekend siege to laptop for machine to velvet. Cop may pop toward document. Our merry produce may trust security below bonus. Its stove torch pattern. Winter may get cake. Garlic ought set guy about question. · w ② p³³ A pan adjust to caught. Method may approve opinion per its capital syrup. Envelope raven creek to ladder. Face crumble fade out excuse. Champion recall to replace per slogan to friend. Fox box abandon per chest. The action may churn our hard way. p³³ Adult invite knee to section via scrap. Its pot is usual. Release truly see an anxiety. Drink garage our youth mixture to reform out our ethics. Cow know its yes. Our various laugh bicycle alien. Our pitch may find a crucial cut. Its huge fyi may acquire addict to diary per metal. p³³ Advance issue our two account. Pop crumble reveal to street per fame. Weird sleep laundry to dinosaur. A shoot set some mom. Pop long metal to a left via cannon. Stadium may pulse its kid duck to cause per guitar. Its tie may acquire to clarify via the pet marine. ③ ◇

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
