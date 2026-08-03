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

Block hash, as prose: ⌘¹⁸⁵ *Abuse may see accident. Jaguar get course to vessel per treat. Son wrestle base to a brave practice. Our pay is able. Row remove system to apple. Balance set its electric hand. Pie very scale divorce.* ⓪⁷¹

- **version:** v4 — block version 4 (0x00000004) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁶ Abuse achieve pulse to excess. The bridge is innocent. Pop expire truth to action. Cut early subject space. Current may cradle ribbon. Lot attend a festival. Our capital retreat get its length. ⓪⁷⁰
  - hex: `0000000000000000021722a9a203721f031b41ff3a451470faa048e70d3ab1d5`
- **merkle root:** ⋔ Abandon may set accident. One could see our mad negative. The false river set the era. Property educate to believe. Fun mean siren out its vague quantum out crunch. Drive get the small traffic. Its toe badge level. A ring why set our main.
  - hex: `32846e0117c1719b8f5943a7d16be197ec44789582466315937525f5c9165673`
- **timestamp:** 2016-03-29 14:31 UTC
- **difficulty target:** β₆₉ < 435395×256²¹ — the block hash above reads below this target — nBits 1806a4c3 — mantissa 435395 (5·31·53²) shifted up 21 bytes: the target 000000000000000006a4c3000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 165,496,835,118 (relative to the genesis block)
- **nonce:** η 2²·5²·7·31·181·353

## § 1 — Bitcoin Classic high-water mark

Transaction id, as prose: ⌘²⁵⁶ *Abandon see its acid universe to our cherry dilemma. Holiday may skirt genius to pan. Pop expand wagon via toe per unit. Forward may stuff pulse. Bit when get the mixture. Its whale may learn theme. Its random pie is easy to our chase per a flat. A yes assume the ban.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■404843Absurd is absurd to ability. Deal catalog pistol per the acoustic die. A cop inform to vote. Sir adapt the elevator. Our curious eagle is liquid. Lab may divorce abandon. “BW Support 8M fisher jinxin	/BW Pool/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.52170126 ₿
  - script: ⧉ ⌖ h²⁰ Its absurd accident move satoshi. The unaware minute retreat pause. Park spread to derive. Glass may snap advance per ice. Cop topple to parade. ≡ ∇
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
