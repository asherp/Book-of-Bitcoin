# Bitcoin Cash fork

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 478,558 read as a chapter, and its transaction 1
> (of 331) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β30 ■95 §1 (Volume III, Book 30, Chapter 95, section 1)
- **Block:** 478,558 — Bitcoin Cash fork
- **Block hash:** `0000000000000000011865af4122fe3b144e2cbeea86142e8ff2fb4107352d43`
- **Transaction id:** `d89853f0fb659caad5b7680656b0aaca8f3093fffe525d4ba422b93f8a52f070`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=d89853f0fb659caad5b7680656b0aaca8f3093fffe525d4ba422b93f8a52f070

## Chapter frontispiece — block 478,558

Block hash, as prose: ⌘¹⁸⁵ *Drip have dove to loop. Sand is elegant via reunion out a move. Our turkey may vapor to bean. Its chronic cop say bachelor. The cow allow to uncover. Blossom amount to sit.* ⓪⁷¹

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Tomorrow may equal art to black. Citizen garage sun via exercise. Its voice rescue initial. Sheriff see oak to priority. Train set cricket via twelve. ⓪⁷²
  - hex: `000000000000000000eb9bc1f9557dc9e2cfe576f57a52f6be94720b338029e4`
- **merkle root:** ⋔ Lie enhance divorce to flag. Album edit to defy. A habit truly size pop. Our cop connect antenna to episode. Sir rotate tribe out radar. Box process a tie. Our pretty pop used cotton. Our female mechanic is nice to gas.
  - hex: `5b65144f6518bf4795abd428acd0c3fb2527e4e5c94b0f5a7366f4826001884a`
- **timestamp:** 2017-08-01 13:16 UTC
- **difficulty target:** β₇₁ < 83765×256²¹ — the block hash above reads below this target — nBits 18014735 — mantissa 83765 (5·11·1523) shifted up 21 bytes: the target 0000000000000000014735000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 860,221,984,436 (relative to the genesis block)
- **nonce:** η 2·3089·318683

## § 1 — Bitcoin Cash fork

Transaction id, as prose: ⌘²⁵⁶ *Its ill yes little get penalty. Our legal ear is mutual. Fall may coin to prevent out year. Wish slow buzz our primary flag. Fix snack result to pull out poem. Slogan sample clap to gloom. Abandon die to hit.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■478558 2017-08-01 13:16“/BTC.COM/” An exact skate may get episode. Voice traffic repeat to surge. Manual again see a current machine. Its pelican word to pole. An online camera get stove for alpha. Maple ask bronze to some goddess out guilt. Our sunny place is notable to whale for an idle exercise. Its above may see our row to the cop. ⓪⁷ η49362083·204369941537 ⓪⁴
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 12.61890202 ₿
  - script: ⌖ h²⁰ A they. Jet may brave bird. Sir cancel language to aunt per police to case out marble. Friend pioneer still to critic. Shallow may equal tea. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Copy mix girl to mammal. Tourist may answer canyon. A cop is shy. Asthma square produce to panic. Three may see a rare fortune. Chunk badge an annual pencil to noodle. Scrap pledge our subject theme.
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The last chapter both chains share. On 1 August 2017 a competing implementation began building on this block under different rules, and everything after it is two records rather than one. Nothing in this chapter marks the split: a chain fork is not an event inside a block, it is a disagreement about which blocks come next. This book reads one of the two, and says so here rather than leaving a reader to assume there is only one.

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
