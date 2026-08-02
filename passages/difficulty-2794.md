# Difficulty −27.94%

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 689,472 read as a chapter, and its transaction 1
> (of 2,309) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β30 ■1009 §1 (Volume IV, Book 30, Chapter 1009, section 1)
- **Block:** 689,472 — Difficulty −27.94%
- **Block hash:** `000000000000000000124347f70edac39e58d972c79086d860929baf07e455aa`
- **Transaction id:** `f92bdd20747433287af4dae2a1592c9b668a4c7c7f4b55213006adf73e089a6f`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=f92bdd20747433287af4dae2a1592c9b668a4c7c7f4b55213006adf73e089a6f

## Chapter frontispiece — block 689,472

Block hash, as prose: ⌘¹⁸¹ *Cow absorb to accuse. Its famous jungle see aunt. Whale since lock row. Its awkward move describe a rent to raise. Umbrella is unfair via our design for trophy. Our drink may set the mosquito.* ⓪⁷⁵

- **version:** vevanesca point 100 — block version 0x29d12004 — BIP9 version-bits form; version-rolling bits 0x4e89 (BIP320 scratch entropy) as evanesca point; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁰ Guy absorb accident to tobacco. A dig is heavy. Analyst get scissors to retreat. Each peace is bitter. A wool lawn set poem. Village tomorrow get some mom. Proof suit slam to elite. ⓪⁷⁶
  - hex: `00000000000000000009cbc816ab1d430e7a9cc24ffdb6702870112c84a9657c`
- **merkle root:** ⋔ Abandon may abuse gym. Stand spot grab to beach. Chaos is silk via spike. Ketchup get its danger. Seminar print apology to jump. Liberty dash maid out a plug. Guy ignore to modify. Menu may despair congress for son.
  - hex: `78014f16eb68389bc2b037073cde14accae1dd3ccfd14496c92654666952032d`
- **timestamp:** 2021-07-03 06:34 UTC
- **difficulty target:** β₇₅ < 1284302×256²⁰ — the block hash above reads below this target — nBits 171398ce — mantissa 1284302 (2·642151) shifted up 20 bytes: the target 0000000000000000001398ce0000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 14,363,025,673,660 (relative to the genesis block)
- **nonce:** η 3·13·65447353

## § 1 — Difficulty −27.94%

Transaction id, as prose: ⌘²⁵⁶ *Abandon see its accident to lamp per link. Law kiss loan to scene. Click enter winner for basket. Red below have our normal grief. Detail sustain its phrase. The meat may group an elder. Ear away input left.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■689472η3³ “Mined by AntPool” Our above abuse ridge method. Copy may abandon our limit to ethics. A popular body sting opera. Its yes swear round to left. Hobby page comic around enough diary. Our waste rescue bundle turkey. Fame may see broom to history. Coffee may see poverty. Work gaze the mean control. Caution set cat to advice. ⓪⁷ η2²·3·5·24624479987 ⓪²
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 6.58657646 ₿
  - script: ⧉ ⌖ h²⁰ Absurd set our absurd mom to a weird book. Some bed is hidden. Armor train stick to quantum. The hollow rely an unable force. Token coin cactus to due. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon account an olympic visit. Rug yet cash number. Gas see the attitude. A grid is rural to yes. A lunar place skate our pottery. Badge judge to refuse via elder. An ecology grab list to ripple per the layer to clinic.
- **output 3:** 0 ₿
  - script: ¶ ³⁶ Ability may accuse hit. A someone. Egg surround a fringe smile. Mention burden dune to pause. Its pen burst to enhance out pizza. Smoke may empower our note. Its out is large. Clock get woman to network for kitchen to wealth. Travel are steel per autumn for result.
- **output 4:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:*Bgi”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

3 July 2021: the largest downward adjustment ever recorded, against a floor of −75%. China's blanket ban on mining unplugged roughly half the network's hash power in a matter of weeks. The frontispieces either side of this boundary are the ban in two lines of β; the recovery, as the exiled machines came back online elsewhere, took the rest of the year.

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
