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
is a chapter. A difficulty window — the two weeks of work between adjustments —
is a book. Volumes gather the books. A transaction is a section within its
chapter, and every passage cites itself in that form: `III β2 ■5 §1`, the
volume in Roman, the book after the difficulty mark, the chapter after the
block mark, the section last.

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
