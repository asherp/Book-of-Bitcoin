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
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
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
