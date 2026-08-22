# The notation

> The alphabet the βook of βitcoin writes its scripts in, and the marks a
> passage carries. Generated from the book’s own tables on every deploy
> (`tools/prerender-notation.mjs`), so it says what the pages say.

The book is at https://bookofbitcoin.io; [/llms.txt](https://bookofbitcoin.io/llms.txt) says where its text
lives and how to reconstruct any passage, and [/brief.md](https://bookofbitcoin.io/brief.md)
is the whole book explained in one file.

## How to read a mark

A script is printed as marks, one per opcode, and the pushes between them
as prose. A mark’s **superscript counts the bytes** of the push beside it —
`h²⁰` is a 20-byte hash, `p³²` a 32-byte key — and that count is what makes
the notation invertible, since decoding needs to be told a payload’s length.
Subscripts distinguish a family’s variants: `⧉` DUP, `⧉₂` 2DUP, `°₄` NOP4,
`∇₊` CHECKSIGADD.

One exception, and it is deliberate: **`⌘`’s superscript counts bits**, so
that it pairs with `⓪`’s count of proof-of-work zero bits and the two always
sum to 256.

No hash, key, script, txid or preimage is ever set as hex in this book. It
is said in Glossia prose, or it shows `…`. What may be set as figures is
what carries no entropy: a version, a count, an index, an amount.

## The opcode alphabet

Every opcode consensus defines has exactly one mark, and the mapping is a
bijection — which is what lets a spelled script name a script and nothing
else. Disabled opcodes keep their mark like any other: a script is notation
whether or not the network would still run it.

### Constants

| Mark | Opcode | Byte |
|---|---|---|
| `⓪` | OP_0 | 0x00 |
| `⊖` | OP_1NEGATE | 0x4f |
| `①` | OP_1 | 0x51 |
| `②` | OP_2 | 0x52 |
| `③` | OP_3 | 0x53 |
| `④` | OP_4 | 0x54 |
| `⑤` | OP_5 | 0x55 |
| `⑥` | OP_6 | 0x56 |
| `⑦` | OP_7 | 0x57 |
| `⑧` | OP_8 | 0x58 |
| `⑨` | OP_9 | 0x59 |
| `⑩` | OP_10 | 0x5a |
| `⑪` | OP_11 | 0x5b |
| `⑫` | OP_12 | 0x5c |
| `⑬` | OP_13 | 0x5d |
| `⑭` | OP_14 | 0x5e |
| `⑮` | OP_15 | 0x5f |
| `⑯` | OP_16 | 0x60 |

### Flow control

| Mark | Opcode | Byte |
|---|---|---|
| `°` | OP_NOP | 0x61 |
| `⟨` | OP_IF | 0x63 |
| `¬⟨` | OP_NOTIF | 0x64 |
| `│` | OP_ELSE | 0x67 |
| `⟩` | OP_ENDIF | 0x68 |
| `✓` | OP_VERIFY | 0x69 |
| `¶` | OP_RETURN | 0x6a |

### Stack

| Mark | Opcode | Byte |
|---|---|---|
| `⇥` | OP_TOALTSTACK | 0x6b |
| `⇤` | OP_FROMALTSTACK | 0x6c |
| `⌄₂` | OP_2DROP | 0x6d |
| `⧉₂` | OP_2DUP | 0x6e |
| `⧉₃` | OP_3DUP | 0x6f |
| `⇗₂` | OP_2OVER | 0x70 |
| `↻₂` | OP_2ROT | 0x71 |
| `⇄₂` | OP_2SWAP | 0x72 |
| `⧉?` | OP_IFDUP | 0x73 |
| `↕` | OP_DEPTH | 0x74 |
| `⌄` | OP_DROP | 0x75 |
| `⧉` | OP_DUP | 0x76 |
| `⌦` | OP_NIP | 0x77 |
| `⇗` | OP_OVER | 0x78 |
| `⇡` | OP_PICK | 0x79 |
| `⥀` | OP_ROLL | 0x7a |
| `↻` | OP_ROT | 0x7b |
| `⇄` | OP_SWAP | 0x7c |
| `⇘` | OP_TUCK | 0x7d |

### Splice

| Mark | Opcode | Byte |
|---|---|---|
| `⧺` | OP_CAT | 0x7e |
| `⊂` | OP_SUBSTR | 0x7f |
| `↤` | OP_LEFT | 0x80 |
| `↦` | OP_RIGHT | 0x81 |
| `ℓ` | OP_SIZE | 0x82 |

### Bitwise and equality

| Mark | Opcode | Byte |
|---|---|---|
| `∼` | OP_INVERT | 0x83 |
| `∩` | OP_AND | 0x84 |
| `∪` | OP_OR | 0x85 |
| `⊻` | OP_XOR | 0x86 |
| `=` | OP_EQUAL | 0x87 |
| `≡` | OP_EQUALVERIFY | 0x88 |

### Arithmetic

| Mark | Opcode | Byte |
|---|---|---|
| `+₁` | OP_1ADD | 0x8b |
| `−₁` | OP_1SUB | 0x8c |
| `×₂` | OP_2MUL | 0x8d |
| `÷₂` | OP_2DIV | 0x8e |
| `∓` | OP_NEGATE | 0x8f |
| `|·|` | OP_ABS | 0x90 |
| `¬` | OP_NOT | 0x91 |
| `≠₀` | OP_0NOTEQUAL | 0x92 |
| `+` | OP_ADD | 0x93 |
| `−` | OP_SUB | 0x94 |
| `×` | OP_MUL | 0x95 |
| `÷` | OP_DIV | 0x96 |
| `%` | OP_MOD | 0x97 |
| `«` | OP_LSHIFT | 0x98 |
| `»` | OP_RSHIFT | 0x99 |
| `∧` | OP_BOOLAND | 0x9a |
| `∨` | OP_BOOLOR | 0x9b |

### Comparison

| Mark | Opcode | Byte |
|---|---|---|
| `≐` | OP_NUMEQUAL | 0x9c |
| `≑` | OP_NUMEQUALVERIFY | 0x9d |
| `≠` | OP_NUMNOTEQUAL | 0x9e |
| `<` | OP_LESSTHAN | 0x9f |
| `>` | OP_GREATERTHAN | 0xa0 |
| `≤` | OP_LESSTHANOREQUAL | 0xa1 |
| `≥` | OP_GREATERTHANOREQUAL | 0xa2 |
| `⊓` | OP_MIN | 0xa3 |
| `⊔` | OP_MAX | 0xa4 |
| `∈` | OP_WITHIN | 0xa5 |

### Cryptography

| Mark | Opcode | Byte |
|---|---|---|
| `ρ` | OP_RIPEMD160 | 0xa6 |
| `σ` | OP_SHA1 | 0xa7 |
| `Σ` | OP_SHA256 | 0xa8 |
| `⌖` | OP_HASH160 | 0xa9 |
| `⌘` | OP_HASH256 | 0xaa |
| `‖` | OP_CODESEPARATOR | 0xab |
| `∇` | OP_CHECKSIG | 0xac |
| `▼` | OP_CHECKSIGVERIFY | 0xad |
| `◇` | OP_CHECKMULTISIG | 0xae |
| `◆` | OP_CHECKMULTISIGVERIFY | 0xaf |
| `∇₊` | OP_CHECKSIGADD | 0xba |

### Timelocks

| Mark | Opcode | Byte |
|---|---|---|
| `τ` | OP_CHECKLOCKTIMEVERIFY | 0xb1 |
| `Δ` | OP_CHECKSEQUENCEVERIFY | 0xb2 |

### No-ops

| Mark | Opcode | Byte |
|---|---|---|
| `°₁` | OP_NOP1 | 0xb0 |
| `°₄` | OP_NOP4 | 0xb3 |
| `°₅` | OP_NOP5 | 0xb4 |
| `°₆` | OP_NOP6 | 0xb5 |
| `°₇` | OP_NOP7 | 0xb6 |
| `°₈` | OP_NOP8 | 0xb7 |
| `°₉` | OP_NOP9 | 0xb8 |
| `°₁₀` | OP_NOP10 | 0xb9 |

### Reserved and invalid

| Mark | Opcode | Byte |
|---|---|---|
| `⊘` | OP_RESERVED | 0x50 |
| `⊘ᵛ` | OP_VER | 0x62 |
| `⊘⟨` | OP_VERIF | 0x65 |
| `⊘¬⟨` | OP_VERNOTIF | 0x66 |
| `⊘₁` | OP_RESERVED1 | 0x89 |
| `⊘₂` | OP_RESERVED2 | 0x8a |
| `☒` | OP_INVALIDOPCODE | 0xff |

## Scripts as terms

Every locking script is an abstraction over its own datum, and the book
titles each output with the term it binds: the kind, `:=`, then the lambda.
The term is not looked up but **read** — every push becomes a binder, every
opcode stays where it stands — so a script with no tabled form is titled
too, and one that binds nothing is not titled at all.

The six forms an address can write:

| Form | Term | Binds | A spend must bring |
|---|---|---|---|
| P2PK | `P2PK := λp. p ∇` | `p³³` — public key | `s` |
| P2PKH | `P2PKH := λh. ⧉ ⌖ h ≡ ∇` | `h²⁰` — hash | `s p` |
| P2SH | `P2SH := λh. ⌖ h =` | `h²⁰` — hash | `… r` |
| P2WPKH | `P2WPKH := λh. ⓪ h` | `h²⁰` — hash | `s p` |
| P2WSH | `P2WSH := λh. ⓪ h` | `h³²` — hash | `… w` |
| P2TR | `P2TR := λp. ① p` | `p³²` — public key — Taproot tweaked output key | `s` or `… t c` |

A term in **closed** normal form settles on chain by itself; the free
variables of an **open** one name exactly what a spender must still supply,
which is the typed interface to the spend. A script-hash form (P2SH, P2WSH,
taproot’s script path) commits only to a hash until it is spent, so what it
demands is written `( r )` — whatever the revealed script demands — and the
binders it cannot count are written `…`. The spend is where the abstract
becomes concrete: the input hands over the bytes, and the revealed script
takes a title of its own.

The letters:

| Letter | What it names |
|---|---|
| `h` | a hash the output committed to |
| `p` | a public key |
| `d` | data — an output that carries a payload rather than a lock |
| `s` | a signature |
| `r` | a redeem script, revealed by the spend (P2SH) |
| `w` | a witness script, revealed by the spend (P2WSH) |
| `t` | a tapscript leaf |
| `c` | a control block — the leaf’s proof to the output key |
| `…` | however many arguments the revealed script wants, uncountable until it is revealed |

## Marks a passage carries

| Mark | What it means |
|---|---|
| `I II III` | volume — a halving era, 210,000 blocks |
| `β` | book — a difficulty window, 2,016 blocks (and, in a frontispiece, the target itself) |
| `■` | chapter — one block, by its position in the book |
| `§` | section — one transaction, by its 1-based position in the block |
| `§1.0` | an output of that section, by its 0-based vout |
| `§1.a` | a witness of that section, by its footnote letter |
| `⌘` | a double-SHA256 hash — a block hash or a transaction id. Its superscript counts BITS, uniquely; every other mark’s counts bytes |
| `⓪` | in a hash, the proof-of-work zero bits closing the line — ⌘ and ⓪ always sum to 256. In a script, OP_0 |
| `⋔` | a merkle root |
| `η` | the header’s nonce |
| `v` | the header’s version |
| `‡` | a work cited outside the text, dated into this passage by its OpenTimestamps proof |
| `₿` | an amount |
| `λ` | an abstraction — the term a locking script binds (see below) |
| `□` | no locktime — final with respect to time |
| `● ○ †` | an input’s sequence: final, non-replaceable, replaceable (opt-in RBF) |
| `∅` | nothing is there — a coinbase’s absent prior output, a field a flag zeroed |
| `⋯` | not yet known — a value still being fetched, or one that cannot be priced |
| `☒` | a disagreement — two readings of the same bytes that do not match |

The last three are the book declining rather than guessing. A value that
cannot be computed honestly is never filled in with a plausible one: the
page shows the mark and puts the claim in its hover.

## Licensing

The notation — this alphabet, the citation sigla, the term notation — is
dedicated to the public domain under CC0 1.0. Sigla are orthography, not
commentary: `⧉` *is* OP_DUP, the way a payload word *is* its bytes. Write it
wherever you like, credit no one, and change it where it serves you better.
The opcode names it falls back on are Bitcoin Core’s, from its MIT-licensed
sources, with thanks.
