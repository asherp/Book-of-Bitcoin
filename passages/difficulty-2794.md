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

Block hash, as prose: ⌘¹⁸¹ *Guy prevent the quality acid. Some game set rice to corn. Ginger may spirit shuffle out nothing. File get a diesel. Diet alter tackle to trick. The bamboo burden code. Trip set cactus to element. Its twist may stage to ship.* ⓪⁷⁵

- **version:** vevanesca point 100 — block version 0x29d12004 — BIP9 version-bits form; version-rolling bits 0x4e89 (BIP320 scratch entropy) as evanesca point; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁰ Ladder coil our genre to flag. Blade is due before security. Text may exist the belt to its burden. Our broken crack is stereo. Forest see bonus to animal. Guy borrow butter for drama out theme. Its shift is huge to an usual labor. ⓪⁷⁶
  - hex: `00000000000000000009cbc816ab1d430e7a9cc24ffdb6702870112c84a9657c`
- **merkle root:** ⋔ Code box our olympic smile to draw via gospel. Flip see its olive song. The tragic journey next scout our humor. Map are useless to a tragic radio. Map below sock a spike. Ramp may see chest. An album about size shoot. Border bring to prevent out couch. A dizzy cop get a tax.
  - hex: `78014f16eb68389bc2b037073cde14accae1dd3ccfd14496c92654666952032d`
- **timestamp:** 2021-07-03 06:34 UTC
- **difficulty target:** β₇₅ < 1284302×256²⁰ — the block hash above reads below this target — nBits 171398ce — mantissa 1284302 (2·642151) shifted up 20 bytes: the target 0000000000000000001398ce0000000000000000000000000000000000000000, which a valid block hash must read below (75 leading zero bits) — difficulty 14,363,025,673,660 (relative to the genesis block)
- **nonce:** η 3·13·65447353

## § 1 — Difficulty −27.94%

Transaction id, as prose: ⌘²⁵⁶ *Hurdle may space autumn. Our urban spare would blossom luxury. Practice is legal to due. The tiny card snake to ready. Coast may get the out maple. Our pan may forget its virtual yes. Tax spend art to trophy per dragon. Hub quiz call to thunder. Sin is rigid near chicken. Pupil may explain wealth.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■689472η3³ “Mined by AntPool” Is volito thais abs coccyx. Vesica altar e praegressus. Aspergillum obdormisco plumbeus is. Iambelegus interregnum ea theos. Tu uxorare conpartior. Castellanus delebilis eo. Tu vult plurennis lapicidinae e nemus de plerunque. Is adglomerans suspirium. Tu abstineo concordia. Eo provolvo praemordicus is e eo. Tu imperite prophetizo is. Eo arcuo adincresco e baiulatio. Sortitio ea eo. ⓪⁷ η2²·3·5·24624479987 ⓪²
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 6.58657646 ₿
  - script: ⧉ ⌖ h²⁰ Is medie eo. Tu adseveranter ruptor. Fluminalis gallicrus dispicio vanito e quotuplus eo. Tu fodero is ob illaboratus tu. Eo transpicio pertinax is. Tu ut conprimens coclear. Is vult subplicans aspiro. Is solet emitto repo. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Nation is future to stumble. Sir afford fancy per a red hire. Guy achieve to owe. A proud jeans may mouse. Lie yes believe sun. Bench get its timber. The humor repair out. A happy emotion see arrow. The bed not expect a out jar. Pay exist an earth. Call provide path to math. Degree erase a hidden creek.
- **output 3:** 0 ₿
  - script: ¶ ³⁶ Our rigid angle swap pie. Its merry book ramp adult. Mass before set an inmate. Glow may sing net. Ridge are odd since barrel. Its quick century set legend. Verb is sorry to business via diagram to one. A sir are capable. Report may set science to team. Harbor may get the various embrace. Series may edge to feed.
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
