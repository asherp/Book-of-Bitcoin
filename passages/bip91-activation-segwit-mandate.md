# BIP91/activation (SegWit mandate)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 477,120 read as a chapter, and its transaction 1
> (of 129) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β29 ■673 §1 (Volume III, Book 29, Chapter 673, section 1)
- **Block:** 477,120 — BIP91/activation (SegWit mandate)
- **Block hash:** `0000000000000000015411ca4b35f7b48ecab015b14de5627b647e262ba0ec40`
- **Transaction id:** `4b777745084ef83da587c7278db17f7a33ad5b831b5ee47b18c1c11c6165047c`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=4b777745084ef83da587c7278db17f7a33ad5b831b5ee47b18c1c11c6165047c

## Chapter frontispiece — block 477,120

Block hash, as prose: ⌘¹⁸⁵ *Each domain may govern to approve. Guy erupt town for diet. Merit predict to rain via pulse to crawl. Buddy exhaust our one pot. Bet may connect drama. The favorite might amount our zebra. Its glad bed may direct length. Some master ought term our focus to glue.* ⓪⁷¹

- **version:** vaccio abandon 10010 — block version 0x20000012 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141), bit 4
- **previous block:** ⌘¹⁸² Its infant decade out zone acid. Upper may see grocery. Leisure get robot to february out wool to era. Sun yet slush yard. Lip emerge to melt out capital to bonus. Dirt may get world. Its useless shaft set the crucial muffin to fuel. ⓪⁷⁴
  - hex: `00000000000000000022552c92fdc5ac6c31a95f54d9ed9fcdf0fe00ff134773`
- **merkle root:** ⋔ Mistake set its dutch razor. The lunar jacket collect benefit to an ankle. Autumn see clay per point for dial. Tank out find its winter audit. The path squeeze series to stool. A cut son convince to spice. Sir may evolve document via pencil per frown. Our bed is armed. Dilemma couch museum to the mad sir.
  - hex: `8a13a3f9326b1073faa078007fadda8d1e9d46a50f4948055b7087c2ca8ee88d`
- **timestamp:** 2017-07-23 04:46 UTC
- **difficulty target:** β₇₁ < 89564×256²¹ — the block hash above reads below this target — nBits 18015ddc — mantissa 89564 (2²·22391) shifted up 21 bytes: the target 0000000000000000015ddc000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 804,525,194,568 (relative to the genesis block)
- **nonce:** η 2·3²·7·13·37·30241

## § 1 — BIP91/activation (SegWit mandate)

Transaction id, as prose: ⌘²⁵⁶ *Lab may case flame. Aid define the bright method. Usage may mesh breeze. Bracket twice group each pony. Sugar are cruel to wedding per its marble. Yes too clarify lawn. Orchard how lounge roof. A tag gather a sorry pattern to access for anger. A now far decline video.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■477120 2017-07-23 04:46“/BATPOOL/NYA/” Manuballista verber. Marinus tunica prolongatio. Eo efflo corinthiacus is. Tu vult adsentiendus varro. Tu dilorico conglomero e transfuga. Patrina lura se cummi. Is ablacuans e sutriballus ob reactio e eo. Tu inardesco aro. Eo adlicio spiramen e dierectus fusa. Flavus is publico alcalinus eo. ⓪⁷ η2·3·12323·5161630937 ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 12.55159445 ₿
  - script: ⧉ ⌖ h²⁰ Accidia plerunque praefloreo eo. Is nusquam enitesco tu. Is sordeo conglorifico. Parricidium ut hospicium. Illaboratus portus fenarius vacca. Derisorius is foeliciter jubeo altar. Dilectio tu e is ab eo. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² The start set peanut. Arrest is power to valve. Guy enact our bridge per bundle for exit out robot. The table set wasp. Its power point cable place. Month see violin to wool. Hero drill valley per slide. Tea there see potato. A noodle pond pull. Son evoke to know. Yes inflict each son.
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

From 22 July 2017 signaling for SegWit was briefly mandatory: a block that did not set bit 1 was rejected, squeezing BIP141 over its own 95% threshold. A transient rule, spent the moment SegWit locked in, and a soft fork all the same — the chain has a few of these, rules that existed only long enough to force a decision.

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
