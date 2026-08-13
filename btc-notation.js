// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-notation.js — the key to the manuscript's sigla, as markup, shared by
// the two places it is read: the book page's notation toggle (opened while
// reading) and the front matter's sigla leaf (the whole key at rest). One
// copy, so a mark explained in one place is explained in the other. Its
// styles are in notation.css.
//
// Prose, not data: each row glosses what a mark means rather than merely
// pairing it with a name. The exhaustive opcode index is generated from
// btc-sigla.js instead, and the sigla leaf shows both -- these groups teach,
// that table enumerates.

export const NOTATION_HTML = `
          <div class="notation-group">
            <h4>Common script patterns</h4>
            <div class="pattern-scroll">
            <div class="pattern-table">
              <span class="phead"></span><span class="phead">UTXO</span><span class="phead">Validator</span><span class="phead">STXO</span><span class="phead">Witness</span>
              <span class="pname" data-row="p2pk">P2PK</span>
                <span class="seq" data-row="p2pk"><span class="ph">p</span><span class="op op-push">⁶⁵</span> <span class="op">∇</span></span>
                <span class="seq exec" data-row="p2pk"><span class="ph">s</span> <span class="ph chain">p</span> <span class="op">∇</span></span>
                <span class="seq" data-row="p2pk"><span class="ph">s</span></span>
                <span class="seq none" data-row="p2pk">—</span>
              <span class="pname" data-row="p2pkh">P2PKH</span>
                <span class="seq" data-row="p2pkh"><span class="op">⧉</span> <span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">≡</span> <span class="op">∇</span></span>
                <span class="seq exec" data-row="p2pkh"><span class="ph">s</span> <span class="ph">p</span> <span class="op">⧉</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">≡</span> <span class="op">∇</span></span>
                <span class="seq" data-row="p2pkh"><span class="ph">s</span> <span class="ph">p</span></span>
                <span class="seq none" data-row="p2pkh">—</span>
              <span class="pname" data-row="multisig">Multisig</span>
                <span class="seq" data-row="multisig"><span class="op">②</span> <span class="ph">p<sub>1</sub></span><span class="op op-push">³³</span> <span class="ph">p<sub>2</sub></span><span class="op op-push">³³</span> <span class="ph">p<sub>3</sub></span><span class="op op-push">³³</span> <span class="op">③</span> <span class="op">◇</span></span>
                <span class="seq exec" data-row="multisig"><span class="op">⓪</span> <span class="ph">s<sub>1</sub></span> <span class="ph">s<sub>2</sub></span> <span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span></span>
                <span class="seq" data-row="multisig"><span class="op">⓪</span> <span class="ph">s<sub>1</sub></span> <span class="ph">s<sub>2</sub></span></span>
                <span class="seq none" data-row="multisig">—</span>
              <span class="pname" data-row="p2sh">P2SH</span>
                <span class="seq" data-row="p2sh"><span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">=</span></span>
                <span class="seq exec" data-row="p2sh"><span class="ph">r</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(r)</span></span>
                <span class="seq" data-row="p2sh"><span class="lam">⟦</span><span class="ph">r</span><span class="lam">⟧</span></span>
                <span class="seq none" data-row="p2sh">—</span>
              <span class="pname" data-row="p2sh-multisig">P2SH · 2-of-3</span>
                <span class="seq" data-row="p2sh-multisig"><span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">=</span></span>
                <span class="seq exec" data-row="p2sh-multisig"><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span><span class="op">)</span></span>
                <span class="seq" data-row="p2sh-multisig"><span class="op">⓪</span> <span class="ph">s<sub>1</sub></span> <span class="ph">s<sub>2</sub></span> <span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span></span>
                <span class="seq none" data-row="p2sh-multisig">—</span>
              <span class="pname" data-row="p2wpkh">P2WPKH</span>
                <span class="seq" data-row="p2wpkh"><span class="op">⓪</span> <span class="ph">h</span><span class="op op-push">²⁰</span></span>
                <span class="seq exec" data-row="p2wpkh"><span class="ph">s</span> <span class="ph">p</span> <span class="op">⧉</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">≡</span> <span class="op">∇</span></span>
                <span class="seq none" data-row="p2wpkh">∅</span>
                <span class="seq" data-row="p2wpkh"><span class="ph">s</span> <span class="ph">p</span></span>
              <span class="pname" data-row="p2wsh">P2WSH</span>
                <span class="seq" data-row="p2wsh"><span class="op">⓪</span> <span class="ph">h</span><span class="op op-push">³²</span></span>
                <span class="seq exec" data-row="p2wsh"><span class="ph">w</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(w)</span></span>
                <span class="seq none" data-row="p2wsh">∅</span>
                <span class="seq" data-row="p2wsh"><span class="lam">⟦</span><span class="ph">w</span><span class="lam">⟧</span></span>
              <span class="pname" data-row="p2tr-key">P2TR key</span>
                <span class="seq" data-row="p2tr-key"><span class="op">①</span> <span class="ph">p</span><span class="op op-push">³²</span></span>
                <span class="seq exec" data-row="p2tr-key"><span class="ph">s</span> <span class="op">∇</span></span>
                <span class="seq none" data-row="p2tr-key">∅</span>
                <span class="seq" data-row="p2tr-key"><span class="ph">s</span></span>
              <span class="pname" data-row="p2tr-script">P2TR script</span>
                <span class="seq" data-row="p2tr-script"><span class="op">①</span> <span class="ph">p</span><span class="op op-push">³²</span></span>
                <span class="seq exec" data-row="p2tr-script"><span class="ph">t</span> <span class="op">⋔</span> <span class="ph chain">p</span> <span class="op">=</span> <span class="op">(t)</span></span>
                <span class="seq none" data-row="p2tr-script">∅</span>
                <span class="seq" data-row="p2tr-script"><span class="ph">s</span> <span class="ph">t</span> <span class="ph">c</span></span>
              <span class="pname" data-row="data">Data</span>
                <span class="seq" data-row="data"><span class="op">¶</span> <span class="op op-push">ⁿ</span></span>
                <span class="seq none" data-row="data">—</span>
                <span class="seq none" data-row="data">—</span>
                <span class="seq none" data-row="data">—</span>
            </div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Scripts as terms</h4>
            <p class="notation-note">Every lock above is one abstraction over one committed datum. λ is what the
              term still wants; ⟦ ⟧ holds the marks it is built from; and the datum arrives through a step that
              cannot be run backwards. Reduce, and what falls out is the UTXO column of the table above — the
              chain holds normal forms and nothing else.</p>
            <div class="pattern-scroll">
            <div class="pattern-table terms">
              <span class="phead"></span><span class="phead">Term</span><span class="phead">Reduces to</span><span class="phead">Committed by</span>
              <span class="pname" data-row="p2pk">P2PK</span>
                <span class="seq" data-row="p2pk"><span class="lam">λ</span><span class="ph">p</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="ph">p</span> <span class="op">∇</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="p2pk"><span class="lam">⟦</span> <span class="ph">p</span><span class="op op-push">⁶⁵</span> <span class="op">∇</span> <span class="lam">⟧</span></span>
                <span class="seq calc" data-row="p2pk"><span class="ph">p</span> <span class="op">=</span> <span class="ph">k</span><span class="op">G</span></span>
              <span class="pname" data-row="p2pkh">P2PKH</span>
                <span class="seq" data-row="p2pkh"><span class="lam">λ</span><span class="ph">h</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="op">⧉</span> <span class="op">⌖</span> <span class="ph">h</span> <span class="op">≡</span> <span class="op">∇</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="p2pkh"><span class="lam">⟦</span> <span class="op">⧉</span> <span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">≡</span> <span class="op">∇</span> <span class="lam">⟧</span></span>
                <span class="seq calc" data-row="p2pkh"><span class="ph">h</span> <span class="op">=</span> <span class="op">⌖</span> <span class="ph">p</span></span>
              <span class="pname" data-row="multisig">Multisig</span>
                <span class="seq" data-row="multisig"><span class="lam">λ</span><i>m</i> <i>n</i> <span class="ph">p</span><sub>1</sub>…<span class="ph">p</span><sub><i>n</i></sub><span class="lam">.</span> <span class="lam">⟦</span> <i>m</i> <span class="ph">p</span><sub>1</sub>…<span class="ph">p</span><sub><i>n</i></sub> <i>n</i> <span class="op">◇</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="multisig"><span class="lam">⟦</span> <span class="op">②</span> <span class="ph">p<sub>1</sub></span><span class="op op-push">³³</span> <span class="ph">p<sub>2</sub></span><span class="op op-push">³³</span> <span class="ph">p<sub>3</sub></span><span class="op op-push">³³</span> <span class="op">③</span> <span class="op">◇</span> <span class="lam">⟧</span></span>
                <span class="seq none" data-row="multisig">—</span>
              <span class="pname" data-row="p2sh p2sh-multisig">P2SH</span>
                <span class="seq" data-row="p2sh p2sh-multisig"><span class="lam">λ</span><span class="ph">h</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="op">⌖</span> <span class="ph">h</span> <span class="op">=</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="p2sh p2sh-multisig"><span class="lam">⟦</span> <span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">=</span> <span class="lam">⟧</span></span>
                <span class="seq calc" data-row="p2sh p2sh-multisig"><span class="ph">h</span> <span class="op">=</span> <span class="op">⌖</span> <span class="ph">r</span></span>
              <span class="pname" data-row="p2wpkh">P2WPKH</span>
                <span class="seq" data-row="p2wpkh"><span class="lam">λ</span><span class="ph">h</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="op">⓪</span> <span class="ph">h</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="p2wpkh"><span class="lam">⟦</span> <span class="op">⓪</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="lam">⟧</span></span>
                <span class="seq calc" data-row="p2wpkh"><span class="ph">h</span> <span class="op">=</span> <span class="op">⌖</span> <span class="ph">p</span></span>
              <span class="pname" data-row="p2wsh">P2WSH</span>
                <span class="seq" data-row="p2wsh"><span class="lam">λ</span><span class="ph">h</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="op">⓪</span> <span class="ph">h</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="p2wsh"><span class="lam">⟦</span> <span class="op">⓪</span> <span class="ph">h</span><span class="op op-push">³²</span> <span class="lam">⟧</span></span>
                <span class="seq calc" data-row="p2wsh"><span class="ph">h</span> <span class="op">=</span> <span class="op">Σ</span> <span class="ph">w</span></span>
              <span class="pname" data-row="p2tr-key p2tr-script">P2TR</span>
                <span class="seq" data-row="p2tr-key p2tr-script"><span class="lam">λ</span><span class="ph">p</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="op">①</span> <span class="ph">p</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="p2tr-key p2tr-script"><span class="lam">⟦</span> <span class="op">①</span> <span class="ph">p</span><span class="op op-push">³²</span> <span class="lam">⟧</span></span>
                <span class="seq calc" data-row="p2tr-key p2tr-script"><span class="ph">p</span> <span class="op">=</span> <span class="ph">p<sub>0</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sub>0</sub></span><span class="op">⧺</span><span class="ph">⋔</span><span class="op">)</span><span class="op">G</span></span>
              <span class="pname" data-row="data">Data</span>
                <span class="seq" data-row="data"><span class="lam">λ</span><span class="ph">d</span><span class="lam">.</span> <span class="lam">⟦</span> <span class="op">¶</span> <span class="ph">d</span> <span class="lam">⟧</span></span>
                <span class="seq" data-row="data"><span class="lam">⟦</span> <span class="op">¶</span> <span class="op op-push">ⁿ</span> <span class="lam">⟧</span></span>
                <span class="seq none" data-row="data">—</span>
            </div>
            </div>
            <div class="glyph-grid">
              <div class="glyph-row" data-marks="tpl:p2pk tpl:p2pkh tpl:multisig tpl:p2sh tpl:p2sh-multisig tpl:p2wpkh tpl:p2wsh tpl:p2tr-key tpl:p2tr-script tpl:data tpl:lightning"><span class="g">⟦ ⟧</span><span class="m">the <b>script constructor</b> — the marks in order, which is what the chain holds. Inert: a mark <i>inside</i> is a byte that gets printed, the same glyph <i>outside</i> is that operation being run. ⌖ inside is the opcode; ⌖ outside is the hash actually being taken. Its counterpart is <b>( )</b>, above, which runs what the brackets hold — quote and its eval. The brackets also carry the push length, which is where a mark's superscript comes from</span></div>
              <div class="glyph-row" data-marks="tpl:p2pk tpl:p2pkh tpl:multisig tpl:p2sh tpl:p2sh-multisig tpl:p2wpkh tpl:p2wsh tpl:p2tr-key tpl:p2tr-script tpl:data tpl:lightning"><span class="g">λ</span><span class="m"><b>abstraction</b> — what the term still wants. An unspent output's free variables are exactly what has not been decided yet; a spend supplies them. It abstracts over the bytes and not over what they do: ⧉ is a variable used twice, and it is also a byte the output carries, so the term keeps it. A calculus that named the values away would normalize to something the chain does not hold</span></div>
              <div class="glyph-row" data-marks="tpl:p2pk tpl:p2pkh tpl:multisig tpl:p2sh tpl:p2sh-multisig tpl:p2wpkh tpl:p2wsh tpl:p2tr-key tpl:p2tr-script tpl:data tpl:lightning"><span class="g">β</span><span class="m"><b>reduction</b> — notation collapsing, and reversible: nothing is lost, so a term can always be abstracted again. It is also why a script never contains one. What the chain holds is already reduced, and a node checks it rather than running it down</span></div>
              <div class="glyph-row" data-marks="tpl:p2pk tpl:p2pkh tpl:multisig tpl:p2sh tpl:p2sh-multisig tpl:p2wpkh tpl:p2wsh tpl:p2tr-key tpl:p2tr-script tpl:data tpl:lightning"><span class="g">δ</span><span class="m">the <b>one-way steps</b> — ⌖ ⌘ Σ, and a public key from the scalar behind it. What is on chain is a β-reduced term whose δ steps cannot be run backwards, which is the whole of what the marks above keep secret</span></div>
            </div>
            <p class="notation-note">Three ways for a thing not to be on chain, sorted down the columns above:
              <b>under λ</b>, not yet chosen; <b>under ⟦ ⟧</b>, committed but not revealed — which is why those
              rows commit to <b>h</b> and not to what <b>h</b> hashes; <b>behind δ</b>, revealed only as an image.
              P2SH keeps its term bracketed from the address to the spend, Taproot a whole tree of them at the same
              thirty-three bytes: what is never reduced is never visible.</p>
            <p class="notation-note">Lift the opcodes out as arguments too, and the length of the push
              with them, and what is left of a lock is shape alone: <span class="lam">λ</span><i>o</i><sub>1</sub>
              <i>o</i><sub>2</sub> <i>o</i><sub>3</sub> <i>o</i><sub>4</sub> <i>n</i> <b>h</b><span
              class="lam">.</span> <span class="lam">⟦</span> <i>o</i><sub>1</sub> <i>o</i><sub>2</sub>
              <b>h</b><sup><i>n</i></sup> <i>o</i><sub>3</sub> <i>o</i><sub>4</sub> <span class="lam">⟧</span> —
              P2PKH at the arguments ⧉ ⌖ ≡ ∇ 20 <b>h</b>. The push is a pair, length then bytes, because a direct
              push opcode <i>is</i> its count. A term then says on its face how much key material its outputs
              need, and P2WPKH, P2WSH and P2TR stop resembling one another: they are one term, <span
              class="lam">λ</span><i>o</i> <i>n</i> <b>x</b><span class="lam">.</span> <span class="lam">⟦</span>
              <i>o</i> <b>x</b><sup><i>n</i></sup> <span class="lam">⟧</span>, at three arguments.</p>

            <p class="notation-note">⧉ is in the term because it is on the wire. A term normalizes to the bytes a
              node stores, so nothing a script prints can be named away — dispose of the stack marks and what falls
              out is not that output. Disposing of them is the validator column's reading, which runs a script
              rather than printing one: two terms end to end, <b>⟦</b>spend<b>⟧</b> then <b>⟦</b>lock<b>⟧</b>, with
              a δ step between them that no name crosses. β never appears in a script either — a term's β is a step
              and free, a chapter's β is a target and bought.</p>
          </div>

          <div class="notation-group">
            <h4>Addresses — the argument, written down</h4>
            <p class="notation-note">An address is not a lock: it carries the datum and a tag naming which
              abstraction to put it in, while the sender's software holds the λ. Nothing else fits in one, and
              nothing else has to. So the book prints the term, which names its own address — where a string runs
              one way only, giving back the datum and never what it is a hash of. The search leaf writes the pair
              out, term then argument: an address as the partial application it is.</p>
            <div class="pattern-scroll">
            <div class="pattern-table addresses">
              <span class="phead"></span><span class="phead">Address</span><span class="phead">Tag</span><span class="phead">Argument</span><span class="phead">Checksum</span>
              <span class="pname" data-row="p2pkh">P2PKH</span>
                <span class="seq mach" data-row="p2pkh">1…</span>
                <span class="seq mach" data-row="p2pkh">0</span>
                <span class="seq" data-row="p2pkh"><span class="ph">h</span><span class="op op-push">²⁰</span></span>
                <span class="seq" data-row="p2pkh"><span class="op">⌘</span> <span class="op">↤</span><span class="op op-push">⁴</span></span>
              <span class="pname" data-row="p2sh p2sh-multisig">P2SH</span>
                <span class="seq mach" data-row="p2sh p2sh-multisig">3…</span>
                <span class="seq mach" data-row="p2sh p2sh-multisig">5</span>
                <span class="seq" data-row="p2sh p2sh-multisig"><span class="ph">h</span><span class="op op-push">²⁰</span></span>
                <span class="seq" data-row="p2sh p2sh-multisig"><span class="op">⌘</span> <span class="op">↤</span><span class="op op-push">⁴</span></span>
              <span class="pname" data-row="p2wpkh">P2WPKH</span>
                <span class="seq mach" data-row="p2wpkh">bc1q…</span>
                <span class="seq" data-row="p2wpkh"><span class="op">⓪</span></span>
                <span class="seq" data-row="p2wpkh"><span class="ph">h</span><span class="op op-push">²⁰</span></span>
                <span class="seq mach" data-row="p2wpkh">bech32</span>
              <span class="pname" data-row="p2wsh">P2WSH</span>
                <span class="seq mach" data-row="p2wsh">bc1q…</span>
                <span class="seq" data-row="p2wsh"><span class="op">⓪</span></span>
                <span class="seq" data-row="p2wsh"><span class="ph">h</span><span class="op op-push">³²</span></span>
                <span class="seq mach" data-row="p2wsh">bech32</span>
              <span class="pname" data-row="p2tr-key p2tr-script">P2TR</span>
                <span class="seq mach" data-row="p2tr-key p2tr-script">bc1p…</span>
                <span class="seq" data-row="p2tr-key p2tr-script"><span class="op">①</span></span>
                <span class="seq" data-row="p2tr-key p2tr-script"><span class="ph">p</span><span class="op op-push">³²</span></span>
                <span class="seq mach" data-row="p2tr-key p2tr-script">bech32m</span>
            </div>
            </div>
            <p class="notation-note">Read down the Tag column and the table splits in two, which is the whole
              history of the format. Base58's tag is a byte outside the script, an index into a table of terms — so
              a term with no byte assigned has no address, and only a new byte could give it one. Segwit's is the
              script's own opening opcode carried through unchanged, and the character after the separator is that
              opcode spelled out (q is ⓪, p is ①): every witness output is <span class="lam">λ</span><i>v</i>
              <b>h</b><span class="lam">.</span> <span class="lam">⟦</span> <i>v</i> <b>h</b> <span
              class="lam">⟧</span>, so version 2 needs no new prefix. The checksums divide the same way: base58
              keeps four bytes of ⌘ over tag and argument, the chain's own hash doing duty as a typo check, while
              bech32 and bech32m are codes of their own.</p>
            <p class="notation-note">Three rows above are missing here, each for the reason its λ gives. Multisig
              abstracts over <i>m</i>, <i>n</i> and <i>n</i> keys — more than one argument, which is the whole of
              what P2SH is for. A data output's has no fixed length and nothing to spend. P2PK's has fixed length
              but never got a byte, so such a key is paid at P2PKH's address, over ⌖ <b>p</b> — a different term,
              which is why the earliest chapters' coins sit at outputs no address names.</p>
          </div>

          <div class="notation-group">
            <h4>Lightning — commitment &amp; channel scripts</h4>
            <div class="pattern-scroll">
            <div class="pattern-table two-party">
              <span class="phead"></span><span class="phead">Party 1</span><span class="phead">Party 2</span><span class="phead">UTXO</span><span class="phead">Validator</span><span class="phead">STXO</span><span class="phead">Witness</span>
              <span class="pname" data-row="lightning">Channel open · 2-of-2</span>
                <span class="seq calc" data-row="lightning"><span class="ph">p<sub>1</sub></span> <span class="op">=</span> <span class="ph">k<sub>1</sub></span><span class="op">G</span> · <span class="ph">p<sup>0</sup></span> <span class="op">=</span> <span class="ph">k<sup>0</sup></span><span class="op">G</span> · <span class="ph">s<sub>1</sub><sup>f</sup></span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq calc" data-row="lightning"><span class="ph">p<sub>2</sub></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span><span class="op">G</span> · <span class="ph">s<sub>2</sub><sup>f</sup></span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq" data-row="lightning"><span class="op">⓪</span> <span class="ph">h</span></span>
                <span class="seq exec" data-row="lightning"><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="op">②</span> <span class="op">◇</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="op">②</span> <span class="op">◇</span><span class="op">)</span></span>
                <span class="seq none" data-row="lightning">∅</span>
                <span class="seq" data-row="lightning"><span class="op">⓪</span> <span class="ph">s<sub>1</sub><sup>f</sup></span> <span class="ph">s<sub>2</sub><sup>f</sup></span> · <span class="op">⓪</span> <span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> <span class="ph">s<sub>2</sub><sup><i>i</i></sup></span></span>
              <span class="pname" data-row="lightning">Channel update</span>
                <span class="seq calc" data-row="lightning"><span class="ph">p<sup><i>i</i>+1</sup></span> <span class="op">=</span> <span class="ph">k<sup><i>i</i>+1</sup></span><span class="op">G</span> · <span class="ph">k<sup><i>i</i></sup></span></span>
                <span class="seq calc" data-row="lightning"><span class="ph">k<sub>r</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span><span class="op">Σ(</span><span class="ph">p<sub>2</sub></span><span class="op">⧺</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">)</span> <span class="op">+</span> <span class="ph">k<sup><i>i</i></sup></span><span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span> · <span class="ph">s<sub>r</sub><sup><i>i</i></sup></span></span>
                <span class="seq none" data-row="lightning">—</span>
                <span class="seq none" data-row="lightning">—</span>
                <span class="seq none" data-row="lightning">—</span>
                <span class="seq none" data-row="lightning">—</span>
              <span class="pname" data-row="lightning">Force close · to_local</span>
                <span class="seq calc" data-row="lightning"><span class="ph">p<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">k<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span> · <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub><sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> · <span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq calc" data-row="lightning"><span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>2</sub></span><span class="op">Σ(</span><span class="ph">p<sub>2</sub></span><span class="op">⧺</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">)</span> <span class="op">+</span> <span class="ph">p<sup><i>i</i></sup></span><span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq" data-row="lightning"><span class="op">⓪</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq exec" data-row="lightning"><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">■</span> <span class="op">Δ</span> <span class="op">⌄</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">∇</span> <span class="op">Σ</span> <span class="ph chain">h<sup><i>i</i></sup></span> <span class="op">=</span> <span class="op">(</span><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">■</span> <span class="op">Δ</span> <span class="op">⌄</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">∇</span><span class="op">)</span></span>
                <span class="seq none" data-row="lightning">∅</span>
                <span class="seq" data-row="lightning"><span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> <span class="op">⓪</span> · <span class="ph">s<sub>r</sub><sup><i>i</i></sup></span> <span class="op">①</span></span>
              <span class="pname" data-row="lightning">Force close · to_remote</span>
                <span class="seq calc" data-row="lightning"><span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq calc" data-row="lightning"><span class="ph">p<sub>2</sub></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span><span class="op">G</span> · <span class="ph">s<sub>2</sub></span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq" data-row="lightning"><span class="op">⓪</span> <span class="ph">h</span></span>
                <span class="seq exec" data-row="lightning"><span class="ph">p<sub>2</sub></span> <span class="op">▼</span> <span class="op">①</span> <span class="op">Δ</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="ph">p<sub>2</sub></span> <span class="op">▼</span> <span class="op">①</span> <span class="op">Δ</span><span class="op">)</span></span>
                <span class="seq none" data-row="lightning">∅</span>
                <span class="seq" data-row="lightning"><span class="ph">s<sub>2</sub></span></span>
              <span class="pname" data-row="lightning">Force close · anchor</span>
                <span class="seq calc" data-row="lightning"><span class="ph">p</span> <span class="op">=</span> <span class="ph">k</span><span class="op">G</span> · <span class="ph">s</span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq calc" data-row="lightning"><span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span> · <span class="op">∅</span></span>
                <span class="seq" data-row="lightning"><span class="op">⓪</span> <span class="ph">h</span></span>
                <span class="seq exec" data-row="lightning"><span class="ph">p</span> <span class="op">∇</span> <span class="op">⧉?</span> <span class="op">¬⟨</span> <span class="op">⑯</span> <span class="op">Δ</span> <span class="op">⟩</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="ph">p</span> <span class="op">∇</span> <span class="op">⧉?</span> <span class="op">¬⟨</span> <span class="op">⑯</span> <span class="op">Δ</span> <span class="op">⟩</span><span class="op">)</span></span>
                <span class="seq none" data-row="lightning">∅</span>
                <span class="seq" data-row="lightning"><span class="ph">s</span> · <span class="op">∅</span></span>
              <span class="pname" data-row="lightning">Force close · HTLC</span>
                <span class="seq calc" data-row="lightning"><span class="ph">k<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span> · <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub><sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>2</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> · <span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq calc" data-row="lightning"><span class="ph">k<sub>2</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span> · <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>2</sub><sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> · <span class="ph">s<sub>2</sub><sup><i>i</i></sup></span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq" data-row="lightning"><span class="op">⓪</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq exec" data-row="lightning"><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">⟨</span> <span class="op">Σ</span> <span class="ph">h</span> <span class="op">≡</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">τ</span> <span class="op">⌄</span> <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">⟩</span> <span class="op">∇</span> <span class="op">Σ</span> <span class="ph chain">h<sup><i>i</i></sup></span> <span class="op">=</span> <span class="op">(</span><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">⟨</span> <span class="op">Σ</span> <span class="ph">h</span> <span class="op">≡</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">τ</span> <span class="op">⌄</span> <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">⟩</span> <span class="op">∇</span><span class="op">)</span></span>
                <span class="seq none" data-row="lightning">∅</span>
                <span class="seq" data-row="lightning"><span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> <span class="ph">h</span> <span class="op">①</span> <span class="op">⓪</span> · <span class="ph">s<sub>2</sub><sup><i>i</i></sup></span> <span class="op">⓪</span> <span class="op">⓪</span> · <span class="ph">s<sub>r</sub><sup><i>i</i></sup></span> <span class="op">①</span></span>
            </div>
            </div>
            <p class="notation-note">The first two columns are off chain: what each party computes for itself — party 1 is the side whose force close this is. Secrets stay in their own column until an update surrenders k<sup><i>i</i></sup> across; everything else a party writes without deriving came from the other column's public points.</p>
          </div>

          <div class="notation-group">
            <h4>Secrets &amp; the generator</h4>
            <div class="glyph-grid">
              <div class="glyph-row" data-marks="tpl:lightning"><span class="g"><b>k</b></span><span class="m"><b>private key</b> — the secret scalar behind a public key; never on chain</span></div>
              <div class="glyph-row" data-marks="tpl:lightning"><span class="g">G</span><span class="m">the <b>generator</b> — the fixed curve point every key descends from: <b>p</b> = <b>k</b>G</span></div>
              <div class="glyph-row" data-marks="tpl:lightning"><span class="g"><b>p</b><sup>0</sup> <b>p</b><sup><i>i</i></sup> <b>p</b><sup>f</sup></span><span class="m"><b>channel state</b> — a superscript scopes a datum to a state of the channel: 0 the initial commitment sealed at funding, <i>i</i> any intermediate update, f the final, closing state. Each state the closing party draws a fresh secret k<sup><i>i</i></sup> and shares only its point p<sup><i>i</i></sup> = k<sup><i>i</i></sup>G; scripts and hashes rebuild per state. Advancing to <i>i</i>+1 revokes state <i>i</i>: k<sup><i>i</i></sup> crosses to the other side — and nothing else</span></div>
              <div class="glyph-row" data-marks="tpl:lightning"><span class="g"><b>p</b><sub>1</sub><sup><i>i</i></sup> <b>p</b><sub>2</sub><sup><i>i</i></sup> <b>p</b><sub>r</sub><sup><i>i</i></sup></span><span class="m"><b>state-scoped keys</b> — party below, state above: each side's base key folded with p<sup><i>i</i></sup>, and the revocation key; the party columns derive them in full, each side by its own route</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Pushes</h4>
            <div class="glyph-grid">
              <div class="glyph-row" data-marks="push:count"><span class="g">²⁰</span><span class="m"><b>push</b> — the bare superscript is the byte count (²⁰ pushes twenty)</span></div>
              <div class="glyph-row"><span class="g">↧<i>n</i> ⇊<i>n</i> ⤋<i>n</i></span><span class="m">extended push — length in a 1 / 2 / 4-byte prefix</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Signatures &amp; keys</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">∇</span><span class="m">check a <b>signature</b></span></div>
              <div class="glyph-row"><span class="g">▼</span><span class="m">check a signature, <b>else fail</b></span></div>
              <div class="glyph-row"><span class="g">◇</span><span class="m">check <b>m-of-n</b> signatures</span></div>
              <div class="glyph-row"><span class="g">◆</span><span class="m">check m-of-n, <b>else fail</b></span></div>
              <div class="glyph-row"><span class="g">∇₊</span><span class="m">check a signature, <b>tallying</b> (tapscript multisig)</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Hashes</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">⌖</span><span class="m"><b>address</b> hash · HASH160</span></div>
              <div class="glyph-row"><span class="g">⌘</span><span class="m"><b>identity</b> hash · HASH256</span></div>
              <div class="glyph-row"><span class="g">Σ</span><span class="m">SHA-256</span></div>
              <div class="glyph-row"><span class="g">σ</span><span class="m">SHA-1</span></div>
              <div class="glyph-row"><span class="g">ρ</span><span class="m">RIPEMD-160</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Timelocks</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">τ</span><span class="m"><b>absolute</b> — not before a fixed time or block</span></div>
              <div class="glyph-row"><span class="g">Δ</span><span class="m"><b>relative</b> — a delay after this coin confirmed</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Numbers</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">⓪</span><span class="m">push zero</span></div>
              <div class="glyph-row" data-marks="① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ ⑪ ⑫ ⑬ ⑭ ⑮ ⑯"><span class="g">①–⑯</span><span class="m">push a small number (1–16)</span></div>
              <div class="glyph-row"><span class="g">⊖</span><span class="m">push minus one</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Coinbase — what opens the scriptSig</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">■<i>n</i></span><span class="m">the <b>block height</b>, written into the coinbase by the miner (BIP34) — the block stating its own place, which is what makes every coinbase distinct. Here alone <i>n</i> is a raw height rather than a count of chapters: the mark reports a number the miner actually put in the bytes, in the chain's units, not the book's. It is also the last thing any rule constrains — everything after it is the miner's own margin, arbitrary bytes in no format, so the book stops reading opcodes at this mark and renders the rest as what it is: quoted where the miner wrote words, prose where the bytes are only bytes. Printable is not the test — better than a third of a counter's bytes fall in the printable range by chance, and a quotation is the book saying someone wrote this</span></div>
              <div class="glyph-row" data-marks="β* re:256[⁰¹²³⁴⁵⁶⁷⁸⁹]"><span class="g">β<i>n</i> <i>m</i>×256<sup><i>e</i></sup></span><span class="m">the <b>difficulty target</b> the miner restated in the coinbase, in the chapter head's own notation — a valid hash opens with n zero bits, and the target is exactly the product beside the mark. The preamble is the older custom: before BIP34 a coinbase opened with this pair instead of a height</span></div>
              <div class="glyph-row" data-marks="time:template"><span class="g"><i>date</i></span><span class="m">the <b>template timestamp</b> — the moment the pool assembled the block template, written straight behind the height by the pools built on btccom's server, and printed in the chapter head's own date form because it is the same kind of thing the header states: a miner's clock reading. No rule puts it there and nothing in the bytes declares it; it is read as a clock because it agrees with the height standing beside it, and as a number otherwise</span></div>
              <div class="glyph-row" data-marks="η*"><span class="g">η<i>p</i>·<i>q</i>…</span><span class="m"><b>extranonce</b> — search space beyond the header's η, the counter a miner rolls once the header's 32 bits are exhausted. Where a pool leaves the gap its miners fill, this is what lands in it: behind ■ from BIP34 on, behind β before it, behind the template's date where one was written. Factored like every other number the book states as a product, and written at full size: the value rode small beside the glyph while it was one figure, but a factorization lowered into a subscript is a product nobody could read. Read as the number it is, in the very notation the header's own nonce takes — which also keeps it out of the margin below, where a counter's bytes are entropy and better than a third of them pass for printable text by chance. Most pools do not push it at all — F2Pool, AntPool and SECPOOL write the counter as raw bytes in the margin — and it takes the same mark there, since it is the same field: read little-endian, minimally encoded, so the figure restores its own bytes. A zero byte closing such a counter is not part of the figure and comes off under ⓪, above, where it belongs. Past eight bytes a run in the margin is not a counter but a commitment or a datum, and stays prose rather than a hundred-digit figure that says nothing about what it holds</span></div>
              <div class="glyph-row" data-marks="zero:run"><span class="g">⓪<sup><i>n</i></sup></span><span class="m"><b><i>n</i> zero bytes</b> — the space a pool's template laid out and nothing filled: room for the counter a miner rolls, or for a commitment this block is not carrying. ⓪ is the zero opcode (0x00, the byte itself) and the superscript counts bytes, as every superscript in a script does. It is a reading of length, not of meaning: the count restores the bytes exactly, and the alternative is a paragraph of the wordlist's first word, which is what zero encodes to. The chapter head's ⓪<i>n</i> counts zero <i>bits</i> of a block hash — same glyph, and each register measures in the unit its own thing is measured in</span></div>
              <div class="glyph-row" data-marks="sig:pool"><span class="g">“<i>tag</i>”</span><span class="m">a <b>pool's signature</b> — the name a mining pool wrote into its own margin, quoted to exactly the extent the pool wrote it and no further, so the counter byte that leans against a tag is not mistaken for the pool's punctuation. The extent comes from the book's table of signatures (<i>web/btc-pools.js</i>). Two claims, kept apart: that these bytes are in the coinbase is the record, and hovering names the pool the book reads them as — an inference from an unauthenticated string anyone may copy, which is why the name is not set on the page</span></div>
              <div class="glyph-row"><span class="g">⋔<sub>w</sub></span><span class="m">the <b>witness commitment</b> — in the coinbase, an OP_RETURN carrying ⌘(witness-tree root ‖ reserved value): the block's witnesses — its footnotes — bound to the chain through §1. The root is committed, never written; no wtxid appears on chain, only this testimony to all of them</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Chapter head — the block header</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">v<i>n</i></span><span class="m">block <b>version</b></span></div>
              <div class="glyph-row"><span class="g">⓪<sup><i>n</i></sup></span><span class="m">a block hash's <i>n</i> <b>proof-of-work zero bits</b> — closing the line, after the prose. They lead the hash as it is displayed, but the prose encodes internal order, where they trail: decode it, append them, reverse. The mark sits where the bytes do. Here <i>n</i> is bits, because a hash's leading zeros are what the work bought; the coinbase margin's ⓪<i>n</i>, above, counts bytes, because bytes are what a pool leaves empty</span></div>
              <div class="glyph-row"><span class="g">⌘<sup><i>m</i></sup></span><span class="m">the hash's remaining <i>m</i> <b>bits</b>, Glossia-encoded — ⌘'s superscript counts bits (<i>n</i>+<i>m</i> = 256). It opens the line, and the prose it names runs from it to the ⓪ⁿ that closes</span></div>
              <div class="glyph-row" data-marks="⓪²⁵⁶"><span class="g">⓪<sup>256</sup></span><span class="m">no previous block — the genesis chapter</span></div>
              <div class="glyph-row" data-marks="&lt;*"><span class="g">&lt;</span><span class="m">the <b>proof of work</b> — on β's line, binding the chapter hash above to the target after the sign</span></div>
              <div class="glyph-row"><span class="g">β<i>n</i></span><span class="m">the <b>difficulty target</b>, as in the preamble. The book's one glyph with a second office: under Scripts as terms β is a reduction, which is why it never appears in a script — a chapter's β is what buys a single settled form where two could stand, and a term's β is what makes one free where nothing is being settled at all</span></div>
              <div class="glyph-row" data-marks="re:256[⁰¹²³⁴⁵⁶⁷⁸⁹]"><span class="g"><i>m</i>×256<sup><i>e</i></sup></span><span class="m">the target written <b>exactly</b>, in the two parts nBits is made of: its <b>mantissa</b>, times the whole-byte <b>shift</b> it rides on. 256<sup><i>e</i></sup> is the target's scale, said in the unit the header keeps it in — a retarget moves it by whole bytes — and <i>m</i> is the twenty-odd bits a window's work is actually chosen from. The mantissa is written as short as it goes: factored, then each part taken as its power or its figure, whichever is fewer characters, and neighbours multiplied back together wherever that is shorter still. Most mantissas come out as the plain figure, which is the honest answer — at six digits a factorization was buying the reader nothing — and a power that earns its place survives (2²²·3). The whole factorization is in the hover, where genesis' 65535 = 2¹⁶−1 opens as the Fermat primes 3·5·17·257. Its leading zeros are β's demand. The early coinbase preamble carries the same pair</span></div>
              <div class="glyph-row" data-marks="η*"><span class="g">η<i>p</i>·<i>q</i>…</span><span class="m">the <b>nonce</b> the miner landed on, <b>factored</b> — and factored in full, unlike the target above it, which is shortened to whatever writes in fewest characters. The difference is the reading. A target is chosen: a small mantissa on a scale of whole bytes, and the figure says that as well as the primes do. A nonce is arrived at by counting, and its two or three arbitrary primes — one of them usually enormous — are the whole of what there is to say about it. Shortening that to a figure would take away the only thing it shows</span></div>
              <div class="glyph-row"><span class="g">■<i>n</i></span><span class="m">the <b>chapter mark</b> — a mined block cited by its place within its book (n counts chapters, never a raw height); in a margin, the same glyph counts chapters of relative delay. The one place n is a raw height is the coinbase's BIP34 mark, above, where the miner wrote the number himself</span></div>
              <div class="glyph-row"><span class="g">‡<i>ₙ</i></span><span class="m">a <b>cited work</b> — a document outside this text, dated by the output this mark rides: its OpenTimestamps proof reduces the document's digest to this chapter's merkle root. The subscript is the work's number in the Citations register at the back; a reader's own kept proof wears the bare ‡, an addendum outside the edition's numbering. The one mark that points out of the book</span></div>
              <div class="glyph-row"><span class="g">□<i>n</i></span><span class="m">the <b>expected chapter mark</b> — a not-yet-mined block cited by the place it will take: from the queue, where the number holds only while the queue does, or from a height consensus has already fixed (the contents' Appendix II), where the number is as firm as any citation and only its block is missing (a bare □ in a transaction's margin is the no-locktime mark)</span></div>
              <div class="glyph-row"><span class="g">—</span><span class="m"><b>unwritten</b> — a projected chapter's header slot, empty until a miner writes it</span></div>
              <div class="glyph-row"><span class="g">⋯</span><span class="m"><b>not yet knowable</b> — a value still resolving, or a projected chapter's predecessor, itself unwritten</span></div>
              <div class="glyph-row" data-marks="eta*"><span class="g">eta ≈ <i>t</i></span><span class="m">a projected chapter's <b>expected wait</b> — blocks land one per ten minutes on average, so an estimate k blocks out spreads about ±10·√k minutes</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Stack</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">⧉</span><span class="m"><b>duplicate</b> the top item</span></div>
              <div class="glyph-row"><span class="g">⌄</span><span class="m"><b>drop</b> the top item</span></div>
              <div class="glyph-row"><span class="g">⧉?</span><span class="m">duplicate <b>if nonzero</b></span></div>
              <div class="glyph-row"><span class="g">⇄</span><span class="m"><b>swap</b> the top two</span></div>
              <div class="glyph-row"><span class="g">↻</span><span class="m"><b>rotate</b> the top three</span></div>
              <div class="glyph-row"><span class="g">⇗</span><span class="m"><b>over</b> — copy the second to the top</span></div>
              <div class="glyph-row"><span class="g">⌦</span><span class="m"><b>nip</b> out the second</span></div>
              <div class="glyph-row"><span class="g">⇘</span><span class="m"><b>tuck</b> the top beneath the second</span></div>
              <div class="glyph-row"><span class="g">⇡</span><span class="m"><b>pick</b> — copy the nth item up</span></div>
              <div class="glyph-row"><span class="g">⥀</span><span class="m"><b>roll</b> — move the nth item up</span></div>
              <div class="glyph-row"><span class="g">↕</span><span class="m"><b>depth</b> of the stack</span></div>
              <div class="glyph-row"><span class="g">⇥ ⇤</span><span class="m"><b>shelve / retrieve</b> via the alt stack</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Arithmetic &amp; comparison</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">+ − × ÷ %</span><span class="m">arithmetic on numbers</span></div>
              <div class="glyph-row"><span class="g">+₁ −₁ ×₂ ÷₂</span><span class="m">by one · by two</span></div>
              <div class="glyph-row"><span class="g">∓</span><span class="m"><b>negate</b></span></div>
              <div class="glyph-row"><span class="g">|·|</span><span class="m"><b>absolute value</b></span></div>
              <div class="glyph-row"><span class="g">⊓ ⊔</span><span class="m"><b>min</b> · <b>max</b></span></div>
              <div class="glyph-row"><span class="g">∈</span><span class="m"><b>within</b> a range</span></div>
              <div class="glyph-row"><span class="g">&lt; &gt; ≤ ≥</span><span class="m">comparisons</span></div>
              <div class="glyph-row"><span class="g">≐ ≑</span><span class="m">numbers equal? · equal, <b>else fail</b></span></div>
              <div class="glyph-row"><span class="g">≠ ≠₀</span><span class="m">numbers differ · <b>nonzero?</b></span></div>
              <div class="glyph-row"><span class="g">¬ ∧ ∨</span><span class="m">not · and · or</span></div>
              <div class="glyph-row"><span class="g">« »</span><span class="m">shift left · right</span></div>
              <div class="glyph-row"><span class="g">= ≡</span><span class="m">bytes equal? · equal, <b>else fail</b></span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Bytes</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">⧺</span><span class="m"><b>concatenate</b></span></div>
              <div class="glyph-row"><span class="g">⊂</span><span class="m"><b>substring</b></span></div>
              <div class="glyph-row"><span class="g">↤ ↦</span><span class="m">keep the <b>left</b> · <b>right</b> part</span></div>
              <div class="glyph-row"><span class="g">∼ ∩ ∪ ⊻</span><span class="m">bitwise invert · and · or · xor</span></div>
              <div class="glyph-row"><span class="g">ℓ</span><span class="m"><b>length</b> of the top item</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Control</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">⟨ │ ⟩</span><span class="m">if … else … end</span></div>
              <div class="glyph-row"><span class="g">¬⟨</span><span class="m"><b>if not</b></span></div>
              <div class="glyph-row"><span class="g">( )</span><span class="m"><b>run</b> the revealed script (r w t) — the eval to ⟦ ⟧'s quote, under Scripts as terms</span></div>
              <div class="glyph-row"><span class="g">✓</span><span class="m">assert true</span></div>
              <div class="glyph-row"><span class="g">¶</span><span class="m"><b>data output</b> — provably unspendable</span></div>
              <div class="glyph-row"><span class="g">° °<i>n</i></span><span class="m"><b>no-op</b> · numbered no-ops</span></div>
              <div class="glyph-row"><span class="g">‖</span><span class="m"><b>section divider</b> for signature coverage</span></div>
              <div class="glyph-row"><span class="g">⊘ ⊘₁ ⊘₂</span><span class="m"><b>reserved</b> — invalid if executed</span></div>
              <div class="glyph-row"><span class="g">⊘ᵛ ⊘⟨ ⊘¬⟨</span><span class="m">reserved VER family</span></div>
              <div class="glyph-row"><span class="g">☒</span><span class="m"><b>invalid opcode</b></span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Data</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g"><b>p</b></span><span class="m"><b>public key</b></span></div>
              <div class="glyph-row"><span class="g"><b>s</b></span><span class="m"><b>signature</b></span></div>
              <div class="glyph-row"><span class="g"><b>h</b></span><span class="m"><b>hash</b></span></div>
              <div class="glyph-row"><span class="g"><b>r</b></span><span class="m"><b>redeem script</b> (inside P2SH)</span></div>
              <div class="glyph-row"><span class="g"><b>w</b></span><span class="m"><b>witness script</b> (inside P2WSH)</span></div>
              <div class="glyph-row"><span class="g"><b>t</b></span><span class="m"><b>tapscript</b> (a Taproot leaf)</span></div>
              <div class="glyph-row"><span class="g"><b>c</b></span><span class="m"><b>control block</b> (a Taproot script-path reveal) — leaf version <b>v</b><i>n</i>, parity subscript, then the internal key <b>p</b></span></div>
              <div class="glyph-row"><span class="g"><b>⋔</b></span><span class="m"><b>merkle proof</b> — the revealed leaf's path in the taptree</span></div>
              <div class="glyph-row"><span class="g"><b>a</b></span><span class="m"><b>annex</b> (reserved Taproot spend data)</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Margin — an input's sequence</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">●</span><span class="m"><b>final</b></span></div>
              <div class="glyph-row"><span class="g">○</span><span class="m">respects the locktime</span></div>
              <div class="glyph-row"><span class="g">†</span><span class="m"><b>replaceable</b> (opt-in RBF)</span></div>
              <div class="glyph-row"><span class="g">■<i>N</i></span><span class="m">relative: N blocks after confirmation (a count of chapters)</span></div>
              <div class="glyph-row"><span class="g">Τ<i>Δt</i></span><span class="m">relative: a duration after confirmation (d h m s)</span></div>
              <div class="glyph-row" data-marks="₿*"><span class="g">(<i>n</i> ₿)</span><span class="m">the <b>amount spent</b> by this input — value flowing in; an output's amount stands bare (<i>n</i> ₿, no parentheses)</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Margin — the transaction's locktime &amp; other marks</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">□</span><span class="m">no locktime</span></div>
              <div class="glyph-row"><span class="g"><i>v</i> β<i>b</i> ■<i>c</i></span><span class="m">not before the cited chapter (volume, β book, ■ chapter)</span></div>
              <div class="glyph-row"><span class="g">Τ<i>t</i></span><span class="m">not before a UTC date</span></div>
              <div class="glyph-row"><span class="g">∅</span><span class="m"><b>empty</b> — a coinbase's absent prevout, a segwit input's zero-byte script, an empty witness item</span></div>
              <div class="glyph-row"><span class="g">§<i>n</i></span><span class="m">section — the transaction's position</span></div>
              <div class="glyph-row"><span class="g">§<i>n</i> †</span><span class="m"><b>superseded</b> — a draft replaced by fee; the book keeps its page seated beneath the successor that took its §</span></div>
              <div class="glyph-row"><span class="g"><i>n</i></span><span class="m"><b>page</b> — the bare number at the running head's right edge: the transaction's running count in the whole chain since genesis (one page per transaction)</span></div>
            </div>
          </div>
        `;
