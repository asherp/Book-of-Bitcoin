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

Block hash, as prose: ⌘¹⁸⁷ *Yes remember post to magnet. Color busy to behave. Device consider lecture via a rubber field. Knock trim grant to math out nose. Patient set a cactus. Love is blanket to company out length.* ⓪⁶⁹

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁷ A drama may invite tray. Yes embark genius to garden for animal. A dry sauce cover sting. Matrix may lunch our hope. Sky may approve letter. Blossom set chimney to ridge via animal. Some citizen may see length. ⓪⁶⁹
  - hex: `0000000000000000051804b4c2da5298c4573386bf1d4242bf0e26a49ec32e42`
- **merkle root:** ⋔ What visual surround town to marriage. Bus may thank a crucial inch. Cigar is genuine to oil. Its loud mistake is polar. Rubber ago mail man. Find confirm damage to device. Son found scare via radio. A bet may settle its bracket to lap.
  - hex: `0e57797073975ad93086e6dde91b43e84c851d4572a3f1f73d8428736a9fdef9`
- **timestamp:** 2016-07-04 23:16 UTC
- **difficulty target:** β₆₉ < 337661×256²¹ — the block hash above reads below this target — nBits 180526fd — mantissa 337661 shifted up 21 bytes: the target 00000000000000000526fd000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 213,398,925,331 (relative to the genesis block)
- **nonce:** η 2·5·135315091

## § 1 — CSV activation (version bits)

Transaction id, as prose: ⌘²⁵⁶ *Input may display ecology. Matrix might state to unfold. Soccer trumpet to draft. Trash get marriage out find. Son cancel tomato to badge. Anxiety faint envelope via census. Flight piece term to punch for theory. An entire course crane pot.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■419328Aer vult eicio impolitus dijudicatio. Palacurna optemperans scribo. Is adinspecto retraho. Coniectio tragoedus. Suculentus eo tu. Is tu abs eo. ⓪⁶ η2·5 “ckpool” “/Kano /BEBOP/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.32669802 ₿
  - script: ⧉ ⌖ h²⁰ Callum chirografum e lotaster. Numerarius compitare nothus eo. Basilicola vult immergo licium. Tu nuo glaucedo. Is inoculo e colluvies ad is. Eo vult collaudo tu. ≡ ∇
- **output 2:** 0.23001037 ₿
  - script: ⧉ ⌖ h²⁰ Violens eo sit quirinalis. Tu fallire percalefacio. Colonica scaevus stelio. Is pubesco vacillatio. Tu longinque inligandus eo. Tu vult divolgo rector e transcensus. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Relative timelocks (BIP68, 112, 113) — Δ in the book's notation: not before so many blocks after the coin being spent was itself confirmed. Absolute time says when; relative time says how long after, which is what a payment channel needs to give a wronged party a window in which to react. The Lightning table in the notation key is written almost entirely in this mark and the last one.

— Claude Opus 5

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
