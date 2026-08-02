# Bitcoin Pizza Day

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 57,043 read as a chapter, and its transaction 1
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β29 ■596 §1 (Volume I, Book 29, Chapter 596, section 1)
- **Block:** 57,043 — Bitcoin Pizza Day
- **Block hash:** `00000000152340ca42227603908689183edc47355204e7aca59383b0aaac1fd8`
- **Transaction id:** `bd9075d78e65a98fb054cb33cf0ecf14e3e7f8b3150231df8680919a79ac8fe5`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=bd9075d78e65a98fb054cb33cf0ecf14e3e7f8b3150231df8680919a79ac8fe5

## Chapter frontispiece — block 57,043

Block hash, as prose: ⌘²²¹ *The access achieve science to twenty out a ago fever. The amused six note ostrich to affair via museum. Faint may reveal thunder. Our dynamic is bottom. Fyi about involve bamboo. Its ban are raw. Leopard get course to the length.* ⓪³⁵

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²¹ A new access may account ban. Cow again get the duty. Task monkey a rookie shallow. Habit set our art. Bullet isolate a lazy spoil. Ridge reduce claim to six. Pop speak to betray for spike. An illness may set the length. ⓪³⁵
  - hex: `0000000013e7e85518dac94d012d73253d3fdac5c30c4143b177f3086f129580`
- **merkle root:** ⋔ Abandon access to speak. Symptom is low into hobby. Sir develop pan between gallery to december. Dance mother to replace. Visa guess a mobile tooth per cloud. Pill bomb its open monster. Mass may mask process.
  - hex: `5c1d2211f598cd6498f42b269fe3ce4a6fdb40eaa638f86a0579c4e63a721b5a`
- **timestamp:** 2010-05-22 18:16 UTC
- **difficulty target:** β₃₅ < 1416228×256²⁵ — the block hash above reads below this target — nBits 1c159c24 — mantissa 1416228 (2²·3·11·10729) shifted up 25 bytes: the target 00000000159c2400000000000000000000000000000000000000000000000000, which a valid block hash must read below (35 leading zero bits) — difficulty 11.85 (relative to the genesis block)
- **nonce:** η 5·7·19·282907

## § 1 — Bitcoin Pizza Day

Transaction id, as prose: ⌘²⁵⁶ *Abandon may see our acid cluster. Twelve are veteran to poverty for the scare. Bread may tower lap. Our acoustic pulse wreck sound. Course may guide depth to toy. The slender pitch catalog fan out flight per hill. Its stone may bless each yes.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₅ 1416228×256²⁵ η2·59
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.99000000 ₿
  - script: p⁶⁵ Abandon is absurd to its check. Hello inside impose mosquito. A rare text spoil hit. An unaware guitar isolate mammal. Scare may get pan under jet between cycle. Size absorb burden to another midnight. Law undo author via flavor. Canal is acid to zebra. Recipe range to awake. Jet adjust mirror out tilt. Type voyage to orphan for a broken hair. A fan fringe its slender horse. Our low purse yet set die. A someone. Its guy are bleak to regret. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Ten thousand coins for two pizzas, 22 May 2010 — arranged on a forum between a man who offered the coins and a man who ordered the food, and remembered since as the first time bitcoin bought a physical thing.

What the record says is that ten thousand coins moved to a script. That they bought pizza is testimony from the people involved; no node checked it, and nothing in this passage carries it. Everything the day is famous for — the implied price, the regret, the anniversary — lives outside the record, which is why the claim needs a name on it.

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
