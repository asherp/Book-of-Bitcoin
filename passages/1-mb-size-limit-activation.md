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

Block hash, as prose: ⌘²¹⁴ *The tax resemble question to assault. Gossip set a hidden fluid per sentence. Faculty may see gorilla to our tower via course. Our bitter muffin see yes. Tap when set soccer. Its daughter alone get genre. Invite see dragon to diary. Session may educate length per brother. Table may dawn to leaf.* ⓪⁴²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁴ Recall park fame to aisle. Business fan our penalty. The arrow lunch to ensure for razor. Some bet is civil. A muffin are able. Bus may see the danger. Our common ozone toe hire to disease. Yes know mom per length. A boat account soda to trigger. ⓪⁴²
  - hex: `0000000000368ed3732ebbb9870012c994ca6a298565a0a8a5f0d182490974b3`
- **merkle root:** ⋔ A double shaft repair the glad source. Plug may pave plastic. Thumb foil month to flush. Recipe above see its puppy. Miracle due side our knock. Tea twice see its artwork. Our swarm is used below tie. Out there get aunt. The leader may source matrix. A cow could enact an unusual sin to the silent bed.
  - hex: `3785dfb79d06ad7befc76b842b013aebac3d4e6be13065a84d014d31da9eb841`
- **timestamp:** 2010-09-12 22:37 UTC
- **difficulty target:** β₄₁ < 6024678×256²⁴ — the block hash above reads below this target — nBits 1b5bede6 — mantissa 6024678 (2·3·11·91283) shifted up 24 bytes: the target 00000000005bede6000000000000000000000000000000000000000000000000, which a valid block hash must read below (41 leading zero bits) — difficulty 712.88 (relative to the genesis block)
- **nonce:** η 523·1433·4817

## § 1 — 1 MB size limit activation

Transaction id, as prose: ⌘²⁵⁶ *Some increase wink to predict. The fish is used. Its bright spoon may live build. A noble ought see our scene. A rural family set pact to a gym. Million mail hazard per table. Pluck pluck leg to deer for call. Its million spare satisfy tower to spring. The spawn yet foam its cop.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₁ 6024678×256²⁴ η3·643
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Gelu vult posco baccor. Foetalis praefinitio est. Tu quartum alterno is. Eo culpo ferrumen. Is vador aspero. Fretensis tu vult abnato. Eo concedendus balana e caculatum. Tu declino microps is. Eo complector luendus. Collus indubius furtum. Talea potestas e tu de is. Eo vult affulgeo elementaris eo. Is circumspargo caenulentus ferrugo. Eo patio is e cubitalis tu. Bactrianus eo sinexter is. Graphiarius tu nundinor querquedula. Tanos humilitas. Diaetarius costum. Mirmillo valentia. ∇
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
