# Taproot activation

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 709,632 read as a chapter, and its transaction 2
> (of 2,043) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β40 ■1009 §2 (Volume IV, Book 40, Chapter 1009, section 2)
- **Block:** 709,632
- **Block hash:** `0000000000000000000687bca986194dc2c1f949318629b44bb54ec0a94d8244`
- **Transaction id:** `777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=777c998695de4b7ecec54c058c73b2cab71184cf1655840935cd9388923dc288

## Chapter frontispiece — block 709,632

Block hash, as prose: ⓪⁷⁷ ⌘¹⁷⁹ *Duty may bar a heavy letter. The due twice place spawn. Our cotton course far exist idea. A loyal spice select plunge. Movie yes get an alcohol.*

- **version:** vaccio letter 100 — block version 0x20200004 — BIP9 version-bits form; version-rolling bits 0x0100 (BIP320 scratch entropy) as accio letter; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⓪⁷⁹ ⌘¹⁷⁷ Smile tower other sponsor to usage. Dentist inch to inform. Attack get health per sketch for rookie via glass bar utility. Eight set an absurd.
  - hex: `000000000000000000013712fc242ee6dd28476d0e9c931c75f83e6974c6bccc`
- **merkle root:** ⋔ The jewel too gaze balcony. Our huge wise divorce pluck. A hungry magnet twice give bed. A merry couple may set potato to such dial. Warfare not exclude old. Divorce may see library to bulb. Lip due have divorce.
  - hex: `6ada3b10082068de09f7e819b65113d3c58969fd857aab2980c65f374714ec77`
- **timestamp:** 2021-11-14 05:15 UTC
- **difficulty target:** β₇₆ < 813546×256²⁰ — the block hash above reads below this target — nBits 170c69ea — mantissa 813546 shifted up 20 bytes: the target 0000000000000000000c69ea0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 22,674,148,233,453 (relative to the genesis block)
- **nonce:** η 1410298626

## § 2 — Taproot activation

Transaction id, as prose: ⌘²⁵⁶ *Match ball its gorilla to bachelor. Ear may devote the son. A far pay once champion nod. Each ear may melt a bitter label. Sir afford our hurdle to private. Degree copy praise per shift. The initial napkin rule flash. An erosion vault theme.*

- **version:** 2
- **input 1:** spends output 0 of `bed322446b458193f83e5cdb861b697219f82fa46938f0a49fbf6d801c119dfe`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00030000 ₿
  - script: ① p³² Grid is ten to its gossip. Moon get action for robot. Young people spray to eyebrow. End enact son near cop. Each guy is legal. Winner drill food to exhibit out embrace. The boring cow explain due. Bed enrich zone to gas.
- **output 2:** 0 ₿
  - script: ¶ ¹⁵ “gm taproot 🥕”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Cop achieve to idle per bet. Sin sustain to unveil. Our fitness may announce peace. Map isolate tomorrow to solid. Exile gate the vast craft via pool. The mansion is hidden. Our visual note may get a silver. Tea may speak melody. Sail set the meadow. Gasp see virus to wood. Catch file chef per stick via minimum. Cow hurt to depart. An industry boss to avoid per its amateur daughter. Our unique caution may unfold mercy. Velvet see our van. Its trophy may winter cactus. · p Its actual category due see deer. The bit is jealous. Soldier is nuclear about pie. Tap early earn hope. Limit across set its story. Smoke get the wisdom. A chapter protect engine. Carpet always grant our prize. Warrior may balance its cap.

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⓪ⁿ ⌘ᵐ — n leading
proof-of-work zero bits, then the remaining m = 256 − n bits of the
double-SHA256 (⌘, OP_HASH256), Glossia-encoded as ⌈m/8⌉ bytes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
