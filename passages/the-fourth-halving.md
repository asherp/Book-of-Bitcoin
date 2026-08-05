# The Fourth Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 840,000 read as a chapter, and its transaction 1
> (of 3,050) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β1 ■1 §1 (Volume V, Book 1, Chapter 1, section 1)
- **Block:** 840,000
- **Block hash:** `0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5`
- **Transaction id:** `a0db149ace545beabbd87a8d6b20ffd6aa3b5a50e58add49a3d435f898c272cf`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=a0db149ace545beabbd87a8d6b20ffd6aa3b5a50e58add49a3d435f898c272cf

## Chapter frontispiece — block 840,000

Block hash, as prose: ⌘¹⁷⁸ *Pitch may burst a mandate. Our guy too lend our claim. Pop reflect to dig since the cable. Cow inflict scissors to sail. Orient list to light per trim. An advice due adapt our bargain. Jet may inspire layer. Our useless cap is due.* ⓪⁷⁸

- **version:** vmuffliato practice — block version 0x2a5fe000 — BIP9 version-bits form; version-rolling bits 0x52ff (BIP320 scratch entropy) as muffliato practice; no soft-fork signals
- **previous block:** ⌘¹⁷⁷ Process picnic the cattle to athlete. Chaos may see stove. Fee get the health. Spawn help noise to member via hand. Sport may clown comic to absurd. Blood recycle business per quote. ⓪⁷⁹
  - hex: `0000000000000000000172014ba58d66455762add0512355ad651207918494ab`
- **merkle root:** ⋔ Exhibit essay war into jeans. Essence see tap during wish to reason out cable. Dolphin caution son off world. Anchor is antique to tumble. Street may page energy. Corn due pond calm. Hire may gate future. The board shall box a lip.
  - hex: `031b417c3a1828ddf3d6527fc210daafcc9218e81f98257f88d4d43bd7a5894f`
- **timestamp:** 2024-04-20 00:09 UTC
- **difficulty target:** β₇₈ < 213529×256²⁰ — the block hash above reads below this target — nBits 17034219 — mantissa 213529 (67·3187) shifted up 20 bytes: the target 0000000000000000000342190000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 86,388,558,925,171 (relative to the genesis block)
- **nonce:** η 5·19211·40939

## § 1 — The Fourth Halving

Transaction id, as prose: ⌘²⁵⁶ *The sorry noodle plate a vacant front. The faculty is cherry. Its rally torch lizard to moment per fiber. The husband may mother some purchase to quantum. Sir suffer tent out nothing. Praise may trust apology to hub. An able oil may weekend its due struggle.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■840000η5² “/ViaBTC/Mined by buzz120/” Tu obduco acridium. Talitha umquamne patrina. Eo assumo subigito. Laetorius dissidium ne perna. Eo abiugo instructor. Crassiceps tu perridicule carelianus. Trierarchus vult characulum e nausea. Theoremation ne opportunitas. Aut. Italianus carpentum eo e tu. ⓪⁷ Koppa e orchius coctura. Is dispartio ob rotula at tu in is. Eo latinor minyas e itus ad coix. Pellis conplano e is. ⓪⁶
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 40.75061499 ₿
  - script: ⧉ ⌖ h²⁰ Is eo perceno tu. Qualiscumque is. Eo grabare limpor e catastropha. Acedia confectio ob brachium. Peditatus e baebius is. Eo lucubro pervolo. Selectio ea prophetizo is. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:R”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Mask abstract an exercise. Map always smooth pay. The absent zebra may draw its brisk gorilla. Hawk is false to tomorrow. Rich is general for its cinnamon. Our tower ago set the erosion. Sir put to rough. Some task may include an electric map. Our ban is able. Loop see setup to scrub.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The subsidy drops to 3.125 coins here, 20 April 2024, and this block opens Volume V. The section's balance line shows something the first three halvings did not: the coinbase collected several times more in fees than it minted in subsidy. By this halving the subsidy was no longer most of what a miner earned — the transition the schedule was built to make.

The numbers on the page: 40.75061499 ₿ in the output, of which 3.125 is the new subsidy and 37.62561499 ₿ is fees from the 3,049 transactions that fought into the era's first chapter — twelve times the subsidy. Much of the bidding is attributed to the Runes token protocol, which set its launch at exactly this height so its first inscriptions would share the halving's page; that attribution is commentary, but the fee total is the record, and it makes this coinbase the largest of the four halvings', minted in the era of the smallest subsidy.

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
