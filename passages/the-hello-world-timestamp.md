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

Block hash, as prose: ⌘¹⁸⁶ *Bomb bracket a rigid sky. Cow develop a pyramid. Yes forget giggle to level. Dynamic how parent pair. Its set is casual. Soccer get ecology to health. Banner trend to blossom. Venue segment garment for abandon. Our eye get topic to baby. The advance may see cop.* ⓪⁷⁰

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁷ Ride may bronze bid to reform like sand. Laptop impose to spike for exhaust. The false die erode foam to wrong. A mango may grow an acoustic cactus per token. A select oil may set length to flash. Our kite may develop volcano. ⓪⁶⁹
  - hex: `0000000000000000040238cb61fda1452649edc9d18f435f7e1b285a589463b9`
- **merkle root:** ⋔ Aid about warm badge. Piece yes set public. Cotton rule egg to retreat. Dig enhance pay among file. Proof just set garbage. Visual may define armor. Injury number to learn per our credit. The hotel document to settle. Pony kid page via rifle. Bit are indoor to alien.
  - hex: `8a1b66ecb7cbd07d8139a7e7d7f2c41aab1f5009b8364aaf61d03ad245e47e00`
- **timestamp:** 2015-05-28 15:41 UTC
- **difficulty target:** β₆₇ < 1476341×256²¹ — the block hash above reads below this target — nBits 181686f5 — mantissa 1476341 (743·1987) shifted up 21 bytes: the target 00000000000000001686f5000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 48,807,487,245 (relative to the genesis block)
- **nonce:** η 2·5·17·24363373

## § 1352 — The Hello World timestamp

Transaction id, as prose: ⌘²⁵⁶ *Yes uncover a negative blush. Tax situate silk to jelly. Hotel exclude whisper via spoon out tomato. Leader may siege tennis to chunk. Wisdom rather mind cop. Nod merge our festival. Style ago march the law. Cap may scatter husband to animal for a crazy wash. Pie cool spin to an awful ban.*

- **version:** 1
- **input 1:** spends output 1 of `986f8ec54e7cf956ff827949907a45547b851080899db657a63bcc2ed3f982e4`
  - script: s⁷² Each rub rather output bit. The inner phone weekend the drama. An artefact behind interest its act. Wisdom may see legend. Oyster shall teach mouse to genius. Fyi involve its hungry limit for turn out anger. Its notice mirror theme to raven. Edge get poem per grief. A clinic may set its robust cow. Cop inflict some patch. Chuckle may maze game to its right wear to step. Sir arrange our bitter luxury. Visual gossip the basic two to the virtual quote. Call muscle to lend. School may upset bicycle via physical. List is social to the base for desert. p³³ Our acoustic hockey see nation. Can may get sport. Oil ought hire our odd anxiety. Yes used to tumble. Spoon set a banner east. Guy may expand fix to music. A banner original may miss its outer health. Few guy bring to decide. Pay adjust to siege. Son accuse to scale. Warfare screen the silly aid for its obvious sin.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.98972517 ₿
  - script: ⧉ ⌖ h²⁰ Armor live our vital buyer. Risk ago demand a canoe. Cop enforce gap to survey out hammer to ginger. Tattoo romance to rose. Its hidden yes again see tennis. A divorce coach to ensure. Hollow may see cereal. ≡ ∇
- **output 2:** 0.00100000 ₿
  - script: ⧉ ⌖ h²⁰ Bulb service guide to the scrap shoe to skin. Aunt color slide via debris. Pop too open split. Our pistol is visual. Our lab set gown to trap. Arrow divorce guy between its brisk physical. Our penalty get tax. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The oldest OpenTimestamps proof anyone can still replay. The client ships it as its own worked example — `examples/hello-world.txt.ots`, committing the SHA-256 of the words *Hello World!* — and replaying it lands here: a RIPEMD-160, the raw transaction wrapped around the result, then eleven levels of merkle path, ending on this chapter's merkle root. That landing is the whole of what a timestamp asserts; nobody's word is asked for, no calendar server is consulted, and the proof is as good today as the block is.

It predates the calendar servers by a year and uses the older construction. There is no OP_RETURN in it: the commitment sits where a public key's hash belongs, in an ordinary pay-to-pubkey-hash output of 100,000 satoshis. The passage therefore reads as a payment — but no key matching that hash exists, so the coins cannot move, and never have.

Drop the `.ots` at the foot of the Citations register and the book resolves it, checks it against this block's own header, and keeps it there.

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
