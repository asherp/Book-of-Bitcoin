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
 *     freshly cached build.
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
  const reflectUpdate = () => { if (updateBtn) updateBtn.classList.toggle('show', updateReady); };

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
      if (e.data && e.data.type === 'update-available') showUpdate();
    });
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) showUpdate(); });
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
    updateBtn.setAttribute('aria-label', 'A new version is ready — reload to update');
    updateBtn.textContent = 'Update';
    updateBtn.addEventListener('click', () => location.reload());

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
