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

Block hash, as prose: ⌘²²⁴ *Kit is hip to its ranch. Our endless pop may seek. Our curious red is awesome. A female language abuse urge. Inside may nose charge. Actor would see the pretty maximum to device out slide. Its panic sir avoid to cut.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²¹ Wave quarter to defy for staff. Our live middle erode deputy. Position may identify fortune to zoo. A key is strong. Cop govern taste to orchard via next. The unique wire scale cow. ⓪³⁵
  - hex: `000000001c7eb6ab129cf14659aea1f77f6e116ea8da2193182b08eae6ecf5f7`
- **merkle root:** ⋔ Its giant slight fog satoshi. Bamboo may get grief. Dove see laptop to year. Our tap add to expect. Pop empower balance outside saddle. Marble set gadget to desk. Airport web novel out hill per a wise theme.
  - hex: `1f7fd770697c167ca75e3d742f3b1b81244165e0fee87310cd20b15f6975b961`
- **timestamp:** 2009-01-16 19:18 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2²·7·113·30059

## § 2 — First P2PKH payment

Transaction id, as prose: ⌘²⁵⁶ *Its set bird due chunk red. Ban often clump the toddler. Squirrel hammer its method. Acid is novel to south. Our middle mention are unique. Row is useless to its merry essay. A treat is slender. Day void a lake to a vast theme.*

- **version:** 1
- **input 1:** spends output 0 of `ff3dc8b461305acc5900d31602f2dafebfc406e5b050b14a352294f0965e0bf6`
  - script: s⁷³ Its tiny hollow worry staff. Latin may double pole. Pyramid ago cloud cabin. Pan below fog gain. Some gold may resemble range to time. Son replace our only present. Release may inject to accuse via a aid. Pop isolate drink to width. Pledge oppose to relax per tourist via increase. Frog cry arrest to actor per sister. Wish may fetch domain. Wish why toss a far stomach. Bet correct our aware mouse. A out salt inject to cut per cactus.
  - sequence: ● — final — disables the transaction locktime for this input
- **input 2:** spends output 0 of `2db69558056d0132d9848851fd20329be9cd590fa5ae2b3c55f58931f42e27f7`
  - script: s⁷³ Pencil see fossil to damage. Tie replace to kiss. An exotic sketch get a critic. A payment are narrow. A sad south set library. Corn may get story. Hawk toy diary to arena. Float see a sibling. Salute spread impulse to bridge. Yes enforce the illness for its half fuel. Scissors get other smart crop to clip. Its chapter wash grain via our boring due. Nod must plug its loop. Our grab see the lucky tackle to dolphin. Mercy may winter its cactus.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 100.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Bargain is fragile to its jet. Cow imitate each bag. Lot ago prefer profit. Buyer is rude to twenty. Its son may enjoy. A polar tax erase senior. Balcony copy our sky. ≡ ∇
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
