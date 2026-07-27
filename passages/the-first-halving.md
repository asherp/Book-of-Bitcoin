# The First Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 210,000 read as a chapter, and its transaction 1
> (of 457) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β1 ■1 §1 (Volume II, Book 1, Chapter 1, section 1)
- **Block:** 210,000 — The First Halving
- **Block hash:** `000000000000048b95347e83192f69cf0366076336c639f9b7228e9ba171342e`
- **Transaction id:** `76a30f7eefb41cd01733b23218faea8a1a1a2f6bbf1a2c11e4bc77f62c8e7ce9`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=76a30f7eefb41cd01733b23218faea8a1a1a2f6bbf1a2c11e4bc77f62c8e7ce9

## Chapter frontispiece — block 210,000

Block hash, as prose: *Comfort phone its half damage. Timber may get fossil. Top decide cushion to blouse. Some sunset always walk nurse. Gravity hurt our cruel proof to scissors.*

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** h Aid may thrive dig under ozone. Blanket inject a sound quote. Clown loud see an initial wine. Ritual get our raw rabbit. An eternal milk muscle auto to scale.
  - hex: `00000000000000f3819164645360294b5dee7f2e846001ac9f41a70b7a9a3de1`
- **merkle root:** ⋔ Aid may submit a busy market. Pulp tag air to glide. Elbow reflect our spot per spread. Tone is harsh to either bulk. Tea may thrive honey. Purchase is unable to ecology. Media far call an insane length.
  - hex: `3cdd40a60823b1c7356d0987078e9426724c5b3ab439c2d80ad2bdd620e603d8`
- **timestamp:** 2012-11-28 15:24 UTC
- **difficulty target:** β₅₃ — nBits 1a04e0ea — a valid block hash must read below 00000000000004e0ea0000000000000000000000000000000000000000000000 (53 leading zero bits) — difficulty 3,438,909 (relative to the genesis block)
- **nonce:** η 4069828196

## § 1 — The First Halving

Transaction id, as prose: *Tap truly tongue our menu. The cow undo knock. Aid may improve a dwarf local. Satoshi floor shoot to crush. Push set laptop per general. Film may credit salon. Nod already hawk wave. Each tax is amazing. Each miss may scale a jet.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: 210000 ⁶ “/P2SH/” 1354116268 ⁸ An amount due achieve its letter. The acoustic abandon is absurd. ⁷ “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 38.56295554 ₿
  - script: ⧉ ⌖ h²⁰ Trophy cube debate to bullet. Artefact may control faint. Its decline blush gospel. Source sense a father. Fee yes blossom die. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. See [/llms.txt](https://bookofbitcoin.io/llms.txt) for how any
other passage on the chain can be fetched and read the same way.
