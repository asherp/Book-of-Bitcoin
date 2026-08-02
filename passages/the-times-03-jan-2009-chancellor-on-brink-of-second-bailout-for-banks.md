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

Block hash, as prose: ⌘²¹³ *Husband behave actor to hospital. Brass ride alley via our stairs for effort. Our indoor worry get palace. Cradle double to nurse per clip. Our ancient today too culture craft.* ⓪⁴³

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪²⁵⁶ (no earlier block — this is the genesis block; all 256 bits zero)
- **merkle root:** ⋔ Its desert buyer leg visual. Raise may float twelve. Tortoise ago get dinosaur. A desert phrase seed wish. Lot may assume athlete to bacon. Eye mushroom pony for image per pigeon. Monkey is junior to divorce.
  - hex: `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b`
- **timestamp:** 2009-01-03 18:15 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 19·97·1130351

## § 1 — The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

Transaction id, as prose: ⌘²⁵⁶ *Its desert buyer leg visual. Raise may float twelve. Tortoise ago get dinosaur. A desert phrase seed wish. Lot may assume athlete to bacon. Eye mushroom pony for image per pigeon. Monkey is junior to divorce.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₂ 65535×256²⁶ η2² ⁶⁹ “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Cop afford detail to satoshi. Giggle torch our piano. Organ ago get coconut. A vast crime equip hotel. Alarm may see hero to pass. A bright cop decorate essay via oxygen. Shift get attitude to autumn. Manual set its strategy for enemy. Ban remove average to oil. Our vicious cow give snap per party via topic. Voyage is dwarf to royal for seminar. The tax is cheap. The ten door are minute to rough. Its narrow theory repeat weasel. Some cop install to theme. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A coinbase input spends nothing, so its script is a slot a miner may write anything into. The first one holds the front-page headline of The Times of London for 3 January 2009.

It does two things at once. It is a date stamp — a block cannot have been made before the newspaper it quotes, which is how anyone reading later can see the chain was not backdated. And it is an argument: the rescue of the banks, named in the opening sentence of a system built so that nobody has to be rescued. It is the closest thing to an editorial line anywhere in this book, and the chain itself wrote it.

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
