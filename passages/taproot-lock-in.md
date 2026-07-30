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

Block hash, as prose: ⌘¹⁸⁰ *Pistol see gloom to can. Style mother to conduct. Border stamp scheme per royal. Its funny pop together nurse bet. Our lap may invest coyote to the logic for army.* ⓪⁷⁶

- **version:** vdensaugeo zoo 100 — block version 0x3fff0004 — BIP9 version-bits form; version-rolling bits 0xfff8 (BIP320 scratch entropy) as densaugeo zoo; signaling bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁷⁷ Yes excite dust to lawsuit. Our message blame rack. Pop receive to rabbit. The raw wonder execute network via a busy chunk. Warrior not thank absurd. ⓪⁷⁹
  - hex: `00000000000000000001fed67d51f261ca3ca19fb281e52c6173f1c5f889c84e`
- **merkle root:** ⋔ Guilt is spatial to a talent. Pop allow essence for celery. The domain set story. Inquiry how see a rare tissue. Garlic explain shove to offer. The cow may observe an ugly winner. A son is afraid. Pan when cook the hedgehog. Ban exist its abandon.
  - hex: `f013d5fa127d127c1fecc35c268e09e52f8b43d674b43e104ad454837513ba67`
- **timestamp:** 2021-06-12 12:18 UTC
- **difficulty target:** β₇₆ < 876411×256²⁰ — the block hash above reads below this target — nBits 170d5f7b — mantissa 876411 shifted up 20 bytes: the target 0000000000000000000d5f7b0000000000000000000000000000000000000000, which a valid block hash must read below (76 leading zero bits) — difficulty 21,047,730,572,452 (relative to the genesis block)
- **nonce:** η 2091155766

## § 1 — Taproot lock-in

Transaction id, as prose: ⌘²⁵⁶ *Its record may jelly display. Cow cool our safe. Sir renew to arrange. A curious pop describe mesh. Black see forum to trophy. Son remain a tissue. Scale may arrange escape. The sure dune cause to edit. Siege may parade lot.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■687285Its wide tax is vibrant. A fork is social. Cargo license castle to jewel. Dad book an easy marriage. Visit imitate to type per term. Giggle may set a fury. Guy scatter a gesture into its flower to lot. A out tap away see gravity. Swim get crime to a jet. An able abandon abandon to abandon. Abandon may abandon to lift. Pop choose an above via cheese. Mail minor tomato to cactus. Abandon abandon abandon per cloth. Its intact shoot may see cactus. “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
  - witness: see footnote a
- **output 1:** 6.52032931 ₿
  - script: ⧉ ⌖ h²⁰ Lab price refuse to reward. Noodle may excuse virus. Its step ready west. Pottery prison a lamp. Shiver yes get advice. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ↧⁴¹ “RSKBLOCK:”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² Its chimney far see our mountain. Its quick trial address dignity to video. Cousin is rural out reunion. Slide sting rate to thumb. The yes is spatial. Son enjoy alcohol to helmet. Our walnut fan may attend travel per blast via its gas.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The Speedy Trial threshold moment: the widely cited lock-in block, mined inside the signaling window, so its frontispiece still shows bit 2 actually set (…100) the way the activation chapter's no longer does. A version-bits fork leaves its ballot in the record; this is the page where the count crossed.

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
