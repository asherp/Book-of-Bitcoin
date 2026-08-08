# The βitcoin βook

Bitcoin verbatim — a Bitcoin block, read as a chapter: each transaction
rendered as a paragraph of grammatically correct [Glossia](https://glossia.io/)
prose, with witness data collected as footnotes. Installable as a PWA and
offline-capable.

**Read the book: <https://bookofbitcoin.io/>**

The book states all of this in its own voice, at length, in
[the preface](web/preface.md) — what follows here is the short form, for a
reader arriving at the repository rather than the book.

## A literal translation

The βitcoin βook is a verbatim translation of the chain into human language:
every byte of every transaction is carried in the words of the prose, and can
be read back out exactly — filter a passage against the payload wordlist and
the transaction returns, byte for byte, in order, with nothing added and
nothing omitted.

Like any translation, the phrasing belongs to the language: the connective
words that make a transaction into a sentence are the translator's grammar,
not the author's words, and the same transaction can be rendered in more than
one way. What survives every rendering is the content — losslessly, and
provably so. The book is set in Latin, and a reader who would rather have
English, Čeština or Deutsch may say so; none of this changes. The words
differ, the book does not.

Which is the argument the book exists to make: **a transaction is a form of
speech.** It can be set down in prose, read aloud, quoted, transcribed by
hand, and carried back to the chain intact. That is not a metaphor about
transactions — it is a demonstration, and every page is a witness to it.

## The record and the readings of it

A translation this literal has one useful side effect: it separates two things
that are usually printed as one.

The record is what the chain says — this output moved to this script at this
height, in this block. It has no author. Anyone can read it, and any two
readers who read it honestly read the same thing.

The readings are what people say *about* the record: that a block is worth
noticing, that a transaction bought a pizza, that a run of outputs belongs to
one person, that an address belongs to a named party, that coins carry a
history worth acting on. Every one of those is a claim, made by someone,
resting on evidence and inference that can be examined and can be wrong.

This book keeps the two in different registers, visibly. A passage *is* its
transaction, byte for byte. "Bitcoin Pizza Day" is a name a person attached to
one — set apart as annotation, credited, and no more authoritative than the
argument behind it.

The distinction is worth insisting on because it is routinely collapsed
elsewhere. Attribution — clustering heuristics, entity labels, taint scoring —
is commentary: skilled, often useful, sometimes near-certain, and sometimes
wrong in ways that cost people their funds or their liberty. Presented flush
against the ledger it annotates, it borrows an authority it has not earned.
There is a tell, too: such datasets are held as proprietary work, and what
makes a compilation ownable is precisely the judgment poured into it. Facts
read off a public ledger belong to no one — which is exactly why this book's
prose is dedicated to the public domain below. A claim to own the attribution
is a claim of authorship, and authorship means opinion, not observation. It
cannot be both somebody's property and nobody's interpretation.

None of which says commentary is idle — this book is full of it, and the
better it is, the more it deserves a name on it. It says only that the record
belongs to no one and the readings belong to their readers, and that a reader
is entitled to see which is which. The licenses below are that principle,
written down.

Originally part of the [asherp/glossia](https://github.com/asherp/glossia)
repository; the book now lives here, while the Glossia engine (the Rust core
compiled to WASM) is consumed as a published
[crates.io release](https://crates.io/crates/glossia), pinned in
`build_web.sh` — so the book always builds against a released engine version.

## Layout

- `web/bitcoin-book.html` — the book: fetches a block from a configurable
  esplora-style endpoint (Blockstream, mempool.space, or your own node) and
  renders it as prose
- **Turning pages.** Every reading page is a carousel — the contents
  included, since it is a run of leaves too: a horizontal swipe turns at the
  level the reader is on, and a vertical one changes level — a pull down at
  the top ascends, a push up at the foot descends. On a desk
  the arrow keys carry the same four turns, ← and → sideways, ↑ up a level
  and ↓ down — the reader's own directions, so ↓ descends where the finger
  pushes up. The vertical pair defers to the scroll the way the swipe does:
  a page long enough to scroll is read to its edge first, and only the next
  press turns off it. The header steppers and the eyebrow crumbs go the same
  places for hands that would rather click
- **Taking a leaf.** A section flies a **printer mark** at its title's left
  corner — level with the bookmark ribbon at the right, in the same faded
  gold an unkept ribbon offers, so the passage carries two marks: one asking
  to keep the place, one to take it away on paper. It writes that passage to
  a PDF: the whole
  transaction and its footnotes, set as a page of the book. Nothing draws the
  PDF; the page already typesets a transaction, its fonts are served from the
  book's own origin, and an `@media print` block says what a leaf of paper
  changes (the app's furniture goes, the palette turns to ink on paper), so
  the browser's own print pipeline writes it. Prose deferred to the scroll is
  encoded first, or a passage exported straight off a fresh open would print ⋯
  where its pushes should be — the same holds for a plain ⌘P. A print-only
  colophon closes the leaf with the citation, the transaction id, the address
  it came from and the terms, since a page that leaves the book should say
  what it is. The file is named by the passage's address in the spelling a
  link carries, with the passage's name after it where it has one —
  `v1b29c596s2 — Bitcoin Pizza Day`, the reader's own title if they have kept
  this section, else the curated one. The address rather than the citation the
  book prints, because §, β and ■ are not filename characters; and since a
  bookmark title is free text somebody typed, it is sanitized to what a
  filesystem will actually take. The mark is drawn rather than typed — no font the book carries
  has a printer glyph, and a typed one would fall back to whatever the
  reader's machine owns — so it is inline SVG on `currentColor`, built the way
  the ribbon beside it is and sharing its host, which is what keeps the two
  level without measuring anything. A leaf and a superseded draft rebuild that
  title without a mark, which is how they come to have no offer: what goes on
  paper is a transaction
- **Keeping a place.** Everything the citation scheme addresses — a volume, a
  book, a chapter, a §section, an output — is a place the search box answers
  to, and so a place a reader can keep. Each carries a **bookmark ribbon at
  its corner**: hollow while the place is unkept, gold once it is, and
  clickable in either state, so the offer is visible in the very position the
  kept mark will occupy rather than hidden behind a menu. Keeping asks for a
  name, because the bookmark becomes a row in the table of contents, where a
  row is read by its title. The ribbon rides the chapter's title, the
  §section's, an output's amount, and the volume's and book's own leaves; a
  draft chapter has none, having no settled reference to cite yet. Bookmarks
  live in `localStorage` and list in the contents in reading order, at the
  level each one names — a kept volume above the passages kept from it. An
  address is kept the same way, by the Ledger's own ribbon, since an address
  is a name rather than a place (see `bitcoin-ledger.html` below)
- `web/bitcoin-front.html` — the front matter, run through in order on the
  horizontal axis: title leaf, terms (the copyright page, saying the reverse
  of one), the preface, the sigla — and then **the book**, at Volume I's title
  page. Front matter that orients the reader precedes front matter that argues.
  The contents is not on this axis: it is the storey above the volumes, and a
  reader reaches it by ascending back out of one. The sigla leaf carries the reference-format diagram and
  the whole notation key — the shared glossed groups the book's toggle opens,
  then the exhaustive opcode index generated from the same tables the book
  sets scripts with; it lives in the front matter because a chain with no last
  block has no back for an appendix to sit in. It owns no vertical axis
  deliberately: the contents is the storey above the volumes, so an ascent
  from Volume I lands on Volume I's contents leaf and nowhere else
- `web/btc-notation.js`, `web/notation.css` — the key to the sigla, markup and
  styles, shared by the two places it is read: the book page's notation toggle
  (opened over a chapter) and the front matter's sigla leaf (the whole key at
  rest). One copy, so a mark explained in one is explained in the other
- `web/btc-commentary.js`, `web/btc-notables.js` — the annotation layer's
  machinery: the loader for the editorial files, which curated reading applies
  to the page in front of the reader, and the markup that sets it. The book page
  carries a **Commentary** key beside the notation one, and only where the
  passage has a reading — a chapter's leaf, a book's leaf, or a section that a
  curated entry names; opened, it raises the same kind of sheet the notation key
  does, over the passage rather than into it — a reading kept apart from the
  record it reads, which is the argument the preface makes at length.
  The split follows what each surface needs: the index says *whether* a passage
  has a reading and *whose*, which is enough for the key on the page and the
  credit in the contents, so only opening the sheet fetches a word of prose.
  Absence is information: most entries carry no reading, and the key does not
  appear when there is nothing to open. The Ledger offers the same sheet over a
  *name*: a curated entry may be an address, and its readings open on that
  ledger's title leaf and on the address's own — a reading of a name being
  precisely the kind of claim this book insists on setting apart and signing
- `web/commentary.css` — a reading set as a reading, styled once for both places
  it is met: the sheet the reading page raises over a passage, and the toggle the
  Ledger opens in a leaf
- `web/btc-yaml.js`, `web/btc-markdown.js` — the two small readers the authored
  files need: a deliberately narrow YAML subset (documented in the module, and
  it throws rather than guesses — a silent misread of editorial data is worse
  than a loud failure) and the Markdown subset the book's prose is written in,
  shared by the preface leaf and the commentary sheet
- `web/btc-lookup.js` — everything the book answers to, in one grammar: a block
  height, a tip-relative height, a 64-hex id, a reference in either spelling
  (parsed by `btc-citation.js`, the citation scheme's own module), or an address
  — which is not a place but a name, and so hands off to the Ledger. The search
  box, the book's `?block=` / `?ref=` lookups, the ledger's `?ref=` routing and a
  curated entry's `id:` all read through it, so a form learned anywhere works
  everywhere, and a citation resolves the same way in all four
- `web/btc-sigla.js` — the opcode alphabet: a mark for every opcode and the
  canonical `OP_*` name behind it, plus the groups the key reads in. Split out
  of `btc-prose.js` so the sigla leaf can render the real table without
  pulling in the WASM engine through the prose composer. The superscript byte
  count that rides on a mark (`h³²`, `p⁶⁵`) lives here for the same reason —
  it is notation, not prose, and the search page sets it without the engine
- `web/preface.md` — the preface itself, in Markdown: the canonical copy,
  readable here in the repository and rendered into the leaf above, so the
  book and the repository cannot drift apart
- `web/bitcoin-contents.html` — table of contents / notable blocks, **one
  leaf per volume and per back-matter part**, all at a single level: the contents runs the same line the book runs below it
  (Volume I … Volume V, Appendix I, Appendix II, the Index of Ledgers,
  Citations), a storey up and a leaf to each.
  `?at=top` opens the leaf that starts the run, `?volume=<n|roman>` a volume's
  contents, `?part=mempool|consensus|ledgers|proofs` a back-matter part's
  (`future` still names Consensus, for links saved before it had that name);
  a bare visit opens the volume last being read, and Volume I's leaf when
  there is nothing to go on. Two things follow from the per-volume arrangement, and they are
  the point of it: an **ascent from Volume III's leaf lands on Volume III's
  contents** and nowhere else — the vertical axis is a correspondence, not a
  funnel — and the descent needs no memory of where the reader came up from,
  since the leaf says which volume it is the contents of. Sideways off
  either end the run simply stops: the contents is a storey rather than a leaf
  of the front matter, so there is nothing beside it to turn onto and the way
  off is the vertical pair — up to the cover, down into the part.
  The back matter holds what reading order
  cannot carry, reading order being the order blocks were mined; each part has
  a contents leaf here and a leaf of its own one level down, the ▾ being the
  door. It runs in **three families**, and only the first is numbered: the
  appendices proper (Appendix I, Appendix II), the indexes (the Index of
  Ledgers, which points into the text), and Citations, which points outside it
  and stands last the way a works-cited list closes a book. One helper names
  them all — `partLabel` in `web/btc-notables.js` — so a part is called the
  same thing on every leaf that mentions it, and a family added to
  `appendix.yaml` is numbered, or not, in one place.
  **Appendix I · The Mempool** — the chapters the queue is already forming,
  first of them because the volumes close on the chain tip's row, so the turn
  from the tip to the next provisional chapter stays one step down the page.
  **Appendix II · Consensus** — the soft forks, grouped under their BIPs with their
  recognized names (Taproot, Segregated Witness…): each fork's sub-head is
  the door to a title leaf of its own carrying its activation statistics —
  counted live for a fork still signaling — and beneath it the chapters and
  sections the fork names, from the signaling window to the first spends.
  The forks the chain declined are kept among them with `status: failed` —
  BIP101's block-size vote, Bitcoin Unlimited (never a BIP; its handle
  stands verbatim, and its ballot was written in the coinbase text rather
  than the version word, so its table reads each chapter's first line —
  `/EB…/` counted as the yes, the final window before the parting laid out
  with each miner's own words in the row), BIP149's second SegWit
  deployment, BIP119's covenants — some naming the chapter of their
  undoing, some naming none, the empty record being the record. Coinbase
  ballots fetch fast off mempool.space's v1 block pages, which bundle each
  block's coinbase (`extras.coinbaseRaw`, fifteen blocks a call), falling
  back to per-block lookups on mirrors without them.
  Mined places cite in full; heights no block has reached (BIP42's 21M cap
  at 13,440,000; BIP110's flag heights, should it lock in) are marked □
  until a block earns them the ■. **Index of Ledgers** — the shelf of curated
  ledgers and any the reader
  keeps, the only entries with no reference at all, since the chain never
  writes an address, only the script one stands for; the contents and the
  index are inverses, and this is where the contents points at the other.
  **Citations** — works cited outside this text, each dated into a chapter by
  its own OpenTimestamps proof; the one part of the book that points outward
  (`web/btc-proofs.js` below)
- `web/bitcoin-appendix.html` — the back matter's title leaves (`?part=mempool`,
  `?part=consensus`, `?part=proofs`, with `?part=future` kept as an alias for
  saved links): a title leaf saying what the part gathers and why
  that cannot be read in sequence, with what it gathers one level below.
  Appendix I descends into the queue's **first chapter itself** — the block
  a reader reaches by swiping forward off the chain tip — read in the book
  like any other, marked □, and walked chapter by chapter from there; the
  ascent from any of them lands back on this leaf, since a draft chapter
  belongs to no volume or book of the body (the queue's own equivalent of a
  book is still to be written). Appendix II lists its forks and descends
  into the first fork's own leaf (`?part=consensus&bip=341` names Taproot's):
  BIP number over recognized name, then the ballot itself, oldest block
  first — every block of the counted window, its version exactly as the
  chapter's frontispiece writes it, whether it reads as a yes, and the
  accumulated count and rate as they stood at that block — drawn a page at
  a time as the foot comes into reach the way the Ledger draws a record, so
  scrolling down replays the activation in the order it occurred and the
  ending is discovered, not stated. The fork's own curated chapters cut
  across the table as labeled rules — the line where the signaling began,
  the line where the count crossed — and a fork still signaling opens its
  record where its story begins. The leaf's sticky foot holds the summary
  line (the count as far as the reading has gone; a fork still signaling
  states the period's whole rate off the `monitor:` the file names,
  credited) and, beneath it, the commentary — where the fork's description
  itself now reads, the book's own voice leading whatever else is written
  of it. Then the activation statistics as the file states them, the fork's
  chapters, and sideways turns walking the forks; the book answers an
  unmined chapter with the date it is due. A ballot row opens the
  block's own leaf (`&block=<height>`), one level further down: the
  chapter's title page reprinted — its hash as prose between the ⌘ and ⓪
  marks, every header field as the frontispiece writes it, the signal
  verdict beside the version — with vertical turns walking the window
  (newer above, older below, the ballot itself above the newest), the
  citation the one door into the book, and the ascent landing back on the
  table at the row left off, the Ledger's own dive-and-return.
  The Index of Ledgers' leaf is the Ledger compendium's own title page, since
  a shelf of ledgers is what that page already is; Citations' is this page's
  `?part=proofs` — the register, and the picker a reader drops a proof on. The
  back matter sits at the **volumes' own level**: the line runs Volume I …
  Volume V, Appendix I, Appendix II, the Index of Ledgers, Citations, so the
  last volume's forward turn leaves the body for the
  mempool and Appendix I's backward turn comes straight back to it. Every one
  of them ascends to the contents, as a volume does — onto its own contents
  leaf, since the contents runs one per part as it does per volume: a
  pull down at the top, and the masthead's Contents
- `web/btc-mempool.js`, `web/btc-toc.css` — the queue read as the chapters
  it is about to become, and how a list of chapters is set. Appendix I's
  contents leaf lists the queue **the way a volume's contents lists its own
  chapters**: a row per projected chapter, in the order the queue holds them,
  each citing its own place in full (β61 □530) in the pencil the ■ it has not
  earned is owed in — a projected chapter falls in a book by the same
  arithmetic a mined one does, so it is listed by the same rules. Neither
  leaf groups by book any more: both used to raise a `Book N` heading
  wherever two consecutive rows shared one, and the book a row falls in is an
  accident of where the chain happens to have reached, not something anybody
  meant. Filing is the deliberate grouping (`web/btc-path.js`), and an
  automatic heading beside it only competed with it. The stylesheet is shared
  with the appendix leaves so a chapter reads the same wherever it is set
- `web/bitcoin-ledger.html` — the Ledger: a compendium of every ledger
  (curated donation addresses, any the reader keeps, and ad-hoc
  `?address=a,b,…` queries) in one document, read the way the book is
  read, four levels deep. A URL names the leaf it wants the way the book's
  does: `?address=…` opens the passage that address is, `&page=ledger`
  opens the ledger holding it at its title leaf (which is what a named
  ledger in the contents links to), and a bare visit opens the part's own
  leaf above them all. The leaf at the top — the compendium is
  the contents' **Index of Ledgers**, and this leaf carries that name and the
  paragraph saying what a ledger is; it lists nothing, because the contents
  already lists the ledgers, and a pull down at the top (or the ▴ crumb)
  ascends there. Ledger title leaves beneath it (title, balance, span —
  horizontal swipes browse between ledgers; a push up descends) — one title
  page per ledger, and the only one. Passage leaves below those: a ledger is
  a set of scripts, not one address — organizations rotate them, and an xpub
  (when the shelf takes them) will gather every leaf of one key — so each
  script gets a leaf titled by the passage itself — the script in the book's
  own prose, and not also in base58 or bech32 beneath it: an address is the
  machine's rendering of the same script, and the book prints its own. A
  member may even be a script no address can write — a raw scriptPubKey as
  hex, `script:76a90088ac` in the search grammar, read off the same Esplora
  endpoints by its scripthash — which is how the shelf holds the Mt. Gox
  void, a ledger whose name only the bytes can spell — with
  the chapters that passage appears in listed below, newest first by
  reference; past the last passage the ledger's whole table of entries,
  organized by time. And entry leaves underneath (one
  transaction as its own page, rendered from the bank alone — vertical
  swipes walk the timeline, a swipe over the record dives into the entry
  nearest the finger, and a swipe right is the one door back). Nothing backfills on its own —
  exploration is the sync — and every page found is banked for good, from
  the same Esplora-compatible endpoints the reading pages use; a ledger
  reconciles its entries against the chain's balance before its numbers
  are trusted. Keeping a ledger names it first — it becomes a row in the
  reader's own contents (the Index of Ledgers), and the naming field opens on a
  suggestion in the block version's own notation: one HP spell and one
  BIP39 word, drawn from sixteen random bits where a miner puts BIP320's
  version-rolling scratch entropy, so the name reads back as a well-formed
  nVersion
- `web/bitcoin-ledgers.html` — the old Ledgers shelf, now a redirect to
  the compendium (kept for bookmarks and cached mastheads)
- `web/btc-proofs.js`, `web/proofs/` — *Citations*, the register closing the
  back matter: works cited
  outside this text, whose existence the chain attests. Every other reference in
  the book points inward at a chapter it contains; these point outward, and the
  passage that dates one carries the ‡ citation mark in its margin — the work's
  number in the register as its subscript, or the bare ‡ for a reader's own
  kept proof, an addendum outside the edition's numbering. The back matter
  reads in three families: the appendices proper (numbered among themselves),
  the indexes ("Index of Ledgers" — pointing into the text), and Citations
  standing last, the way a works-cited list closes a book. A file is not a passage and is not
  on the chain at all — what is on the chain is the commitment its proof
  reduces to — so an entry here is a file's name and the citation its proof
  lands on, which the proof states by itself, offline. Two sources listed as
  one: the proofs bundled with the app (named in `web/appendix.yaml`, so the
  register reads as a register on a first visit) and the reader's own, dropped
  on the Citations leaf and kept in `localStorage` the way a bookmark is,
  flying the same ribbon in the contents. What is stored is the proof itself,
  base64'd — a few hundred bytes, and the whole evidence: keeping only "block
  358391 §1352" would keep the conclusion and throw away the argument
- `web/bitcoin-proof.html` — one timestamped file's leaf, which every Citations
  row opens. A proof is a straight line of operations from a digest to a
  merkle root, and every value along that line is 32 bytes of hash — which is
  to say every value along it is a passage the book can set in words. So the
  front matter carries the file's name and its digest as prose, and the proof
  is written out beneath it paragraph by paragraph, each paragraph a value the
  one above hashes into, ending on the root. Nothing explains itself: the
  marks say what each value is, and **the margin carries a citation exactly
  where the paragraph beside it is on chain** — the transaction, cited down to
  the output the commitment sits in (`§1352.1`, the finest address the scheme
  reaches, found by rebuilding the transaction from the proof's own bytes), and
  the root, cited to the chapter whose header commits to it, with a ✓ once that
  header has been asked. Every other paragraph's margin is empty, which is the
  page's argument: a proof is mostly arithmetic, and touches the chain twice.
  The file is titled but never shown: it was never on the chain, was never
  uploaded, and is not the book's to hold. A button opens the reader's own copy
  through the native file dialogue, hashes it in the browser and says whether
  it is the file the proof attests — the same promise OpenTimestamps made when
  the proof was taken
- `web/btc-ots.js` — an OpenTimestamps proof reader, read by Citations:
  a `.ots` file is a citation written in someone else's notation, and this
  turns it back into one of the book's. Replaying a proof's commitment
  operations — append, prepend, sha256, ripemd160 (implemented here; no
  browser offers it, and proofs older than the calendar servers need it) —
  yields the merkle root of a Bitcoin block, and the attestation the
  operations end in names that block's height. The merkle path gives the
  §section too: each step appends the sibling on the right or prepends the one
  on the left, so the directions read from the bottom of the tree up spell the
  transaction's position in binary. The module claims nothing — it reports
  what the proof asserts, and the Citations leaf checks that root against the
  chapter's own header, which is the entirety of OpenTimestamps verification.
  The three hashes a proof turns on — the stamped file's digest, the
  transaction carrying the commitment, and the merkle root the operations
  reduce to — are set the way the book sets each of them: `⌘²⁵⁶` for the txid
  (the same identity mark, and the same bit count, the section frontage
  wears), `⋔³²` for the merkle root, and `h³²` for the digest, which is a
  single SHA-256 rather than the chain's double and so takes the generic hash
  mark. Then the figure itself as Glossia prose — the chain's two written in
  the byte order they actually are, the digest in the order it was computed. The engine is
  imported only when a proof arrives, so a leaf opened to read carries no
  WASM; until
  it lands a figure reads as an ellipsis, and if it never lands the hash stays
  unsaid rather than falling back to hex — hex is the one notation this book
  does not write in, and it lives where the book keeps it, behind the mark
- `web/btc-tx.js`, `web/btc-prose.js`, `web/btc-citation.js`,
  `web/btc-contents.js`, `web/btc-index.js`, `web/btc-store.js` —
  transaction parsing, prose composition, citations, contents data,
  anthology data, and the archive (immutable chain data kept in IndexedDB,
  so revisited chapters and resolved citations read offline)
- `web/btc-path.js` — a slash in a name is a path. The book files everything
  it holds in a hierarchy, and names were the one thing that could not be
  filed. `Cold Card Attack/wave 1` files under `Cold Card Attack`, at any
  depth, with the group's name printed once as a heading and each row
  carrying only its leaf. No new control: the naming form a reader already
  meets is the whole interface, an existing flat name is a path of depth one,
  and the curated entries had been filing by hand with a comma
  (`Coldcard attack, wave 1`) — a flat title straining to be a path. **A
  group forms only where two or more names share a parent, and a name
  standing alone prints exactly as its author wrote it.** That is what lets
  the rule read an editor's prose safely: the book's most famous title,
  `The Times 03/Jan/2009 Chancellor on brink of second bailout for banks`,
  is a masthead date, it stands alone in its first segment, and so it is
  never filed and never respelled — filing is something an author does
  deliberately, by naming two entries alike, and one slash on its own is
  punctuation. A name that is **also an entry** heads its own filing rather
  than standing beside it: `SegWit` (the book) with `SegWit/activation` under
  it prints the book's own row where a bare heading would otherwise go, and
  what is filed beneath indents from it. In the contents the two axes meet on
  one rule: an entry filed somewhere of its own keeps to it and is never
  absorbed by whatever row happens to name its block, while an entry filed
  nowhere follows the entry it cites — so `First SegWit spend`, and a
  bookmark the reader kept in that same chapter, read beneath
  `SegWit/activation` wherever that row ends up. On the shelf a path does more —
  see `shelfLedgers` in `web/btc-index.js`: keeps sharing a path are one
  ledger, and a parent is **a ledger in its own right** whose account is
  every member beneath it, its children partitioning it. The Coldcard hack is
  the argument: seven shared vaults and 214 that are not are two tables
  answering different questions, while the parent still totals the 221 the
  incident is quoted by. A filed ledger is named in a URL by its path
  (`?ledger=Coldcard%20hack/wave%203`) rather than by its members — a name
  that says what it is, survives the set changing, and keeps 221 addresses
  out of a URI
- `web/btc-lastread.js` — where the reader stopped. A book left face-down on
  a table opens where it was left, and this one now does too: the reading
  page keeps its own address as it turns, and a visit that names no passage —
  the bare domain, the installed app's own launch, a masthead's Read — resumes
  there. What is kept is the query the page writes for itself, so a place is
  as fine as the address grammar is (a §section, a book or volume leaf) and a
  parameter added later rides along without this module learning about it. An
  explicit target always wins: a shared link opens where it says and never on
  the recipient's own place. A reader who stopped at the chain's front kept
  the front rather than that block's number, so the tip is kept tip-relative
  and resumes at whatever the tip is by then. The record is versioned and
  self-checking, since it outlives the build that wrote it — taking an update
  must not cost the reader their page — and one it does not recognize is
  cleared rather than obeyed, leaving the reader at the cover, which is also
  where a first visit begins
- `web/btc-chaintime.js` — roughly when a height was mined, anchored on the
  halvings. One reading needs it: a coinbase's second field is a template
  timestamp in some pools' house style and a counter in others, and nothing
  in the bytes says which. The height already written beside it does — a
  clock agrees with it, a counter has no reason to — so the mark is decided
  out of the same hundred bytes it is printed on
- `web/btc-pages.js` — page numbers: one transaction is one page, numbered
  by the chain's running transaction count since genesis. Each section shows
  its folio — a bare, unpunctuated number — at the right end of the running
  head, on the chapter label's line: the count of transactions in every
  block before its own, plus its position in the block. A fresh
  block's anchor is a census lookup — a source that can sum per-block
  transaction counts over a height range: Blockchair's aggregation API
  first, mempool.space's `reward-stats` (tip-relative totalTx, differenced
  over two self-verifying windows) as fallback; anchors are banked for
  good in the archive and neighbouring
  blocks' derived arithmetically, so reading on from an anchored chapter
  never re-asks. The two BIP30-grandfathered coinbases were each confirmed
  twice, and pages count positions, not distinct txids — so each owns two
  pages, all four cited in the table of contents
- `web/notables.yaml`, `web/appendix.yaml`, `web/commentary/*.md` — the curated
  entries themselves, what the contents gathers after the volumes (the back
  matter: the mempool, the consensus rules grouped by BIP — activation
  statistics, chapters mined and owed — the ledgers, and the works cited), and
  the readings of them: which blocks and transactions the book keeps, what
  they are called, and one Markdown file per reading, referenced by the entry it
  belongs to (`by:` naming whoever wrote it, absent for the book's own voice).
  An entry's `id:` is written in any form the search box takes — a height, a
  64-hex id, a citation to whatever depth is meant (`I β29 ■596 §85`, resolved by
  arithmetic when the file is read), or an address, which names a ledger rather
  than a place and so reads in the Ledger instead of opening a chapter. An entry
  found in more than one place writes `ids:` and gives each an `as:` — the two
  twice-confirmed coinbases are one thing in four printings, so the contents
  files them: the title once as a heading, the four printings beneath it by
  their `as` alone, each citing its own chapter, and the reading written once.
  The reading page, naming the passage a reader stands on rather than listing
  it, says the same name in prose instead — *The twice-confirmed coinbases —
  first printing*.
  YAML and Markdown rather than JavaScript because this is the part of the
  repository written by people who are writing rather than programming — and
  nothing is generated from them: the browser reads these files as they stand,
  the same files a contributor edits and the pre-renderer reads off disk
- `web/btc-index-data.js` — the same editorial layer for the ledgers: which
  addresses the book keeps, what they are called, and the story that earned each
  one its place. The editorial layer is kept in its own files because it is
  licensed apart from the machinery that renders it (see [License](#license))
- **The sigla** — the marks the manuscript is written in, and where each
  lives:
  - the opcode alphabet (`OPCODE_SYMBOLS` in `web/btc-sigla.js`): a glyph per
    opcode, families sharing a base mark with a subscript convention for
    their variants — `⧉` DUP, `⧉₂` 2DUP, `∇` CHECKSIG, `∇₊` CHECKSIGADD,
    `°₄` NOP4. All 110 defined opcodes have one; the reader's key is the
    sigla leaf of the front matter, and a compact one rides the book page
  - the block-hash notation (`web/bitcoin-book.html`): `⌘ᵐ …prose… ⓪ⁿ`. `⌘`
    is OP_HASH256, naming the double-SHA256 that produced the hash, and its
    superscript counts *bits* — uniquely; every other mark's counts bytes —
    so it pairs with `⓪`, the proof-of-work zeros, and the two always sum to
    256. The zeros close the line rather than opening it because that is
    where they are: a hash is printed leading-zeros-first and hashed the
    other way round, and the prose is written in the order it was hashed
  - the citation sigla (`web/btc-citation.js`): Roman volumes, `β` the
    difficulty mark (a book is a difficulty window), `■` the block mark (a
    chapter is a block), `§` the section (a transaction) — e.g. `III β2 ■5 §1`,
    with an output appended as `§1.0` and a witness as its footnote letter,
    `§1.a`. Footnotes are lettered a, b, c … skipping `q` (too near a `g` at
    superscript size) and continuing in bijective base-25 — `aa` after `z`
  - the block-version notation (`web/btc-prose.js`): BIP9's fields rendered as
    what they are — a word pair carrying the 16 version-rolling bits, then the
    signaling bits in plain binary (`accio library 100`). Invertible: the
    notation reads back to the nVersion integer
  - the amount conventions (`web/btc-prose.js`): `₿`, and the lone satoshi
  - the reader's key to all of it: the sigla leaf in `web/bitcoin-front.html`
    (the whole table, plus the reference-format diagram), and the notation
    toggle in `web/bitcoin-book.html`'s section-nav bar while reading
- `web/fonts/`, `web/fonts/fonts.css` — the book's faces, vendored, and
  **nothing fetched from a third party**: Newsreader, IBM Plex Mono and
  Public Sans (all OFL) as the Google Fonts API serves them, and **Book
  Sigla** — five subset faces that together own every siglum the manuscript
  writes (⧉ ∇ ⌖ ⓪ ₿ …), standing second in every font stack. A page of this
  book therefore sets identically on every machine, and sets *offline*,
  which a page that phones a font host cannot: the whole alphabet rides in
  the PWA's precache. It is also the plainer reading of what the book
  argues — a reader of a chain that asks no one's permission should not
  have to announce the reading to a third party to see the letters. One
  `@font-face` table in `tools/twitter-bot/quote.mjs` serves all three
  consumers — the card renderer inlines the files, the static citation
  pages address `/fonts/`, the app loads `fonts.css` generated from the
  same table. A first visit is cheaper than the directory looks:
  `unicode-range` asks for a face only where its glyphs appear, so a
  chapter fetches four files (~167 KB, preloaded so they start alongside
  the stylesheet rather than after it) where the Google Fonts stylesheet
  they replaced pulled six from two other origins — and the sigla leaf,
  which prints the alphabet at rest, is the one page that loads all of it.
  `tools/fonts.test.mjs` fails if the table and the stylesheet drift, if a
  face is missing from the service worker's shell, if a preload loses the
  `crossorigin` that keeps it from double-fetching, or if any page reaches
  for a font host again; the renderer's own suite fails if a new siglum
  enters the alphabet that no vendored face declares. Provenance,
  licenses, measurements, and regeneration:
  [`web/fonts/README.md`](web/fonts/README.md)
- `web/glossia-msg.js` — the encoding pipeline over the Glossia WASM engine
- `web/glossia.js`, `web/glossia_bg.wasm` — **build artifacts** (gitignored),
  produced by `build_web.sh` from the published glossia crate
- `web/sw.js`, `web/bitcoin-book.webmanifest`, `web/icons/` — PWA shell
- `tools/passage-page.mjs` — a chapter, a section, or an output as a page at
  its own citation path, with its own Open Graph card. The reading pages take a passage as a query
  string, and static hosting serves one `<head>` per file, so every passage
  would otherwise preview identically when shared. Called at deploy time by
  `tools/prerender-passages.mjs`, and it renders its cards with the reply
  bot's renderer — one renderer, two consumers, the same page either way
- `tools/twitter-bot/` — the reply bot: watches a hashtag on X for citations
  (`III β2 ■5 §1`, ascii and packed-hashtag forms, block heights, txids) and
  answers each with chapter and verse — the canonical citation and the
  section itself in the book's notation: scripts as opcode sigla, amounts in
  ₿, witness footnotes, the txid as decodable Glossia prose, and a deep link
  into the book. A section too long for the tweet is ellipsized in text and
  rides whole as a rendered page of the book (image + alt text). See its
  [README](tools/twitter-bot/README.md); deployed by
  `.github/workflows/twitter-bot.yml`
- `tools/coinbase-fields.mjs`, `tools/coinbase-survey.mjs` — the miner's margin,
  surveyed. Past BIP34's height push a coinbase carries no format at all, only
  house styles: where a pool's template builder left the Stratum gap, what it
  wrote around it, and which foreign chain's commitment it is carrying. The
  reader decomposes a `scriptSig` into those fields byte-exactly; the survey
  samples blocks off any Esplora mirror and reports what each pool is doing
  now. Findings and their sources in
  [`tools/coinbase-formats.md`](tools/coinbase-formats.md), which is also where
  the corrections they turned up are written down: the second field is a
  template timestamp as often as a counter, and the book had been marking every
  one of them η
- `tools/stratum-job.mjs` — the same question asked of the pool rather than of
  its blocks. Stratum hands out a coinbase in two halves with a gap for the
  miner to fill (`coinb1 ‖ extranonce1 ‖ extranonce2 ‖ coinb2`), so where the
  gap sits, how wide it is and which bytes the pool wrote either side of it are
  stated rather than inferred. Subscribes, reads one job, hangs up; it never
  submits a share
- `web/btc-pools.js` — the table of pool signatures: what each pool's name
  looks like in the bytes, and exactly where it ends. A coinbase's margin is
  the one place on the chain where somebody signs their work, and the table
  lets the book quote that signature to its own extent — so the counter byte
  leaning on `/Foundry USA Pool #dropgold/` is no longer read as the pool's
  punctuation. The two claims stay apart, as everywhere else in the book: the
  signature is printed, because it is in the coinbase; the pool's name rides
  the mark and the composed field, because a tag is unauthenticated and anyone
  may copy one

## Building & running locally

Requires Rust and [wasm-pack](https://rustwasm.github.io/wasm-pack/).

```sh
./build_web.sh                # fetches the pinned glossia crate from crates.io
python3 -m http.server -d web 8080
```

Set `GLOSSIA_DIR=/path/to/glossia` to build an unreleased local checkout of
the engine instead.

Serve over HTTP, not `file://` — ES-module imports are CORS-blocked on
`file://` and the page never reaches its ready state.

## Updating the engine

The engine version is pinned by the `GLOSSIA_VERSION` default in
`build_web.sh`. To move to a new engine: publish the new glossia version
(push a `vX.Y.Z` tag in asherp/glossia — its publish workflow does the rest),
then bump the pin here. The pinned version must exist on crates.io before this
repo's builds can succeed.

## Deployment

- `.github/workflows/deploy-web.yml` — on every push to `main`, checks the
  editorial layer (`tools/check-editorial.mjs`, below), builds the WASM from the
  pinned glossia crate and deploys `web/` to the `gh-pages` branch (GitHub
  Pages).
- `.github/workflows/pr-preview.yml` — deploys a live preview of every pull
  request under `pr-preview/pr-<N>/` and comments the URL on the PR.

### Versioning

Releases are versioned by calendar — [CalVer](https://calver.org/), in the
form `vYYYY.0M.0D.HH`: the UTC date and hour the deploy started
(`v2026.07.28.14` for a 2pm deploy). A second release in the same hour
appends the minute (`v2026.07.28.14.37`) so versions stay unique however
many ship in a day. Since every push to `main` deploys, every deploy *is* a
release, and the deploy workflow handles the versioning itself: it computes
the version, stamps it into the site as `/version.json`, and tags the commit
after the deploy succeeds. Nothing is versioned by hand.

Because the version *is* the deploy time, any two stamps say how far apart
they are. The app uses this: when the service worker caches a newer build,
the Update button reports the gap between the running copy and the latest
release ("Update · 3 days behind").

## Reading without JavaScript (crawlers, AI assistants)

The book composes its prose in the browser, so the pages ship as empty app
shells — a crawler or an AI assistant's URL fetch gets no passage text from
them. For those readers the deploy also publishes a static layer:

- `/llms.txt` — the site explained for machine readers: where the text
  lives, the citation scheme, the app's URL grammar, and how any passage on
  the chain can be reconstructed from public data with the published engine.
- `/passages/` — every curated table-of-contents entry pre-rendered as plain
  markdown (prose, frontispiece, witness footnotes, and the entry's
  commentary where it has any — last, behind its own heading and terms, so a
  reader that flattens the page cannot quote the reading as the record),
  generated at deploy time by `tools/prerender-passages.mjs` running the same
  parse → compose → encode pipeline in Node against the freshly built WASM.
- `/III/2/5/`, `/III/2/5/1/`, `/III/2/5/1/0/`, `/III/2/5/1/a/` — the curated
  entries as HTML pages at their citations, written as paths, one address per
  level: a chapter (a block), a section (a transaction), and then either an
  output of it or one of its witnesses. Each path stops where the printed
  reference stops, and the last segment says for itself what it names — a
  numeral is an output (§1.0, the 0-based vout), a letter a witness footnote
  (§1.a). A chapter page carries the block's title page (hash prose and the
  header's frontispiece) and leads to its sections; a section page carries
  the transaction and leads to its outputs and witnesses; an output page
  carries the amount and the script locking it; a witness page carries that
  input's stack. Each has its own Open Graph tags and a preview card rendered
  from its own head (`web/cards/`) — and no description tag: the card is the
  passage and the title is its address. A shared link therefore previews as
  *that* address rather than as the site, which the reading pages cannot do,
  since they take a passage as a query string and static hosting gives every
  query the same `<head>`. Built by `tools/passage-page.mjs`, using the
  reply bot's renderer.
- `/robots.txt` + `/sitemap.xml` — crawlers welcome, and pointed at all of
  the above.

Since the editorial layer is authored by hand with nothing generated from it,
`tools/check-editorial.mjs` stands in for a build step: it reads
`web/notables.yaml` and `web/commentary/*.md` exactly as the browser does and
fails on anything a reader would meet as a missing reading or an empty contents
— a mangled line, a renamed file, a duplicate id. Run it before opening a pull
request; the deploy and the PR preview both run it first, ahead of the WASM
build.


## License

Five kinds of material live here, and the terms follow the distinction the
book argues for: the record belongs to no one, the readings belong to their
readers.

| Material | Terms |
|---|---|
| Code | MIT OR Apache-2.0 |
| The book's prose — the chain's own speech | CC0 1.0 (public domain) |
| The sigla — the alphabet that prose is written in | CC0 1.0 (public domain) |
| Annotations, names, curation | CC BY 4.0 |
| Commentary by others | Theirs — not licensed here |

### The code

The software in this repository — the pages, scripts, and build tooling — is
licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or
  http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or
  http://opensource.org/licenses/MIT)

at your option — the same terms as the
[Glossia engine](https://github.com/asherp/glossia) this book builds on.

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in this work by you, as defined in the Apache-2.0
license, shall be dual licensed as above, without any additional terms or
conditions.

### The book

The prose the book renders — its chapters, paragraphs, passages, in every
language — is dedicated to the public domain under
[CC0 1.0 Universal](LICENSE-CC0). No rights reserved. Quote it, print it,
recite it, republish it, build on it, in whole or in part, with or without
attribution, for any purpose.

Not as a generosity, but as a matter of consistency. The passages are a
literal, mechanical translation of public chain data — invertible, with no
authorial judgment anywhere in the loop. A translation that faithful authors
nothing, and so has nothing to license. Any other choice would contradict the
book itself: to require permission to quote a transaction, or credit for
having transcribed one, is to claim someone else's speech as your own work.
CC0 says plainly what the book argues at length — **these words are not mine;
they are Bitcoin's, made readable.** Speech needs no license to be quoted.

### The sigla

The notation the book writes in — the opcode alphabet, the citation sigla, the
block-version notation, the amount conventions — is dedicated to the public
domain under [CC0 1.0 Universal](LICENSE-CC0), on the same terms as the prose,
and for the same reason.

Sigla are orthography, not commentary. `⧉` *is* OP_DUP, the way a payload word
*is* its bytes: a substitution that carries the thing across and can be
reversed back to it. A siglum asserts nothing about the record — it is the
alphabet the record is written in.

Which is also why it cannot be licensed any other way without contradiction. A
passage that renders a script contains those glyphs; if the alphabet demanded
attribution, every quoted passage carrying a script would carry an obligation
with it, and the public-domain prose above would be written in an alphabet that
is not. Nor would a notation under conditions ever become anyone's habit — a
writing system earns its life by being adopted, and attribution is friction.
Write `⧉` for OP_DUP wherever you like, credit no one, and change it where it
serves you better.

(As with the prose, this mostly formalizes what is already the case. The glyphs
are ordinary Unicode characters, uncopyrightable individually, and a system of
notation is a system rather than an expression of one. The opcode *names* the
key falls back on — `OP_DUP`, `OP_CHECKSIG` — are Bitcoin Core's, taken from
its MIT-licensed sources and acknowledged with thanks.)

What remains editorial is the writing *about* the notation: why `∇` for
CHECKSIG, how the subscript convention orders a family, the notes in the
reader's key. Design rationale is commentary, and is covered below.

No file split is needed for any of this, because the two things live at
different levels. The lookup tables that implement the notation are source
code and stay MIT OR Apache-2.0 along with the files holding them; the CC0
dedication is over the notation itself — the convention that `⧉` means
OP_DUP — which is not a file and belongs to no one.

### The annotations

The editorial layer around the prose — the curated table of contents and the
ledgers, the names attached to notable blocks and transactions, the notes
explaining why each was chosen, the exposition of the notation, and any
introductions or essays — is authored work, and is licensed under
[CC BY 4.0](LICENSE-CC-BY). Reuse it freely, including commercially; just
credit it.

The different terms are the point. Nobody wrote the transactions, so nobody
signs them. Somebody did decide that a particular block is worth a reader's
attention and what to call it — and a reading with a name on it can be
weighed, argued with, and traced back to whoever made it. Attribution here is
not a toll; it is the label that keeps commentary distinguishable from record.

(Individual names and short titles are not copyrightable in any case, and
nothing here tries to claim otherwise. What CC BY covers is the body of
editorial work — the selection, the arrangement, and the writing.)

The boundary is a file boundary, so a machine can see it too. The editorial
matter lives in `web/notables.yaml`, `web/appendix.yaml`, `web/commentary/*.md`
and `web/btc-index-data.js`, each carrying `SPDX-License-Identifier: CC-BY-4.0` (in
a Markdown file, as an HTML comment — Markdown has no header of its own); every
other source file carries `MIT OR Apache-2.0`. Nothing is compiled from the one
into the other: the machinery reads the authored files at runtime, so a reader
can always see which words came from whom.

### Commentary by others

Commentary written by anyone other than this book's author is that person's
own. It is not this project's to license, and nothing above reaches it: the
writer holds their copyright, their name stays on their words, and any use of
them is between the user and the writer.

Commentary contributed to this repository is licensed by its author under
CC BY 4.0 — credited to them, on the same terms as the rest of the editorial
layer — so that it can be published and quoted with the book. See
[CONTRIBUTING.md](CONTRIBUTING.md). The data has a place for it: an entry's
`commentary:` list holds readings by others, each carrying its author's name
(and a link, if they give one) through to the sheet the book opens — the
book's own `note:` is the unsigned one, because the book is its author. Commentary written by readers inside the
app, should the book ever accept it, is governed by that app's terms rather
than by this file.
