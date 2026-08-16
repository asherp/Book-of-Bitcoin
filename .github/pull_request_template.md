<!-- SPDX-License-Identifier: CC-BY-4.0 -->

<!--
A pull request offering a reading: a note on a passage, a name for a
transaction, a correction to the historical record. CONTRIBUTING.md is the
long form of everything below; this is the short form, to fill in.

This is the form every pull request opens on, because the door the book offers
a reader — "Add your commentary", at the foot of every passage — cannot carry
a template parameter, and a reader who has something to say about a page
should meet the questions worth asking about a reading rather than a form
about someone else's work. Changing the book's machinery instead — the pages,
the notation, the tooling? That form is
.github/PULL_REQUEST_TEMPLATE/code.md, reached with `?template=code.md&expand=1`
on the compare URL, or paste it in over this one.

Delete any section that does not apply, and delete these comments as you go.
-->

## The passage

<!-- What you are annotating, and where it is: a height, a transaction id, an
address, or the book's own citation (`III β2 ■5`). Link the page if you have
one — a PR preview will be deployed here shortly, and the reading opens on
that passage. -->

-

## The reading

<!-- A sentence or two on what you are saying about it and why it is worth a
reader's attention. The reading itself lives in the file; this is the
summary a reviewer reads first. -->

## Record and testimony

<!-- The one thing every note has to do: say what the record actually says,
and mark plainly where it stops saying it. Name the claims here that a node
never checked — who is asserting them, and on what evidence — so a reviewer
can check that the file marks them too.

"Ten thousand coins moved to a script" is the record. "They bought two
pizzas" is testimony from the people involved. A reader is entitled to see
which is which. -->

- Record:
- Testimony (and whose):

## Files

<!-- Two files, both written by hand. -->

- [ ] `web/commentary/<passage>-<your-name>.md` — the reading, opening with
      `<!-- SPDX-License-Identifier: CC-BY-4.0 -->`
- [ ] `web/notables.yaml` — the entry pointing at it, with `by:` (and `href:`
      if you want your name to link somewhere)

## Checks

- [ ] `node tools/check-editorial.mjs` passes
- [ ] The reading speaks to what is visible on the page, and reads it with the
      hindsight the passage's own moment lacked
- [ ] Plain declarative sentences — the number over the image, the date over
      the mood
- [ ] Any new sigla follow the existing family conventions and render in the
      book's monospace faces

## Licensing

You keep the copyright in what you write. By opening this pull request you
license the commentary to the public under
[CC BY 4.0](https://github.com/asherp/book-of-bitcoin/blob/main/LICENSE-CC-BY), the
same terms as the book's own editorial layer, and you are credited as its
author. Any code in the same PR is MIT OR Apache-2.0 as usual; a new or
revised mark for the notation is CC0.

- [ ] I am the author of this commentary and license it under CC BY 4.0

<!-- If you would rather contribute under different terms, say so here instead
of ticking the box, and it can be discussed before merge. -->
