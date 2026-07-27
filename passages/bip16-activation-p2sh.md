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

Block hash, as prose: *Start love its strike to sniff. Offer see skull for cousin. Combine will set adult. Twin may see problem. A cut tap below set other flock. Winter pole all length.*

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** h Its bulb together imitate tea. The naive scrap close firm. Pigeon may teach aid. A they. A steel churn alter gravity. Our home industry baby major. Light yes get its tea.
  - hex: `00000000000006ce101199431bcc76609454139cde25d55557165cc9c575fc1d`
- **merkle root:** ⋔ Gold may allow a hip autumn. Recipe retreat the ugly velvet. Trial very get setup. Gravity reform olive to game. River culture wire via medal. Its stuff may joke hawk. Cop sell to divorce out a rid due.
  - hex: `dab0d384c76b29869f35d6cd5734450b33125f3ee890073b703bdb87afd54064`
- **timestamp:** 2012-04-01 00:43 UTC
- **difficulty target:** β₅₂ — nBits 1a0a507e — a valid block hash must read below 0000000000000a507e0000000000000000000000000000000000000000000000 (52 leading zero bits) — difficulty 1,626,553 (relative to the genesis block)
- **nonce:** η 3963693786

## § 1 — BIP16 activation (P2SH)

Transaction id, as prose: *An iron nominee manage review. The mass farm rubber to move via float. Rub quit pay under wise to delay out decade. Claw bar its maid to mirror. Agent set disease for output. An unfair jeans are big to our scale.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: “BTC Guild /P2SH/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.13670000 ₿
  - script: ⧉ ⌖ h²⁰ The powder too pepper cereal. That repair may share meat. A festival combine pill to monkey. Domain is afraid via a hungry piano. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. See [/llms.txt](https://bookofbitcoin.io/llms.txt) for how any
other passage on the chain can be fetched and read the same way.
