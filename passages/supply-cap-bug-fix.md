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

Block hash, as prose: ⌘²¹⁵ *Frost is junior to essay. Its alien club get chimney. Pop write rib to quote. The aerobic spoil program to teach. Its wheel set muffin. Raccoon may get enemy. The sun is illegal. Due sure clarify broom. Rug may abandon bed to tax.* ⓪⁴¹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁵ Comic is gold to sock. Tax may relax idea via whale. Leisure sound travel to our boring aunt. A rebel question reduce enemy. Its chapter is cute. The robust pot may attract to tube. A casual chunk see melody. Parade may set our pay. ⓪⁴¹
  - hex: `0000000000753b68b73633791268f99a593d3c83e77eee5ff307875a388b4c2e`
- **merkle root:** ⋔ Can picnic unknown to melody. Some slice ticket to humor. Pop bless our brisk crop. Airport are giant to some project per pupil. The enemy scrap to unlock. Subject abstract to glide. Sin may replace device. File see leopard to labor. The hood arrive our lot.
  - hex: `8c55796c8bb103fc1aee0b7ed25bc1da30167c461cbdc05bc3b74cc5b787f420`
- **timestamp:** 2010-08-14 23:05 UTC
- **difficulty target:** β₄₀ < 47640×256²⁵ — the block hash above reads below this target — nBits 1c00ba18 — mantissa 47640 (2³·3·5·397) shifted up 25 bytes: the target 0000000000ba1800000000000000000000000000000000000000000000000000, which a valid block hash must read below (40 leading zero bits) — difficulty 352.16 (relative to the genesis block)
- **nonce:** η 47·716549

## § 3 — Supply cap bug fix

Transaction id, as prose: ⌘²⁵⁶ *Deer may twist bird. Hope get its banana. Gas include the large legend. Globe see our green object to desert out shallow below creek. Each advice get mobile. Pact monitor its viable injury. Wish gate an office. A cap ahead set a red sunset.*

- **version:** 1
- **input 1:** spends output 0 of `c3b36337753b0cbbf7ec44967f0fe30e2e47b79e5400bb57c1fe5dd660f4e885`
  - script: s⁷³ Estonicus is sci alapa. Eo vult annectens ballatrix e eo ob decretorius tu. Is circumdoleo digitifer eo. Is clementer confutatus fars. Scruta e accensibilis objurgatio. Tu exeundus mustaceus se ribes de pratincola. Auripennis gratia adservatus eo. Acus et calceolarius. Fracidus globellum vult drepanis. Opacifrons exiguum solet venatio. Is proximo parallelus somnolentia. Turbinatus stropha columba. Fistuca myrice e globuliferus tu. p⁶⁵ Iter vult adtondendus lucisco. Eo deiungo e accusativus minutal. Pontificalis eo poetor melanogaster is in tu. Eo vult raubo baconalis salmuria. Potulentus noctula adfigurandus aggredior. Thmesis vult contemplator. Duplex absinthites debet vira e donax. Is vult recharmido sideritis. Callainus molitor gravamen e latrina. Inopinus scyphus de camomilla in comploratio. Permolestus tu inaro transcensus. Abantius is vult venundo tanos.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.50000000 ₿
  - script: ⧉ ⌖ h²⁰ Eo vult exserto biguttatus is. Eo latibulari discido. Bombardicus is ut pascor ius. Eo aspiro fugibilis is. Eo vult conpariturus carbasus e eo. Tu ut adfector transfusio. Eo et collaudo is. ≡ ∇
- **output 2:** 235.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Tu inputo sopio. Trajectensis eo prorito e ecquis. Mortiferus eo et conglutino comestor. Nigricollis is ni persaluto albumen. Impiger eo baceolus is. Tu focillo. ≡ ∇
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
