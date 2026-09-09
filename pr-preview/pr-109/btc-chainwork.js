// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-chainwork.js — how much hashing stands behind a chapter, counted rather
// than quoted.
//
// Chainwork is the number Bitcoin actually decides with. When two chains
// disagree, a node does not take the longer one; it takes the one with the
// greater nChainWork, and it takes it only if every block on the way is valid
// (Chainstate::FindMostWorkChain, and CBlockIndexWorkComparator beneath it).
// So this is the quantity the book means whenever it says a block is settled.
//
// No API publishes it. Every free explorer serves difficulty and stops there,
// Esplora included (#79; Blockstream/esplora#651 asks for the field). Which
// turns out not to matter, because chainwork is a function of the header chain
// and of nothing else, and the book would rather derive it anyway: a sum a
// reader can follow says what the security of a chapter consists of, where a
// hex blob from someone's server only asks to be believed.
//
// The derivation, in three steps.
//
// nBits packs a target into four bytes -- one exponent, three of mantissa:
//
//     target = mantissa x 256^(exponent - 3)
//
// A hash is uniform over 2^256, so a block's chance per attempt is
// (target+1)/2^256 and the attempts it should take is the reciprocal:
//
//     work = 2^256 / (target + 1)
//
// which is Bitcoin Core's GetBitsProof, computed there as
// (~target / (target+1)) + 1 to keep the numerator inside 256 bits.
//
// And chainwork is that, summed over every block. nBits cannot change inside a
// retarget epoch -- consensus recomputes it only every 2016 blocks -- so the
// sum collapses to one multiplication per epoch, and the work behind the tip
// is 477 terms rather than 961,000. The epochs are vendored beside this file.
//
// Three things this file is careful about, each a way of being plausibly
// wrong:
//
// Difficulty is not work. They differ by the fixed factor 2^256/T1 =
// 4,295,032,833 -- not 2^32, which is the shortcut everyone reaches for and is
// low by 1.5e-5. Genesis fixes the constant exactly: target T1, difficulty 1,
// chainwork 0x100010001.
//
// The sum runs over blocks, never over time. Integrating difficulty against dt
// and dividing by the ten minutes a retarget aims for gets 1.42% less work
// than the chain has done, because the chain has not kept to ten minutes:
// genesis to 900000 took 518,181,994 seconds where the schedule says
// 540,000,000. Difficulty tracks hashrate with a 2016-block lag and the lag is
// where the missing work lives. (Put the other way: rate = H*p and work = 1/p,
// so dW/dt = H exactly -- chainwork is hashrate integrated over time, and the
// difficulty cancels. That is why it is the right thing to compare chains by,
// and why a shorter chain of harder blocks beats a longer chain of easy ones.)
//
// And what is counted is expected work, not work performed. 2^256/(target+1)
// is the mean of a geometric distribution; a block realises whatever it
// realises. Genesis's own hash sits 2536x below the target it had to clear.
// The number is an accounting convention -- verifiable from 80-byte headers,
// which is what consensus needs -- and not a measurement of anyone's
// electricity.
//
// Mainnet only, structurally: the epoch table is mainnet's, and testnet's
// twenty-minute rule lets nBits vary inside an epoch, so the collapse this
// file rests on does not hold there.

import { EPOCH_BITS } from './btc-chainwork-epochs.js';
import { toSuperscript } from './btc-sigla.js';

export { EPOCH_BITS };

export const RETARGET_INTERVAL = 2016;

// The target difficulty 1 names: 0xffff x 2^208, the bar genesis cleared.
export const DIFFICULTY_1_TARGET = 0xffffn * (1n << 208n);

// Difficulty -> work, exactly. Genesis is the calibration: difficulty 1 is
// 4,295,032,833 hashes, which is 2^32 plus 65,537 and not 2^32.
export const WORK_PER_DIFFICULTY = (1n << 256n) / DIFFICULTY_1_TARGET;

// The last height the vendored epochs can speak for. Past this the answer is
// null rather than a guess -- a chapter beyond the table is a chapter this
// file has no record of, and saying so is the only honest move.
export const LAST_HEIGHT = EPOCH_BITS.length * RETARGET_INTERVAL - 1;

