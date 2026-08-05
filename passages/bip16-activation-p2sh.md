# BIP16 activation (P2SH)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 173,805 read as a chapter, and its transaction 1
> (of 106) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β87 ■430 §1 (Volume I, Book 87, Chapter 430, section 1)
- **Block:** 173,805 — BIP16 activation (P2SH)
- **Block hash:** `00000000000000ce80a7e057163a4db1d5ad7b20fb6f598c9597b9665c8fb0d4`
- **Transaction id:** `ee1ddad7899f13b0118693800a719e337eb3fb355986346fa68848dc1bbe5276`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=ee1ddad7899f13b0118693800a719e337eb3fb355986346fa68848dc1bbe5276

## Chapter frontispiece — block 173,805

Block hash, as prose: ⌘²⁰⁰ *Start may love strike. Sniff ought offer skull to cousin via combine to will. Adult twin problem below lip. Other flock winter pole. All level goddess trumpet to describe.* ⓪⁵⁶

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²⁰³ Bulb together imitate its naive scrap. A close firm pigeon to teach for sir. A they. The steel churn alter gravity to its home industry. Baby major to light. Airport get ladder out concert. Hybrid see its bet. ⓪⁵³
  - hex: `00000000000006ce101199431bcc76609454139cde25d55557165cc9c575fc1d`
- **merkle root:** ⋔ The gold allow hip. Autumn see the recipe. Retreat set our ugly velvet. The trial very get setup. Gravity reform our olive game. River out culture wire. Medal may stuff joke to hawk. Cow sell to doctor per cannon. Some bargain struggle cop.
  - hex: `dab0d384c76b29869f35d6cd5734450b33125f3ee890073b703bdb87afd54064`
- **timestamp:** 2012-04-01 00:43 UTC
- **difficulty target:** β₅₂ < 675966×256²³ — the block hash above reads below this target — nBits 1a0a507e — mantissa 675966 (2·3·113·997) shifted up 23 bytes: the target 0000000000000a507e0000000000000000000000000000000000000000000000, which a valid block hash must read below (52 leading zero bits) — difficulty 1,626,553 (relative to the genesis block)
- **nonce:** η 2·3·13·17·2989211

## § 1 — BIP16 activation (P2SH)

Transaction id, as prose: ⌘²⁵⁶ *The iron nominee manage review to mass per farm to rubber. Move float to quit under wise. Delay set decade to claw bar maid to mirror out agent. Disease due output pay. An unfair jeans may scare yard. Process is pop to sugar.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “BTC Guild /P2SH/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.13670000 ₿
  - script: ⧉ ⌖ h²⁰ Plutonium pascha e frondator. Eo discerno omnivagus pulpa. Amboiensis summum interrogo excreo. Tu vult praevideo refrico. Eo solet augusto tanos. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

1 April 2012, no joke: the first block mined under BIP16 rules. An activation chapter for a soft fork looks like any other chapter — the change is in what the chain will no longer accept, not in anything printed here. From this page on, a hash in an output can stand for terms of any complexity, and the reader learns them only when someone spends it.

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
