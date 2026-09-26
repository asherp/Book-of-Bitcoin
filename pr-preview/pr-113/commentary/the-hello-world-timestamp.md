<!-- SPDX-License-Identifier: CC-BY-4.0 -->

The oldest OpenTimestamps proof anyone can still replay. The client ships it as its own worked example — `examples/hello-world.txt.ots`, committing the SHA-256 of the words *Hello World!* — and replaying it lands here: a RIPEMD-160, the raw transaction wrapped around the result, then eleven levels of merkle path, ending on this chapter's merkle root. That landing is the whole of what a timestamp asserts; nobody's word is asked for, no calendar server is consulted, and the proof is as good today as the block is.

It predates the calendar servers by a year and uses the older construction. There is no OP_RETURN in it: the commitment sits where a public key's hash belongs, in an ordinary pay-to-pubkey-hash output of 100,000 satoshis. The passage therefore reads as a payment — but no key matching that hash exists, so the coins cannot move, and never have.

Drop the `.ots` at the foot of the Citations register and the book resolves it, checks it against this block's own header, and keeps it there.
