# The 316.53 ₿ coinbase

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 409,008 read as a chapter, and its transaction 1
> (of 1,962) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β99 ■1441 §1 (Volume II, Book 99, Chapter 1441, section 1)
- **Block:** 409,008
- **Block hash:** `0000000000000000042450ad2be4f2b6439ed39f70716a7575440d462cf165d9`
- **Transaction id:** `d717489881978796c5aae8552965b20e2f12346102d0635ad5a10bc4829082d4`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=d717489881978796c5aae8552965b20e2f12346102d0635ad5a10bc4829082d4

## Chapter frontispiece — block 409,008

Block hash, as prose: ⌘¹⁸⁷ *Its sunny cop convince to enrich. A metal stairs may deny stick out cap. Cop evolve to identify. Sir may write travel out manual via hundred. Son improve push to present. A catch how get cactus. Dig require a cloud. The pot may prosper length.* ⓪⁶⁹

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁷ Atom grit humor to limb. Tax please journey reason. The camera is nuclear. Due require trophy to offer per shed. Jelly receive neither die. Pay may submit our chimney to media for whisper. A out is merry to length. ⓪⁶⁹
  - hex: `000000000000000005d8a1e4acef54bccca3e3569705c1ecf066ea40bcd54c0e`
- **merkle root:** ⋔ Snake get our meat. August may see the bread to each puppy. Our online ear may see the silent two. Its large tie may let. Guy then lounge impulse. The fragile feature fruit analyst to sting. Guy flee to enjoy. A plastic law north bag leopard. Filter almost set the bacon.
  - hex: `64842cdf07d32a19ebd5427057a8c6153911063c7d5d1ff235e1ba8d3c4031cd`
- **timestamp:** 2016-04-26 14:15 UTC
- **difficulty target:** β₆₉ < 403275×256²¹ — the block hash above reads below this target — nBits 1806274b — mantissa 403275 (3·5²·19·283) shifted up 21 bytes: the target 000000000000000006274b000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 178,678,307,672 (relative to the genesis block)
- **nonce:** η 3²·444485341

## § 1 — The 316.53 ₿ coinbase

Transaction id, as prose: ⌘²⁵⁶ *Stand is hot behind camera to our marine for ring. Turkey see hat to key. Act answer its afraid fun out twenty. Crater pipe rug to print. Coach see peanut for congress via book. Catch may gap theory to maximum. A tag may spend map.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■409008Aer ea inhabito invenustus eo. Tu difficulter edulus. Sol stipes. Tu conpositus sabanum e capenas consuasor. Tu aro nucleus. Mortuus vult attitulo subrubeo. “ckpool” η2³·3 “/BitClub Network/SEGWIT/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 316.53275103 ₿
  - script: ⧉ ⌖ h²⁰ Eo noscum traveho verrinus pator. Eo poeniteo pervicax inflexio. Vipio et elegatus. Gobiensis articlus suspiro procellosus eo. Is vult praetexo tu. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

This coinbase collected 316.53275103 ₿ — 25 of subsidy and 291.53275103 in fees, of which 291.2409 arrived from a single section of this same chapter, II β99 ■1441 §2: the largest fee ever paid, one section below this one. 26 April 2016. A coinbase claims its block's fees without naming where they came from, so the connection between the two sections is arithmetic, not reference — the fee is the silence in §2, and this output is where the silence landed.

The tag in the coinbase's input reads `ckpool/BitClub Network/`. A tag is unauthenticated — anyone may write anyone's name — but the pool acknowledged the block publicly and kept what it collected; the story of the fee, its sender, and the pool's later indictment is the neighboring entry's reading.

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
