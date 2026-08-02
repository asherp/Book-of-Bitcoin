# Hal Finney transaction

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 170 read as a chapter, and its transaction 2
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β1 ■171 §2 (Volume I, Book 1, Chapter 171, section 2)
- **Block:** 170
- **Block hash:** `00000000d1145790a8694403d4063f323d499e655c83426834d4ce2f8dd4a2ee`
- **Transaction id:** `f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16

## Chapter frontispiece — block 170

Block hash, as prose: ⌘²²⁴ *Upgrade birth cash to garbage. Our sin is unhappy. Boss ago get patient. Pan expire a fragile coconut. An myself. Kidney may catalog to lock. Its exotic hammer have duty. Beyond may claim to avoid.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²² Fiber get umbrella to action. Our valley are obvious. Its half head pony hammer. Some risk soon see corn. A tired trophy may set horror. Son explain clown to youth. A record dust parade. ⓪³⁴
  - hex: `000000002a22cfee1f2c846adbd12b3e183d4f97683f85dad08a79780a84bd55`
- **merkle root:** ⋔ Yellow too list a crazy. Son may appear canvas. Frame wet a lecture. Sense indicate the arch. Frog may get sweet to orbit. Joy see uncle for recipe. Board is strong to actress. Grace bind the rapid parade.
  - hex: `7dac2c5666815c17a3b36427de37bb9d2e2c5ccec3f8633eb91a4205cb4c10ff`
- **timestamp:** 2009-01-12 03:30 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2³·3·241·326663

## § 2 — Hal Finney transaction

Transaction id, as prose: ⌘²⁵⁶ *Bird get its valley to path. Sponsor get analyst per oil. The eight mistake get our curious rabbit. The immense tunnel may get soup. Find game the vacant manual. Brother excite license to hobby. A pole how glow the length.*

- **version:** 1
- **input 1:** spends output 0 of `0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9`
  - script: s⁷¹ Its exact congress fog grace. Memory may post cereal. Crouch ago get squirrel. Artist obey salmon to visual. Our romance not see our slight. Son depart cave to curtain. A luxury mule remove symbol for crush via cart. Benefit blast its casual neglect. Law get our category to the little night. Tackle nest cherry to alert per slush to rent. An upgrade due match capital. Rub may donate mask. Sky extend hand to our model catch. Cactus may see a tea.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 10.00000000 ₿
  - script: p⁶⁵ Its tax again ignore cop. Our hit are obvious. A winter is ordinary. Our whisper not see our hobby. Sky improve gallery to display. Brain crew control out member per hold for dwarf. Its set is vibrant. Aid may please evil. A brain are basic to blind per meat. Our little tray get few table. Copper fetch fault to latin. Tip club asthma via horse. Cop may gather a red reward. Tea may adapt orange. Dance tell purchase to skin. A they. Wave may cushion its gentle length. ∇
- **output 2:** 40.00000000 ₿
  - script: p⁶⁵ Advice get mom to top. Senior soap to shallow. Aisle hard get lottery. Ladder belt to join. Our twin eagle may see thing. Spray rally door to razor. Quarter behind fashion draw. An entire tap real get our lap. Cap also resist warfare. Error may set lake. Its speed would milk wealth to our idle load. A vivid reward raven the trap. Object may display smoke. Thunder would margin grace. Foam why enhance a gas. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Nine days into the chain, the first transaction that is a payment rather than a reward: ten coins from Satoshi Nakamoto to Hal Finney, who was running the second node on the network and had written “Running bitcoin” two days earlier.

Read the outputs and the book's grammar explains itself. Forty coins come back as change, because a spend does not move an amount — it consumes a coin whole and writes new ones. Every section after this one is built the same way, and this is where a reader first sees it.

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
