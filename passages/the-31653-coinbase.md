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

Block hash, as prose: ⌘¹⁸⁷ *The sunny cow convince to enrich. A metal stairs may deny stick. The guy evolve to identify. Pop write travel per manual. Hundred improve push to our present catch to cactus. Turn see its cereal planet. The length is public. Oyster may see salon to spawn.* ⓪⁶⁹

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁷ Atom grit to humor. A limb please journey reason. Camera get the nuclear pie. Row far require trophy. Its offer may shed jelly. Die might receive neither map. Our cow submit chimney. Stumble are visual to lizard. Length set dentist for cabin. Beyond not unveil a red. ⓪⁶⁹
  - hex: `000000000000000005d8a1e4acef54bccca3e3569705c1ecf066ea40bcd54c0e`
- **merkle root:** ⋔ Snake set meat to august. The bread set puppy. Its die is online. Its silent two far set son. Its large sin see its lip to a sky. Pay then lounge impulse. The fragile feature may fruit analyst to the sting. Guy flee to enjoy per plastic for law. Its north bag lesson cannon. The son dismiss to crumble. An able cricket see our angry job.
  - hex: `64842cdf07d32a19ebd5427057a8c6153911063c7d5d1ff235e1ba8d3c4031cd`
- **timestamp:** 2016-04-26 14:15 UTC
- **difficulty target:** β₆₉ < 403275×256²¹ — the block hash above reads below this target — nBits 1806274b — mantissa 403275 (3·5²·19·283) shifted up 21 bytes: the target 000000000000000006274b000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 178,678,307,672 (relative to the genesis block)
- **nonce:** η 3²·444485341

## § 1 — The 316.53 ₿ coinbase

Transaction id, as prose: ⌘²⁵⁶ *The bad stand behind get camera. Marine may ring turkey. A hat key act. Answer see its afraid fun. A twenty crater pipe rug. Print coach peanut to congress. Book may catch gap. Its sin there see a wrist. Its tool visit the select aid. Pop make process to course.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■409008Aer inhabito invenustus eo. Tu difficulter edulus. Sol ut stipes. Tu conpositus sabanum e capenas consuasor. Is aro nucleus. Motivus eo deliquesco melichrysos e faveolatus meditamentum. Deliberatio propalam tu. “ckpool” η2³·3 “/BitClub Network/SEGWIT/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 316.53275103 ₿
  - script: ⧉ ⌖ h²⁰ Eo noscum traveho verrinus pator. Tu poeniteo pervicax inflexio. Vipio e elegatus. Gobiensis articlus inspicio discrucio. Eo pudice incusatio. Pressorium ne invisitatus olivetum. ≡ ∇
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
