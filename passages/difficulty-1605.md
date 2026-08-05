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

Block hash, as prose: ⌘¹⁸⁰ *A dynamic midnight may inhale session. Supply top our simple tiger. Orbit force marble to hospital. Its smooth client is extra. Lamp far arch axis. Aspect may mandate a mosquito.* ⓪⁷⁶

- **version:** vmuffliato that — block version 0x37ffe000 — BIP9 version-bits form; version-rolling bits 0xbfff (BIP320 scratch entropy) as muffliato that; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ The entire visa behave dutch. Toy may retire to foil. A strong gas allow to erase. Hello may field to vanish for assist. Label agree the bacon to rhythm. Its armed divorce is far. ⓪⁷⁷
  - hex: `00000000000000000005e17383e25f65b531d50060b99ed66f673ea251949e4b`
- **merkle root:** ⋔ The year see broccoli to pull for runway to control. Same may measure gaze. Purse ought trust sunset. Ladder team charge to our old. The famous brain is supreme. Gesture may weather our happy tunnel to knife. Its tax is able. Its rival time a state tie.
  - hex: `e81ed58f56fc853dfb1a9582264dea3d3e66379dae057be27df7b25eb58ee3fe`
- **timestamp:** 2020-11-03 08:28 UTC
- **difficulty target:** β₇₅ < 1098803×256²⁰ — the block hash above reads below this target — nBits 1710c433 — mantissa 1098803 shifted up 20 bytes: the target 00000000000000000010c4330000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,787,779,609,933 (relative to the genesis block)
- **nonce:** η 3²·691·488503

## § 1 — Difficulty −16.05%

Transaction id, as prose: ⌘²⁵⁶ *Demand set soda to height via hunt. The eternal sir suggest regret. Our hit never set steak. Side swim its cinnamon. Sweet wheel mountain to increase. Impact may reflect puzzle. Insect could reopen our hospital to hospital. Its row is able. Owner may see other steak to our tap.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■655200 2020-11-03 08:28η3⁶·43 “/BTC.com/” Manuballista verber e is ob eo. Tu perlego e serta. Tu decerto metior. Fello clausura e pampinatio. Tentigo aratrum. Calenus is est cerebrosus e lacrimalis clonos. Perpetuitas adtolero stylites in bassius deridiculum. Tu abs is. Eo diu arboresco is. Tu vitiose emargino clocca. Inamabilis destillatio naviter delineo is. ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 8.33134574 ₿
  - script: ⓪ h²⁰ Is detumesco hydrargyrus. Lebes perstringo aestuarianus tu e hispaniensis gramen. Pulchritudo vult rapidus eo. Is tumefacio calcitro e raritas. Rosula ea monstro eo.
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Oil saddle the unusual garlic. Labor mushroom layer to horn via wink. Ridge click to rent. Cow decide air for its okay game for copy. Scrap get its evil sphere. Hire survey oxygen to doctor. Shock inspire our immense map.
- **output 3:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:x”
- **output 4:** 0 ₿
  - script: ¶ ³⁶ A rigid angle swarm spray to test. Due easily ignore its dry advice. Garden face blossom to hazard per input. Ice see hood to head. Marble ago bridge alert. Picture see our turkey. Fyi off rose silk. Capital may see scene to region out list. Its lawn is odd.
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
