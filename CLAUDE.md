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
quotes (wired up on the search page), and the two quotations take different
lambdas — the same split as the committed/revealed modes below:

- the *locking script* is titled by the anonymous lambda it binds, derived
  from the bytes alone: `λh. ⓪ h` for a P2WPKH output. `titleText` /
  `titleHtml` (btc-term.js) write it. Bare of everything a title does not
  need — no `⟦ ⟧` (those claim the wire's own bytes, and the script itself
  stands below), no application or parentheses (`(λh. ⓪ h) h²⁰` says what was
  *done* to the term, which is rung one's business), and no count on the
  binder, since every output of a shape shares its title. The demand rung is
  deliberately *not* this: P2PKH and P2WPKH ask for the same key material, so
  the demand does not distinguish what a name must distinguish.
- the *spend* is titled by what the chain revealed, and there are two kinds of
  reveal because an output can hide two kinds of thing.
  `revealedText` / `revealedHtml` (btc-term.js) write both; `spendRung`
  (bitcoin-search.html) draws the result between the application line and the
  quotation.
  - A *script-hash* form hid a **script**: the spend hands over its bytes, so
    the title is that script's own title — the same anonymous lambda it would
    carry anywhere else (a P2SH wrapping a witness program titles `λh. ⓪ h`).
    Which bytes were revealed is read by consensus's placement, never by
    shape: `revealedOf` takes P2SH's from the scriptSig's last push (where it
    stays even when the program it wraps moved its arguments to the witness
    stack), the witness forms' from the stack position `runs` names.
  - A *keyhash* form hid a **value**, the key behind `⌖p`. There is no script
    to read, so the title is the demand with its commitment discharged
    (`shown` in `DEMANDS`): `λs p. ∇ s p ( ⌘ w )`. The hash clause is a
    question already answered, the key stands bare because it came from the
    spend rather than the output, and `⌘`'s footnote letter rides in where the
    page has fetched the preimage.
  - Forms that hid nothing (P2PK, taproot's key path) are titled the same way,
    and the binders show the difference: their key was in the output all along,
    so the spend brought only a signature and the key stays the datum it was —
    `λs. ∇ s p³² ( ⌘ w )`, against a keyhash reveal's bare `p`. This is also
    what keeps `⌘` anchored: the title is now the only line that writes it, so
    the message footnote always has a mark referring to it.
  - A reveal that does not tokenize titles nothing: declining beats guessing,
    here as everywhere.

The same title stands in the reading, as an editorial decision: every output's
locking script is titled by the term it binds, on its own line (`.tx-out-term`,
painted by `termTitle` in bitcoin-book.html) directly above the script.

- **The bookmark goes above the title.** The keep line (`.tx-out-keep`: a filed
  name, and the ribbon that files it) stands above the term line, and the two
  do not compete — a name answers *whose* this paragraph is, the term answers
  *what* it is, so neither displaces the other and no keep has to be removed
  to see the term. `syncScriptKeeps` paints only the bookmark; the term is
  painted once where it is built.
- Drawn at first paint from the bytes alone (no address, no engine, no
  network), so anything that binds a term is titled whether or not the book has
  tabled what opens it (a data output reads `λd. ¶ d`), and a script with no
  address form is titled though it can offer no ribbon. What goes untitled is
  what binds nothing.
- **Sized from the sigla scale**, alone among a section's lines: everywhere
  else the marks ride `--scale-sigla-ratio` while the prose around them keeps
  the body's size, but a title has no prose in it — λ, the dot, the binders and
  the opcodes are notation end to end. `#page-slide .tx-out-term .op` resets to
  `1em` so the ratio is not applied twice (the same neutralizing the book
  already does for `.op-count`).
- Because the reading did not have `.lam`, it is styled scoped to `.out-term`:
  that mark means something on the search leaf, where a whole descent is
  written in it, and a chapter is not that leaf.

The search page mirrors that: rung one (the address as a partial application)
still leads, and below it each of the two quotations carries a title and
nothing else. The demand rung and the application rung are **gone** — both
stated what a lock asks of any spender, above passages that are one lock
somebody wrote and one spender's answer to it, where what a reader wants is
the passage's name. `DEMANDS` is still the table everything reads (it picks
the path a spend took, and the reveal's title derives from it) and the
notation key still prints the demand in its validator column; it is simply no
longer drawn as a rung. `.term-spend` is now the spend section's wrapper
rather than a line, so the gap above it survives a reveal that cannot be
titled.

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
  the spend rung shows what the input carried (a redeem script is revealed as
  opcodes via `renderScript nested`), and the revealed lambda is what the
  spend quotation's title carries (see Concept above — wired). What remains
  direction: substituting the revealed term into the lock's own `( r )` so
  the committed→revealed transition renders as an actual reduction step.

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
