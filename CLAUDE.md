# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## What this is

The βook of βitcoin (<https://bookofbitcoin.io/>) — a verbatim translation of the
Bitcoin chain into prose. Every byte of every transaction is carried in the
words of grammatically correct Glossia sentences and can be read back exactly.
`web/` is the static site (no bundler; ES modules served as-is), `tools/` is
the test suite and editorial tooling. The Glossia engine is a WASM build
artifact absent from a bare checkout — pages import it lazily and degrade to
marks-without-prose when it is missing; nothing in `tools/` needs it.

- Run tests: `node --test tools/*.test.mjs` (per-file runs work too)
- Editorial layer: `node tools/check-editorial.mjs`
- **Register follows the destination.** Text here is not written in one voice
  throughout. Which kind you are writing decides how:
  - *Reader-facing prose* is not hand-written at all — Glossia generates it
    from the bytes. Nothing in `web/` composes the book's sentences.
  - *Code comments* are formal: what the code does and why, stated plainly.
  - *UI strings* — labels, headings, button text, tooltips on controls — are
    brief and neutral. A tooltip says what the control does.
  - *Descriptions in notation* — a mark's hover, a term's gloss, a field's
    `said` — are minimal. Name the thing; do not expound on it.
  - *Commentary* (`web/commentary/*.md`, contributed under CC BY 4.0) is in its
    author's own voice and stays as that author wrote it.
- Prefer declining over guessing: throughout the codebase, a value that cannot
  be computed honestly is `null` and the page shows a mark (… ∅ ⋯ ☒) with the
  claim in its hover, never a fabricated fallback.
- **High-entropy data reaches a reader through Glossia or not at all.** A hash,
  a key, a script, a txid, a digest, a preimage — none is ever set in type as
  hex. It is said in prose, and where the engine is absent it shows `…` with
  the claim in its hover. Copying is how the exact bytes travel: the value
  rides on the element (a data attribute, `.hash-copy`) and a click opens a
  copy menu, which is also more reliable than selecting a long string by hand.
  This holds on error paths too — the ☒ disagreement sets both scripts as
  prose, since a mismatch is where a reader most needs to compare closely.
  What may still be set as figures is what carries no entropy: a version, a
  count, an index, an amount, a byte's position in a script and the one
  undefined byte at it.

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
  need — no application or parentheses (`(λh. ⓪ h) h²⁰` says what was *done* to
  the term rather than what it is), and no count on the binder, since every
  output of a shape shares its title. The demand rung is deliberately
  *not* this: P2PKH and P2WPKH ask for the same key material, so the demand
  does not distinguish what a name must distinguish.
  - **The kind opens it, and `:=` binds the two**: `P2WPKH := λh. ⓪ h`. The
    kind names the shape and the term says what the script abstracts over, so
    they are one statement of what these bytes are rather than a label and a
    line a rung apart. Both surfaces state it the same way — the search leaf in
    its head (`.term-kind`, `.term-def`, `.term-title`), the reading in the
    title line (`.out-kind`, `.out-def`) — and both derive the kind from
    `t.label`, which is the term table's where a form is tabled and the
    template row's name otherwise, so an untabled script reads `Script := …`
    and a data output `data := λd. ¶ d`. `:=` is apparatus and takes the quiet
    `.lam` takes, never the gold: the wire carries no such mark.
- the *spend* is titled by what the chain revealed, and there are two kinds of
  reveal because an output can hide two kinds of thing.
  `revealedText` / `revealedHtml` (btc-term.js) write both; `spendRung`
  (bitcoin-search.html) draws the result above the quotation.
  - A *script-hash* form hid a **script**: the spend hands over its bytes, so
    the title is that script's own title — the same anonymous lambda it would
    carry anywhere else (a P2SH wrapping a witness program titles `λh. ⓪ h`).
    Which bytes were revealed is read by consensus's placement, never by
    shape: `revealedOf` takes P2SH's from the scriptSig's last push (where it
    stays even when the program it wraps moved its arguments to the witness
    stack), the witness forms' from the stack position `runs` names.
  - A *keyhash* form hid a **value**, the key behind `⌖p`. There is no script
    to read, so the title is the demand with its commitment discharged
    (`shown` in `DEMANDS`): `λs p. ∇ s p ( ⌘ ※ )`. The hash clause is a
    question already answered, the key stands bare because it came from the
    spend rather than the output, and `⌘`'s footnote letter rides in where the
    page has fetched the preimage.
  - Forms that hid nothing (P2PK, taproot's key path) are titled the same way,
    and the binders show the difference: their key was in the output all along,
    so the spend brought only a signature and the key stays the datum it was —
    `λs. ∇ s p³² ( ⌘ ※ )`, against a keyhash reveal's bare `p`. This is also
    what keeps `⌘` anchored: the title is now the only line that writes it, so
    the message footnote always has a mark referring to it.
  - A reveal that does not tokenize titles nothing: declining beats guessing,
    here as everywhere.

The same title stands in the reading, as an editorial decision: every output's
locking script is titled by the kind and the term it binds, on its own line
(`.tx-out-term`, painted by `termTitle` in bitcoin-book.html) directly above
the script.

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
- **Proportional to the body end to end, marks included.** The line takes
  `--scale-body` like the keep and the bookmark it is stacked under — the three
  are one group of headings over one paragraph — and
  `#page-slide .tx-out-term .op` holds its opcodes at `1em` so the inline sigla
  ratio does not reach them. A title is nothing but marks, so leaving them on
  the ratio would size the whole heading by it and pull it out of step with the
  two lines above the moment a reader diverged the sigla. `--scale-sigla-ratio`
  is for marks set *inline in reading matter*, sized apart from the sentence
  carrying them, and a title has no sentence to be sized apart from. The same
  neutralizing the book already does for `.op-count` and `.op-tpltime`; the
  data letters were never on the ratio and need no undoing.
- Because the reading did not have `.lam`, it is styled scoped to `.out-term`:
  that mark means something on the search leaf, where a whole descent is
  written in it, and a chapter is not that leaf.

The search page mirrors that: the head states the definition and below it each
of the two quotations carries a title and nothing else. All three rungs are
**gone**. The demand and the application both stated what a lock asks of any
spender, above passages that are one lock somebody wrote and one spender's
answer to it, where what a reader wants is the passage's name; the address
rung then reduced to the very passage printed beneath it, so the leaf set one
script twice and left a reader to find the difference. `DEMANDS` is still the
table everything reads (it picks the path a spend took, and the reveal's title
derives from it) and the notation key still prints the demand in its validator
column; it is simply no longer drawn as a rung. `.term-spend` is now the spend
section's wrapper rather than a line, so the gap above it survives a reveal
that cannot be titled.

Where this lives today:

- `termOfScript` (btc-term.js) reads a term off any tokenizable script: every
  push becomes a binder, every opcode stays where it stands. The six tabled
  forms (`TERMS`) are derived, not looked up.
- **The key writes a term the way the pages do.** The notation key's Scripts as
  terms group once carried three marks of its own — `⟦ ⟧` for the script
  constructor, `β` for reduction, `δ` for the one-way steps. None of them ever
  reached a reader: no page draws them, so the key was teaching an apparatus
  that existed only in the key. All three are gone, and the terms table now
  writes what `titleText` writes (`λh. ⓪ h`, `⓪ h²⁰`) rather than a bracketed
  variant of it. What the removed rows were saying survives as prose where it
  is still load-bearing — a hash is what a commitment hides behind, a one-way
  step is ⌖ ⌘ Σ and a key from its scalar — and `β` is left to the one office
  it still holds, the difficulty target in a chapter's frontispiece. This is
  also why `abstractionText` and `applicationText` are gone: with no brackets
  to distinguish them they were `titleText` and `addressText` verbatim.
- `addressText` / `addressHtml` still write the address as a partial
  application, `(λp. ① p) p³²`, and `term.test.mjs` still checks them against
  the scripts addresses really decode to — but no page draws them.
- **The datum is one value across every line that names it.** A spend title
  writing `p³²` is naming the key the *output* published, bound a section
  above in a different transaction — not anything the input brought. So that
  mark carries a road to the passage holding it (`datumMark` / the `ref`
  option, built by the page from the lock's citation), the way `⌘` carries its
  footnote. Only the `D` token gets it: every other name on a spend line is a
  value the input supplied and the passage directly below quotes. The mark is
  never *replaced* by the reference — a citation names an output, which is the
  term's own reduced form, so writing it where the argument stands would apply
  the term to its own result, and would throw away which datum it is and how
  many bytes. No road under ⋯ ∅ ☒: there is no confirmed passage to send
  anyone to.
- `demandsOf` / `lockedHtml` write what a lock still demands, one line per way
  of opening it — a *predicate* a reader can check, not a script. Undrawn too,
  and still the table the reveal's title derives from.
- The spend section is what the leaf does draw: `revealedHtml` titles it,
  `suppliedHtml` sets what the input carried and `commitmentHtml` the check,
  drawn only where the chain records it and cited to the input (`§85.a`;
  letter = input, case = carriage).
- Citations come from `chainWitness` / `readWitness` (btc-index.js), chosen as
  a *pair* — the earliest output anyone opened, and the input that opened that
  very output — so the two rungs describe one outpoint.
- The signed message behind ⌘ is `messageOf` (btc-sighash.js): legacy, BIP143,
  and BIP341 key-path serializations, each pinned to published vectors in
  `tools/sighash.test.mjs`. Script-path taproot spends are declined, not
  guessed (flag position and codeseparator state are facts about execution).
  Its footnote mark is **※** — not a letter, because every letter is a binder
  somewhere (`w` is P2WSH's witness script, which made `( ⌘ w )` read as "the
  witness hash").
- **The message's fields are set in the book's hand, not in hex.** Each field
  carries a `kind` (`figure` `flag` `locktime` `sequence` `amount` `script`
  `outpoint` `said` `none`) and an `of` holding the decoded value, so the page
  never parses little-endian hex to print a figure. The split is entropy: small
  integers print as figures, a locktime and a sequence take the reading's own
  marks (via `locktimeInfo` / `sequenceInfo`, exported from btc-prose.js so the
  footnote and a chapter cannot drift), an amount is ₿, a script is opcodes,
  and a hash — unreadable by construction — is **said in Glossia**. A field a
  flag zeroed shows ∅; one the engine cannot say shows `…`, never its bytes.
  `bytes` is untouched, so the fields still rejoin to the preimage for
  BIP143/BIP341; legacy's list is a summary of the transaction's joints and
  deliberately does not.
- **The digest heads the footnote, said.** `⌘` plus the digest in prose is the
  heading; the fields below are the metadata that made it. Clicking the heading
  opens a copy menu — *Copy hash*, *Copy preimage* — and those bytes live in
  data attributes, copyable and never legible. That is what lets the
  high-entropy rule cost nothing: a reader who wants to take the digest
  themselves still gets the exact serialization.

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
  on-chain, a plain address. **The scriptPubKey is this normal form; the
  address is the redex that reduces to it** — `(λp. ① p) p³²` is an
  application, not a normal form, and `reduce(term, args)` performing it IS the
  scriptPubKey, byte for byte. Keeping the two straight is what makes
  Church–Rosser load-bearing rather than decorative: confluence says an address
  cannot ambiguously reduce to two different scripts. It does *not* say only
  one address reduces to a given script — uniqueness is not injectivity — so
  canonicality is a separate rule, and `termOfScript` is it: every push a
  binder, every opcode where it stands, no discarded binders and no
  higher-order indirection.
- *Open* normal form (free variables) = the free variables name exactly the
  data a spender must still supply (signature, preimage, oracle value,
  counterparty input). These are the "holes" the spend fills. The demand
  binders (`s`, `p`, `r`, `w`, `t`, `c`, `…`) are this typed interface, and the
  spend section renders the distinction: gold ink for what is settled on-chain,
  plain ink for what a spend has still to bring (`.aw` vs `.dt`).

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
