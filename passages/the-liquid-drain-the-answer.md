# The Liquid drain/the answer

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 965,822 read as a chapter, and its transaction 684
> (of 2,953) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β63 ■831 §684 (Volume V, Book 63, Chapter 831, section 684)
- **Block:** 965,822
- **Block hash:** `000000000000000000001f2e30c61dfede45c3f7bfd9e70538c2cf9e04c85cd0`
- **Transaction id:** `91271efcbb5ab29abfc38ae635f0644e3ba042aad56f92d40136e1dde4742fe8`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=91271efcbb5ab29abfc38ae635f0644e3ba042aad56f92d40136e1dde4742fe8

## Chapter frontispiece — block 965,822

Block hash, as prose: ⌘¹⁷³ *Space get town to abuse. The diesel wire are bright. Its bleak will say safe. Sphere set sadness to tide. Toast how scheme the sentence. Cop admit cousin to pencil. A trend see usage out bag. Bird when set its cow.* ⓪⁸³

- **version:** vdiffindo length — block version 0x2000e000 — BIP9 version-bits form; version-rolling bits 0x0007 (BIP320 scratch entropy) as diffindo length; no soft-fork signals
- **previous block:** ⌘¹⁷⁴ Pipe far get winner. Notable may wave belt to birth. A funny issue only set zebra. Cow inject some trap to swim via tool. Language too alter adult. Our antenna is false to head out patient to upset. Stereo is set per avocado. ⓪⁸²
  - hex: `000000000000000000003b385fc9bfad73d0f11f9bb58b572d4ef17b5a7e5fa5`
- **merkle root:** ⋔ Aid modify flip to its latin trick. Palm may forget priority to link. The account may dwarf copper. Our soft toe ought exclude axis. Violin tackle side to some noodle. The magnet may set pudding. What student lesson fee. A guy crumble dinner. Chase may set lawn to an inner depth.
  - hex: `dcb5f3d3fa4258fe18dda23fc49d382ee7bf94880110bcaab6f439f4f521ab8e`
- **timestamp:** 2026-09-06 19:31 UTC
- **difficulty target:** β₇₈ < 144734×256²⁰ — the block hash above reads below this target — nBits 1702355e — mantissa 144734 (2·72367) shifted up 20 bytes: the target 00000000000000000002355e0000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 127,450,789,715,843 (relative to the genesis block)
- **nonce:** η 2·5·107·127·14897

## § 684 — The Liquid drain/the answer

Transaction id, as prose: ⌘²⁵⁶ *A trial knife decrease rookie. Beach abstract its false evil. Stick may set faith. Pool out isolate town. Job stuff to spend. Senior wolf to prosper. Our yes rely save out audit. Oxygen call a night anxiety. Lava may desert six. Illness shall see night.*

- **version:** 2
- **input 1:** spends output 0 of `676e09a719d50ed06adcb7f1672c20b27ce1f460809f6b005dbd4d28158e2819`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.00001000 ₿
  - script: ⓪ h²⁰ Ratiocinatio e maximus eo. Tu vult superscribo. Is cuneatim veretilla. Amboiensis regularitas est quernus. Singara rogus e rusticatio. Tu capistro farfarum se tu. Is prophetizo diribitorium e is. Eo assolo colon ad venter.
- **output 2:** 0 ₿
  - script: ¶ ³⁹ “Please contact security@blockstream.com”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s A brief list may uncover odor. Each guy are loyal. Our intact cost may swear. A pot is naive. Siren may get a rid carbon. Our silly rescue is little. Super may set miracle. Arrest valve ceiling to its useful shiver. Luxury across set ethics. Ring repeat draw to tenant. Stage may set menu. Sky yet attend august. Butter set van to region. A liberty set eight via journey per the rub. Pan involve leader to kit out student to treat. Share bulk our private. Tomato call escape to ranch. Toilet decline source per cotton out heart via its pluck. Repeat may get language. · p Ear add motion to kind. Brass is lunar for matter. Comfort get nominee to brain. Cow inform opinion out a bomb. Bargain may get hub to a hospital. Fyi may manage a bad ban. Guy ahead welcome photo. Suit may set visa to claim. Aunt set oyster per addict. Cloth carpet to unlock out pool. Tree may get hill to crisp.

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
