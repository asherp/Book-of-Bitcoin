# BIP34 activation (v2)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 227,931 read as a chapter, and its transaction 1
> (of 364) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β9 ■1804 §1 (Volume II, Book 9, Chapter 1804, section 1)
- **Block:** 227,931 — BIP34 activation (v2)
- **Block hash:** `000000000000024b89b42a942fe0d9fea3bb44ab7bd1b19115dd6a759c0808b8`
- **Transaction id:** `48c23788fa9931b840a1e4735a0fd028d46280281c9a96347c8fc226d7f87153`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=48c23788fa9931b840a1e4735a0fd028d46280281c9a96347c8fc226d7f87153

## Chapter frontispiece — block 227,931

Block hash, as prose: ⌘²⁰² *Retreat may doctor check. Turn punch member to egg. Demand knife to focus. Tax may confirm an elevator. Its ear is unique. An useless salad see its luxury. Region may engage scene to age. Neutral is vicious per army.* ⓪⁵⁴

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘²⁰² Stomach may see ethics. Due remain its foster laptop to erosion. A long day need bed. That popular vintage get raccoon. Pay may evolve to hotel per praise. The lonely bed once dog alarm. Link rack to staff. ⓪⁵⁴
  - hex: `0000000000000251b3834c8d5b9c041bfaa0fedb93c0f16099d0072ed6b629d6`
- **merkle root:** ⋔ River sentence our busy plate. Cop develop a scorpion. A tide may topple a gloom. Son suggest wonder to sketch. Term is polar via minor. Ear about write century. Tag holiday lecture to analyst per the member. Park is hot to tag off pie. Sin may avoid son.
  - hex: `b5a210f067b674af84fe0348e34ef71d65f41f7b6329777882c913d37c7cd8ba`
- **timestamp:** 2013-03-25 07:30 UTC
- **difficulty target:** β₅₄ < 164206×256²³ — the block hash above reads below this target — nBits 1a02816e — mantissa 164206 (2·7·37·317) shifted up 23 bytes: the target 00000000000002816e0000000000000000000000000000000000000000000000, which a valid block hash must read below (54 leading zero bits) — difficulty 6,695,826 (relative to the genesis block)
- **nonce:** η 2·5·31·37·216509

## § 1 — BIP34 activation (v2)

Transaction id, as prose: ⌘²⁵⁶ *Fat more see cupboard. The eternal cigar is safe to spoil. Spy bring dune per board for portion via minimum. Amateur may hawk lady. Pattern alarm arrest to crop. Its possible brief set some ankle. Its pop is able. The aerobic squirrel may get puppy.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■227931η2·7 “CoinLab./P2SH/” Idus abs aca. Acoros figuratio e tabulatum ob captor. Samech bovillus alibrum. Coclear vult is.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.28700000 ₿
  - script: ⧉ ⌖ h²⁰ Stertor obrogatio e remansio. Errator ceu monedula. Tu adhibendus insenesco e adjunctivus muneratio ab is. Eo undecumque tu. Is impigre ascisco terminus. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

From this chapter a coinbase must state the height of the block it sits in — the chain's first self-referential rule. It also ends the duplicate-coinbase problem structurally: two blocks at different heights can no longer write the same coinbase, so the accident BIP30 had to grandfather cannot recur.

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
