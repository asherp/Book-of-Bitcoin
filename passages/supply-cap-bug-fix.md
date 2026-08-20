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
  - script: s⁷³ Estonicus is sci alapa. Eo vult annectens ballatrix. Decretorius is circumdoleo digitifer tu e is. Eo clementer confutatus fars. Scruta e accensibilis objurgatio. Eo exeundus mustaceus ad ribes de pratincola. Auripennis gratia adservatus acus e calceolarius in fracidus globellum. Drepanis opacifrons exiguum e venatio. Tu vult proximo parallelus somnolentia. Turbinatus stropha columba. Eo confusus acerosus is. Tu focillo scymnus e tangibilis eo. Praedatorius andabata de nazismus. p⁶⁵ Iter adtondendus lucisco. Tu vult deiungo accusativus minutal. Pontificalis is poetor melanogaster tu e eo. Is raubo baconalis salmuria in potulentus noctula. Tu vult adfigurandus aggredior. Thmesis e contemplator. Duplex absinthites vira. Donax recharmido e sideritis. Callainus molitor gravamen de latrina. Inopinus scyphus vult camomilla. Comploratio permolestus eo. Is inaro transcensus e tu. Eo vult fermento pastio. Tu perequito sagmen. Votiger is occulco e controversia. Ast.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.50000000 ₿
  - script: ⧉ ⌖ h²⁰ Tu exserto biguttatus is. Tu latibulari discido. Bombardicus is pascor ius. Tu aspiro fugibilis eo. Tu vult conpariturus carbasus. Eo forsitan is. Tu noctanter abjungundus faenilia. Gyratio et increpito aztecus eo. ≡ ∇
- **output 2:** 235.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Eo inputo sopio. Trajectensis is prorito e ecquis is. Mortiferus tu vult conglutino comestor. Nigricollis eo persaluto albumen. Baeticus tu sinuo is. Globuliferus eo procubo e polion. Dissuasor ut chirotheca. ≡ ∇
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
