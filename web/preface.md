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
each new era rather than running on. A tidier scheme would have papered over
that. This one leaves it visible, because the ragged last book is a real fact
about Bitcoin: supply and difficulty are two different clocks, and they do not
keep step.

Nothing in that scheme is my invention except the marks themselves. The
divisions were already in the chain; I have only given them the names a book
gives its parts. That is the general principle here: the organization should be
discovered rather than imposed, so that a reader who learns the citation form
learns something about Bitcoin and not merely something about my filing.

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

I should be plain about the standing of this. The divisions of the book were
discovered in the chain; **the sigla were not.** They are the one genuinely
invented thing here, and inventions can simply be wrong — a mark that suggests
the wrong relation, a family that should not have been a family, a glyph that
fails to render in somebody's typeface. I have tried to be disciplined about
it, but I am one reader making one set of choices about a language other people
know far better than I do.

So the mapping is offered rather than declared, and I would genuinely welcome
argument about it — particularly from developers who have worked with Script
for years and have opinions about what these operations *are*. If a mark
misrepresents an opcode you know intimately, that is worth more to me than
politeness. The notation is dedicated to the public domain precisely so that
it can be argued with, forked, and improved without anyone's permission,
including mine.

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
gathering every chapter that touches it. I could have chosen any addresses at
all; I chose donation addresses — causes the community has paid for.

The reason is that a donation address turns a ledger into something worth
reading. Every entry is a gift, from someone, at a moment, and read end to end
an address's record becomes an account of who showed up and when. It is also
the choice I most want examined: it is my judgment, not the chain's, and it is
filed accordingly.

## A note on languages

The book reads in English today. The engine speaks other languages, and the
intent is that a reader chooses their own. That changes nothing above. A
passage in another language is the same transaction under different grammar and
decodes to the identical bytes — the words differ, the book does not.

— Read it as a book, and check it as a ledger. / Asher Pembroke
