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
// Entries are ordered by the address's famous moment (reading order), like the
// contents -- not alphabetically; the list is short enough to scan whole.

export const INDEXED = [
  // The genesis coinbase paid its 50 BTC to Satoshi's bare public key; this is
  // that key's address form, the most famous address in Bitcoin. The output is
  // unspendable (the genesis coinbase was never entered into the UTXO set), yet
  // the entry keeps growing: tributes arrive to this day, so its index trails
  // from I β1 ■1 into the present.
  { title: 'Satoshi Nakamoto — genesis address', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  // The recipient of the first transaction (I β1 ■171 §1). That payment went
  // to Hal's bare public key, not this hash of it, and explorers index the two
  // script forms separately -- so the address history opens not at the famous
  // chapter but wherever the P2PKH form of the same key was first paid.
  { title: 'Hal Finney', address: '1Q2TWHE3GMdB6BZKafqwxXtWAWgFt5Jvm3' },
  // The address that took delivery of the 10,000 BTC for two pizzas (block
  // 57,043 -- Bitcoin Pizza Day, the contents' own chapter for it).
  { title: 'Jeremy Sturdivant — Bitcoin Pizza', address: '17SkEw2md5avVNyYgj6RiXuQKNwkXaxFyQ' },
];

// Addresses still to confirm against the chain before adding: the first P2PKH
// recipient ever (tx 6f7cf958…, Jan 16 2009 -- the contents cites the
// transaction; its output address belongs here too); the first P2SH address
// spent from (e5779b9e…); the first native SegWit (bc1q…) and first Taproot
// (bc1p…) addresses paid. Each is one address-decode away from its
// already-cited transaction, but decode them from the chain, not from memory.

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
