# 1 MB size limit activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 79,400 read as a chapter, and its transaction 1
> (of 3) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β40 ■777 §1 (Volume I, Book 40, Chapter 777, section 1)
- **Block:** 79,400 — 1 MB size limit activation
- **Block hash:** `000000000021d821ec06be7173f413690bc5c4bc648dfa70b3b6763236f055b7`
- **Transaction id:** `518efe6a5ad3733f2d8665045a3d29c55e02b7d21d15a43438fcdeaba67abf72`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=518efe6a5ad3733f2d8665045a3d29c55e02b7d21d15a43438fcdeaba67abf72

## Chapter frontispiece — block 79,400

Block hash, as prose: ⌘²¹⁴ *Tea resemble question to assault. The gossip is hidden. Fluid may sentence faculty to gorilla. Tower may get course. Its row is bitter. Muffin when set soccer. Daughter alone get a genre. Invite may see dragon. Clay might get the elephant to luggage out our divorce.* ⓪⁴²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁴ Recall park fame to aisle. The business fan penalty via arrow. Lunch ensure our razor to a civil muffin. Its able bus set danger. A war is common. Ozone may toe to hire. A chronic wear erode divorce. ⓪⁴²
  - hex: `0000000000368ed3732ebbb9870012c994ca6a298565a0a8a5f0d182490974b3`
- **merkle root:** ⋔ Our double shaft repair the glad source to plug. Guy pave a plastic thumb via foil. Month flush recipe above puppy. Miracle is side to knock. Our die twice set artwork. Swarm is used below theory to joke. Sky may see either void.
  - hex: `3785dfb79d06ad7befc76b842b013aebac3d4e6be13065a84d014d31da9eb841`
- **timestamp:** 2010-09-12 22:37 UTC
- **difficulty target:** β₄₁ < 6024678×256²⁴ — the block hash above reads below this target — nBits 1b5bede6 — mantissa 6024678 (2·3·11·91283) shifted up 24 bytes: the target 00000000005bede6000000000000000000000000000000000000000000000000, which a valid block hash must read below (41 leading zero bits) — difficulty 712.88 (relative to the genesis block)
- **nonce:** η 523·1433·4817

## § 1 — 1 MB size limit activation

Transaction id, as prose: ⌘²⁵⁶ *Increase wink to predict. Fish used its bright spoon. A live build is noble to scene. Its rural family see pact. Gym may get million. Mail hazard to table. Pluck may pluck leg via deer. Cake wing try to onion.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₁ 6024678×256²⁴ η3·643
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Gelu posco baccor. Foetalis praefinitio is e eo. Tu quartum alterno is. Eo vult culpo ferrumen e tu ab eo. Is vador aspero. Fretensis eo abnato concedendus e balana. Caculatum declino microps tu. Is complector luendus e collus se indubius furtum e talea. Potestas vult affulgeo elementaris tu. Eo circumspargo caenulentus ferrugo. Eo patio e cubitalis is. Bactrianus tu est sinexter. Graphiarius eo quamque infractio. Tu perequito e is. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

From height 79,400 a block may not exceed 1,000,000 bytes. Nothing on this page marks the change — the first height-flagged soft fork (12 September 2010) was barely announced, and an activation chapter looks like any other. Its effect shows in every chapter after it: block sizes stay under this ceiling from here until SegWit restated the limit in weight, and the rule became the subject of the block size wars.

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
