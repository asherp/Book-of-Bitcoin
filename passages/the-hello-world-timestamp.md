# The Hello World timestamp

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 358,391 read as a chapter, and its transaction 1352
> (of 1,433) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β74 ■1224 §1352 (Volume II, Book 74, Chapter 1224, section 1352)
- **Block:** 358,391
- **Block hash:** `000000000000000003e892881a8cdcdc117c06d444057c98b6f04a9ee75a2319`
- **Transaction id:** `7e9f0f7d9daa2d9e51b2e22f4abe814c3f90539afa778a9bef88dc64627cb2ec`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=7e9f0f7d9daa2d9e51b2e22f4abe814c3f90539afa778a9bef88dc64627cb2ec

## Chapter frontispiece — block 358,391

Block hash, as prose: ⌘¹⁸⁶ *Bomb due bracket its rigid red. Ban may develop a pyramid. Sir forget giggle to level via dynamic. Parent pair the casual soccer. Ecology may set health to banner. Trend blossom cow per our son.* ⓪⁷⁰

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁷ Ride bronze bid to reform. Son may like sand. A laptop impose spike. An exhaust is false. Pot erode foam to wrong. Mango grow an acoustic cactus. ⓪⁶⁹
  - hex: `0000000000000000040238cb61fda1452649edc9d18f435f7e1b285a589463b9`
- **merkle root:** ⋔ Due about warm its set badge. Piece is public to the cotton. Rule egg to retreat. Hit enhance pie among file. Proof just set garbage. Visual define armor to injury. Number may learn credit. Our hotel divorce son.
  - hex: `8a1b66ecb7cbd07d8139a7e7d7f2c41aab1f5009b8364aaf61d03ad245e47e00`
- **timestamp:** 2015-05-28 15:41 UTC
- **difficulty target:** β₆₇ < 1476341×256²¹ — the block hash above reads below this target — nBits 181686f5 — mantissa 1476341 (743·1987) shifted up 21 bytes: the target 00000000000000001686f5000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 48,807,487,245 (relative to the genesis block)
- **nonce:** η 2·5·17·24363373

## § 1352 — The Hello World timestamp

Transaction id, as prose: ⌘²⁵⁶ *Its cop uncover the negative blush. Ear situate silk to jelly. Hotel exclude whisper per spoon via tomato. Leader siege tennis to chunk. Wisdom rather mind a guy. Cow merge festival to the style. A march see law. Scale why get a ear.*

- **version:** 1
- **input 1:** spends output 1 of `986f8ec54e7cf956ff827949907a45547b851080899db657a63bcc2ed3f982e4`
  - script: s⁷² Aid rather output our inner phone. Weekend set drama to artefact. Behind interest our act per wisdom. Our legend may set an oyster. Yes teach a mouse. Genius involve the hungry limit. Turn anger a notice to mirror. Theme raven edge per poem. Grief may set clinic. A jet is robust. Cow inflict to patch for chuckle. Maze game right to wear. Step arrange its bitter luxury for visual. Each gossip is basic to two. The virtual quote get cactus. p³³ Its acoustic hockey set nation. Can get sport to oil. Its hire may set anxiety. Our used tumble spoon banner. East expand fix to music. A banner original miss its outer health. Few pop bring to decide.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.98972517 ₿
  - script: ⧉ ⌖ h²⁰ Armor live its vital buyer. Risk may demand canoe. Cop enforce its gap. Survey hammer a ginger tattoo. Romance is rose to our pie. ≡ ∇
- **output 2:** 0.00100000 ₿
  - script: ⧉ ⌖ h²⁰ Bulb service guide to scrap. Shoe may skin aunt. Color ago slide debris. Pan may open split. Pistol is visual to our lab. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The oldest OpenTimestamps proof anyone can still replay. The client ships it as its own worked example — `examples/hello-world.txt.ots`, which commits the SHA-256 of the words *Hello World!* — and replaying it lands here: a RIPEMD-160, the raw transaction wrapped around the result, then eleven levels of merkle path, ending on this chapter's merkle root. That landing is the whole of what a timestamp asserts. Nobody's word is asked for, no calendar is consulted, and the proof is as good today as the block is.

It predates the calendar servers by a year and wears the older dress. There is no OP_RETURN in it: the commitment sits where a public key's hash belongs, in an ordinary pay-to-pubkey-hash output of 100,000 satoshis. So the passage reads as a payment — to someone who has never existed, and can never sign. The coins are still there, and always will be. What looks like the most ordinary line in the section is the part that was never about money.

Drop the `.ots` at the foot of the Citations register and the book resolves it, checks it against this block's own header, and keeps it there.

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
