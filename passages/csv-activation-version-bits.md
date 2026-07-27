# CSV activation (version bits)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 419,328 read as a chapter, and its transaction 1
> (of 1,667) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β104 ■1681 §1 (Volume II, Book 104, Chapter 1681, section 1)
- **Block:** 419,328 — CSV activation (version bits)
- **Block hash:** `000000000000000004a1b34462cb8aeebd5799177f7a29cf28f2d1961716b5b5`
- **Transaction id:** `77ebbe477a2c9578e951505804c813522b21eefc414c7773da4d9d4418f1a774`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=77ebbe477a2c9578e951505804c813522b21eefc414c7773da4d9d4418f1a774

## Chapter frontispiece — block 419,328

Block hash, as prose: *Pop remember post to magnet. Color busy to behave. Device consider lecture per rubber. Field knock to trim out grant. Its math nose our patient cactus.*

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** h Drama may invite our cut tray. Cow embark a genius garden. Animal far dry sauce. Cover sting matrix to lunch. Hope approve letter via blossom. The chimney is red.
  - hex: `0000000000000000051804b4c2da5298c4573386bf1d4242bf0e26a49ec32e42`
- **merkle root:** ⋔ What visual surround town to marriage. Bus thank our crucial inch per cigar for a genuine oil. Cop loud mistake a polar rubber. Mail too man find. Die not confirm damage. Device found to scale.
  - hex: `0e57797073975ad93086e6dde91b43e84c851d4572a3f1f73d8428736a9fdef9`
- **timestamp:** 2016-07-04 23:16 UTC
- **difficulty target:** β₆₉ — nBits 180526fd — a valid block hash must read below 00000000000000000526fd000000000000000000000000000000000000000000 (69 leading zero bits) — difficulty 213,398,925,331 (relative to the genesis block)
- **nonce:** η 1353150910

## § 1 — CSV activation (version bits)

Transaction id, as prose: *Input display ecology to matrix. State may unfold soccer. Its trumpet draft trash. Marriage find to cancel. Tomato yes badge anxiety. Faint may get envelope to census. Flight piece term per punch. Our theme is pop.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “ckpool/Kano /BEBOP/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.32669802 ₿
  - script: ⧉ ⌖ h²⁰ Its bus worry lesson to screen. Grape regret bean per rebel. The common tag may exercise fault. Scan is actual to chimney. ≡ ∇
- **output 2:** 0.23001037 ₿
  - script: ⧉ ⌖ h²⁰ Fruit is unfair to icon. Degree see its law. Our cap may rebuild tea. A lap already see general. Lot erupt snap to pulp. Pumpkin see a violin via frown for our hire. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. See [/llms.txt](https://bookofbitcoin.io/llms.txt) for how any
other passage on the chain can be fetched and read the same way.
