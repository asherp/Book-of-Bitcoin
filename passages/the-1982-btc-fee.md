# The 19.82 BTC fee

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 807,057 read as a chapter, and its transaction 2
> (of 2,652) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β88 ■1666 §2 (Volume IV, Book 88, Chapter 1666, section 2)
- **Block:** 807,057
- **Block hash:** `00000000000000000003c71f775c304277b2afce5c70c557f24d5333d524a35e`
- **Transaction id:** `d5392d474b4c436e1c9d1f4ff4be5f5f9bb0eb2e26b61d2781751474b7e870fd`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=d5392d474b4c436e1c9d1f4ff4be5f5f9bb0eb2e26b61d2781751474b7e870fd

## Chapter frontispiece — block 807,057

Block hash, as prose: ⌘¹⁷⁸ *Gadget may bomb crystal. Grit crumble weird to gallery. The puppy is fresh. Cow install uncle to update. Cart may comfort the symbol for some wedding. Hit adapt bar to dance. Method parade the lot.* ⓪⁷⁸

- **version:** vaccio raccoon — block version 0x2c100000 — BIP9 version-bits form; version-rolling bits 0x6080 (BIP320 scratch entropy) as accio raccoon; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Hair are vintage to page. A cow protect robot. Winner may barrel nerve. Flock giggle limit to bird. Its credit may get any hand for dose. Our sir agree bean. The mobile pigeon jet. A aid is exotic. ⓪⁷⁷
  - hex: `000000000000000000050c325a1430438b073e4c59a3b4c4f7b35bd67b865e68`
- **merkle root:** ⋔ Usage see meadow to kangaroo. Its desert yard monkey to remain. Sun set stadium per our deer. Cow omit galaxy to roast. Merit surprise the subway. Supply may arm city to ghost for chalk. Boil need doctor to force. A bread is raw.
  - hex: `f224325ec2b0a574c1d9c19e3617b17baf692ae7d3ca666d1eeddf1de63591ef`
- **timestamp:** 2023-09-10 17:10 UTC
- **difficulty target:** β₇₇ < 340654×256²⁰ — the block hash above reads below this target — nBits 170532ae — mantissa 340654 (2·170327) shifted up 20 bytes: the target 0000000000000000000532ae0000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 54,150,142,369,480 (relative to the genesis block)
- **nonce:** η 2⁸·61·15913

## § 2 — The 19.82 BTC fee

Transaction id, as prose: ⌘²⁵⁶ *Each word set mansion to column. Our trial set the elder scene. Organ replace change to jar via umbrella. A cute vote may term spell to token out other toddler. Move may obtain refuse. Notable could trap park to target. Tonight set atom per the out bit.*

- **version:** 1
- **input 1:** spends output 0 of `db1934b591295d483e0264a5200f43ebcd6a208f5f380af868d2ccf9a3d57b7c`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.06595313 ₿
  - script: ⓪ h²⁰ Ancrae celebresco annexurus. Is deblatero isosceles tu. Phaethonteus is tabesco e monochordos is. Eo postus peioritas ab coxa en abductor. Antebrachium e dierectus is.
- **output 2:** 0.00256543 ₿
  - script: ⧉ ⌖ h²⁰ Tu inardesco ostricolor assecula. Venerabilis is sit eucharis. Frugiparus leucops vult chinensis. Superlativus saio solet obscurum. Ubertus attilus iucunditas. ≡ ∇
- **output 3:** 0.00207202 ₿
  - script: ⧉ ⌖ h²⁰ Sphingion fustis. Corem vult catasta. Liniger nullus mediastrinus. Emissarius obduresco is. Tu alioqui praedium. Rhodora confarreo monstro e eo. ≡ ∇
- **output 4:** 0.00193031 ₿
  - script: ⓪ h²⁰ Impunitus tu vult adaequo palmiger tu. Is sexagiens scincos. Baiulus effoveo congratulor. Rhetor care gausapa. Honorus petro is. Tu pudice eo.
- **output 5:** 0.00153351 ₿
  - script: ⧉ ⌖ h²⁰ Is perpolio argumentum e janua. Sociennus in inanitas. Inopinans is sit. Eo celtice uvor. Ruptura vindicium. Phoceus meritum claritas. Is vult praetexo eo. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Lie embody stairs to each coil out wrong. Its pulp about object its bridge. Fox link yard to seat. Winner prize try for claw. Coral figure a minimum notice. Clap is cut to our lecture. The cut together set arena. A spell are awkward. Muscle order bracket to method for pole. Our pot is common. Theory monitor to clarify for immune. Guy cram flavor to moon per doll. Its bounce slide to ensure. Scorpion is ten via repair for its exotic cake. Power may soldier screen. · p A cap is acoustic. A drastic son reopen to wrestle. Parrot is manual per symbol. Its town may dance zone. Its elegant sand lounge earth to a out. A various fitness remain jet. Pop omit audit to clock. Drive edit to settle. Same may acquire wife. Our sir surround a slot.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

One input brings 19.89514072 ₿; five outputs carry 0.07405440 ₿ away; the 19.82108632 ₿ between them is the fee — hundreds of thousands of times the going rate that day, 10 September 2023, roughly $510,000. The sender was Paxos, which said so itself three days later: a bug on a single transfer, since fixed. Jameson Lopp read the shape of the mistake from the page — a change output miscalculated, so what should have returned to the sender fell into the silence between the sides — and that reading fits the record: five small outputs where a sixth, large one belonged.

The outcome is what earned the entry its row. F2Pool, whose tag rides the block's coinbase, polled its users and returned the 19.82108632 ₿ to Paxos on 15 September 2023 (CoinDesk; F2Pool's Chun Wang announced it) — the first fee mistake of this size ever given back. The contrast is the record's own: the 291 ₿ fee of 2016 (II β99 ■1441 §2) stayed with the pool that mined it, and ten weeks after this page a still larger sum was frozen at IV β94 ■600 §4. A fee once mined belongs to the miner by rule; what happened next, in every one of the three cases, was a choice.

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
