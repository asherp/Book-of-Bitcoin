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
                <span class="seq" data-row="p2sh"><span class="op">(r)</span></span>
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
                <span class="seq" data-row="p2wsh"><span class="op">(w)</span></span>
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
              <div class="glyph-row" data-marks="β* re:[0-9][⁰¹²³⁴⁵⁶⁷⁸⁹]{2,}"><span class="g">β<i>n</i> 2<sup><i>k</i></sup>·<i>p</i>…</span><span class="m">the <b>difficulty target</b> the miner restated in the coinbase, in the chapter head's own notation — a valid hash opens with n zero bits, and the target is exactly the product beside the mark. The preamble is the older custom: before BIP34 a coinbase opened with this pair instead of a height</span></div>
              <div class="glyph-row" data-marks="time:template"><span class="g"><i>date</i></span><span class="m">the <b>template timestamp</b> — the moment the pool assembled the block template, written straight behind the height by the pools built on btccom's server, and printed in the chapter head's own date form because it is the same kind of thing the header states: a miner's clock reading. No rule puts it there and nothing in the bytes declares it; it is read as a clock because it agrees with the height standing beside it, and as a number otherwise</span></div>
              <div class="glyph-row" data-marks="η*"><span class="g">η<i>p</i>·<i>q</i>…</span><span class="m"><b>extranonce</b> — search space beyond the header's η, the counter a miner rolls once the header's 32 bits are exhausted. Where a pool leaves the gap its miners fill, this is what lands in it: behind ■ from BIP34 on, behind β before it, behind the template's date where one was written. Factored like every other number the book states as a product, and written at full size: the value rode small beside the glyph while it was one figure, but a factorization lowered into a subscript is a product nobody could read. Read as the number it is, in the very notation the header's own nonce takes — which also keeps it out of the margin below, where a counter's bytes are entropy and better than a third of them pass for printable text by chance</span></div>
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
              <div class="glyph-row"><span class="g">β<i>n</i></span><span class="m">the <b>difficulty target</b>, as in the preamble</span></div>
              <div class="glyph-row" data-marks="re:[0-9][⁰¹²³⁴⁵⁶⁷⁸⁹]{2,}"><span class="g">2<sup><i>k</i></sup>·<i>p</i>…</span><span class="m">the target written <b>exactly</b>, as its <b>prime factorization</b> — a 256-bit ceiling said in the only terms that leave nothing out. The centred dot is multiplication; a raised digit is a prime repeated, and a prime appearing once carries no power at all. Every target takes the same shape: a vast power of two (nBits' whole-byte shift, and whatever twos its mantissa carries) times the small odd number left over. 2<sup><i>k</i></sup> is the target's scale, the little primes are all a retarget moved, and genesis' 65535 = 2¹⁶−1 opens as 3·5·17·257. Its leading zeros are β's demand. The early coinbase preamble carries the same pair</span></div>
              <div class="glyph-row" data-marks="η*"><span class="g">η<i>p</i>·<i>q</i>…</span><span class="m">the <b>nonce</b> the miner landed on, factored as the target on the line above it is — the same notation, since it is the same kind of thing: a number, written as what it is made of. The contrast is the reading. A target opens with a vast power of two and closes with the few small primes a retarget moved; a nonce is two or three arbitrary primes, one of them usually enormous, and that shapelessness is exactly what a nonce is — a place in the search, arrived at by counting, meaning nothing in itself</span></div>
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
              <div class="glyph-row"><span class="g">( )</span><span class="m"><b>run</b> the revealed script (r w t)</span></div>
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
