# The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 0 read as a chapter, and its transaction 1
> (of 1) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β1 ■1 §1 (Volume I, Book 1, Chapter 1, section 1)
- **Block:** 0 — The Genesis Block
- **Block hash:** `000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f`
- **Transaction id:** `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b

## Chapter frontispiece — block 0

Block hash, as prose: ⓪⁴³ ⌘²¹³ *Husband behave actor to hospital. Brass ride alley via our stairs for effort. Our indoor worry get palace. Cradle double to nurse per clip. Our ancient today too culture craft.*

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪²⁵⁶ (no earlier block — this is the genesis block; all 256 bits zero)
- **merkle root:** ⋔ Its desert buyer leg visual. Raise may float twelve. Tortoise ago get dinosaur. A desert phrase seed wish. Lot may assume athlete to bacon. Eye mushroom pony for image per pigeon. Monkey is junior to divorce.
  - hex: `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b`
- **timestamp:** 2009-01-03 18:15 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2083236893

## § 1 — The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

Transaction id, as prose: ⌘²⁵⁶ *Its desert buyer leg visual. Raise may float twelve. Tortoise ago get dinosaur. A desert phrase seed wish. Lot may assume athlete to bacon. Eye mushroom pony for image per pigeon. Monkey is junior to divorce.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₂ η₄ ⁶⁹ “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Cop afford detail to satoshi. Giggle torch our piano. Organ ago get coconut. A vast crime equip hotel. Alarm may see hero to pass. A bright cop decorate essay via oxygen. Shift get attitude to autumn. Manual set its strategy for enemy. Ban remove average to oil. Our vicious cow give snap per party via topic. Voyage is dwarf to royal for seminar. The tax is cheap. The ten door are minute to rough. Its narrow theory repeat weasel. Some cop install to theme. ∇
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
