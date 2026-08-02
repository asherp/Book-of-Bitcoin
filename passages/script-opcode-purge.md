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

Block hash, as prose: ⌘²¹⁵ *The abstract account tackle captain. A hollow burden notice to source. Wonder expect to suffer for some jelly. Its opinion is rude. Its jet may install coffee. Cow install to gesture via morning. Program see security to mosquito.* ⓪⁴¹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁵ Abstract account casino to memory. Code see gown for wasp. Chuckle may release our clown. A cap is nuclear. Capital online harbor ear. The smart buyer may vault corn. Its song off speak abandon. ⓪⁴¹
  - hex: `0000000000606865e679308edf079991764d88e8122ca9250aef5386962b6e84`
- **merkle root:** ⋔ Abandon accuse grape to setup. Cave get our faith. The rapid wagon see village to lava. Clump may require sunset per final. Shrug may crane visual. A fiscal son wrestle benefit. Pass are royal to flag per fabric. Its armor are odd.
  - hex: `5f5854b0ca5bd054c89f57a7978c8e69c56cdc8ac57da097fd6321651212bbac`
- **timestamp:** 2010-08-15 23:53 UTC
- **difficulty target:** β₄₀ < 32782×256²⁵ — the block hash above reads below this target — nBits 1c00800e — mantissa 32782 (2·37·443) shifted up 25 bytes: the target 0000000000800e00000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 511.77 (relative to the genesis block)
- **nonce:** η 2·3·11·50507789

## § 1 — Script opcode purge

Transaction id, as prose: ⌘²⁵⁶ *Abandon how accuse an unaware blanket. Cushion is elite to limb. Its gauge upset to prepare for shrimp. Doctor author repeat to climb. Worry exercise butter for pizza. Flame ago upgrade arch. Ranch may display a grab.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₀ 32782×256²⁵ η2²·3²·43
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ The abandon get absurd. Chalk key heart to its fluid via ski. Price may busy a capital recipe. Wild may erode bit. Its yes when follow its nerve. The horn may set each aunt. Guy never enrich fyi. Red may ask some cycle. Its sin is exotic. Race may mail risk to trophy. Its rid salt also holiday a stable. Tie uphold to improve out dash. Coach may see lava. Target might force to unfold. A fine is diesel. Our deer get giant to mistake. Answer harbor swing for problem. Mask is pop to the war. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The corrective fork of 15 August 2010 carried a second ruleset with it: 0.3.10 also disabled a dozen script opcodes — OP_CAT, the shifts and the splices — following 0.3.6's forced-fail OP_RETURN a fortnight earlier. Both are release-based soft forks with no flag height, so the fork block that put the patched rules in charge of the chain is the closest thing they have to an activation chapter. A good part of the sigla leaf is a list of things a script may no longer do; most of them stopped here.

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
