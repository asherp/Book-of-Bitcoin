# The Genesis Block

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

Block hash, as prose: ⌘²¹³ *Husband behave actor to hospital. Brass may ride alley per stairs. Effort set the indoor worry. Palace cradle a double nurse to clip. The ancient today culture craft out canoe via rocket. Cop leave to theme per jet.* ⓪⁴³

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪²⁵⁶ (no earlier block — this is the genesis block; all 256 bits zero)
- **merkle root:** ⋔ Desert may get buyer. Leg not see visual. Raise float the twelve tortoise. Dinosaur desert phrase to seed out a wish. Pot may assume athlete. Bacon eye mushroom to pony. Image may pigeon monkey. Junior doctor an amused flame to bone.
  - hex: `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b`
- **timestamp:** 2009-01-03 18:15 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 19·97·1130351

## § 1 — The Genesis Block

Transaction id, as prose: ⌘²⁵⁶ *Desert may get buyer. Leg not see visual. Raise float the twelve tortoise. Dinosaur desert phrase to seed out a wish. Pot may assume athlete. Bacon eye mushroom to pony. Image may pigeon monkey. Junior doctor an amused flame to bone.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₂ 65535×256²⁶ η2² ⁶⁹ “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Tu immo impartiens is. Tu deprendo monasticus eo e tu ad eo. Is relative naticidium. Eo vult ingeniculo tu e flabellatus aeroplanum se tu. Eo patior praenosco e alsius eo. Bavaricus stacta abstergeo subintroeo. Amplexus vult syricus is. Eo perdoceo telonium e postulatus. Indamnatus eo vult parvipendo balbo. Cachla unanimus decempeda e axula. Is obtorpeo trivius vojvoda. Dominator milies hydrodendron. Eo sacrate scauria. Stloppus vult. Igitur. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The one chapter with no predecessor. Every other block cites the hash of the one before it; this header carries 256 zero bits where that citation goes — the book writes it as it is, an empty slot rather than a beginning.

Its target is the one every later difficulty is measured against, and factored on the frontispiece it reads 2²⁰⁸·3·5·17·257. The odd part, 65535, was picked as a round ceiling in hex — 2¹⁶−1 — and falls out as 3 · 5 · 17 · 257: the four smallest Fermat primes, each exactly once. The very next retarget replaces all four with a single five-digit prime, and no target since has had any reason to factor so neatly — by Gauss's theorem the accident even makes a regular 65535-sided polygon constructible with compass and straightedge, which is a fact about the number Bitcoin opened with rather than about Bitcoin.

It is also the only chapter nobody had to fetch: the genesis block is hardcoded into every node that has ever validated anything, so no reader takes it on anyone's authority. Its fifty coins have never moved — by a quirk of the original code the reward was never entered into the set of spendable outputs, so they cannot be spent.

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
