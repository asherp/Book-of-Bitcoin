// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-ballot.js — the orders a ballot can be read in, and the comparator that
// puts a window of blocks into one of them.
//
// The consensus table (web/bitcoin-appendix.html) is a replay: its first and
// default order is the order the blocks were written in, and scrolling it is
// watching an activation happen. But a reader brings a second question to the
// same window — which blocks said yes, and what were the ones that said no
// running instead — and answering that by eye down two thousand rows is not
// an answer. So the head is a set of controls, and this module is the part of
// them that can be reasoned about on its own: given a window and an order,
// which row comes first.
//
// Nothing here touches the DOM, the chain, or the fork's file. The ballot's
// own reading of a yes arrives as a function, because there are three of them
// (a version bit, a minimum version, or text in the coinbase) and which one
// applies is the fork's business, not the order's.

// The two orders, and what each direction is called. The words are the
// ballot's rather than a table's: a reader choosing an order is asking to see
// the oldest blocks or the newest, the signallers or the holdouts, and
// `asc`/`desc` names neither of those things.
export const BALLOT_ORDERS = {
  time: { dirs: ['old', 'new'], fallback: 'old' },
  version: { dirs: ['yes', 'no'], fallback: 'yes' },
};

// The order the leaf opens in, and the one every unreadable address falls
// back to: the replay, oldest first.
export const DEFAULT_SORT = { by: 'time', dir: 'old' };

// Read an order off a leaf's address. Anything that is not one of the orders
// above is not corrected or complained about, it is simply the default -- a
// mistyped sort should show the reader the ballot, not an error.
export function parseBallotSort(search) {
  const p = search instanceof URLSearchParams ? search : new URLSearchParams(String(search ?? ''));
  const by = p.get('sort');
  if (!Object.prototype.hasOwnProperty.call(BALLOT_ORDERS, by)) return { ...DEFAULT_SORT };
  const order = BALLOT_ORDERS[by];
  const dir = p.get('dir');
  return { by, dir: order.dirs.includes(dir) ? dir : order.fallback };
}

// The same order written back into an address, so a sorted ballot can be
// linked, cited, and restored when the reader climbs back out of a block's
// leaf. The default writes nothing: the plain address is the replay, and a
// leaf that opened in its own default order should keep the address it was
// opened with.
export function ballotSortQuery({ by, dir } = DEFAULT_SORT) {
  if (by === DEFAULT_SORT.by && dir === DEFAULT_SORT.dir) return '';
  if (!Object.prototype.hasOwnProperty.call(BALLOT_ORDERS, by)) return '';
  return `&sort=${by}&dir=${dir}`;
}

// The other direction of the same control: which direction a head's click
// turns to next. Two directions apiece, so it is the other one.
export function toggleBallotDir({ by, dir }) {
  const order = BALLOT_ORDERS[by] ?? BALLOT_ORDERS[DEFAULT_SORT.by];
  const [a, b] = order.dirs;
  return dir === a ? b : a;
}

// A block's place in the version order, within its own side of the ballot.
// Two readings, because the column itself has two: a version word, or -- for
// the one ballot written outside the version word -- the miner's own line.
//
// The word is compared as the unsigned thirty-two bits it is. Bit 31 is set
// in every BIP9-era version, so a signed comparison would sort the whole
// modern chain below the four early integer versions and call it an order.
const versionKey = (b) => (b.version >>> 0);

// An unread coinbase is counted as no vote by the ballot, so it is already on
// the noes' side; within that side it sorts last, after every line the chain
// did give up. `null` is the absence of a reading, not an empty one, and the
// two are different rows.
const sayKey = (b) => (b.say == null ? null : String(b.say));

// The comparator. `yes` is the ballot's own reading of a yes -- the same
// function the signal column prints from, passed in rather than re-derived,
// so the column and the order can never disagree about a block.
//
// Height is the last key of every order, which is what makes each of them
// total: two blocks that tie on everything else still have exactly one place
// to be, so choosing an order twice never reshuffles rows that did not move.
export function ballotComparator({ by, dir } = DEFAULT_SORT, { yes, coinbase = false } = {}) {
  const byHeight = (a, b) => a.height - b.height;
  // Time is the order the blocks were written in, and that is height, not the
  // clock: a block's timestamp is only loosely bound by consensus and may
  // precede its own parent's, so ordering by it would let the replay step
  // backwards. The clock is what the row shows; the height is what it means.
  // Reversed by swapping the pair rather than by negating the result: a
  // comparator multiplied by -1 answers -0 for a block against itself, which
  // is a row reporting that it is not level with itself.
  if (by === 'time') {
    return dir === 'new' ? (a, b) => byHeight(b, a) : byHeight;
  }
  // Version order is two keys before the height, and the first of them is the
  // ballot's verdict rather than the word: under BIP9 the counted bit is one
  // bit of a word carrying twelve others and a rolling nibble, so sorting the
  // word numerically interleaves the yeses with the noes and gathers nothing.
  const lead = dir === 'no' ? 1 : -1;   // 'yes': signallers first
  const key = coinbase ? sayKey : versionKey;
  return (a, b) => {
    const ay = yes(a) ? 1 : 0;
    const bee = yes(b) ? 1 : 0;
    if (ay !== bee) return (ay - bee) * lead;
    const ak = key(a);
    const bk = key(b);
    // Within a side, the field itself, so each block reads somewhere stable.
    if (ak === null || bk === null) {
      if (ak !== bk) return ak === null ? 1 : -1;   // an unread line sorts last
    } else if (ak !== bk) {
      return ak < bk ? -1 : 1;
    }
    return byHeight(a, b);
  };
}

// The window in an order: a sorted copy, never the caller's array. The table
// banks its blocks in the order they were fetched and draws from that bank
// repeatedly, so an in-place sort would reorder the record underneath it.
export function orderBallot(blocks, sort, opts) {
  return blocks.slice().sort(ballotComparator(sort, opts));
}

// Whether an order is the replay. The devices that exist *because* the rows
// are chronological -- the day heads ruled across the table, the running
// count and rate down its right-hand columns -- have nothing to say in any
// other order, and ask this rather than testing `by` in five places.
export const isReplay = ({ by, dir } = DEFAULT_SORT) => by === 'time' && dir === 'old';
