// Wires every <form data-lead-form="<intent>"> to POST /api/lead.
// Forms are static HTML; this script only validates, sends and reports honestly:
//   - success is shown ONLY when the server confirms the CRM accepted the lead;
//   - "not connected" and "CRM failed" responses show an error with phone/email instead.
// The SMS consent text stored as proof is read from the checkbox's own <label>.
(function () {
  'use strict';
  var EMAIL_RE = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  var PHONE = '(774) 486-7776';
  var PHONE_TEL = '+17744867776';
  var EMAIL = 'colin@ironwebdigital.com';
  var loadedAt = Date.now();

  function normalizePhone(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length === 10) return '+1' + d;
    if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
    return null;
  }

  function setError(form, name, msg) {
    var c = form.querySelector('[name="' + name + '"]');
    if (!c) return;
    // An invalid field inside a collapsed "Add project details" disclosure must be visible.
    var d = msg && c.closest('details');
    if (d && !d.open) d.open = true;
    c.setAttribute('aria-invalid', msg ? 'true' : 'false');
    var slot = c.closest('.field') && c.closest('.field').querySelector('.field-error');
    if (slot) {
      slot.textContent = msg || '';
      if (!slot.id) slot.id = c.id + '-err';
      if (msg) c.setAttribute('aria-describedby', slot.id); else c.removeAttribute('aria-describedby');
    }
  }

  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.setAttribute('aria-invalid', 'false'); el.removeAttribute('aria-describedby'); });
    form.querySelectorAll('.field-error').forEach(function (el) { el.textContent = ''; });
    var s = form.querySelector('.form-status');
    s.textContent = ''; s.className = 'form-status';
  }

  function validate(form) {
    var errors = {};
    form.querySelectorAll('[required]').forEach(function (el) {
      var empty = el.type === 'checkbox' ? !el.checked : !String(el.value || '').trim();
      if (empty) errors[el.name] = el.dataset.error || 'This field is required.';
    });
    if (form.elements.email) form.elements.email.value = form.elements.email.value.trim().replace(/\.+$/, '');
    var email = form.elements.email && form.elements.email.value;
    if (email && !EMAIL_RE.test(email)) errors.email = 'Enter an email like name@example.com.';
    var phone = form.elements.phone && form.elements.phone.value.trim();
    if (phone && !normalizePhone(phone)) errors.phone = 'Enter a 10-digit US phone number, or leave it blank.';
    var sms = form.elements.smsConsent;
    if (sms && sms.checked && !normalizePhone(phone)) errors.phone = 'Add your mobile number to receive texts, or untick the text message box.';
    return errors;
  }

  function attribution() {
    try { return JSON.parse(sessionStorage.getItem('iw_attr') || '{}'); } catch (e) { return {}; }
  }

  function payload(form) {
    var fd = new FormData(form);
    var skip = { name: 1, email: 1, phone: 1, smsConsent: 1, bot_field: 1 };
    var answers = {};
    fd.forEach(function (v, k) { if (!skip[k]) { var t = String(v).trim(); if (t) answers[k] = t; } });
    var box = form.querySelector('input[name="smsConsent"]');
    var agreed = Boolean(box && box.checked);
    var label = agreed ? form.querySelector('label[for="' + box.id + '"]') : null;
    return {
      intent: form.dataset.leadForm,
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim().toLowerCase(),
      phone: normalizePhone(fd.get('phone')),
      answers: answers,
      consent: agreed ? { agreed: true, text: label.textContent.replace(/\s+/g, ' ').trim(), timestamp: new Date().toISOString() } : { agreed: false },
      bot_field: String(fd.get('bot_field') || ''),
      elapsedMs: Date.now() - loadedAt,
      pageUrl: location.href.split('#')[0],
      attribution: attribution(),
    };
  }

  var fallback = 'Call or text <a href="tel:' + PHONE_TEL + '">' + PHONE + '</a> or email <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function showStatus(form, kind, html) {
    var s = form.querySelector('.form-status');
    s.className = 'form-status is-' + kind;
    s.innerHTML = html;
  }

  async function submit(form) {
    if (form.dataset.busy === '1') return; // duplicate-submit guard
    clearErrors(form);
    var errors = validate(form);
    var keys = Object.keys(errors);
    if (keys.length) {
      keys.forEach(function (k) { setError(form, k, errors[k]); });
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    var button = form.querySelector('[type="submit"]');
    var label = button.innerHTML;
    var data = payload(form);
    form.dataset.busy = '1';
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending…';

    var res = null, body = {};
    try {
      res = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      try { body = await res.json(); } catch (e) { body = {}; }
    } catch (e) { res = null; }

    form.dataset.busy = '';
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.innerHTML = label;

    if (res && res.ok && body.ok === true) {
      var tpl = form.querySelector('template[data-success]');
      var wrap = document.createElement('div');
      wrap.className = 'form-success';
      wrap.setAttribute('role', 'status');
      var first = data.name.split(/\s+/)[0].replace(/[&<>"']/g, '');
      wrap.innerHTML = tpl.innerHTML.split('{firstName}').join(first);
      form.replaceWith(wrap);
      var h = wrap.querySelector('[tabindex="-1"]');
      if (h) h.focus();
      return;
    }
    if (res && res.status === 400 && body.errors) {
      Object.keys(body.errors).forEach(function (k) { setError(form, k, body.errors[k]); });
      showStatus(form, 'error', 'Check the highlighted fields and try again.');
      return;
    }
    if (res && body.code === 'not_connected') {
      showStatus(form, 'notice', '<strong>Nothing was sent.</strong> The online form isn\'t connected yet. ' + fallback +
        (isLocal ? '<br><small>Local preview: the server validated your entry and printed it to the terminal (stub mode).</small>' : ''));
      return;
    }
    if (res && res.status === 429) {
      showStatus(form, 'error', 'Too many attempts. Wait a few minutes, or ' + fallback.charAt(0).toLowerCase() + fallback.slice(1));
      return;
    }
    if (res && body.code === 'crm_failed') {
      showStatus(form, 'error', '<strong>Your message didn\'t go through</strong> because of a problem on our side. ' + fallback);
      return;
    }
    showStatus(form, 'error', '<strong>That didn\'t send.</strong> Check your connection and try again, or ' + fallback.charAt(0).toLowerCase() + fallback.slice(1));
  }

  // "Ask about this automation" links arrive as /contact/?interest=<key>#inquiry: preselect the service
  // and start the message so the visitor doesn't retype it. Visible, editable, nothing hidden.
  var INTERESTS = {
    'missed-call': 'Missed-call text-back', 'speed-to-lead': 'Instant inquiry response', 'follow-up': 'Follow-up sequences',
    reviews: 'Review requests', appointments: 'Appointment admin', 'local-search': 'Local search setup',
  };
  try {
    var interest = INTERESTS[new URLSearchParams(location.search).get('interest')];
    var inq = document.getElementById('inquiry');
    if (interest && inq && inq.tagName === 'FORM') {
      var svc = inq.querySelector('[name="service"]');
      var msg = inq.querySelector('[name="message"]');
      if (svc) svc.value = interest === 'Local search setup' ? 'Build' : 'Automations';
      if (msg && !msg.value) msg.value = "I'd like to know more about: " + interest + '.';
      var det = inq.querySelector('details');
      if (det) det.open = true;
    }
  } catch (e) { /* prefill is a convenience only */ }

  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(form); });
  });
})();
