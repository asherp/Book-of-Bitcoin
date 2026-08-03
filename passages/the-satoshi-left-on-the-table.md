# The satoshi left on the table

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 124,724 read as a chapter, and its transaction 1
> (of 8) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β62 ■1749 §1 (Volume I, Book 62, Chapter 1749, section 1)
- **Block:** 124,724
- **Block hash:** `0000000000004c78956f8643262f3622acf22486b120421f893c0553702ba7b5`
- **Transaction id:** `5d80a29be1609db91658b401f85921a86ab4755969729b65257651bb9fd2c10d`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=5d80a29be1609db91658b401f85921a86ab4755969729b65257651bb9fd2c10d

## Chapter frontispiece — block 124,724

Block hash, as prose: ⌘²⁰⁷ *Above accuse pudding to skull. Each thing too core its oxygen. Cop caught the tribe. Camera may see method to matrix per torch to season. Brand route the silent major for lake out fun. Object may see guy.* ⓪⁴⁹

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²⁰⁷ An above abuse wage an outdoor industry. Sir recycle wealth to cloud. Year project an idle trend. Our pop seek its vague misery. A they. A due very search the mechanic. A tie may resemble length. ⓪⁴⁹
  - hex: `00000000000040dd4611c29727781b0b8f61a0170eacf7ff4af03f9bb974c63e`
- **merkle root:** ⋔ Abandon may access refuse. March fix cactus to some sleep per fit. Noble are common to our fyi. Cow unveil to sustain. Bit close crouch shoulder. Cap may inspire amount below jaguar. Weasel may drill purity. Lizard see october to child.
  - hex: `3f41a605e57a21e2e7ce144050dd8d43d3956bcf7d2eadf4559601022c1f8e56`
- **timestamp:** 2011-05-18 00:21 UTC
- **difficulty target:** β₄₉ < 6984627×256²³ — the block hash above reads below this target — nBits 1a6a93b3 — mantissa 6984627 (3·13·79·2267) shifted up 23 bytes: the target 0000000000006a93b30000000000000000000000000000000000000000000000, which a valid block hash must read below (49 leading zero bits) — difficulty 157,416 (relative to the genesis block)
- **nonce:** η 2²·103·983·2777

## § 1 — The satoshi left on the table

Transaction id, as prose: ⌘²⁵⁶ *Its abandon is absurd. Each host may input to disorder. Pop relax our roast. Its night recall to include. Cow enlist to frost. Hand may pride war. An awful gun see ability to reform. Scheme purpose to depart. Its asthma may see soccer per meat out arm.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₉ 6984627×256²³ η3·5·7
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 49.99999999 ₿
  - script: p⁶⁵ The abandon is absurd. Cactus may dash safe. Cost tape tonight to its jeans. Our bed are basic. Metal lecture payment to wedding. Rail gasp to detect via the squirrel for sir. Some son own nothing to actress. Novel may decide author via talk per race. The tap is robust. Pop detect cart to athlete. Hobby get pizza out chunk. Rescue reason spell to stage. Its nod may modify to inform per the amazing aid. Its easy motor box copy to maze. Economy rent fancy per stage. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

This coinbase claims 49.99999999 ₿ — one satoshi under the 50 ₿ subsidy, with the 0.01 ₿ of fees the block's other seven sections paid left unclaimed besides. 18 May 2011. A coinbase may claim up to subsidy plus fees; claiming less creates nothing, and nothing here can ever be claimed by anyone later. The shortfall is 1,000,001 satoshis, and it is the chain's smallest deliberate burn.

That it was deliberate is testimony. The miner, the developer known as midnightmagic, described the missing satoshi as a tribute to Satoshi Nakamoto, who had stepped away from the project that spring — an account given on Bitcointalk and carried since in the annotations explorers keep on this transaction ("Midnightmagic's Missing Satoshi," bitcoinexplorer.org). The page shows only the arithmetic; the tribute is a claim, and it travels with a name, as every reading here does.

The 21 million ₿ ceiling is a limit, not a promise, and this page is among the first where the eventual supply was knowingly moved further from it.

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
