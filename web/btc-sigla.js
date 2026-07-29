// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-sigla.js — the opcode alphabet: the mark for every opcode, and the
// canonical OP_* name behind it. Lifted out of btc-prose.js so that the front
// matter's sigla leaf can render the real table without importing the prose
// composer, which pulls in the Glossia WASM engine it has no use for. The
// renderer imports these from here, so book and key can never disagree.
//
// (A file boundary for a loading reason, not a licensing one: these tables are
// source code on the repository's usual dual terms. What is dedicated to the
// public domain is the notation itself -- the convention that a mark means an
// opcode -- which is not a file. See the README's License section.)

// The byte count a mark carries as a superscript riding after it (h³², p⁶⁵ --
// "this prose carries n bytes"). Part of the notation rather than the prose,
// so it lives here with the marks and can be set by a page that has no use for
// the engine; btc-prose.js re-exports it for the renderer that does.
const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
export const toSuperscript = (n) => String(n).split('').map((d) => SUPERSCRIPT_DIGITS[+d]).join('');

// Opcode byte -> Glossia glyph. Every defined opcode has one; families share
// a base glyph, with the house subscript convention distinguishing variants
// (⧉₂ = 2DUP, °₄ = NOP4, ∇₊ = CHECKSIGADD). Disabled opcodes keep their
// natural symbol like any other -- a script is notation whether or not the
// network would still execute it.
export const OPCODE_SYMBOLS = {
  // constants
  0x00: '⓪', 0x4f: '⊖',
  0x51: '①', 0x52: '②', 0x53: '③', 0x54: '④', 0x55: '⑤',
  0x56: '⑥', 0x57: '⑦', 0x58: '⑧', 0x59: '⑨', 0x5a: '⑩',
  0x5b: '⑪', 0x5c: '⑫', 0x5d: '⑬', 0x5e: '⑭', 0x5f: '⑮', 0x60: '⑯',
  // flow control
  0x61: '°', 0x63: '⟨', 0x64: '¬⟨', 0x67: '│', 0x68: '⟩', 0x69: '✓', 0x6a: '¶',
  // stack choreography (arrows), the alt-stack shelf pair, and depth/size
  0x6b: '⇥', 0x6c: '⇤',
  0x6d: '⌄₂', 0x6e: '⧉₂', 0x6f: '⧉₃', 0x70: '⇗₂', 0x71: '↻₂', 0x72: '⇄₂',
  0x73: '⧉?', 0x74: '↕', 0x75: '⌄', 0x76: '⧉', 0x77: '⌦', 0x78: '⇗',
  0x79: '⇡', 0x7a: '⥀', 0x7b: '↻', 0x7c: '⇄', 0x7d: '⇘',
  // splice
  0x7e: '⧺', 0x7f: '⊂', 0x80: '↤', 0x81: '↦', 0x82: 'ℓ',
  // bitwise, and byte equality
  0x83: '∼', 0x84: '∩', 0x85: '∪', 0x86: '⊻', 0x87: '=', 0x88: '≡',
  // arithmetic and comparison
  0x8b: '+₁', 0x8c: '−₁', 0x8d: '×₂', 0x8e: '÷₂', 0x8f: '∓', 0x90: '|·|',
  0x91: '¬', 0x92: '≠₀',
  0x93: '+', 0x94: '−', 0x95: '×', 0x96: '÷', 0x97: '%', 0x98: '«', 0x99: '»',
  0x9a: '∧', 0x9b: '∨', 0x9c: '≐', 0x9d: '≑', 0x9e: '≠',
  0x9f: '<', 0xa0: '>', 0xa1: '≤', 0xa2: '≥', 0xa3: '⊓', 0xa4: '⊔', 0xa5: '∈',
  // crypto
  0xa6: 'ρ', 0xa7: 'σ', 0xa8: 'Σ', 0xa9: '⌖', 0xaa: '⌘', 0xab: '‖',
  0xac: '∇', 0xad: '▼', 0xae: '◇', 0xaf: '◆', 0xba: '∇₊',
  // timelocks
  0xb1: 'τ', 0xb2: 'Δ',
  // no-ops
  0xb0: '°₁', 0xb3: '°₄', 0xb4: '°₅', 0xb5: '°₆', 0xb6: '°₇',
  0xb7: '°₈', 0xb8: '°₉', 0xb9: '°₁₀',
  // reserved / invalid
  0x50: '⊘', 0x62: '⊘ᵛ', 0x65: '⊘⟨', 0x66: '⊘¬⟨', 0x89: '⊘₁', 0x8a: '⊘₂',
  0xff: '☒',
};

