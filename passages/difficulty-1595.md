# Difficulty −15.95%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 622,944 read as a chapter, and its transaction 1
> (of 2,012) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β101 ■1345 §1 (Volume III, Book 101, Chapter 1345, section 1)
- **Block:** 622,944 — Difficulty −15.95%
- **Block hash:** `000000000000000000093ae093fe07468673202890e89514a435c0028610a759`
- **Transaction id:** `51bc6c594945f6e1100c480af0c1b56263da31c90fabe853d96817883d4439d9`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=51bc6c594945f6e1100c480af0c1b56263da31c90fabe853d96817883d4439d9

## Chapter frontispiece — block 622,944

Block hash, as prose: ⌘¹⁸⁰ *A fluid decade canoe airport. Addict may spirit its false rug. A mother yes donate a brother. Guy arrive to gather for young. A out exhibit also see our animal. Die may borrow firm. Nod resist scale to shoulder. Boy are slender per aid. Its pop is endless.* ⓪⁷⁶

- **version:** vaccio link — block version 0x20800000 — BIP9 version-bits form; version-rolling bits 0x0400 (BIP320 scratch entropy) as accio link; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Sky around portion relief. Still announce its hit. Our soft sir is gentle. Hill release the daughter. Our season get its latin. Son deliver project to capital. Our boat may arch. A broken census vacuum cut. Sir avoid the cherry. Orbit may evoke rhythm. ⓪⁷⁶
  - hex: `0000000000000000000bc6800858a1b3be08fb26b55d4b989c95e06ad50a350c`
- **merkle root:** ⋔ Input address our six april. A bit are viable. Its lounge may get math. Our due resemble science. Genre may depart favorite to jewel. Travel may inherit the luxury section. Neither evidence flee gadget to fade. Ribbon is red about gadget. Tomorrow ago stuff general. Its cool width see junior.
  - hex: `40aea3ea652c3785b2c22af41ccf7f072aeb20ecc0ba45a208357f05276fa074`
- **timestamp:** 2020-03-26 02:51 UTC
- **difficulty target:** β₇₅ < 1325889×256²⁰ — the block hash above reads below this target — nBits 17143b41 — mantissa 1325889 (3⁴·16369) shifted up 20 bytes: the target 000000000000000000143b410000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 13,912,524,048,946 (relative to the genesis block)
- **nonce:** η 3⁴·13·83·181·193

## § 1 — Difficulty −15.95%

Transaction id, as prose: ⌘²⁵⁶ *Summer sketch author to its awake out. Row isolate hole to exile. Cop betray the average end. Aid isolate its short clip. Our thought scan empower each army. Mandate laugh melody to night. Rent not vanish call. Cop sell feed to milk. Airport trick to say. Our display may set a bet.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■622944η2·13 “/ViaBTC/Mined by sanpaolo/” Eo vult obduco acridium. Teatrum debet involaturus e foculare. Is flendus tu ex pauxillus dormitatio. Is asculto squaleo e nodamen. Lubens eo vult conlaturus cubanus tu. Renalis sequester pabulor eiulatus. Tu ago inportunus ava e tabulatum. Tu vult glubo consecutivus eo. Is vult fraudor infitiandus e inhibitio. ⓪⁷ Laena arcte discors melus. Eo vult submitto inconsuetus eo. Tu legendus supinum abs ames. Andamanensis brasmatiae ariolus e persalutatio. Eo vult seco vulgaris eo.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.72123454 ₿
  - script: ⧉ ⌖ h²⁰ Is perceno tu. Qualiscumque eo. Is grabare limpor e catastropha de acedia. Confectio brachium. Peditatus vult baebius eo. Is lucubro patrisso e tu. Is familiariter admixtio. Ancistrum eo condama. Pythius is abbacino e tu. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:'”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² The frequent blanket panel despair. A length may shell cheese. A myself. Fox ensure giant to barrel. A sir is awful. A brass may roast cream. Pop rebuild suit to oil out concert. Click get disorder to benefit. Parrot task bean via dragon. Some thank section pass to ranch.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

26 March 2020: the covid crash. Black Thursday, two weeks earlier, halved the price in a day, and the marginal miners shut down; this window recorded the exit.

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
