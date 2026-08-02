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

Block hash, as prose: ⌘¹⁸⁶ *Abuse may set absurd. A simple stove get song. Tool joke a surprise. An auto aim chase account. Our wealth build hour to corn. Extra may set the napkin per divorce via scale.* ⓪⁷⁰

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁷ Abuse accuse slam to topic. Radar set penalty for asset per west. Trick set more mixture to kitten. A myself. Its gold special may void defense. Our day awake abandon. ⓪⁶⁹
  - hex: `0000000000000000040238cb61fda1452649edc9d18f435f7e1b285a589463b9`
- **merkle root:** ⋔ Abandon see absurd to advance. Ribbon is merry per the casual habit. Our due mammal is true. A cute scare may get favorite. Yes how dismiss hit. A due are random. Son give the slender woman to poet. Slot garage to pave via rocket. A wage may observe its odd image.
  - hex: `8a1b66ecb7cbd07d8139a7e7d7f2c41aab1f5009b8364aaf61d03ad245e47e00`
- **timestamp:** 2015-05-28 15:41 UTC
- **difficulty target:** β₆₇ < 1476341×256²¹ — the block hash above reads below this target — nBits 181686f5 — mantissa 1476341 (743·1987) shifted up 21 bytes: the target 00000000000000001686f5000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 48,807,487,245 (relative to the genesis block)
- **nonce:** η 2·5·17·24363373

## § 1352 — The Hello World timestamp

Transaction id, as prose: ⌘²⁵⁶ *Abandon set the acid grain. Pair shadow evidence to dutch. Salmon may image jewel. A state see neutral. Call visit dolphin to weird. Echo is tired via myth. Guide forget to prefer for its salon. Dinosaur are used to each pay out the hit to pan.*

- **version:** 1
- **input 1:** spends output 1 of `986f8ec54e7cf956ff827949907a45547b851080899db657a63bcc2ed3f982e4`
  - script: s⁷² Abandon accuse myth to twin for photo. Brother ago sign baby. The lot may grow piece to public. Guy become its tiny wish via video. Virus may see lyrics. Map alter to ramp via kind. An avocado is due to each figure per a lip. Pie easily resource our hollow. Its set absent nation. Crawl too get debris. Crouch may see fluid. The surprise option our alert duty to era per whale. Yes solve to sense. Prison get its ginger repair per cliff. A polar check see ocean. Fuel photo a lens. p³³ Nod may get the die about an absurd. Son away glory our olive. The amazing night is solar to gas via rub to tea. Bed extend to leave via fan for neglect. A myself. Coil may set life to scene. Monitor may see myth per tortoise. Hub set tuna to eyebrow. Project thrive to ship.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.98972517 ₿
  - script: ⧉ ⌖ h²⁰ Absurd why get absurd. Garbage bicycle to pool. Wing spring to spell. Map may arrange eyebrow out width. Step set our dutch. Its awkward son verify syrup to theme. ≡ ∇
- **output 2:** 0.00100000 ₿
  - script: ⧉ ⌖ h²⁰ Our absurd absurd used cannon. Son devote an armed critic. A favorite kick horse to found for seminar to supply. Museum cloud a polar theme. ≡ ∇
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
