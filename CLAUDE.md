# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## What this is

The βitcoin βook (<https://bookofbitcoin.io/>) — a verbatim translation of the
Bitcoin chain into prose. Every byte of every transaction is carried in the
words of grammatically correct Glossia sentences and can be read back exactly.
`web/` is the static site (no bundler; ES modules served as-is), `tools/` is
the test suite and editorial tooling. The Glossia engine is a WASM build
artifact absent from a bare checkout — pages import it lazily and degrade to
marks-without-prose when it is missing; nothing in `tools/` needs it.

- Run tests: `node --test tools/*.test.mjs` (per-file runs work too)
- Editorial layer: `node tools/check-editorial.mjs`
- Comments are written in the book's voice: they say why a thing is the way it
  is, at length, and are part of the work. Match that register; don't strip or
  abbreviate them.
- Prefer declining over guessing: throughout the codebase, a value that cannot
  be computed honestly is `null` and the page shows a mark (… ∅ ⋯ ☒) with the
  claim in its hover, never a fabricated fallback.

## Search page: lambda-expression address representation

The concept behind `bitcoin-search.html` and `web/btc-term.js`, kept here so
changes stay aligned with it.

**Concept.** Every locking script has a canonical representation as a lambda
expression. The search page takes a locking script (or an address, or the
book's own spelled form) as input, renders it as its lambda expression, and
cites the on-chain pages where a matching locking transaction and its spending
transaction were found. The lambda is the *semantic* form; the Glossia-encoded
opcodes are the *literal* syntax.

The lambda also serves as an auto-derived title for the passages the page
quotes (direction, not yet wired up), and the two quotations take different
lambdas — the same split as the committed/revealed modes below:

- the quoted *locking script* is titled by the lambda derived from the address
  alone — rung two's term, computable from the bytes in the box with nothing
  fetched. That is all a lock's title needs: the address already determines it.
- the quoted *spend* is titled by the lambda representing the *revealed*
  script — the term read off what the input disclosed (a redeem script, a
  witness script, a tapscript leaf), which exists only once there is a spend
  to quote. For keyhash/visible types the two titles coincide; for script-hash
  forms the spend's title is where `( r )` finally gets a term of its own.

Where this lives today:

- `termOfScript` (btc-term.js) reads a term off any tokenizable script: every
  push becomes a binder, every opcode stays where it stands. The six tabled
  forms (`TERMS`) are derived, not looked up.
- Rung one: the address as a partial application — `addressText` /
  `addressHtml`, `(λp. ① p) p³²`.
- Rung two: what the lock still demands, one line per way of opening it —
  `demandsOf` / `lockedHtml`, a *predicate* a reader can check, not a script.
- Rung three: the spend, rung two applied to what the input actually carried —
  `spendHtml` / `suppliedHtml`, drawn only where the chain records it, cited
  to the input (`§85.a`; letter = input, case = carriage).
- Citations come from `chainWitness` / `readWitness` (btc-index.js), chosen as
  a *pair* — the earliest output anyone opened, and the input that opened that
  very output — so the two rungs describe one outpoint.
- The signed message behind ⌘ is `messageOf` (btc-sighash.js): legacy, BIP143,
  and BIP341 key-path serializations, each pinned to published vectors in
  `tools/sighash.test.mjs`. Script-path taproot spends are declined, not
  guessed (flag position and codeseparator state are facts about execution).

**Two states per output.** Script-hash outputs (P2SH, P2WSH; taproot's script
path likewise) commit only to a hash until spent. So the representation has
two modes:

- *Committed* — unspent script-hash output. All that's knowable is the hash;
  render as an abstract commitment. The term writes `( r )` for "whatever the
  revealed script demands" and `…` for the binders it cannot count
  (`UNDER` / `RUN` in btc-term.js): a requirement hidden behind a hash, and an
  arity an unapplied function cannot promise.
- *Revealed* — spent output, or a keyhash/visible type. The spending
  transaction reveals the full script, so render the complete lambda. The
  citation to the spending tx is literally where abstract becomes concrete —
  today the spend rung shows what the input carried (a redeem script is
  revealed as opcodes via `renderScript nested`); folding the revealed
  script's own demands back into a full lambda is direction, not yet built.
  The revealed lambda is also what the spend quotation's title carries (see
  Concept above): `termOfScript` already reads a term off any tokenizable
  script, the revealed script included, so the title needs no new machinery —
  only the wiring.

**Closed vs. open normal form** (the key analytical handle). A lambda in beta
normal form may or may not have free variables:

- *Closed* normal form (no free variables) = fully self-contained, settles
  on-chain, a plain address. Rung one is this: the term applied to its own
  datum, and `reduce(term, args)` IS the scriptPubKey, byte for byte.
- *Open* normal form (free variables) = the free variables name exactly the
  data a spender must still supply (signature, preimage, oracle value,
  counterparty input). These are the "holes" the spend fills. Rung two's
  binders (`s`, `p`, `r`, `w`, `t`, `c`, `…`) are this typed interface,
  and the page already renders the distinction: gold ink for what is settled
  on-chain, plain ink for what a spend has still to bring (`.aw` vs `.dt`).

For the search page, this means the rendered lambda visually distinguishes
what's settled from what's still awaiting input, and the free variables can be
surfaced as the typed interface to the spend.

**Verification model.** No need to solve normalizability (undecidable in
general). By Church–Rosser, a normalizable expression has a unique normal
form. If an expression is supplied already in normal form, you only verify it
*is* normal (cheap, decidable) and that it corresponds to the locked script.
Witness-and-check, the same model Bitcoin already uses. This is why
btc-term.js writes demands per tabled form rather than deriving them from
arbitrary bytes (that would be symbolic execution), why `reduce` /
`reducePure` are checked in `tools/term.test.mjs` against the scripts
addresses really decode to, and why the spelled (Glossia) form stays the
invertible serialization: the search box must read every rendering back.
