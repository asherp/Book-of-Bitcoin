# The First Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 210,000 read as a chapter, and its transaction 1
> (of 457) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β1 ■1 §1 (Volume II, Book 1, Chapter 1, section 1)
- **Block:** 210,000
- **Block hash:** `000000000000048b95347e83192f69cf0366076336c639f9b7228e9ba171342e`
- **Transaction id:** `76a30f7eefb41cd01733b23218faea8a1a1a2f6bbf1a2c11e4bc77f62c8e7ce9`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=76a30f7eefb41cd01733b23218faea8a1a1a2f6bbf1a2c11e4bc77f62c8e7ce9

## Chapter frontispiece — block 210,000

Block hash, as prose: ⌘²⁰³ *Above abuse immune to broccoli. Drip may rib bacon out that cheese. Shiver reason scrub to slot. Diagram see region per round. Corn see lawsuit to pigeon. Glare ago amount sin.* ⓪⁵³

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘²⁰⁰ Ability is acid to antique. Grief set a village. Risk patch leaf to lens out gauge. Cannon paper syrup to start. Our net life hold goose. Metal may get the lamp. ⓪⁵⁶
  - hex: `00000000000000f3819164645360294b5dee7f2e846001ac9f41a70b7a9a3de1`
- **merkle root:** ⋔ Abandon may achieve scale. A wet double hint trouble. Its clock is blue. Pop defy peace to some nothing. Ocean may set carbon. Its cop engage day. Valley get its annual bit. Son have to impose via girl. Our correct farm may address pole.
  - hex: `3cdd40a60823b1c7356d0987078e9426724c5b3ab439c2d80ad2bdd620e603d8`
- **timestamp:** 2012-11-28 15:24 UTC
- **difficulty target:** β₅₃ < 319722×256²³ — the block hash above reads below this target — nBits 1a04e0ea — mantissa 319722 (2·3·13·4099) shifted up 23 bytes: the target 00000000000004e0ea0000000000000000000000000000000000000000000000, which a valid block hash must read below (53 leading zero bits) — difficulty 3,438,909 (relative to the genesis block)
- **nonce:** η 2²·7·19·23·332611

## § 1 — The First Halving

Transaction id, as prose: ⌘²⁵⁶ *Abandon is acid to episode. Castle may fly guess. Taxi ago motion cereal. Boy win its slim crouch. The post install trick. Alien rate an obvious village. Defense exclude to sample. Its tie may direct human.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: 210000 ⁶ “/P2SH/” 1354116268 ⁸ Its absent absurd divorce to attend for advice. Guy avoid abandon to amount. ⁷ “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 38.56295554 ₿
  - script: ⧉ ⌖ h²⁰ Absurd may set acid. Elbow is private to search. Valve grunt kitten per monkey. Shove settle the chat. Liar may bundle sir. An outer piano scale cut. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

This coinbase creates 25 coins where every block before it created 50. The subsidy halves every 210,000 blocks — this is the first halving, 28 November 2012 — and the new amount is on this page, in the output's value. Nothing else marks the event: no flag, no signal, just the number. The book's volumes follow these eras, so this block also opens Volume II. Every node checks the amount against the schedule; a coinbase claiming the old 50 would make the whole block invalid.

The output reads more than 25, and the difference is the crowd: a coinbase collects the fees of its block's transactions on top of the subsidy, and 456 sections pressed into the era's first chapter, paying 13.56295554 ₿ between them to stand in it — more than half the new subsidy again, in an era when a block's fees rarely reached a tenth of a coin. So this output, 38.56295554 ₿, records the halving twice over: the halved number, and what people paid to be on the page where it happened.

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
