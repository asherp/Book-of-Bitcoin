// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-turnsound.js — the sound of a page turning.
//
// A leaf of paper makes a broadband rustle, not a tone, so the sound is
// synthesized rather than sampled: a burst of white noise swept through a
// bandpass that opens bright and closes as the leaf settles. That costs no
// binary asset, nothing to precache, and nothing to download — and, being
// generated per turn, it never repeats exactly, which a short sample always
// does audibly by the third page.
//
// The book is bound at four levels, and each turns with its own weight:
//
//   section   a single sheet, high and quick
//   chapter   the page proper
//   book      a heavier gathering — a low body joins the rustle
//   volume    a tome, deepest and slowest to settle
//
// So a voice is a centre frequency, a decay, and (for the two deep levels) a
// sine thump under the noise: a level's pitch falls and its tail lengthens as
// the binding gets heavier, which is what makes a vertical swipe audibly an
// ascent rather than just another turn.
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

// hz     the bandpass centre — the pitch of the rustle
// q      resonance; lower is broader, and paper is broad
// decay  how long the leaf takes to settle
// rate   noise playback rate, which shifts the grain's texture with the pitch
// body   a sine thump under the noise (Hz), for the bound levels; 0 for none
const VOICES = {
  section: { hz: 2550, q: 0.85, attack: 0.004, decay: 0.085, gain: 0.085, rate: 1.35, body: 0 },
  chapter: { hz: 1450, q: 0.75, attack: 0.006, decay: 0.135, gain: 0.095, rate: 1.00, body: 0 },
  book:    { hz:  780, q: 0.65, attack: 0.008, decay: 0.200, gain: 0.115, rate: 0.80, body: 104 },
  volume:  { hz:  420, q: 0.55, attack: 0.010, decay: 0.300, gain: 0.135, rate: 0.62, body: 58 },
};

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
  master.gain.value = 1;
  master.connect(ctx.destination);
  return ctx;
}

// One second of white noise, generated once and read from a random offset per
// turn, so no two turns draw the same grain.
function noise(ac) {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate), ac.sampleRate);
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

    const band = ac.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = v.q;
    // The sweep is what makes the burst read as a sheet rather than a hiss:
    // bright at the moment the leaf lifts, darkening as it comes to rest.
    band.frequency.setValueAtTime(v.hz * 1.6 * wobble, t0);
    band.frequency.exponentialRampToValueAtTime(v.hz * 0.7 * wobble, t0 + v.decay);

    const g = ac.createGain();
    // Ramped from near-silence rather than zero: an exponential ramp cannot
    // start at 0, and a stepped start would click.
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v.gain, t0 + v.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + v.decay);

    src.connect(band).connect(g).connect(master);
    const room = Math.max(0, src.buffer.duration - tail);
    src.start(t0, Math.random() * room, tail);
    src.stop(t0 + tail);

    // The bound levels get a body under the rustle — the boards of a book,
    // the heft of a tome — pitched down as it lands, the way a thump does.
    if (v.body) {
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(v.body * 1.35, t0);
      osc.frequency.exponentialRampToValueAtTime(v.body * 0.8, t0 + v.decay * 0.8);
      const bg = ac.createGain();
      bg.gain.setValueAtTime(0.0001, t0);
      bg.gain.exponentialRampToValueAtTime(v.gain * 0.7, t0 + 0.012);
      bg.gain.exponentialRampToValueAtTime(0.0001, t0 + v.decay * 0.9);
      osc.connect(bg).connect(master);
      osc.start(t0);
      osc.stop(t0 + tail);
    }
  } catch { /* a turn never fails on its sound */ }
}
