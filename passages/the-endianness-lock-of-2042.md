# The endianness lock of 2042

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 390,359 read as a chapter, and its transaction 545
> (of 2,030) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β90 ■936 §545 (Volume II, Book 90, Chapter 936, section 545)
- **Block:** 390,359
- **Block hash:** `00000000000000000461077ab41da50dbc5d4a46e6cf8cffa4cfe67f6e676db6`
- **Transaction id:** `de4b2c8872436bb4a91e8fd68ab59b8cfb663ca06228d3d05aedca03c4bbe865`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=de4b2c8872436bb4a91e8fd68ab59b8cfb663ca06228d3d05aedca03c4bbe865

## Chapter frontispiece — block 390,359

Block hash, as prose: ⌘¹⁸⁷ *Abuse accuse recall to flush. Table get wrist for guitar. Its negative is various to the soup. Yes cram myth via rocket per school. A spoon get item. Monster may alter its amused abandon.* ⓪⁶⁹

- **version:** v4 — block version 4 (0x00000004) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁴ Guy absorb abuse to census via a common mind. Galaxy first see its large pool. An immense wheat foster genius to trash. Seat get our fun finish. The squirrel may quote a war. ⓪⁷²
  - hex: `000000000000000000b6d3b8829784777e30703d9f71404ddfaeee75c6b9a824`
- **merkle root:** ⋔ Abandon accuse fog to mule. The hundred when set pay. Row may aid until son. Pot get a slender comfort to its disorder for pay. Its set twice see some verb. The tap may uncover post to oxygen. Cow exist to rely before sting. Transfer sugar burger to a lucky son. Our common clog is rid.
  - hex: `5c994b09eb61ec9cbf3a14abf5933c8b5a76ca6b7d3f71d172dca39f37454aab`
- **timestamp:** 2015-12-26 23:57 UTC
- **difficulty target:** β₆₈ < 771081×256²¹ — the block hash above reads below this target — nBits 180bc409 — mantissa 771081 (3·29·8863) shifted up 21 bytes: the target 00000000000000000bc409000000000000000000000000000000000000000000, which a valid block hash must read below (68 leading zero bits) — difficulty 93,448,670,796 (relative to the genesis block)
- **nonce:** η 2·10429·21647

## § 545 — The endianness lock of 2042

Transaction id, as prose: ⌘²⁵⁶ *Abandon may get an accident. Yes consider to confirm out marine. Its device issue hero. Bounce get the chronic bench. Audit not set social. Rhythm ago see evidence. The stomach set food to monitor. Vocal is home per story. Our damp dune raise knock.*

- **version:** 1
- **input 1:** spends output 1 of `8285b6608323d2b33ddab04310bb56fb04d8d9635380f745652bbe0a42d6e060`
  - script: s⁷¹ Abandon yet access butter. Ranch get strategy to car via the stamp. Our mechanic two may culture twelve to festival. Guilt kid our exotic tumble for subject. Sin thrive sleep to critic per present to example. The acoustic echo get its fyi. The nice pop discover to submit. Regret may attack risk per siren. Dinner is desert to its index. Our ugly pop clean frame. Mercy may wonder the icon. Due may ignore penalty. Skull could see defense to disorder per its small pot. Map improve card to lens. p³³ Hit about see our absurd. The blue is vital. Giraffe express neck to moral. Film arrive excuse over satoshi. Sir acquire auction to its caution. Our lunar ticket undo kite per lottery. Library get its manual leisure behind bench.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0.00030000 ₿
  - script: ⌖ h²⁰ Its absurd abuse reason purse to square. A common cop inhale health for maple. A buyer jar to reflect. Our armor is outdoor. Focus may get apology to length. =
- **output 2:** 1.09504530 ₿
  - script: ⧉ ⌖ h²⁰ Absurd access judge bar map. Pop devote joke to lemon. Our desert moon prosper our twelve cap per tie. Sir clarify to embody via our rub. A civil plate tower theme. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

0.0003 ₿ arrives at a script hash on 26 December 2015 — twelve days after BIP65 activated and gave scripts CHECKLOCKTIMEVERIFY, the opcode that holds an output until a stated block height or time. Nothing has spent it since, and by the reading below, nothing can before the morning of 30 April 2042.

The story is in the coinb.in issue tracker (OutCast3k/coinbin issue #35, comments of 27–29 December 2015). The developer weex, testing the new opcode by hand, locked these coins intending them spendable that same evening; the network rejected the spend, and dabura667 read the reason out of the raw transaction: the coins were locked until Wed Apr 30 2042 07:14:30 UTC, because the timestamp had been written into the script with its four bytes in reverse order. The arithmetic closes to the second — the intended value, 1451166600 (26 December 2015, 21:50 UTC), byte-reversed reads 2282454870, which is that 2042 morning exactly. "This is why we have testnet."

One caveat belongs in the reading, because it is the best fact on the page: the script itself is not here. A script hash discloses its script only when spent, the spend that would have printed it is the one the network refused, and no spend can come before 2042 — so the record shows a hash, one arrival, and a decade of silence, and the proof of this story is due, at the earliest, on the morning it names. The evidence for the lock is itself timelocked.

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
