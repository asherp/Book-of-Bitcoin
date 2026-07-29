// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-turnsound.js — the sound of a page turning.
//
// A leaf of paper makes a broadband rustle, not a tone, so the sound is
// synthesized rather than sampled. That costs no binary asset, nothing to
// precache, and nothing to download — and, being generated per turn, it
// never repeats exactly, which a short sample always does audibly by the
// third page.
//
// The acoustics literature splits paper sound in two, and a turn needs both:
//
//   friction   the broadband rustle of the sheet sliding — noise swept
//              through a bandpass that opens bright and closes as the leaf
//              settles
//   crumpling  the buckling of the sheet, which is not noise at all but a
//              train of discrete clicks, each the release of elastic energy
//              as a facet snaps from one configuration to another
//
// Friction alone is a hiss. The clicks are what make it paper — and their
// statistics matter more than their placement: Houle & Sethna (Phys. Rev. E
// 54, 278) measured the ENERGY of these pulses to follow a power law,
// p(E) ∝ E^-α with α ≈ 1.3–1.6, over two to three decades. Drawing click
// amplitudes from that law gives the characteristic crackle — mostly small
// events with an occasional loud one — where drawing them uniformly gives
// static. Foley practice arrives at the same place from the other end: a
// page turn is recorded in layers, a glide and a flutter, with a cover thump
// under it for anything heavier than a single sheet.
//
// The book is bound at four levels, and each turns with its own weight:
//
//   section   a single sheet, high and quick
//   chapter   the page proper
//   book      a heavier gathering — a low body joins the rustle
//   volume    a tome, deepest and slowest to settle
//
// So a voice is a centre frequency, a duration, and (for the two deep levels)
// a sine thump under the noise: a level's pitch falls and its travel
// lengthens as the binding gets heavier, which is what makes a vertical swipe
// audibly an ascent rather than just another turn.
//
// Every voice moves through the same three moments, because a turn is a
// gesture and not an impact -- the sheet is caught, swept through the air,
// and set down. The friction swells to the middle of that travel rather than
// slamming open; the buckling clicks spread across it, leaning late; and the
// thump lands after the swell, not with the first contact. Skip the swell and
// the sound reads as a click or a hiss no matter how long you make it.
//
// Autoplay policy shapes the rest. An AudioContext built outside a user
// gesture starts suspended, but once resumed inside ANY gesture it stays
// running for the life of the page — so the chain's own turns (a block
// arriving under the tip's page, a projected chapter re-seating) can sound
// without a gesture of their own. The settings toggle is normally that
// unlocking gesture; a reader who enabled the sound in an earlier session
// gets the same from their first touch of anything (unlockOnce below). If the
// context is still suspended when a turn comes, the turn is simply silent —
// never queued, which would fire it later, against the wrong page.
//
// Nothing here is ever audible from a background tab: a book that speaks from
// a tab nobody is reading is a bad citizen.

const KEY = 'glossia-btc-turn-sound';

export const LEVELS = ['section', 'chapter', 'book', 'volume'];

// hz       the friction bandpass centre — the pitch of the rustle
// q        resonance; lower is broader, and paper is broad
// decay    how long the leaf takes to settle
// rate     noise playback rate, which shifts the grain's texture with the pitch
// clicks   how many buckling events the turn sheds — a heavier gathering
//          buckles in more places than a single sheet does
// clickHz  where those clicks sit; they ring above the friction they ride on
// body     a sine thump under it all (Hz), for the bound levels; 0 for none
const VOICES = {
  section: { hz: 2550, q: 0.85, attack: 0.010, decay: 0.240, gain: 0.150, rate: 1.35, clicks: 12, clickHz: 3100, body: 0 },
  chapter: { hz: 1450, q: 0.75, attack: 0.012, decay: 0.360, gain: 0.155, rate: 1.00, clicks: 18, clickHz: 2250, body: 0 },
  book:    { hz:  780, q: 0.65, attack: 0.015, decay: 0.540, gain: 0.140, rate: 0.80, clicks: 26, clickHz: 1600, body: 104 },
  volume:  { hz:  420, q: 0.55, attack: 0.018, decay: 0.820, gain: 0.145, rate: 0.62, clicks: 36, clickHz: 1050, body: 58 },
};

