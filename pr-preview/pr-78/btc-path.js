// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-path.js — a slash in a name the reader typed is a path.
//
// The book files everything it holds in a hierarchy, and until now the one
// thing a reader could name — a bookmark, a kept ledger — was the one thing
// that could not be filed. Reading `/` in those names as a path fixes that
// with no new control at all: the naming form the reader already meets is
// the whole interface, and an existing flat name is simply a path of depth
// one, so nothing kept before this stops working.
//
//   Coldcard hack/wave 1     Coldcard hack
//   Coldcard hack/wave 2  →      wave 1
//   Coldcard hack/wave 3         wave 2
//                                wave 3
//
// The group's name is printed once, as a heading, and each row beneath it
// carries only its leaf.
//
// ── Whose names read this way ────────────────────────────────────────────
// The reader's own, and only theirs. A curated title is prose an editor
// wrote, and the book's most famous one settles it: `The Times 03/Jan/2009
// Chancellor on brink of second bailout for banks` is a newspaper's masthead
// date, not three levels of filing. A reader's title is a name they typed
// into a naming form and can retype; an editor's is a quotation. So the
// callers pass the reader's entries here and leave the curated ones alone.
//
// ── The grammar, written down once ───────────────────────────────────────
// Segments are separated by `/`, each trimmed of its own whitespace, and
// empty ones are dropped — `a//b` and ` a / b ` are both `a / b`. There is
// no escape: a name that wants a literal slash cannot have one, which is the
// price of a separator that needs no teaching. Depth is uncapped, because
// the rule is recursive and a reader who files four levels deep meant to.

const SEP = '/';

/** A title as its path segments. A name with no slash is a path of one. */
export function pathSegments(title) {
  if (typeof title !== 'string') return [];
  return title.split(SEP).map((s) => s.trim()).filter(Boolean);
}

/** What a row prints when its group's heading has already said the rest. */
export const pathLeaf = (title) => {
  const segs = pathSegments(title);
  return segs.length ? segs[segs.length - 1] : '';
};

/** The whole path as it is printed in a heading — spaced, so a name that is
 *  itself a phrase stays readable: `Coldcard hack / wave 3`. */
export const pathLabel = (segs) => segs.join(' / ');

/** True where a title asks to be filed at all. */
export const isPath = (title) => pathSegments(title).length > 1;

// ── The forest ────────────────────────────────────────────────────────────
// Entries in, a render plan out:
//
//   { kind: 'row',   entry, title }            — one row, printing `title`
//   { kind: 'group', label, path, nodes }      — a heading and what is under it
//
// Two restraints, both of them the contents' own manners rather than
// inventions here. A group holding a single row is not a group: it prints as
// one row carrying its whole name, exactly as the contents declines to raise
// a Book heading over a lone entry. And a chain of single-child groups —
// `a/b/x`, `a/b/y` with nothing else under `a` — is one heading reading
// `a / b`, since two headings in a row with nothing between them say nothing
// the one heading did not.
//
// Order is the caller's order. A group stands where its earliest member
// stood, which is the only placement that keeps the contents' promise to
// read in chain order: the group's first row is where the group belongs.

export function pathForest(entries, titleOf = (e) => e.title) {
  const build = (items, depth) => {
    const out = [];
    const groups = new Map();          // first segment -> { node, items }
    for (const it of items) {
      const segs = pathSegments(titleOf(it));
      if (segs.length <= depth + 1) {  // ends here: a row at this level
        out.push({ kind: 'row', entry: it, title: segs[depth] ?? segs[segs.length - 1] ?? '' });
        continue;
      }
      const head = segs[depth];
      let g = groups.get(head);
      if (!g) {
        g = { node: { kind: 'group', label: head, path: segs.slice(0, depth + 1), nodes: [] }, items: [] };
        groups.set(head, g);
        out.push(g.node);              // the group stands where its first member stood
      }
      g.items.push(it);
    }
    for (const { node, items: kids } of groups.values()) node.nodes = build(kids, depth + 1);
    return out.map((n) => collapse(n, depth));
  };

  // Both restraints print the part of the path the enclosing heading has not
  // already said — `depth` segments in, exactly as the contents compresses a
  // reference against the heading above it.
  const collapse = (node, depth) => {
    if (node.kind !== 'group') return node;
    // A lone row under a heading is a row, and it carries the rest of its
    // name: dropping the heading must not drop what the heading was saying.
    const rows = flatRows(node);
    if (rows.length === 1) {
      return { kind: 'row', entry: rows[0].entry, title: pathLabel(pathSegments(titleOf(rows[0].entry)).slice(depth)) };
    }
    // A heading whose only content is one further heading is one heading.
    let n = node;
    while (n.nodes.length === 1 && n.nodes[0].kind === 'group') {
      n = { ...n.nodes[0], label: pathLabel(n.nodes[0].path.slice(depth)) };
    }
    return n;
  };

  const flatRows = (node) => (node.kind === 'row' ? [node] : node.nodes.flatMap(flatRows));

  return build(entries, 0);
}

/** Every row a plan will print, in printed order — what a caller counts when
 *  it wants to know whether a heading is worth raising over the whole thing. */
export function forestRows(nodes) {
  return nodes.flatMap((n) => (n.kind === 'row' ? [n] : forestRows(n.nodes)));
}
