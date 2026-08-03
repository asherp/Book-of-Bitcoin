# 20.03 ₿ to the zero address

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 950,962 read as a chapter, and its transaction 2216
> (of 3,755) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β56 ■83 §2216 (Volume V, Book 56, Chapter 83, section 2216)
- **Block:** 950,962 — The 107 BTC burn
- **Block hash:** `00000000000000000000e37d3f9e65f307c1d62f91a7364031f59760fc9048cc`
- **Transaction id:** `ea6d6a236172d391bc247310114ff3b5f78b1091aa9a297328500bd7d56c1b1c`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=ea6d6a236172d391bc247310114ff3b5f78b1091aa9a297328500bd7d56c1b1c

## Chapter frontispiece — block 950,962

Block hash, as prose: ⌘¹⁷⁶ *Tap about achieve its odd girl. Category yes web our annual whisper. Shallow almost pole maximum. Volcano may link left. Each son ready jump. Use may toast each pan.* ⓪⁸⁰

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁷⁷ Its son absorb accident. Smoke is good to mirror. The page portion sugar for monitor via the laugh. Our map may assume chicken. A yes apart wolf blame. Route walk poverty to amount. ⓪⁷⁹
  - hex: `00000000000000000001a9b4276f2ecc2f859ebc817d7834b650efc9c6919979`
- **merkle root:** ⋔ An abandon may account blanket. Our cheap brother neck shine. Rent set wheat to guitar. Cotton may verify force per month. Glove may recall our long manual to lesson out section. Sign see our upper slight. Its just tool how see bet.
  - hex: `255f5e97f12ee40a0f70871edc6cc7f688adca1bc667cf97ed8b3b798e9be882`
- **timestamp:** 2026-05-25 13:59 UTC
- **difficulty target:** β₇₈ < 135033×256²⁰ — the block hash above reads below this target — nBits 17020f79 — mantissa 135033 (3·19·23·103) shifted up 20 bytes: the target 000000000000000000020f790000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 136,607,070,854,775 (relative to the genesis block)
- **nonce:** η 3·23·43·223·359

## § 2216 — 20.03 ₿ to the zero address

Transaction id, as prose: ⌘²⁵⁶ *Abandon see absurd to this far swamp. Produce idle pool to peace. Our gown is one. Fee get tie during the blood to kitten. Whale detail a capital industry. Chalk caught plunge to champion via museum. Son too predict run.*

- **version:** 2
- **input 1:** spends output 70 of `0e15fa487dde7a4da14e09599b154623056fbd56b35869b09a41baf6ba15c61b`
  - script: s⁷¹ Abandon may get its absurd crime. Twin between route dig. Our correct gloom afford truth. A maid reflect salon. Problem out ready lottery. The high rug inform burger. Rhythm set decade to a typical damp. The robust father grace shrimp. Memory horse the vibrant fall to a dumb sky. Its unhappy radio how see manual. Hit may reflect casino. Saddle shall get kingdom to tone. Due may announce to fruit for refuse. A lonely sky get some cap. Ban are lazy to height out sin to the valid cage. p³³ Pay about see absurd. Brick may source orbit to parent. A fatal glimpse set uncle. Its arctic are sad. The grain grunt mansion to hair. Debate bronze trial via a hungry sin. A keen pot is easy to a method. Its chronic blossom may profit a cross.
  - sequence:  — replaceable — signals opt-in RBF
- **input 2:** spends output 1 of `36b64b8d571196fd7ab4ae856584b31e1f91c60b8774319b17ea6134510ededd`
  - script: s⁷¹ Abandon may abuse lizard. Torch guide to follow. Napkin set doll per victory. Castle may see tooth to stable. Plastic get our talent. Torch set a rude travel to cross. The grocery is diesel. Cloth author ceiling to report. Its limit is easy via canal. Toast stick cabin to recall. Elder slim cross via bulk. Sky may forget version to nominee. Due may expire question per cow. Sir decide hello to cave for anger to chair. The rare page may swear its parent out nod via rub. p³³ Pay about see absurd. Brick may source orbit to parent. A fatal glimpse set uncle. Its arctic are sad. The grain grunt mansion to hair. Debate bronze trial via a hungry sin. A keen pot is easy to a method. Its chronic blossom may profit a cross.
  - sequence:  — replaceable — signals opt-in RBF
- **input 3:** spends output 59 of `bdb3fac5c73bef92103f023384f1cdddca7181523a53ef4be0fdd528001bb572`
  - script: s⁷¹ An abandon set absurd. Pass why see hockey. Either red school is vast. An annual width set raccoon. Its eye maze credit. Actress tape to fence. The dish like to obtain via float. Our bounce employ ranch to chicken per shift. Our crew tumble its casual butter. Twist joke to arrest via winner. Tag see owner to a mechanic venture. Aunt firm leader to weekend. Survey must set peanut. Its dawn cry to describe. Leader not gasp cut. p³³ Pay about see absurd. Brick may source orbit to parent. A fatal glimpse set uncle. Its arctic are sad. The grain grunt mansion to hair. Debate bronze trial via a hungry sin. A keen pot is easy to a method. Its chronic blossom may profit a cross.
  - sequence:  — replaceable — signals opt-in RBF
- **output 1:** 20.02697328 ₿
  - script: ⧉ ⌖ h²⁰ Our absurd absurd abandon abandon. Abandon may abandon abandon. Abandon abandon to abandon. Abandon abandon abandon for abandon. Abandon abandon to abandon. ≡ ∇
- **locktime:** V β56 ■79 — locktime: not before block 950958 — volume 5, book 56, chapter 79

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
