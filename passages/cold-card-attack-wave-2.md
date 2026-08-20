# Cold Card Attack/wave 2

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 960,352 read as a chapter, and its transaction 148
> (of 2,891) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β60 ■1409 §148 (Volume V, Book 60, Chapter 1409, section 148)
- **Block:** 960,352
- **Block hash:** `0000000000000000000163e32fb91749e9d65000fa0c3a41d9509c697a3d6d84`
- **Transaction id:** `be0a120150d5e2bb246047d709e61e300617b7f288a8943f3bdfc04d3462eafc`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=be0a120150d5e2bb246047d709e61e300617b7f288a8943f3bdfc04d3462eafc

## Chapter frontispiece — block 960,352

Block hash, as prose: ⌘¹⁷⁷ *Love why hazard future. Spring shallow its hole. Agent may dose wheel to action. Its cup spoon to multiply. Symptom set sauce for hockey. Absurd set business to try per an obvious divorce. A cute december aim citizen.* ⓪⁷⁹

- **version:** vdensaugeo zoo 10000 — block version 0x3fff0010 — BIP9 version-bits form; version-rolling bits 0xfff8 (BIP320 scratch entropy) as densaugeo zoo; signaling bit 4
- **previous block:** ⌘¹⁷⁷ Harbor may set course to an easy bacon. Each glimpse is stable. Phone holiday to uncover out album. Recipe orphan its amused antenna. Chat may get tomato to absurd. Broom see its desk. Chunk may scale the sudden pay. Cop just purchase rescue. ⓪⁷⁹
  - hex: `0000000000000000000120b789138260cecebea0ec66e3a8a733a60817290669`
- **merkle root:** ⋔ Sir ask our side mule. Neither cinnamon hint absent harbor. The globe get cat. Point may set tree. Our shaft swap weather until cap. Guy ensure tooth to today per start to clinic via gap. The pop expose to scatter. Cow put to settle out palm via rubber. Our simple forest get engine.
  - hex: `2e94beb2526a8d9b5c4b712fbeb64ffc739d7a4463482b80d790124a45fe580d`
- **timestamp:** 2026-07-31 05:48 UTC
- **difficulty target:** β₇₈ < 146132×256²⁰ — the block hash above reads below this target — nBits 17023ad4 — mantissa 146132 (2²·7·17·307) shifted up 20 bytes: the target 000000000000000000023ad40000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 126,231,507,121,868 (relative to the genesis block)
- **nonce:** η 2³·474911497

## § 148 — Cold Card Attack/wave 2

Transaction id, as prose: ⌘²⁵⁶ *Woman out see fantasy. Minimum oppose to assume. Its outside guy wrestle out. Cut never get material. Noble shift the arrest to acid. An indoor chef may see trophy per gasp out chair. Our weather is primary. Abandon get math to cliff. Pop scatter clown via bottom. Jungle monkey wreck to jewel. A bike set pan for map.*

- **version:** 2
- **input 1:** spends output 0 of `d8fb824e7841be3b689a82a78c7ce5a0c0a8636a4a74aff98ddb72e94541ce6f`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 0.11470954 ₿
  - script: ⓪ h²⁰ Bellipotens circumcisio taedium. Chrysolitus matella e siligo. Eo protero haustus de annotinus domnio. Is abaliud paragoge. Tu conmoveo chymus e atmosphaera se ampeloprasum. Narica ne incalco eo.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s A raw tap may hurt wheel. An eager map are easy. Smoke may zone sniff to return. Humor duck a civil finger for tomato. Sky may slim december. Cop ought betray suit. Bet yes connect universe. Pluck announce its total security. Zero see dilemma to young. Shallow may set its silly impact. A lucky bundle birth wise. Hit may exist to earn. Regret set napkin via problem. Its shallow quality fatigue animal. A lip never party its aim. Lab may call mesh. The awesome kitchen convince year. Elevator see wheat to nurse. An arena may flag cop. · p Cap across wheel the early bulb. Pop absorb pan between bed. Our guy is unhappy. A red involve senior. Chair may palm usage. Unit get island to fun. Son wrestle target out hand. Our useless deputy knee yellow. Stem see notable to advance out orchard. Sock task to pave per december to a nice rice.

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
