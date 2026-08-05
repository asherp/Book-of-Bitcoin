# BIP65 activation (v4)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 388,381 read as a chapter, and its transaction 1
> (of 784) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β89 ■974 §1 (Volume II, Book 89, Chapter 974, section 1)
- **Block:** 388,381 — BIP65 activation (v4)
- **Block hash:** `000000000000000004c2b624ed5d7756c508d90fd0da2c7c679febfa6c4735f0`
- **Transaction id:** `8b6f7958d15e6ec35b1afb90132808c306c4957d8de6f5b72024805360291ec3`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8b6f7958d15e6ec35b1afb90132808c306c4957d8de6f5b72024805360291ec3

## Chapter frontispiece — block 388,381

Block hash, as prose: ⌘¹⁸⁷ *Our usual guy pretty swamp each volume. Its rigid recipe may see aid. The vague opera ought source to learn. Drama melt guess out puzzle. Region may see nothing to search. A cactus set lottery. Hero may cancel its length.* ⓪⁶⁹

- **version:** v4 — block version 4 (0x00000004) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁸ Each mind may pair the security. Our heavy talk voice to modify. Guy multiply daring per cradle. Its cop oblige to consider. Donkey may see dignity. Recall ignore way to our elite negative. Its crush may fish abandon. ⓪⁶⁸
  - hex: `000000000000000009f886db2c7c12a497603e86378bace3ead93d350be3f38c`
- **merkle root:** ⋔ An excess climb not drink cap. Its jet soon culture our out ear. Cow consider to enjoy for skull to potato. Red may appear shoot. Sky why gather oxygen. Web get fantasy to the raise. Bracket devote its rigid cereal. A curious math anchor theory. Jazz suggest to egg per tea.
  - hex: `1f02125fc392e79ac71a89c594f1e539301a53c1a856ae925e58a3670c61854e`
- **timestamp:** 2015-12-14 17:24 UTC
- **difficulty target:** β₆₈ < 910927×256²¹ — the block hash above reads below this target — nBits 180de64f — mantissa 910927 (97·9391) shifted up 21 bytes: the target 00000000000000000de64f000000000000000000000000000000000000000000, which a valid block hash must read below (68 leading zero bits) — difficulty 79,102,380,900 (relative to the genesis block)
- **nonce:** η 2³·5·79226183

## § 1 — BIP65 activation (v4)

Transaction id, as prose: ⌘²⁵⁶ *Some son seek to vanish. Fix set poem across tea. Its aware thank may rubber a miracle. A cow uncover our illegal assault to a correct beef. An exact buyer bottom to task. Yes swear a sad yes. Its better device may sail gate. Neck not mix force.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■388381“/BIP100/” Idus vult rhododendron. Tu conseptus cloaca e pes in vanitas. Tu illinc is. Eo belle sona. Elegeon consideratio e defensatrix. “/BTCC/ ”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 25.15227937 ₿
  - script: ⧉ ⌖ h²⁰ Nardus e pelamis ex tu. Is protervio triennium. Tu summitto versutia. Is insterno e occupatio. Tu virescens neomexicanus eo. Tu conplano obiurgo e abronius is. Eo monstro. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

CHECKLOCKTIMEVERIFY: from December 2015 an output can refuse to be spent before a stated time or height. The book draws it τ. It is the first opcode that constrains when a coin may move rather than who may move it, and the delay-based designs that followed — escrows, vaults, payment channels — are built on it.

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
