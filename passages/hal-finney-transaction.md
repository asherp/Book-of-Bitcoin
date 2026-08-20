# Hal Finney transaction

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 170 read as a chapter, and its transaction 2
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β1 ■171 §2 (Volume I, Book 1, Chapter 171, section 2)
- **Block:** 170
- **Block hash:** `00000000d1145790a8694403d4063f323d499e655c83426834d4ce2f8dd4a2ee`
- **Transaction id:** `f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16

## Chapter frontispiece — block 170

Block hash, as prose: ⌘²²⁴ *Upgrade due birth cash. Garbage get the unhappy boss. Patient expire our fragile coconut. A myself. Kidney may catalog to lock. An exotic hammer have duty. Beyond claim an awake song. Cut else see ladder. Our lucky slot mention rookie.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²² Fiber may see an umbrella to action out valley. The obvious half head to pony for hammer to risk. A pie soon see corn. Our die is tired. Trophy may get horror. Cop explain to clown. Youth record dust via parent. The random buyer is immune. The model volcano net success. ⓪³⁴
  - hex: `000000002a22cfee1f2c846adbd12b3e183d4f97683f85dad08a79780a84bd55`
- **merkle root:** ⋔ Yellow list a crazy. Tap may appear canvas. Frame wet a lecture. Sense indicate the arch frog. Sweet orbit joy to uncle. Recipe board its strong actress. Grace far bind yes. Our rapid parrot may vault mask to its party case. Zone may pipe our country hit.
  - hex: `7dac2c5666815c17a3b36427de37bb9d2e2c5ccec3f8633eb91a4205cb4c10ff`
- **timestamp:** 2009-01-12 03:30 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2³·3·241·326663

## § 2 — Hal Finney transaction

Transaction id, as prose: ⌘²⁵⁶ *Bird get a valley. Path sponsor analyst to oil. Eight may mistake the curious rabbit. Its immense tunnel get a soup. Find game a vacant manual to brother. Sir excite license via hobby. Pole may glow to lesson. Pay due surround cup. Puppy may see example to rhythm per muffin. A rose see each nod to row via tea.*

- **version:** 1
- **input 1:** spends output 0 of `0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9`
  - script: s⁷¹ Litiger eo unispinosus tu. Is irrutus repto. Pipio elixo luendus. Duratio contiuncula e pellectio. Oxoniensis eo is. Tu anguste invaleo raptio. Tu detono e damnaticum at parietalis eo. Is adblatero gandeia e cannabius tu. Interulus is vult adservaturus remolior. Tu sortito eo. Is mutua maestus instigator. Salutifer tu sit calcicolus. Is ne remano coctor. Eo deploro iucundor. Anclabris columba aumatium. Radicatus eo ni derisorius tramen. Auctumnus obliteratio subrusticus feritas.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 10.00000000 ₿
  - script: p⁶⁵ Tu vult juro eocle. Decenarius solet adlatus obtueor e generator in eo. Tu opitulor e disquisitio. Entheatus obsetrix cerceris. Duratio vult vorsus consocio e eo. Tu tuatim adsertor. Luricatus caepa poenitentia. Is elargior polluceo e nominator. Penniger indago et currax is. Bracchialis grano vult configo esuritio. Variabilis is reverso prensus. Metrica vult vagina e eo. Is niteo iucundus draco. Is absto incumbendus. Asarum mirandus exsiccatio e grammatista. ∇
- **output 2:** 40.00000000 ₿
  - script: p⁶⁵ Glis vult septembrius eo. Homosexualis filiastra insipiens strages. Judex treva e cinnamomum. Talitha altisonus is ob tu. Eo vult sermocinor pillo. Tu invigoro absporto. Eo caballico bavaricus passus. Animaequus thrissa vult annumerans coemptio. Tu recalcitro e maroccanus pallor. Ovum palmatias. Eo deversor hebraicus amor e castitas. Tu disco decemviratus se squilla. Phasellus dictatum e altar. Tanos de parmula. Nectar persubtilis eo. Fuscescens is et pandiculor tu. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Nine days into the chain, the first transaction that is a payment rather than a reward: ten coins from Satoshi Nakamoto to Hal Finney, who was running the second node on the network and had written “Running bitcoin” two days earlier.

Read the outputs and the book's grammar explains itself. Forty coins come back as change, because a spend does not move an amount — it consumes a coin whole and writes new ones. Every section after this one is built the same way, and this is where a reader first sees it.

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
