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

Block hash, as prose: ⌘¹⁸¹ *A cop absorb account. Trip get clerk to lip. Its fragile bracket set alley. Jet must cart husband. Trap may chase the exact corn. Rough may see pottery. A bacon adapt pool.* ⓪⁷⁵

- **version:** vaccio abandon — block version 0x20000000 — BIP9 version-bits form; accio abandon — no version rolling; no soft-fork signals
- **previous block:** ⌘¹⁸¹ Its yes absorb the acid. Cow betray coconut to soda out its top capital. Type may mushroom limb to orchard. Jeans exile our curious blanket for cube per snake. Wrap pool its tie. ⓪⁷⁵
  - hex: `00000000000000000015fe695e8d2e5ed3a7de81d3818ef43a444e1ee7b3ace2`
- **merkle root:** ⋔ Abandon get accident to welcome. Repair set duty for sword via fit. Trust may nerve hybrid to machine. Chapter may see leopard. Cow cram grant to jelly. Enemy out set solution. Such word are ill. Will topple neck to still.
  - hex: `aeee64cab37fb8f50fdbce4ff25dcb2223c099b01070a36cbaafc44d22da2a7f`
- **timestamp:** 2018-12-03 11:59 UTC
- **difficulty target:** β₇₄ < 3266940×256²⁰ — the block hash above reads below this target — nBits 1731d97c — mantissa 3266940 (2²·3·5·54449) shifted up 20 bytes: the target 00000000000000000031d97c0000000000000000000000000000000000000000, which a valid block hash must read below (74 leading zero bits) — difficulty 5,646,403,851,535 (relative to the genesis block)
- **nonce:** η 3·7·24388589

## § 1 — Difficulty −15.13%

Transaction id, as prose: ⌘²⁵⁶ *Abandon access our work to pilot. Noble scrub clown per smile. A today swing to clock for row. Cow give to hold via panther. The rid assault once see visa. Its cash get faculty. Lake sight fit to ticket for repair to tunnel.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■552384Abuse access attitude to scare. Minute may get an illegal basket. Poverty depend access to cry for length. “a,/BTC.TOP/” Our above acid sting opera. Swallow twin cousin to its aware choice. Yes may devote the left noble to monster. Our mobile business repeat elevator. Layer may open portion. Catalog trap search to a sorry slice to spot. Reveal may raise an abandon. ⓪⁷ Cow absorb to achieve via amount. Diagram tilt to abandon for blood. Another better primary may divorce cop.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 12.76129339 ₿
  - script: ⧉ ⌖ h²⁰ Absurd may accuse spoon. Bus fringe vapor to the capable tax. Tea may enable our project. Bit may absorb eye. Purity gasp ribbon to crunch. Immune may gas its hit. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² An abandon accuse grief to kiwi per either oven. Dish grit tuition to a lucky sky. The rural dream inherit earth. Tail may set avocado to patch. Host stone an innocent dilemma. Jewel achieve liar to bulk.
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
