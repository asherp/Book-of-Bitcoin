# Difficulty −16.05%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 655,200 read as a chapter, and its transaction 1
> (of 2,108) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β13 ■1009 §1 (Volume IV, Book 13, Chapter 1009, section 1)
- **Block:** 655,200 — Difficulty −16.05%
- **Block hash:** `0000000000000000000be6439455cefcb61e62eb9b0f47f2c99d2de2ce8dd144`
- **Transaction id:** `78dbdb668bbabb86d671952324f4bb8d946fff18d5a82cedb1d9b4b7aac5393a`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=78dbdb668bbabb86d671952324f4bb8d946fff18d5a82cedb1d9b4b7aac5393a

## Chapter frontispiece — block 655,200

Block hash, as prose: ⌘¹⁸⁰ *A dynamic midnight inhale session to supply. Top is simple out tiger. Orbit may force marble to our hospital. Pie may smooth client. An extra lamp is arch. Our son brave smile. Tower is useless to soap out twin. Set may pave to shock.* ⓪⁷⁶

- **version:** vmuffliato that — block version 0x37ffe000 — BIP9 version-bits form; version-rolling bits 0xbfff (BIP320 scratch entropy) as muffliato that; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Its entire visa behave dutch. Toy may retire foil. Some guy is strong. Gas allow to erase. Hello field to vanish. An assist label to agree. Brain set jungle via helmet. Cactus may couple pulse. A cop devote our client. ⓪⁷⁷
  - hex: `00000000000000000005e17383e25f65b531d50060b99ed66f673ea251949e4b`
- **merkle root:** ⋔ Year may see broccoli to pull. A runway control same per measure. Gaze purse trust to sunset. Ladder team charge for old. A famous brain are supreme. Gesture may weather a happy tunnel. Knife about soap swift. Lie vanish to absent. A ago eagle are insane via our coffee.
  - hex: `e81ed58f56fc853dfb1a9582264dea3d3e66379dae057be27df7b25eb58ee3fe`
- **timestamp:** 2020-11-03 08:28 UTC
- **difficulty target:** β₇₅ < 1098803×256²⁰ — the block hash above reads below this target — nBits 1710c433 — mantissa 1098803 shifted up 20 bytes: the target 00000000000000000010c4330000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,787,779,609,933 (relative to the genesis block)
- **nonce:** η 3²·691·488503

## § 1 — Difficulty −16.05%

Transaction id, as prose: ⌘²⁵⁶ *Demand set soda to a height. Our far hunt is eternal. Tap may suggest its regret. The cow never get steak. Side swim cinnamon to sweet. Wheel see mountain out increase. Impact may reflect puzzle. Insect reopen hospital to hospital. Ban about truck pig. Vacuum dice its indoor acid. Our pan may destroy map.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■655200 2020-11-03 08:28η3⁶·43 “/BTC.com/” Manuballista verber. Eo perlego serta. Tu vult decerto metior. Fello clausura e pampinatio. Tentigo aratrum. Calenus is est cerebrosus. Lacrimalis clonos perpetuitas. Eo adtolero e stylites. Bassius deridiculum sit abs tu de eo. Is diu arboresco is. Eo vitiose emargino clocca. Inamabilis differentia conyza. Eo interverto eclipticus ligustrum. Staphis et tetrastichon. ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 8.33134574 ₿
  - script: ⓪ h²⁰ Tu detumesco hydrargyrus e lebes. Tu perstringo aestuarianus is en hispaniensis gramen in pulchritudo. Rapidus tu tumefacio calcitro. Maternus eo decoquo defensatrix. Contagio vult stello multifarius screator.
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Oil saddle an unusual garlic. Labor mushroom layer to horn. Wink ridge click out rent. Pop decide air to an okay game. Copy scrap its evil sphere to hire for survey. The oxygen document rally to error. Each favorite is choice. Gravity may set soup. A glimpse is new.
- **output 3:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:x”
- **output 4:** 0 ₿
  - script: ¶ ³⁶ The rigid angle swarm spray. Test easily ignore aid. Our dry advice garden face to blossom. Hazard may input ice for hood. Head yes marble bridge. Alert picture turkey off our rose silk. Its capital school fold vapor to crush for lava to rescue. Monitor may harvest ear.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

3 November 2020: the end of Sichuan's wet season. Miners on seasonal hydropower shut down as it ended, and the target recorded the exit — an annual, physical cause, the clearest in the series.

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
