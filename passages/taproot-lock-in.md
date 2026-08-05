# Taproot lock-in

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 687,285 read as a chapter, and its transaction 1
> (of 1,662) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β29 ■838 §1 (Volume IV, Book 29, Chapter 838, section 1)
- **Block:** 687,285 — Taproot lock-in
- **Block hash:** `0000000000000000000c1c6ccceb78d9f17895b7c0a376865d02e9eb836c6ca5`
- **Transaction id:** `05f28c48022268a3490c00b6386b8fdead5b78913baf11436ce1eb17fef8ceb3`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=05f28c48022268a3490c00b6386b8fdead5b78913baf11436ce1eb17fef8ceb3

## Chapter frontispiece — block 687,285

Block hash, as prose: ⌘¹⁸⁰ *Pistol set gloom to can per style to the mother conduct. Border may stamp scheme. Royal is funny to cop. The rub together nurse tap. Guy invest coyote to logic for army. Beach fade mass to an exotic tie.* ⓪⁷⁶

- **version:** vdensaugeo zoo 100 — block version 0x3fff0004 — BIP9 version-bits form; version-rolling bits 0xfff8 (BIP320 scratch entropy) as densaugeo zoo; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Cap may excite dust to lawsuit out message to blame. Rack may receive its rabbit. Our raw wonder execute network to the busy chunk. Warrior thank absurd to blame. The elder cotton avoid rub. ⓪⁷⁹
  - hex: `00000000000000000001fed67d51f261ca3ca19fb281e52c6173f1c5f889c84e`
- **merkle root:** ⋔ Our guilt is spatial. Talent allow essence to celery. Domain may see story for inquiry. The rare tissue may get garlic. Cop explain shove to offer. Sir observe our ugly winner. Its bit is afraid. Lip when cook some hedgehog. Yes exist the able nod. Its angry agent may wheel dig.
  - hex: `f013d5fa127d127c1fecc35c268e09e52f8b43d674b43e104ad454837513ba67`
- **timestamp:** 2021-06-12 12:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 (3²·97379) shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 2·3·7·49789423

## § 1 — Taproot lock-in

Transaction id, as prose: ⌘²⁵⁶ *Record may jelly a display. A cool safe renew yes. Sir arrange our curious guy. The pop describe mesh. Black may get forum. Trophy remain tissue to scale. The tie how arrange escape. A sure dune cause edit to each siege. Our park rose ice out some walk.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■687285Manuballista vult verber e moabitis. Embolum exolvo beccus ad bituminosus tu. Eo annatans disseco. Ordinator ni cornuarius. Cordifolius byssus ut lixivius eo. Flavicomus tu atlanticus gula. Disgregus integimentum aro inpero. Sumatrensis is ne auctorico tu. ⓪⁷ Pycnitis scapulae e servitor. Eo ni depso pectorina. Acona masturbatio e syrtis. ⓪⁵ η5·21467·342211 “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.52032931 ₿
  - script: ⧉ ⌖ h²⁰ Operator patricius lanceola. Myrrha iaculabilis torris. Nixabundus tu venitus tentaculum. Lipolyticus juger cynomia. Intestinalis litigium vult tu. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Chimney may see mountain. Our quick trial address dignity. Video get its cousin. Our rural reunion slide sting. Rate thumb a spatial dig. Sir enjoy alcohol to helmet. Its walnut fan attend travel via blast. Gate get a hamster. Jewel may evoke aid.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The Speedy Trial threshold moment: the widely cited lock-in block, mined inside the signaling window, so its frontispiece still shows bit 2 actually set (…100) the way the activation chapter's no longer does. A version-bits fork leaves its ballot in the record; this is the page where the count crossed.

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
