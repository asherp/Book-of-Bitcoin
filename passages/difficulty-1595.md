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

Block hash, as prose: ⌘¹⁸⁰ *Its fluid decade due canoe airport. Addict spirit our false rug. The mother may donate the brother. Our sir arrive to gather per young. Exhibit also set animal.* ⓪⁷⁶

- **version:** vaccio link — block version 0x20800000 — BIP9 version-bits form; version-rolling bits 0x0400 (BIP320 scratch entropy) as accio link; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Its tax around portion relief. Still announce the soft nod. A cop is gentle. Hill release daughter to season. Latin may deliver project per capital. Boat yes arch its dig. ⓪⁷⁶
  - hex: `0000000000000000000bc6800858a1b3be08fb26b55d4b989c95e06ad50a350c`
- **merkle root:** ⋔ Input due address its six april. The viable lounge get math. The sky resemble science. Genre depart favorite to our jewel. Travel may inherit its luxury section. Neither evidence may flee gadget. Each fade could ribbon abandon.
  - hex: `40aea3ea652c3785b2c22af41ccf7f072aeb20ecc0ba45a208357f05276fa074`
- **timestamp:** 2020-03-26 02:51 UTC
- **difficulty target:** β₇₅ < 2¹⁶⁰·3⁴·16369 — the block hash above reads below this target — nBits 17143b41 — mantissa 1325889 shifted up 20 bytes: the target 000000000000000000143b410000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 13,912,524,048,946 (relative to the genesis block)
- **nonce:** η 3⁴·13·83·181·193

## § 1 — Difficulty −15.95%

Transaction id, as prose: ⌘²⁵⁶ *A summer may sketch to author. Our awake ear isolate hole. Exile betray average to the end. Sir isolate short per clip. Thought scan to empower. Army mandate laugh via melody for night. A rent how vanish the cactus.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■622944Its tax may borrow fyi. “/ViaBTC/Mined by sanpaolo/,” Its wide tax is vibrant. Pop forget to wrestle. Its wise melody is physical. Our outdoor term set adult. Moment may see siren to doctor. Peace aim floor for table per dove. Shell may fish to involve. A power kiwi once set ability. The immune series may abandon abandon to abandon. An abandon may abandon row per tax via ban. Cop away party a guy. The olympic canal are angry. Son rotate pottery to mushroom out build. Tornado frown abandon to abandon.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.72123454 ₿
  - script: ⧉ ⌖ h²⁰ Its fat lemon play to empty. Bench is eight for chimney. Hedgehog topple kangaroo to pottery. Exercise guide spoon via trend. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:'”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Its frequent blanket panel to despair. Length may shell the cheese. A myself. Fox ensure giant to barrel. Our awful brass may roast cream. Guy rebuild suit to oil. Concert click disorder for its benefit. Parade see the pay.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

26 March 2020: the covid crash. Black Thursday, two weeks earlier, halved the price in a day and the marginal miners followed it down. Read the series and the target is a slow, honest instrument — it never predicts anything, and it never misses anything either.

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
