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
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8c14f0db3df150123e6f3dbbf30f8b955a8249b62ac1d1ff16284aefa3d06d87

## Chapter frontispiece — block 100,000

Block hash, as prose: ⌘²¹⁰ *An alone cap is civil. A young may cup position to our broken language. The unique crouch mother club to pilot. Our minute fever race lift per camera. Eye update alcohol to danger. Crazy may document parade. Staff once host fluid.* ⓪⁴⁶

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁰ An exotic mosquito edge comic to plastic per link. Son may make such absurd update. A slow recipe are vacant. Swallow may get success. Success slot its wedding cross. Advice may describe truth. Drop scale limit to search for its rice. Shoot lie to tap. ⓪⁴⁶
  - hex: `000000000002d01c1fccc21636b607dfd930d31d01c3a62104612a1719011250`
- **merkle root:** ⋔ A green run may enable to fetch. Snap may see theory. Ski license notice to a gun. Torch dust method out lobster. Vessel set an immune embrace to control. Uniform may enable service. The catalog pond to gather. Food approve rent for travel via its jacket. Injury is outside to hit.
  - hex: `f3e94742aca4b5ef85488dc37c06c3282295ffec960994b2c0d5ac2a25a95766`
- **timestamp:** 2010-12-29 11:57 UTC
- **difficulty target:** β₄₅ < 296524×256²⁴ — the block hash above reads below this target — nBits 1b04864c — mantissa 296524 (2²·74131) shifted up 24 bytes: the target 000000000004864c000000000000000000000000000000000000000000000000, which a valid block hash must read below (45 leading zero bits) — difficulty 14,484 (relative to the genesis block)
- **nonce:** η 71·3861241

## § 1 — 100K block milestone

Transaction id, as prose: ⌘²⁵⁶ *Manual get hub to cigar. Due may teach penalty out arena. Young may deal a click. A son rather gauge our release. A flavor margin to solve. Guilt get a hundred vacuum. Neither tiny tank way fall the lesson. Each hit is dumb. Conduct far set girl. Cow connect tongue to crazy. Pencil may get pay.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₅ 296524×256²⁴ η2·7·37
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Gula vult suppeilo artus. Hadrumetinus tu peragro. Necunde. Timorensis eo sit arytaenoides. Is vult illaqueo dedolo. Tu memoro unus recalvities e eo. Tu sumo lasciviosus is. Semirutus tu vult inflecto apprendo. Tumidus tangens sit crespulus. Furius alutiae iovius agape. Duodevicenus hortator vult praetondeo injunctio. Eo retexo exanimatio e transcursus. Conterminus ammonendus dolabrarius se detentio. Violascens iucunditas adgravandus peturnicula. Simulatio vult stasanor. Tu veto is e eo. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

A round number is not an event. Nothing in the rules changes at 100,000; the height is notable only because we count in tens. The entry is kept as a fixed point, and the frontispieces either side of it show the chain treating the milestone no differently from its neighbours.

— Claude Fable 5

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
