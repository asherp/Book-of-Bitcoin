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

Block hash, as prose: ⌘²²⁴ *Its upgrade birth cash to some garbage. The unhappy boss may see patient. Son expire its fragile coconut. A myself. The kidney may catalog lock. Its exotic hammer have duty beyond a claim. Yes how awake input. Our female is huge.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²² Fiber see umbrella to action via valley. An obvious half head to pony. A hammer risk ban. Pop soon set corn. Cut may see a tired trophy to each horror. Cop explain clown per youth. A record dust parent. Any out may admit a gloom. ⓪³⁴
  - hex: `000000002a22cfee1f2c846adbd12b3e183d4f97683f85dad08a79780a84bd55`
- **merkle root:** ⋔ A yellow list is crazy. Sir appear the canvas. Frame may wet lecture. Sense indicate the arch frog. Our sweet orbit joy uncle. Recipe board its strong actress. Grace bind the yes. Our ear is rapid. Park man the rapid sir. Our tie is lunar.
  - hex: `7dac2c5666815c17a3b36427de37bb9d2e2c5ccec3f8633eb91a4205cb4c10ff`
- **timestamp:** 2009-01-12 03:30 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2³·3·241·326663

## § 2 — Hal Finney transaction

Transaction id, as prose: ⌘²⁵⁶ *Bird may see valley. Path ought sponsor analyst. Oil may set eight. Mistake are curious to rabbit. Its immense tunnel get soup. Find game our vacant manual. Brother excite license to hobby. A pole glow leopard. Pulse around merit tap.*

- **version:** 1
- **input 1:** spends output 0 of `0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9`
  - script: s⁷¹ Litiger tu sit unispinosus. Eo irrutus repto. Pipio elixo luendus e duratio de contiuncula e pellectio. Oxoniensis tu vult. Is anguste invaleo raptio. Tu detono damnaticum e parietalis is. Tu adblatero ad gandeia at cannabius tu. Interulus eo adservaturus remolior e eo. Is sortito tu. Eo mutua maestus instigator. Salutifer tu e calcicolus is. Eo remano en coctor. Is deploro iucundor. Anclabris columba juglans. Eo vult adlocuturus exsequia.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 10.00000000 ₿
  - script: p⁶⁵ Eo vult juro eocle. Decenarius tu adlatus obtueor e generator. Tu opitulor disquisitio ob entheatus obsetrix ad cerceris. Duratio vorsus consocio. Tu tuatim adsertor. Luricatus caepa vult poenitentia. Is elargior polluceo e nominator. Penniger indago currax tu. Bracchialis grano configo esuritio e variabilis is. Eo reverso prensus. Metrica e vagina. Is niteo scobina. Potitius tu amplificus eo. ∇
- **output 2:** 40.00000000 ₿
  - script: p⁶⁵ Glis septembrius tu. Homosexualis filiastra insipiens strages e judex. Treva cinnamomum ab talitha. Altisonus is sermocinor pillo. Eo invigoro absporto. Tu et caballico bavaricus passus. Animaequus thrissa annumerans e coemptio. Eo vult recalcitro maroccanus pallor ob ovum. Palmatias deversor hebraicus amor. Castitas disco decemviratus e squilla en phasellus. Cyperus oditurus perequito. ∇
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
