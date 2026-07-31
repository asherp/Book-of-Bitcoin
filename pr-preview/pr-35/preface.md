# Preface

This is a book of transactions, and I have added nothing to them. That
sentence is the whole method, but it takes a few pages to say what it means
and why it was worth the trouble.

## What the book is

Bitcoin's ledger is public and has always been readable in the sense that the
bytes are there for anyone to fetch. It is not readable in the sense that a
person can sit with it. A transaction is a run of hexadecimal; you can verify
it, index it, or search it, but you cannot *read* it, and so almost nobody
does. What everyone reads instead is somebody's summary of it.

So this book translates. Each transaction is rendered into grammatical prose
in which the transaction's own bytes are the words — not described, not
summarized, not encoded into a footnote, but carried in the sentence you are
reading. Filter a passage against the payload wordlist and the transaction
comes back out: every byte, in order, nothing added and nothing dropped. The
translation is exact and it runs both ways.

Like any translation, the phrasing belongs to the language. The words that
hold a sentence together — the articles, the verbs of motion, the connective
tissue that turns a payload into English — are the translator's grammar, not
the chain's. Render the same transaction twice and you may get two different
sentences. Both are faithful; both decode to the identical bytes. If you
compare two copies of this book and find them worded differently, you have not
found an error, you have found the difference between a translation and a
transcription. The content is what survives, and here it survives provably.

## Why it is arranged this way

The chain came with a structure and I saw no reason to invent another. A block
is a chapter. A difficulty window — the two weeks of work between retargets —
is a book. A volume is an era of supply: the 210,000 blocks from one halving to
the next, opening each time the subsidy paid to miners is cut in half. A
transaction is a section within its chapter, and every passage cites itself in
that form: `III β2 ■5 §1`, the volume in Roman, the book after the difficulty
mark, the chapter after the block mark, the section last.

The two do not divide evenly, and I have let the seam show. A halving era is
not a whole number of difficulty windows — 210,000 blocks comes to about 104
and a sixth of them — so the last book of every volume is a short one, 336
blocks where the others run 2,016, and book numbering begins again at 1 with
each new era rather than running on.

That restart costs something, and it is worth saying plainly, because it is the
one place in this scheme where a name stops being exactly true. In Volume I a
book is a difficulty window and nothing else: β1 opens at the genesis block,
every book after it opens on a retarget, and only the last is cut off — by the
halving, a sixth of the way into its window. From Volume II on the two come
apart. An era begins where the subsidy says, which is 336 blocks into a window
already running; the next era begins 672 blocks in, the one after that 1,008, a
further sixth of a book late each time. So a book after Volume I is still 2,016
blocks, but it is not *the* 2,016 blocks the network weighed: it carries the
tail of one window and the head of the next, with a retarget somewhere inside
it. β goes on marking difficulty, and after Volume I it marks the measure
rather than the window.

The drift does come back around. Six eras are 1,260,000 blocks, which is
exactly 625 windows, so Volume VII opens on a retarget with the two in step
again, and they part from there on the same schedule. A tidier scheme would
have papered over all of it. This one leaves it visible, because the ragged
last book and the wandering seam are real facts about Bitcoin: supply and
difficulty are two different clocks, and they agree only once every six eras.

Nothing in that scheme is my invention except the marks themselves. The
divisions were already in the chain; I have only given them the names a book
gives its parts. That is the general principle here: the organization should be
discovered rather than imposed, so that a reader who learns the citation form
learns something about Bitcoin and not merely something about my filing.

The same principle holds inside a passage, at the scale of fields. A section
lays out its transaction in wire order — version, inputs, outputs, locktime,
as the bytes run — and a chapter head lays out its block header the same way:
version, previous block, merkle root, timestamp, target, nonce. I have
permitted the page one deliberate exception. Witness data sits
mid-serialization on the wire, but it is spending apparatus rather than
speech, so it gathers at the foot of the page as footnotes, each marked from
the input that carries it. The difficulty target keeps its wire slot but
wears a plain < before its value, binding it to the chapter's hash at the
head of the page, so that the proof of work reads as what it is: a number
below a ceiling. Everywhere else, the order of the page is the order of the
bytes; where it is not, the departure is on purpose and in the open.

## The record and the readings of it

Two kinds of writing sit in this book and I have worked to keep them apart on
the page.

The **record** is what the chain says: this output moved to this script at this
height. It has no author. Any two people who read it honestly read the same
thing, and neither of them owns it.

The **readings** are what people say about the record — that a block is worth
your attention, that a transaction bought a pizza, that an address belongs to a
named party, that a run of outputs moved together and therefore share an owner.
Each of those is a claim made by somebody, resting on evidence and inference,
and each can be wrong.

In this book a passage *is* its transaction and an annotation is plainly a name
someone attached. I have tried to make that visible typographically, so that
you never have to wonder which you are looking at. Elsewhere the two are
printed flush against each other — an attribution label rendered with exactly
the authority of the ledger entry beneath it — and the effect is that a reading
borrows a certainty it has not earned. Sometimes the stakes of that are
somebody's money or somebody's liberty.

