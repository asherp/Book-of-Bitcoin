# Cold Card Attack/wave 3

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 960,519 read as a chapter, and its transaction 20
> (of 6,354) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β60 ■1576 §20 (Volume V, Book 60, Chapter 1576, section 20)
- **Block:** 960,519
- **Block hash:** `00000000000000000001bc6f94ead7c179bf27959e78b1055841751e5b73d5ac`
- **Transaction id:** `871d99f1ff2f1213a9677cbeca323a8d93c8041906db67e6d1265fe52a58ecb9`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=871d99f1ff2f1213a9677cbeca323a8d93c8041906db67e6d1265fe52a58ecb9

## Chapter frontispiece — block 960,519

Block hash, as prose: ⌘¹⁷⁷ *Our proud process set strategy. Diagram may get the favorite project. A sin is bitter. Congress get ozone to powder. Guy used the vicious buddy. Vocal see faculty to wasp out absurd to boil. Capital may lounge a quote out whip. Aid apart see ocean. A dig are cool.* ⓪⁷⁹

- **version:** vmuffliato lend — block version 0x3fffe000 — BIP9 version-bits form; version-rolling bits 0xffff (BIP320 scratch entropy) as muffliato lend; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ Message pond giant to our drastic doctor to mountain. The unique winter due prepare arena. Our check label to slot for element. Guy reopen some tomato. Our acoustic breeze yellow gate. Abandon enable ball to egg. Our iron why get its fyi. ⓪⁷⁸
  - hex: `00000000000000000002209f6d8fc01c3e9c6ce1a9e0673b210524a186f9f48b`
- **merkle root:** ⋔ Chunk get steak to movie for pioneer to range. Ban may get red during load out film. Its grain is real. A vast arm may set athlete. Bread get its broccoli to minor via crater. The crowd too set family. Pop approve hobby to october. Its ago cloud there absent our new project. Its rid candy ago see its sir. A because. Pair may fit ivory.
  - hex: `ff0a32c566054a898632691cc736e2d085c65f9665b2ba60881c9bd243a2ba28`
- **timestamp:** 2026-08-01 05:48 UTC
- **difficulty target:** β₇₈ < 146132×256²⁰ — the block hash above reads below this target — nBits 17023ad4 — mantissa 146132 (2²·7·17·307) shifted up 20 bytes: the target 000000000000000000023ad40000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 126,231,507,121,868 (relative to the genesis block)
- **nonce:** η 4250962297

## § 20 — Cold Card Attack/wave 3

Transaction id, as prose: ⌘²⁵⁶ *Some tax is rigid. Glare see apple to skirt. Venue is happy via an office for window via alcohol. Sight may cram check to squirrel. Bonus may get cliff. Sort see guilt to embrace. Setup see garment for yellow. The smart invite get yes. Bit there perfect hire. The iron set fat. Cluster may fetch a next to its nod out cut.*

- **version:** 2
- **input 1:** spends output 0 of `36cf7dc0f0c4dc01f62967b8188f55619dbda65ce065a7e9ca8b023491f56096`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00232980 ₿
  - script: ⓪ h³² Propatulum inpubes tu e mutilus elatio at iactatio. Arbustus livia vult attermino triumphalis is. Anonymus eo vult iento rostrum. Vispellio solet conca e duplex levigatio. Funginus alce vult pylorus. Paschalis eo est pone varus eo. Tu vult congemo is. Tu opipare eo.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Stumble may set animal to sky. Guy twice see its gold. Our electric topic beyond butter the hybrid pay. Bed may learn blush. Burger ago see dove. Seed major orbit to a typical now to report. Moment occur our still. Escape thumb brush to kick. A fly see dirt. Print may churn the vivid tea. A certain mesh confirm aid. Sir may live weekend to son. Its viable nephew see pear. Moon may quiz our clever brush. Crazy may get example. Cattle set army to call. Our live radio canoe ridge out physical via figure out baby. An awesome scheme may get lawn. · p Our cap across predict our due farm. Poem may lumber the rid quote. Map far ask scheme. Liberty is heavy to tumble out fame. Our cow may expect its various physical. Cop omit wink to travel. Access agree a boring switch. Lady giggle adult to alpha. Curtain figure a false sound via gossip. Country may get its pot to our tie.

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
