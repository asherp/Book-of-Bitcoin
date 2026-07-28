// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/x-api.mjs — the two X API v2 calls the bot makes, with
// no dependencies: recent search (app-only bearer token) and posting a
// reply (OAuth 1.0a user context, HMAC-SHA1, signed here with node:crypto).
//
// OAuth 1.0a rather than OAuth 2.0 because it needs no token refresh
// dance: the four credentials from the developer portal sign requests
// forever. v2 endpoints accept it for user-context calls.

import { createHmac, randomBytes } from 'node:crypto';

export const DEFAULT_API_BASE = 'https://api.x.com';

// RFC 3986 percent-encoding — encodeURIComponent, plus the five characters
// it leaves bare that OAuth requires encoded.
export const pctEncode = (s) =>
  encodeURIComponent(s).replace(/[!*'()]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

// The Authorization header for one request. `params` carries any
// form-encoded body or query parameters that must join the signature base
// string (a JSON body contributes nothing, per spec). `nonce` / `timestamp`
// are injectable so the signature is testable against published vectors.
export function oauth1Header({
  method, url,
  consumerKey, consumerSecret, accessToken, accessSecret,
  params = {}, nonce = null, timestamp = null,
}) {
  const u = new URL(url);
  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce || randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(timestamp || Math.floor(Date.now() / 1000)),
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  const all = { ...params, ...oauth };
  for (const [k, v] of u.searchParams) all[k] = v;
  const paramString = Object.entries(all)
    .map(([k, v]) => [pctEncode(k), pctEncode(String(v))])
    .sort(([a, av], [b, bv]) => (a < b ? -1 : a > b ? 1 : av < bv ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const base = [
    method.toUpperCase(),
    pctEncode(u.origin + u.pathname),
    pctEncode(paramString),
  ].join('&');
  const signingKey = `${pctEncode(consumerSecret)}&${pctEncode(accessSecret)}`;
  oauth.oauth_signature = createHmac('sha1', signingKey).update(base).digest('base64');

  const header = Object.entries(oauth)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${pctEncode(k)}="${pctEncode(v)}"`)
    .join(', ');
  return `OAuth ${header}`;
}

// A failed call, with enough attached to decide whether to retry.
export class XApiError extends Error {
  constructor(status, body, url) {
    super(`X API ${status} on ${url}: ${body}`);
    this.status = status;
    this.rateLimited = status === 429;
  }
}

async function checked(res, url) {
  if (!res.ok) throw new XApiError(res.status, (await res.text()).slice(0, 400), url);
  return res.json();
}

// Recent search: tweets from the last 7 days matching `query`, oldest
// first so replies land in arrival order and since_id advances safely.
export async function searchRecent({ bearer, query, sinceId = null, maxResults = 25, apiBase = DEFAULT_API_BASE }) {
  const u = new URL(`${apiBase}/2/tweets/search/recent`);
  u.searchParams.set('query', query);
  u.searchParams.set('max_results', String(Math.min(Math.max(maxResults, 10), 100)));
  u.searchParams.set('tweet.fields', 'author_id,conversation_id');
  if (sinceId) u.searchParams.set('since_id', sinceId);
  const json = await checked(await fetch(u, { headers: { authorization: `Bearer ${bearer}` } }), u.href);
  const tweets = (json.data || []).slice().sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
  return { tweets, newestId: json.meta?.newest_id || null };
}

// Post `text` as a reply to `inReplyTo` (or a standalone tweet without it).
export async function postTweet({ creds, text, inReplyTo = null, apiBase = DEFAULT_API_BASE }) {
  const url = `${apiBase}/2/tweets`;
  const body = inReplyTo ? { text, reply: { in_reply_to_tweet_id: inReplyTo } } : { text };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: oauth1Header({ method: 'POST', url, ...creds }),
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return (await checked(res, url)).data;
}
