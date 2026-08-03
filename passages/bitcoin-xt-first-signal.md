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

Block hash, as prose: ⌘¹⁸⁵ *Abuse account its type. Absurd may stock to become. Cop sell a shop via utility. Harvest may traffic item to elephant. Our awake portion tunnel fault. A door yet parade divorce.* ⓪⁷¹

- **version:** vaccio abandon 111 — block version 0x20000007 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 0 — CSV (BIP68/112/113), bit 1 — SegWit (BIP141), bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁸ Abuse abuse a sister to scorpion. Course wink to prepare via pen. Audit eye to mail. Balcony quit this guy. Cow know its hungry image. Desk may gate our divorce. ⓪⁶⁸
  - hex: `000000000000000009ec3b8ad3dbf70cee5747c430517898e853bdaf98043339`
- **merkle root:** ⋔ Abandon may get acid. Use are forward under box. Lawsuit ribbon to oppose out honey to our talent per glow. Valve may rely lobster to garbage. Neither fabric abandon its digital music. A ride set ear until pig to tag.
  - hex: `e92669dc97fbc8f7006051a1e45706578b788fad3b6ddc446efca861766ff5fd`
- **timestamp:** 2015-08-18 18:09 UTC
- **difficulty target:** β₆₇ < 1367300×256²¹ — the block hash above reads below this target — nBits 1814dd04 — mantissa 1367300 (2²·5²·11²·113) shifted up 21 bytes: the target 000000000000000014dd04000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 52,699,842,409 (relative to the genesis block)
- **nonce:** η 2·71·9417019

## § 1 — Bitcoin XT first signal

Transaction id, as prose: ⌘²⁵⁶ *Abandon may accuse north. Ribbon trip vapor to social. Pyramid get era for shrug. Member laugh crawl to exercise via nose. Its forward dress wing to refuse for squirrel. Fury jewel an outer floor to fossil.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■370434 η51987679957039Its above acid may sting opera. Swarm spring to argue. Police may spike its angle. Our large save job current to our panel. The valid taste far get member. Our taxi are brisk. Few chat is boring to a casual style. Some cabbage accuse to fetch. An acoustic ear may see our set. ⓪⁷ Our set about abuse cash. Dolphin abandon its abandon. Anger struggle the thought abandon. “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 25.28535368 ₿
  - script: ⧉ ⌖ h²⁰ Absurd see accident to thing. Father photo the sheriff. Raccoon jump pill to produce. Notice may get slight. Element flash traffic to country via cactus. ≡ ∇
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
