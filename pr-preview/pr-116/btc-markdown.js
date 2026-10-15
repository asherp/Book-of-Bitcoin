// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-markdown.js — the small Markdown subset the book's authored prose is
// written in, rendered once for everywhere it is read: the preface leaf of the
// front matter (web/preface.md) and a passage's commentary (web/commentary/*.md).
// One renderer, so a device that works in the preface works in a note.
//
// The subset, in full: `## headings`, paragraphs, `**strong**`, `*em*`,
// `` `code` ``, a closing "— line / name" signature, and HTML comments (which
// are dropped — that is where a file's SPDX identifier rides, since Markdown
// has no header of its own). A `# title` block is dropped too: in both places
// the title is already on the page around the prose.
//
// One more device, and it is the book's own rather than Markdown's: a full
// citation written in the sigil spelling — `II β99 ■1441 §2`, to any depth
// from a volume down to an output or witness — links to the passage it
// names, through the same `?ref=` lookup every page answers. No syntax to
// learn: write the reference and it is the link. Only the sigil spelling
// links (the marks make it unmistakable in prose; "III 2 5" would claim
// every roman numeral near a number), and only if it actually parses —
// btc-citation.js is the judge, the same parser the search box uses. There
// are deliberately no free-form links: a reading may point into the book,
// and the book only.
//
// Everything is escaped before any markup is inserted, so an authored file can
// never introduce elements — the prose here is authored matter, but it is still
// data, and it is read by a page that also renders the chain.

import { parseReference } from './btc-citation.js';

const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// The citation autolink. Runs on the escaped text, before the styling marks:
// a citation contains no markup characters and its href introduces none, so
// the escapes-first contract holds. Candidates are shaped by the sigils and
// admitted by the parser; anything that fails to parse stays plain text.
const CITE = /[IVXLCDM]+ β\d+(?: ■\d+(?: §\d+(?:\.[0-9a-z]+)?)?)?/g;
const citeLinks = (t) => t.replace(CITE, (m) =>
  parseReference(m) ? `<a class="md-cite" href="./bitcoin-book.html?ref=${encodeURIComponent(m)}">${m}</a>` : m);

const inline = (t) => citeLinks(esc(t))
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');

// `lead` marks the first paragraph with the class the preface leaf opens on;
// prose that is apparatus rather than a leaf (a note) takes no lead.
export function renderMarkdown(src, { lead = false } = {}) {
  const blocks = String(src).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  let atLead = lead;
  return blocks.map((b) => {
    if (b.startsWith('<!--')) return '';                     // a comment block: SPDX and the like
    if (b.startsWith('# ')) return '';                       // the title is the page's own
    if (b.startsWith('## ')) { atLead = false; return `<h3>${inline(b.slice(3))}</h3>`; }
    if (b.startsWith('— ') || b.startsWith('-- ')) {
      const [line, who] = b.replace(/^(—|--)\s*/, '').split(' / ');
      return `<p class="sign">${inline(line)}<span class="who">${inline(who || '')}</span></p>`;
    }
    const cls = atLead ? ' class="lead"' : '';
    atLead = false;
    return `<p${cls}>${inline(b.replace(/\n/g, ' '))}</p>`;
  }).filter(Boolean).join('\n');
}

// The same file as plain paragraphs, for surfaces with no DOM: the static
// passages the deploy pre-renders, and any text-only quotation of a note.
// Markup-bearing blocks (comments, the dropped title) fall away here too, so
// the two readings of a file cannot disagree about what it says.
export function markdownParagraphs(src) {
  return String(src).split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith('<!--') && !b.startsWith('# '))
    .map((b) => b.replace(/\n/g, ' '));
}
