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

Block hash, as prose: ⌘²⁰⁴ *The knock too see body. All dove uniform float. A beach see its wedding spoil. Style may set diary to a prison for recipe. The spatial foam coach hedgehog. Our alone bed is drastic.* ⓪⁵²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²⁰³ Its snow toast our upper churn. Injury is main to sail. Gorilla almost pigeon a senior debris. Victory situate thumb to tray. Our vote may set a logic. The sir may achieve its out cow. ⓪⁵³
  - hex: `0000000000000770f0f53d5f78933b3f9c0e97d406258baf0c436714bc639ccd`
- **merkle root:** ⋔ Cop caught the actual private. Cross act piano to despair. Forward ago deal bulb. Yes inspire to melt. A path rather case our velvet. Its awkward slogan tail to smooth. Scheme see coconut for wood. Its gas is out.
  - hex: `4bff590a7c66757fd91090cf88640f5a45d5bd2338de020f4827009aac5e6024`
- **timestamp:** 2012-04-08 00:54 UTC
- **difficulty target:** β₅₂ < 675966×256²³ — the block hash above reads below this target — nBits 1a0a507e — mantissa 675966 shifted up 23 bytes: the target 0000000000000a507e0000000000000000000000000000000000000000000000, which a valid block hash must read below (52 leading zero bits) — difficulty 1,626,553 (relative to the genesis block)
- **nonce:** η 2961574415

## § 12 — First P2SH spend

Transaction id, as prose: ⌘²⁵⁶ *Its oven may get cabbage. Its empty map must mask its cop. A you. Skate coil width to unit. Another warfare chat to see. Our rapid gossip get van via seed. Flash floor its very measure. Ethics is far to test per a parade.*

- **version:** 1
- **input 1:** spends output 1 of `7eaa56d72ef929deaf1323b18c1781b87ba203c2653a5278840b43aaa3f8586d`
  - script: 22355
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.01000000 ₿
  - script: ⧉ ⌖ h²⁰ Fork excite its common tax. Set satisfy hour to animal. October ago wire junk. Pan may inspire moment. Wealth ought ball reveal to rose. ≡ ∇
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
