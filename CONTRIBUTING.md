# Contributing

Contributions are welcome — corrections, code, and commentary alike.

The one thing worth reading before you start is how contributions are
licensed, because this repository holds more than one kind of material and
they are not licensed the same way. The [README's License
section](README.md#license) explains the reasoning; this file states what
contributing means in practice.

## Code

Code contributions — the pages, scripts, and build tooling — are licensed
under the same dual terms as the rest of the software: MIT OR Apache-2.0, at
the user's option.

Unless you explicitly state otherwise, any contribution you intentionally
submit for inclusion in the work, as defined in the Apache-2.0 license, is
dual licensed as above, without any additional terms or conditions.

## Commentary and annotations

This covers anything written in your own voice: notes on why a block matters,
a name for a transaction, corrections to the historical record, an essay, an
introduction.

**You keep the copyright in what you write.** This project does not ask you to
assign it, and does not claim it.

By contributing commentary, you license it to the public under
[CC BY 4.0](LICENSE-CC-BY) — the same terms as the book's own editorial layer
— so that it can be published with the book, quoted, and carried into
translations and later editions. You are credited as its author.

That arrangement is the book's argument applied to its own contributors. The
chain's record has no author and is dedicated to the public domain. A reading
of that record does have an author, and the author's name is what lets a
reader weigh it, argue with it, and trace it back. Your commentary stays
yours, and it travels with your name on it.

If you would rather contribute commentary under different terms, say so in the
pull request and it can be discussed before merge.

## The sigla

A new or revised mark — a glyph for an opcode that lacks one, a better mark
for one that has a poor fit — is a contribution to the notation, which is
dedicated to the public domain under [CC0](LICENSE-CC0). Contribute one and
you are adding to an alphabet nobody owns, yours included.

The code implementing it is code, on the usual dual terms; your writing about
why the mark fits is commentary, on the CC BY terms above. Both live in the
same pull request, and neither needs separating out by hand.

Two things to check before proposing a mark: that it follows the existing
family conventions (a shared base glyph, subscripts distinguishing variants),
and that it is an ordinary Unicode character that renders in the book's
monospace faces.

## The preface

The preface is `web/preface.md`, and that file is the canonical copy — the
book renders it into its front matter, and the README links to it, so there is
one document rather than two that drift. Edit it as Markdown; only the subset
it already uses is rendered (`##` headings, paragraphs, `**strong**`, `*em*`,
`` `code` ``, and the closing signature line).

Like the rest of the editorial layer it is CC BY 4.0.

## The rendered prose

The book's prose — the transactions themselves, rendered into language — is
not authored and is dedicated to the public domain under
[CC0](LICENSE-CC0). It is generated from chain data by the
[Glossia](https://github.com/asherp/glossia) engine, so it is not edited by
hand: a change to how the prose reads is a change to the engine or to the
rendering code, not to the text.

If a passage reads wrongly, that is a bug worth reporting — but note that the
prose must decode back to the exact bytes of its transaction. Any change that
breaks that round-trip breaks the book's central claim, so fidelity wins over
fluency every time.

## Practical notes

- Build with `./build_web.sh` and serve over HTTP (`python3 -m http.server -d
  web 8080`); see the README for details.
- Pull requests get a live preview deployed automatically.
- For substantial commentary or a new curated entry, opening an issue first is
  a good way to check it fits before writing it.
