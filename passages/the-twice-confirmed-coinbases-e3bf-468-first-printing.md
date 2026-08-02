# The twice-confirmed coinbases — e3bf…468, first printing

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 91,722 read as a chapter, and its transaction 1
> (of 1) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β46 ■1003 §1 (Volume I, Book 46, Chapter 1003, section 1)
- **Block:** 91,722 — The twice-confirmed coinbases — e3bf…468, first printing
- **Block hash:** `00000000000271a2dc26e7667f8419f2e15416dc6955e5a6c6cdf3f2574dd08e`
- **Transaction id:** `e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468

## Chapter frontispiece — block 91,722

Block hash, as prose: ⌘²¹⁰ *Mom list field to tourist. Son may devote today. Sir oppose a primary. Hawk yes get thing. News sentence our canoe. Season may work table to chat. Topic is ordinary out advice.* ⓪⁴⁶

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹² Dress set squirrel to media. Our main is false. Its zero vault off cram year. The basic survey remind capital to a drastic addict. Its nod twice join army. Beef set our map. ⓪⁴⁴
  - hex: `00000000000a30044feb1a9010445c5b6d4cdc3f32ca747cff2525c32976ba42`
- **merkle root:** ⋔ Its hamster pepper stomach to hollow. Excess may point the tilt. Sky defy its guilt. List may see the arctic. Cow inject to lend. Click enter lawsuit via steel for section. Our mistake set giant to document. Paddle see zebra via gas.
  - hex: `e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468`
- **timestamp:** 2010-11-14 08:37 UTC
- **difficulty target:** β₄₄ < 946774×256²⁴ — the block hash above reads below this target — nBits 1b0e7256 — mantissa 946774 (2·43·101·109) shifted up 24 bytes: the target 00000000000e7256000000000000000000000000000000000000000000000000, which a valid block hash must read below (44 leading zero bits) — difficulty 4,536 (relative to the genesis block)
- **nonce:** η 2·39119·51133

## § 1 — The twice-confirmed coinbases — e3bf…468, first printing

Transaction id, as prose: ⌘²⁵⁶ *Its hamster pepper stomach to hollow. Excess may point the tilt. Sky defy its guilt. List may see the arctic. Cow inject to lend. Click enter lawsuit via steel for section. Our mistake set giant to document. Paddle see zebra via gas.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₄ 946774×256²⁴ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ An advice why set yes. A myself. Sign see our gadget. A door coast the clean flower. Our uncle get dune to gold. Any red may keep tortoise. A next set boy. An immense son may cancel leopard. A myself. An immense bean get zebra to bundle. A bleak start pipe barrel. A due may say some skill to cushion. Yes describe smoke via its vivid pan. Each red is vibrant. Dash neither set that clay. Wool goose tornado to cereal. Habit set a bonus. Snack see soul to cactus. ∇
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
