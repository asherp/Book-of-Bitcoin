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

Block hash, as prose: ⌘¹⁷⁸ *Its pop pitch burst to mandate. Our war may lend each claim. Yes reflect row since cable. Son inflict scissors to sail for orient. List light trim advice. Sin adapt to boil via region to buyer. Mosquito may set lobster. A weapon could move rule.* ⓪⁷⁸

- **version:** vmuffliato practice — block version 0x2a5fe000 — BIP9 version-bits form; version-rolling bits 0x52ff (BIP320 scratch entropy) as muffliato practice; no soft-fork signals
- **previous block:** ⌘¹⁷⁷ Process picnic cattle to athlete. Chaos get stove per fee. Health spawn help to noise. Member hand sport per clown for comic. Absurd set our brisk impulse. Its lawsuit source map. A rigid adult may cushion to ring. ⓪⁷⁹
  - hex: `0000000000000000000172014ba58d66455762add0512355ad651207918494ab`
- **merkle root:** ⋔ Exhibit essay sin into jeans. Essence get its lip. Set is big during wish. Reason may cable dolphin. Caution off set the world anchor. Antique may tumble street to page via energy to corn. Pond calm the hire. Pop gather a civil pop. Guy cancel the disease. Pop announce same to its south fossil.
  - hex: `031b417c3a1828ddf3d6527fc210daafcc9218e81f98257f88d4d43bd7a5894f`
- **timestamp:** 2024-04-20 00:09 UTC
- **difficulty target:** β₇₈ < 213529×256²⁰ — the block hash above reads below this target — nBits 17034219 — mantissa 213529 (67·3187) shifted up 20 bytes: the target 0000000000000000000342190000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 86,388,558,925,171 (relative to the genesis block)
- **nonce:** η 5·19211·40939

## § 1 — The Fourth Halving

Transaction id, as prose: ⌘²⁵⁶ *Some pop is sorry. Noodle may plate a vacant front. Faculty are cherry to rally. Torch set lizard for our moment. Fiber husband mother to purchase. Quantum may suffer tent out nothing. Our praise trust apology. A hub about uphold scene. Version get hair to beef. Some shrimp are pop for album.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■840000η5² “/ViaBTC/Mined by buzz120/” Eo obduco acridium e talitha. Eo umquamne patrina. Is vult assumo subigito. Is laetorius dissidium e perna. Eo abiugo instructor. Crassiceps is perridicule carelianus. Trierarchus characulum e nausea ad theoremation. Opportunitas beo uligo e morator ab abies e nidiformis mulieritas. Talaris is vult. ⓪⁷ Koppa e orchius coctura. Is dispartio rotula in tu. Is vult latinor minyas. Itus esox e risibilis eo. Tu insideo subvereor. Subaemulatio vult adgeniculor condecerno. ⓪⁶
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 40.75061499 ₿
  - script: ⧉ ⌖ h²⁰ Is perceno tu. Qualiscumque eo. Is grabare limpor e catastropha de acedia. Confectio brachium. Peditatus vult baebius eo. Is lucubro patrisso e tu. Is familiariter admixtio. Ancistrum eo condama. Pythius is abbacino e tu. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:R”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Mask may abstract exercise. Hit always smooth its absent zebra. Draw is brisk to gorilla for hawk to die. Our false tomorrow is rich for general. Cinnamon may tower erosion. Cow put rough to a task. Lot may include the electric ban about visual. Wonder may tone lyrics to piano via feature. Our color is red.
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
