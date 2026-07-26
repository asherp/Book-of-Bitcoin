// SPDX-License-Identifier: CC-BY-4.0
//
// btc-index-data.js — the curated ledgers of the Bitcoin Book: which addresses
// the book keeps a ledger for, what to call them, and the story that earned
// each one its place.
//
// This file is the editorial layer — a reading of the record, not the record
// itself — and is licensed CC BY 4.0, separately from the machinery that
// discovers and renders these ledgers (btc-index.js, MIT OR Apache-2.0) and
// from the book's prose (CC0, the chain's own speech). See the README's
// License section. The chain says an address received coins; that the address
// is worth a reader's attention, and what to call it, is somebody's judgment —
// and judgment carries a name.
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
// Two criteria decide what is kept. The address has to matter -- historically,
// or because reading it teaches something about how the chain reads anyone.
// And it has to be public already: published by its owner, or entered into a
// public record, before this book set it down. Donation addresses are the
// plainest case of both and the shelf opens with them; the same standard
// admits proof-of-reserves addresses, coins seized by state actors, exchange
// breaches, and addresses entered into court filings.
//
// The public-already criterion is what keeps the shelf honest: a ledger here
// adds legibility, never exposure. Ordered by the address's famous moment
// (reading order), like the contents -- not alphabetically; the list is short
// enough to scan whole.
//
// A ledger is a titled set of addresses -- most hold one, but a campaign
// that rotated wallets, or a reader gathering their own, may hold several.
// Each address keeps its own map (one line in the store); the ledger is the
// grouping above them, and its page turns between them like leaves.

export const INDEXED = [
  // WikiLeaks' public donation address, opened June 14, 2011, after the
  // banking blockade -- Visa, Mastercard, PayPal, and the banks cut the
  // organization off, and bitcoin became the way through. The donation stream
  // Satoshi asked to hold off ("the heat you would bring") in one of his last
  // posts; it arrived anyway, six months later, and has run ever since --
  // thousands of gifts deep, the shelf's longest anthology.
  { title: 'WikiLeaks', addresses: ['1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v'] },
  // The Free Ross campaign's vanity donation address (the name is mined into
  // the base58), collecting for Ross Ulbricht's defense and advocacy from the
  // Silk Road trial era (2014) through freeross.org, until the January 2025
  // pardon turned the cause from clemency to gratitude -- donations kept
  // arriving after it.
  { title: 'Free Ross — Ross Ulbricht defense fund', addresses: ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'] },
  // The Hal Finney Bitcoin Fund for ALS research, opened as Hal died (August
  // 2014, the ice-bucket summer) after five years with the disease. The first
  // transaction's recipient, remembered in donations toward its cure; the
  // Bitcoin Foundation gave first. The annual Running Bitcoin Challenge
  // (January 1-10, closing on the "Running bitcoin" tweet's anniversary)
  // donates through processor pages with no fixed address, so this fund is
  // the tribute's citable line.
  { title: 'Hal Finney Bitcoin Fund — ALS research', addresses: ['1JsnZLEGgLJY7rbDdaKTzC2JyvfaKUpF5p'] },
  // The EFF's standing bitcoin address, published on its "Other Ways to
  // Give" page. The foundation's bitcoin story runs the currency's whole
  // arc of respectability: an early 2011 acceptance, withdrawn the same
  // year over legal uncertainty, resumed for good in May 2013 -- and now a
  // plain address on the donations page, listed among the checks and wire
  // transfers.
  { title: 'Electronic Frontier Foundation', addresses: ['3LTu6uavQ4A3kgDauZipyGqcHQEUSVe2so'] },
  // The Tor Project's donation wallet, from the standing addresses page it
  // has kept since 2019 (donate.torproject.org/cryptocurrency). The same
  // address answers on tails.net/donate: Tails joined the Tor Project in
  // 2024, and the anonymity network and its amnesic operating system share
  // the one wallet.
  { title: 'Tor Project', addresses: ['bc1qtt04zfgjxg7lpqhk9vk8hnmnwf88ucwww5arsd'] },
  // The donation address Keonne Rodriguez, Samourai Wallet's co-founder,
  // published from federal prison (2026), appealing to the Bitcoin community
  // for help with the legal debt of the Samourai prosecution: arrested April
  // 2024 over the privacy wallet, a 2025 guilty plea to operating an
  // unlicensed money-transmitting business. An open appeal, so its index
  // line is still being written.
  { title: 'Free Samourai — Keonne Rodriguez', addresses: ['bc1qtjjcvn98wh7dfd55m8kxhjcfexanttwt8gtan8'] },
];

// Further entries join the same way each of these did: the address confirmed
// against its primary public source -- the owner's own publication, the
// filing, the proof, the indictment -- never from memory, and its checksum
// verified before it is written down. Public-already is a criterion and not
// an assumption: an address that cannot be sourced to a public record does
// not belong on this shelf, however interesting its history.
