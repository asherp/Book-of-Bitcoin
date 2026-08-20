# Bitcoin Classic high-water mark

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 404,843 read as a chapter, and its transaction 1
> (of 1,642) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β97 ■1308 §1 (Volume II, Book 97, Chapter 1308, section 1)
- **Block:** 404,843 — Bitcoin Classic high-water mark
- **Block hash:** `000000000000000001f8f246db5123aa60eed70a60a9dab884fc7d8e79c5e46e`
- **Transaction id:** `6f20564d5cd45880dbaff9728c3e5b79edadb6735cf6813a5895cd169f9db8fd`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6f20564d5cd45880dbaff9728c3e5b79edadb6735cf6813a5895cd169f9db8fd

## Chapter frontispiece — block 404,843

Block hash, as prose: ⌘¹⁸⁵ *Its humble change see fury. Brother thank the drastic toddler. Festival gas find to wine. Scout is peasant for pottery. Home tattoo way to amount. Scheme may prison door. Length crowd session to hill. The fence is odd.* ⓪⁷¹

- **version:** v4 — block version 4 (0x00000004) — pre-BIP9 integer form
- **previous block:** ⌘¹⁸⁶ The stick mean lock to soldier out meat. Its yes is large. Scare master to depend. Each wheel yet egg each alert. A warm sir may achieve to melt. The set cattle get blade. Cow avoid the whisper. Start may pistol length. Cop undo bulk inside worry. ⓪⁷⁰
  - hex: `0000000000000000021722a9a203721f031b41ff3a451470faa048e70d3ab1d5`
- **merkle root:** ⋔ An infant radar raven its tumble to firm. Some sister see few hand. The little profit set bachelor to summer. Lawn remove to educate. Trick flower lamp per symbol via lion. Hybrid resemble its row. Our awkward document may parent water. Trend is senior to an inner grain. Diary see lie to the guy.
  - hex: `32846e0117c1719b8f5943a7d16be197ec44789582466315937525f5c9165673`
- **timestamp:** 2016-03-29 14:31 UTC
- **difficulty target:** β₆₉ < 435395×256²¹ — the block hash above reads below this target — nBits 1806a4c3 — mantissa 435395 (5·31·53²) shifted up 21 bytes: the target 000000000000000006a4c3000000000000000000000000000000000000000000, which a valid block hash must read below (69 leading zero bits) — difficulty 165,496,835,118 (relative to the genesis block)
- **nonce:** η 2²·5²·7·31·181·353

## § 1 — Bitcoin Classic high-water mark

Transaction id, as prose: ⌘²⁵⁶ *World get shaft to guitar. Row may collect sun. Project tube to disagree. Its fragile oval see problem. Ban sustain noble to palm per crack. Game quit swing to bike. Post shadow prison like pan. Its map there set its injury. Some claw see a today to our door for can. Tie close set crazy.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■404843Aer fabarius pharetra. Tu discrimino physicalis longaeva e epopta. Sobrietas ob theatrum. Omoticus tu abs olivetum. Eo vult rubrico inrisurus. Eo missito calliditas e lanceolatus eo. Is inpellens de tu. “BW Support 8M fisher jinxin	/BW Pool/”
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 25.52170126 ₿
  - script: ⧉ ⌖ h²⁰ Gabalium vult plantago. Ambulator ni scepticus. Sphragis vult sardo bajulo supra insulatus tu. Is extutare peculor e alveolus. Catonium est montanianus se ventralis tu. Eo dissupans e caccabus ex barbaries. ≡ ∇
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
