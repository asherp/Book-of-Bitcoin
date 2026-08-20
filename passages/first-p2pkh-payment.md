# First P2PKH payment

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 728 read as a chapter, and its transaction 2
> (of 2) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** I β1 ■729 §2 (Volume I, Book 1, Chapter 729, section 2)
- **Block:** 728
- **Block hash:** `00000000d14f2e97678951ad004d6699babd27e07ca722c46b30dc24c67eed7a`
- **Transaction id:** `6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=6f7cf9580f1c2dfb3c4d5d043cdbb128c640e3f20161245aa7372e9666168516

## Chapter frontispiece — block 728

Block hash, as prose: ⌘²²⁴ *Kit may set hip to ranch. The endless cow seek cap. A curious bet is awesome. Our female language abuse urge. Inside nose charge to actor. A pretty maximum may see device per slide out its panic. Pop awake our refuse. Oil is silly to oil. Wisdom much set dune.* ⓪³²

- **version:** v1 — block version 1 (0x00000001) — pre-BIP9 integer form
- **previous block:** ⌘²²¹ The wave quarter to defy. A staff how live middle. Sin erode deputy to position. Our pop identify fortune for zoo via key. Its strong cop govern taste. Orchard is next to cap. Its unique wire scan total. A certain planet may set soda. Nut shall get logic. Each scrub how see pan. ⓪³⁵
  - hex: `000000001c7eb6ab129cf14659aea1f77f6e116ea8da2193182b08eae6ecf5f7`
- **merkle root:** ⋔ A giant slight fog its satoshi. Bamboo set grief to dove per a laptop. Year add to expect. Cow empower our balance. Outside may saddle marble. Gadget shall see desk to airport. Web get novel for hill out wise. Map there see its six canoe. A due is various. Pot differ to enrich per shove. Aid may set red to the lunar pop.
  - hex: `1f7fd770697c167ca75e3d742f3b1b81244165e0fee87310cd20b15f6975b961`
- **timestamp:** 2009-01-16 19:18 UTC
- **difficulty target:** β₃₂ < 65535×256²⁶ — the block hash above reads below this target — nBits 1d00ffff — mantissa 65535 (3·5·17·257) shifted up 26 bytes: the target 00000000ffff0000000000000000000000000000000000000000000000000000, which a valid block hash must read below (32 leading zero bits) — difficulty 1 (relative to the genesis block)
- **nonce:** η 2²·7·113·30059

## § 2 — First P2PKH payment

Transaction id, as prose: ⌘²⁵⁶ *The bird may chunk its red. Our map often clump the toddler. Squirrel may hammer method. An acid novel south middle mention. An unique bet is useless to set. A merry essay treat our slender day. The void lake is vast to son. Set there see ostrich. War replace people to stand. Test ring to idle.*

- **version:** 1
- **input 1:** spends output 0 of `ff3dc8b461305acc5900d31602f2dafebfc406e5b050b14a352294f0965e0bf6`
  - script: s⁷³ Flavicornis is propemodum apsterritus eo. Is matronaliter vegeto mormyr. Spathifer is undecemplex eo. Tu obtego e delectabilis milvus. Ternarius tu eo ab is. Tu finite sodalicius tu. Is vult pilpito obsoletus dux e angustiosus invidentia. Eo pedatim cauliflorus tu. Eo amplifico is e eo. Tu gradatim sceptuchus. Is cucubo nato. Stigma pungo gelo. Eo guardo praenotatio. Sceptrum vult irrogo. Tu cordicitus columba. Eo hucusque ridiculus is. Tu prophetizo larix. Libamen dicto auctor e columbus.
  - sequence: ● — final — disables the transaction locktime for this input
- **input 2:** spends output 0 of `2db69558056d0132d9848851fd20329be9cd590fa5ae2b3c55f58931f42e27f7`
  - script: s⁷³ Maculatio vult contemptor. Sedum debet consiliarius e is. Tu vult dato jactito. Eo solet substruo incathedro. Multifarius tu vult adflo bitumen. Eo contente cathedra. Is corrugo tragoedia. Duodecennium voratrina. Laodicenus eo adsociaturus appellator. Is depreco perridiculus gynaecium e lacrimatio. Eo insurgendum javanus sellularius. Tu quor fructum. Vesaniens is transvado eo. Tu forsit sceletus. Abpatruus diademalis harenula e harpe. Eo auctorico lagemannus ad confectio. Brucus vult latinitas. Lytta est e tu.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 100.00000000 ₿
  - script: ⧉ ⌖ h²⁰ Narix inportunus annellus. Tu vult pernato mactatio. Eo suprascando reprensus e rutabulum. Opificium vult arundo. Gaudivigens electrix e aratorius istic. Bipes tu coniugens planta. Is convivor e eo. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

Four days after the Finney transaction (16 January 2009): the first payment made to the hash of a public key rather than to the key itself — the form that would carry most of Bitcoin's history. Paying a hash keeps the key out of sight until the coin is spent, and shortens what has to be written down, read aloud, or printed on paper. The book sets the pattern ⧉ ⌖ h²⁰ ≡ ∇, and a reader will meet those five marks more often than any other line in the manuscript.

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
