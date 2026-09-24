// SPDX-License-Identifier: MIT OR Apache-2.0
/* Shared masthead chrome — one script for the behaviors every page repeated
 * inline:
 *
 *   - Service worker registration, with a recheck for a new build on every
 *     return to the foreground (an installed app can resume from the
 *     background for days without a navigation, never rechecking otherwise).
 *   - The Update affordance: the worker's stale-while-revalidate serves the
 *     page from cache, so a fresh deploy is invisible until the NEXT visit.
 *     When background revalidation caches a newer build, the worker posts
 *     update-available to every open page; a brand-new worker taking over
 *     (controllerchange, on a page that already had one) means the same
 *     thing. Either way the Update button appears; one tap reloads onto the
 *     freshly cached build. Releases are stamped with their deploy time
 *     (version.json, CalVer), so when both stamps are known the button also
 *     says how far behind the running copy is ("Update · 3 days behind").
 *   - The Install affordance: reveal an in-page Install button when the
 *     browser offers to install the PWA, and drive the native prompt from it
 *     — so installing is discoverable without hunting through the browser
 *     menu. Stays hidden when already installed (running standalone) or on
 *     browsers that don't support prompting (iOS Safari installs via
 *     Share → Add to Home Screen instead).
 *
 * Load with a plain <script src="./btc-chrome.js"></script> in <head>: the
 * listeners must register eagerly (beforeinstallprompt can fire before
 * DOMContentLoaded). The buttons are affordances only this script can drive,
 * so it owns their markup too — they're appended to `.masthead .title`, the
 * book title's own line, once the DOM is ready; the static masthead stays
 * plain HTML. Styles in btc-chrome.css.
 */
