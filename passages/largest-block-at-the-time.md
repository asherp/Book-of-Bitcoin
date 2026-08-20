# Largest block (at the time)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 774,628 read as a chapter, and its transaction 1
> (of 63) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β72 ■1493 §1 (Volume IV, Book 72, Chapter 1493, section 1)
- **Block:** 774,628 — Largest block (at the time)
- **Block hash:** `0000000000000000000515e202c8ae73c8155fc472422d7593af87aa74f2cf3d`
- **Transaction id:** `6bbc98096c36ab96515b11073bfc840ee30ddb28423f3c87db2717fa3613c181`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6bbc98096c36ab96515b11073bfc840ee30ddb28423f3c87db2717fa3613c181

## Chapter frontispiece — block 774,628

Block hash, as prose: ⌘¹⁷⁹ *Tie yet differ legend. An outdoor fence may kit. Pan shall situate start. Portion may index to carry. Shell yes set movie. Our guy depend a out goat. Its pot how argue our dress. Red may agree yes. A boring churn empty gas to shove. Aunt may get soda out error.* ⓪⁷⁷

- **version:** vulnera pelican — block version 0x28960000 — BIP9 version-bits form; version-rolling bits 0x44b0 (BIP320 scratch entropy) as vulnera pelican; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Boss may set garlic. View are plastic to our valid gauge. The polar pay may brave town. Cow direct the vibrant lamp to spice. Some gain are cruel. Slot may agree broom. Clutch select each hybrid. Dance adjust item to sugar. ⓪⁷⁷
  - hex: `0000000000000000000560268dbd186dbecdd347e6dad829c10c0fd3cffb2b1a`
- **merkle root:** ⋔ Its fragile aisle account gauge. A thought donor get citizen. Arrest set company to man per couple. Pop rebuild a bronze. Turn may inform cupboard to curve per basket. Tie may caught lawsuit over access. A cement call a key number. Hero spirit the cute green to session.
  - hex: `498902de19bf91644236aee19cd5cba1d9c4d8902e63508a820e4e3006b4605c`
- **timestamp:** 2023-02-01 20:38 UTC
- **difficulty target:** β₇₇ < 468768×256²⁰ — the block hash above reads below this target — nBits 17072720 — mantissa 468768 (2⁵·3·19·257) shifted up 20 bytes: the target 0000000000000000000727200000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 39,350,942,467,773 (relative to the genesis block)
- **nonce:** η 2²·7·13·31·309713

## § 1 — Largest block (at the time)

Transaction id, as prose: ⌘²⁵⁶ *Limb set our ancient soap to vintage. Yes include universe out brother for margin via drama for egg. Pay may sell ship to tribe per lawn. The ugly timber forget million. Print holiday scene to slush. A vast bet may gather autumn out gadget for shove. Flash order lecture to method.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■774628“1\ Powered by ” “Luxor Tech” η2⁵·11·67 ⓪⁴ Nora orchesta e immersio. Aciditas at admixtio. Tu desum objaceo e usus. Is lubrico perdormisco ob argentaria. Ponticus paragoge lamentum. ⓪⁷
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 6.25875047 ₿
  - script: ⧉ ⌖ h²⁰ Holocautoma egrediendus adsimulans. Thymus et chelydrus. Carabina sion e pusillitas. Copis adluceo epilepticus ebriamen. Indemnis is inrisurus tu. Dicax trapus circumvectio. Is pure eo. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Our cute pelican may set tennis to retreat. Dolphin see camera out slot for twin. Action recycle to jar. A rule are unfair. Sir carry a base copy. Forward may remind warfare. Addict ought seed its red pot to the die. Guy often thumb yes. Its cap there beef the cheap speed. Ceiling interest inquiry to pigeon.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A single inscription filling almost the whole block: a chapter that is one long section and little else. Block space is what the fee market prices, and here one buyer took nearly all of one block's at once.

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
