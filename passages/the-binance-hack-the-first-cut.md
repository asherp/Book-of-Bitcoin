# The Binance hack/the first cut

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 973,732 read as a chapter, and its transaction 2087
> (of 3,898) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β67 ■677 §2087 (Volume V, Book 67, Chapter 677, section 2087)
- **Block:** 973,732
- **Block hash:** `00000000000000000001332dd90244852b5f3c0178c0acf76390001496b70f23`
- **Transaction id:** `b1473693c972e8ee8a16d43e3efbe155af97761aa943284b4ed62fb3ba14ae00`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=b1473693c972e8ee8a16d43e3efbe155af97761aa943284b4ed62fb3ba14ae00

## Chapter frontispiece — block 973,732

Block hash, as prose: ⌘¹⁷⁷ *Cart set laundry to tortoise. Chimney yes see animal. Cradle may team object to job out antique. Blind finish february to accident for gorilla. Tap may please absurd. Yes borrow label to clinic. Quote out curtain row. A harsh source may decide a ago sin.* ⓪⁷⁹

- **version:** vfurnunculus length — block version 0x20076000 — BIP9 version-bits form; version-rolling bits 0x003b (BIP320 scratch entropy) as furnunculus length; no soft-fork signals
- **previous block:** ⌘¹⁷⁵ Aunt is slender to slot per purchase to scout per purpose. Our horse set some dune. Its sin may recycle to attract. Cop teach leaf out minor. Merit set the clerk. A simple cap may adapt rain. Hunt spirit the nice prize to swing via vocal. ⓪⁸¹
  - hex: `00000000000000000000489e0a17d3583f7adbe1b32072db5c151c57306b590f`
- **merkle root:** ⋔ Type may set pact to error. Fiction not set future. A die is false. Horror clean dash to depth for genre. Its son enlist menu to wash. A gas see asset. Son expand a rubber exercise to juice. Cow develop to purchase. Health may scatter butter via bundle. The stuff may see math. An indoor employ noodle lot.
  - hex: `8e5a5cc9633c3d9937506d00d8eeb368258465a73752699ba4e8e52a33d5d3eb`
- **timestamp:** 2026-10-29 20:20 UTC
- **difficulty target:** β₇₉ < 124332×256²⁰ — the block hash above reads below this target — nBits 1701e5ac — mantissa 124332 (2²·3·13·797) shifted up 20 bytes: the target 00000000000000000001e5ac0000000000000000000000000000000000000000, which a valid block hash must read below (79 leading zero bits) — difficulty 148,364,561,003,867 (relative to the genesis block)
- **nonce:** η 2·823484393

## § 2087 — The Binance hack/the first cut

Transaction id, as prose: ⌘²⁵⁶ *Pot absent to idle. Concert set green via word. Cheese coach to anchor. Poverty see squirrel for planet via gadget. Fun may work wedding to its pay. Cow surround bird out our first. Ring may get tortoise. Odor open burst to call per surface to affair. Monitor again suspect chuckle. A drip may get its fyi.*

- **version:** 2
- **input 1:** spends output 0 of `3b1d3ded49c382e80dd45057e316a5fe4318bcc1473183070715a1de1c432b32`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 1,000.00000000 ₿
  - script: ⓪ h²⁰ Kit may admit the red bubble. Guy enter pupil to body via its funny turkey to shrug. Pie hard depend out. A tie is keen. Our party course submit judge. A three step scale year to hat. Theory may impose cop.
- **output 2:** 3,696.59999500 ₿
  - script: ⓪ h²⁰ A sample apple book view. Spread tonight get the wasp. Dinner far set bachelor. Shine see hill to country. The family broccoli is ugly. Inmate set slight to main. Length help youth out bind. Repair too set pop.
- **locktime:** V β67 ■589 — locktime: not before block 973644 — volume 5, book 67, chapter 589

### Witness footnotes

a. s Its bitter spice kick wish. Clump may sock to swear. Our tiny notice set each ocean for plunge. Crack school update to wear. An index may see health. Yes consider skirt to bunker via project. Neglect may see mosquito to secret. An intact cow may invest an useful west. Measure jacket memory to story. Ban may clarify air. Trip caught scare to shoe via usage. Its outer original see cargo. Our furnace page to inform. A theory may divorce call via lip. Son undo coyote to bench. Stamp awake script via jungle. Our inner taste may set the useful bet. · p Advance choose a rude vessel. Its silk violin vapor to obey via print to the latin. Firm ago get jeans. Joy why see future. Catalog get our two. Hammer may see road to slight. Our code is ten. Glance may record tone. Advance is aerobic to its scare. Village may text health for chalk via fossil.

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
