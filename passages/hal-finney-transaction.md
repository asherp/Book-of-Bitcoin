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

Block hash, as prose: ⌘²²⁴ *Access is acid to insect. Release bottom woman for head out spider for analyst. A local tobacco guide mystery. Spring buzz to brave. Lesson is dutch via an essence for catch. Purchase may escape length.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²² Access access pupil to genre via belt to maple. Shell drop to expose via disorder. Dwarf may set stable. Kick loop bicycle to an electric hood. Pop loud set genius. Wing may get an oxygen to cargo via its abandon. ⓪³⁴
  - hex: `000000002a22cfee1f2c846adbd12b3e183d4f97683f85dad08a79780a84bd55`
- **merkle root:** ⋔ Abandon get an acid weasel to basket. Our noodle feature to ask. Top see its small web. Bunker are novel to flame. Truth talk term per shaft. Gorilla set other shift. Ribbon yet get biology. Climb may see razor to moral.
  - hex: `7dac2c5666815c17a3b36427de37bb9d2e2c5ccec3f8633eb91a4205cb4c10ff`
- **timestamp:** 2009-01-12 03:30 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2³·3·241·326663

## § 2 — Hal Finney transaction

Transaction id, as prose: ⌘²⁵⁶ *Abandon get the absurd reject. Each marble is amazing. Narrow dream its soft daring. Hundred quick lift some mind. Feel leg relief to wheat per logic. Deposit trap to isolate for war. An annual glance may detect our bad burden.*

- **version:** 1
- **input 1:** spends output 0 of `0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9`
  - script: s⁷¹ Abandon access its impulse. Joke may sponsor some clog to our fish. Its jet early club peace. Other hammer may see sausage. View would police system. The frog stomach change. Its big ranch is clever. Guy melt to quit per a tobacco. Our popular blossom get poverty to robot for budget. Parrot upset canoe behind a proud trigger. Picnic deposit crack to glance per our real ban. An intact economy is aware. Its ancient drive get each manual. The out guy educate injury to the cage.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 10.00000000 ₿
  - script: p⁶⁵ Abandon see an absurd century. The pop make our shine. A they. Our title stamp to give per motion to wealth. Our winter is strong. Olive knee to filter for gold to chalk. Option crew humor via strike. Our object see the salon. Cop explain belt to diary. A proud transfer may leg to prevent. Panda is typical before genre. Idea hover to admit. Our shallow blush taste river. Wall impact female to agent via sand. Recall get another set. ∇
- **output 2:** 40.00000000 ₿
  - script: p⁶⁵ Abandon set an absurd calm. Our ivory chief yes build horse. Chimney coin end to call. A toast is polar for sea. Cop forget cigar to alarm. Nut may medal arm. Its noble kitchen out picture the olympic battle. Our frequent novel may deny room. Reunion grid a total mass. Gossip too scrap machine. A blood predict shield to the negative dentist. Scan may wolf group. Sir arrive some disorder. Clip space its federal lot. ∇
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
