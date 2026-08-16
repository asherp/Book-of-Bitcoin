// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-contribute.js — the way from a passage to a reading of it: the URLs that
// carry a reader who has something to say about the page in front of them to
// the pull request that offers it, with the passage already named.
//
// The rest of the annotation layer is about the readings that exist —
// btc-commentary.js finds them, commentary.css sets them, and all of it is
// silent on a passage nobody has annotated. This file is about the ones that
// do not exist yet, which is why it is the only part of the layer that appears
// on every page. The curated contents names a few hundred places; the chain
// has some millions of leaves, and any of them may be worth a note by somebody
// who knows why.
//
// It rides at the foot of the Commentary sheet, which is why that key now
// stands on every page beside Notation rather than coming and going with the
// reading: a sheet that opens on nothing has something to say after all, and
// what it says is that nothing has been said. An empty page is not a closed
// one.
//
// ── Two doors, because GitHub has two ───────────────────────────────────────
//
// The book itself offers only the first. The second is documented here because
// this is the one place that knows the URL shapes, and CONTRIBUTING.md sends a
// contributor through it.
//
//   start    /new/<branch>?filename=…&value=…   A reader with no fork of the
//            repository. GitHub forks it for them, opens the file already
//            named and already carrying its licence header, and offers a pull
//            request when they commit. This route cannot ask for a template:
//            there is no compare URL for the parameter to ride on, and the
//            compare page GitHub takes them to afterwards is its own. So what
//            this reader meets is whatever the repository default is -- and
//            since this is the only door the book itself offers, the default
//            is the commentary form (.github/pull_request_template.md).
//
//   propose  /compare?expand=1   A contributor who has a branch already. The
//            same form arrives here by the same route: it is the default, so
//            nothing has to be asked for by name.
//
// Which settles what the default has to be. A template is either the one
// everybody gets without asking or the one somebody knows to ask for, and only
// one of the two doors can ask -- so the form that cannot be asked for is the
// form that must be default. A change to the machinery has the other, named
// (.github/PULL_REQUEST_TEMPLATE/code.md, ?template=code.md), because a
// contributor writing code is already at a compare URL with a parameter on it
// and can carry one more.
//
// `body` is deliberately never passed. On a compare URL it OVERRIDES the
// template, so prefilling the passage into the body would quietly cost the
// form — the passage rides in `title` instead, which does not conflict.

export const REPO = 'https://github.com/asherp/book-of-bitcoin';
const BRANCH = 'main';

// Only the characters a file name should carry, from whatever the passage is
// called: a curated title where it has one, so the file lands beside its
// siblings reading as prose (bitcoin-pizza-day.md), and the latin spelling of
// the citation (btc-citation.js) where it has none — which is most places, and
// is the reason the latin spelling exists.
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const commentaryPath = ({ latin, title = null }) =>
  `web/commentary/${slug(title || latin) || slug(latin)}-your-name.md`;

// What a new file opens holding: the licence line every reading carries (the
// editorial layer is CC BY 4.0, and the header is what says so file by file),
// and a note of what is being annotated, which falls away when the reading is
// rendered — btc-markdown drops comment blocks.
const stub = (named) => `<!-- SPDX-License-Identifier: CC-BY-4.0 -->
<!-- A reading of ${named}.

     Write it in your own voice, in ordinary declarative sentences. Two things
     it has to do: say what the record actually says, and mark plainly where it
     stops saying it. Then add the entry that points at this file in
     web/notables.yaml, with your name on it — see CONTRIBUTING.md. -->

`;

const query = (params) => Object.entries(params)
  .filter(([, v]) => v !== null && v !== undefined && v !== '')
  .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  .join('&');

// The three links the affordance offers, for one passage. `citation` is the
// book's own spelling of the place (III β2 ■5 §85) and `latin` its URL-safe
// twin (v3b2c5s85); `title` is the curated name where the contents has one.
export function contributionLinks({ citation, latin, title = null } = {}) {
  const named = title ? `${citation} — ${title}` : citation;
  return {
    start: `${REPO}/new/${BRANCH}?${query({ filename: commentaryPath({ latin, title }), value: stub(named) })}`,
    propose: `${REPO}/compare?${query({ expand: 1, title: `Commentary: ${named}` })}`,
    guide: `${REPO}/blob/${BRANCH}/CONTRIBUTING.md#commentary-and-annotations`,
  };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The line at the foot of the Commentary sheet: what the page in front of the
// reader has had said about it, and the one door out. Below a curated reading
// it is the invitation alone -- a reading is not the last word, and the book
// publishes more than one on a passage that earns it. On a page with none it
// says so first, because the empty sheet would otherwise read as a failure to
// load rather than as an opening.
//
// One link, deliberately. Of the three doors this module knows, only `start`
// asks nothing of the reader first: no fork, no branch, no clone. The compare
// door is where the pull request template applies and is worth taking, but it
// is worth taking from CONTRIBUTING.md, where somebody is already reading
// about how to contribute -- not from the foot of a passage, where a second
// and third link would turn an invitation into a set of instructions.
export function contributeHtml({ citation, latin, title = null, hasReading = false } = {}) {
  const { start } = contributionLinks({ citation, latin, title });
  const said = hasReading ? '' : `Nothing has been said about ${esc(citation)} yet. `;
  return `
          <div class="commentary-measure contribute">
            <p>${said}<a href="${esc(start)}" target="_blank" rel="noopener noreferrer">Add your commentary.</a></p>
          </div>`;
}
