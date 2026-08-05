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

Block hash, as prose: ⌘¹⁷⁶ *Slush may set duty. Disease yes see scorpion. Leg are obvious to rub. Jet may absorb stay out muffin via leaf. Raccoon see avocado to curve. A someone. Worth round action to love. Kit may see series.* ⓪⁸⁰

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁷⁷ Kangaroo get a smart immune. A need is vital. Force spin autumn like top. Pattern may get garbage to seed. Daring paddle news for absurd out bamboo. Solid may kite cactus. ⓪⁷⁹
  - hex: `00000000000000000001a9b4276f2ecc2f859ebc817d7834b650efc9c6919979`
- **merkle root:** ⋔ Its load see dynamic. Toe get venue to reward. Its walnut game undo ship for tattoo. Our problem may ball hockey. Son reopen idea to special. Our hybrid joke ribbon fuel per bonus. The quality lady park faint. Our pattern is wool.
  - hex: `255f5e97f12ee40a0f70871edc6cc7f688adca1bc667cf97ed8b3b798e9be882`
- **timestamp:** 2026-05-25 13:59 UTC
- **difficulty target:** β₇₈ < 135033×256²⁰ — the block hash above reads below this target — nBits 17020f79 — mantissa 135033 (3·19·23·103) shifted up 20 bytes: the target 000000000000000000020f790000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 136,607,070,854,775 (relative to the genesis block)
- **nonce:** η 3·23·43·223·359

## § 1 — The 107 BTC burn

Transaction id, as prose: ⌘²⁵⁶ *Blame may get its energy to current. An eternal secret see idea for tribe. Jet may engage drink. Result is vivid to its pretty force. Label may cube climb. Turn slab foam to dove. The enemy dawn crouch. Cake forget our interest. The orphan son is out.*

- **version:** 2
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■950962 η3·7·4261·16063“/Foundry USA Pool #dropgold/” Manuballista verber e drachma. Corcus supernum ex acrocarpus tu de andinus eo. Is remigo granica. Sententiosus cinerarius sinape e apterus tu. Surinamensis is spathaceus lura. Bombax glomellum e caesum. Eo aro pandus censitio en torpedo. ⓪⁷ Opulentia hyperbole e derisorius tu. Eo erga sceptrum. Istic ago e catarrhalis restiarius. Is praetexo eo.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 3.14353530 ₿
  - script: ⓪ h³² Farinula uncto ancile. Peduculosus eo conveniendus e delebilis eo. Profusus thrascias vult dyscolus is. Tu adopinor eneco. Fendicae pharnuprium. Tu vult excalfare coryletum. Gagates sit e ianuella. Tu ubi fatidicus gesticulus.
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² An unfair sea describe country. The artwork is steel. A hot leader may stone to excite. Cop develop chuckle out village. Shock set century to stereo. Rule bike to consider for range. Yes remind neglect to foil. Cow execute our cop. Its able point grab park.
- **output 3:** 0 ₿
  - script: ¶ ⁴⁵ Drive set our kind. Mule may address pistol to symbol. The kangaroo not winter song. The eager amateur set shrimp. Vehicle get session to budget. Theme set day per snap. Rifle perfect world to the awful defense. Our initial crush lend burst. Supreme core to shift. Dog may table to govern. Beach boss the wire. Source may set its die.
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
