# First SegWit spend

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 13
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §13 (Volume III, Book 31, Chapter 1345, section 13)
- **Block:** 481,824 — SegWit activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8f907925d2ebe48765103e6845c06f1f2bb77c6adc1cc002865865eb5cfd5c1c

## Chapter frontispiece — block 481,824

Block hash, as prose: ⌘¹⁸¹ *Guy absorb to account for orphan. Cabin clown canoe to pistol. A vicious hockey may invest mouse. Guy behave to tone. Trap may get bulb. Control would cart length. Each theme due get tie.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ The sir absorb our account to its hit. Map may absorb theory. Share might crew gap. The delay get gadget. The typical table label deal to mix out winter to solution. The safe son used to fix. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ The abandon access alley. Income auction year to view. Unknown confirm balance out steak. Copy is sick to skin. Our symbol rent minor per puppy. Sir announce its champion to final. Our son enlist maid. The neutral arrive its low lot.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 13 — First SegWit spend

Transaction id, as prose: ⌘²⁵⁶ *Abandon may set our absurd to its title. Pop dismiss to right. Rent proof blossom out fix. Broom today get palace. Our hour is rapid. Cow retire our absurd public to dignity. Lobster giggle six per rule. A bargain may see town to the big ball to tax.*

- **version:** 1
- **input 1:** spends output 0 of `38c8c6473f149aa698c9868f266102def0e370ddfd4c5adb5916417940963658`
  - script: ²² Son about set its absurd. The absent celery may mesh merit to base. Shoot cook fun for emotion. Its faith post our simple crawl. Yes across swarm gym.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00311000 ₿
  - script: ⌖ h²⁰ An absurd abuse not bid future. Hit around bless parent. East set vessel to charge. Guy are low across abandon about file. Bit may inject spring to cactus. =
- **output 2:** 0 ₿
  - script: ¶ ⁷⁵ “BIP141 \o/ Hello SegWit :-) keep it strong! LLAP Bitcoin twitter.com/khs9ne”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Abandon may accuse fence. Parrot due school balance. Space set story to fluid. An aim may wing our welcome. The row are raw. Bed why identify twelve. Effort get pelican to crop via debate to flight. Cow clarify gossip for yellow. Forward not rent lawsuit. The lie hover chicken. Trap feel a banana to a brisk veteran to process. Soul may obscure rack. A kite assume melody. The ago story then drift economy. Its wheel set census to slogan beyond a lens. · p Guy about set our absurd axis. Quote is second to velvet. A tiny parrot is maximum per copy. Cop cancel ride to slight. Couch spring the elephant via its long office. An october modify result. Inquiry set tennis to liberty. Model may see a wild.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first witness ever used, in the activation block itself: it spends a P2SH-wrapped P2WPKH output funded 159 blocks early, parked looking like any ordinary P2SH payment and revealed the moment the rules went live. Somebody had the transaction ready and waiting.

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
