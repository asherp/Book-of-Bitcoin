# 100K block milestone

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 100,000 read as a chapter, and its transaction 1
> (of 4) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β50 ■1217 §1 (Volume I, Book 50, Chapter 1217, section 1)
- **Block:** 100,000 — 100K block milestone
- **Block hash:** `000000000003ba27aa200b1cecaad478d2b00432346c3f1f3986da1afd33e506`
- **Transaction id:** `8c14f0db3df150123e6f3dbbf30f8b955a8249b62ac1d1ff16284aefa3d06d87`
- **Read live:** https://asherp.github.io/Book-of-Bitcoin/bitcoin-book.html?txid=8c14f0db3df150123e6f3dbbf30f8b955a8249b62ac1d1ff16284aefa3d06d87

## Chapter frontispiece — block 100,000

Block hash, as prose: *An alone tap is civil. Young cup to position. A broken language is unique. Crouch mother club to pilot. The minute fever race lift. Camera may eye update to alcohol.*

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** h An exotic mosquito may edge comic. Plastic would link to make. Such absurd update our slow recipe. The vacant swallow get success. Success may slot wedding to a cross advice.
  - hex: `000000000002d01c1fccc21636b607dfd930d31d01c3a62104612a1719011250`
- **merkle root:** ⋔ Green may run to enable. Pop fetch to snap. Theory ski license for notice. Gun torch dust to method. Lobster may see vessel per immune. Embrace may control to uniform. Guy enable service for catalog via pond for gas.
  - hex: `f3e94742aca4b5ef85488dc37c06c3282295ffec960994b2c0d5ac2a25a95766`
- **timestamp:** 2010-12-29 11:57 UTC
- **difficulty target:** β₄₅ — nBits 1b04864c — a valid block hash must read below 000000000004864c000000000000000000000000000000000000000000000000 (45 leading zero bits) — difficulty 14,484 (relative to the genesis block)
- **nonce:** η 274148111

## § 1 — 100K block milestone

Transaction id, as prose: *Its manual hub set cigar. Son teach penalty to arena. Young deal its click. Pan rather gauge release. Flavor margin to solve per our guilt. Hundred vacuum neither tiny tank. Way fall a length.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₅ η₅₁₈
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Advice due get such perfect red. Cop enlist lab to myth. A survey draw cube per swift. Gym see tray to session out car. A real ear always excite a dial. December get the veteran. A talent pencil stairs. Set why suffer its lift. Cap must repair version. A myself. Gown set denial to crater per laptop. Our dumb window are vicious. Tongue may see dinner. Treat web a chronic die. A long dignity may admit venue. Cop retire lawn to the length. ∇
- **locktime:** □ — no locktime — final with respect to time

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. See [/llms.txt](https://asherp.github.io/Book-of-Bitcoin/llms.txt) for how any
other passage on the chain can be fetched and read the same way.
