// Interactive demo on the homepage (#demo). Everything here is illustrative:
// the businesses are examples and the inquiry form is simulated in the browser. Nothing is sent anywhere.
(function () {
  'use strict';
  var root = document.querySelector('[data-demo]');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var steps = Array.prototype.slice.call(root.querySelectorAll('[data-step]'));
  var frame = root.querySelector('.dx-frame');
  var url = root.querySelector('.dx-url');
  var current = 'first';
  var programmatic = false;

  function panel() { return root.querySelector('.dx-site:not([hidden])'); }
  function scroller() { return panel().querySelector('.dx-scroll'); }

  function markRegion(key) {
    root.querySelectorAll('[data-region]').forEach(function (r) { r.classList.toggle('is-focus', r.dataset.region === key); });
  }

  function setStep(key, opts) {
    opts = opts || {};
    current = key;
    steps.forEach(function (b) {
      if (b.dataset.step === key) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    markRegion(key);
    if (opts.scroll === false) return;
    var sc = scroller();
    var region = sc.querySelector('[data-region="' + key + '"]');
    if (!region) return;
    programmatic = true;
    sc.scrollTo({ top: Math.max(0, region.offsetTop - 12), behavior: reduce.matches ? 'auto' : 'smooth' });
    window.setTimeout(function () { programmatic = false; }, reduce.matches ? 50 : 700);
  }

  // ----- Industry tabs (WAI-ARIA tabs pattern: arrows, Home/End, automatic activation) -----
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    if (url) url.textContent = panel().dataset.host || '';
    setStep(current);
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') n = tabs[0];
      else if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  // ----- Desktop / phone preview -----
  root.querySelectorAll('[data-view]').forEach(function (b) {
    if (b === frame) return;
    b.addEventListener('click', function () {
      root.querySelectorAll('.dx-view [data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      frame.dataset.view = b.dataset.view;
      setStep(current);
    });
  });

  // ----- Journey steps -----
  steps.forEach(function (b) { b.addEventListener('click', function () { setStep(b.dataset.step); }); });

  // Buttons inside the example site jump to its inquiry form.
  root.addEventListener('click', function (e) {
    var go = e.target.closest('[data-goto]');
    if (!go) return;
    setStep(go.dataset.goto);
    var input = panel().querySelector('.m-form input');
    if (input) window.setTimeout(function () { input.focus({ preventScroll: true }); }, reduce.matches ? 0 : 450);
  });

  // Scrolling the example site by hand keeps the journey in sync.
  root.querySelectorAll('.dx-scroll').forEach(function (sc) {
    var t;
    sc.addEventListener('scroll', function () {
      if (programmatic) return;
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        var regions = sc.querySelectorAll('[data-region]');
        var best = regions[0];
        regions.forEach(function (r) { if (r.offsetTop - sc.scrollTop <= sc.clientHeight * 0.35) best = r; });
        if (best && best.dataset.region !== current) setStep(best.dataset.region, { scroll: false });
      }, 120);
    }, { passive: true });
  });

  // ----- Simulated inquiry -----
  root.querySelectorAll('[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('input');
      var err = form.querySelector('.m-error');
      var site = form.closest('.dx-site');
      if (!name.value.trim()) {
        err.textContent = 'Add a name to try the demo inquiry.';
        name.setAttribute('aria-invalid', 'true');
        name.focus();
        return;
      }
      err.textContent = '';
      name.removeAttribute('aria-invalid');
      var who = name.value.trim().replace(/\s+/g, ' ').slice(0, 40);
      var choice = form.querySelector('select').value;
      var biz = site.querySelector('.m-logo').textContent;
      var sent = site.querySelector('.m-sent');
      sent.textContent = 'Got it, ' + who + '. On a real site, ' + biz + ' would have this request (' + choice + ') right now, and the reply below would go out automatically.';
      sent.hidden = false;
      var notify = site.querySelector('[data-notify]');
      if (notify) notify.textContent = 'New request from ' + who + ': ' + choice + '.';
      window.setTimeout(function () { setStep('after'); }, reduce.matches ? 0 : 500);
    });
  });

  markRegion(current);
})();
