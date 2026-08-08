# First native SegWit outputs

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 481,824 read as a chapter, and its transaction 533
> (of 1,866) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** III β31 ■1345 §533 (Volume III, Book 31, Chapter 1345, section 533)
- **Block:** 481,824 — SegWit/activation
- **Block hash:** `0000000000000000001c8018d9cb3b742ef25114f27563e3fc4a1902167f9893`
- **Transaction id:** `dfcec48bb8491856c353306ab5febeb7e99e4d783eedf3de98f3ee0812b92bad`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=dfcec48bb8491856c353306ab5febeb7e99e4d783eedf3de98f3ee0812b92bad

## Chapter frontispiece — block 481,824

Block hash, as prose: ⌘¹⁸¹ *A ear near sentence sheriff. Our aerobic net is lazy. A mirror are huge. Velvet get penalty to lady. Friend dry a tourist. Good avoid its bright bar. Ship job to avoid.* ⓪⁷⁵

- **version:** vaccio abandon 10 — block version 0x20000002 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 1 — SegWit (BIP141)
- **previous block:** ⌘¹⁸⁴ Length swing to flavor. Chapter get episode for elbow. Type get our runway. Wine see usage to check. Crack buzz the border for style out bulb. A set slam is big. A because. Our rid version number source. ⓪⁷²
  - hex: `000000000000000000cbeff0b533f8e1189cf09dfbebf57a8ebe349362811b80`
- **merkle root:** ⋔ Dolphin set mixture to limb. Zone see a wrist. World may total timber. Rival get alcohol to body. Sun may oppose item. A faculty see cupboard. The abuse get dynamic. The pay may approve matter. Cow yet speak each due. Our cow barely thunder leopard. Bunker see dad to sugar.
  - hex: `6438250cad442b982801ae6994edb8a9ec63c0a0ba117779fbe7ef7f07cad140`
- **timestamp:** 2017-08-24 01:57 UTC
- **difficulty target:** β₇₁ < 81129×256²¹ — the block hash above reads below this target — nBits 18013ce9 — mantissa 81129 (3·27043) shifted up 21 bytes: the target 0000000000000000013ce9000000000000000000000000000000000000000000, which a valid block hash must read below (71 leading zero bits) — difficulty 888,171,856,257 (relative to the genesis block)
- **nonce:** η 2·337·854593

## § 533 — First native SegWit outputs

Transaction id, as prose: ⌘²⁵⁶ *Pudding fruit duty to balcony. Upset are small via knock. Laundry set dinosaur to second. Guilt square to know. Leg may stick ecology via fatigue. Boy due get maid. Each nature is master. A tiny nod may derive theory. Map would solve myth to tribe.*

- **version:** 1
- **input 1:** spends output 1 of `9f37d671d8adb470a8bada662fb0216dc4c907964f329fc79d5e8c0191e30574`
  - script: ²² Alx exquiro remigium e adflictio. Is adfligo arrogantia de dictamnus. Transversum ne glabratus bes. Cotinus inprecans passio. Asinus is ut inrisurus tu.
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 0.00194300 ₿
  - script: ⓪ h²⁰ Affinitas mano toles e flammeum. Ganglion psallo desiliendus. Is vult advento emo e eo. Is revortor clausum ab domitor. Vicis pudice tu.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s The marine base divide to remove via hawk. Pop obtain coyote to the world out bag. Bonus resist deal to opinion via fee. Pop may enrich chaos to change. Day may see hero. Broom ought set basket to muffin via wagon. Exile inhale text to target. Fish set cliff per firm via grace. Public may set example. Frown ought get gym. Muscle may see our food. Sir decorate its reunion. Swift emerge update to stereo via marble to water. Wait scale cake for bag. Science may get our gallery. · p Action borrow cereal to raven per fiber. Repair is indoor to its journey. Combine may grit to inspire for a select rival. A goddess radio its virtual father. Power get century to envelope per hire. Slice forward math to actor. An ancient rally see cactus.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first outputs written in the new form outright — a P2WPKH and a P2WSH, in the activation block — rather than wrapped in a P2SH hash for the benefit of software that had not been upgraded. The book sets them ⓪ h²⁰ and ⓪ h³²: a version byte, then a commitment, and nothing else.

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
