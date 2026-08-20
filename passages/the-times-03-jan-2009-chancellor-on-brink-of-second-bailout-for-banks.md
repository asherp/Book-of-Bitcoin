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

Block hash, as prose: ⌘²¹³ *Husband behave actor to hospital. Brass ride alley out stairs per effort. The indoor worry get palace. Cradle double nurse to clip. A bet is ancient. Today ago culture craft. Dad may decline royal to cactus. Distance hurry to absorb. A spider may set pan.* ⓪⁴³

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪²⁵⁶ (no earlier block — this is the genesis block; all 256 bits zero)
- **merkle root:** ⋔ A desert buyer leg visual to raise via float. The twelve see tortoise. Dinosaur desert phrase to seed. Wish ago assume athlete. Bacon eye mushroom to pony. Image may pigeon monkey via junior for document. A left gift to devote. Its due apart wear its cereal craft.
  - hex: `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b`
- **timestamp:** 2009-01-03 18:15 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 19·97·1130351

## § 1 — The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

Transaction id, as prose: ⌘²⁵⁶ *A desert buyer leg visual to raise via float. The twelve see tortoise. Dinosaur desert phrase to seed. Wish ago assume athlete. Bacon eye mushroom to pony. Image may pigeon monkey via junior for document. A left gift to devote. Its due apart wear its cereal craft.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₂ 65535×256²⁶ η2² ⁶⁹ “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Eo immo impartiens tu. Eo deprendo monasticus is e eo. Tu relative naticidium. Is vult ingeniculo e flabellatus aeroplanum. Tu patior praenosco en alsius tu. Bavaricus stacta abstergeo subintroeo. Amplexus e syricus tu se eo. Is perdoceo telonium e postulatus. Indamnatus eo parvipendo balbo. Cachla unanimus decempeda. Axula obtorpeo e trivius vojvoda. Dominator milies hydrodendron. Is sacrate iusticia. Eo vult confligendus e dierectus tu. Is iocunde eo. Tu speciatim pusillanimis is. Vernus tu est verbalis. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A coinbase input spends nothing, so its script is a slot a miner may write anything into. The first one holds the front-page headline of The Times of London for 3 January 2009.

It does two things. It is a date stamp: a block cannot have been made before the newspaper it quotes, so a later reader can check that the chain was not backdated. And it is a statement of position: a bank rescue, quoted at the head of a system designed to operate without one.

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
