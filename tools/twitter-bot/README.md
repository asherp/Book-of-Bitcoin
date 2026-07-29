# The reply bot — chapter and verse, on demand

A Node bot that watches a hashtag on X (Twitter) for citations of the
βook of βitcoin and answers each with chapter and verse: the passage's
canonical citation, its curated title when the table of contents names
one, the section itself quoted in the book's notation — scripts as opcode
sigla (⧉ ⌗ ∇ …), amounts in ₿, the sequence and locktime marks, witness
data as footnotes, and the txid-as-prose line every passage opens with —
and a deep link into the live book.

The quote is always set whole, sigla and cover words alike — the cover is
the grammar that makes the payload read as a sentence, and stripping
either would quote the book in a voice it does not have. A section small
enough for X's 280 rides in the tweet text. One that isn't — nearly all
of them — is ellipsized in the text at a word boundary, and the full
passage rides as an attached image, with the whole passage as alt text.

## The passage image

The image is the book's own page, set the way `bitcoin-book.html` sets
it: the `§` heading and the section's event title, the txid as prose
beneath it, a rule, then the transaction as a manuscript page — the
three-column band grid with provenance in the left margin, the canonical
prose in the body (the first line taking the illuminated initial),
amounts in the right margin, the locktime centred as a colophon, and
witness data as numbered footnotes. The markup, the class names and the
CSS are transposed from the reading page; the app's running head and
section nav are its furniture, not the page's, and are left out.

**Fitting.** The whole page is set from one root font size, and every
measure in it is an em off that number — so fitting a passage to the
image is a search on a single variable. The renderer binary-searches the
largest root size at which the passage still fits, then renders there: a
short section comes out large and airy, a long one small and dense, and
the book's proportions hold at either end. A passage too long even at the
floor (9px) keeps the floor and shows its opening — the top of the page —
with a `⋯` and the colophon still pinned beneath it, so it reads as a
passage that continues rather than one that stopped mid-word.

The default image is 1200×1500 (4:5, the tallest portrait X shows
uncropped in a timeline), rendered at 2× for a crisp serif. Any geometry
works — set `BOT_IMAGE_WIDTH` / `BOT_IMAGE_HEIGHT` and the fit follows.

```
tweet:   #bookofbitcoin I β1 ■1 §1

reply:   I β1 ■1 §1 — The Times 03/Jan/2009 Chancellor on brink of…
         “version 1 input ∅ coinbase — new coin — β₃₂ η₄ ⁶⁹ “The Times
         03/Jan/2009 Chancellor on brink of second bailout for banks” · ●
         output 50.00000000 ₿ — p⁶⁵ Cop afford detail to satoshi…”
         + the full passage as an image
         https://bookofbitcoin.io/bitcoin-book.html?block=0&index=0
```

## What it answers

Any of the citation forms a phone keyboard can produce, found anywhere in
the tweet's text:

| Form | Example | Notes |
|---|---|---|
| sigla | `III β2 ■5 §1` | the book's own notation; `§` optional (defaults to §1, the coinbase) |
| ascii | `III b2 c5 s1` | also `book` / `chapter` / `section` spelled out |
| hashtag | `#IIIb2c5s1` | the ascii form packed — hashtags carry no spaces |
| block | `block 170 §2` | a height directly; `s2` works too |
| txid | 64 hex chars | resolved to its citation via merkle proof |

