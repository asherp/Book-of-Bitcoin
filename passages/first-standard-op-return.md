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
- **Read live:** https://asherp.github.io/Book-of-Bitcoin/bitcoin-book.html?txid=8bae12b5f4c088d940733dcd1455efc6a3a69cf9340e17a981286d3778615684

## Chapter frontispiece — block 308,570

Block hash, as prose: *Era may set some poverty. Our polar ecology get tomato. Pink is odd until a park. Winner may ready to remember. Tiger answer rail out fruit. A second seek cactus.*

- **version:** v2 — block version 2 (0x00000002) — pre-BIP9 integer form
- **previous block:** h Palace thunder to thrive for hedgehog. Our awesome dust worry now. Print may fog middle to wire. Abstract embark the salt. Our lucky blouse may pool fyi.
  - hex: `0000000000000000351825acaf900e107e314acbaab974bf880841b584333c9f`
- **merkle root:** ⋔ Kick get horn to harbor. Clay see its width. Our fancy atom get ketchup. Flag set body to judge. Still see our ill desert. Setup may foster a stereo. The wide scare rough blur. Weapon get timber to theme.
  - hex: `8fb8f087215e01579fd5e02271770ee7eae21d2358cf93c3a5ac1f15a4b12d7a`
- **timestamp:** 2014-06-30 05:45 UTC
- **difficulty target:** β₆₅ — nBits 18415fd1 — a valid block hash must read below 0000000000000000415fd1000000000000000000000000000000000000000000 (65 leading zero bits) — difficulty 16,818,461,371 (relative to the genesis block)
- **nonce:** η 1936185103

## § 109 — First standard OP_RETURN

Transaction id, as prose: *Lounge reason its fun human. Spoon may get dolphin. Its picture could tide crunch. A smooth claim is elegant. Our humble pride farm police. Infant almost set its giraffe. Limit ensure our matter to riot per a gas.*

- **version:** 1
- **input 1:** spends output 1 of `8e40bb1db9029dd648432c56c295788221c1dd97fe1dbee52f767d605fba58c8`
  - script: s⁷² Dutch hurry to defy for pot. Its ill foot is mutual. A parade boil siren to report. Palace too set pumpkin. A laugh may pool the force. Its cow never waste traffic. Upgrade how set actress. Our pan keep gain. Math flag the smooth stool. Width get a rug. The correct detail is famous. Faculty may set owner. A bet are rural. Elephant retreat a feed. Pot may depend dolphin to boy for save. Skill echo to merge. Guy may sing pact for chimney. Cactus too set ear. p⁶⁵ Affair may siege laugh to hollow. Tunnel portion the night skill. Its crush set crater. Its spawn increase clump. Turtle fix science to record. The hotel is random. Cross is digital to minor. Purity clip parent per the interest. Job yet thrive focus. Pan ago clean clerk. Breeze talk chat to buddy. Minute may see dignity. Yes obscure the typical fossil. A stairs are viable. Each family is happy to example. Meat set bird for length.
  - sequence: ● — final — disables the transaction locktime for this input
- **output 1:** 0 ₿
  - script: ¶ ¹⁹ “charley loves heidi”
- **output 2:** 0.00200000 ₿
  - script: ⧉ ⌖ h²⁰ Return set our crucial decrease. Poverty may beef owner. Its pop deliver music. A viable oyster easily calm the cinnamon. Timber is odd to a low hire. ≡ ∇
- **locktime:** □ — no locktime — final with respect to time

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. See [/llms.txt](https://asherp.github.io/Book-of-Bitcoin/llms.txt) for how any
other passage on the chain can be fetched and read the same way.
