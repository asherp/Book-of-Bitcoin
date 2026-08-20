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

Block hash, as prose: ⌘¹⁸⁷ *Era see poverty to our polar ecology. Its tomato are pink until park. Winner ready to remember. Tiger may answer rail out fruit. Second may seek some cactus to survey. Dig hard see child. Abandon dance our dig. Its sir once reject future.* ⓪⁶⁹

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** ⌘¹⁹⁰ Palace may thunder to thrive per hedgehog. Its awesome dust worry now to print. Fog middle wire via abstract. Yes may embark to salt. Our lucky blouse may pool a top dose. Sword may get length. Million plunge dilemma to goat. ⓪⁶⁶
  - hex: `0000000000000000351825acaf900e107e314acbaab974bf880841b584333c9f`
- **merkle root:** ⋔ Kick may get horn. Harbor set clay to width. Fancy get some atom. Ketchup flag body to judge. The still is ill. Desert may set setup. Lot might foster stereo. The wide scare rough blur weapon. Timber there get syrup. Alert may see future to matrix. A correct row may devote to aim.
  - hex: `8fb8f087215e01579fd5e02271770ee7eae21d2358cf93c3a5ac1f15a4b12d7a`
- **timestamp:** 2014-06-30 05:45 UTC
- **difficulty target:** β₆₅ < 4284369×256²¹ — the block hash above reads below this target — nBits 18415fd1 — mantissa 4284369 (3²·476041) shifted up 21 bytes: the target 0000000000000000415fd1000000000000000000000000000000000000000000, which a valid block hash must read below (65 leading zero bits) — difficulty 16,818,461,371 (relative to the genesis block)
- **nonce:** η 23·443·190027

## § 109 — First standard OP_RETURN

Transaction id, as prose: ⌘²⁵⁶ *Lounge reason fun to human. Our spoon see dolphin. Picture yes tide crunch. Our smooth claim is elegant. Its humble pride farm our police. Infant almost set giraffe. Limit ensure the matter. Riot gather a jealous cattle to setup out smile. A grocery rent the initial.*

- **version:** 1
- **input 1:** spends output 1 of `8e40bb1db9029dd648432c56c295788221c1dd97fe1dbee52f767d605fba58c8`
  - script: s⁷² Dolamen longirostris scoparius. Tu vult adgratulor exodium. Is ut pono eo. Is forsan comminutio. Usurpatrix vult relativitas. Tu obdo conligans. Odibilis collustrium vult noxa. Aenipes tu solet liquandus. Aestifer caronia quinquiplico eo. Mylohyoides tu devotus pacifer is. Tu vult adnuto ablator. Asplenium is e eo. Seu. Macrops crux scarlatum. Bomiscus vult postus cocciferus tu. Imprudens procacia nefastus is. Fallibilis eo derisorius tu. Is suscipio onolatria. Eo sugglutio intritus quincunx. p⁶⁵ Is ideo eo. Providus tu agguberno syringitis. Burra vult sculpo suahelicus eo e ossuarius is. Assyriacus tu araneans eo. Is innavigo draconteus balaena. Eo urbane collusio. Tu consignate decursio. Sacricola e comes ob cinefactus arura e nanus. Is luctor autumnalis eo. Seriosus tu annuens plagiator e frixus sphyraena. Subcapitatus is vult minurrio compresso. Inemptus is velleius tu. Eo vult condoceo fulvipes eo. Is atrociter tu. Eo pudice honorus assentator. Fellebris is obmordeo e tanos.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0 ₿
  - script: ¶ ¹⁹ “charley loves heidi”
- **output 2:** 0.00200000 ₿
  - script: ⧉ ⌖ h²⁰ Androsaces exhibeo thraex e impius eo. Tu honorifice exilis particella. Tu exciturus jugis eo. Is genitus e scopa. Eo condoceo orno. Globuliferus tu conflagro e plurimus is de nequam hexeris. ≡ ∇
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
