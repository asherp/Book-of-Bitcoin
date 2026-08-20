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

Block hash, as prose: ⌘²⁰⁰ *A start love strike. Sniff offer skull to cousin. Combine will set adult. Twin get problem below other flock. Winter pole all liberty. Mechanic once identify an arrow. Equal why witness the bad holiday.* ⓪⁵⁶

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²⁰³ Bulb together imitate a ear. A naive scrap close firm. A pigeon may teach the sir. A they. Its steel churn alter gravity. Its home industry baby major. Light may alter army to report. Chimney may set cheese per mention. Ocean may see an autumn. ⓪⁵³
  - hex: `00000000000006ce101199431bcc76609454139cde25d55557165cc9c575fc1d`
- **merkle root:** ⋔ Gold allow a hip autumn to recipe. Retreat are ugly for velvet out trial. Yes very see setup. Our gravity reform olive. Game get river to culture. Wire medal a stuff out joke. Hawk sell a document to filter. Clinic get version via our sunny copper. Fox may drop yes.
  - hex: `dab0d384c76b29869f35d6cd5734450b33125f3ee890073b703bdb87afd54064`
- **timestamp:** 2012-04-01 00:43 UTC
- **difficulty target:** β₅₂ < 675966×256²³ — the block hash above reads below this target — nBits 1a0a507e — mantissa 675966 (2·3·113·997) shifted up 23 bytes: the target 0000000000000a507e0000000000000000000000000000000000000000000000, which a valid block hash must read below (52 leading zero bits) — difficulty 1,626,553 (relative to the genesis block)
- **nonce:** η 2·3·13·17·2989211

## § 1 — BIP16 activation (P2SH)

Transaction id, as prose: ⌘²⁵⁶ *The iron nominee manage the review. Mass may farm rubber. Move float to quit under wise. Its delay get decade to claw bar maid. Mirror get some agent to disease for output. An unfair jeans scatter to mean. A lot must see wool per budget. A new wheat swing swing.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “BTC Guild /P2SH/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.13670000 ₿
  - script: ⧉ ⌖ h²⁰ Plutonium pascha e frondator. Is discerno omnivagus pulpa. Amboiensis summum interrogo excreo e eo. Is praevideo maiorana ex mimicus tu. Is perequito superextendo. Piltrum aequiparans saccatum e eo. ≡ ∇
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
