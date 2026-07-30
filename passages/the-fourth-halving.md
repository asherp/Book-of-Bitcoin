# The Fourth Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 840,000 read as a chapter, and its transaction 1
> (of 3,050) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β1 ■1 §1 (Volume V, Book 1, Chapter 1, section 1)
- **Block:** 840,000 — The Fourth Halving
- **Block hash:** `0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5`
- **Transaction id:** `a0db149ace545beabbd87a8d6b20ffd6aa3b5a50e58add49a3d435f898c272cf`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=a0db149ace545beabbd87a8d6b20ffd6aa3b5a50e58add49a3d435f898c272cf

## Chapter frontispiece — block 840,000

Block hash, as prose: ⓪⁷⁸ ⌘¹⁷⁸ *Its pitch may burst mandate. Pop lend to claim. Cow reflect cap since cable. Guy inflict scissors to sail. Orient list light per trim. The advice due adapt lap.*

- **version:** vmuffliato practice — block version 0x2a5fe000 — BIP9 version-bits form; version-rolling bits 0x52ff (BIP320 scratch entropy) as muffliato practice; no soft-fork signals
- **previous block:** ⓪⁷⁹ ⌘¹⁷⁷ Process picnic cattle to athlete. Chaos may get stove. Fee see health to spawn. Help noise member via hand. Sport may clown a comic absurd.
  - hex: `0000000000000000000172014ba58d66455762add0512355ad651207918494ab`
- **merkle root:** ⋔ Exhibit essay rub into jeans. Essence is far during wish. Its reason cable dolphin. Caution off see world. Anchor is antique to tumble. Street page energy out corn. Pond calm hire to gas.
  - hex: `031b417c3a1828ddf3d6527fc210daafcc9218e81f98257f88d4d43bd7a5894f`
- **timestamp:** 2024-04-20 00:09 UTC
- **difficulty target:** β₇₈ < 213529×256²⁰ — the block hash above reads below this target — nBits 17034219 — mantissa 213529 shifted up 20 bytes: the target 0000000000000000000342190000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 86,388,558,925,171 (relative to the genesis block)
- **nonce:** η 3932395645

## § 1 — The Fourth Halving

Transaction id, as prose: ⌘²⁵⁶ *Its sorry noodle plate tax. The vacant front see faculty. Cherry ago rally torch. Lizard may set moment. Fiber husband to mother per purchase. Quantum suffer tent to nothing. Praise trust an apology. The hub may abandon pan.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: 840000 ²⁵ “/ViaBTC/Mined by buzz120/” ⁴⁴ Its wide tax is vibrant. Pop forget to chuckle. Its relief off attend switch. Pattern are main to great. Pop choose metal out cruise. Jump drop urge to tumble for arm. Physical little target our maximum. The base is wood to the same advice. Abandon may abandon abandon to abandon per abandon. ¹⁶ Flavor set chaos to divorce. Our book demand middle. Its chat image lot. A they. Banner yes divorce abandon. ⓪ ⓪ ⓪ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 40.75061499 ₿
  - script: ⧉ ⌖ h²⁰ Its fat lemon play to empty. Bench is eight for chimney. Hedgehog topple kangaroo to pottery. Exercise guide spoon via trend. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:R”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Mask is abstract to its exercise. Due always smooth a pot. Out may absent zebra to draw. Our brisk gorilla may hawk. Each son is false. Tomorrow are rich to general. Cinnamon tower its erosion per sir. The cop put rough. Task may include our electric abandon.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⓪ⁿ ⌘ᵐ — n leading
proof-of-work zero bits, then the remaining m = 256 − n bits of the
double-SHA256 (⌘, OP_HASH256), Glossia-encoded as ⌈m/8⌉ bytes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
