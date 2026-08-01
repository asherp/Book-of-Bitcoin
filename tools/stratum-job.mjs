// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/stratum-job.mjs — ask a pool for work, and read the coinbase it hands
// out before anyone has mined it.
//
// Every other reading in this repository works backwards, from blocks that
// were found: the survey samples mined coinbases and infers the template from
// them. Stratum states it outright. A pool sends its coinbase in two halves
// and leaves a gap for the miner to fill —
//
//     coinbase = coinb1 ‖ extranonce1 ‖ extranonce2 ‖ coinb2
//
// — so where the gap is, how wide it is, and which bytes the pool wrote either
// side of it are given rather than deduced. That settles by observation what
// tools/coinbase-formats.md currently marks [unverified]: whether a pool is
// gap-early or gap-late, whether the number behind the height is a clock or a
// counter (a clock is in coinb1 and the same in every job of that template; a
// counter is the gap itself), and whether a run of zeros is padding the pool
// wrote or space the miner has yet to fill.
//
//   node tools/stratum-job.mjs stratum+tcp://btc.f2pool.com:1314 --user <account>
//   node tools/stratum-job.mjs stratum+ssl://btcssl.f2pool.com:1300 --user <account> --json
//   node tools/stratum-job.mjs <url> --save job.json     # keep it, read it later
//   node tools/stratum-job.mjs --job job.json            # re-read, offline
//
// This subscribes, authorizes, waits for one mining.notify, prints what it
// found and hangs up. It never submits a share and never asks for one: it is a
// reader, not a miner. `--user` is whatever account name the pool expects (a
// payout address at most pools); many will send work to any name, some will
// not send any until a name they know is authorized, and the tool reports
// which happened rather than guessing.

import { readFile, writeFile } from 'node:fs/promises';
import { connect as netConnect } from 'node:net';
import { connect as tlsConnect } from 'node:tls';
import { pathToFileURL } from 'node:url';

import { decodeCoinbaseScriptSig, shapeOf, identifyPool } from './coinbase-fields.mjs';

const UA = 'book-of-bitcoin/coinbase-survey';   // who is asking, said plainly

// ─── the wire ──────────────────────────────────────────────────────────

