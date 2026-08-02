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
// Everything is escaped before any markup is inserted, so an authored file can
// never introduce elements — the prose here is authored matter, but it is still
// data, and it is read by a page that also renders the chain.

const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const inline = (t) => esc(t)
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
