# Duplicated coinbase e3bf…468, second printing (BIP30)

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 91,880 read as a chapter, and its transaction 1
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β46 ■1161 §1 (Volume I, Book 46, Chapter 1161, section 1)
- **Block:** 91,880 — Duplicated coinbase e3bf…468, second printing (BIP30)
- **Block hash:** `00000000000743f190a18c5577a3c2d2a1f610ae9601ac046a38084ccb7cd721`
- **Transaction id:** `e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468

## Chapter frontispiece — block 91,880

Block hash, as prose: ⓪⁴⁵ ⌘²¹¹ *Canyon room its crazy object. Logic may crush bargain. Lens note to identify. Diet may dry club. Our faculty ought tail to ranch. Cow pave maple for our express asthma.*

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⓪⁴⁵ ⌘²¹¹ View may offer fuel to verb. Sting is entire for joy. Aim where see its fantasy. Slot pulp climb to plunge. The yes is happy. The true rub satisfy regret. A liquid may amount dig to our tie.
  - hex: `000000000004099656bf4a3fda4db1b25630634afa2a201e975e4df9772df3f3`
- **merkle root:** ⋔ Its trouble may knife candy. Pop submit to cap. Its unhappy best text stamp. Flock drum bunker to side. Ivory may cage swim per car. Lot may extend a still. Our awkward cop disagree catch. Pop wide protect theme.
  - hex: `2f6bf541621f43b8fa5012f976406ef7e379704859a3eeb72ad40e6c85740fe9`
- **timestamp:** 2010-11-15 00:36 UTC
- **difficulty target:** β₄₄ < 946774×256²⁴ — the block hash above reads below this target — nBits 1b0e7256 — mantissa 946774 shifted up 24 bytes: the target 00000000000e7256000000000000000000000000000000000000000000000000, which a valid block hash must read below (44 leading zero bits) — difficulty 4,536 (relative to the genesis block)
- **nonce:** η 2306754076

## § 1 — Duplicated coinbase e3bf…468, second printing (BIP30)

Transaction id, as prose: ⌘²⁵⁶ *Its hamster pepper stomach to hollow. Excess may point the tilt. Sky defy its guilt. List may see the arctic. Cow inject to lend. Click enter lawsuit via steel for section. Our mistake set giant to document. Paddle see zebra via gas.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₄ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ An advice why set yes. A myself. Sign see our gadget. A door coast the clean flower. Our uncle get dune to gold. Any red may keep tortoise. A next set boy. An immense son may cancel leopard. A myself. An immense bean get zebra to bundle. A bleak start pipe barrel. A due may say some skill to cushion. Yes describe smoke via its vivid pan. Each red is vibrant. Dash neither set that clay. Wool goose tornado to cereal. Habit set a bonus. Snack see soul to cactus. ∇
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
