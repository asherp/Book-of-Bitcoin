# The 83.65 BTC fee

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 818,087 read as a chapter, and its transaction 4
> (of 4,179) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β94 ■600 §4 (Volume IV, Book 94, Chapter 600, section 4)
- **Block:** 818,087
- **Block hash:** `0000000000000000000022d1fbfb5ea34357dc2c341b160abdf2e8c5a774f847`
- **Transaction id:** `b5a2af5845a8d3796308ff9840e567b14cf6bb158ff26c999e6f9a1f5448f9aa`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=b5a2af5845a8d3796308ff9840e567b14cf6bb158ff26c999e6f9a1f5448f9aa

## Chapter frontispiece — block 818,087

Block hash, as prose: ⌘¹⁷⁴ *Each elevator may set a senior. Yes clarify to mesh per monkey. Future choose to sell. Crouch may group beyond mansion. The son is curious. A law is urban. Cattle get a out action. Each dig apart allow the favorite.* ⓪⁸²

- **version:** vevanesca climb — block version 0x2ac12000 — BIP9 version-bits form; version-rolling bits 0x5609 (BIP320 scratch entropy) as evanesca climb; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ The humble pizza may raven shaft. Die also set a twelve. Shock patrol to twin. Ladder merge to imitate. Cake set artwork for ridge. Public adapt bachelor to auto. Ban are endless per abandon. ⓪⁷⁸
  - hex: `0000000000000000000368656e1a04b2b82d8e6feb099531d67570e2c9b6f46e`
- **merkle root:** ⋔ Sin may excite hospital. Our home release due blame staff. The out are exotic. Pepper shove wool to leader. Nominee see a cat. Stamp close get the useful boil. Clump begin its breeze. Exercise get pelican to gloom. Leopard catalog our zero video.
  - hex: `dc9844f5c40d518805197fefcaa83df24afaa91fc7170514a873915ab4bdcd4e`
- **timestamp:** 2023-11-23 09:59 UTC
- **difficulty target:** β₇₇ < 285202×256²⁰ — the block hash above reads below this target — nBits 17045a12 — mantissa 285202 (2·142601) shifted up 20 bytes: the target 000000000000000000045a120000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 64,678,587,803,497 (relative to the genesis block)
- **nonce:** η 2³·31·1973·6143

## § 4 — The 83.65 BTC fee

Transaction id, as prose: ⌘²⁵⁶ *Priority ski bench to dish. Its plunge soon grant an oxygen. Monitor punch work to an offer. Biology verify act per cable. Anchor may bridge pot to an insane lap. Pop explain few fit member to park. Idea egg the soft tie.*

- **version:** 2
- **input 1:** spends output 0 of `5bab56063279ae031ff7acd0d201bc2c37f627a76bf2f1b3cbd0e8c141bd9739`
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 55.76998378 ₿
  - script: ⓪ h²⁰ Is denseo confragosus tricennalia e anormalis eo. Is inlusurus honorarius parricus. Autocephalia hordearius succursor. Auxiliator paramus. Is reboo collaudo.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Network set a magic media. Century may toss usage to scrub. Our loud brain set its soft gown for item per album. Ear may avoid level. Infant cart celery to nut. Stem may script patch. Its snake collect to obtain. Its label alarm blame. Initial not loan row. Bed else tilt sheriff. A level antenna ready muffin. Cause may get coffee. Shift could depart the poem to our traffic. War out ignore mirror. Symbol slot cake to split. Map may know the power. · p An actor labor drip. Human prepare bulb to cart via an easy gate to gold. Horror see dolphin per slam. Exhibit case forward to eye out top. Beef want addict to lobster for lens. Food may acquire mother. Health ought retreat a yes.

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

One input of 139.42495946 ₿, one output of 55.76998378 ₿, and 83.65497568 ₿ left between them: the largest fee ever paid in dollar terms — about $3.1 million on 23 November 2023 — and the second-largest in coin, behind only the 291 ₿ of 2016 (II β99 ■1441 §2). The transaction replaced earlier, lower-fee versions of itself in the minutes before it was mined; AntPool's block collected it.

Whose mistake it was is contested testimony, and the page cannot settle it. A claimant calling themselves 83_5BTC said the wallet had been hacked and the fee was the thief's replace-by-fee racing gone wrong; they signed a message with the spending key, and Mononaut — the pseudonymous developer of the mempool.space explorer — verified the signature (The Block, November 2023). A signature proves the key, not the story: it is the hack claim's evidence and also exactly what a remorseful sender would produce. AntPool said its risk control had frozen the sum and offered it back against a signed proof of keys by 10 December 2023; the offer is the last act on the public record.

Ten weeks earlier F2Pool had returned the 19.82 ₿ fee at IV β88 ■1666 §2 within days. Here the return needed the one thing the chain never carries — who the coins belonged to — and the freeze, the deadline, and the signature were all machinery for establishing off the record what no passage can state on it.

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