// Where the sweep peaks, as a fraction of the decay. A page turn is not a
// burst: the sheet is picked up, swept through the air -- loudest around the
// middle of its travel -- and then lands. An envelope that slams open and
// decays reads as a click or a hiss however long you make it; the swell is
// what makes it a turn.
const SWELL_AT = 0.45;

// The crumpling law: p(E) ∝ E^-α over CRUMPLE_RANGE decades of energy.
const CRUMPLE_ALPHA = 1.4;      // mid of the measured 1.3–1.6
const CRUMPLE_RANGE = 1000;     // three decades
const CLICK_SECONDS = 0.0025;   // one buckling event, about two and a half ms

// One click's amplitude, drawn from the measured energy law by inverting its
// CDF. Energy goes as amplitude squared, so the root comes last. Most draws
// land near the floor; the rare loud one is the crackle.
function clickAmplitude() {
  const k = 1 - CRUMPLE_ALPHA;
  const e = (1 + Math.random() * (CRUMPLE_RANGE ** k - 1)) ** (1 / k);
  return Math.sqrt(e / CRUMPLE_RANGE);
}

// A turn's whole train of buckling events, written into one buffer: the
// clicks cost a single source and a single filter between them rather than a
// node apiece. Each click is a couple of milliseconds of noise under a steep
// decay -- an impulse, near enough.
function crumpleBuffer(ac, v) {
  const len = Math.ceil(ac.sampleRate * v.decay);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  const clickLen = Math.ceil(ac.sampleRate * CLICK_SECONDS);
  for (let n = 0; n < v.clicks; n++) {
    // Spread across the whole turn, leaning late: the sheet buckles as it
    // sweeps and as it lands, not all at the instant it is picked up.
    const at = Math.floor(len * Math.random() ** 0.8);
    const amp = clickAmplitude();
    for (let i = 0; i < clickLen && at + i < len; i++) {
      d[at + i] += (Math.random() * 2 - 1) * amp * Math.exp(-i / (clickLen * 0.28));
    }
  }
  return buf;
}

// The index a page carries names its level: sections count up from 0, and the
// leaves run -1 chapter, -2 book, -3 volume (see minIndexOf in the book page).
export const levelOfIndex = (index) => (
  index >= 0 ? 'section' : index === -1 ? 'chapter' : index === -2 ? 'book' : 'volume'
);

let enabled = read();
let ctx = null;
let master = null;
let noiseBuf = null;

function read() {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

// The context is built only for a reader who asked for sound — an unused
// AudioContext still costs a device audio path (and, on some browsers, a
// visible indicator) for a book that would never make a noise.
function context() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try { ctx = new AC(); } catch { return null; }
  master = ctx.createGain();
  // The one volume knob. The voices are mixed to land a couple of dB apart
  // from each other; this sets where that group sits, at about -15 dBFS peak
  // -- present on a phone speaker without ever being the loudest thing in
  // the room.
  master.gain.value = 2.2;
  master.connect(ctx.destination);
  return ctx;
}

// Two seconds of white noise, generated once and read from a random offset
// per turn, so no two turns draw the same grain. Two rather than one: the
// longest voice runs most of a second, and a buffer barely longer than the
// sound leaves no room for the offset to vary.
function noise(ac) {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 2), ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

// Resume the context. Only ever effective inside a user gesture the first
// time; afterwards it also covers a context the browser suspended while the
// tab was hidden.
export function unlock() {
  const ac = context();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}

// A reader who enabled the sound in an earlier session arrives with the
// preference set but no gesture yet spent. Their first touch of anything
// unlocks it — which, at ten minutes a block, is nearly always well before
// the chain turns a page on its own.
const GESTURES = ['pointerdown', 'keydown', 'touchstart'];
function unlockOnce() {
  for (const ev of GESTURES) window.removeEventListener(ev, unlockOnce, true);
  unlock();
}
function armUnlock() {
  for (const ev of GESTURES) window.addEventListener(ev, unlockOnce, { capture: true, passive: true });
}
if (enabled) armUnlock();

document.addEventListener('visibilitychange', () => {
  if (enabled && document.visibilityState === 'visible') unlock();
});

export const soundEnabled = () => enabled;

