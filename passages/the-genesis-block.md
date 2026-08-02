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

Block hash, as prose: ⌘²¹³ *Our abstract accident lecture to perfect. Cop betray humor via super. Slam crumble pelican to cube. Ocean update a weird per monster. Its assault may rotate foam. An eager boss ago promote mosquito.* ⓪⁴³

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪²⁵⁶ (no earlier block — this is the genesis block; all 256 bits zero)
- **merkle root:** ⋔ Abandon abuse tackle to window. Wife may police matter. Size get flight to club. A veteran tank burst blood out tomato. Some humor is illegal. Medal maze to modify. Disorder may melt its cereal. A ear just sing cap.
  - hex: `4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b`
- **timestamp:** 2009-01-03 18:15 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 19·97·1130351

## § 1 — The Genesis Block

Transaction id, as prose: ⌘²⁵⁶ *Abandon abuse tackle to window. Wife may police matter. Size get flight to club. A veteran tank burst blood out tomato. Some humor is illegal. Medal maze to modify. Disorder may melt its cereal. A ear just sing cap.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₂ 65535×256²⁶ η2² ⁶⁹ “The Times 03/Jan/2009 Chancellor on brink of second bailout for banks”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Abandon may get an absurd case. The tired window see avocado. Click due calm tobacco. Gun may minor the ordinary gesture to our illegal aid. Its tea is common. Yes follow to agree. Its sir then sign its hat. Version come insect to laugh. Design rent exile per pyramid out leader. Our ban may solve the organ. A because. Height see agent to cigar. A raccoon may set pan via its certain total. A son bring daughter. Warrior argue height to tip for ocean. Actor remove to settle. A program see a war. ∇
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
