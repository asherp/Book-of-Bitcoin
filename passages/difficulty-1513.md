# Difficulty −15.13%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 552,384 read as a chapter, and its transaction 1
> (of 2,245) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β66 ■1345 §1 (Volume III, Book 66, Chapter 1345, section 1)
- **Block:** 552,384 — Difficulty −15.13%
- **Block hash:** `00000000000000000015038a38aa780723a79ae8fc6f1881240dac31aea9189d`
- **Transaction id:** `54a76dc37d15e4f2354a23a5a7261bfc49b6896d05dc1a2f33581cdcca93b25f`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=54a76dc37d15e4f2354a23a5a7261bfc49b6896d05dc1a2f33581cdcca93b25f

## Chapter frontispiece — block 552,384

Block hash, as prose: ⌘¹⁸¹ *Other shed may see high to globe for school. A myself. Pop afford to assume via woman. Dynamic too prefer the ecology. A jealous fence set timber. Document bench a bitter shrug. Winner are useless to die.* ⓪⁷⁵

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸¹ A tired grain may set what guy. Pop develop tone to buddy per split. Our south squeeze may auction. Die prepare pluck to title via effort. Our keen pop divert bench. Cop bless spread to concert out abandon. ⓪⁷⁵
  - hex: `00000000000000000015fe695e8d2e5ed3a7de81d3818ef43a444e1ee7b3ace2`
- **merkle root:** ⋔ Its left fine mass to oppose. Enough tag set the raw host. Its awful luggage get hybrid. Edge coach puzzle since what swallow. Leisure host a youth device to crash. Rival scare its shallow cruise. The clutch is ago.
  - hex: `aeee64cab37fb8f50fdbce4ff25dcb2223c099b01070a36cbaafc44d22da2a7f`
- **timestamp:** 2018-12-03 11:59 UTC
- **difficulty target:** β₇₄ < 3266940×256²⁰ — the block hash above reads below this target — nBits 1731d97c — mantissa 3266940 (2²·3·5·54449) shifted up 20 bytes: the target 00000000000000000031d97c0000000000000000000000000000000000000000, which a valid block hash must read below (74 leading zero bits) — difficulty 5,646,403,851,535 (relative to the genesis block)
- **nonce:** η 3·7·24388589

## § 1 — Difficulty −15.13%

Transaction id, as prose: ⌘²⁵⁶ *Garden nest to verify via return. Sheriff book a round fortune. Air set hobby to horn for negative to script. Our nation may set ozone out piece per its ear. Yes enforce to question via ribbon to cliff. Switch may replace the outer leopard. Pudding may bottom display.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■552384Crypton promoveo praecurro. Ledo mollities. Anachorita accieo mula e inanimis eo. Inlaboratus tu est ad is in tu. “a,/BTC.TOP/” Manuballista verber e atriolum. Oligarchia ni consedo basus. Cirsion vult saltuosus piscarius e camera. Creatrix tettigonium. Vadium agora e intramuralis aenum. Conditorium est palliolatus. Gabonensis eo auctorico fulgor. Is vult affirmo tanos e tu. ⓪⁷ Dryopteris montanea e coclear. Eo ouls fretum. Tu breviter inrumpens is. Eo illuc bombarda. Tu abs is.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.76129339 ₿
  - script: ⧉ ⌖ h²⁰ Bisticosus bucitum vult metaphora. Lagunensis fibula aes. Is innovo genuinus eo. Aereus tergus e acinus. Eo concubo labilis tu. Amplificus is eo e eo. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² A proud month is happy. Beauty yes side coast. Run correct response to marriage for mobile to its silly knife. Our draft village get soccer. Bracket may set excess. March would confirm our due. Its yes then source sense. Its able gasp ago get topic. The evidence too set tax.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

3 December 2018: the 2018 bear market's capitulation. The price sat at a fifth of its peak, and older machines that had been marginal became losses — the target recording, a fortnight late as always, that they had been switched off.

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
