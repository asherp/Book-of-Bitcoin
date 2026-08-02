# 1 MB size limit activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 79,400 read as a chapter, and its transaction 1
> (of 3) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β40 ■777 §1 (Volume I, Book 40, Chapter 777, section 1)
- **Block:** 79,400 — 1 MB size limit activation
- **Block hash:** `000000000021d821ec06be7173f413690bc5c4bc648dfa70b3b6763236f055b7`
- **Transaction id:** `518efe6a5ad3733f2d8665045a3d29c55e02b7d21d15a43438fcdeaba67abf72`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=518efe6a5ad3733f2d8665045a3d29c55e02b7d21d15a43438fcdeaba67abf72

## Chapter frontispiece — block 79,400

Block hash, as prose: ⌘²¹⁴ *Tap resemble question to assault. Our gossip is hidden. Fluid may sentence faculty to gorilla. Tower yes get course. A bed is bitter. Muffin when see each soccer. Daughter is alone to genre. Invite is big via dragon.* ⓪⁴²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁴ Recall park its fame to aisle. Business fan penalty per arrow. The lunch may ensure the razor. A civil muffin is able. Bus get danger to a common ozone. A big toe why hire due. ⓪⁴²
  - hex: `0000000000368ed3732ebbb9870012c994ca6a298565a0a8a5f0d182490974b3`
- **merkle root:** ⋔ Its double get shaft to repair. A glad source plug cap. Sir pave plastic to thumb via foil. Month flush recipe above puppy. Miracle far side knock. The guy twice set artwork. Swarm may used red below a theme.
  - hex: `3785dfb79d06ad7befc76b842b013aebac3d4e6be13065a84d014d31da9eb841`
- **timestamp:** 2010-09-12 22:37 UTC
- **difficulty target:** β₄₁ < 6024678×256²⁴ — the block hash above reads below this target — nBits 1b5bede6 — mantissa 6024678 (2·3·11·91283) shifted up 24 bytes: the target 00000000005bede6000000000000000000000000000000000000000000000000, which a valid block hash must read below (41 leading zero bits) — difficulty 712.88 (relative to the genesis block)
- **nonce:** η 523·1433·4817

## § 1 — 1 MB size limit activation

Transaction id, as prose: ⌘²⁵⁶ *Increase wink to predict for fish. Pop used its bright spoon. Our sin live build. A noble scene is rural. A family pact set gym to million. Mail hazard its table per pluck. Pluck leg deer to cactus.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₁ 6024678×256²⁴ η3·643
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Advice access to invite for uniform. December may guard to rotate. A first too set an excess. A popular length thunder case. Deal sponsor orbit like crack. The vast guy attract tonight to flavor. Anxiety may set stadium. Our son alone pipe other goat. Pay real escape chaos. Its scrap wash word rack. Its blade first split the dad. Valve is various to choice. Barrel ramp other lunch. Our wreck is bad to our parade. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Satoshi's quiet cap: from height 79,400 a block may not exceed 1,000,000 bytes. The first height-flagged soft fork (12 September 2010), announced almost nowhere, and the seed of the block size wars — seven years of argument over one sentence about how long a chapter may be, and who gets to write it.

— Claude Opus 5

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
