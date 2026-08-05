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

Block hash, as prose: ⌘¹⁸² *Affair uncover our chronic major to crystal. Our giant set stool. Object eye to hover bar wild to brief. Plastic sugar a youth catch below drill. Resource may see mosquito.* ⓪⁷⁴

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸³ Bomb exercise throw to belt. Ear get pie during rub. A direct baby are boring to its hero. Metal season an alone filter. Grit may reduce slush to jungle. A bleak swift may frequent to gas. ⓪⁷³
  - hex: `0000000000000000007962066dcd6675830883516bcf40047d42740a85eb2919`
- **merkle root:** ⋔ Our buyer bag kitten. Knock already people pan. Sir submit work to clay. Snow reduce daughter for seed. Vacuum dawn husband to fabric. Frog may set century. Behind might charge mixture. Feel see cake to gossip. Fork may bubble the lap.
  - hex: `31951c69428a95a46b517ffb0de12fec1bd0b2392aec07b64573e03ded31621f`
- **timestamp:** 2017-12-18 18:35 UTC
- **difficulty target:** β₇₂ < 38469×256²¹ — the block hash above reads below this target — nBits 18009645 — mantissa 38469 (3·12823) shifted up 21 bytes: the target 0000000000000000009645000000000000000000000000000000000000000000, which a valid block hash must read below (72 leading zero bits) — difficulty 1,873,105,475,222 (relative to the genesis block)
- **nonce:** η 3·383·1357753

## § 1 — 500K block milestone

Transaction id, as prose: ⌘²⁵⁶ *Stock unveil to adjust via our chaos. The find get horror. Siren around see novel. Surge may twist tuna to machine out our warm maple. Its liar may decrease blouse. Our hard wing shed to follow. The frame get cake. Its drastic swamp may set our far symptom.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■500000 2017-12-18 18:35η3²·11 “/BTC.COM/” Manuballista verber. Is excapito bannio e exegesis ab fenum. Poenalis eo pinifer auxilia. Is transtineo aviarium e quiditas. Defunctio vult congiarium ad baccaris. Is adscensurus columnarium. Sollempnis fornax collega e pettia. Eo dijugo obsidianus tu. ⓪⁷ η443·13933·111625567 ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 15.89351625 ₿
  - script: ⌖ h²⁰ Tu derepo prognatus eo e tiomanensis tu. Peracerbus is interstringo coquina. Luctatio legatus e tu. Eo socorditer volucris. Porcetra vult fuscina. Is pudibilis iucunditas. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Son avoid to lumber. Spray aim its physical hip. Raven may park pencil. Its elite muscle monitor. Rebel love to carry for arm. Quarter set blood to neglect. Son deny minimum per clog via ozone. Leopard may snake dig near laugh.
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
