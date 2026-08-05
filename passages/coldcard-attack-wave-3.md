# Coldcard attack, wave 3

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

Block hash, as prose: ⌘¹⁷⁷ *The guy is proud. A process get strategy. Diagram is favorite to project. A bitter congress set ozone out powder. Its sir used the vicious buddy. Its vocal faculty see wasp. Absurd bargain toilet to tornado for source.* ⓪⁷⁹

- **version:** vmuffliato lend — block version 0x3fffe000 — BIP9 version-bits form; version-rolling bits 0xffff (BIP320 scratch entropy) as muffliato lend; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ Message pond giant to its drastic doctor. Mountain are unique to our winter. War prepare arena per check via label. Slot may see the element. Guy reopen its tomato. The acoustic cow awake to disagree for accident to gas. ⓪⁷⁸
  - hex: `00000000000000000002209f6d8fc01c3e9c6ce1a9e0673b210524a186f9f48b`
- **merkle root:** ⋔ The chunk get steak. Movie pioneer range during load. Film see our grain. Map real get a vast arm. Athlete get our bread to broccoli. Minor far see crater. Each crowd set family. Cop approve hobby to october for cloud to theory. Jeans may get night. An age might set our son.
  - hex: `ff0a32c566054a898632691cc736e2d085c65f9665b2ba60881c9bd243a2ba28`
- **timestamp:** 2026-08-01 05:48 UTC
- **difficulty target:** β₇₈ < 146132×256²⁰ — the block hash above reads below this target — nBits 17023ad4 — mantissa 146132 (2²·7·17·307) shifted up 20 bytes: the target 000000000000000000023ad40000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 126,231,507,121,868 (relative to the genesis block)
- **nonce:** η 4250962297

## § 20 — Coldcard attack, wave 3

Transaction id, as prose: ⌘²⁵⁶ *A rigid glare see apple. Skirt may get its venue. A happy office window alcohol. Our sight cram check to squirrel. Bonus set cliff out sort. Guilt embrace setup to garment. A yellow is smart. Its invite get each theory to staff. Sky set few fatigue.*

- **version:** 2
- **input 1:** spends output 0 of `36cf7dc0f0c4dc01f62967b8188f55619dbda65ce065a7e9ca8b023491f56096`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00232980 ₿
  - script: ⓪ h³² Propatulum sit inpubes e mutilus elatio ad iactatio e eo. Arbustus livia attermino triumphalis tu. Anonymus is iento rostrum. Vispellio e conca. Duplex levigatio sit funginus. Sus vult concateno acutilobus tu.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Stumble may get animal. Its hot lap twice see the gold tie. An electric topic beyond butter hybrid. Jet may learn blush. Each burger set dove. Seed major to orbit. The typical now may report moment. Out could occur still. Escape may thumb brush. Kick out fly dirt. Print churn its vivid row. Our certain mesh confirm to live. Weekend is viable out nephew. Pear may moon quiz. Its clever brush is crazy. Example set cattle to army. Cake get volcano via matter. Advice may get some row. · p Sir across predict our farm. Poem may lumber to quote. Guy ask our scheme. Liberty may get its heavy tumble to a red fame. Son ago expect war. A various physical may omit wink. The travel might access to agree. A boring switch get lady. Giggle set actor to sand. A wheel may key its rub.

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
