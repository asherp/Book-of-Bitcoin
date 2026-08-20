# The half-claimed subsidy

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 526,591 read as a chapter, and its transaction 1
> (of 1) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β53 ■1760 §1 (Volume III, Book 53, Chapter 1760, section 1)
- **Block:** 526,591
- **Block hash:** `0000000000000000002ba5a1fb96f93e6c215d62db4280f1cbd30e82c7c71fba`
- **Transaction id:** `bd23db7fef82fd99b27f3ddd895e72a2a5937af4c1fa3b3547972071a941d9d4`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=bd23db7fef82fd99b27f3ddd895e72a2a5937af4c1fa3b3547972071a941d9d4

## Chapter frontispiece — block 526,591

Block hash, as prose: ⌘¹⁸² *Ring may wreck vehicle. Advice unfold its tourist. Ship get analyst to a swarm. Base embark such usage out slice per update. Cruise may climb bracket to whip. Fee parade to suffer. Set may include way. Our saddle is due.* ⓪⁷⁴

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Icon chunk gown to cloth. Our soda pet to scatter. Mind may weekend a federal trial. Bomb ride debate to a problem via message to alpha. Border may badge to crumble per cactus. Lift may cash industry. Ban about see pot. ⓪⁷⁷
  - hex: `000000000000000000075fdcaa70969b8ca08f0af9671cf046e3ec9594154570`
- **merkle root:** ⋔ State skate heart to time. Our annual phone may stay leg. Sea ought phrase pilot. Our big lip may ensure cheese. Sir consider cherry to police. A leisure network are legal via alarm for wave. The unique moment parrot system to alien per nothing. A rare fiction is shy. Our fortune see cow.
  - hex: `bd23db7fef82fd99b27f3ddd895e72a2a5937af4c1fa3b3547972071a941d9d4`
- **timestamp:** 2018-06-08 14:52 UTC
- **difficulty target:** β₇₄ < 3733569×256²⁰ — the block hash above reads below this target — nBits 1738f841 — mantissa 3733569 (3²·7·59263) shifted up 20 bytes: the target 00000000000000000038f8410000000000000000000000000000000000000000, which a valid block hash must read below (74 leading zero bits) — difficulty 4,940,704,885,522 (relative to the genesis block)
- **nonce:** η 43·233·257·733

## § 1 — The half-claimed subsidy

Transaction id, as prose: ⌘²⁵⁶ *State skate heart to time. Our annual phone may stay leg. Sea ought phrase pilot. Our big lip may ensure cheese. Sir consider cherry to police. A leisure network are legal via alarm for wave. The unique moment parrot system to alien per nothing. A rare fiction is shy. Our fortune see cow.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■526591 2018-06-08 14:52η2·3·17 “/BTC.COM/” Manuballista verber e tortuca de traiectus. Annosus fictia diuturne conceptualis eo. Tu devenio macellum e abactus. Tepor excrementum at borchgravius ad plerunque. Trigonus eo est brevirictus. Polimenta melilotos e adorator. Raudus perspiro collaudo. Olenticetum ni abolefacio caballa. Tu inridens. ⓪⁷ η54010345754881 ⓪⁶
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 6.25000000 ₿
  - script: ⧉ ⌖ h²⁰ Marasmus exilio dossum e fraudator. Interula sublimitas. Fuscitas quaero percieo e eo. Subsecivus tu sit formonsus. Oricilla trochiscus. Dierectus eo intertexo navigo. Is dulco promutuum. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The same mistake as the chapter that claimed nothing, by half: this block's lone coinbase output claims 6.25 ₿ of the 12.5 ₿ it was owed. 8 June 2018. The unclaimed half was never created, and never can be — the coinbase figure is a ceiling, and the difference below it is not sent anywhere, held by anyone, or recoverable by any rule.

Together with block 501,726 six months before it, these are the two largest subsidy destructions of the 12.5 ₿ era; both are kept in the running tallies of destroyed coins (learnmeabitcoin.com's block-reward notes among them). The miner is unidentified here too, and the template-misconfiguration reading is the same inference. What the page itself proves is narrower and stranger: a block that paid its miner exactly what the next halving, two years out, would have paid — by accident.

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
