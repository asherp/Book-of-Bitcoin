<!-- SPDX-License-Identifier: CC-BY-4.0 -->

The one chapter with no predecessor. Every other block cites the hash of the one before it; this header carries 256 zero bits where that citation goes — the book writes it as it is, an empty slot rather than a beginning.

Its target is the one every later difficulty is measured against, and factored on the frontispiece it reads 2²⁰⁸·3·5·17·257. The odd part, 65535, was picked as a round ceiling in hex — 2¹⁶−1 — and falls out as 3 · 5 · 17 · 257: the four smallest Fermat primes, each exactly once. It is the tidiest number the chain has ever mined against. The very next retarget replaces all four with a single five-digit prime, and no target since has had any reason to fall out so neatly — by Gauss's theorem the accident even makes a regular 65535-sided polygon constructible with compass and straightedge, which is a fact about the number Bitcoin opened with rather than about Bitcoin.

It is also the only chapter nobody had to fetch: the genesis block ships inside the software, hardcoded into every node that has ever validated anything, so no reader takes it on anyone's authority. Its fifty coins have never moved, and by a quirk of the original code the reward was never entered into the set of spendable outputs at all. The book opens with a page of speech that cannot be answered and a coin that cannot be spent.
