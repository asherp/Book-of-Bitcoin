# Supply cap bug fix

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 74,421 read as a chapter, and its transaction 3
> (of 3) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β37 ■1846 §3 (Volume I, Book 37, Chapter 1846, section 3)
- **Block:** 74,421
- **Block hash:** `00000000006dc429fb49824d24f4e9fd55498700b0c7a53f50c2228334256f5d`
- **Transaction id:** `237fe8348fc77ace11049931058abb034c99698c7fe99b1cc022b1365a705d39`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=237fe8348fc77ace11049931058abb034c99698c7fe99b1cc022b1365a705d39

## Chapter frontispiece — block 74,421

Block hash, as prose: ⌘²¹⁵ *Frost see a junior. Essay may get alien. Club how set chimney. Cop write rib to quote per the aerobic spoil. Program teach our wheel to muffin. Raccoon get enemy for sun. The illegal red sure direct palm. Leg scale to deliver out the major to alarm via kangaroo.* ⓪⁴¹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁵ Comic see a gold. Sock relax idea to whale per leisure. Sound travel a boring aunt to rebel. Question reduce enemy per our chapter. Some guy is cute. Our robust cow attract tube. Red too crumble private. Emotion gas scrap to abuse. Olive get a river. ⓪⁴¹
  - hex: `0000000000753b68b73633791268f99a593d3c83e77eee5ff307875a388b4c2e`
- **merkle root:** ⋔ Can yet picnic the unknown melody. Its slice ticket humor. Yes bless its brisk crop to airport. Giant project pupil via enemy. Scrap unlock to subject. Abstract glide to replace. Device file lesson per area out feel. Cinnamon erase the family to peace. Its royal may see our guy per a lie.
  - hex: `8c55796c8bb103fc1aee0b7ed25bc1da30167c461cbdc05bc3b74cc5b787f420`
- **timestamp:** 2010-08-14 23:05 UTC
- **difficulty target:** β₄₀ < 47640×256²⁵ — the block hash above reads below this target — nBits 1c00ba18 — mantissa 47640 (2³·3·5·397) shifted up 25 bytes: the target 0000000000ba1800000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 352.16 (relative to the genesis block)
- **nonce:** η 47·716549

## § 3 — Supply cap bug fix

Transaction id, as prose: ⌘²⁵⁶ *Deer twist a bird. Hope see banana to gas. Pie include its large legend. Our globe is green. Object desert shallow below creek. Advice see its mobile pact. Our monitor is viable. Injury wish to gather. Update why get device. A winter is insane. Trick see mixture to farm.*

- **version:** 1
- **input 1:** spends output 0 of `c3b36337753b0cbbf7ec44967f0fe30e2e47b79e5400bb57c1fe5dd660f4e885`
  - script: s⁷³ Cut okay gas piano. The dwarf elder may orient bounce. A lemon resemble to hover. Pop may acquire check. Sir bless metal to its desk. Crater pair shift for gain per daughter. News may cart fitness to some crop. Enough crime may evolve cycle via mosquito for breeze. Video shove sheriff to tourist. Its report is lazy out brick via border. A nuclear sin are harsh. Produce omit to differ. Double have foil per some catch. Call enact to convince out girl. Output may sign to toast. A son is vague. Kind may get tobacco to cat. p⁶⁵ An afraid laugh rebuild its initial cannon to man. Our basket may see dinosaur for yellow via royal. Each hit are typical. Volume may dress robot. Each air could see logic. A rude labor manage wedding. Hockey may grant its human latin to letter. Height rabbit path per staff. Skull speed turtle to maple. Miracle may pony romance. A raise is cute to buddy. City get banana per castle for forward. Border pencil autumn to pyramid about magnet. Blame may get the hood. A possible reveal is physical to episode. Volume is bad via man out skate.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.50000000 ₿
  - script: ⧉ ⌖ h²⁰ Egg may brick broom. Earth pop to ban per some capital. Son learn tonight to rice. Lens may journey pioneer. Deal wrong a fresh goat. Pop imitate to prevent. Need scale focus out tank. The range set a blouse. ≡ ∇
- **output 2:** 235.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Chunk gesture to retire. Will may pride weekend for swim. Clinic may urge coyote. Our alone special never see half. Parade may set gold. Badge online scale a row. Our robust volcano are good. Wall why see pay. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

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
