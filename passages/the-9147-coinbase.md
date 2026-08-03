# The 91.47 ₿ coinbase

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 818,087 read as a chapter, and its transaction 1
> (of 4,179) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** IV β94 ■600 §1 (Volume IV, Book 94, Chapter 600, section 1)
- **Block:** 818,087
- **Block hash:** `0000000000000000000022d1fbfb5ea34357dc2c341b160abdf2e8c5a774f847`
- **Transaction id:** `edcce7024dfa1669bf73475db685c158c942b332e153d5e868a08dddae5e7491`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=edcce7024dfa1669bf73475db685c158c942b332e153d5e868a08dddae5e7491

## Chapter frontispiece — block 818,087

Block hash, as prose: ⌘¹⁷⁴ *Lap about access pay. Cow divert brush to exhibit for future. The junk vintage drift brass. Pause damage its purse. Demand quarter the useful kick to capital.* ⓪⁸²

- **version:** vevanesca climb — block version 0x2ac12000 — BIP9 version-bits form; version-rolling bits 0x5609 (BIP320 scratch entropy) as evanesca climb; no soft-fork signals
- **previous block:** ⌘¹⁷⁸ Yes absorb accident to jeans. Some color may need check. Sky depend to flee. Crawl is antique via fork. Toe fork the menu. Its acoustic cow have to smile. Gym may blossom tie. ⓪⁷⁸
  - hex: `0000000000000000000368656e1a04b2b82d8e6feb099531d67570e2c9b6f46e`
- **merkle root:** ⋔ Abandon access island to hunt via hamster. The poverty right park level. Blind may decline tuna to virus. Quality may burst permit out fuel via lecture. Sight may get ginger. Pear set sword to kingdom. Bar may breeze map.
  - hex: `dc9844f5c40d518805197fefcaa83df24afaa91fc7170514a873915ab4bdcd4e`
- **timestamp:** 2023-11-23 09:59 UTC
- **difficulty target:** β₇₇ < 285202×256²⁰ — the block hash above reads below this target — nBits 17045a12 — mantissa 285202 (2·142601) shifted up 20 bytes: the target 000000000000000000045a120000000000000000000000000000000000000000, which a valid block hash must read below (77 leading zero bits) — difficulty 64,678,587,803,497 (relative to the genesis block)
- **nonce:** η 2³·31·1973·6143

## § 1 — The 91.47 ₿ coinbase

Transaction id, as prose: ⌘²⁵⁶ *Abandon out account a merry pie. Cut ago bless cop. The frozen sugar get south. Photo see boy to fault. Another proud machine may set a night general. A bitter slight is electric over surge. Combine pill lift to palace via oval.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■818087η3³ “Mined by AntPool” Above abuse to situate. The exact advice above abuse churn. A fluid wife may sting opera. A swallow equip now to patch. Cigar get dolphin out rent per a drama. Bet too omit robot. Smoke how medal a thought cube. The hip is vivid. The due stool is dumb. A harsh cop inform to ranch. Leaf get grief via laugh out our cactus. ⓪⁸ η3·101·55927759 ⓪⁶
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 91.46634113 ₿
  - script: ⌖ h²⁰ Its absurd access flame. Its invite see faculty to wish. Front purse to ring. Bed may exclude to describe. Tourist may see scene per rain. Our chronic crack may gas. =
- **output 2:** 0 ₿
  - script: ¶ ⋔w h³² Abandon access subject to kiwi via neck. Rifle may set cow to tie. A you. Guy join a dumb dragon. Brief must index to open. A puppy may set a bed. An because. Other red danger is curious. Affair ripple exercise to face. General yes satisfy son.
- **output 3:** 0 ₿
  - script: ¶ ⁴⁵ A guy absorb access to bounce. Stand set meat before a set. Sir leave a produce. Our awkward tax live dig. A pay ago enroll gossip. Guy divert trust to the rural quantum to rescue. Notable may pony suit. Rebel shall know code to chef. Arena may rifle stock per panic. Metal dose tribe to soccer. Our bet is lazy. Its cut clinic may abandon jet.
- **output 4:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:”
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

This coinbase collected 91.46634113 ₿ — 6.25 of subsidy and 85.21634113 in fees, of which 83.65497568 came from one section of this chapter, IV β94 ■600 §4: the record fee in dollar terms, about $3.1 million on 23 November 2023. The tag reads `Mined by AntPool`.

The sum did not simply enter the pool's payouts: AntPool said its risk control froze it while the claim of a hacked wallet was examined, and offered it back against a signed proof of keys — the neighboring entry's reading has that story and its evidence. What this page holds is the other half of the arithmetic: every great fee is also a great coinbase, and the chapter carries both sides two sections apart.

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