None of which is to say commentary is idle. This book is full of it, and the
better a reading is, the more it deserves a name on it. The claim is narrower:
the record belongs to no one, a reading belongs to whoever made it, and a
reader is owed the difference.

## On the sigla

A script is the one part of a transaction that is already a language, and it
deserved better than to be shouted. `OP_DUP OP_HASH160 … OP_EQUALVERIFY
OP_CHECKSIG` is a legible enough machine listing and an unreadable enough
sentence; set it in a paragraph and the paragraph stops.

So every opcode has been given a mark. There are 110 of them defined as of this
writing, and all 110 have one — no fallbacks, no gaps, no two alike. Families
share a base glyph and distinguish their variants by subscript, so the shape
carries the kinship: `⧉` duplicates, `⧉₂` duplicates a pair, `⧉₃` a triple;
`∇` checks a signature, `▼` checks and verifies, `∇₊` checks and adds. Where
an opcode already had a symbol in ordinary mathematical use it kept it — `+`
adds, `<` compares, `∧` and `∨` are the boolean pair — and where it had none,
the mark was chosen to look like what it does. Disabled opcodes get marks like
any other: a script is notation whether or not the network would still run it.

These are notation in the sense mathematics means it. `e` and `π` are
conventions: they were chosen, they stuck, and they now name particular things
exactly. Nobody holds that a paper writing a constant under some other letter
is *wrong* — it is different, and it is perfectly fine so long as it says what
it means. That is why mathematical writing defines the notation it introduces,
and it is why this book carries a key to its own. A notation does not claim to
be right. It undertakes to be unambiguous.

The obvious objection is that Bitcoin already has a notation, and it is
`OP_DUP` and `OP_CHECKSIG`. So it does, and for anyone who reads Bitcoin Core
it serves perfectly well. But it serves only them, and reading a book should
not require reading a codebase first. That is the position Latin once held
over scripture: you could read it, if you had been taught it. Translations were
not made because Latin was wrong. They were made because a text almost nobody
can read is a text almost nobody reads.

There is a second reason, and it settled the matter. `OP_CHECKSIGVERIFY` is
English. This book intends to be read in other languages, and a script set in
English opcode names would remain stuck in English however the prose around it
changed. A mark has no such problem: `∇` is `∇` to every reader. So the sigla
are chosen to be recognizable on sight and to belong to no language in
particular — the same requirement the rest of the book is already under.

Conventions of this kind settle over time, through use and argument, and that
is exactly what I am inviting. If you have worked with Script for years and
think a mark points at the wrong operation, or that a family would be better
drawn another way, I would like to hear it — that discussion is how a notation
becomes a shared convention rather than one person's preference. The sigla are
dedicated to the public domain so that the conversation needs nobody's
permission, mine included.

## Check it yourself

The argument above is only worth as much as its verifiability, so none of it
asks for trust. Take any passage. Keep the words that appear in the payload
wordlist, drop the rest, and convert what remains back to bytes — the book's
own tools will do it, and so will anyone else's. What you get is the raw
transaction. Hash it and you have the transaction id; look that up in any block
explorer and you are back at the chain you started from.

A passage that fails this test is a bug, and a serious one. Fidelity is the
only claim this book makes that cannot be allowed to bend.

## On the ledgers

The most visible editorial judgment in this book is the shelf of ledgers, and
it deserves an account. A ledger follows one address through the manuscript,
gathering every chapter that touches it.

Two criteria decide what is kept. The address has to matter — historically, or
because reading it teaches something. And it has to be public already:
published by its owner, or entered into a public record, long before this book
existed. The donation addresses the shelf opens with are the plainest case of
both, and the same standard admits addresses posted as proof of reserves,
coins seized by state actors, the addresses of exchange breaches, addresses
entered into court filings. The list will grow along those lines.

The second criterion is not a formality. Setting an address in prose here
discloses nothing that was not already disclosed; what the book adds is
legibility, not exposure. That distinction is one I intend to keep, and it is
why no address arrives on the shelf without a public source behind it.

The first criterion is the one I care about most, and its teaching is
uncomfortable. A ledger read end to end shows precisely what anyone can learn
about an address from the chain alone — every counterparty, every amount,
every date, assembled without permission, without special access, and without
the owner ever being asked. It is worth seeing plainly, once, on an address
whose owner has already accepted that exposure, because the same is true of
yours. Read one of these ledgers and you have read the method by which your own
would be read. The corpus is only everyone's at once.

Which addresses earn a place remains my judgment rather than the chain's, and
it is filed accordingly.

## A note on languages

The book reads in English today. The engine speaks other languages, and the
intent is that a reader chooses their own. That changes nothing above. A
passage in another language is the same transaction under different grammar and
decodes to the identical bytes — the words differ, the book does not.

— Read it as a book, and check it as a ledger. / Asher Pembroke
