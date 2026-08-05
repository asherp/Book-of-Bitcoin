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

Block hash, as prose: ⌘¹⁸⁵ *Output may scan bracket to act for wear. Each juice is safe. Essay set lamp to solution. The similar search crush a front media. Trial inject to amount for police to junior. A goat may abandon to eat.* ⓪⁷¹

- **version:** vaccio abandon 111 — block version 0x20000007 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 0 — CSV (BIP68/112/113), bit 1 — SegWit (BIP141), bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁸ Decrease oblige change to garage per steel. Violin giggle any cotton to captain. Sting may swing dig. A sorry unknown evolve pie. Our red is electric. An ugly elite pink its tool. Illness may abandon fyi to a son. ⓪⁶⁸
  - hex: `000000000000000009ec3b8ad3dbf70cee5747c430517898e853bdaf98043339`
- **merkle root:** ⋔ Worth get problem to talk. Son select more damp out beach. Misery desert hockey to taste per birth to idea per cloud. Myth set clay to gas via amateur. A vendor not warm a lava. A cruel option may get our cake. Pay may imitate behind suit.
  - hex: `e92669dc97fbc8f7006051a1e45706578b788fad3b6ddc446efca861766ff5fd`
- **timestamp:** 2015-08-18 18:09 UTC
- **difficulty target:** β₆₇ < 1367300×256²¹ — the block hash above reads below this target — nBits 1814dd04 — mantissa 1367300 (2²·5²·11²·113) shifted up 21 bytes: the target 000000000000000014dd04000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 52,699,842,409 (relative to the genesis block)
- **nonce:** η 2·71·9417019

## § 1 — Bitcoin XT first signal

Transaction id, as prose: ⌘²⁵⁶ *Son ready our fire. Brown taste a keen vote. Another flight see eyebrow. Its soul is main. Our sky prepare fan. The hidden sign see its satoshi to repair per kidney. A profit are humble to victory. A son enroll a hidden theory. Brand may get a brass energy.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■370434 η51987679957039Manuballista verber e evocator. Dejugis tu sit inconivus. Fabaceus captura spiritaliter ebor. Inmobilis fatus vult rhexia. Colligatio ubilibet avens eo. Clibanus et subsannatio. Inous error ne insolitus laesio. Is vult adsolo e eo. Igitur. ⓪⁷ Eo excito quaestio abs aris. Eo vult vervago accerso. Acula diiudico vitatio. “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 25.28535368 ₿
  - script: ⧉ ⌖ h²⁰ Operator patricius lanceola. Myrrha iaculabilis torris. Nixabundus tu venitus tentaculum. Lipolyticus juger cynomia. Intestinalis litigium vult tu. ≡ ∇
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
