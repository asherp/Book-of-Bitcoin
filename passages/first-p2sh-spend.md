# First P2SH spend

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 174,719 read as a chapter, and its transaction 12
> (of 12) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β87 ■1344 §12 (Volume I, Book 87, Chapter 1344, section 12)
- **Block:** 174,719
- **Block hash:** `00000000000009dd806a658116a13b8b55f5f85ad2c7df44b2d6eea0191cc37b`
- **Transaction id:** `e5779b9e78f9650debc2893fd9636d827b26b4ddfa6a8172fe8708c924f5c39d`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=e5779b9e78f9650debc2893fd9636d827b26b4ddfa6a8172fe8708c924f5c39d

## Chapter frontispiece — block 174,719

Block hash, as prose: ⌘²⁰⁴ *Knock see body to all dove out our uniform float. Beach get wedding to spoil. Style get diary via prison. Recipe is spatial to foam out coach. Our hedgehog are alone. Our drastic pop is hot. Red also leg bed. Another object valve the win. Danger always set tax.* ⓪⁵²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²⁰³ Snow may toast an upper churn. Injury is main to sail for gorilla. The lie almost pigeon its senior debris. Victory situate thumb to tray out vote. Logic may achieve pop. Sin almost suspect a theory. Tomato due help its sir. The guy once get the chimney. Sport may rid to a fyi. ⓪⁵³
  - hex: `0000000000000770f0f53d5f78933b3f9c0e97d406258baf0c436714bc639ccd`
- **merkle root:** ⋔ Pop caught its actual private to cross for act. Piano despair a forward. Deal yet get bulb. Cow inspire to melt. Path rather case a velvet. Its awkward slogan tail lot. Yes smooth to scheme. Coconut may get wood. Cop gather to say per lake. Library may retire its bleak cargo to boy for our sky.
  - hex: `4bff590a7c66757fd91090cf88640f5a45d5bd2338de020f4827009aac5e6024`
- **timestamp:** 2012-04-08 00:54 UTC
- **difficulty target:** β₅₂ < 675966×256²³ — the block hash above reads below this target — nBits 1a0a507e — mantissa 675966 (2·3·113·997) shifted up 23 bytes: the target 0000000000000a507e0000000000000000000000000000000000000000000000, which a valid block hash must read below (52 leading zero bits) — difficulty 1,626,553 (relative to the genesis block)
- **nonce:** η 5·23·97·265493

## § 12 — First P2SH spend

Transaction id, as prose: ⌘²⁵⁶ *Oven set the cabbage to our empty son. The row must mask tax. A you. Skate coil a width to unit. Another warfare may chat the rapid gossip. Van seed to flash. Floor very measure ethics. Test may parrot scale. Shoe set few radio blush. Lottery why struggle war.*

- **version:** 1
- **input 1:** spends output 1 of `7eaa56d72ef929deaf1323b18c1781b87ba203c2653a5278840b43aaa3f8586d`
  - script: 22355
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.01000000 ₿
  - script: ⧉ ⌖ h²⁰ Telaria e quinquiplex linarius. Cassinensis eo vult demano ex cedrium se tu. Is vult inretiendus plumeus eo. Perridiculus is assenesco arresto. Eo ni instupeo coreanicus terminus. Exul pala. Dentalis is est sensificus. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first spend of a pay-to-script-hash output — a lock that says only “the script whose hash is this” and leaves the terms to the spend that reveals them. This one predates enforcement: before BIP16 activated, such an output could be spent under the old rules with the redeem script alone. The same bytes meant one thing the week this section was written and another a few weeks later, which is what a soft fork is. The book renders the reveal as (r): the run of a script the chain had never seen until it was needed.

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