Replies always cite the canonical `reference(height)` — an ascii or spilled
citation is answered under its true address. A citation of a chapter the
chain has not reached is answered gently ("…is not yet written — N blocks
to go"); a section a chapter does not have, likewise. A tweet carrying the
hashtag but no parsable citation is passed over in silence — the bot never
lectures a busy tag.

## Running it

Requires Node ≥ 20. The Glossia engine (`web/glossia.js` +
`web/glossia_bg.wasm`) is a build artifact; if it is missing the bot
fetches it from the deployed site, so no Rust toolchain is needed.

The one dependency, and it is optional, is Playwright — headless Chromium
renders the passage images. Without it the bot runs text-only and
overflowing verses stay ellipsized; with it they ride whole:

```sh
cd tools/twitter-bot && npm install     # optional: enables passage images
```

```sh
# Try it with no credentials at all: parse + resolve + render to stdout
# (writes passage.png beside it when the verse overflows)
node tools/twitter-bot/bot.mjs --render "III β2 ■5 §1"

# One real pass: search, reply, save state
node tools/twitter-bot/bot.mjs

# Search and render, post nothing (also records nothing)
node tools/twitter-bot/bot.mjs --dry-run

# The offline test suite (no network, no credentials)
node --test tools/twitter-bot/test.mjs
```

Each invocation is one pass: search since the last seen tweet, reply to
what parses (capped per pass), write `state.json`, exit. Run it from cron,
or let `.github/workflows/twitter-bot.yml` do it on a schedule.

## Credentials

Create an app in the [X developer portal](https://developer.x.com/) with
**read and write** user authentication, then supply:

| Variable | What it is | Used for |
|---|---|---|
| `X_BEARER_TOKEN` | app-only bearer token | recent search |
| `X_API_KEY` / `X_API_SECRET` | the app's consumer key pair | signing posts |
| `X_ACCESS_TOKEN` / `X_ACCESS_SECRET` | the bot account's access pair | posting as the bot |

Posting is signed with OAuth 1.0a (HMAC-SHA1, implemented here on
`node:crypto`) — no token-refresh dance, the four credentials sign forever.

**Mind your API tier.** Recent search is not available on X's free tier;
polling a hashtag needs a plan that includes `GET /2/tweets/search/recent`.
The workflow's schedule (every 30 minutes) assumes that; widen it to match
your rate limits.

## Tuning (environment, all optional)

| Variable | Default | Meaning |
|---|---|---|
| `BOT_HASHTAG` | `#bookofbitcoin` | the tag watched |
| `BOT_HANDLE` | — | the bot's own @handle, excluded from search |
| `BOT_MAX_REPLIES` | `5` | replies per pass; the rest wait for the next one |
| `BOT_REPLY_UNWRITTEN` | `1` | set `0` to skip future-chapter citations silently |
| `BOT_IMAGE_WIDTH` | `1200` | passage image width, in CSS px (rendered at 2×) |
| `BOT_IMAGE_HEIGHT` | `1500` | passage image height; the fit follows the geometry |
| `BOT_SITE` | `https://bookofbitcoin.io` | the book's origin, for links and the engine |
| `BOT_STATE` | `tools/twitter-bot/state.json` | where the watermark and ledger live |

## How it keeps from double-replying

`state.json` carries two things: `sinceId`, the search watermark, and
`replied`, a ledger of tweet ids already answered or deliberately skipped.
The watermark only advances past tweets this pass fully disposed of — a
reply cap or rate limit leaves the rest for the next pass — and the ledger
absorbs any overlap, so a rewound watermark (a fresh cache, a hand-edited
file) still never answers a tweet twice. In the workflow the state rides
the Actions cache between runs.

## Layout

- `bot.mjs` — the pass itself: engine bootstrap, search, reply, state
- `citation.mjs` — tweet text → citation, in all the forms above
- `quote.mjs` — citation → chain data → the reply, weighed as X weighs
  it; also the passage page — the book's manuscript grid, its CSS in em
  off one root size — and the image's alt text
- `image.mjs` — passage page → PNG, via Playwright's Chromium: fits the
  root size to the target geometry, then screenshots. Absent Playwright,
  `loadRenderer()` returns null and nothing else degrades
- `x-api.mjs` — the API calls (search, post, media upload, alt text),
  with OAuth 1.0a signing on `node:crypto`
- `test.mjs` — the offline suite; the deeper tests render a real verse
  through the WASM engine (when `./build_web.sh` has run) and a real PNG
  (when Playwright is installed), and skip cleanly when not
