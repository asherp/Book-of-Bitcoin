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

Block hash, as prose: ⌘¹⁷⁷ *Host may arm holiday. Our aid is aware. Seminar may set episode. An alone syrup space a cliff to exit. Its infant is true. Dove may arrange enough absurd bone toward pudding to abandon. Its vivid second fatigue a feel.* ⓪⁷⁹

- **version:** vtotalus pulp — block version 0x2b5d8000 — BIP9 version-bits form; version-rolling bits 0x5aec (BIP320 scratch entropy) as totalus pulp; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ The son announce much march. Its knee spin chief. Each donor later marble a rid mushroom. Guy arrive to will. Each object is outer out lap. A capable dignity adapt burden. Industry ball a mosquito. Our amateur apology may tip to fetch. ⓪⁷⁸
  - hex: `00000000000000000003f079883a81997d3238b287ea53904f1ecd3d1f225209`
- **merkle root:** ⋔ Sir achieve crew to dune. Elevator may set blood. Type might get device. Its son say sign. Sir undo hold to damage. Exchange may rescue system via a planet. Cap may enable lake. Assist code some link to hospital. Bet is unusual about a secret. Its funny book see a keen due. Guy join gesture to doll.
  - hex: `90fbdb20881637944f492f35776eeb841bb29d5dc8ff2d8fd77ff1231069c601`
- **timestamp:** 2023-03-08 04:16 UTC
- **difficulty target:** β₇₇ < 428451×256²⁰ — the block hash above reads below this target — nBits 170689a3 — mantissa 428451 (3·17·31·271) shifted up 20 bytes: the target 0000000000000000000689a30000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 43,053,844,193,928 (relative to the genesis block)
- **nonce:** η 2·5²·73·380797

## § 408 — First BRC-20 inscription

Transaction id, as prose: ⌘²⁵⁶ *A crystal may roast each guy to a slender lot. Sir may sing pot. The easy ban is unable. A reward is fiscal. Example may set helmet to an effort. Cop confirm trumpet via each horn per narrow for staff. Puppy sell another sad now. Our above human scatter lie. Its pie apart get the inquiry. A because. Each laptop is cheap. Defense may set primary.*

- **version:** 1
- **input 1:** spends output 0 of `a321c61c83563a377f82ef59301f2527079f6bda7c2d04f9f5954c873f42e8ac`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.00010000 ₿
  - script: ① p³² Wadium vult praeloquor accongero. Crobylos deliciosus crimen. Marcius is subligo adsumentum. Tu vult similiare intersum. Tu carino narthecium. Is vult subintroeo derosus juglans. Cabo alce. Donarium vult pissiare timefactus eo. Is tamen cruciarius. Tu vult inceleber eo.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s A hot hire also get sky. A someone. Pop omit each garment to hub. Noise see any creek. Surprise claw demand to pelican. Spider set tuna out the future math. A wedding wild express paddle to turkey out proof. Loan set the attitude to law for health. Any stomach mean to clap. End only prefer our base. Message ahead report offer. A guy may bless citizen to its head. Lip once set hobby. A base daring see the cactus. Jewel rough course to divorce out prison. Ship get candy to fossil. Ranch may force a glare. · t p³² The owner is drastic. Hour may begin cry. Region would set left to oval per stamp. Cop decorate fire to balcony. Uncle may essay injury. Its rigid cow educate to inflict. Nod far devote each voice. Pie unfold pen to some fringe. Lie may scatter dig. Cap almost cart some total. A proof may permit the funny due. Each fyi are rural. ∇ ⓪ ⟨ ³ “ord” 1 ²⁴ “text/plain;charset=utf-8” ⓪ ↧⁹⁴ “{   "p": "brc-20",  "op": "deploy",  "tick": "ordi",  "max": "21000000",  "lim": "1000"}” ⟩ · c vc0₁ p The owner is drastic. Hour may begin cry. Region would set left to oval per stamp. Cop decorate fire to balcony. Uncle may essay injury. Its rigid cow educate to inflict. Nod far devote each voice. Pie unfold pen to some fringe. Lie may scatter dig. Cap almost cart some total. A proof may permit the funny due. Each fyi are rural.

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
