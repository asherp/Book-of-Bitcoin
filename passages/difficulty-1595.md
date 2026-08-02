# Difficulty −15.95%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 622,944 read as a chapter, and its transaction 1
> (of 2,012) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β101 ■1345 §1 (Volume III, Book 101, Chapter 1345, section 1)
- **Block:** 622,944 — Difficulty −15.95%
- **Block hash:** `000000000000000000093ae093fe07468673202890e89514a435c0028610a759`
- **Transaction id:** `51bc6c594945f6e1100c480af0c1b56263da31c90fabe853d96817883d4439d9`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=51bc6c594945f6e1100c480af0c1b56263da31c90fabe853d96817883d4439d9

## Chapter frontispiece — block 622,944

Block hash, as prose: ⌘¹⁸⁰ *Cow absorb access to snake. Service get our army. Clown may bracket motion. Its naive trigger ought get life. Amount may train good. Its advance where set lab. Guy deliver elite to lap for cop.* ⓪⁷⁶

- **version:** vaccio link — block version 0x20800000 — BIP9 version-bits form; version-rolling bits 0x0400 (BIP320 scratch entropy) as accio link; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Row may absorb absurd. Giant dress a print to puppy. Lip may enlist to include. The sky are annual out cap. A frozen powder salute badge. Twenty may spawn to gasp. Jet may avoid ship. Fix yes get cut. ⓪⁷⁶
  - hex: `0000000000000000000bc6800858a1b3be08fb26b55d4b989c95e06ad50a350c`
- **merkle root:** ⋔ Abandon set some accident. Its pink bridge evoke fitness. A tie once card yes. Our bet may emerge river. Cap alter to set. Its lie is amused. Stone parrot to say. A sir detect ozone. Client better pattern hour. Shock see vocal to map. Die due modify each siege.
  - hex: `40aea3ea652c3785b2c22af41ccf7f072aeb20ecc0ba45a208357f05276fa074`
- **timestamp:** 2020-03-26 02:51 UTC
- **difficulty target:** β₇₅ < 1325889×256²⁰ — the block hash above reads below this target — nBits 17143b41 — mantissa 1325889 (3⁴·16369) shifted up 20 bytes: the target 000000000000000000143b410000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 13,912,524,048,946 (relative to the genesis block)
- **nonce:** η 3⁴·13·83·181·193

## § 1 — Difficulty −15.95%

Transaction id, as prose: ⌘²⁵⁶ *Abandon achieve six to extra. Kitchen lift refuse out grab. Laptop why prison our layer. Ear erase regular to curtain. Foot see the amazing access. Our elite gauge may get our debris to uncle per fee. Due may protect our real mechanic.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■622944η2·13 “/ViaBTC/Mined by sanpaolo/” Abstract abuse guitar to question out suspect. Subject obey a brisk pink. Woman exclude to submit. Our virtual salad foam bench. The ice fan galaxy. Son deliver to involve. Guy follow the two minute. Fatigue may get system to parade. Yes argue hotel per the abandon. ⓪⁷ Its access get absurd. A lonely jet is afraid. Split amount element to ticket. The elegant mix are ago. Hit get sky upon clip. The ugly abandon may abandon bed.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.72123454 ₿
  - script: ⧉ ⌖ h²⁰ Absurd may access opinion to wrong. Crane empower portion for its damp. Document set the female. City may smile our elder kidney. Sir yes devote its neutral divorce. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:'”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Abandon access topic to a ritual wire. An they. Our lap may absorb our clinic. Each lot ago define the map. A myself. Time foil artist to noodle. A lunar super get subway per nut for onion. Silk may get soda inside festival to wild. Its cow predict a hit.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

26 March 2020: the covid crash. Black Thursday, two weeks earlier, halved the price in a day, and the marginal miners shut down; this window recorded the exit.

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