// Turning the sound on is itself the unlocking gesture, so the context is
// built and resumed right here — and answers with a chapter's turn, so the
// reader hears what they just switched on.
export function setSoundEnabled(v) {
  enabled = !!v;
  try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch {}
  if (!enabled) return;
  armUnlock();
  unlock();
  playTurn('chapter');
}

// Sound one page turn at the level it lands on. Silent — never queued — when
// the reader hasn't asked for sound, when the tab isn't the one being read,
// or when the context hasn't been unlocked yet.
export function playTurn(level) {
  if (!enabled || document.visibilityState !== 'visible') return;
  const ac = context();
  if (!ac || ac.state !== 'running') return;
  const v = VOICES[level] || VOICES.chapter;
  const t0 = ac.currentTime;
  // A few percent of drift per turn: a real page is never twice the same.
  const wobble = 0.94 + Math.random() * 0.12;
  const tail = v.decay + 0.05;

  try {
    const src = ac.createBufferSource();
    src.buffer = noise(ac);
    src.playbackRate.value = v.rate * wobble;

    // Two bandpasses in series, not one. A single biquad falls off at only
    // 6 dB per octave, which over the three octaves up to Nyquist leaves
    // enough white noise through that every level measures alike and bright
    // -- the pitch that distinguishes a sheet from a tome gets buried in
    // hiss. Cascading doubles the slope and lets each voice sit where it was
    // tuned to.
    const band = ac.createBiquadFilter();
    const band2 = ac.createBiquadFilter();
    band.type = band2.type = 'bandpass';
    band.Q.value = band2.Q.value = v.q;
    // The sweep is what makes the burst read as a sheet rather than a hiss:
    // bright at the moment the leaf lifts, darkening as it comes to rest.
    for (const b of [band, band2]) {
      b.frequency.setValueAtTime(v.hz * 1.6 * wobble, t0);
      b.frequency.exponentialRampToValueAtTime(v.hz * 0.7 * wobble, t0 + v.decay);
    }

    const g = ac.createGain();
    // Ramped from near-silence rather than zero: an exponential ramp cannot
    // start at 0, and a stepped start would click. Three stages -- the sheet
    // is caught at once (so the sound still answers the gesture immediately),
    // swells as it sweeps, then falls away as it lands. The swell is linear:
    // an exponential rise from near-silence sounds like a tape running
    // backwards, where a linear one just gets louder.
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v.gain * 0.35, t0 + v.attack);
    g.gain.linearRampToValueAtTime(v.gain, t0 + v.decay * SWELL_AT);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + v.decay);

    src.connect(band).connect(band2).connect(g).connect(master);
    const room = Math.max(0, src.buffer.duration - tail);
    src.start(t0, Math.random() * room, tail);
    src.stop(t0 + tail);

    // The crumpling layer rides on top, through a band of its own: the clicks
    // carry their own envelopes, so this one wants no gain shape at all --
    // shaping it would flatten the very dynamics that make it read as paper.
    const crumple = ac.createBufferSource();
    crumple.buffer = crumpleBuffer(ac, v);
    const cband = ac.createBiquadFilter();
    cband.type = 'bandpass';
    cband.frequency.value = v.clickHz * wobble;
    cband.Q.value = 2.2;   // focused: an impulse is broadband, and a loose band leaves it hissy
    const cg = ac.createGain();
    cg.gain.value = v.gain * 3.0;
    crumple.connect(cband).connect(cg).connect(master);
    crumple.start(t0);
    crumple.stop(t0 + tail);

    // The bound levels get a body under the rustle — the boards of a book,
    // the heft of a tome — pitched down as it lands, the way a thump does.
    // It arrives AFTER the swell, not with the first contact: the gathering
    // comes down at the end of the sweep, which is what gives the turn its
    // weight rather than just its depth.
    if (v.body) {
      const lands = t0 + v.decay * 0.6;
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(v.body * 1.35, lands);
      osc.frequency.exponentialRampToValueAtTime(v.body * 0.8, t0 + v.decay);
      const bg = ac.createGain();
      bg.gain.setValueAtTime(0.0001, lands);
      bg.gain.exponentialRampToValueAtTime(v.gain * 0.4, lands + 0.015);
      bg.gain.exponentialRampToValueAtTime(0.0001, t0 + v.decay);
      osc.connect(bg).connect(master);
      osc.start(lands);
      osc.stop(t0 + tail);
    }
  } catch { /* a turn never fails on its sound */ }
}
