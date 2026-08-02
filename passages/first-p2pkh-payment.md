# First P2PKH payment

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 728 read as a chapter, and its transaction 2
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β1 ■729 §2 (Volume I, Book 1, Chapter 729, section 2)
- **Block:** 728
- **Block hash:** `00000000d14f2e97678951ad004d6699babd27e07ca722c46b30dc24c67eed7a`
- **Transaction id:** `6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516

## Chapter frontispiece — block 728

Block hash, as prose: ⌘²²⁴ *Access set accident to student. Garden middle evidence per blouse. A pyramid lounge pan. A polar train is antique to kiwi. Praise rebel cross between face. Our cow enroll total. Our bad frame is set to wonder via a length.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²¹ Access is acid to sausage for kite. Soccer party our better girl. Goddess survey drop to lounge via table. Youth may speak ride to churn. Map may get a various red. An they. Priority hollow tide to abandon. ⓪³⁵
  - hex: `000000001c7eb6ab129cf14659aea1f77f6e116ea8da2193182b08eae6ecf5f7`
- **merkle root:** ⋔ Abandon set accident to assist. The front sport wild motor each crowd. Our attack see trophy to warfare. Bone set liquid for elite. Mirror uncover update to diary. A vivid tenant see coconut. Shoot may reveal fuel to token.
  - hex: `1f7fd770697c167ca75e3d742f3b1b81244165e0fee87310cd20b15f6975b961`
- **timestamp:** 2009-01-16 19:18 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2²·7·113·30059

## § 2 — First P2PKH payment

Transaction id, as prose: ⌘²⁵⁶ *Abandon why see the absurd. A sir reflect a yes. Pan easily snake glass. Bridge output duty to genre. Auto get its rhythm. Light is glad to our flight for hollow. Letter out front hazard. Bed may disagree focus to science. Property see tourist out mistake.*

- **version:** 1
- **input 1:** spends output 0 of `ff3dc8b461305acc5900d31602f2dafebfc406e5b050b14a352294f0965e0bf6`
  - script: s⁷³ Abandon is acid to beach. Gun may uphold a parrot per war. Set twice get asset. Device too join gallery. Wrap play spoil to a wait. Cargo rival moment out bargain. Repair suffer to expose per practice to parade. Aspect reform a body. A stove is cruel. Syrup may set pottery. The control next truck poverty. Glide beyond erupt a tone. Yes prevent sir among top to column. Raise get its lottery. Tax little set the mad voice. Parent may set guy.
  - sequence: ● — final — disables the transaction locktime for this input
- **input 2:** spends output 0 of `2db69558056d0132d9848851fd20329be9cd590fa5ae2b3c55f58931f42e27f7`
  - script: s⁷³ Abandon accuse our best to tennis for reward. Sky yes reopen stone. Liar eye pact to assault. Our obvious universe may light per its amused sir. A cop long refuse. Son far exclude creek. Tube may forget a six diet. Walnut observe much tattoo to fabric for maximum to drive. Cop used its ancient trip for goddess out palace. A focus crop rocket to clown via sort. Mouse may see custom. Buyer get the clever chair. Tribe may set alley. Foot then get yes.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 100.00000000 ₿
  - script: ⧉ ⌖ h²⁰ An absurd absurd is next. Toddler mention the million exchange. Fun wing tree to flock. Fiber see deputy via glow. Brown get a mixed length. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Four days after the Finney transaction (16 January 2009): the first payment made to the hash of a public key rather than to the key itself — the form that would carry most of Bitcoin's history. Paying a hash keeps the key out of sight until the coin is spent, and shortens what has to be written down, read aloud, or printed on paper. The book sets the pattern ⧉ ⌖ h²⁰ ≡ ∇, and a reader will meet those five marks more often than any other line in the manuscript.

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
