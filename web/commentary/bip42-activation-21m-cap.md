<!-- SPDX-License-Identifier: CC-BY-4.0 -->

The last chapter of the book, and the only one whose date is already known.

BIP42 fixed a defect in the subsidy schedule: the original arithmetic shifted a 64-bit value by the halving count, and at the 64th halving that shift is undefined — on most machines it wraps, and the reward that should have fallen to zero would have come back as fifty coins a block. The patch caps the schedule instead, so from this height a coinbase may claim no subsidy at all.

For the transactions that follow, that means the coinbase of every later chapter pays its miner in fees alone. The §1 of a chapter after this height is still a transaction like any other — it still has the shape this book renders — but the amount it creates is zero, and everything it pays out was paid in by somebody else's transaction. It is the moment the record stops issuing and only circulates.

Nothing else about a passage changes. The scripts, the sigla, the grammar of a spend are untouched: this is a rule about how much a block may mint, not about what a transaction may say.
