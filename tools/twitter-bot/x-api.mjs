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

// Post `text` as a reply to `inReplyTo` (or a standalone tweet without it),
// with any uploaded media attached.
export async function postTweet({ creds, text, inReplyTo = null, mediaIds = [], apiBase = DEFAULT_API_BASE }) {
  const url = `${apiBase}/2/tweets`;
  const body = { text };
  if (inReplyTo) body.reply = { in_reply_to_tweet_id: inReplyTo };
  if (mediaIds.length) body.media = { media_ids: mediaIds };
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

// Upload an image (v2 simple upload: one multipart POST — a passage PNG is
// far under the size that needs chunking) and return its media id. A
// multipart body contributes nothing to the OAuth signature, same as JSON.
// The response's id field has moved across API generations; accept each.
export async function uploadMedia({ creds, media, mimeType = 'image/png', apiBase = DEFAULT_API_BASE }) {
  const url = `${apiBase}/2/media/upload`;
  const form = new FormData();
  form.append('media', new Blob([media], { type: mimeType }), 'passage.png');
  form.append('media_category', 'tweet_image');
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: oauth1Header({ method: 'POST', url, ...creds }) },
    body: form,
  });
  const json = await checked(res, url);
  const id = json.data?.id || json.id || json.media_id_string;
  if (!id) throw new XApiError(200, `no media id in upload response: ${JSON.stringify(json).slice(0, 200)}`, url);
  return String(id);
}

// Attach alt text to uploaded media — the passage itself, for readers who
// won't see the page. Best-effort by design: a metadata failure must never
// cost the reply, so callers may fire and forget.
export async function setAltText({ creds, mediaId, text, apiBase = DEFAULT_API_BASE }) {
  const url = `${apiBase}/2/media/metadata`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: oauth1Header({ method: 'POST', url, ...creds }),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ id: mediaId, metadata: { alt_text: { text } } }),
  });
  if (!res.ok) throw new XApiError(res.status, (await res.text()).slice(0, 400), url);
}
