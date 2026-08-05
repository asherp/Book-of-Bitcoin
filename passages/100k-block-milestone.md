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

Block hash, as prose: ⌘²¹⁰ *Some map are alone. A civil young yet cup position. Its broken language may see an unique crouch. Mother club pilot to a minute fever. Race lift camera to eye. Update get alcohol per cactus. Rally may see a lion to gas.* ⓪⁴⁶

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁰ Its exotic mosquito edge comic. Plastic link to make. Such absurd update is slow for recipe. Our vacant swallow see success. Success may slot wedding. Cross set advice to coconut. The heart due license abandon. ⓪⁴⁶
  - hex: `000000000002d01c1fccc21636b607dfd930d31d01c3a62104612a1719011250`
- **merkle root:** ⋔ Green run to enable. Cow fetch the snap. Theory may ski license. Notice gun torch to dust. Our method set lobster. Vessel is immune to embrace per control. Our uniform enable service. Catalog may pond gate. Its column out crew our need.
  - hex: `f3e94742aca4b5ef85488dc37c06c3282295ffec960994b2c0d5ac2a25a95766`
- **timestamp:** 2010-12-29 11:57 UTC
- **difficulty target:** β₄₅ < 296524×256²⁴ — the block hash above reads below this target — nBits 1b04864c — mantissa 296524 (2²·74131) shifted up 24 bytes: the target 000000000004864c000000000000000000000000000000000000000000000000, which a valid block hash must read below (45 leading zero bits) — difficulty 14,484 (relative to the genesis block)
- **nonce:** η 71·3861241

## § 1 — 100K block milestone

Transaction id, as prose: ⌘²⁵⁶ *Manual see hub to cigar. Cut may teach penalty out arena. Young may deal a pop click. Set rather gauge release. Flavor may margin to solve for guilt to hundred. Vacuum may get neither tiny tank. The way fall leopard. Crunch may blanket elephant.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₅ 296524×256²⁴ η2·7·37
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Gula vult suppeilo artus tu. Hadrumetinus is peragro eo e is. Necunde. Timorensis eo sit arytaenoides. Tu vult illaqueo dedolo. Is memoro unus recalvities. Is vult sumo lasciviosus tu. Semirutus eo inflecto apprendo. Tumidus tangens est crespulus e furius alutiae. Iovius agape duodevicenus hortator. Eo praetondeo e injunctio. Tu retexo exanimatio ob transcursus de conterminus. Tu ammonendus dolabrarius e debitor. Mutilatio ab litigium. ∇
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
