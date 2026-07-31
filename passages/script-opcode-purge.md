# Script opcode purge

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 74,638 read as a chapter, and its transaction 1
> (of 3) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β38 ■47 §1 (Volume I, Book 38, Chapter 47, section 1)
- **Block:** 74,638 — Script opcode purge
- **Block hash:** `000000000069e1affe7161ab4bcbeacebb4ddf155b50e807f42de971b688a09b`
- **Transaction id:** `2ae30f63b1507761b5541f7a723f566abb0701e5f8a97927980381341b5d8cbd`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=2ae30f63b1507761b5541f7a723f566abb0701e5f8a97927980381341b5d8cbd

## Chapter frontispiece — block 74,638

Block hash, as prose: ⌘²¹⁵ *Its option may get affair. Cow collect toilet to name for wheel. Cabbage may set anxiety. Some force shall puzzle our square. Its jealous upgrade grant concert. History impose a voice to weapon for the spirit.* ⓪⁴¹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁵ Love may image toss to arrow. Cow discover its lunar note. Cereal base our dust. Battle unfold book to loop. Lawsuit ship ketchup via creek. Foam may scale son. ⓪⁴¹
  - hex: `0000000000606865e679308edf079991764d88e8122ca9250aef5386962b6e84`
- **merkle root:** ⋔ Cop protect the sudden cop. Its hit are loyal. Ski how bike yard. A future autumn see sheriff. Finger get its brass member. Ocean edge our future turtle. Panther may dress cross. Resource prison clay to gesture via our theme.
  - hex: `5f5854b0ca5bd054c89f57a7978c8e69c56cdc8ac57da097fd6321651212bbac`
- **timestamp:** 2010-08-15 23:53 UTC
- **difficulty target:** β₄₀ < 2²⁰¹·37·443 — the block hash above reads below this target — nBits 1c00800e — mantissa 32782 shifted up 25 bytes: the target 0000000000800e00000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 511.77 (relative to the genesis block)
- **nonce:** η 2·3·11·50507789

## § 1 — Script opcode purge

Transaction id, as prose: ⌘²⁵⁶ *Its rural glass egg to harbor. Pop awake slot over cry. The wedding chimney may draft item. Pistol see cabbage to size. A dumb feed prison fruit. Pause bike margin to million via divorce.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₀ 2²⁰¹·37·443 η2²·3²·43
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Aid again see its urban jet. Cow ask to enroll. Rich far fetch glue. Cattle get biology to satoshi. Another palm due clip its raw horror. A red limit are famous. An annual yes accuse egg. Skate bid to ignore. Dance see laptop for water out path. Our eternal surprise tape son. Its soft bit is alone. Pitch quick set sweet. Twin get a buffalo. Client see sibling to mango. Cow equip the random die. Aid thrive pudding to breeze. Rub far betray its illegal gas. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The corrective fork of 15 August 2010 carried a second ruleset with it: 0.3.10 also disabled a dozen script opcodes — OP_CAT, the shifts and the splices — following 0.3.6's forced-fail OP_RETURN a fortnight earlier. Both are release-based soft forks with no flag height, so the fork block that put the patched rules in charge of the chain is the closest thing they have to an activation chapter. A good part of the sigla leaf is a list of things a script may no longer do; most of them stopped here.

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
