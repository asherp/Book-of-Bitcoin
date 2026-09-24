<!-- SPDX-License-Identifier: CC-BY-4.0 -->

Every other reference in this book points inward, at chapters and sections the book contains. These point outward: at documents the book does not hold, which it can cite because the chain has dated them.

The claim is narrow and worth stating exactly. Not who wrote the document. Not that it is true. Only that it existed by a particular block, and therefore before everything the chain recorded after that block.

The leaf writes the proof out as an argument. Read from the top: the file's digest, then each value the one above hashes into, down to the merkle root. Every line is 32 bytes of hash, so every line can be set as prose — the same encoding the chapters use.

The margin carries a citation exactly twice. Once beside the transaction, cited down to the output the commitment sits in — the point where the file's digest entered the chain. Once beside the root, cited to the chapter whose header commits to it. The intermediate hashes exist only while the proof is replayed, and nothing in the book can cite them. The siblings, set a shade back, are hashes of other transactions and subtrees, carried because the tree cannot be verified without them.

The file itself is not here. The chain was told a digest and nothing else, which is what makes the scheme usable for a contract or a manuscript you would not publish: nothing about the file leaves your hands. If you hold a copy, the button reads it in your browser and reports whether it is the file this proof attests.
