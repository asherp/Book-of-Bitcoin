# The 107 BTC burn

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 950,962 read as a chapter, and its transaction 1
> (of 3,755) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β56 ■83 §1 (Volume V, Book 56, Chapter 83, section 1)
- **Block:** 950,962 — The 107 BTC burn
- **Block hash:** `00000000000000000000e37d3f9e65f307c1d62f91a7364031f59760fc9048cc`
- **Transaction id:** `09cd6f9ee420685dd9ea58594df8b015d5d4fb16435212fae028cc26d8402917`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=09cd6f9ee420685dd9ea58594df8b015d5d4fb16435212fae028cc26d8402917

## Chapter frontispiece — block 950,962

Block hash, as prose: ⌘¹⁷⁶ *Tap about achieve its odd girl. Category yes web our annual whisper. Shallow almost pole maximum. Volcano may link left. Each son ready jump. Use may toast each pan.* ⓪⁸⁰

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁷⁷ Its son absorb accident. Smoke is good to mirror. The page portion sugar for monitor via the laugh. Our map may assume chicken. A yes apart wolf blame. Route walk poverty to amount. ⓪⁷⁹
  - hex: `00000000000000000001a9b4276f2ecc2f859ebc817d7834b650efc9c6919979`
- **merkle root:** ⋔ An abandon may account blanket. Our cheap brother neck shine. Rent set wheat to guitar. Cotton may verify force per month. Glove may recall our long manual to lesson out section. Sign see our upper slight. Its just tool how see bet.
  - hex: `255f5e97f12ee40a0f70871edc6cc7f688adca1bc667cf97ed8b3b798e9be882`
- **timestamp:** 2026-05-25 13:59 UTC
- **difficulty target:** β₇₈ < 135033×256²⁰ — the block hash above reads below this target — nBits 17020f79 — mantissa 135033 (3·19·23·103) shifted up 20 bytes: the target 000000000000000000020f790000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 136,607,070,854,775 (relative to the genesis block)
- **nonce:** η 3·23·43·223·359

## § 1 — The 107 BTC burn

Transaction id, as prose: ⌘²⁵⁶ *Abandon out see absurd. Rich may expand raccoon. Holiday too behave loop. Our drastic cow is false to board. Same predict eyebrow for such pot. Out thrive private to flight. Fine firm space for atom. Yes execute sand to a patrol.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■950962 η3·7·4261·16063“/Foundry USA Pool #dropgold/” An above acid sting opera. Surface card our loud tide to kiss. Our proud yes inspire the tower per our row. The lip barely set nature. Wreck forward an arctic. A nod often see the oval dawn. Scrap exact donor to our arrest. A silent cow why define cat. The task is acoustic. ⓪⁷ Yes absorb to accuse. Cream exclude mix via abandon. Athlete set genre to cake. Abandon may abandon our tax.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 3.14353530 ₿
  - script: ⓪ h³² Abandon may get accident to our loud milk. An abstract bonus is polar. Runway soft set turkey. Our abstract iron barrel three. Gas set this motor. Luxury is vivid to the proud marriage. Its flush banana differ a joke.
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon see acid to a hand. August switch marine per hawk via practice. Visit rather involve its tomorrow. A aid are eager. Our patch may cram our cloth. Yes protect trouble to raise. Kingdom modify purse via park. The spy see jungle.
- **output 3:** 0 ₿
  - script: ¶ ⁴⁵ Lie may absorb access to bounce. A stand see meat. The brick get cloth to toddler. Cow smooth this junk check. War differ delay to more capital. Jet may undo ability for school. A height may soap body. Our unfair lunch slice palace. Position yellow our walnut song to lizard. The comic age trash per the chimney.
- **output 4:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Five sections of this chapter, 25 May 2026, together carrying 107.13021951 ₿ — and every one of them pays the script whose key-hash is twenty zero bytes, the address written `1111111111111111111114oLvT2`. Nothing hashes to zero by anyone's knowledge, and no way of finding a key for a chosen hash exists; coins paid to it are gone in the only sense the chain can state.

The onchain analyst Sani, of Timechainindex, flagged the transfer the following day, and the coverage that followed (news.bitcoin.com, 27 May 2026) collected the theories — protest, a compromised key put beyond use, plain error. None has evidence, and the record leaves the question open: five transactions moved coins to an unspendable script, and everything after that sentence is somebody's reading.

The destination is the chain's default incinerator, and the context sizes the event: by this book's own reading of the chain (2 August 2026) the zero address has received 809.42500016 ₿ across 390,869 outputs and spent none, and a 2025 survey of burn addresses (arXiv:2503.14057) counts 3,197.61 ₿ provably burned across 7,905 such addresses, over 99% of it in three. These five sections are the largest single arrival in that address's history — one reader's decision, whatever it was, visible from the supply curve.

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
