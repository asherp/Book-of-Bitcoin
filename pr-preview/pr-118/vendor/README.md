# web/vendor

Third-party code, vendored unmodified. The first entry in this directory, and
deliberately so: everything else under `web/` is dependency-free, and a file
here is a claim that the book could not honestly write the thing itself.

## noble-secp256k1.js

[`@noble/secp256k1`](https://github.com/paulmillr/noble-secp256k1) — secp256k1
point arithmetic. MIT, © 2019 Paul Miller; the licence sits beside it as
`noble-secp256k1.LICENSE` and is the file's own, not this repository's.

| | |
|---|---|
| version | 3.1.0 |
| source | `https://registry.npmjs.org/@noble/secp256k1/-/secp256k1-3.1.0.tgz` |
| tarball | `sha512-+F7iS7tUMaNGXcc9X3PjmjvuQnXEuSjCRNzVVA2xAcKXgCaP0dHYz4SFyt4FKNHef7sOP//xihowcySSS7PK9g==` |
| this file | `sha256 e0d1bad238ceef8d5451713daf6d5b256ce871d3200fe7ee79dbc01179ec806a` |
| dependencies | none |

Byte-identical to `package/index.js` inside that tarball. To check:

```sh
curl -sSL https://registry.npmjs.org/@noble/secp256k1/-/secp256k1-3.1.0.tgz \
  | tar xzO package/index.js | shasum -a 256
```

To bump it, repeat that with the new version, replace both files, and update
this page — the hashes are the point, and a vendored file nobody can check
against its source is worse than a dependency.

### Why it is here

BIP341 verification is four steps, and three of them are tagged SHA-256 the
book already computes. The fourth is `Q = P + tG`, a point addition, and
nothing else in the repository needs elliptic curve arithmetic at all.

It is used by `btc-taptweak.js` and reached from one line: the `⋔ t c ≡ p³²`
check under a taproot script-path spend on the search leaf, which says whether
the leaf a spend revealed really is the one that output committed to. Without
it that line could be stated and not taken.

Every input is public — a script, a control block, a key the chain published —
so no secret passes through this code and its timing is nobody's business.
**That stops being true if the book ever signs anything.** A journal that
authors pages to the mempool would hold a key, and key handling wants the
audited signing paths in here rather than anything grown beside them.

### Why not a Bitcoin library

BDK, bitcoinjs and their kin are wallet libraries: descriptors, coin selection,
chain sync, key management. The book holds no keys, signs nothing and spends
nothing — it reads the chain and sets it in type. Vendoring a wallet to perform
one point addition would bring a surface the book has no use for, and in BDK's
case a second WASM beside Glossia's.
