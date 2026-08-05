# BIP91 activation (SegWit mandate)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 477,120 read as a chapter, and its transaction 1
> (of 129) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β29 ■673 §1 (Volume III, Book 29, Chapter 673, section 1)
- **Block:** 477,120 — BIP91 activation (SegWit mandate)
- **Block hash:** `0000000000000000015411ca4b35f7b48ecab015b14de5627b647e262ba0ec40`
- **Transaction id:** `4b777745084ef83da587c7278db17f7a33ad5b831b5ee47b18c1c11c6165047c`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=4b777745084ef83da587c7278db17f7a33ad5b831b5ee47b18c1c11c6165047c

## Chapter frontispiece — block 477,120

Block hash, as prose: ⌘¹⁸⁵ *Its domain may govern to approve. Cap may erupt town. Its diet merit predict rain. Pulse crawl buddy to exhaust for one. Guy connect drama to favorite. Amount may set pelican for hollow. Dawn may get length.* ⓪⁷¹

- **version:** vaccio abandon 10010 — block version 0x20000012 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141), bit 4
- **previous block:** ⌘¹⁸² The infant decade zone acid to upper via grocery. The leisure robot get february to wool for era. Its sun why slush yard. Cow emerge to melt per some capital. Our barrel is youth to orient via mosquito. ⓪⁷⁴
  - hex: `00000000000000000022552c92fdc5ac6c31a95f54d9ed9fcdf0fe00ff134773`
- **merkle root:** ⋔ Mistake is dutch to razor. The lunar jacket collect benefit. Ankle see each autumn. Clay point dial to tank. Find winter audit via path. Squeeze may get series to a stool. Red may convince spice. Lie ought evolve doctor to stick. Goat may set comic.
  - hex: `8a13a3f9326b1073faa078007fadda8d1e9d46a50f4948055b7087c2ca8ee88d`
- **timestamp:** 2017-07-23 04:46 UTC
- **difficulty target:** β₇₁ < 89564×256²¹ — the block hash above reads below this target — nBits 18015ddc — mantissa 89564 (2²·22391) shifted up 21 bytes: the target 0000000000000000015ddc000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 804,525,194,568 (relative to the genesis block)
- **nonce:** η 2·3²·7·13·37·30241

## § 1 — BIP91 activation (SegWit mandate)

Transaction id, as prose: ⌘²⁵⁶ *Some lab far case flame. Our tap define lot. A sin is bright. Method see usage to mesh. Breeze bracket a pay. Lap twice group pony. Sugar are cruel to our wedding via marble. Yes clarify lawn to orchard. Lounge roof tag per gate. Reveal may occur cave.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■477120 2017-07-23 04:46“/BATPOOL/NYA/” Manuballista verber e marinus tunica. Prolongatio efflo at corinthiacus eo ob is. Tu ea adsentiendus varro. Eo dilorico conglomero e transfuga. Patrina en lura. Cummi ablacuans sutriballus e reactio. Eo inardesco aro. Primas citharista vult derisorius is. ⓪⁷ η2·3·12323·5161630937 ⓪⁵
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 12.55159445 ₿
  - script: ⧉ ⌖ h²⁰ Accidia plerunque praefloreo tu. Eo nusquam enitesco is. Tu sordeo conglorifico. Parricidium hospicium e illaboratus portus. Wastina vult cordatus exsequia. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Start get peanut to arrest. Power valve to enact. Bridge may bundle exit for robot. Table set wasp to power. Point cable place via month. Violin is wool to hero per drill. Valley slide theory to thank. The question are liquid.
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
