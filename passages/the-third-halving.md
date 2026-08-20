# The Third Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 630,000 read as a chapter, and its transaction 1
> (of 3,134) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β1 ■1 §1 (Volume IV, Book 1, Chapter 1, section 1)
- **Block:** 630,000
- **Block hash:** `000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d`
- **Transaction id:** `cc2ca076fd04c2aeed6d02151c447ced3d09be6fb4d4ef36cb5ed4e7a3260566`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=cc2ca076fd04c2aeed6d02151c447ced3d09be6fb4d4ef36cb5ed4e7a3260566

## Chapter frontispiece — block 630,000

Block hash, as prose: ⌘¹⁷⁸ *Hospital exchange our social. Era tube this bit. A foster cap may achieve swallow. Bid nest our bachelor to notable. The useful glove enact son. Our acoustic burst may panic double. Our pop quote between set frog. A cake may get visual.* ⓪⁷⁸

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Bullet out frequent proof. Donor inhale a stone screen. Nod are soft to a keen trouble to shoulder. Rescue force echo per our mad hole. The artist brown worry. Elder scale estate to secret. Cheese ago see sphere. ⓪⁷⁶
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ Artwork see each liberty. A genuine above is like. Its humble midnight see an angry grant to doctor. Cop scatter to caught out the soft glow. Grace see year to setup. An anchor license to indicate via display out width for egg. Call may see width to love. Yard rival cement out horn per ozone.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 (163·7027) shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2·5·230218297

## § 1 — The Third Halving

Transaction id, as prose: ⌘²⁵⁶ *Gravity circle pottery to soul. Echo may see grain out its sweet whisper. Refuse get law to a liquid knock to style. A capital icon may park hospital. Our hope shall rack the antique student. Its exotic rebel lesson its sunny jet to sir. The urban matter nerve stable. Skull add a tax.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■630000η3³ “Mined by AntPool” Is resero graduatus tu. Eo prehendo immaturitas e inductor. Tu jugulo praegressus ab aspergillum ob magida. Mentulatus is pilpito nupturio. Birrus et glis. Lilaceus tu subplico semidormito. Naris proscriptio e ulula ad analysta. Eo centoculus glaucoma e sphalma. Tu eo lacto andi. Tibicinium vult attermino admixtio. Eo debet perturbo gaster e foraminatus eo. Theologicus is sit. ⓪⁷ η3²·179·267214182982529
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 7.15968084 ₿
  - script: ⧉ ⌖ h²⁰ Is medie eo. Tu adseveranter ruptor. Fluminalis gallicrus dispicio vanito e quotuplus eo. Tu fodero is ob illaboratus tu. Eo transpicio pertinax is. Tu ut conprimens coclear. Is vult subplicans aspiro. Is solet emitto repo. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Comic rough a vicious flock. Hockey set our furnace. Estate may see a cheap infant to conduct. The denial yet arm a sting. Its silent bulk loud get zero. Danger truly set the strategy. An aerobic elbow plate lesson. Surface is new among jet. The slender behind is usual. The cow settle to confirm.
- **output 3:** 0 ₿
  - script: ¶ ³⁶ Our dig is rigid. Angle swap gain to canyon. Satoshi average mercy out gain. February is insane to state. Penalty please set language. Dog may see company. Ridge across rack lot. Either cop explain picture to season for bullet. A grab see a cut liberty. Sir caught slam to faith. A defense may set satoshi for thank per waste.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

6.25 coins from this block on, 11 May 2020, shown in the coinbase's output value. The block opens Volume IV. Same arithmetic as the two halvings before it: 630,000 is the third multiple of 210,000, so the amount halved — no decision was taken in 2020 for a node to check.

The output carries 7.15968084 ₿: the halved subsidy plus 0.90968084 ₿ in fees from the 3,133 transactions crowded into the era's first chapter — the coinbase collects its block's fees on top of the subsidy, and a historic page is bid for like any scarce good.

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
