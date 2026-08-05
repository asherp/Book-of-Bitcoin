# Coldcard attack, wave 2

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 960,352 read as a chapter, and its transaction 148
> (of 2,891) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β60 ■1409 §148 (Volume V, Book 60, Chapter 1409, section 148)
- **Block:** 960,352
- **Block hash:** `0000000000000000000163e32fb91749e9d65000fa0c3a41d9509c697a3d6d84`
- **Transaction id:** `be0a120150d5e2bb246047d709e61e300617b7f288a8943f3bdfc04d3462eafc`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=be0a120150d5e2bb246047d709e61e300617b7f288a8943f3bdfc04d3462eafc

## Chapter frontispiece — block 960,352

Block hash, as prose: ⌘¹⁷⁷ *Love may hazard our future spring. Shallow hole agent to dose. A wheel see action. Cup spoon to multiply per symptom to sauce via hockey. Absurd not believe choice. Wet may see cactus.* ⓪⁷⁹

- **version:** vdensaugeo zoo 10000 — block version 0x3fff0010 — BIP9 version-bits form; version-rolling bits 0xfff8 (BIP320 scratch entropy) as densaugeo zoo; signaling bit 4
- **previous block:** ⌘¹⁷⁷ Harbor yet set course. Our easy bacon may glimpse stable. Our phone holiday to uncover out album. Recipe orphan an amused antenna. Chat see tomato to absurd. A cut blast when end a parade. ⓪⁷⁹
  - hex: `0000000000000000000120b789138260cecebea0ec66e3a8a733a60817290669`
- **merkle root:** ⋔ Sir ask the side mule to neither cinnamon hint. Die absent harbor to globe. Cat point tree out shaft. Swap may weather until hit. Sir ensure tooth to today. Start set clinic for gap. Guy expose scare to supply via worth. River see its pan to the son.
  - hex: `2e94beb2526a8d9b5c4b712fbeb64ffc739d7a4463482b80d790124a45fe580d`
- **timestamp:** 2026-07-31 05:48 UTC
- **difficulty target:** β₇₈ < 146132×256²⁰ — the block hash above reads below this target — nBits 17023ad4 — mantissa 146132 (2²·7·17·307) shifted up 20 bytes: the target 000000000000000000023ad40000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 126,231,507,121,868 (relative to the genesis block)
- **nonce:** η 2³·474911497

## § 148 — Coldcard attack, wave 2

Transaction id, as prose: ⌘²⁵⁶ *Woman get a fantasy to minimum. Map may oppose to assume. Outside wrestle its sir. Lie never set material. Noble shift arrest to acid. Its indoor chef set trophy. Gasp chair weather to primary. Abandon get its math. Cliff scare the force to cat. A frame ago see pay.*

- **version:** 2
- **input 1:** spends output 0 of `d8fb824e7841be3b689a82a78c7ce5a0c0a8636a4a74aff98ddb72e94541ce6f`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.11470954 ₿
  - script: ⓪ h²⁰ Bellipotens circumcisio taedium. Chrysolitus matella e siligo. Eo vult protero ad haustus ab annotinus domnio. Is abaliud offundo tu. Is vult abiugo auctorico.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Our raw cow hurt wheel. Its eager yes is easy. Smoke zone its sniff. Our return why humor duck. The civil finger may get tomato. A slim december would betray suit to tea. Our aid may connect universe for the pluck via its rub. Cop announce to total. Security is zero for dilemma. Young how shallow the silly impact. A lucky bundle birth wise. Lot exist to earn via regret to napkin. Problem shallow the quality fatigue. Animal never party its aim. Lab may see cake to wolf via cinnamon to future. · p Ear is low across wheel. Its early bulb absorb tea between an unhappy cut. Sir involve a senior chair. Palm yet get usage. Unit see island to fun. Due may wrestle target for hand. An useless deputy yes knee yellow. Stem set the notable action. Category may acquire velvet to set.

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
