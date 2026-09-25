// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-chainwork-testnet4.js — testnet4's retarget history, as the work it adds
// up to. Machine-written; regenerate with
// `node tools/fetch-epoch-work-testnet4.mjs`, which appends and never rewrites.
//
// Testnet4's twenty-minute rule lets a block be mined at the minimum
// difficulty (nBits 1d00ffff) whenever it comes more than twenty minutes after
// its parent, so one nBits per epoch does not hold there the way it does on
// mainnet (btc-chainwork-epochs.js). What does hold is that every block of an
// epoch carries one of two: the epoch's own, which its first block always
// carries because a retarget is never a minimum-difficulty block, or the
// minimum. So an epoch's work is two numbers -- its nBits and how many of its
// 2016 blocks were mined at the minimum instead -- and that is each row.
// Index e covers heights e*2016 .. e*2016+2015.
//
// The counts say how many, not which, so web/btc-chainwork.js can sum any
// whole epoch exactly and a part of one only where every block in it weighed
// the same. That is every figure the pages draw: on testnet4 each book is one
// whole epoch.

export const TESTNET4_EPOCHS = [
  ['1d00ffff', 0], ['1c3fffc0', 0], ['1c0ffff0', 0], ['1c03fffc', 1],
  ['1c00ffff', 0], ['1b3fffc0', 0], ['1b0ffff0', 0], ['1b03fffc', 0],
  ['1b00ffff', 0], ['1a3fffc0', 0], ['1a0ffff0', 2], ['1a03fffc', 4],
  ['1a00ffff', 79], ['19780d66', 685], ['1a0082a5', 425], ['1973b070', 699],
  ['19788fdf', 487], ['19572ce1', 765], ['19609307', 676], ['1954fa04', 658],
  ['194d9574', 1089], ['1949d95f', 1222], ['1925d988', 1572], ['191c863c', 1656],
  ['191761d3', 1658], ['1911826a', 1751], ['1911af21', 1850], ['191615bf', 1869],
  ['191e48db', 1805], ['191efe70', 1605], ['1913e3b7', 1606], ['190d4838', 1604],
  ['19078cc7', 1707], ['1905be8c', 1684], ['190430be', 1800], ['190455c3', 1788],
  ['190461c8', 1871], ['1906224d', 1843], ['1907a81f', 1700], ['1905f649', 1722],
  ['19052250', 1783], ['190552bf', 1800], ['1905d516', 1799], ['1906433b', 1748],
  ['19059ef0', 1746], ['1904f564', 1717], ['1903f8fb', 1720], ['19031c78', 1685],
  ['1902335b', 1724], ['1901c065', 1761], ['190188a9', 1816], ['190192bb', 1792],
  ['19017f3a', 1787], ['19016c16', 1876], ['1901d399', 1869], ['19026611', 1878],
  ['19031f9f', 1786], ['19030b15', 1696], ['190255d9', 1793], ['1902542b', 1790],
  ['19025b1f', 1882], ['190336be', 1762], ['190327c4', 1720], ['19040323', 1763],
  ['19039f05', 1753], ['19034712', 1759], ['1902deb9', 1812], ['1902fdb9', 1824],
  ['190376b6', 1723], ['1902e70c', 1715], ['19023578', 1783], ['190228f4', 1833],
  ['190274df', 1765], ['1902a68f', 1744], ['190295cb', 1842], ['19033d69', 1775],
];
