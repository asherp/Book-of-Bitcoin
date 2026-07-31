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

Block hash, as prose: ⌘¹⁸⁰ *Its dynamic midnight inhale session. Supply may top cow. Its simple tiger orbit force. Our marble hospital smooth client. Extra may see lamp to arch.* ⓪⁷⁶

- **version:** vmuffliato that — block version 0x37ffe000 — BIP9 version-bits form; version-rolling bits 0xbfff (BIP320 scratch entropy) as muffliato that; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ The entire visa behave dutch. Its toy sir retire our far foil to a strong gas. Sir allow to erase. Hello field to vanish. Assist label to agree. ⓪⁷⁷
  - hex: `00000000000000000005e17383e25f65b531d50060b99ed66f673ea251949e4b`
- **merkle root:** ⋔ Year get its broccoli to pull. Runway control same out measure. Gaze purse trust to the sunset. Ladder team charge via old. The famous brain may set supreme. Gesture weather the happy tunnel. Knife may abandon jet.
  - hex: `e81ed58f56fc853dfb1a9582264dea3d3e66379dae057be27df7b25eb58ee3fe`
- **timestamp:** 2020-11-03 08:28 UTC
- **difficulty target:** β₇₅ < 2¹⁶⁰·1098803 — the block hash above reads below this target — nBits 1710c433 — mantissa 1098803 shifted up 20 bytes: the target 00000000000000000010c4330000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,787,779,609,933 (relative to the genesis block)
- **nonce:** η 3²·691·488503

## § 1 — Difficulty −16.05%

Transaction id, as prose: ⌘²⁵⁶ *Demand get soda to height. Our hunt are eternal. Its cap may suggest regret. Pop never see a steak. Side swim cinnamon to sweet. Wheel get mountain for increase per impact. Yes reflect puzzle to insect. Son reopen hospital via hospital. Abandon ago set a red tie.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■655200 η233·1327·5189“sz/BTC.com/” Its wide tax is vibrant. Pop forget other due. Its cap may argue anxiety. An own pulp lock outside. A vacant lot is okay. Guy enter a lazy repair to dilemma via slight. Tooth drip its awake jar. Tap modify liquid to canoe for the science. Pepper get scene to abandon per abandon to alien. Monster invest accident via input. The mother great may inflict length. Our abandon would abandon abandon.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 8.33134574 ₿
  - script: ⓪ h²⁰ Oak set lawsuit to suit. Magnet may train sauce. Its pottery thunder six. Arm see a lava. Son promote to reopen. Our art foster rub.
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Oil due saddle its unusual garlic. Labor mushroom layer to horn. The wink ridge click. Rent how decide air. Our okay game may copy scrap. The evil sphere hire survey. Oxygen may divorce its due.
- **output 3:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:x”
- **output 4:** 0 ₿
  - script: ¶ ³⁶ Its rigid angle swarm its spray. The test easily ignore due. A dry advice far garden face. Blossom hazard input to ice. Hood head a marble bridge. Alert picture turkey off rose to silk. Capital scale its red.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

3 November 2020: Sichuan's wet season ending. The annual migration off cheap hydro, written into the chain's target as plainly as weather is written into a river gauge — and the clearest case in the series of the chain recording something entirely physical.

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