// Opcode byte -> Bitcoin Core name: the hover title carried on every glyph,
// and the display fallback for undefined bytes (shown as OP_UNKNOWN).
export const OPCODE_NAMES = {
  0x00: 'OP_0', 0x4f: 'OP_1NEGATE', 0x50: 'OP_RESERVED',
  0x51: 'OP_1', 0x52: 'OP_2', 0x53: 'OP_3', 0x54: 'OP_4', 0x55: 'OP_5',
  0x56: 'OP_6', 0x57: 'OP_7', 0x58: 'OP_8', 0x59: 'OP_9', 0x5a: 'OP_10',
  0x5b: 'OP_11', 0x5c: 'OP_12', 0x5d: 'OP_13', 0x5e: 'OP_14', 0x5f: 'OP_15', 0x60: 'OP_16',
  0x61: 'OP_NOP', 0x62: 'OP_VER', 0x63: 'OP_IF', 0x64: 'OP_NOTIF', 0x65: 'OP_VERIF', 0x66: 'OP_VERNOTIF',
  0x67: 'OP_ELSE', 0x68: 'OP_ENDIF', 0x69: 'OP_VERIFY', 0x6a: 'OP_RETURN',
  0x6b: 'OP_TOALTSTACK', 0x6c: 'OP_FROMALTSTACK', 0x6d: 'OP_2DROP', 0x6e: 'OP_2DUP', 0x6f: 'OP_3DUP',
  0x70: 'OP_2OVER', 0x71: 'OP_2ROT', 0x72: 'OP_2SWAP', 0x73: 'OP_IFDUP', 0x74: 'OP_DEPTH',
  0x75: 'OP_DROP', 0x76: 'OP_DUP',
  0x77: 'OP_NIP', 0x78: 'OP_OVER', 0x79: 'OP_PICK', 0x7a: 'OP_ROLL', 0x7b: 'OP_ROT', 0x7c: 'OP_SWAP', 0x7d: 'OP_TUCK',
  0x7e: 'OP_CAT', 0x7f: 'OP_SUBSTR', 0x80: 'OP_LEFT', 0x81: 'OP_RIGHT', 0x82: 'OP_SIZE',
  0x83: 'OP_INVERT', 0x84: 'OP_AND', 0x85: 'OP_OR', 0x86: 'OP_XOR',
  0x87: 'OP_EQUAL', 0x88: 'OP_EQUALVERIFY',
  0x89: 'OP_RESERVED1', 0x8a: 'OP_RESERVED2',
  0x8b: 'OP_1ADD', 0x8c: 'OP_1SUB', 0x8d: 'OP_2MUL', 0x8e: 'OP_2DIV', 0x8f: 'OP_NEGATE',
  0x90: 'OP_ABS', 0x91: 'OP_NOT', 0x92: 'OP_0NOTEQUAL',
  0x93: 'OP_ADD', 0x94: 'OP_SUB', 0x95: 'OP_MUL', 0x96: 'OP_DIV', 0x97: 'OP_MOD', 0x98: 'OP_LSHIFT', 0x99: 'OP_RSHIFT',
  0x9a: 'OP_BOOLAND', 0x9b: 'OP_BOOLOR', 0x9c: 'OP_NUMEQUAL', 0x9d: 'OP_NUMEQUALVERIFY', 0x9e: 'OP_NUMNOTEQUAL',
  0x9f: 'OP_LESSTHAN', 0xa0: 'OP_GREATERTHAN', 0xa1: 'OP_LESSTHANOREQUAL', 0xa2: 'OP_GREATERTHANOREQUAL',
  0xa3: 'OP_MIN', 0xa4: 'OP_MAX', 0xa5: 'OP_WITHIN',
  0xa6: 'OP_RIPEMD160', 0xa7: 'OP_SHA1', 0xa8: 'OP_SHA256', 0xa9: 'OP_HASH160', 0xaa: 'OP_HASH256',
  0xab: 'OP_CODESEPARATOR',
  0xac: 'OP_CHECKSIG', 0xad: 'OP_CHECKSIGVERIFY', 0xae: 'OP_CHECKMULTISIG', 0xaf: 'OP_CHECKMULTISIGVERIFY',
  0xb0: 'OP_NOP1', 0xb1: 'OP_CHECKLOCKTIMEVERIFY', 0xb2: 'OP_CHECKSEQUENCEVERIFY',
  0xb3: 'OP_NOP4', 0xb4: 'OP_NOP5', 0xb5: 'OP_NOP6', 0xb6: 'OP_NOP7',
  0xb7: 'OP_NOP8', 0xb8: 'OP_NOP9', 0xb9: 'OP_NOP10', 0xba: 'OP_CHECKSIGADD',
  0xff: 'OP_INVALIDOPCODE',
};

// The order the key reads in, and the names those families go by. Every byte
// in OPCODE_NAMES appears in exactly one group -- asserted by the front
// matter's sigla leaf, which renders straight from these tables and would
// leave an opcode out silently otherwise.
export const OPCODE_GROUPS = [
  { title: 'Constants',            bytes: [0x00, 0x4f, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5f, 0x60] },
  { title: 'Flow control',         bytes: [0x61, 0x63, 0x64, 0x67, 0x68, 0x69, 0x6a] },
  { title: 'Stack',                bytes: [0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d] },
  { title: 'Splice',               bytes: [0x7e, 0x7f, 0x80, 0x81, 0x82] },
  { title: 'Bitwise and equality', bytes: [0x83, 0x84, 0x85, 0x86, 0x87, 0x88] },
  { title: 'Arithmetic',           bytes: [0x8b, 0x8c, 0x8d, 0x8e, 0x8f, 0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b] },
  { title: 'Comparison',           bytes: [0x9c, 0x9d, 0x9e, 0x9f, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5] },
  { title: 'Cryptography',         bytes: [0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xab, 0xac, 0xad, 0xae, 0xaf, 0xba] },
  { title: 'Timelocks',            bytes: [0xb1, 0xb2] },
  { title: 'No-ops',               bytes: [0xb0, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9] },
  { title: 'Reserved and invalid', bytes: [0x50, 0x62, 0x65, 0x66, 0x89, 0x8a, 0xff] },
];
