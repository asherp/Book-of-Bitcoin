// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-yaml.js — a deliberately small YAML reader, for the one thing the book
// keeps in YAML: the curated table of contents (web/notables.yaml). Enough of
// the language to read that file and nothing else, so the editorial layer can
// be written by hand, in a format meant for hands, with no build step between
// the file in the repository and the file the browser reads.
//
// The subset, in full:
//
//   - a document is a sequence of mappings, each item opening with "- " at
//     column 0
//   - a mapping's keys are indented lines of the form "key: value"
//   - a value may be a scalar, or a nested sequence of mappings written as
//     "key:" followed by deeper "- key: value" items
//   - scalars are plain, 'single-quoted', or "double-quoted"; an unquoted
//     value that is entirely numeric becomes a number, true/false a boolean,
//     an empty value the empty string
//   - a line whose first non-space character is # is a comment; blank lines
//     are ignored
//
// Everything else — anchors, flow collections, block scalars, multi-document
// streams, trailing comments after a value — is NOT supported, and anything
// unrecognized THROWS with its line number rather than being guessed at. A
// silent misread of editorial data is worse than a loud failure: the caller
// can fall back and say so (see btc-notables.js), where a half-parsed contents
// would quietly lose entries and nobody would know which.
//
// Trailing comments are unsupported on purpose, not by omission: "#" is an
// ordinary character in a title or a URL, and a reader that stripped it would
// silently truncate values. Comments go on their own line.

const QUOTED = /^(['"])([\s\S]*)\1$/;
const NUMERIC = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/;

// One scalar, as written. Quotes are stripped and the contents taken
// literally — no escape processing, because the data needs none and a half
// implemented escape is a trap.
export function parseScalar(raw) {
  const s = raw.trim();
  if (!s) return '';
  const q = QUOTED.exec(s);
  if (q) return q[2];
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (NUMERIC.test(s)) return Number(s);
  return s;
}

// Split "key: value" at the first colon that is followed by a space or ends
// the line. A colon inside a value is ordinary ("Romans 12:21"), which is
// exactly why the split is not on the first colon.
const splitKey = (line) => {
  const m = /^([^:]+):(?:\s+([\s\S]*))?$/.exec(line);
  return m ? { key: m[1].trim(), rest: m[2] === undefined ? null : m[2] } : null;
};

const isBlank = (line) => !line.trim() || /^\s*#/.test(line.trim());
const indentOf = (line) => line.length - line.replace(/^\s+/, '').length;

// Parse a sequence of mappings whose "- " items sit at `indent`. Returns the
// items and the index of the first line that is not part of the sequence.
function parseSeq(lines, from, indent) {
  const items = [];
  let i = from;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }
    const ind = indentOf(line);
    if (ind < indent) break;                        // dedent: the sequence ended
    if (ind > indent) throw new Error(`btc-yaml: unexpected indentation on line ${i + 1}: ${line.trim()}`);
    if (!/^-\s+\S/.test(line.trim())) break;        // a key at this level: not ours
    const item = {};
    const first = splitKey(line.trim().replace(/^-\s+/, ''));
    if (!first) throw new Error(`btc-yaml: expected "key: value" on line ${i + 1}: ${line.trim()}`);
    // The item's own indentation is where its first key sits — two columns
    // past the dash, wherever the dash is.
    const keyIndent = ind + (line.trim().length - line.trim().replace(/^-\s+/, '').length);
    i = parseMapping(lines, i, keyIndent, item, first);
    items.push(item);
  }
  return { items, next: i };
}

// Fill `into` from the "key: value" lines at `indent`, starting with the pair
// already read off the sequence's dash line.
function parseMapping(lines, from, indent, into, firstPair) {
  let i = from;
  let pair = firstPair;
  for (;;) {
    if (pair.rest === null) {
      // "key:" with nothing after it — a nested sequence of mappings, indented
      // deeper. The only nesting the subset allows.
      const seqAt = nextContentIndent(lines, i + 1);
      if (seqAt === null || seqAt.indent <= indent) {
        throw new Error(`btc-yaml: "${pair.key}:" on line ${i + 1} has no value and no nested items`);
      }
      const seq = parseSeq(lines, seqAt.index, seqAt.indent);
      if (!seq.items.length) throw new Error(`btc-yaml: "${pair.key}:" on line ${i + 1} has no nested items`);
      into[pair.key] = seq.items;
      i = seq.next;
    } else {
      into[pair.key] = parseScalar(pair.rest);
      i++;
    }
    // The next key of this same mapping, if there is one.
    const at = nextContentIndent(lines, i);
    if (at === null || at.indent !== indent || /^-\s/.test(lines[at.index].trim())) return at ? at.index : lines.length;
    const p = splitKey(lines[at.index].trim());
    if (!p) throw new Error(`btc-yaml: expected "key: value" on line ${at.index + 1}: ${lines[at.index].trim()}`);
    i = at.index;
    pair = p;
  }
}

// The next line with content, and how far it is indented.
function nextContentIndent(lines, from) {
  for (let i = from; i < lines.length; i++) {
    if (isBlank(lines[i])) continue;
    return { index: i, indent: indentOf(lines[i]) };
  }
  return null;
}

// The whole document: a sequence of mappings at column 0.
export function parseYamlSequence(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const at = nextContentIndent(lines, 0);
  if (at === null) return [];
  if (at.indent !== 0 || !/^-\s+\S/.test(lines[at.index].trim())) {
    throw new Error(`btc-yaml: expected a sequence of mappings at line ${at.index + 1}`);
  }
  const { items, next } = parseSeq(lines, at.index, 0);
  const trailing = nextContentIndent(lines, next);
  if (trailing !== null) {
    throw new Error(`btc-yaml: unexpected content after the sequence on line ${trailing.index + 1}`);
  }
  return items;
}
