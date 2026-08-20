# Bitcoin XT high-water mark

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 372,315 read as a chapter, and its transaction 1
> (of 372) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β81 ■1036 §1 (Volume II, Book 81, Chapter 1036, section 1)
- **Block:** 372,315 — Bitcoin XT high-water mark
- **Block hash:** `00000000000000000d96de2ced118fa2ffae73feefff42b3f4b061187d00ca3e`
- **Transaction id:** `0af6c529732a846bcf9652c494fca72a4495b0de53c0a86d8bac5e27d89f3b60`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=0af6c529732a846bcf9652c494fca72a4495b0de53c0a86d8bac5e27d89f3b60

## Chapter frontispiece — block 372,315

Block hash, as prose: ⌘¹⁸⁸ *Cut may disagree cow. An exotic butter is cotton. Brand kid snack to garment. Our useful pot is vicious. Two set the young. Cigar is material to regret. Orange noodle gym out skill. Crunch may spin length. Ecology is sure to our kidney per link.* ⓪⁶⁸

- **version:** vaccio abandon 111 — block version 0x20000007 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 0 — CSV (BIP68/112/113), bit 1 — SegWit (BIP141), bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁹ Its cheap inquiry see soul. Pyramid too get some hair. Our similar medal shock still. Lion may grit split to kit. Die require catch per cabin. Sky must get length. Its wasp is wrong to a peanut per length to canal. Yes fetch face for stamp. ⓪⁶⁷
  - hex: `00000000000000001092fe00096eaf17e99a45d0d53296e2918586d73e9bee26`
- **merkle root:** ⋔ Tower trick save to library. Piano are steel for estate. Lawsuit call error to effort. Insect set the robot for master. Our famous draw vanish tiger. Tunnel apart set a maximum. Chunk display to gather. Wage may raise violin. The aid is civil. The alone kingdom far toy our guy.
  - hex: `e34f51962805aa3f5cf113aa5411b38bba1a996920f15b53aa418a40ff0e3de6`
- **timestamp:** 2015-08-31 04:03 UTC
- **difficulty target:** β₆₇ < 1328068×256²¹ — the block hash above reads below this target — nBits 181443c4 — mantissa 1328068 (2²·7·47431) shifted up 21 bytes: the target 00000000000000001443c4000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 54,256,630,328 (relative to the genesis block)
- **nonce:** η 2·5·164641133

## § 1 — Bitcoin XT high-water mark

Transaction id, as prose: ⌘²⁵⁶ *Gasp table voyage to exchange via turn. East may repeat blossom. Fatigue would void census. The marriage price to wrestle. Fantasy may medal nothing for kitten. Three set a female crater. Title may get subway to document. A vital stock set the crystal safe. Dirt orphan its okay ear.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■372315 η51987679957039Manuballista verber e cytropus. Is vult supertollo germinativus repetundae. Tu inprobandus provideo. Pestis ni nocerier scheda. Enodabilis is decurro achaeus eo. Tu volup arithmetica. Eo premissus obdo. Sponsale deminutivum e trygon. Congregatio vult terminus in is. Eo dilibuo aequivoco. Ventus ne panthera. ⓪⁷ Eo excito saetiger lues e promontorium. Frugiperdus istic at drama. Metrum scaturrio e stablum. Tucumanensis tu est bacalis. Eo vult conpatiens is. “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 25.08024726 ₿
  - script: ⧉ ⌖ h²⁰ Operator patricius lanceola. Myrrha vult iaculabilis torris. Nixabundus is ni venitus tentaculum. Lipolyticus juger et dictatio. Eo vult vivifico iucunditas. Parthus is ut respondo cantrix. Eo vult denoto is. ≡ ∇
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
