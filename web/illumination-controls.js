// SPDX-License-Identifier: MIT OR Apache-2.0
//
// Shared control-panel builder for btc-illumination.js's tunable `params` --
// used by illumination-lab.html's standalone bench and by the in-page widget
// bitcoin-book.html opens over the section it's currently reading (the
// lightbulb toggle; see illuminateSection there). Building the DOM once here
// is what keeps the two from drifting apart: a knob added to `params` gets a
// control in both places, or in neither.
//
// Binds directly to the module's own `params` and `GROWTH_STAGES` exports --
// the SAME objects the live page's illuminate() calls read from on every
// layout() pass -- so a change made through a control here is never copied
// anywhere. It just is the value already in force; the caller's onChange is
// only responsible for re-triggering a layout (resetDerivations() is called
// here already, wherever a grammar-affecting knob needs it).
//
// root      an empty element to fill (its previous content, if any, is
//           replaced).
// illum     the btc-illumination.js module namespace -- { params,
//           GROWTH_STAGES, resetDerivations }.
// opts.onChange()   called after every control mutates its target, including
//           after the reset button restores defaults.
// opts.onReset()     called (before onChange) when the reset button fires,
//           for a caller with its own extra state to fold back to a default
//           alongside params/GROWTH_STAGES (see illumination-lab.html's
//           sample base-size).
// opts.enabledDefault   initial state of the leading on/off switch (default
//           true).
// opts.onToggleEnabled(checked)   called when that switch changes. Not a
//           `params` field -- it's the caller's own illuminate() call that
//           decides what "off" means (its `enabled` opt; see
//           btc-illumination.js), so this is the one control here with no
//           default wiring of its own.
// opts.preview      turns on the single-mark stage at the top of the panel:
//           one of the page's own sigla, illuminated ALONE, with ‹ › to
//           step through the rest. The point is isolation -- a mark in the
//           page is hemmed in by the lines around it, and what a setting
//           does to the vine itself is hard to read through all that. The
//           stage carries no prose, so the only obstacle is the mark's own
//           box and the growth is the grammar's, plainly.
//             .seeds()        -> the page's current seed elements. Called
//                                afresh every render, so a caller whose
//                                page has moved on doesn't have to say so.
//             .optionsFor(el) -> the illuminate() options that mark would
//                                be grown with (blockHash, confirmations,
//                                sizeOf, pointOf...). Optional.
//
// Returns { refreshPreview() } so a caller can re-stage after its page
// changes underneath the panel (see bitcoin-book.html's illuminateSection).
export function buildIlluminationControls(root, illum, opts = {}) {
  const { params, GROWTH_STAGES, resetDerivations } = illum;
  const onChange = opts.onChange || (() => {});
  const onReset = opts.onReset || (() => {});
  const onToggleEnabled = opts.onToggleEnabled || (() => {});
  const enabledDefault = opts.enabledDefault !== false;
  const preview = opts.preview || null;
  const DEFAULTS = structuredClone(params);
  const DEFAULT_STAGES = structuredClone(GROWTH_STAGES);

  const RANGES = {
    branchinessPerGen: [0.02, 0.5, 0.01], branchinessCap: [0.1, 1, 0.05],
    branchinessForkThreshold: [0, 1, 0.05], maxSizeBoost: [0, 12, 1],
    step: [2, 20, 0.5], turnDeg: [2, 90, 1], jitterDeg: [0, 45, 1],
    maxDeflectTries: [1, 16, 1], leafDedupPx: [0, 12, 0.5], obstaclePad: [0, 12, 0.5],
    overflow: [0, 120, 2], boundsInset: [0, 40, 1],
    maxReachFloor: [10, 300, 5], maxReachMul: [0.5, 5, 0.1], referenceFontSize: [8, 32, 1],
    glyphFollowMax: [0, 80, 1], glyphClearanceMul: [0.2, 3, 0.1], glyphDepartDeg: [0, 120, 2],
    departForkSteps: [0, 12, 1],
  };
  const LABELS = {
    branchinessPerGen: 'Branchiness / generation', branchinessCap: 'Branchiness cap',
    branchinessForkThreshold: 'Fork threshold', maxSizeBoost: 'Max size boost (gens)',
    step: 'Step (px)', turnDeg: 'Turn (deg)', jitterDeg: 'Jitter (deg)',
    maxDeflectTries: 'Max deflect tries', leafDedupPx: 'Leaf dedup radius (px)',
    obstaclePad: 'Clearance around a term (px)',
    overflow: 'Overflow past box (px)', boundsInset: 'Inset from page edge (px)',
    maxReachFloor: 'Leash floor (px)',
    maxReachMul: 'Leash × sigil size', referenceFontSize: 'Reference font size (px)',
    glyphFollowMax: 'Ride the sigil (steps)', glyphClearanceMul: 'Self-cross clearance (×step)', glyphDepartDeg: 'Depart angle (deg)',
    departForkSteps: 'Fork at departure (steps)',
  };
  const GRAMMAR_KEYS = ['branchinessPerGen', 'branchinessCap', 'branchinessForkThreshold', 'maxSizeBoost'];
  const TURTLE_KEYS = ['step', 'turnDeg', 'jitterDeg', 'maxDeflectTries', 'leafDedupPx', 'obstaclePad',
  'overflow', 'boundsInset', 'maxReachFloor', 'maxReachMul', 'referenceFontSize',
  'glyphFollowMax', 'glyphClearanceMul', 'glyphDepartDeg', 'departForkSteps'];

  root.innerHTML = `
    ${preview ? `
    <div class="illum-ctl-group illum-ctl-preview">
      <div class="illum-ctl-preview-nav">
        <button type="button" class="illum-ctl-step illum-ctl-prev" aria-label="Previous mark">&lsaquo;</button>
        <span class="illum-ctl-preview-label"></span>
        <button type="button" class="illum-ctl-step illum-ctl-next" aria-label="Next mark">&rsaquo;</button>
      </div>
      <div class="illum-ctl-preview-stage"></div>
    </div>` : ''}
    <div class="illum-ctl-group">
      <label class="illum-ctl-row"><span class="name">Illumination</span><input type="checkbox" class="illum-ctl-enabled"></label>
    </div>
    <div class="illum-ctl-group">
      <h2>Growth stages (generations)</h2>
      <div class="illum-ctl-stages"></div>
    </div>
    <div class="illum-ctl-group">
      <h2>Grammar</h2>
      ${GRAMMAR_KEYS.map((k) => `
        <label class="illum-ctl-row"><span class="name">${LABELS[k]}</span><span class="val" data-out="${k}"></span></label>
        <input type="range" data-key="${k}" min="${RANGES[k][0]}" max="${RANGES[k][1]}" step="${RANGES[k][2]}">
      `).join('')}
      <div class="illum-ctl-prods"></div>
    </div>
    <div class="illum-ctl-group">
      <h2>Turtle</h2>
      ${TURTLE_KEYS.map((k) => `
        <label class="illum-ctl-row"><span class="name">${LABELS[k]}</span><span class="val" data-out="${k}"></span></label>
        <input type="range" data-key="${k}" min="${RANGES[k][0]}" max="${RANGES[k][1]}" step="${RANGES[k][2]}">
      `).join('')}
    </div>
    <button type="button" class="illum-ctl-reset">Reset all to defaults</button>
  `;

  // ─── the single-mark stage ────────────────────────────────────────────
  // A CLONE of the chosen mark, not the mark itself: the real one has to
  // stay where it is on the page, still growing its own vine. The clone is
  // stripped of ids (two elements answering to one id otherwise) and given
  // the original's own computed type, so it renders as the same letter at
  // the same size even though it now sits inside the panel's own styling
  // rather than the passage's.
  let previewIdx = 0, previewHandle = null;
  function renderPreview() {
    if (!preview) return;
    const stage = root.querySelector('.illum-ctl-preview-stage');
    const label = root.querySelector('.illum-ctl-preview-label');
    const seeds = (preview.seeds && preview.seeds()) || [];
    if (previewHandle) { previewHandle.destroy(); previewHandle = null; }
    stage.textContent = '';
    if (!seeds.length) { label.textContent = 'no marks on this page'; return; }
    previewIdx = ((previewIdx % seeds.length) + seeds.length) % seeds.length;
    const src = seeds[previewIdx];

    const clone = src.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    const cs = getComputedStyle(src);
    for (const prop of ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'color']) {
      clone.style[prop] = cs[prop];
    }
    // A whole paragraph is a seed too (the drop cap is styled off its
    // opening letter, so the mark IS its paragraph). Staging all of that
    // would put the page's text back on a stage whose whole purpose is
    // being rid of it -- so the clone keeps only enough to carry the mark.
    const text = clone.textContent || '';
    if (text.length > 14) clone.textContent = text.slice(0, 14);

    const host = document.createElement('div');
    host.className = 'illum-ctl-preview-host';
    host.append(clone);
    stage.append(host);

    const kind = (src.className || '').split(/\s+/).filter(Boolean)[0] || src.tagName.toLowerCase();
    label.textContent = `${previewIdx + 1}/${seeds.length} · ${kind}`;
    label.title = (src.textContent || '').trim().slice(0, 60);

    try {
      previewHandle = illum.illuminate(host, {
        seedEls: [clone],
        ...(preview.optionsFor ? preview.optionsFor(src) : {}),
      });
    } catch (e) { console.error('illumination preview failed:', e); }
  }
  if (preview) {
    root.querySelector('.illum-ctl-prev').addEventListener('click', () => { previewIdx -= 1; renderPreview(); });
    root.querySelector('.illum-ctl-next').addEventListener('click', () => { previewIdx += 1; renderPreview(); });
  }
  // Every control's change re-stages the preview as well as re-running the
  // caller's own render, so the isolated mark and the page agree.
  const fire = () => { renderPreview(); onChange(); };

  const enabledInput = root.querySelector('.illum-ctl-enabled');
  enabledInput.checked = enabledDefault;
  enabledInput.addEventListener('change', () => onToggleEnabled(enabledInput.checked));

  const stagesEl = root.querySelector('.illum-ctl-stages');
  GROWTH_STAGES.forEach((s, i) => {
    const r = document.createElement('div');
    r.className = 'illum-ctl-stage-row';
    const rangeLabel = s.max === Infinity ? `${s.min.toLocaleString()}+` : `${s.min.toLocaleString()}–${s.max.toLocaleString()}`;
    r.innerHTML = `<span>${s.name}<br><span class="range">${rangeLabel} conf</span></span>`;
    const input = document.createElement('input');
    input.type = 'number'; input.min = '0'; input.max = '20'; input.value = String(s.iterations);
    input.addEventListener('input', () => {
      GROWTH_STAGES[i].iterations = Math.max(0, parseInt(input.value, 10) || 0);
      resetDerivations();
      fire();
    });
    r.append(input);
    stagesEl.append(r);
  });

  const prodEl = root.querySelector('.illum-ctl-prods');
  params.productions.forEach((p, i) => {
    const rowEl = document.createElement('label');
    rowEl.className = 'illum-ctl-row';
    rowEl.innerHTML = `<span class="name illum-ctl-mono">${p.to}${p.reserved ? ' *' : ''}</span><span class="val"></span>`;
    const valEl = rowEl.querySelector('.val');
    valEl.textContent = String(p.weight);
    const input = document.createElement('input');
    input.type = 'range'; input.min = '0'; input.max = '8'; input.step = '1'; input.value = String(p.weight);
    input.addEventListener('input', () => {
      params.productions[i].weight = parseFloat(input.value);
      valEl.textContent = input.value;
      resetDerivations();
      fire();
    });
    rowEl.insertBefore(input, valEl);
    prodEl.append(rowEl);
  });
  const note = document.createElement('div');
  note.className = 'illum-ctl-sub';
  note.textContent = '* reserved: only picked once branchiness clears the fork threshold above.';
  prodEl.append(note);

  function bindParam(key, grammar) {
    const input = root.querySelector(`input[data-key="${key}"]`);
    const out = root.querySelector(`[data-out="${key}"]`);
    input.value = String(params[key]);
    out.textContent = String(params[key]);
    input.addEventListener('input', () => {
      params[key] = parseFloat(input.value);
      out.textContent = input.value;
      if (grammar) resetDerivations();
      fire();
    });
  }
  GRAMMAR_KEYS.forEach((k) => bindParam(k, true));
  TURTLE_KEYS.forEach((k) => bindParam(k, false));

  root.querySelector('.illum-ctl-reset').addEventListener('click', () => {
    Object.assign(params, structuredClone(DEFAULTS));
    DEFAULT_STAGES.forEach((s, i) => { GROWTH_STAGES[i].iterations = s.iterations; });
    resetDerivations();

    GRAMMAR_KEYS.concat(TURTLE_KEYS).forEach((k) => {
      root.querySelector(`input[data-key="${k}"]`).value = String(params[k]);
      root.querySelector(`[data-out="${k}"]`).textContent = String(params[k]);
    });
    root.querySelectorAll('.illum-ctl-prods input[type="range"]').forEach((el, i) => {
      el.value = String(params.productions[i].weight);
      el.parentElement.querySelector('.val').textContent = String(params.productions[i].weight);
    });
    root.querySelectorAll('.illum-ctl-stages input').forEach((input, i) => { input.value = String(GROWTH_STAGES[i].iterations); });

    onReset();
    fire();
  });

  renderPreview();
  return { refreshPreview: renderPreview };
}
