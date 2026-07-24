// btc-index.js — the curated back-of-book index for the Bitcoin Book: notable
// addresses, each listing every chapter where it appears. Shared by
// bitcoin-index.html (the index page) and bitcoin-search.html (which routes an
// address query here).
//
// The table of contents and the index are inverses. The contents is a curated
// list of *places* -- each entry names one block or transaction and cites it
// once. The index is a curated list of *names* -- each entry is an address,
// and its citations are discovered from the chain at read time: every
// transaction that touches the address becomes a chapter citation, the way a
// name in a book's index trails the run of pages it appears on. So where a
// contents entry's id resolves to one citation, an index entry's address
// resolves to many -- an open-ended list that grows as the address is used.
//
// The curated set is donation addresses: causes the community has paid, so
// every citation is a gift and each entry's nested listing reads as a ledger
// of giving. Ordered by the address's famous moment (reading order), like the
// contents -- not alphabetically; the list is short enough to scan whole.

export const INDEXED = [
  // WikiLeaks' public donation address, opened June 14, 2011, after the
  // banking blockade -- Visa, Mastercard, PayPal, and the banks cut the
  // organization off, and bitcoin became the way through. The donation stream
  // Satoshi asked to hold off ("the heat you would bring") in one of his last
  // posts; it arrived anyway, six months later, and has run ever since --
  // thousands of gifts deep, so its listing leans hardest on the walk cap's
  // "latest N of M" tail.
  { title: 'WikiLeaks', address: '1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v' },
  // The Free Ross campaign's vanity donation address (the name is mined into
  // the base58), collecting for Ross Ulbricht's defense and advocacy from the
  // Silk Road trial era (2014) through freeross.org, until the January 2025
  // pardon turned the cause from clemency to gratitude -- donations kept
  // arriving after it.
  { title: 'Free Ross — Ross Ulbricht defense fund', address: '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv' },
  // The Hal Finney Bitcoin Fund for ALS research, opened as Hal died (August
  // 2014, the ice-bucket summer) after five years with the disease. The first
  // transaction's recipient, remembered in donations toward its cure; the
  // Bitcoin Foundation gave first. The annual Running Bitcoin Challenge
  // (January 1-10, closing on the "Running bitcoin" tweet's anniversary)
  // donates through processor pages with no fixed address, so this fund is
  // the tribute's citable line.
  { title: 'Hal Finney Bitcoin Fund — ALS research', address: '1JsnZLEGgLJY7rbDdaKTzC2JyvfaKUpF5p' },
  // The EFF's standing bitcoin address, published on its "Other Ways to
  // Give" page. The foundation's bitcoin story runs the currency's whole
  // arc of respectability: an early 2011 acceptance, withdrawn the same
  // year over legal uncertainty, resumed for good in May 2013 -- and now a
  // plain address on the donations page, listed among the checks and wire
  // transfers.
  { title: 'Electronic Frontier Foundation', address: '3LTu6uavQ4A3kgDauZipyGqcHQEUSVe2so' },
  // The donation address Keonne Rodriguez, Samourai Wallet's co-founder,
  // published from federal prison (2026), appealing to the Bitcoin community
  // for help with the legal debt of the Samourai prosecution: arrested April
  // 2024 over the privacy wallet, a 2025 guilty plea to operating an
  // unlicensed money-transmitting business. An open appeal, so its index
  // line is still being written.
  { title: 'Free Samourai — Keonne Rodriguez', address: 'bc1qtjjcvn98wh7dfd55m8kxhjcfexanttwt8gtan8' },
];

// Donation addresses still to confirm against their campaigns before adding:
// the Tor Project's (donate.torproject.org/cryptocurrency has published
// standing wallet addresses since 2019), and Tails' bc1qtt04z… (verified on
// tails.net/donate; Tails joined the Tor Project in 2024). Confirm each from
// the campaign's own publications, never from memory.

// A loose shape test for the address forms the chain has used: base58 P2PKH
// ('1…') and P2SH ('3…'), and bech32/bech32m ('bc1…', matched lowercase --
// the all-uppercase QR form is normalized by the caller). Shape only, no
// checksum: its job is routing a query to the index page, whose chain lookup
// is the real validator.
export const isAddress = (s) =>
  /^([13][1-9A-HJ-NP-Za-km-z]{25,34}|bc1[02-9ac-hj-np-z]{11,87})$/.test(s);

// A citation link into the book for one appearance: the transaction's chapter
// opens by txid, and the book resolves its exact §section itself -- the index,
// like a book's, cites pages (chapters), not lines.
export const citeHref = (txid) => `bitcoin-book.html?txid=${txid}`;

// The net effect of one transaction on the address, in satoshis: outputs
// paying the address minus inputs spending from it. Local arithmetic -- the
// explorer's tx JSON carries each input's prevout, so no further lookups.
// Amounts stay well inside Number's exact-integer range (all 21M BTC is
// 2.1e15 sats, under 2^53).
export function netSats(tx, address) {
  let n = 0;
  for (const o of tx.vout) if (o.scriptpubkey_address === address) n += o.value;
  for (const i of tx.vin) if (i.prevout?.scriptpubkey_address === address) n -= i.prevout.value;
  return n;
}

// A net satoshi amount in the book's own money notation (formatBtc in
// btc-prose.js -- not imported, since the prose module drags in the WASM
// engine): comma-grouped whole part, always the full eight decimal places so a
// right-aligned column aligns on the point, the ₿ sign trailing, a bare 0 ₿
// for nothing-net. Signed, since an index line reads as a ledger: what the
// chapter paid the address (+) or spent from it (−).
export function formatNetBtc(sats) {
  if (!sats) return '0 ₿';
  const sign = sats < 0 ? '−' : '+';
  const abs = Math.abs(sats);
  const whole = Math.floor(abs / 1e8).toLocaleString('en-US');
  const frac = String(abs % 1e8).padStart(8, '0');
  return `${sign}${whole}.${frac} ₿`;
}
