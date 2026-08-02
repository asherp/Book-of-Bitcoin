# First standard OP_RETURN

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 308,570 read as a chapter, and its transaction 109
> (of 997) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** II β49 ■1803 §109 (Volume II, Book 49, Chapter 1803, section 109)
- **Block:** 308,570
- **Block hash:** `000000000000000004c31376d7619bf0f0d65af6fb028d3b4a410ea39d22554c`
- **Transaction id:** `8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684

## Chapter frontispiece — block 308,570

Block hash, as prose: ⌘¹⁸⁷ *Its abuse access to glance. Map emerge its deputy couch. A camera get cigar. Our immune is actual. Text note pupil to audit via ethics. Our mansion may uphold sir. A because. Blouse may abandon a pan.* ⓪⁶⁹

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘¹⁹⁰ Our abuse may account wheat to our artefact. Its annual favorite lounge bet. Bed not carry update. Rifle film to spoon for glass. Three also dress a void. Celery may script to divorce. ⓪⁶⁶
  - hex: `0000000000000000351825acaf900e107e314acbaab974bf880841b584333c9f`
- **merkle root:** ⋔ Abandon see accident to sphere. Hockey else faint a stone novel. Our set may include a rid ban. Pan soon set each scissors. Shuffle shift purpose to mango per tape to cattle. This cap may provide still. Actor tilt sentence to seed per ball.
  - hex: `8fb8f087215e01579fd5e02271770ee7eae21d2358cf93c3a5ac1f15a4b12d7a`
- **timestamp:** 2014-06-30 05:45 UTC
- **difficulty target:** β₆₅ < 4284369×256²¹ — the block hash above reads below this target — nBits 18415fd1 — mantissa 4284369 (3²·476041) shifted up 21 bytes: the target 0000000000000000415fd1000000000000000000000000000000000000000000, which a valid block hash must read below (65 leading zero bits) — difficulty 16,818,461,371 (relative to the genesis block)
- **nonce:** η 23·443·190027

## § 109 — First standard OP_RETURN

Transaction id, as prose: ⌘²⁵⁶ *Abandon out account cargo. Cow obscure the vacant item. Our nephew allow to carry for athlete. Pond may grunt its pop essence. Guy detect jeans to february. Our aid often dice old. Cushion may bag aunt. Fold ought enjoy the sphere.*

- **version:** 1
- **input 1:** spends output 1 of `8e40bb1db9029dd648432c56c295788221c1dd97fe1dbee52f767d605fba58c8`
  - script: s⁷² Abandon may access casino. A large sniff shall get mansion. Stuff set museum to abandon. The silver entry resource whale per hope. Guy uncover doctor to the sudden pottery. Some sadness see dad. Insect may get biology. The soft walk embark to scrub. Guitar recycle stove per trial. Out loud time next. The pop mirror is vast. Some war is unable. Some dirt scare pioneer. Struggle set alcohol to stick. Yard may fashion to convince. Forward may enhance yes. Its vivid pie is dizzy. p⁶⁵ Abandon ago set absurd. Carpet document an unaware gun. Feed may dream bit. Pop ought get a proud farm. Our popular network may set lyrics. News shall see glass. Firm school an amateur oyster. Immune minor parent to usage. The guy have impulse. Sir follow accident to pulp. Science announce spell via fall. Fantasy see system to umbrella for current. Twist get health to vacuum. Seed gap thank via pepper. Its bed are olympic. Nerve may set an elder. Yes inform pop to pot for an exotic region.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0 ₿
  - script: ¶ ¹⁹ “charley loves heidi”
- **output 2:** 0.00200000 ₿
  - script: ⧉ ⌖ h²⁰ Absurd accuse scorpion to permit. Bet may situate elite for party. A van is spatial. A morning once see lip. A viable club get our pie. The aerobic employ yes badge gas. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The first OP_RETURN under 0.9.0's standardness rules (March 2014), and the words it kept: “charley loves heidi”. A provably unspendable output — ¶ in the book's notation — embeds data without burdening the set of spendable outputs: it pays a fee, carries no coin, and can never be spent. The long argument over data on the chain starts here.

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
