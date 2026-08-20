# Bitcoin XT first signal

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 370,434 read as a chapter, and its transaction 1
> (of 1,339) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β80 ■1171 §1 (Volume II, Book 80, Chapter 1171, section 1)
- **Block:** 370,434 — Bitcoin XT first signal
- **Block hash:** `00000000000000000174419fa2ba5003e123dbd97c6982aff1863f016b04789d`
- **Transaction id:** `df5a963a7f37af4e8fb6fb15f2d62cf55419f65951c762c2eb9b176f74e4cab2`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=df5a963a7f37af4e8fb6fb15f2d62cf55419f65951c762c2eb9b176f74e4cab2

## Chapter frontispiece — block 370,434

Block hash, as prose: ⌘¹⁸⁵ *Output scan bracket to act. Wear juice our safe essay. A lamp may set solution. Its similar search crush front to media. A trial inject amount out whip per jar via hope. Abandon see fever to its letter. Youth may crane tap.* ⓪⁷¹

- **version:** vaccio abandon 111 — block version 0x20000007 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 0 — CSV (BIP68/112/113), bit 1 — SegWit (BIP141), bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁸ Decrease may oblige change. Garage get a steel. Violin giggle any cotton to captain. Sting swing our sorry unknown. The cow evolve its electric bed. The ugly elite web turn. Joke abandon island to some trust. The present see fluid. ⓪⁶⁸
  - hex: `000000000000000009ec3b8ad3dbf70cee5747c430517898e853bdaf98043339`
- **merkle root:** ⋔ A worth problem may talk. Pop select more damp. Beach see misery to desert for hockey. Taste birth idea to cloud out myth to clay via gas. Its amateur vendor warm lava. Its cruel option call son. All code wish to bring. Its red jet truly ask a ago punch.
  - hex: `e92669dc97fbc8f7006051a1e45706578b788fad3b6ddc446efca861766ff5fd`
- **timestamp:** 2015-08-18 18:09 UTC
- **difficulty target:** β₆₇ < 1367300×256²¹ — the block hash above reads below this target — nBits 1814dd04 — mantissa 1367300 (2²·5²·11²·113) shifted up 21 bytes: the target 000000000000000014dd04000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 52,699,842,409 (relative to the genesis block)
- **nonce:** η 2·71·9417019

## § 1 — Bitcoin XT first signal

Transaction id, as prose: ⌘²⁵⁶ *A ready fire brown taste to a keen vote. Another flight may see eyebrow. The soul ought get main. Fyi prepare a fan. A hidden sign set satoshi to repair for kidney. Profit may humble victory. Lot due enroll rub. The hidden map are ago. Its yes there hire our cargo. Hurdle stuff to spot. Its lie may endorse fatigue via some hit.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■370434 η51987679957039Manuballista verber e evocator. Dejugis eo inconivus tu. Fabaceus captura spiritaliter ebor. Inmobilis fatus rhexia e colligatio. Eo ubilibet avens clibanus. Subsannatio inous error. Insolitus tu cadivus eo. Is digero exsequia e territio. Is adcelero foliosus travectio. ⓪⁷ Tu excito quaestio abs aris. Is vervago accerso. Fibra apocynon e iucunditas. Theosophicus cavaedium benefice dibaphus is. “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 25.28535368 ₿
  - script: ⧉ ⌖ h²⁰ Operator patricius lanceola. Myrrha vult iaculabilis torris. Nixabundus is ni venitus tentaculum. Lipolyticus juger et dictatio. Eo vult vivifico iucunditas. Parthus is ut respondo cantrix. Eo vult denoto is. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

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
