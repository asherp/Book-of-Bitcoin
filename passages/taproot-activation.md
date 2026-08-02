# Taproot activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 709,632 read as a chapter, and its transaction 2
> (of 2,043) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β40 ■1009 §2 (Volume IV, Book 40, Chapter 1009, section 2)
- **Block:** 709,632
- **Block hash:** `0000000000000000000687bca986194dc2c1f949318629b44bb54ec0a94d8244`
- **Transaction id:** `777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288

## Chapter frontispiece — block 709,632

Block hash, as prose: ⌘¹⁷⁹ *Sin may absorb access. Catch ought get nature. Our cap is fatal. Agent follow conduct to lunch. Mail far medal son. Our lazy logic may cave mimic. Boy see each daring. Mandate may copy bet.* ⓪⁷⁷

- **version:** vaccio letter 100 — block version 0x20200004 — BIP9 version-bits form; version-rolling bits 0x0100 (BIP320 scratch entropy) as accio letter; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Dig may absorb to achieve. Grass cover trip per negative. Label stamp each mystery. Orchard may inflict fade. Faculty taxi blade to negative. Liquid may damage each amount. ⓪⁷⁹
  - hex: `000000000000000000013712fc242ee6dd28476d0e9c931c75f83e6974c6bccc`
- **merkle root:** ⋔ Abandon set accident to our satoshi. Bit may agree its mobile. Tie may invest today. An absent cube ago get the kind copper. Foil get bean to frog. Meadow egg segment via trophy. Reunion is jealous to space. Above amount some urge. Essence out set each map.
  - hex: `6ada3b10082068de09f7e819b65113d3c58969fd857aab2980c65f374714ec77`
- **timestamp:** 2021-11-14 05:15 UTC
- **difficulty target:** β₇₆ < 813546×256²⁰ — the block hash above reads below this target — nBits 170c69ea — mantissa 813546 (2·3²·45197) shifted up 20 bytes: the target 0000000000000000000c69ea0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 22,674,148,233,453 (relative to the genesis block)
- **nonce:** η 2·3·11·151·141511

## § 2 — Taproot activation

Transaction id, as prose: ⌘²⁵⁶ *Abandon account ecology to month. Celery may set matrix. Track stage our correct fence. Sir reopen three to casino per lake. Float set its soda to level. Error is common out panel. Nut set a true row. Our select grass see moment.*

- **version:** 2
- **input 1:** spends output 0 of `bed322446b458193f83e5cdb861b697219f82fa46938f0a49fbf6d801c119dfe`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00030000 ₿
  - script: ① p³² Abandon may see accident to critic. Wash yet see chest. Lab may believe supreme. Its wide rub is bitter to our red. Its pay is nuclear. Medal see era to the entire organ to winner per tent. A blanket stone labor dune. Lap soon lounge flight. Wrist yes get tie.
- **output 2:** 0 ₿
  - script: ¶ ¹⁵ “gm taproot 🥕”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Abandon is absurd to attack. Magic may subject infant via sample. Lot may enjoy attack to reject. Each canyon inspire latin out its actual minor. Mouse may dog denial. A fossil pole remind egg. Son make to feed. A various estate may set acid. Pilot truck some cake. Raise depart pulse to half. Lawsuit may set stool for october per speed. Length due set diamond. Its same history may chalk hat to foot. Its movie measure elevator. Nod then set tie. · p Sin about see the absurd blame. A tap may cancel skill to its rubber. An innocent ring addict citizen. Clerk get its high audit to barrel. Regular group a timber. A crisp grab farm bid. Bed may detect color. Foot not ring minimum.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

An early Taproot payment, mined the moment the rules went live — the citation resolves into the activation chapter at its own §section. From here an output can be a single thirty-two-byte key standing for either a signature or a whole tree of scripts, and a spend reveals only which route it took (the book draws the reveal ⋔, a leaf's path through the tree). It is the first upgrade whose main achievement is that most spends now say less.

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
