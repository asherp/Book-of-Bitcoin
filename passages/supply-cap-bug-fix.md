# Supply cap bug fix

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 74,421 read as a chapter, and its transaction 3
> (of 3) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β37 ■1846 §3 (Volume I, Book 37, Chapter 1846, section 3)
- **Block:** 74,421 — Supply cap bug fix
- **Block hash:** `00000000006dc429fb49824d24f4e9fd55498700b0c7a53f50c2228334256f5d`
- **Transaction id:** `237fe8348fc77ace11049931058abb034c99698c7fe99b1cc022b1365a705d39`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=237fe8348fc77ace11049931058abb034c99698c7fe99b1cc022b1365a705d39

## Chapter frontispiece — block 74,421

Block hash, as prose: ⓪⁴¹ ⌘²¹⁵ *Frost see junior to essay. Alien club our chimney. Son write rib to quote. Our aerobic spoil program to teach. Each wheel get muffin. Raccoon set enemy to sun. The nod are illegal via a sure cop.*

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪⁴¹ ⌘²¹⁵ Its comic gold sock to relax. Idea set whale out leisure. Sound not travel its boring aunt. A rebel question reduce enemy. Chapter are cute to cut. A robust guy attract tube.
  - hex: `0000000000753b68b73633791268f99a593d3c83e77eee5ff307875a388b4c2e`
- **merkle root:** ⋔ Can picnic unknown to melody. A slice is cut via ticket out humor. Son bless a brisk crop. Airport may get its giant project. Pupil set enemy to scrap. A yes unlock subject. An abstract glide replace device. File may see length.
  - hex: `8c55796c8bb103fc1aee0b7ed25bc1da30167c461cbdc05bc3b74cc5b787f420`
- **timestamp:** 2010-08-14 23:05 UTC
- **difficulty target:** β₄₀ < 47640×256²⁵ — the block hash above reads below this target — nBits 1c00ba18 — mantissa 47640 shifted up 25 bytes: the target 0000000000ba1800000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 352.16 (relative to the genesis block)
- **nonce:** η 33677803

## § 3 — Supply cap bug fix

Transaction id, as prose: ⌘²⁵⁶ *Deer twist bird to hope. Banana gas to include. A cop is large. Legend see globe to green. Object desert shallow below creek. Advice see mobile to pact. Monitor are viable for injury via wish for gas.*

- **version:** 1
- **input 1:** spends output 0 of `c3b36337753b0cbbf7ec44967f0fe30e2e47b79e5400bb57c1fe5dd660f4e885`
  - script: s⁷³ Its tax okay gas piano. The dwarf elder orient bounce. Lemon resemble to hover. The sir acquire check. Guy bless our metal desk to crater. Pair may shift gain via daughter. Our news may cart fitness to crop. Enough crime evolve cycle per mosquito for breeze. Video shove sheriff to tourist via our report. A lazy brick border to tax. The tap is nuclear. A harsh produce omit ban. Rub may differ double. Son have foil to catch out cactus. p⁶⁵ An afraid laugh may rebuild initial. Cannon man basket to dinosaur. Yellow far see our royal fyi. A typical volume dress robot. Air may set logic. A rude labor manage our wedding hockey to grant. Our human latin letter height via rabbit for path via staff. Skull may speed turtle. Maple would set miracle to pony. Romance may raise bit. A cute buddy get city to banana. A castle forward border pencil. Autumn get pyramid to abandon.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.50000000 ₿
  - script: ⧉ ⌖ h²⁰ Egg may brick broom to earth. Capital learn tonight via rice. Lens journey to pioneer. Deal wrong our fresh goat. ≡ ∇
- **output 2:** 235.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Chunk gesture to retire for will. Pride weekend swim to clinic. The urge set coyote. An alone special never see half. Parade lie to sit per the cap. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

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
