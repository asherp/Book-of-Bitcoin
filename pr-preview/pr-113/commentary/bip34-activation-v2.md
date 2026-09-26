<!-- SPDX-License-Identifier: CC-BY-4.0 -->

From this chapter a coinbase must state the height of the block it sits in — the chain's first self-referential rule. It also ends the duplicate-coinbase problem structurally: two blocks at different heights can no longer write the same coinbase, so the accident BIP30 had to grandfather cannot recur.
