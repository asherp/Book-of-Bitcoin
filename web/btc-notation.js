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
              <span class="pname">P2PK</span>
                <span class="seq"><span class="ph">p</span><span class="op op-push">⁶⁵</span> <span class="op">∇</span></span>
                <span class="seq exec"><span class="ph">s</span> <span class="ph chain">p</span> <span class="op">∇</span></span>
                <span class="seq"><span class="ph">s</span></span>
                <span class="seq none">—</span>
              <span class="pname">P2PKH</span>
                <span class="seq"><span class="op">⧉</span> <span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">≡</span> <span class="op">∇</span></span>
                <span class="seq exec"><span class="ph">s</span> <span class="ph">p</span> <span class="op">⧉</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">≡</span> <span class="op">∇</span></span>
                <span class="seq"><span class="ph">s</span> <span class="ph">p</span></span>
                <span class="seq none">—</span>
              <span class="pname">Multisig</span>
                <span class="seq"><span class="op">②</span> <span class="ph">p<sub>1</sub></span><span class="op op-push">³³</span> <span class="ph">p<sub>2</sub></span><span class="op op-push">³³</span> <span class="ph">p<sub>3</sub></span><span class="op op-push">³³</span> <span class="op">③</span> <span class="op">◇</span></span>
                <span class="seq exec"><span class="op">⓪</span> <span class="ph">s<sub>1</sub></span> <span class="ph">s<sub>2</sub></span> <span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">s<sub>1</sub></span> <span class="ph">s<sub>2</sub></span></span>
                <span class="seq none">—</span>
              <span class="pname">P2SH</span>
                <span class="seq"><span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">=</span></span>
                <span class="seq exec"><span class="ph">r</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(r)</span></span>
                <span class="seq"><span class="op">(r)</span></span>
                <span class="seq none">—</span>
              <span class="pname">P2SH · 2-of-3</span>
                <span class="seq"><span class="op">⌖</span> <span class="ph">h</span><span class="op op-push">²⁰</span> <span class="op">=</span></span>
                <span class="seq exec"><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span><span class="op">)</span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">s<sub>1</sub></span> <span class="ph">s<sub>2</sub></span> <span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="ph">p<sub>3</sub></span> <span class="op">③</span> <span class="op">◇</span></span>
                <span class="seq none">—</span>
              <span class="pname">P2WPKH</span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h</span><span class="op op-push">²⁰</span></span>
                <span class="seq exec"><span class="ph">s</span> <span class="ph">p</span> <span class="op">⧉</span> <span class="op">⌖</span> <span class="ph chain">h</span> <span class="op">≡</span> <span class="op">∇</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s</span> <span class="ph">p</span></span>
              <span class="pname">P2WSH</span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h</span><span class="op op-push">³²</span></span>
                <span class="seq exec"><span class="ph">w</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(w)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="op">(w)</span></span>
              <span class="pname">P2TR key</span>
                <span class="seq"><span class="op">①</span> <span class="ph">p</span><span class="op op-push">³²</span></span>
                <span class="seq exec"><span class="ph">s</span> <span class="op">∇</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s</span></span>
              <span class="pname">P2TR script</span>
                <span class="seq"><span class="op">①</span> <span class="ph">p</span><span class="op op-push">³²</span></span>
                <span class="seq exec"><span class="ph">t</span> <span class="op">⋔</span> <span class="ph chain">p</span> <span class="op">=</span> <span class="op">(t)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s</span> <span class="ph">t</span> <span class="ph">c</span></span>
              <span class="pname">Data</span>
                <span class="seq"><span class="op">¶</span> <span class="op op-push">ⁿ</span></span>
                <span class="seq none">—</span>
                <span class="seq none">—</span>
                <span class="seq none">—</span>
            </div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Lightning — commitment &amp; channel scripts</h4>
            <div class="pattern-scroll">
            <div class="pattern-table two-party">
              <span class="phead"></span><span class="phead">Party 1</span><span class="phead">Party 2</span><span class="phead">UTXO</span><span class="phead">Validator</span><span class="phead">STXO</span><span class="phead">Witness</span>
              <span class="pname">Channel open · 2-of-2</span>
                <span class="seq calc"><span class="ph">p<sub>1</sub></span> <span class="op">=</span> <span class="ph">k<sub>1</sub></span><span class="op">G</span> · <span class="ph">p<sup>0</sup></span> <span class="op">=</span> <span class="ph">k<sup>0</sup></span><span class="op">G</span> · <span class="ph">s<sub>1</sub><sup>f</sup></span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq calc"><span class="ph">p<sub>2</sub></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span><span class="op">G</span> · <span class="ph">s<sub>2</sub><sup>f</sup></span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h</span></span>
                <span class="seq exec"><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="op">②</span> <span class="op">◇</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="op">②</span> <span class="ph">p<sub>1</sub></span> <span class="ph">p<sub>2</sub></span> <span class="op">②</span> <span class="op">◇</span><span class="op">)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">s<sub>1</sub><sup>f</sup></span> <span class="ph">s<sub>2</sub><sup>f</sup></span> · <span class="op">⓪</span> <span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> <span class="ph">s<sub>2</sub><sup><i>i</i></sup></span></span>
              <span class="pname">Channel update</span>
                <span class="seq calc"><span class="ph">p<sup><i>i</i>+1</sup></span> <span class="op">=</span> <span class="ph">k<sup><i>i</i>+1</sup></span><span class="op">G</span> · <span class="ph">k<sup><i>i</i></sup></span></span>
                <span class="seq calc"><span class="ph">k<sub>r</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span><span class="op">Σ(</span><span class="ph">p<sub>2</sub></span><span class="op">⧺</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">)</span> <span class="op">+</span> <span class="ph">k<sup><i>i</i></sup></span><span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span> · <span class="ph">s<sub>r</sub><sup><i>i</i></sup></span></span>
                <span class="seq none">—</span>
                <span class="seq none">—</span>
                <span class="seq none">—</span>
                <span class="seq none">—</span>
              <span class="pname">Force close · to_local</span>
                <span class="seq calc"><span class="ph">p<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">k<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span> · <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub><sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> · <span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq calc"><span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>2</sub></span><span class="op">Σ(</span><span class="ph">p<sub>2</sub></span><span class="op">⧺</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">)</span> <span class="op">+</span> <span class="ph">p<sup><i>i</i></sup></span><span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq exec"><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">■</span> <span class="op">Δ</span> <span class="op">⌄</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">∇</span> <span class="op">Σ</span> <span class="ph chain">h<sup><i>i</i></sup></span> <span class="op">=</span> <span class="op">(</span><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">■</span> <span class="op">Δ</span> <span class="op">⌄</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">∇</span><span class="op">)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> <span class="op">⓪</span> · <span class="ph">s<sub>r</sub><sup><i>i</i></sup></span> <span class="op">①</span></span>
              <span class="pname">Force close · to_remote</span>
                <span class="seq calc"><span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq calc"><span class="ph">p<sub>2</sub></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span><span class="op">G</span> · <span class="ph">s<sub>2</sub></span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h</span></span>
                <span class="seq exec"><span class="ph">p<sub>2</sub></span> <span class="op">▼</span> <span class="op">①</span> <span class="op">Δ</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="ph">p<sub>2</sub></span> <span class="op">▼</span> <span class="op">①</span> <span class="op">Δ</span><span class="op">)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s<sub>2</sub></span></span>
              <span class="pname">Force close · anchor</span>
                <span class="seq calc"><span class="ph">p</span> <span class="op">=</span> <span class="ph">k</span><span class="op">G</span> · <span class="ph">s</span> · <span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span></span>
                <span class="seq calc"><span class="op">Σ</span> <span class="ph">w</span> <span class="op">=</span> <span class="ph">h</span> · <span class="op">∅</span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h</span></span>
                <span class="seq exec"><span class="ph">p</span> <span class="op">∇</span> <span class="op">⧉?</span> <span class="op">¬⟨</span> <span class="op">⑯</span> <span class="op">Δ</span> <span class="op">⟩</span> <span class="op">Σ</span> <span class="ph chain">h</span> <span class="op">=</span> <span class="op">(</span><span class="ph">p</span> <span class="op">∇</span> <span class="op">⧉?</span> <span class="op">¬⟨</span> <span class="op">⑯</span> <span class="op">Δ</span> <span class="op">⟩</span><span class="op">)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s</span> · <span class="op">∅</span></span>
              <span class="pname">Force close · HTLC</span>
                <span class="seq calc"><span class="ph">k<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span> · <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>1</sub><sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>2</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> · <span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq calc"><span class="ph">k<sub>2</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>2</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>2</sub></span><span class="op">)</span> · <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">k<sub>2</sub><sup><i>i</i></sup></span><span class="op">G</span> · <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">p<sub>1</sub></span> <span class="op">+</span> <span class="op">Σ(</span><span class="ph">p<sup><i>i</i></sup></span><span class="op">⧺</span><span class="ph">p<sub>1</sub></span><span class="op">)</span><span class="op">G</span> · <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> · <span class="ph">s<sub>2</sub><sup><i>i</i></sup></span> · <span class="op">Σ</span> <span class="ph">w<sup><i>i</i></sup></span> <span class="op">=</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq"><span class="op">⓪</span> <span class="ph">h<sup><i>i</i></sup></span></span>
                <span class="seq exec"><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">⟨</span> <span class="op">Σ</span> <span class="ph">h</span> <span class="op">≡</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">τ</span> <span class="op">⌄</span> <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">⟩</span> <span class="op">∇</span> <span class="op">Σ</span> <span class="ph chain">h<sup><i>i</i></sup></span> <span class="op">=</span> <span class="op">(</span><span class="op">⟨</span> <span class="ph">p<sub>r</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">⟨</span> <span class="op">Σ</span> <span class="ph">h</span> <span class="op">≡</span> <span class="ph">p<sub>1</sub><sup><i>i</i></sup></span> <span class="op">│</span> <span class="op">τ</span> <span class="op">⌄</span> <span class="ph">p<sub>2</sub><sup><i>i</i></sup></span> <span class="op">⟩</span> <span class="op">⟩</span> <span class="op">∇</span><span class="op">)</span></span>
                <span class="seq none">∅</span>
                <span class="seq"><span class="ph">s<sub>1</sub><sup><i>i</i></sup></span> <span class="ph">h</span> <span class="op">①</span> <span class="op">⓪</span> · <span class="ph">s<sub>2</sub><sup><i>i</i></sup></span> <span class="op">⓪</span> <span class="op">⓪</span> · <span class="ph">s<sub>r</sub><sup><i>i</i></sup></span> <span class="op">①</span></span>
            </div>
            </div>
            <p class="notation-note">The first two columns are off chain: what each party computes for itself — party 1 is the side whose force close this is. Secrets stay in their own column until an update surrenders k<sup><i>i</i></sup> across; everything else a party writes without deriving came from the other column's public points.</p>
          </div>

          <div class="notation-group">
            <h4>Secrets &amp; the generator</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g"><b>k</b></span><span class="m"><b>private key</b> — the secret scalar behind a public key; never on chain</span></div>
              <div class="glyph-row"><span class="g">G</span><span class="m">the <b>generator</b> — the fixed curve point every key descends from: <b>p</b> = <b>k</b>G</span></div>
              <div class="glyph-row"><span class="g"><b>p</b><sup>0</sup> <b>p</b><sup><i>i</i></sup> <b>p</b><sup>f</sup></span><span class="m"><b>channel state</b> — a superscript scopes a datum to a state of the channel: 0 the initial commitment sealed at funding, <i>i</i> any intermediate update, f the final, closing state. Each state the closing party draws a fresh secret k<sup><i>i</i></sup> and shares only its point p<sup><i>i</i></sup> = k<sup><i>i</i></sup>G; scripts and hashes rebuild per state. Advancing to <i>i</i>+1 revokes state <i>i</i>: k<sup><i>i</i></sup> crosses to the other side — and nothing else</span></div>
              <div class="glyph-row"><span class="g"><b>p</b><sub>1</sub><sup><i>i</i></sup> <b>p</b><sub>2</sub><sup><i>i</i></sup> <b>p</b><sub>r</sub><sup><i>i</i></sup></span><span class="m"><b>state-scoped keys</b> — party below, state above: each side's base key folded with p<sup><i>i</i></sup>, and the revocation key; the party columns derive them in full, each side by its own route</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Pushes</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">²⁰</span><span class="m"><b>push</b> — the bare superscript is the byte count (²⁰ pushes twenty)</span></div>
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
              <div class="glyph-row"><span class="g">①–⑯</span><span class="m">push a small number (1–16)</span></div>
              <div class="glyph-row"><span class="g">⊖</span><span class="m">push minus one</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Coinbase — the mining preamble</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">β<i>n</i></span><span class="m">the <b>difficulty target</b> — a valid hash opens with n zero bits</span></div>
              <div class="glyph-row"><span class="g">η<sub><i>n</i></sub></span><span class="m"><b>extranonce</b> — search space beyond the header's η</span></div>
            </div>
          </div>

          <div class="notation-group">
            <h4>Chapter head — the block header</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">v<i>n</i></span><span class="m">block <b>version</b></span></div>
              <div class="glyph-row"><span class="g">⓪<sup><i>n</i></sup></span><span class="m">a block hash's <i>n</i> leading <b>proof-of-work zero bits</b></span></div>
              <div class="glyph-row"><span class="g">⌘<sup><i>m</i></sup></span><span class="m">the hash's remaining <i>m</i> <b>bits</b>, Glossia-encoded — ⌘'s superscript counts bits (<i>n</i>+<i>m</i> = 256)</span></div>
              <div class="glyph-row"><span class="g">⓪<sup>256</sup></span><span class="m">no previous block — the genesis chapter</span></div>
              <div class="glyph-row"><span class="g">&lt;</span><span class="m">the <b>proof of work</b> — on β's line, binding the chapter hash above to the target after the sign</span></div>
              <div class="glyph-row"><span class="g">β<i>n</i></span><span class="m">the <b>difficulty target</b>, as in the preamble</span></div>
              <div class="glyph-row"><span class="g"><i>m</i>×256<sup><i>e</i></sup></span><span class="m">the target written <b>exactly</b> — nBits' mantissa shifted up <i>e</i> whole zero bytes; its leading zeros are β's demand</span></div>
              <div class="glyph-row"><span class="g">η<sub><i>n</i></sub></span><span class="m">the <b>nonce</b> the miner landed on</span></div>
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
            <p class="notation-note">A push of known length carries its byte count as a superscript on the mark — <b>h</b>²⁰, <b>p</b>⁶⁵; a bare, untyped push keeps its count leading (²⁰). One mark is the exception: ⌘'s superscript counts <i>bits</i> — the chapter head's block hashes read ⓪ⁿ ⌘ᵐ, the proof-of-work zeros in the mining trade's own unit. <b>Bold</b> where the datum is on chain — a lock, or what a spend writes; <b>plain</b> where a spend introduces it at validation.</p>
          </div>

          <div class="notation-group">
            <h4>Margin — an input's sequence</h4>
            <div class="glyph-grid">
              <div class="glyph-row"><span class="g">●</span><span class="m"><b>final</b></span></div>
              <div class="glyph-row"><span class="g">○</span><span class="m">respects the locktime</span></div>
              <div class="glyph-row"><span class="g">†</span><span class="m"><b>replaceable</b> (opt-in RBF)</span></div>
              <div class="glyph-row"><span class="g">■<i>N</i></span><span class="m">relative: N blocks after confirmation (a count of chapters)</span></div>
              <div class="glyph-row"><span class="g">Τ<i>Δt</i></span><span class="m">relative: a duration after confirmation (d h m s)</span></div>
              <div class="glyph-row"><span class="g">(<i>n</i> ₿)</span><span class="m">the <b>amount spent</b> by this input — value flowing in; an output's amount stands bare (<i>n</i> ₿, no parentheses)</span></div>
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
              <div class="glyph-row"><span class="g"><i>n</i></span><span class="m"><b>page</b> — the bare number at the running head's right edge: the transaction's running count in the whole chain since genesis (one page per transaction)</span></div>
            </div>
          </div>
        `;
