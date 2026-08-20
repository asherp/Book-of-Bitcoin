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

Block hash, as prose: ⌘²¹⁵ *Option may set our affair. Yes collect toilet to name. Wheel why see cabbage. Anxiety may force puzzle to square. Our jealous upgrade grant concert for history. Son may impose voice to weapon out spirit. Defense may measure wonder. Length might get guilt. Exchange may skate cross.* ⓪⁴¹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁵ Love image toss to arrow. Son discover a lunar note. A cereal base dust to battle. Yes may unfold book. Loop set lawsuit to ship. Ketchup see creek for foam. Scale set our country to file. A million may theme jump. Pop barely glow dig. Lip erode our tax. ⓪⁴¹
  - hex: `0000000000606865e679308edf079991764d88e8122ca9250aef5386962b6e84`
- **merkle root:** ⋔ Pay may protect son to the sudden map. A loyal ski may bike yard. Future set autumn to sheriff per finger to the brass member. Ocean may edge a future turtle. Panther dress cross to each resource for prison. Our clay may gesture cow. Cut there set tap. Pot barely blind traffic. Crane build an outer top.
  - hex: `5f5854b0ca5bd054c89f57a7978c8e69c56cdc8ac57da097fd6321651212bbac`
- **timestamp:** 2010-08-15 23:53 UTC
- **difficulty target:** β₄₀ < 32782×256²⁵ — the block hash above reads below this target — nBits 1c00800e — mantissa 32782 (2·37·443) shifted up 25 bytes: the target 0000000000800e00000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 511.77 (relative to the genesis block)
- **nonce:** η 2·3·11·50507789

## § 1 — Script opcode purge

Transaction id, as prose: ⌘²⁵⁶ *Its rural glass may egg harbor. Sir awake slot over cry. Our wedding chimney may draft item. Pistol could get cabbage. Size see its dumb feed. Prison fruit pause to bike via margin. Its million document may carry tower. Elder repeat response to pluck. A city may get the tea.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₀ 32782×256²⁵ η2²·3²·43
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Lana caulicularis guttula. Eo ni glutitus is. Eo posterius tu. Limitaneus sphinga ut accusativus. Tu minutim subtexo extalis. Ranucula ni lineus tu. Is adprenso e alascanus cometes. Ambrum vult circumfundo finalis eo. Nasutus is ni dicundus bugonia. Pervalidus evocatio contrarie algorismus. Eo vult destillo is. Eo imprope cacida. Metipsimus adjudicatio aveho calycinus pycta e tu. Is lecto globosus nexilitas. Eo saputum datarius ipsimago. Naepor vult lecto applaudo. ∇
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
