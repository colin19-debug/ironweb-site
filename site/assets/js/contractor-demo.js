// Contractor Core interactive demo (/contractor-demo/). Works guided (on the phone) or self-guided.
// Honesty rules: a backend step is only shown as "Confirmed" when /api/contractor-demo says so. Workflow actions
// (text, owner alert) are never shown as delivered. In preview mode everything behind the scenes is "Simulated".
(function () {
  'use strict';
  var root = document.querySelector('[data-cd]');
  if (!root) return;

  // ---------- analytics: privacy-conscious event layer (no PII, no pixels) ----------
  // Pushes to window.dataLayer and emits a DOM event. Ad platforms are NOT loaded; if one is approved later,
  // set window.IW_FB_ENABLED = true after loading it and these map to standard Meta events.
  var FB_MAP = {
    demo_page_viewed: 'ViewContent', estimate_form_submitted: 'Lead', consultation_cta_clicked: 'Contact',
    consultation_booked: 'Schedule', demo_completed: 'CompleteRegistration',
  };
  var sent = {};
  function track(name, props, once) {
    if (once && sent[name]) return;
    sent[name] = true;
    var payload = Object.assign({ event: 'iw_' + name, demo: 'contractor-core', ts: Date.now() }, props || {});
    try { (window.dataLayer = window.dataLayer || []).push(payload); } catch (e) { /* ignore */ }
    try { document.dispatchEvent(new CustomEvent('iw:track', { detail: payload })); } catch (e) { /* ignore */ }
    if (window.IW_FB_ENABLED === true && typeof window.fbq === 'function' && FB_MAP[name]) {
      window.fbq('track', FB_MAP[name], { content_name: 'contractor_demo' });
    }
  }
  window.iwTrack = track;
  // A booking integration must dispatch this ONLY after a confirmed appointment (a button click is not a booking).
  document.addEventListener('iw:booking-confirmed', function () { track('consultation_booked', null, true); });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var form = root.querySelector('[data-cd-form]');
  var status = form.querySelector('.cd-status');
  var prevBtn = root.querySelector('[data-cd-prev]');
  var nextBtn = root.querySelector('[data-cd-next]');
  var hint = root.querySelector('[data-cd-hint]');
  var tabs = root.querySelectorAll('.cd-progress [data-goto]');
  var panels = root.querySelectorAll('[data-panel]');
  var state = { step: 1, done: false, result: null, config: { mode: 'preview', receptionist: { enabled: false } } };
  var loadedAt = Date.now();

  track('demo_page_viewed', null, true);

  // ---------- config (mode banner, receptionist, booking) ----------
  fetch('/api/contractor-demo', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.config) applyConfig(d.config); })
    .catch(function () { /* stay in preview */ });

  function applyConfig(c) {
    state.config = c;
    var banner = root.querySelector('[data-cd-mode]');
    if (c.mode === 'live') {
      banner.innerHTML = '<strong>Live demo.</strong> Your request goes into a demo system, kept separate from real customer work. Steps we can confirm are marked Confirmed; anything still being handled by the automation is marked Pending.';
      banner.classList.add('is-live');
    }
    // External calendar opens in a new tab so the visitor keeps their place in the demo.
    if (c.bookingUrl) document.querySelectorAll('[data-cd-book]').forEach(function (a) { a.href = c.bookingUrl; a.target = '_blank'; a.rel = 'noopener'; });
    var box = root.querySelector('[data-cd-recep]');
    if (c.receptionist && c.receptionist.enabled && box) {
      box.innerHTML =
        '<a class="btn btn-primary" href="tel:' + c.receptionist.tel + '" data-cd-call>' +
        '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/></svg>' +
        ' Call the AI Receptionist</a>' +
        '<p class="cd-recep-num">Demo line: <strong>' + c.receptionist.display + '</strong></p>' +
        '<p class="cd-recep-note">On a computer? Call this number from your phone. You\'ll talk to an AI receptionist for the demo business, not a real company.</p>';
      box.querySelector('[data-cd-call]').addEventListener('click', function () { track('receptionist_call_clicked'); });
    }
  }

  // ---------- steps ----------
  function setStep(n, opts) {
    opts = opts || {};
    if (n > 1 && !state.done) return;
    state.step = n;
    root.dataset.step = String(n);
    panels.forEach(function (p) { p.hidden = p.dataset.panel !== String(n); });
    tabs.forEach(function (t) {
      var s = Number(t.dataset.goto);
      t.disabled = s > 1 && !state.done;
      if (s === n) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
      t.classList.toggle('is-done', state.done && s < n);
    });
    prevBtn.disabled = n === 1;
    nextBtn.disabled = n === 3 || !state.done;
    nextBtn.hidden = n === 3;
    hint.textContent = !state.done ? 'Submit the estimate request to continue.'
      : n === 3 ? 'That\'s the full tour. Restart any time, or book a consultation below.' : '';
    if (n === 3) showPipeline();
    if (!opts.silent) {
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      var h = root.querySelector('[data-panel="' + n + '"] .cd-h');
      if (h) h.focus({ preventScroll: true });
    }
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { setStep(Number(t.dataset.goto)); }); });
  prevBtn.addEventListener('click', function () { setStep(Math.max(1, state.step - 1)); });
  nextBtn.addEventListener('click', function () { setStep(Math.min(3, state.step + 1)); });
  root.querySelectorAll('[data-cd-restart]').forEach(function (b) { b.addEventListener('click', restart); });
  document.querySelectorAll('[data-cd-start]').forEach(function (a) { a.addEventListener('click', function () { track('demo_started', { via: 'hero' }, true); }); });

  function restart() {
    form.reset();
    form.dataset.busy = '';
    status.textContent = '';
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    form.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
    state.done = false;
    state.result = null;
    loadedAt = Date.now();
    root.querySelectorAll('[data-ev]').forEach(function (li) { li.className = ''; li.querySelector('[data-badge]').textContent = ''; });
    var card = root.querySelector('[data-cd-card]');
    card.hidden = true;
    card.classList.remove('is-in');
    sent.demo_completed = false;
    sent.pipeline_reveal_viewed = false;
    setStep(1);
  }

  // ---------- form ----------
  var EMAIL_RE = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  function phoneE164(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length === 10) return '+1' + d;
    if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
    return null;
  }
  function setError(name, msg) {
    var el = form.elements[name];
    if (!el) return;
    var slot = el.closest('.field') && el.closest('.field').querySelector('.field-error');
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    if (slot) { slot.textContent = msg || ''; if (!slot.id) slot.id = el.id + '-err'; }
    if (msg && slot) el.setAttribute('aria-describedby', slot.id); else el.removeAttribute('aria-describedby');
  }
  form.addEventListener('focusin', function () { track('demo_started', { via: 'form' }, true); });
  form.elements.smsConsent.addEventListener('change', function (e) { if (e.target.checked) track('sms_consent_selected'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.dataset.busy === '1') return; // duplicate-submit guard
    status.textContent = '';
    status.className = 'cd-status';
    var errors = {};
    ['firstName', 'lastName', 'phone', 'service', 'description'].forEach(function (n) {
      setError(n, '');
      if (!String(form.elements[n].value || '').trim()) errors[n] = form.elements[n].dataset.error;
    });
    setError('email', '');
    form.elements.email.value = form.elements.email.value.trim().replace(/\.+$/, '');
    if (form.elements.phone.value.trim() && !phoneE164(form.elements.phone.value)) errors.phone = 'Enter a 10-digit phone number.';
    if (form.elements.email.value && !EMAIL_RE.test(form.elements.email.value)) errors.email = 'Enter a valid email address, or leave it blank.';
    var keys = Object.keys(errors);
    if (keys.length) {
      keys.forEach(function (k) { setError(k, errors[k]); });
      form.elements[keys[0]].focus();
      return;
    }
    var box = form.elements.smsConsent;
    var label = form.querySelector('label[for="' + box.id + '"]');
    var payload = {
      submissionId: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'cd-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12),
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      phone: phoneE164(form.elements.phone.value),
      email: form.elements.email.value.trim(),
      service: form.elements.service.value,
      description: form.elements.description.value.trim(),
      consent: box.checked ? { agreed: true, text: label.textContent.replace(/\s+/g, ' ').trim(), timestamp: new Date().toISOString() } : { agreed: false },
      bot_field: form.elements.bot_field.value,
      elapsedMs: Date.now() - loadedAt,
    };
    var btn = form.querySelector('[type="submit"]');
    var original = btn.textContent;
    form.dataset.busy = '1';
    btn.disabled = true;
    btn.textContent = 'Sending…';

    fetch('/api/contractor-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { r: r, d: d }; }); })
      .then(function (x) { finish(x.r, x.d, payload); })
      .catch(function () { finish(null, {}, payload); });

    function finish(r, d, p) {
      form.dataset.busy = '';
      btn.disabled = false;
      btn.textContent = original;
      if (r && r.ok && d.ok === true) {
        state.done = true;
        state.result = d;
        state.firstName = d.firstName || p.firstName;
        state.service = p.service;
        track('estimate_form_submitted', { mode: d.mode, service: p.service, sms_consent: Boolean(d.consent) });
        renderEvents(d);
        setStep(2);
        return;
      }
      status.classList.add('is-error');
      if (r && r.status === 400 && d.errors) {
        Object.keys(d.errors).forEach(function (k) { setError(k, d.errors[k]); });
        status.textContent = 'Check the highlighted fields and try again.';
      } else if (r && r.status === 429) {
        status.textContent = 'Too many demo requests from this connection. Wait a few minutes and try again.';
      } else if (r && d.code === 'crm_failed') {
        status.textContent = d.partial
          ? 'The demo system stopped partway through. Your contact details may have been saved, but the request didn\'t finish and no text will be sent. Try again in a minute.'
          : 'The demo system didn\'t accept the request just now. Nothing was created. Try again in a minute.';
      } else {
        status.textContent = 'That didn\'t send. Check your connection and try again.';
      }
    }
  });

  // ---------- step 2: event sequence ----------
  var LABEL = { confirmed: 'Confirmed', pending: 'Pending', simulated: 'Simulated', skipped: 'Skipped' };
  function renderEvents(d) {
    var byKey = {};
    (d.events || []).forEach(function (ev) { byKey[ev.key] = ev; });
    var items = root.querySelectorAll('[data-ev]');
    items.forEach(function (li, i) {
      var ev = byKey[li.dataset.ev] || { status: 'simulated' };
      var badge = li.querySelector('[data-badge]');
      li.className = 'is-' + ev.status;
      badge.className = 'cd-badge is-' + ev.status;
      badge.textContent = ev.status === 'skipped' && ev.detail === 'not_opted_in' ? 'Skipped: not opted in' : LABEL[ev.status] || ev.status;
      if (!reduce) { li.classList.add('is-hidden'); setTimeout(function () { li.classList.remove('is-hidden'); }, 200 + i * 380); }
    });
    root.querySelectorAll('[data-cd-first]').forEach(function (el) { el.textContent = state.firstName; });
    var sms = byKey.sms ? byKey.sms.status : 'simulated';
    var cap = root.querySelector('[data-cd-sms-cap]');
    cap.textContent = sms === 'pending'
      ? 'This is the kind of reply the system sends. Your real text has been handed to the automation; delivery isn\'t confirmed here.'
      : sms === 'skipped'
        ? 'Example message. You didn\'t opt in to texts, so nothing was sent.'
        : 'Example message. No text was sent.';
  }

  // ---------- step 3: pipeline reveal ----------
  function showPipeline() {
    var card = root.querySelector('[data-cd-card]');
    if (!state.result) return;
    var opp = (state.result.events || []).filter(function (e) { return e.key === 'opportunity'; })[0];
    var st = opp ? opp.status : 'simulated';
    card.querySelector('[data-cd-card-name]').textContent = state.firstName || 'Demo customer';
    card.querySelector('[data-cd-card-svc]').textContent = (state.service || 'Estimate') + ' estimate';
    var b = card.querySelector('[data-cd-card-badge]');
    b.className = 'cd-badge is-' + st;
    b.textContent = st === 'confirmed' ? 'Confirmed in CRM' : st === 'pending' ? 'Pending' : 'Simulated';
    card.hidden = false;
    if (reduce) card.classList.add('is-in');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { card.classList.add('is-in'); }); });
    track('pipeline_reveal_viewed', { mode: state.result.mode }, true);
  }

  // Demo completed = reached step 3 and the conversion section came into view.
  var conv = document.querySelector('.cd-convert');
  if (conv && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && state.step === 3) track('demo_completed', null, true);
    }, { threshold: 0.4 }).observe(conv);
  }
  document.querySelectorAll('[data-cd-book]').forEach(function (a) {
    a.addEventListener('click', function () { track('consultation_cta_clicked', { step: state.step }); });
  });

  setStep(1, { silent: true });
})();
