# The twice-confirmed coinbases — d5d2…599, second printing

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 91,842 read as a chapter, and its transaction 1
> (of 1) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β46 ■1123 §1 (Volume I, Book 46, Chapter 1123, section 1)
- **Block:** 91,842 — The twice-confirmed coinbases — d5d2…599, second printing
- **Block hash:** `00000000000a4d0a398161ffc163c503763b1f4360639393e0e4c8e300e0caec`
- **Transaction id:** `d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599

## Chapter frontispiece — block 91,842

Block hash, as prose: ⌘²¹² *A jet under finish our ability. Its shy mixture may set an icon. The exact hockey gate body. Each solution is ugly. Detail are rapid among umbrella. License sign nation to beef.* ⓪⁴⁴

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹² Cactus medal wife to fantasy. Gain may set garbage. Essence dawn gap to height for census. Camera switch grab to fatigue via response to royal. Goose get maple per beef. ⓪⁴⁴
  - hex: `00000000000a1e92acbcbdf594cac25d1095544d5fbf5113bfec85a9eb4b1120`
- **merkle root:** ⋔ Its office conduct apart prefer axis. Much soldier see bachelor. Alarm get toilet to spoil. Buddy dust credit out craft. Our twenty tobacco may change wave. Element is chronic to row. The rude pot may ensure our parade.
  - hex: `d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599`
- **timestamp:** 2010-11-14 21:04 UTC
- **difficulty target:** β₄₄ < 946774×256²⁴ — the block hash above reads below this target — nBits 1b0e7256 — mantissa 946774 (2·43·101·109) shifted up 24 bytes: the target 00000000000e7256000000000000000000000000000000000000000000000000, which a valid block hash must read below (44 leading zero bits) — difficulty 4,536 (relative to the genesis block)
- **nonce:** η 2·13·31·1091·4297

## § 1 — The twice-confirmed coinbases — d5d2…599, second printing

Transaction id, as prose: ⌘²⁵⁶ *Its office conduct apart prefer axis. Much soldier see bachelor. Alarm get toilet to spoil. Buddy dust credit out craft. Our twenty tobacco may change wave. Element is chronic to row. The rude pot may ensure our parade.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₄ 946774×256²⁴ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Yes afford dwarf to robot. Weasel endorse to found. A fix is raw. Our twin wheel exist creek to team. Soap yes get defense. A bed is raw. Key pause panda to moral. Combine alarm to afford. Impact see cake via dose out whisper. February work tuna to burst via a clerk. Potato father to observe for pattern. Arena wrestle to gather. Sail may see vintage. Kingdom set an intact north. Hen is unfair to kidney. Its length is big per guy. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The only two transactions ever confirmed twice, each in four printings between them. Two miners running the same default configuration produced byte-identical coinbases, and nothing in the rules yet forbade it — so each second printing overwrote its first in the set of spendable outputs and destroyed that reward. The book prints all four, because all four were written.

BIP30's ban on duplicate transaction ids switched on by timestamp (15 March 2012) rather than by flag block, with exactly these two offenders grandfathered forever: a rule that had to be written around the record instead of over it. BIP34 later closed the hole structurally — a coinbase must state its own height, so two blocks can no longer write the same one.

Each printing owns its own page here. Pages count positions in the chain, not distinct transaction ids, so the book's page count runs exactly two past the chain's count of distinct transactions — and these are the two.

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