// nBits -> the target it packs. Accepts the header's hex or the number, since
// explorers disagree about which they serve.
export function bitsToTarget(bits) {
  const packed = BigInt(typeof bits === 'string' ? `0x${bits.replace(/^0x/, '')}` : bits);
  if (packed < 0n || packed > 0xffffffffn) return null;
  const exponent = packed >> 24n;
  const mantissa = packed & 0xffffffn;
  // The sign bit would make a negative target, which no valid header carries.
  if (mantissa & 0x800000n) return null;
  const target = exponent > 3n
    ? mantissa << (8n * (exponent - 3n))
    : mantissa >> (8n * (3n - exponent));
  return target > 0n ? target : null;
}

// The hashes one block at this difficulty should cost. Bitcoin Core's
// GetBitsProof, in a language with big integers to spare.
export function blockWork(bits) {
  const target = bitsToTarget(bits);
  return target == null ? null : (1n << 256n) / (target + 1n);
}

// The difficulty a header states, as the explorers print it. Lossy on purpose:
// this is for reading, and the work above is for counting.
export function difficultyOf(bits) {
  const target = bitsToTarget(bits);
  if (target == null) return null;
  return Number(DIFFICULTY_1_TARGET * 1000000n / target) / 1000000;
}

// The work behind a height, inclusive of the block at it -- the same sum
// nChainWork carries, and the same value getblockheader reports.
//
// Every epoch contributes its whole 2016 blocks except the last, which
// contributes as far as the height asked for. Genesis is a block like any
// other and is counted; the off-by-one at that end is the easy mistake.
export function chainWork(height) {
  const h = Math.floor(Number(height));
  if (!Number.isFinite(h) || h < 0 || h > LAST_HEIGHT) return null;
  let total = 0n;
  for (let e = 0; e <= Math.floor(h / RETARGET_INTERVAL); e++) {
    const first = e * RETARGET_INTERVAL;
    const last = Math.min(first + RETARGET_INTERVAL - 1, h);
    const work = blockWork(EPOCH_BITS[e]);
    if (work == null) return null;
    total += BigInt(last - first + 1) * work;
  }
  return total;
}

// The work a run of chapters added, both ends inclusive -- what a book or a
// volume cost, as against the chainWork above, which is what the chain had
// cost by the time it reached one.
//
// This is the figure the leaves state, and it is the one that survives the
// book's own numbering. A book is 2016 chapters but not, after Volume I, a
// retarget window (see btc-citation.js): it opens 336 blocks further into a
// live one with every volume, so a book that straddles a retarget was mined
// under two targets and the leaf states both. Work added has no such trouble
// -- however many windows a span crosses, what it added is one sum.
export function workBetween(from, to) {
  const lo = Math.floor(Number(from));
  const hi = Math.floor(Number(to));
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo < 0 || hi < lo) return null;
  const through = chainWork(hi);
  if (through == null) return null;
  if (lo === 0) return through;
  const before = chainWork(lo - 1);
  return before == null ? null : through - before;
}

// The 64-hex form Bitcoin Core prints, so a derived answer can be compared
// with a node's byte for byte.
export function formatWork(work) {
  return work == null ? null : work.toString(16).padStart(64, '0');
}

// A count of hashes as the book states a large number: three significant
// figures over a power of ten, 5.42·10²³. The dot is the notation's own
// multiplication sign throughout (2²⁰⁸·3·5·17·257) and × is not available for
// one -- it is a Script opcode here.
//
// Rounded hard, and meant to be. The exact figure is an expectation, not a
// measurement (a block realises whatever it realises; genesis's own hash sits
// 2536x below the target it had to clear), so printing it to twenty-nine
// digits would claim a precision the quantity does not have. Three figures is
// what can be honestly read off it.
export function formatHashes(work) {
  if (work == null || work <= 0n) return null;
  const n = Number(work);
  if (!Number.isFinite(n)) return null;
  let exponent = Math.floor(Math.log10(n));
  let mantissa = n / 10 ** exponent;
  // Two separate ways to land outside [1, 10), and they have to be settled in
  // this order or they undo one another: log10 can fall on the wrong side of a
  // power of ten, and rounding 9.999 to two figures then carries into the next
  // one on its own.
  if (mantissa < 1) { mantissa *= 10; exponent -= 1; }
  if (mantissa >= 10) { mantissa /= 10; exponent += 1; }
  if (Number(mantissa.toFixed(2)) >= 10) { mantissa = 1; exponent += 1; }
  return `${mantissa.toFixed(2)}·10${toSuperscript(exponent)}`;
}

// The same quantity as a count of hashes, for prose that wants to say what it
// is. Loses precision past 2^53 and is meant to: no sentence needs the last
// digit of 6.2e28, and pretending otherwise would suggest the figure was
// measured rather than expected.
export function workHashes(work) {
  return work == null ? null : Number(work);
}
