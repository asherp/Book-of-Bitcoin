// SPDX-License-Identifier: MIT OR Apache-2.0
//
// The affordance's URLs (web/btc-contribute.js). What is worth testing here is
// not the prose but the parameters: GitHub's two doors are picky in ways that
// fail silently in a browser — a `body` beside a `template` drops the form, an
// unencoded ■ makes a broken link — and neither shows up as an error, only as
// a contributor who never sees the questions the template asks.

import test from 'node:test';
import assert from 'node:assert/strict';

const { contributionLinks, commentaryPath, contributeHtml, REPO } =
  await import('../web/btc-contribute.js');

const PASSAGE = { citation: 'III β2 ■5 §85', latin: 'v3b2c5s85' };

test('the pull request door asks for the commentary template by name', () => {
  const { propose } = contributionLinks(PASSAGE);
  const url = new URL(propose);
  assert.equal(url.pathname, '/asherp/book-of-bitcoin/compare');
  assert.equal(url.searchParams.get('template'), 'commentary.md');
  assert.equal(url.searchParams.get('expand'), '1');
  // The passage rides in the title, never the body: on a compare URL `body`
  // overrides `template`, so prefilling one costs the other.
  assert.equal(url.searchParams.get('body'), null);
  assert.match(url.searchParams.get('title'), /III β2 ■5 §85/);
});

test('the sigils survive the trip', () => {
  const { propose } = contributionLinks(PASSAGE);
  // Encoded in the href, and read back whole -- a raw ■ in a query string is
  // the kind of thing that works in one browser and truncates in another.
  assert.ok(!/[■β§]/.test(propose), 'the citation is percent-encoded in the URL');
  assert.match(new URL(propose).searchParams.get('title'), /^Commentary: /);
});

test('the new-file door names the file and opens it under the licence', () => {
  const { start } = contributionLinks(PASSAGE);
  const url = new URL(start);
  assert.equal(url.pathname, '/asherp/book-of-bitcoin/new/main');
  assert.equal(url.searchParams.get('filename'), 'web/commentary/v3b2c5s85-your-name.md');
  const value = url.searchParams.get('value');
  assert.match(value, /^<!-- SPDX-License-Identifier: CC-BY-4\.0 -->/);
  assert.match(value, /III β2 ■5 §85/);
});

test('a curated passage is named for itself, an uncurated one for its citation', () => {
  assert.equal(commentaryPath({ latin: 'v1b29c596s85', title: 'Bitcoin Pizza Day' }),
    'web/commentary/bitcoin-pizza-day-your-name.md');
  assert.equal(commentaryPath({ latin: 'v1b29c596s85' }),
    'web/commentary/v1b29c596s85-your-name.md');
  // A title made entirely of punctuation slugs to nothing; the citation stands
  // in rather than the file being called "-your-name.md".
  assert.equal(commentaryPath({ latin: 'v2b1c1', title: '— …' }),
    'web/commentary/v2b1c1-your-name.md');
});

test('an unannotated passage says so; an annotated one only invites', () => {
  const empty = contributeHtml(PASSAGE);
  const taken = contributeHtml({ ...PASSAGE, hasReading: true });
  assert.match(empty, /Nothing has been said about III β2 ■5 §85 yet\. /);
  assert.doesNotMatch(taken, /Nothing has been said/);
  // One door, the same one, wherever it stands -- and it leaves the site.
  for (const html of [empty, taken]) {
    assert.equal(html.match(/<a /g).length, 1);
    assert.match(html, />Add your commentary\.<\/a>/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.ok(html.includes(`${REPO}/new/main`));
  }
  // The compare door is still known here -- CONTRIBUTING.md sends contributors
  // through it -- it is just not offered at the foot of a passage.
  assert.ok(!taken.includes('/compare'));
});

test('a title carrying markup cannot become markup', () => {
  const html = contributeHtml({ ...PASSAGE, citation: '<script>x</script>', hasReading: true });
  assert.ok(!html.includes('<script>'), 'the citation is escaped where it is set');
});
