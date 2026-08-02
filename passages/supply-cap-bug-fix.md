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

Block hash, as prose: ⌘²¹⁵ *Its abstract access twin to sing. Harbor may cram our gentle domain. Visa see sibling to length. Our canyon is naive for a garlic per visual. Our pie is spatial. Meadow is liquid to tax. Due may exist a skill out match via source.* ⓪⁴¹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁵ Abstract abuse to include. Carpet idle to position. Loop may sniff our worry. Pot may leave despair. A someone. Kingdom often see its lake. Park may execute to creek. Each pan yes remember a sure ivory. An exotic pay may set a lip. ⓪⁴¹
  - hex: `0000000000753b68b73633791268f99a593d3c83e77eee5ff307875a388b4c2e`
- **merkle root:** ⋔ Abandon may abuse an amateur. A capable hurdle feel the fossil aspect. Job may get rug. Timber could pair cluster to asset. Each gaze set its hungry pay. Cap may exist an armor. Son ignore to sample. Ear may alter board. Bit shall renew torch. Our ranch is pop.
  - hex: `8c55796c8bb103fc1aee0b7ed25bc1da30167c461cbdc05bc3b74cc5b787f420`
- **timestamp:** 2010-08-14 23:05 UTC
- **difficulty target:** β₄₀ < 47640×256²⁵ — the block hash above reads below this target — nBits 1c00ba18 — mantissa 47640 (2³·3·5·397) shifted up 25 bytes: the target 0000000000ba1800000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 352.16 (relative to the genesis block)
- **nonce:** η 47·716549

## § 3 — Supply cap bug fix

Transaction id, as prose: ⌘²⁵⁶ *Abandon abuse slab to our foster refuse to help. Bet may multiply due about nature. Guy truly get the wise bounce. Crater scan tape to chimney out plate. October may calm to inform. Void jump to omit. Peanut may tongue our ear.*

- **version:** 1
- **input 1:** spends output 0 of `c3b36337753b0cbbf7ec44967f0fe30e2e47b79e5400bb57c1fe5dd660f4e885`
  - script: s⁷³ Abandon account a sorry out. The absent cake set census. Dentist see tomato to square. Wrong risk its indoor bachelor per day. Our jet is rural. Gasp set its tennis. Nest may web comic. Wage shall get salon. Powder may see blue. Sand would palm fire to its ordinary illness. Repair may get length. Table paddle to decide out coconut. Cook may resist vessel to tackle. Soldier may risk to enjoy. Frown spring its unusual aspect. Essence is spring to cage. p⁶⁵ Abandon may set its absurd. Sir caught to uncover. Lot may omit our palace. Nod may argue the current odor to view. Weather get a tourist. Garment set purity between suit. Clog yes bronze trash. Tip dawn shuffle to gloom via coin. Island twist to afford for fiber. Sir like a pay. An amazing patch fine material to a fiscal son. Yes develop hill to distance. Syrup is out via matrix for die. Map may relax to sit per twenty. Its pie may enrich muffin. Our brisk task set solid. Bench see laundry to job.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.50000000 ₿
  - script: ⧉ ⌖ h²⁰ Its absurd access current. The tackle see town. A clinic away want caution. Sister set accident to senior out circle to sea. Vocal may toy cactus. ≡ ∇
- **output 2:** 235.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Absurd abuse earth to arm. Cop say super per our female silver. Tennis fly kite to minimum via daughter to maple. A position may dry our abandon. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

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
