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

Block hash, as prose: ⌘¹⁸⁰ *A fluid decade canoe airport to addict. Our spirit is false. Rug mother to donate via brother. Pan may arrive to gather. Our young exhibit also get the animal. Balance may set its notable to our stone parade.* ⓪⁷⁶

- **version:** vaccio link — block version 0x20800000 — BIP9 version-bits form; version-rolling bits 0x0400 (BIP320 scratch entropy) as accio link; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Bet around portion relief. Still may announce pop. Its soft map is gentle. Hill release daughter to the season. Latin deliver project via capital. Boat arch a blame. Tonight get museum to hybrid. ⓪⁷⁶
  - hex: `0000000000000000000bc6800858a1b3be08fb26b55d4b989c95e06ad50a350c`
- **merkle root:** ⋔ Input may address six. April is viable to lounge out math. Ear may resemble science. Genre could depart favorite. Jewel travel to inherit per luxury to section. Neither evidence flee gadget. Fade may ribbon pie. Our able claim tank velvet.
  - hex: `40aea3ea652c3785b2c22af41ccf7f072aeb20ecc0ba45a208357f05276fa074`
- **timestamp:** 2020-03-26 02:51 UTC
- **difficulty target:** β₇₅ < 1325889×256²⁰ — the block hash above reads below this target — nBits 17143b41 — mantissa 1325889 (3⁴·16369) shifted up 20 bytes: the target 000000000000000000143b410000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 13,912,524,048,946 (relative to the genesis block)
- **nonce:** η 3⁴·13·83·181·193

## § 1 — Difficulty −15.95%

Transaction id, as prose: ⌘²⁵⁶ *Summer sketch to author. Cow awake to isolate. Hole exile to betray. An average end may isolate short. Clip is thought to scan. Pop empower army out mandate for laugh. Melody is night to rent. Sky vanish cake per a refuse. Our honey see poverty.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■622944η2·13 “/ViaBTC/Mined by sanpaolo/” Tu vult obduco acridium. Teatrum involaturus foculare. Eo ut flendus pauxillus dormitatio. Eo vult asculto squaleo. Nodamen solet lubens eo. Is conlaturus cubanus tu e renalis sequester in is. Tu vult pabulor eiulatus. Eo ago inportunus asa. Eo ut arguo ordinarius. ⓪⁷ Laena arcte tu. Discors melus submitto inconsuetus eo e is. Tu vult legendus supinum abs tu. Sed. Eo vult similo permetior.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.72123454 ₿
  - script: ⧉ ⌖ h²⁰ Is eo perceno tu. Qualiscumque is. Eo grabare limpor e catastropha. Acedia confectio ob brachium. Peditatus e baebius is. Eo lucubro pervolo. Selectio ea prophetizo is. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:'”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Its frequent blanket panel despair. Length shell a out cheese. An myself. Fox ensure some giant. Barrel is awful to a brass roast. Cream rebuild its suit. Oil get concert to our click. Disorder benefit park via poverty. Claw may guide dig.
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
