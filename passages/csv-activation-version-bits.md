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

Block hash, as prose: ⌘¹⁸⁷ *Our abuse may accuse pumpkin. Bit easily connect its home. Weekend permit to topple via kidney to weather. Town may quarter ten. Earth collect some embrace. A due recipe may get an amused abandon.* ⓪⁶⁹

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸⁷ Abuse access badge to rail. Diary are set per draw. Pay also wonder nod. Pan may embark buffalo. Wire mimic to question. End due see city. Help is final to advice. Scan is bad out divorce. ⓪⁶⁹
  - hex: `0000000000000000051804b4c2da5298c4573386bf1d4242bf0e26a49ec32e42`
- **merkle root:** ⋔ Its abandon may see acid. Guy solve pond to stay. Crater get dragon per water. Wreck pet the mutual tie to the electric tea. Our pop appear soldier. Canoe hurry its desert track. Cover curve to release. Jaguar return to torch per tide.
  - hex: `0e57797073975ad93086e6dde91b43e84c851d4572a3f1f73d8428736a9fdef9`
- **timestamp:** 2016-07-04 23:16 UTC
- **difficulty target:** β₆₉ < 337661×256²¹ — the block hash above reads below this target — nBits 180526fd — mantissa 337661 shifted up 21 bytes: the target 00000000000000000526fd000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 213,398,925,331 (relative to the genesis block)
- **nonce:** η 2·5·135315091

## § 1 — CSV activation (version bits)

Transaction id, as prose: ⌘²⁵⁶ *Abandon may set accident. Pioneer ought get wisdom. Nod correct to endorse. Plunge hawk our humble era. Avocado may describe rub. Our drastic release see the antique. Cactus mention to expect. Monster is funny out its clean sibling. Cat may wing to humble.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■419328The able absurd set ability. All table pistol liquid. Guy have the merry catch. Cop govern our wall. Wrong may ignore a out. Red never see hit. ⓪⁶ η2·5 “ckpool” “/Kano /BEBOP/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.32669802 ₿
  - script: ⧉ ⌖ h²⁰ An absurd absurd may wave update to adult out arrest. Concert may pink original to odor. Pop inherit its true kid out panther. Absurd may blame divorce. ≡ ∇
- **output 2:** 0.23001037 ₿
  - script: ⧉ ⌖ h²⁰ Absurd access die upon half. Lion is solar to use. The old defense may set an alien guitar. Height set hill to hospital. A pelican is unaware. Gas out see our bed. ≡ ∇
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
