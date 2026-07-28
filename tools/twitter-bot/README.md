# The reply bot — chapter and verse, on demand

A zero-dependency Node bot that watches a hashtag on X (Twitter) for
citations of the βook of βitcoin and answers each with chapter and verse:
the passage's canonical citation, its curated title when the table of
contents names one, the section's transaction id quoted as Glossia prose —
a verse that decodes back to the txid, the book's promise held even at
tweet length — and a deep link into the live book.

```
tweet:   #bookofbitcoin III β2 ■5 §1

reply:   III β2 ■5 §1
         “…the verse: the section's txid as Glossia prose…”
         https://bookofbitcoin.io/bitcoin-book.html?block=422020&index=0
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

```sh
# Try it with no credentials at all: parse + resolve + render to stdout
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
- `quote.mjs` — citation → chain data → the reply, weighed as X weighs it
- `x-api.mjs` — the two API calls, with OAuth 1.0a signing, no dependencies
- `test.mjs` — the offline suite; the last test renders a real verse
  through the WASM engine when `./build_web.sh` has run, and skips when not
