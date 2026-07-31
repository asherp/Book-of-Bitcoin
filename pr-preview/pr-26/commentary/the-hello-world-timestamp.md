<!-- SPDX-License-Identifier: CC-BY-4.0 -->

The oldest OpenTimestamps proof anyone can still replay. The client ships it as its own worked example — `examples/hello-world.txt.ots`, which commits the SHA-256 of the words *Hello World!* — and replaying it lands here: a RIPEMD-160, the raw transaction wrapped around the result, then eleven levels of merkle path, ending on this chapter's merkle root. That landing is the whole of what a timestamp asserts. Nobody's word is asked for, no calendar is consulted, and the proof is as good today as the block is.

It predates the calendar servers by a year and wears the older dress. There is no OP_RETURN in it: the commitment sits where a public key's hash belongs, in an ordinary pay-to-pubkey-hash output of 100,000 satoshis. So the passage reads as a payment — to someone who has never existed, and can never sign. The coins are still there, and always will be. What looks like the most ordinary line in the section is the part that was never about money.

Drop the `.ots` at the foot of the Citations register and the book resolves it, checks it against this block's own header, and keeps it there.
