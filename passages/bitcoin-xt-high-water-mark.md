# Bitcoin XT high-water mark

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 372,315 read as a chapter, and its transaction 1
> (of 372) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β81 ■1036 §1 (Volume II, Book 81, Chapter 1036, section 1)
- **Block:** 372,315 — Bitcoin XT high-water mark
- **Block hash:** `00000000000000000d96de2ced118fa2ffae73feefff42b3f4b061187d00ca3e`
- **Transaction id:** `0af6c529732a846bcf9652c494fca72a4495b0de53c0a86d8bac5e27d89f3b60`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=0af6c529732a846bcf9652c494fca72a4495b0de53c0a86d8bac5e27d89f3b60

## Chapter frontispiece — block 372,315

Block hash, as prose: ⌘¹⁸⁸ *Abuse may abuse a wagon to length. The map when see maid. Such spot set hair. Zoo lend an ostrich. Fuel when see the elegant element. Pitch teach race to divorce.* ⓪⁶⁸

- **version:** vaccio abandon 111 — block version 0x20000007 — BIP9 version-bits form; accio abandon — no version rolling; signaling bit 0 — CSV (BIP68/112/113), bit 1 — SegWit (BIP141), bit 2 — Taproot (BIP341)
- **previous block:** ⌘¹⁸⁹ Abuse abuse danger to plug. A laundry may journey its drift. The elegant fan are crazy. Purse badge its bad cupboard. Yes multiply stumble to return. Cactus write mountain per the abandon. ⓪⁶⁷
  - hex: `00000000000000001092fe00096eaf17e99a45d0d53296e2918586d73e9bee26`
- **merkle root:** ⋔ Abandon is acid to cradle. Our dry cow write anger. Its camp is power. The hidden van yes addict its green cube. Post not see sunset. A lap may earn next. Lip become memory to an avocado. A favorite family enroll its early wise.
  - hex: `e34f51962805aa3f5cf113aa5411b38bba1a996920f15b53aa418a40ff0e3de6`
- **timestamp:** 2015-08-31 04:03 UTC
- **difficulty target:** β₆₇ < 1328068×256²¹ — the block hash above reads below this target — nBits 181443c4 — mantissa 1328068 (2²·7·47431) shifted up 21 bytes: the target 00000000000000001443c4000000000000000000000000000000000000000000, which a valid block hash must read below (67 leading zero bits) — difficulty 54,256,630,328 (relative to the genesis block)
- **nonce:** η 2·5·164641133

## § 1 — Bitcoin XT high-water mark

Transaction id, as prose: ⌘²⁵⁶ *Our abandon may get accident. Cow achieve tree to raccoon. Guy invest film out color. Lie far relax scare. Page may promote a clever dress. Fault venture to obtain out our family pot. Sin may reopen to sustain. Analyst get poet via neutral. Blind may scout pop.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■372315 η51987679957039Its above acid sting opera. Swap may solve fat. Worth swap control to ski. Source get our weapon. Unit may kiss tobacco to conduct. The bit is armed. Its candy hawk animal. Each habit is cute. Increase may set energy to arena. Its nod is awful. What acoustic war may set tax. ⓪⁷ A out pie about abuse cash. Dove set ability to disorder. Video weather its leopard for abandon. “/slush/”
  - sequence: ■0 — replaceable; relative locktime 0 blocks after the input's confirmation
- **output 1:** 25.08024726 ₿
  - script: ⧉ ⌖ h²⁰ Absurd see accident to thing. Father photo the sheriff. Raccoon jump pill to produce. Notice may get slight. Element flash traffic to country via cactus. ≡ ∇
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
