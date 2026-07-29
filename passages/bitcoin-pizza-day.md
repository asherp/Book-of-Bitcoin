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

Block hash, as prose: ⓪³⁵ ⌘²²¹ *Pop submit word to click. Genre decrease to spot. Rub may receive some red. A they. Fall pretty get warfare. Label mass the select divorce. Its human car may bind mosquito. Our economy is exotic.*

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪³⁵ ⌘²²¹ Letter is possible to orange. Ball see its danger. Cow suffer artist to canoe. Sense conduct more kid fire. Our notable ahead see a low rice. The sure section kick soda. Copy may set our bed to map.
  - hex: `0000000013e7e85518dac94d012d73253d3fdac5c30c4143b177f3086f129580`
- **merkle root:** ⋔ Foam swear to modify for snow. Our elegant ear live program. An alpha plunge faith to cycle. Sir teach to provide. Impact see lady via shell. Virus segment cricket to cradle. Extra much install length.
  - hex: `5c1d2211f598cd6498f42b269fe3ce4a6fdb40eaa638f86a0579c4e63a721b5a`
- **timestamp:** 2010-05-22 18:16 UTC
- **difficulty target:** β₃₅ < 1416228×256²⁵ — the block hash above reads below this target — nBits 1c159c24 — mantissa 1416228 shifted up 25 bytes: the target 00000000159c2400000000000000000000000000000000000000000000000000, which a valid block hash must read below (35 leading zero bits) — difficulty 11.85 (relative to the genesis block)
- **nonce:** η 188133155

## § 1 — Bitcoin Pizza Day

Transaction id, as prose: ⌘²⁵⁶ *Its tortoise get the latin bunker. Cry blossom drop to lamp. Cake between set panther. Delay shiver to erupt. Manual devote a just feed. Love tumble slam to uniform. River is pop for drill out parade.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₃₅ 1416228×256²⁵ η₁₁₈
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.99000000 ₿
  - script: p⁶⁵ Agent ask the solid comfort. A velvet bind brief ripple to frown out a hollow solution. Move retreat to frown via section. Plug see a summer to theme. Sense license our muscle. Hurry may work tiger to help. Picnic get ability out zoo. Nose renew search to call. Museum set our ordinary buddy. Yes tell bean to seminar out a minimum. Ban may engage slight to bonus. Ethics may get still via an okay son. An actual notable parade lie. ∇
- **locktime:** □ — no locktime — final with respect to time

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⓪ⁿ ⌘ᵐ — n leading
proof-of-work zero bits, then the remaining m = 256 − n bits of the
double-SHA256 (⌘, OP_HASH256), Glossia-encoded as ⌈m/8⌉ bytes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
