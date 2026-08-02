# The Third Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 630,000 read as a chapter, and its transaction 1
> (of 3,134) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β1 ■1 §1 (Volume IV, Book 1, Chapter 1, section 1)
- **Block:** 630,000 — The Third Halving
- **Block hash:** `000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d`
- **Transaction id:** `cc2ca076fd04c2aeed6d02151c447ced3d09be6fb4d4ef36cb5ed4e7a3260566`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=cc2ca076fd04c2aeed6d02151c447ced3d09be6fb4d4ef36cb5ed4e7a3260566

## Chapter frontispiece — block 630,000

Block hash, as prose: ⌘¹⁷⁸ *Our sir absorb accident. Our ban are hungry. Tax get lip into the hungry glass. Jet may extend alien. Theme attract to submit via rack. Piano may maze our reject. Its legal bubble enrich nod. The dig may avoid.* ⓪⁷⁸

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁰ Cow absorb its absurd. Nod vanish toss to girl. The cut apology see an oven. A ready art include a social emotion to dash. Our rich success may convince a coin. Son govern the gym. ⓪⁷⁶
  - hex: `0000000000000000000d656be18bb095db1b23bd797266b0ac3ba720b1962b1e`
- **merkle root:** ⋔ An abandon are absurd. Hat far alter anxiety. Our afraid aspect are jealous. Our glide are electric to coil. Our actress may add a cat for our lie. Yes include bunker to cloud. Water catch drum for an annual now for woman. A stone curtain is low.
  - hex: `b191f5f973b9040e81c4f75f99c7e43c92010ba8654718e3dd1a4800851d300d`
- **timestamp:** 2020-05-11 19:23 UTC
- **difficulty target:** β₇₅ < 1145401×256²⁰ — the block hash above reads below this target — nBits 17117a39 — mantissa 1145401 (163·7027) shifted up 20 bytes: the target 000000000000000000117a390000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 16,104,807,485,529 (relative to the genesis block)
- **nonce:** η 2·5·230218297

## § 1 — The Third Halving

Transaction id, as prose: ⌘²⁵⁶ *Abandon may set accident to coral. Its endless elephant later control a pop coast. Target start its pet usage. The new bar may tell sail. A nod away live the act. Its hunt set hill. Lottery exist our robust level. Office tax to lay.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■630000η3³ “Mined by AntPool” Our above abuse maze example. The foster rub alone see mosquito. Brush may protect cigar. Sting ought set opera to surge. Prison ski a crystal biology per sunset. Monitor is popular to the aerobic term. Payment out get a glove. Each guy receive census. Output yet scan its monster giggle. Our slight symbol may neglect to provide. Cow identify to breeze per amount. ⓪⁷ η3²·179·267214182982529
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 7.15968084 ₿
  - script: ⧉ ⌖ h²⁰ Absurd set our absurd mom to a weird book. Some bed is hidden. Armor train stick to quantum. The hollow rely an unable force. Token coin cactus to due. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon may abuse increase to title for an ordinary skill. Globe venture hen to danger. Olive involve spread via fruit for a ear. Out may quit drink. Vacuum are capable to wood via the room. Envelope render some candy. Yes defy cover to set.
- **output 3:** 0 ₿
  - script: ¶ ³⁶ Ability accuse to pay. A someone. Egg surge some wage to attitude. A wild leader fog wagon via pen out pond. Pluck may believe a cricket to trap. Its aerobic input slot a bargain. Lounge far debate a lucky carpet. Baby vapor the clever lie.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

6.25 coins from this block on, 11 May 2020, shown in the coinbase's output value. The block opens Volume IV. Same arithmetic as the two halvings before it: 630,000 is the third multiple of 210,000, so the amount halved — no decision was taken in 2020 for a node to check.

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
