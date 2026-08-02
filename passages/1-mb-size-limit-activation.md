# 1 MB size limit activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 79,400 read as a chapter, and its transaction 1
> (of 3) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β40 ■777 §1 (Volume I, Book 40, Chapter 777, section 1)
- **Block:** 79,400 — 1 MB size limit activation
- **Block hash:** `000000000021d821ec06be7173f413690bc5c4bc648dfa70b3b6763236f055b7`
- **Transaction id:** `518efe6a5ad3733f2d8665045a3d29c55e02b7d21d15a43438fcdeaba67abf72`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=518efe6a5ad3733f2d8665045a3d29c55e02b7d21d15a43438fcdeaba67abf72

## Chapter frontispiece — block 79,400

Block hash, as prose: ⌘²¹⁴ *Abstract may accuse rival to lab. Hockey may set the cherry. A son forget soccer. Butter may get miracle. Chalk couple some meat. Repair measure spike to hotel. The safe danger may anchor raccoon. A pop could avoid some sin.* ⓪⁴²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁴ Abstract too accuse option. A cut across narrow our due code. Weapon note beef to grain per citizen. A cow how follow a news. Tap erode math to an acoustic lip. Its warm robot may inform visual. Broccoli might gas cow. ⓪⁴²
  - hex: `0000000000368ed3732ebbb9870012c994ca6a298565a0a8a5f0d182490974b3`
- **merkle root:** ⋔ Abandon may access assist. The chicken refuse below level a cute arrow. Couch set area to squeeze. Kitten see solid out other bit. A cop again identify hint. Disorder is ten to foam. Hawk may swim some lawn via plunge.
  - hex: `3785dfb79d06ad7befc76b842b013aebac3d4e6be13065a84d014d31da9eb841`
- **timestamp:** 2010-09-12 22:37 UTC
- **difficulty target:** β₄₁ < 6024678×256²⁴ — the block hash above reads below this target — nBits 1b5bede6 — mantissa 6024678 (2·3·11·91283) shifted up 24 bytes: the target 00000000005bede6000000000000000000000000000000000000000000000000, which a valid block hash must read below (41 leading zero bits) — difficulty 712.88 (relative to the genesis block)
- **nonce:** η 523·1433·4817

## § 1 — 1 MB size limit activation

Transaction id, as prose: ⌘²⁵⁶ *Abandon get our accident. The nominee team essence. Sadness is red to lawn. This nest out bench update. Punch again get its unable nest. The voice dog grain to cousin. The bed may exist tray per cup out cube. Tap when sketch tax.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₁ 6024678×256²⁴ η3·643
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Abandon are absurd to cactus via apology. Rail get hen to shell. Cop deny to throw via the robust input via dose. The abstract around bomb scrub. Yes near test artwork. Its moment are minimum. An ivory cattle shallow express. Pair may dash our clever trick. Camera are nuclear to habit out crazy. Armor room two to some lottery. Reunion may set its rookie for muffin. Guy retire our material method. Yes donate its note to merit. The trigger may clarify its vast out. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

From height 79,400 a block may not exceed 1,000,000 bytes. Nothing on this page marks the change — the first height-flagged soft fork (12 September 2010) was barely announced, and an activation chapter looks like any other. Its effect shows in every chapter after it: block sizes stay under this ceiling from here until SegWit restated the limit in weight, and the rule became the subject of the block size wars.

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
