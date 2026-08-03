# First BRC-20 inscription

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 779,832 read as a chapter, and its transaction 408
> (of 1,860) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β75 ■649 §408 (Volume IV, Book 75, Chapter 649, section 408)
- **Block:** 779,832
- **Block hash:** `000000000000000000015712838394aeb93f5d45d0e5bec197382c08b375016e`
- **Transaction id:** `b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735

## Chapter frontispiece — block 779,832

Block hash, as prose: ⌘¹⁷⁷ *Guy absorb accident to hybrid via frost to gravity. Lizard are brisk for gallery per daughter. A total lion firm our due. The cut is legal. Dig online engage asthma. Girl finish its amount.* ⓪⁷⁹

- **version:** vtotalus pulp — block version 0x2b5d8000 — BIP9 version-bits form; version-rolling bits 0x5aec (BIP320 scratch entropy) as totalus pulp; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ Pie may absorb absurd. Pay shall enhance mass. Dinosaur get a system. Monkey may set dinner to apology for tunnel. Diesel may mix gossip. Sunset see scene to tuition for august. Set are useless to blossom. ⓪⁷⁸
  - hex: `00000000000000000003f079883a81997d3238b287ea53904f1ecd3d1f225209`
- **merkle root:** ⋔ Abandon see an absurd athlete to our olympic cake. Disease may say its funny toss to zone. Drill may guess goddess. Its reunion interest right. Trade consider an engine. Topic set hotel to hammer. Ear away husband a odd cap. Guy may improve some tie.
  - hex: `90fbdb20881637944f492f35776eeb841bb29d5dc8ff2d8fd77ff1231069c601`
- **timestamp:** 2023-03-08 04:16 UTC
- **difficulty target:** β₇₇ < 428451×256²⁰ — the block hash above reads below this target — nBits 170689a3 — mantissa 428451 (3·17·31·271) shifted up 20 bytes: the target 0000000000000000000689a30000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 43,053,844,193,928 (relative to the genesis block)
- **nonce:** η 2·5²·73·380797

## § 408 — First BRC-20 inscription

Transaction id, as prose: ⌘²⁵⁶ *Abandon abuse its primary. Sugar far set our food. Sir engage to confirm. Glance why shed rough. War may inflict firm. Cry jewel to erase. Its hold may occur the pass via yes. Set may ignore brand to its erosion. An unique ribbon afford item.*

- **version:** 1
- **input 1:** spends output 0 of `a321c61c83563a377f82ef59301f2527079f6bda7c2d04f9f5954c873f42e8ac`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.00010000 ₿
  - script: ① p³² Abandon may abuse robot to tray. Era set turkey for the priority. Our quiz is possible. Clump get owner to clip. Miracle is hidden for quality. Blast bench whisper to tortoise. Shop may get autumn via bed per a ear for lie. Tea may assume nation to clown per fashion.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Absurd may see accident. Gas depart joy to spy. A youth is innocent. Puppy yes eye oil. Spring expand spider to barrel. Mistake fashion virus for employ. Some side see success. Map may make want to fiber. A glad blossom install urge. The extra fade our ranch. Its ear may evolve to exact. A due erode to suffer via sin. Yes evoke our nurse to gallery. Claim resource slam out rule. Engine may explain stamp to ginger. Some now may rotate abandon via a nod. · t p³² Abandon account to vanish. Bar far improve peasant. Its pop predict piece to wet. Universe permit to sign. Ribbon may see moment per gold for harvest. Payment soon get pot. A crucial sin are open to its tragic program to sin. Sir have battle for trip. ∇ ⓪ ⟨ ³ “ord” 1 ²⁴ “text/plain;charset=utf-8” ⓪ ↧⁹⁴ “{   "p": "brc-20",  "op": "deploy",  "tick": "ordi",  "max": "21000000",  "lim": "1000"}” ⟩ · c v96₁ p Abandon account to vanish. Bar far improve peasant. Its pop predict piece to wet. Universe permit to sign. Ribbon may see moment per gold for harvest. Payment soon get pot. A crucial sin are open to its tragic program to sin. Sir have battle for trip.

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
