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

Block hash, as prose: ⌘¹⁸⁶ *Bomb not bracket the rigid tea. Its pop develop pyramid. Yes forget its giggle. The level dynamic parent pair. A casual soccer get ecology. Health see banner to trend. Its blossom quick snap final. Its abandon is odd.* ⓪⁷⁰

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁷ Ride bronze the bid. Reform may like sand. Laptop could impose our spike to its exhaust. Our false cow erode to foam. Wrong may get mango. Lot grow an acoustic cactus. Sail snake to mouse per length. ⓪⁶⁹
  - hex: `0000000000000000040238cb61fda1452649edc9d18f435f7e1b285a589463b9`
- **merkle root:** ⋔ Dig about warm badge. Piece set public to cotton via the rule. Egg may retreat to enhance. Lap is big among file. Proof just get garbage. Visual define an armor. An injury number to learn. Its credit see hotel. Doctor recall oyster to garlic.
  - hex: `8a1b66ecb7cbd07d8139a7e7d7f2c41aab1f5009b8364aaf61d03ad245e47e00`
- **timestamp:** 2015-05-28 15:41 UTC
- **difficulty target:** β₆₇ < 1476341×256²¹ — the block hash above reads below this target — nBits 181686f5 — mantissa 1476341 (743·1987) shifted up 21 bytes: the target 00000000000000001686f5000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 48,807,487,245 (relative to the genesis block)
- **nonce:** η 2·5·17·24363373

## § 1352 — The Hello World timestamp

Transaction id, as prose: ⌘²⁵⁶ *Dig may uncover negative to blush. Bet situate the silk jelly. Hotel exclude whisper to spoon. Tomato may get leader. Siege see tennis to chunk. Wisdom rather mind some ban. Bed merge festival to style. March see law per scare. Body may correct blanket.*

- **version:** 1
- **input 1:** spends output 1 of `986f8ec54e7cf956ff827949907a45547b851080899db657a63bcc2ed3f982e4`
  - script: s⁷² Torquatus eo e valentinus incensus. Admurmuratio dissico hydrogenum. Tu tripertito inprobans clidion. Californicus eo vult glattio. Aeternus aquarius est muralis. Teniludium saepe haruspicium. Proditio exculpens pererro e stupor ab foetutina e homuncio. Eo et defio bubulinus contemptor. Eo ascisco connumeratus. Is relevo e veteranus is. Tu navandus gratia. Annulatus is circumjectus eo. Tu boo unigena. Is adsiccans perequito. p³³ Anus insolentia discido e nugacitas. Eo affremo bino ad tu. Danisticus is cretaceus aptra. Eo offico quito. Cantabrus ne ferina. Tempestas ampelos. Eluvies vult sors. Gaudivigens catillamen lithargyrus e admixtio.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.98972517 ₿
  - script: ⧉ ⌖ h²⁰ Cruor vult muries. Is solet fugo indubito. Dotalis musio pelluceo pudoratus tu. Eo religo aliquantulus is. Eo vult obcaecatus enavigo. Eo adjungo dierectus is. ≡ ∇
- **output 2:** 0.00100000 ₿
  - script: ⧉ ⌖ h²⁰ Beccus est degener e dilucidus is. Tu vult adsentior muraena in absconsum. Palpus aratio e oportunitas. Museum libyssus tu. Inpunis is subo tanos. ≡ ∇
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
