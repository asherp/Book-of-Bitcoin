# Bitcoin Classic high-water mark

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 404,843 read as a chapter, and its transaction 1
> (of 1,642) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β97 ■1308 §1 (Volume II, Book 97, Chapter 1308, section 1)
- **Block:** 404,843 — Bitcoin Classic high-water mark
- **Block hash:** `000000000000000001f8f246db5123aa60eed70a60a9dab884fc7d8e79c5e46e`
- **Transaction id:** `6f20564d5cd45880dbaff9728c3e5b79edadb6735cf6813a5895cd169f9db8fd`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6f20564d5cd45880dbaff9728c3e5b79edadb6735cf6813a5895cd169f9db8fd

## Chapter frontispiece — block 404,843

Block hash, as prose: ⌘¹⁸⁵ *Pay may humble change to fury. Brother may thank war. Its drastic toddler see festival. Gas find wine to scout per peasant. The pottery home tattoo our way. A new amount output a pistol to the elite length.* ⓪⁷¹

- **version:** v4 — block version 4 (0x00000004) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁶ Stick mean lock to soldier per meat. Its large scare is master. Sky may depend wheel to egg. An alert may warm to achieve. Dig why melt cattle. Blade avoid point to suspect. A project get length. ⓪⁷⁰
  - hex: `0000000000000000021722a9a203721f031b41ff3a451470faa048e70d3ab1d5`
- **merkle root:** ⋔ Infant set our radar. Its raven tumble firm sister. Few hand is little. Profit see bachelor to summer. Lawn remove to educate per trick out flower for lamp. Symbol out see lion. The hybrid yes resemble the awkward doctor. Its strong lot is soft. Snow see a cop.
  - hex: `32846e0117c1719b8f5943a7d16be197ec44789582466315937525f5c9165673`
- **timestamp:** 2016-03-29 14:31 UTC
- **difficulty target:** β₆₉ < 435395×256²¹ — the block hash above reads below this target — nBits 1806a4c3 — mantissa 435395 (5·31·53²) shifted up 21 bytes: the target 000000000000000006a4c3000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 165,496,835,118 (relative to the genesis block)
- **nonce:** η 2²·5²·7·31·181·353

## § 1 — Bitcoin Classic high-water mark

Transaction id, as prose: ⌘²⁵⁶ *Its world shaft set guitar. Cop collect sun to a project. Some tube disagree a fragile oval. Problem sustain noble to palm for crack to game. Sir quit swing via bike per post. Shadow prison to like. Theory add bean for short.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■404843Aer fabarius pharetra. Eo discrimino physicalis longaeva e epopta de sobrietas. Theatrum omoticus tu. Eo is abs is. Eo proinde exorsa. Istic ne is. “BW Support 8M fisher jinxin	/BW Pool/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.52170126 ₿
  - script: ⧉ ⌖ h²⁰ Gabalium plantago e ambulator. Scepticus vult sphragis. Is sardo bajulo supra insulatus eo. Tu extutare peculor e meretor. Pyxis vult saputum. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

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
