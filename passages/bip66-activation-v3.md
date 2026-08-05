# BIP66 activation (v3)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 363,725 read as a chapter, and its transaction 1
> (of 1) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β77 ■510 §1 (Volume II, Book 77, Chapter 510, section 1)
- **Block:** 363,725 — BIP66 activation (v3)
- **Block hash:** `00000000000000000379eaa19dce8c9b722d46ae6a57c2f1a988119488b50931`
- **Transaction id:** `20ec1f9a155beb9f46cef7dab5bc86e7c9e26052b3b1a960106f0586d773a8f0`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=20ec1f9a155beb9f46cef7dab5bc86e7c9e26052b3b1a960106f0586d773a8f0

## Chapter frontispiece — block 363,725

Block hash, as prose: ⌘¹⁸⁶ *Country how see ethics. Giraffe get choice to blush out female. Shove get enough height to impulse per mercy. Pay may topple rhythm to guard for pay. Row isolate diary to jungle. Blossom piece crisp via attack out length.* ⓪⁷⁰

- **version:** v3 — block version 3 (0x00000003) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁸ An ocean may scare to flag. Guy rotate mix per chef. The red lip often get its inner fyi. Our empty plug is extra. River before cry lens. Place reason job to runway out thought. Our nod are drastic. Length is due to cop. ⓪⁶⁸
  - hex: `00000000000000000fb32e0d606a42615d44d93449a36ba64ee018de6009f898`
- **merkle root:** ⋔ Our vague drum vote some army. Finger market the live curtain. Cow rebuild narrow to december. Need journey furnace out student. Its galaxy are soft to crunch via our width. Pop renew fluid to avocado. Rack see an able bracket. Fatigue may march to owe.
  - hex: `20ec1f9a155beb9f46cef7dab5bc86e7c9e26052b3b1a960106f0586d773a8f0`
- **timestamp:** 2015-07-04 01:54 UTC
- **difficulty target:** β₆₇ < 1458574×256²¹ — the block hash above reads below this target — nBits 1816418e — mantissa 1458574 (2·13·56099) shifted up 21 bytes: the target 000000000000000016418e000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 49,402,014,931 (relative to the genesis block)
- **nonce:** η 2·23·47·4549

## § 1 — BIP66 activation (v3)

Transaction id, as prose: ⌘²⁵⁶ *Our vague drum vote some army. Finger market the live curtain. Cow rebuild narrow to december. Need journey furnace out student. Its galaxy are soft to crunch via our width. Pop renew fluid to avocado. Rack see an able bracket. Fatigue may march to owe.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■363725η29 “Mined by AntPool” Clunis thomix e eversio. Necrologium liberatio ob resonatio. Auctionarius eo condescendo abs is. Tu adplaudo praetexo e tu. Eo cur tius. Favilla tu.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Is conluctor daucum. Cursarius enarratio vult furnarius. Leprosus constrictor anaglyfus eo. Patagonicus is vult beverinus tu. Talaris is ne adcelero emblicus exsequia. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Strict DER encoding: a signature must from here be written one way only. The rule closed a class of disagreement that came from asking a general-purpose cryptography library what counted as a signature — a consensus system cannot delegate that question.

Its activation also produced a six-block fork: miners building on a block they had not themselves validated extended an invalid chain, and the split was resolved by hash power and phone calls rather than by rules. A soft fork is only as strong as the validation standing behind the signals.

— Claude Fable 5

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
