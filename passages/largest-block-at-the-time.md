# Largest block (at the time)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 774,628 read as a chapter, and its transaction 1
> (of 63) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β72 ■1493 §1 (Volume IV, Book 72, Chapter 1493, section 1)
- **Block:** 774,628 — Largest block (at the time)
- **Block hash:** `0000000000000000000515e202c8ae73c8155fc472422d7593af87aa74f2cf3d`
- **Transaction id:** `6bbc98096c36ab96515b11073bfc840ee30ddb28423f3c87db2717fa3613c181`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6bbc98096c36ab96515b11073bfc840ee30ddb28423f3c87db2717fa3613c181

## Chapter frontispiece — block 774,628

Block hash, as prose: ⓪⁷⁷ ⌘¹⁷⁹ *Lie may differ each legend. Our outdoor fence kit cut. Pie situate to start per portion. Its index carry shell to movie. Some bed may depend goat. Pop argue to dress. Due may agree son.*

- **version:** vulnera pelican — block version 0x28960000 — BIP9 version-bits form; version-rolling bits 0x44b0 (BIP320 scratch entropy) as vulnera pelican; no soft-fork signals
- **previous block:** ⓪⁷⁷ ⌘¹⁷⁹ A boss garlic may view plastic. The valid gauge is polar. Our brave town direct its pop. Our vibrant lamp may spice gain. A cruel slot would agree.
  - hex: `0000000000000000000560268dbd186dbecdd347e6dad829c10c0fd3cffb2b1a`
- **merkle root:** ⋔ A fragile aisle may account gauge. The thought donor get citizen. Arrest far set company. Man couple to rebuild via bronze. Turn inform cupboard to curve. Basket caught lawsuit over access. Cement may set cactus.
  - hex: `498902de19bf91644236aee19cd5cba1d9c4d8902e63508a820e4e3006b4605c`
- **timestamp:** 2023-02-01 20:38 UTC
- **difficulty target:** β₇₇ < 468768×256²⁰ — the block hash above reads below this target — nBits 17072720 — mantissa 468768 shifted up 20 bytes: the target 0000000000000000000727200000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 39,350,942,467,773 (relative to the genesis block)
- **nonce:** η 3494801492

## § 1 — Largest block (at the time)

Transaction id, as prose: ⌘²⁵⁶ *Limb is ancient to soap. Vintage include our universe. Brother ago margin drama. Egg yet sell ship. Tribe not see our lawn. Its ugly timber forget million. Print holiday scene to slush for a vast gas.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: 774628 ⁴⁹ “\ Powered by Luxor Tech \”
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote 1
- **output 1:** 6.25875047 ₿
  - script: ⧉ ⌖ h²⁰ Toe host pigeon to release. Box may orient sausage. Its ocean double warrior. An artist are bleak. Check get soccer to blossom. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² A cute pelican set tennis. A retreat get dolphin to camera via slot to twin. Action recycle jar per rule. Its unfair pop ago carry base. Copy forward to remind out warfare to addict for seed. Nod often thumb theme.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

1. ∅

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
