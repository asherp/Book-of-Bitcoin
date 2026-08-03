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

Block hash, as prose: ⌘¹⁷⁸ *Sir absorb access to a vital set. Rub since price cry. Plunge sing weather to icon. A toy program gossip injury. Blouse due impact token. Shove blossom our lap to cop.* ⓪⁷⁸

- **version:** vaccio raccoon — block version 0x2c100000 — BIP9 version-bits form; version-rolling bits 0x6080 (BIP320 scratch entropy) as accio raccoon; no soft-fork signals
- **previous block:** ⌘¹⁷⁹ Yes absorb accident to drill. Cop pave its waste. Grant are supreme to a tenant. Notable may get person out skill. Our auto audit reflect object. Fabric edge army to chimney. ⓪⁷⁷
  - hex: `000000000000000000050c325a1430438b073e4c59a3b4c4f7b35bd67b865e68`
- **merkle root:** ⋔ Abandon may set an acid lady. Estate slow target walk. A keen nod is proud. A skull see palace to skin. Spy how waste tie. Its nod is sudden. A fresh stable scrub sock. Frog enter lie around congress. Silk too see oxygen.
  - hex: `f224325ec2b0a574c1d9c19e3617b17baf692ae7d3ca666d1eeddf1de63591ef`
- **timestamp:** 2023-09-10 17:10 UTC
- **difficulty target:** β₇₇ < 340654×256²⁰ — the block hash above reads below this target — nBits 170532ae — mantissa 340654 (2·170327) shifted up 20 bytes: the target 0000000000000000000532ae0000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 54,150,142,369,480 (relative to the genesis block)
- **nonce:** η 2⁸·61·15913

## § 2 — The 19.82 BTC fee

Transaction id, as prose: ⌘²⁵⁶ *Abandon set its acid twist to demand per the humble donor. Its cow depart yes. An afraid lot together renew the cousin. Our road are gentle. Cop remove to quit. Wink why measure buzz. Trophy breeze to make per seven. Phone reject to deny.*

- **version:** 1
- **input 1:** spends output 0 of `db1934b591295d483e0264a5200f43ebcd6a208f5f380af868d2ccf9a3d57b7c`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.06595313 ₿
  - script: ⓪ h²⁰ An absurd absurd today fruit love. Cow prevent to foster out ban. Its popular quiz are loyal. Sir reopen language to weapon. Weather is police for a gasp out length per fyi.
- **output 2:** 0.00256543 ₿
  - script: ⧉ ⌖ h²⁰ Absurd account vote to a town. Our spread sustain senior. Swift how excuse hood. Our orange is raven among use. Dig almost marble scale. ≡ ∇
- **output 3:** 0.00207202 ₿
  - script: ⧉ ⌖ h²⁰ Our absurd map may accuse nod. Our ban later see some basket. Leopard set our vessel to wine. Our fatal feed option volcano. Flag set hero to flush via demand to child via theme. ≡ ∇
- **output 4:** 0.00193031 ₿
  - script: ⓪ h²⁰ Its absurd account vocal. Order glue clap to rookie via noodle. Cop provide an only meat. Wink may see media. Cop betray actor to region. Gas may see rub.
- **output 5:** 0.00153351 ₿
  - script: ⧉ ⌖ h²⁰ Our absurd accident are vague. A fragile fyi is sudden. Its armed rug may tackle risk. Water get lawsuit to genius for primary. Kid reform relief to abandon. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Abandon may access duck to a peasant helmet. The volcano help to adjust. Scale tattoo our tip. Axis is walnut to its base text. Foot execute to expand. Life rack to hammer. Rescue set example via wedding. Brown may forward math. Guy make milk to three. A low story are giant. Guy may destroy an initial action. Rub may join exhaust. Minor set mule to sheriff for labor. Cow agree a stable fox to some food. Antenna waste reform for lens. · p Hit about get our absurd. Its bit are aware. Bargain recycle to verify. Pot adjust design for token. Each pop cram some road. Pop wrestle device to the wet car. Some cloud middle sausage. The lap out prosper a spread. Son join to forget. Its bottom critic is casual. Warfare may set yes.

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
