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
// It states an invitation, not a claim. The commentary key still appears only
// where there is a reading to open (see syncCommentary in bitcoin-book.html:
// absence is information), and this stands apart from it, offering the empty
// page rather than pretending it is full.
//
// ── Two doors, because GitHub has two ───────────────────────────────────────
//
//   start    /new/<branch>?filename=…&value=…   A reader with no fork of the
//            repository. GitHub forks it for them, opens the file already
//            named and already carrying its licence header, and offers a pull
//            request when they commit. This route cannot carry a pull request
//            template: there is no compare URL for the parameter to ride on.
//
//   propose  /compare?expand=1&template=commentary.md   A contributor who has
//            a branch already. This is the door the commentary template comes
//            through, and it is why the template is a NAMED one, under
//            .github/PULL_REQUEST_TEMPLATE/, rather than the repository
//            default: a default would hand every code contributor a form
//            about record and testimony. Named templates apply only when
//            asked for by name, and this is what asks.
//
// `body` is deliberately never passed. On a compare URL it OVERRIDES
// `template`, so prefilling the passage into the body would quietly cost the
// form — the passage rides in `title` instead, which does not conflict.

export const REPO = 'https://github.com/asherp/book-of-bitcoin';
const BRANCH = 'main';
const TEMPLATE = 'commentary.md';

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
    propose: `${REPO}/compare?${query({ expand: 1, template: TEMPLATE, title: `Commentary: ${named}` })}`,
    guide: `${REPO}/blob/${BRANCH}/CONTRIBUTING.md#commentary-and-annotations`,
  };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The affordance itself: a closed toggle wearing the same + as the Ledger's
// leaf-borne readings (commentary.css), because it is the same gesture — open
// it and something about commentary appears. What it says depends on whether
// the page already has a reading, since "no reading yet" and "another reading"
// are different invitations, and the first is the one that has to explain
// itself.
export function contributeHtml({ citation, latin, title = null, hasReading = false } = {}) {
  const links = contributionLinks({ citation, latin, title });
  const say = hasReading
    ? `A reading of ${esc(citation)} is offered above. It is one reading, not the
       last word, and the book publishes more than one on a passage where more
       than one is worth having.`
    : `Nothing has been said about ${esc(citation)} yet. If you know why it
       matters — what it set in motion, what the record here does and does not
       say — the book takes contributed readings, and publishes them under your
       name.`;
  return `
        <details class="contribute">
          <summary title="Contribute a reading of this passage">Commentary</summary>
          <div class="contribute-body commentary-measure">
            <p>${say}</p>
            <p class="contribute-links">
              <a href="${esc(links.start)}" target="_blank" rel="noopener noreferrer">Start the file</a>
              <a href="${esc(links.propose)}" target="_blank" rel="noopener noreferrer">Open a pull request</a>
              <a href="${esc(links.guide)}" target="_blank" rel="noopener noreferrer">How a reading is written</a>
            </p>
          </div>
        </details>`;
}