(function () {
  'use strict';

  let installBtn = null;
  let updateBtn = null;

  // The chain the page reads: the one its address names, or mainnet -- the
  // same rule as btc-network.js, which every module reads; this script is
  // classic and cannot import it, so it names the key and the networks itself
  // (tools/network.test.mjs keeps the two in step). It chooses nothing: the
  // reader chooses in Settings (bitcoin-book.html). The chain read is
  // remembered for the front door alone (index.html), so reopening the book
  // returns to it. Marked on the root at once, so a test chain is set apart
  // before the page paints.
  const NETWORK_KEY = 'glossia-btc-network';
  const NETWORKS = [['mainnet', 'Mainnet'], ['testnet4', 'Testnet4']];
  const isNetwork = (id) => NETWORKS.some((n) => n[0] === id);
  const network = (() => {
    try {
      const asked = new URLSearchParams(location.search).get('network');
      if (isNetwork(asked)) return asked;
    } catch (_) { /* no address to read */ }
    return 'mainnet';
  })();
  try { localStorage.setItem(NETWORK_KEY, network); } catch (_) { /* the front door opens on mainnet */ }
  document.documentElement.setAttribute('data-network', network);

  // Off mainnet, every link to one of the book's own pages names the chain
  // too, so "Copy link" on a passage, a citation or a contents entry gives an
  // address that opens on this chain for whoever it is sent to. The links are
  // built in a hundred places, in markup and in script, so they are named here
  // once rather than at each: every link the page holds, and every one it adds
  // or re-points later. Only same-origin links to a page are touched -- never a
  // fragment on this page, another site, or a file such as the passages'
  // markdown -- and the rule is withChain's (btc-network.js), written again
  // here because this script cannot import it; tools/network.test.mjs holds
  // the two to the same answers. On mainnet nothing is observed or changed.
  const chainHref = (href) => {
    const hashAt = href.indexOf('#');
    const base = hashAt < 0 ? href : href.slice(0, hashAt);
    const hash = hashAt < 0 ? '' : href.slice(hashAt);
    if (/[?&]network=/.test(base)) return href;
    return base + (base.indexOf('?') < 0 ? '?' : '&') + 'network=' + network + hash;
  };
  const nameChain = (a) => {
    const raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return;
    let target;
    try { target = new URL(raw, location.href); } catch (_) { return; }
    if (target.origin !== location.origin || !/(\.html|\/)$/.test(target.pathname)) return;
    const named = chainHref(raw);
    if (named !== raw) a.setAttribute('href', named);
  };
  if (network !== 'mainnet' && typeof MutationObserver === 'function') {
    const sweep = (node) => {
      if (node.nodeType !== 1) return;
      if (node.tagName === 'A') nameChain(node);
      node.querySelectorAll('a[href]').forEach(nameChain);
    };
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'attributes') { if (r.target.tagName === 'A') nameChain(r.target); }
        else r.addedNodes.forEach(sweep);
      }
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
    sweep(document.documentElement);
  }
  // The same rule for a classic script that navigates by assigning an address
  // (the appendix's page turns): modules import withChain instead. Returns a
  // mainnet address unchanged.
  window.__bookChain = (href) => (network === 'mainnet' ? href : chainHref(href));

  let updateReady = false;
  let updateBehind = null; // e.g. '3 days' — how far behind the running build is

  const reflectUpdate = () => {
    if (!updateBtn) return;
    updateBtn.textContent = updateBehind ? 'Update · ' + updateBehind + ' behind' : 'Update';
    updateBtn.setAttribute('aria-label', updateBehind
      ? 'A new version is ready — this copy is ' + updateBehind + ' behind. Reload to update.'
      : 'A new version is ready — reload to update');
    updateBtn.classList.toggle('show', updateReady);
  };

  // Releases are stamped with CalVer built from their UTC deploy time
  // (YYYY.0M.0D.HH, with .MM appended for a second release in the same hour;
  // see the deploy workflow), so two stamps are enough to say how out of
  // date the running copy is: the gap is latest minus current, as time.
  const versionTime = (v) => {
    const m = /^(\d{4})\.(\d{2})\.(\d{2})\.(\d{2})(?:\.(\d{2}))?$/.exec(v || '');
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], m[5] ? +m[5] : 0) : NaN;
  };
  const describeBehind = (current, latest) => {
    const ms = versionTime(latest) - versionTime(current);
    if (!isFinite(ms) || ms <= 0) return null;
    const min = Math.round(ms / 60000);
    if (min < 60) return min + ' min';
    const hr = Math.round(min / 60);
    if (hr < 48) return hr + ' hr';
    return Math.round(hr / 24) + ' days';
  };

  // The version this page is actually running: version.json read through the
  // worker's cache-first serving, captured at load while cache and page still
  // belong to the same build. The worker never revalidates that file outside
  // a whole-shell refresh, so even a reader who ignores the Update button
  // through several deploys keeps an accurate baseline.
  let runningVersion = null;
  const fetchVersion = () =>
    fetch('./version.json').then((r) => (r.ok ? r.json() : null))
      .then((j) => (j && j.version) || null).catch(() => null);
  // Any page can carry an empty [data-app-version] element (the cover's
  // edition line does); it gets the running stamp once that's known.
  const reflectVersion = () => {
    if (!runningVersion) return;
    document.querySelectorAll('[data-app-version]').forEach((el) => { el.textContent = 'v' + runningVersion; });
  };
  fetchVersion().then((v) => {
    runningVersion = v;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', reflectVersion);
    } else {
      reflectVersion();
    }
  });

  if ('serviceWorker' in navigator) {
    // The deploy check: ask the worker to compare the network's release
    // stamp against the cached shell's (sw.js, check-shell). Detection no
    // longer waits for a shell file to happen to revalidate -- on the
    // book's single-navigation pages that could be never -- so a deploy
    // announces itself within moments of arriving or returning to the
    // page. Throttled: one check per minute is plenty for a poll whose
    // answer changes at deploy speed.
    var lastDeployCheck = 0;
    const checkForDeploy = () => {
      const ctl = navigator.serviceWorker.controller;
      if (!ctl || Date.now() - lastDeployCheck < 60000) return;
      lastDeployCheck = Date.now();
      ctl.postMessage({ type: 'check-shell' });
    };

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            reg.update().catch(() => {});
            checkForDeploy();
          }
        });
        // First check shortly after load: past the install rush, soon
        // enough that a reload lands on a page that already knows.
        setTimeout(checkForDeploy, 3000);
      }).catch((e) => console.warn('SW registration failed:', e));
    });

    const showUpdate = () => { updateReady = true; reflectUpdate(); };
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'update-available') {
        updateBehind = describeBehind(runningVersion || e.data.current, e.data.latest) || updateBehind;
        showUpdate();
      }
    });
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return;
      // A brand-new worker took over: its install already cached the new
      // build, so a fresh read of version.json is the latest release.
      fetchVersion().then((latest) => {
        updateBehind = describeBehind(runningVersion, latest) || updateBehind;
        showUpdate();
      });
    });
  }

  const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone === true;
  let deferredPrompt = null;
  const reflectInstall = () => { if (installBtn) installBtn.classList.toggle('show', !!deferredPrompt); };
  if (!standalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      reflectInstall();
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      reflectInstall();
    });
  }

  const wire = () => {
    const title = document.querySelector('.masthead .title');
    if (!title) return;

    installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.id = 'install-btn';
    installBtn.className = 'install-btn';
    installBtn.setAttribute('aria-label', 'Install the Book of Bitcoin as an app');
    installBtn.textContent = 'Install';
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      reflectInstall();
    });

    updateBtn = document.createElement('button');
    updateBtn.type = 'button';
    updateBtn.id = 'update-btn';
    updateBtn.className = 'update-btn';
    updateBtn.addEventListener('click', () => location.reload());
    // Label and aria-label are owned by reflectUpdate (called below), which
    // also renders how far behind the running copy is once that's known.

    // Off mainnet, a quiet label says which chain the page is reading, so a
    // test chain is never taken for the real one. It is not a control: the
    // chain is chosen in the reading page's Settings.
    if (network !== 'mainnet') {
      const badge = document.createElement('span');
      badge.className = 'network-badge';
      badge.textContent = NETWORKS.find((n) => n[0] === network)[1];
      badge.title = 'The chain this page reads — changed in Settings';
      title.appendChild(badge);
    }
    title.appendChild(installBtn);
    title.appendChild(updateBtn);
    reflectInstall();
    reflectUpdate();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
