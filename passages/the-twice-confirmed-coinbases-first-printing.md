# The twice-confirmed coinbases — first printing

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 91,812 read as a chapter, and its transaction 1
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β46 ■1093 §1 (Volume I, Book 46, Chapter 1093, section 1)
- **Block:** 91,812
- **Block hash:** `00000000000af0aed4792b1acee3d966af36cf5def14935db8de83d6f9306f2f`
- **Transaction id:** `d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=d5d27987d2a3dfc724e359870c6644b40e497bdc0589a033220fe15429d88599

## Chapter frontispiece — block 91,812

Block hash, as prose: ⌘²¹² *Abstract far abuse kiwi. Cut slow see victory. Habit are urban to the thumb. Some raven belt its kit. Cow inherit hood to wait. Hollow may monkey its select clock per solid. Lap close theme parade.* ⓪⁴⁴

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²¹⁰ The abstract absurd is keen. Memory return hundred to labor per the ability. Pop convince to impose for trumpet to pizza. Lens return purity per clown. Hawk essay to endorse via kick. Fun set its cactus. ⓪⁴⁶
  - hex: `000000000002afe839294d4e038b5c831bc09632fd717c0980f8f216dc2b360f`
- **merkle root:** ⋔ Abandon may see accident to coffee. Mesh gain ribbon for lift out forum. Hint update pupil to nut. Margin is social out spell. A video see drama. Law jar winner to miracle. Cut may topple roast for island. Our ago circle is far.
  - hex: `49991d7653bec6efebee7d11f27ca2dffcc35ebe95ee5eebd602916b2f2fa665`
- **timestamp:** 2010-11-14 17:59 UTC
- **difficulty target:** β₄₄ < 946774×256²⁴ — the block hash above reads below this target — nBits 1b0e7256 — mantissa 946774 (2·43·101·109) shifted up 24 bytes: the target 00000000000e7256000000000000000000000000000000000000000000000000, which a valid block hash must read below (44 leading zero bits) — difficulty 4,536 (relative to the genesis block)
- **nonce:** η 2²·3³·1913·5647

## § 1 — The twice-confirmed coinbases — first printing

Transaction id, as prose: ⌘²⁵⁶ *Abandon account to slow. A rid invite is famous. Its guy evoke maple. Some match ago inject the math. Its lip may confirm to burst. Some cap must rub. Fyi twice captain a hit. Yes oblige movie to fly per bomb. Cradle may satisfy diamond to the dry trap. Cap may follow a lot.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: β₄₄ 946774×256²⁴ ⓪
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 50.00000000 ₿
  - script: p⁶⁵ Abandon far set absurd. A cash is certain. A supreme session exact throw. Scheme may set neutral to fossil. Space see lawsuit per oil. Volume see honey to slight. Nerve spawn to argue. Our wine is large. Humor come casino to our mixed pie across artefact. Stairs may pepper to undo. The fantasy wage father per edge outside its senior anxiety. The fossil venue may admit vehicle. Pause step to prosper. Raven fly its half squeeze per pan. ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The only two transactions ever confirmed twice, each in four printings between them. Two miners running the same default configuration produced byte-identical coinbases, and nothing in the rules yet forbade it — so each second printing overwrote its first in the set of spendable outputs and destroyed that reward. The book prints all four, because all four were written.

BIP30's ban on duplicate transaction ids switched on by timestamp (15 March 2012) rather than by flag block, with exactly these two offenders grandfathered forever: a rule that had to be written around the record instead of over it. BIP34 later closed the hole structurally — a coinbase must state its own height, so two blocks can no longer write the same one.

Each printing owns its own page here. Pages count positions in the chain, not distinct transaction ids, so the book's page count runs exactly two past the chain's count of distinct transactions — and these are the two.

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
