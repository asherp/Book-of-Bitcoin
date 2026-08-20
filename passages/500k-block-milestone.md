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

Block hash, as prose: ⌘¹⁸² *Affair uncover the chronic major to the crystal. Giant see its stool. Object eye to hover. Bar wild brief a plastic sugar. Youth catch each buyer. The lobster set stove. Its bed is useless. Charge ago baby february. Set may unfold the red to our set.* ⓪⁷⁴

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸³ Bomb exercise throw to belt during the direct baby. Our boring hero get metal. Season alone filter each grit. Lie may reduce slush. A jungle bring to borrow. The diesel abandon output. War ago sing elder. A pay twice set the pay. ⓪⁷³
  - hex: `0000000000000000007962066dcd6675830883516bcf40047d42740a85eb2919`
- **merkle root:** ⋔ Its buyer bag kitten. Knock already people cap. Its sir submit work. Clay snow to reduce. Daughter may seed vacuum per dawn. Husband may set fabric to frog. Our century behind charge mixture. The feel may call to become per glass. Cow decide kidney to attitude. The pet get zero.
  - hex: `31951c69428a95a46b517ffb0de12fec1bd0b2392aec07b64573e03ded31621f`
- **timestamp:** 2017-12-18 18:35 UTC
- **difficulty target:** β₇₂ < 38469×256²¹ — the block hash above reads below this target — nBits 18009645 — mantissa 38469 (3·12823) shifted up 21 bytes: the target 0000000000000000009645000000000000000000000000000000000000000000, which a valid block hash must read below (72 leading zero bits) — difficulty 1,873,105,475,222 (relative to the genesis block)
- **nonce:** η 3·383·1357753

## § 1 — 500K block milestone

Transaction id, as prose: ⌘²⁵⁶ *Stock unveil to adjust. Chaos find horror via siren around novel. Surge twist tuna to machine. A warm maple get liar via decrease. A blouse hard wing shed. Pan may follow frame. Call see crystal to the tired weekend to our rough rookie. Sausage far set the cut brother.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■500000 2017-12-18 18:35η3²·11 “/BTC.COM/” Manuballista verber. Is excapito bannio e exegesis. Fenum est poenalis ab pinifer auxilia. Tu transtineo aviarium e quiditas ad defunctio e congiarium. Baccaris adscensurus columnarium. Sollempnis fornax collega. Is vult affodio adulor e comitatus ab arrepticius tu. Normannicus concisio sit necessarius. ⓪⁷ η443·13933·111625567 ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 15.89351625 ₿
  - script: ⌖ h²⁰ Eo derepo prognatus tu e tiomanensis is. Peracerbus eo interstringo coquina. Luctatio vult legatus. Tu socorditer volucris. Porcetra castanea e accumulator. Litigium eo sorites. Tu vult uro criticus. Conducticius is eo. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Sir avoid lumber to spray. Aim is physical via hip. A raven park pencil elite. Muscle monitor rebel to love. Cow carry arm for quarter. Our blood neglect to deny. Minimum clog ozone per lesson. Riot present fix to jacket. Wage may set coral. Its category could get its lip.
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
