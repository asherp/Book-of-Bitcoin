# The Third Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 630,000 read as a chapter, and its transaction 1
> (of 3,134) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β1 ■1 §1 (Volume IV, Book 1, Chapter 1, section 1)
- **Block:** 630,000 — The Third Halving
- **Block hash:** `000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d`
- **Transaction id:** `cc2ca076fd04c2aeed6d02151c447ced3d09be6fb4d4ef36cb5ed4e7a3260566`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=cc2ca076fd04c2aeed6d02151c447ced3d09be6fb4d4ef36cb5ed4e7a3260566

## Chapter frontispiece — block 630,000

Block hash, as prose: ⓪⁷⁸ ⌘¹⁷⁸ *Hospital may exchange our social era. Tube set this foster yes. Pot may achieve swallow. Bid nest bachelor to notable. Our useful glove may enact. Each son is acoustic.*

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⓪⁷⁶ ⌘¹⁸⁰ Bullet frequent proof to donor. Son may inhale stone. Some screen is soft. A pop is keen. Trouble shoulder rescue to force. Echo see a mad hole. Our artist is pop.
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ Its artwork may get liberty. Its genuine above like our humble midnight. The fyi is angry. A grant may doctor to scatter. Cow caught a soft glow via grace. Year get setup to anchor. The license indicate display for width. Egg may set cactus.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2302182970

## § 1 — The Third Halving

Transaction id, as prose: ⌘²⁵⁶ *Gravity circle its pottery to soul. Echo see grain for sweet. The whisper refuse law. Liquid how knock style. Our capital icon may park hospital. Hope rack the antique student. Its exotic rebel get length.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “Mined by AntPool119”
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote 1
- **output 1:** 7.15968084 ₿
  - script: ⧉ ⌖ h²⁰ Balcony set tennis to case. Miracle may gesture woman. Its boy remove lot. Our eternal wall may laugh to enter. Broccoli may toss its goat. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Comic rough get our vicious flock. Hockey set furnace to estate. Our cheap infant far conduct denial. Arm sting a silent bulk. A loud zero set danger. Tea truly get strategy. The aerobic elbow plate length.
- **output 3:** 0 ₿
  - script: ¶ ³⁶ “0	XDp”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

1. ∅

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⓪ⁿ ⌘ᵐ — n leading
proof-of-work zero bits, then the remaining m = 256 − n bits of the
double-SHA256 (⌘, OP_HASH256), Glossia-encoded as ⌈m/8⌉ bytes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