// A plain TCP socket to host:port, through an HTTP CONNECT proxy when the
// environment names one. Stratum is raw TCP, and a sandbox that permits only
// proxied egress will drop a direct connection without answering it -- so the
// tunnel is tried wherever HTTPS_PROXY is set, and the failure, if it comes,
// says which hop refused rather than timing out anonymously.
function rawSocket({ host, port, timeout }) {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || '';
  const pm = /^(?:https?:\/\/)?([^:/]+):(\d+)\/?$/.exec(proxy.trim());
  if (!pm) return { socket: netConnect({ host, port }), via: null };

  const [, proxyHost, proxyPort] = pm;
  const socket = netConnect({ host: proxyHost, port: Number(proxyPort) });
  const tunnelled = new Promise((resolve, reject) => {
    socket.once('connect', () => {
      socket.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`);
    });
    let head = '';
    const onData = (chunk) => {
      head += chunk.toString('latin1');
      const end = head.indexOf('\r\n\r\n');
      if (end < 0) return;
      socket.removeListener('data', onData);
      const status = /^HTTP\/1\.[01] (\d{3})([^\r\n]*)/.exec(head);
      if (!status) return reject(new Error(`the proxy answered something that is not HTTP: ${head.slice(0, 80)}`));
      if (status[1] !== '200') {
        return reject(new Error(`the proxy refused the tunnel to ${host}:${port} — ${status[1]}${status[2]} `
          + `(an egress policy denial, not the pool: check ${proxy}/__agentproxy/status)`));
      }
      // Anything after the blank line is already the pool talking.
      const rest = head.slice(end + 4);
      if (rest) socket.unshift(Buffer.from(rest, 'latin1'));
      resolve();
    };
    socket.on('data', onData);
    socket.once('error', reject);
  });
  return { socket, via: `${proxyHost}:${proxyPort}`, tunnelled };
}

// stratum+tcp://host:port or stratum+ssl://host:port -> a socket of the right
// kind, connected and ready to carry JSON lines. Nothing else is accepted: a
// bare host would be a guess about which of the two a pool wanted.
async function openSocket(url, { timeout, log = () => {} }) {
  const m = /^stratum\+(tcp|ssl|tls):\/\/([^:/]+):(\d+)\/?$/i.exec(String(url).trim());
  if (!m) throw new Error(`not a stratum url: ${url}`);
  const [, scheme, host, portStr] = m;
  const port = Number(portStr);
  const tls = scheme.toLowerCase() !== 'tcp';

  const { socket: raw, via, tunnelled } = rawSocket({ host, port, timeout });
  raw.setTimeout(timeout);
  if (tunnelled) { log(`tunnelling through ${via}…`); await tunnelled; log(`tunnel to ${host}:${port} open`); }

  if (!tls) return { socket: raw, host, port, tls, via, ready: tunnelled ? 'now' : 'connect' };
  // A pool's stratum+ssl endpoint is very often a self-signed or otherwise
  // unverifiable certificate. This reads public work and sends no secret, so
  // the handshake proceeds unauthenticated rather than failing: nothing here is
  // confidential in either direction, and the alternative is not reading it.
  const secure = tlsConnect({ socket: tunnelled ? raw : undefined, host: tunnelled ? undefined : host, port: tunnelled ? undefined : port, servername: host, rejectUnauthorized: false });
  secure.setTimeout(timeout);
  return { socket: secure, host, port, tls, via, ready: 'secureConnect' };
}

// A stratum session: newline-delimited JSON both ways, with the id-keyed
// replies resolved to their calls and the notifications handed to a listener.
function session(socket, { onNotification, log }) {
  let nextId = 1, buffer = '';
  const pending = new Map();
  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    let nl;
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { log(`unparseable line: ${line.slice(0, 120)}`); continue; }
      if (msg.id !== undefined && msg.id !== null && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        onNotification(msg);
      }
    }
  });
  const call = (method, params = []) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.write(`${JSON.stringify({ id, method, params })}\n`);
  });
  return { call };
}

// Subscribe, authorize, and wait for the first job. Returns everything the
// pool said, including whether it authorized the name it was given -- a pool
// that refuses the name and sends work anyway is a fact worth recording, and
// so is one that refuses and stays silent.
export async function fetchJob(url, { user = 'x', pass = 'x', timeout = 30000, log = () => {} } = {}) {
  const { socket, host, port, tls, via, ready } = await openSocket(url, { timeout, log });
  return await new Promise((resolve, reject) => {
    let settled = false, spoke = false;
    const finish = (fn, v) => { if (settled) return; settled = true; socket.destroy(); fn(v); };
    const fail = (e) => finish(reject, e instanceof Error ? e : new Error(String(e)));

    socket.on('error', fail);
    // Say which silence it was. A pool that never answered subscribe is a
    // different fact from one that answered and then sent no work, and only the
    // second is about the pool's own behaviour.
    socket.on('timeout', () => fail(new Error(spoke
      ? `no job within ${timeout} ms — the pool answered subscribe but sent no mining.notify`
      : `no answer within ${timeout} ms — nothing came back from ${host}:${port}`)));
    socket.on('close', () => { if (!settled) fail(new Error('the connection closed before a job arrived')); });

    const state = { url, host, port, tls, via, difficulty: null, authorized: null, notifications: [] };

    const { call } = session(socket, {
      log,
      onNotification: (msg) => {
        state.notifications.push(msg.method);
        if (msg.method === 'mining.set_difficulty') { state.difficulty = msg.params?.[0] ?? null; return; }
        if (msg.method !== 'mining.notify') return;
        const [jobId, prevHash, coinb1, coinb2, merkleBranch, version, nbits, ntime, cleanJobs] = msg.params || [];
        finish(resolve, {
          ...state,
          job: { jobId, prevHash, coinb1, coinb2, merkleBranch, version, nbits, ntime, cleanJobs },
        });
      },
    });

    const start = async () => {
      try {
        log(`connected to ${host}:${port}${tls ? ' (tls)' : ''}${via ? ` via ${via}` : ''}`);
        const sub = await call('mining.subscribe', [UA]);
        spoke = true;
        // [[subscriptions…], extranonce1, extranonce2_size]
        state.extranonce1 = sub?.[1] ?? null;
        state.extranonce2Size = sub?.[2] ?? null;
        log(`subscribed: extranonce1 ${state.extranonce1}, extranonce2 ${state.extranonce2Size} bytes`);
        try {
          state.authorized = await call('mining.authorize', [user, pass]);
          log(`authorize(${user}): ${state.authorized}`);
        } catch (e) {
          state.authorized = false;
          state.authorizeError = e.message;
          log(`authorize(${user}) refused: ${e.message} — waiting for work anyway`);
        }
      } catch (e) { fail(e); }
    };
    // Already through a tunnel: the socket is connected and the pool is
    // waiting. Otherwise wait for the handshake this transport does.
    if (ready === 'now') start();
    else socket.once(ready, start);
  });
}

// ─── what the job says ─────────────────────────────────────────────────

const byteLen = (hex) => (hex ? hex.length / 2 : 0);

// A varint at a byte offset in a hex string -> { value, size }.
function varint(hex, at) {
  const first = parseInt(hex.slice(at * 2, at * 2 + 2), 16);
  if (first < 0xfd) return { value: first, size: 1 };
  const n = first === 0xfd ? 2 : first === 0xfe ? 4 : 8;
  const le = (hex.slice(at * 2 + 2, at * 2 + 2 + n * 2).match(/../g) || []).reverse().join('');
  return { value: Number(BigInt('0x' + le)), size: 1 + n };
}

// The assembled coinbase, and where the miner's own bytes sit inside it.
//
// The gap is filled with zeros here, not with a rolled counter: this is the
// template as the pool hands it out, and what the tool is reading is the
// pool's half of it. The offsets say which of the scriptSig's bytes came from
// the pool (either side) and which are the miner's to write.
export function readTemplate({ coinb1, coinb2, extranonce1, extranonce2Size }) {
  const en1 = extranonce1 || '';
  const en2 = '00'.repeat(extranonce2Size || 0);
  const raw = coinb1 + en1 + en2 + coinb2;

  // version (4), [segwit marker], input count (1), null prevout (36), then the
  // scriptSig's own length prefix. A coinbase template is serialized without
  // witness data, so the marker is not expected -- but it is checked for
  // rather than assumed away.
  let at = 4;
  if (raw.slice(8, 12) === '0001') at += 2;
  const inputs = varint(raw, at); at += inputs.size;
  at += 36;                                          // 32-byte null txid + 4-byte index
  const len = varint(raw, at); at += len.size;
  const scriptStart = at, scriptLen = len.value;
  const scriptSig = raw.slice(scriptStart * 2, (scriptStart + scriptLen) * 2);

  // Where the miner's bytes land, in the scriptSig's own coordinates.
  const gapStart = byteLen(coinb1) - scriptStart;
  const gapEnd = gapStart + byteLen(en1) + byteLen(en2);

  return {
    rawHex: raw,
    scriptSig,
    scriptSigLength: scriptLen,
    inputs: inputs.value,
    // The pool's bytes, either side of what the miner fills.
    poolPrefix: scriptSig.slice(0, gapStart * 2),
    poolSuffix: scriptSig.slice(gapEnd * 2),
    gap: { start: gapStart, end: gapEnd, extranonce1: en1, extranonce2Size: extranonce2Size || 0 },
    // Everything past the scriptSig: sequence, outputs, locktime.
    tailHex: raw.slice((scriptStart + scriptLen) * 2),
  };
}

// The template's outputs, counted and sized -- one output is an ordinary pool,
// many is a pool paying its miners on chain (OCEAN's TIDES), and the witness
// commitment is the one script a coinbase alone may carry.
export function readOutputs(tailHex) {
  let at = 4;                                        // the input's sequence
  const count = varint(tailHex, at); at += count.size;
  const outputs = [];
  for (let i = 0; i < count.value; i++) {
    const value = Number(BigInt('0x' + ((tailHex.slice(at * 2, at * 2 + 16).match(/../g) || []).reverse().join('') || '0')));
    at += 8;
    const len = varint(tailHex, at); at += len.size;
    const script = tailHex.slice(at * 2, (at + len.value) * 2);
    at += len.value;
    outputs.push({ value, script, witnessCommitment: script.startsWith('6a24aa21a9ed') });
  }
  return outputs;
}

// ─── the report ────────────────────────────────────────────────────────

function report(found) {
  const t = readTemplate(found);
  const decoded = decodeCoinbaseScriptSig(t.scriptSig);
  const who = identifyPool(decoded);
  const lines = [];

  lines.push(`${found.url}`);
  lines.push(`  job ${found.job.jobId}   ntime ${found.job.ntime}   nbits ${found.job.nbits}   version ${found.job.version}`);
  lines.push(`  extranonce1 ${found.extranonce1} (${byteLen(found.extranonce1)} bytes) + extranonce2 ${found.extranonce2Size} bytes`);
  lines.push(`  authorize: ${found.authorized === null ? 'not attempted' : found.authorized}${found.authorizeError ? ` (${found.authorizeError})` : ''}`);
  if (found.difficulty !== null) lines.push(`  difficulty ${found.difficulty}`);
  lines.push('');

  lines.push(`  scriptSig ${t.scriptSigLength} bytes — the pool wrote ${t.gap.start} before the gap and ${t.scriptSigLength - t.gap.end} after it`);
  lines.push(`  the gap sits at bytes ${t.gap.start}–${t.gap.end} (${t.gap.end - t.gap.start} bytes: extranonce1 then extranonce2)`);
  lines.push(`  ${t.gap.start <= 8 ? 'gap-early — the counters land straight behind the height, the pool writes after them'
    : 'gap-late — the pool writes its own bytes first and leaves the gap behind them'}`);
  lines.push('');

  lines.push(`  signature: ${who ? `${who.pool} — ${JSON.stringify(who.text)}` : 'none the table knows'}`);
  lines.push(`  shape:     ${shapeOf(decoded)}`);
  for (const f of decoded.fields) {
    const from = f.offset < t.gap.start ? 'pool' : f.offset >= t.gap.end ? 'pool' : 'MINER';
    const what = f.kind === 'height' ? `height ${f.height}`
      : f.kind === 'time' ? `template time ${f.unix} (${new Date(f.unix * 1000).toISOString()})`
        : f.kind === 'text' ? JSON.stringify(f.text)
          : f.kind === 'auxpow' ? `merged mining: aux root ${f.root.slice(0, 16)}…, ${f.merkleSize} chains`
            : f.kind === 'rsk' ? `Rootstock block ${f.rskBlockNumber}`
              : f.kind === 'hathor' ? 'Hathor commitment'
                : `${f.hex.length / 2} bytes${/^0+$/.test(f.hex) ? ' — all zero' : ''}`;
    lines.push(`    @${String(f.offset).padStart(3)}  ${from.padEnd(5)} ${f.kind.padEnd(7)} ${what}`);
  }
  lines.push('');

  const outs = readOutputs(t.tailHex);
  const paid = outs.filter((o) => !o.witnessCommitment);
  lines.push(`  outputs: ${outs.length} — ${paid.length} paying, ${outs.length - paid.length} commitment`);
  lines.push(`  total out ${(outs.reduce((n, o) => n + o.value, 0) / 1e8).toFixed(8)} ₿`);
  if (paid.length > 4) lines.push('  many payees — a pool paying its miners on chain rather than one address');
  return lines.join('\n');
}

// ─── the command ───────────────────────────────────────────────────────

const USAGE = `node tools/stratum-job.mjs <stratum-url> [options]

  --user NAME     the account name the pool expects (default "x")
  --pass WORD     the password, where a pool wants one (default "x")
  --timeout MS    how long to wait for a job (default 30000)
  --save FILE     write the job as fetched, for a later offline reading
  --job FILE      read a saved job instead of connecting
  --json          machine-readable output

Reads one job and hangs up. It never submits a share.
`;

export async function main(argv = process.argv.slice(2)) {
  const opts = { user: 'x', pass: 'x', timeout: 30000 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--user') opts.user = argv[++i];
    else if (a === '--pass') opts.pass = argv[++i];
    else if (a === '--timeout') opts.timeout = Number(argv[++i]);
    else if (a === '--save') opts.save = argv[++i];
    else if (a === '--job') opts.job = argv[++i];
    else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else rest.push(a);
  }
  if (opts.help || (!rest.length && !opts.job)) { process.stdout.write(USAGE); return; }

  const note = (s) => { if (!opts.json) process.stderr.write(`${s}\n`); };
  const found = opts.job
    ? JSON.parse(await readFile(opts.job, 'utf8'))
    : await fetchJob(rest[0], { user: opts.user, pass: opts.pass, timeout: opts.timeout, log: note });

  if (opts.save) { await writeFile(opts.save, JSON.stringify(found, null, 1)); note(`job written to ${opts.save}`); }

  if (opts.json) {
    const t = readTemplate(found);
    process.stdout.write(`${JSON.stringify({
      ...found,
      template: t,
      decoded: decodeCoinbaseScriptSig(t.scriptSig),
      signature: identifyPool(decodeCoinbaseScriptSig(t.scriptSig)),
      outputs: readOutputs(t.tailHex),
    }, null, 1)}\n`);
  } else {
    process.stdout.write(`${report(found)}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { process.stderr.write(`${e.message}\n`); process.exitCode = 1; });
}
