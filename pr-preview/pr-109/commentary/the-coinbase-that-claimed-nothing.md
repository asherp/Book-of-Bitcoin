<!-- SPDX-License-Identifier: CC-BY-4.0 -->

A chapter of one section, and the section claims nothing: the coinbase's single output carries 0 satoshis where the rules allowed 12.5 ₿. 30 December 2017. A coinbase may claim up to subsidy plus fees — the figure is a ceiling, not a floor — so the unclaimed subsidy was simply never created, and no rule exists by which anyone can create it later. The block being otherwise empty, no fees died with it.

It is the largest single-block subsidy destruction on the chain, and it was noticed within days: Bitcoin Core issue #12057 ("0 block reward at height 501726," January 2018) asked whether a node should even accept such a block, and the answer stands — claiming less than the ceiling breaks no rule. The miner is unidentified and the accepted reading, from the shape of the mistake, is a misconfigured mining template that set the payout to zero. That reading is an inference; the zero is the record.
