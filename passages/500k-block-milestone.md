# 500K block milestone

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 500,000 read as a chapter, and its transaction 1
> (of 2,701) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β40 ■1377 §1 (Volume III, Book 40, Chapter 1377, section 1)
- **Block:** 500,000
- **Block hash:** `00000000000000000024fb37364cbf81fd49cc2d51c09c75c35433c3a1945d04`
- **Transaction id:** `2157b554dcfda405233906e461ee593875ae4b1b97615872db6a25130ecc1dd6`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=2157b554dcfda405233906e461ee593875ae4b1b97615872db6a25130ecc1dd6

## Chapter frontispiece — block 500,000

Block hash, as prose: ⌘¹⁸² *Our tax may absorb our absurd. Cop carry gown to drum. Its creek may price to assist. Guy receive scare out maximum. Our indoor negative may submit text. Cotton shoulder to will. A hot cactus is ago.* ⓪⁷⁴

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸³ Due may absorb absurd. Guy sing kit to anxiety. Point may cancel village. Each marine is sorry. Fold are general to baby. Dance recall cup out patch. Sir give to siege. ⓪⁷³
  - hex: `0000000000000000007962066dcd6675830883516bcf40047d42740a85eb2919`
- **merkle root:** ⋔ Abandon may get its absurd wild. Midnight due surprise task. Sir defy our bitter science to umbrella. Fade may hole parent. Its salute far get blood. The loud satoshi leg mercy. Our truck climb to picnic. The cruel inch are new out plate.
  - hex: `31951c69428a95a46b517ffb0de12fec1bd0b2392aec07b64573e03ded31621f`
- **timestamp:** 2017-12-18 18:35 UTC
- **difficulty target:** β₇₂ < 38469×256²¹ — the block hash above reads below this target — nBits 18009645 — mantissa 38469 (3·12823) shifted up 21 bytes: the target 0000000000000000009645000000000000000000000000000000000000000000, which a valid block hash must read below (72 leading zero bits) — difficulty 1,873,105,475,222 (relative to the genesis block)
- **nonce:** η 3·383·1357753

## § 1 — 500K block milestone

Transaction id, as prose: ⌘²⁵⁶ *Abandon achieve some rail. Our indoor lap may bring crane. Out shall rely its horse. Guy enrich ghost to rhythm out spray to friend. Its fatal coconut ridge to develop per alert. Its simple scrap set enemy. Tape may clean stem. A low tomorrow get row.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■500000 2017-12-18 18:35η3²·11 “/BTC.COM/” An above acid sting opera to swarm. Tackle jar a brief crouch. River write to hit. Its clever cushion set six. Stone due curve an awesome artefact. Slide set a worth gorilla to move. The rent is hidden. A bit may rotate the plunge. Tea again spoon lip. A set is acoustic. ⓪⁷ η443·13933·111625567 ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 15.89351625 ₿
  - script: ⌖ h²⁰ Its absurd abuse behave stem. Number wash a cute salmon to october. Our churn vacuum its endless sibling. Cupboard may get our memory. A yes obey scale. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon is absurd to letter. Its chief novel may click buyer. Garden shall neck actor. Best out dog milk. Judge see each office. Case may set blade. A frozen kitchen see sauce. Parent yes get its stereo habit. The frame may see virus.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Another round number, but this one is printed on the page: since BIP34 a coinbase must open with the height of its own block, so the first line of this section, under ■, reads 500,000.

The section also dates itself economically. December 2017 was the month demand for block space made fees a real cost, and the balance line here shows the coinbase collecting well above its 12.5-coin subsidy — the difference is that month's fees, summed into one output.

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
