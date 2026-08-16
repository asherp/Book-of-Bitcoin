# First BRC-20 inscription

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 779,832 read as a chapter, and its transaction 408
> (of 1,860) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β75 ■649 §408 (Volume IV, Book 75, Chapter 649, section 408)
- **Block:** 779,832
- **Block hash:** `000000000000000000015712838394aeb93f5d45d0e5bec197382c08b375016e`
- **Transaction id:** `b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=b61b0172d95e266c18aea0c624db987e971a5d6d4ebc2aaed85da4642d635735

## Chapter frontispiece — block 779,832

Block hash, as prose: ⌘¹⁷⁷ *A host arm its holiday. The aware seminar see episode. Our alone syrup may space our cliff to exit via infant. A true dove arrange enough absurd. Its base chief may slot gas.* ⓪⁷⁹

- **version:** vtotalus pulp — block version 0x2b5d8000 — BIP9 version-bits form; version-rolling bits 0x5aec (BIP320 scratch entropy) as totalus pulp; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ Aid may announce much march to knee. Spin may get chief. Donor later marble a hot mushroom. Cow arrive will to object. The son is outer. A capable dignity adapt benefit. Our bit real ignore the useless guy. ⓪⁷⁸
  - hex: `00000000000000000003f079883a81997d3238b287ea53904f1ecd3d1f225209`
- **merkle root:** ⋔ Sir achieve crew to dune out elevator. Blood yet type device. Sky may say to sign. Cow undo to hold. Damage exchange rescue out system for planet. Bit enable lake to assist via code to link via hospital. Its aid is unusual. Our able cow may remain guilt. Despair could set a pot.
  - hex: `90fbdb20881637944f492f35776eeb841bb29d5dc8ff2d8fd77ff1231069c601`
- **timestamp:** 2023-03-08 04:16 UTC
- **difficulty target:** β₇₇ < 428451×256²⁰ — the block hash above reads below this target — nBits 170689a3 — mantissa 428451 (3·17·31·271) shifted up 20 bytes: the target 0000000000000000000689a30000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 43,053,844,193,928 (relative to the genesis block)
- **nonce:** η 2·5²·73·380797

## § 408 — First BRC-20 inscription

Transaction id, as prose: ⌘²⁵⁶ *Crystal may roast a slender lot. Yes sing its jet. The easy cut is unable to reward. The fiscal example set helmet. Effort confirm trumpet to horn. Narrow may staff a puppy. Pop sell another sad now above human. Scare later get essence. Some curve set lip.*

- **version:** 1
- **input 1:** spends output 0 of `a321c61c83563a377f82ef59301f2527079f6bda7c2d04f9f5954c873f42e8ac`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.00010000 ₿
  - script: ① p³² Wadium praeloquor accongero e crobylos. Deliciosus crimen marcius is. Tu ut subligo adsumentum. Tu vult similiare intersum. Is carino e narthecium. Eo subintroeo derosus juglans. Cabo e sus. Rationale ex dentalia.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s A hire also get die. A someone. Cop omit garment to a hub for a noise. Any creek surprise claw to demand via pelican. Some spider see tuna to future per math. Wedding wild express paddle. Turkey proof loan to attitude. Law may see health. Any stomach ought mean clap. End only prefer the base message. Bit ahead report offer. Lot may bless citizen to head. Guy once set hobby. Base get a daring. Cactus flip to rocket. Its new lip may remove scale. · t p³² Owner are drastic to hour. Row begin cry per region. The left oval stamp to decorate. Fire set balcony for uncle. Essay due get a pop injury. A rigid guy educate sin. Cow may inflict to devote. Voice unfold pen out a fringe scare out impact. Box may scare row. ∇ ⓪ ⟨ ³ “ord” 1 ²⁴ “text/plain;charset=utf-8” ⓪ ↧⁹⁴ “{   "p": "brc-20",  "op": "deploy",  "tick": "ordi",  "max": "21000000",  "lim": "1000"}” ⟩ · c vc0₁ p Owner are drastic to hour. Row begin cry per region. The left oval stamp to decorate. Fire set balcony for uncle. Essay due get a pop injury. A rigid guy educate sin. Cow may inflict to devote. Voice unfold pen out a fringe scare out impact. Box may scare row.

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
