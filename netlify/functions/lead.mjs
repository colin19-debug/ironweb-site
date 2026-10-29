// POST /api/lead: validates a website form submission, then sends it to the CRM.
// Response contract (the browser shows success ONLY for 200 { ok: true }):
//   200 { ok: true }                         CRM accepted the contact
//   400 { ok: false, errors }                validation failed
//   429 { ok: false, code: 'rate_limited' }
//   502 { ok: false, code: 'crm_failed' }    CRM rejected or unreachable; full lead logged for manual re-entry
//   503 { ok: false, code: 'not_connected' } CRM env vars missing (stub mode: logged only, nothing sent)
import { FORMS, REQUIRED_MESSAGES } from '../lib/forms-config.mjs';
import { ghlConfigured, sendToGHL, tagsFor } from '../lib/ghl.mjs';

// Domain labels must be real (no trailing or doubled dots): the CRM rejects anything looser with a 422.
const EMAIL_RE = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
// Visitors often end an email with a stray period ("name@gmail.com."); strip it rather than fail.
const cleanEmail = (v) => str(v, 200).replace(/\.+$/, '').toLowerCase();
const PHONE_RE = /^\+1\d{10}$/;
const MIN_FILL_MS = 2500; // faster than this is almost certainly a bot

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Best-effort per-instance rate limit (functions are stateless; this stops simple floods).
const hits = new Map();
function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 6;
}

export function validate(b) {
  const errors = {};
  const form = FORMS[b.intent];
  if (!form) return { intent: 'Unknown form.' };
  if (!str(b.name, 120)) errors.name = 'Enter your name.';
  if (!EMAIL_RE.test(cleanEmail(b.email))) errors.email = 'Enter a valid email address.';
  if (form.phone === 'required' && !b.phone) errors.phone = 'Enter your mobile number.';
  else if (b.phone && !PHONE_RE.test(str(b.phone, 20))) errors.phone = 'Enter a 10-digit US phone number.';
  const a = b.answers && typeof b.answers === 'object' ? b.answers : {};
  for (const k of form.required || []) if (!str(a[k], 300)) errors[k] = REQUIRED_MESSAGES[k] || 'This field is required.';
  Object.entries(form.choices || {}).forEach(([k, allowed]) => {
    if (a[k] && !allowed.includes(a[k])) errors[k] = 'Choose one of the options.';
  });
  const c = b.consent || {};
  if (form.consent === 'required' && c.agreed !== true) errors.smsConsent = 'Tick the box so we can text you.';
  if (c.agreed === true) {
    if (!b.phone) errors.phone = 'Add your mobile number to receive texts, or untick the text message box.';
    if (!str(c.text, 2000) || Number.isNaN(Date.parse(c.timestamp))) errors.smsConsent = 'Consent record is incomplete.';
  }
  return errors;
}

export default async (req, context) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ ok: false, error: 'Invalid JSON' }, 400); }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'Invalid body' }, 400);

  // Bots: honeypot filled or submitted implausibly fast. Drop silently (bots only, never humans).
  if (str(body.bot_field) || (typeof body.elapsedMs === 'number' && body.elapsedMs < MIN_FILL_MS)) {
    console.warn('[lead] dropped as spam', { honeypot: Boolean(str(body.bot_field)), elapsedMs: body.elapsedMs });
    return json({ ok: true });
  }
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || '';
  if (rateLimited(ip)) return json({ ok: false, code: 'rate_limited' }, 429);

  const errors = validate(body);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const form = FORMS[body.intent];
  const answers = {};
  for (const k of form.allowed) { const v = str(body.answers?.[k], k === 'message' ? 3000 : 300); if (v) answers[k] = v; }
  const [firstName, ...rest] = str(body.name, 120).split(/\s+/);
  const attribution = {};
  for (const [k, v] of Object.entries(body.attribution || {}).slice(0, 12)) if (typeof v === 'string' && v) attribution[k.slice(0, 40)] = v.slice(0, 300);

  const lead = {
    intent: body.intent,
    firstName,
    lastName: rest.join(' '),
    email: cleanEmail(body.email),
    phone: str(body.phone, 20) || null,
    answers,
    consent: body.consent?.agreed === true
      ? { agreed: true, text: str(body.consent.text, 2000), timestamp: body.consent.timestamp }
      : { agreed: false },
    pageUrl: str(body.pageUrl, 500),
    attribution,
    receivedAt: new Date().toISOString(),
  };

  if (!ghlConfigured()) {
    console.log(`[lead] STUB (CRM not configured, nothing sent). Tags would be: ${tagsFor(lead).join(', ')}\n${JSON.stringify(lead, null, 2)}`);
    return json({ ok: false, code: 'not_connected' }, 503);
  }
  try {
    const r = await sendToGHL(lead);
    console.log(`[lead] sent to CRM: contact ${r.contactId} (${r.isNew ? 'new' : 'existing'}), tags: ${r.tags.join(', ')}, opportunity: ${r.opportunity}`);
    return json({ ok: true });
  } catch (err) {
    // A CRM validation error on a visitor-fixable field is shown on that field, not as a server failure.
    const msg = JSON.stringify(err.data?.message || '');
    if (err.status === 422 && /email/i.test(msg)) {
      console.warn(`[lead] CRM rejected email: ${msg}`);
      return json({ ok: false, errors: { email: 'Check your email address and try again.' } }, 400);
    }
    if (err.status === 422 && /phone/i.test(msg)) {
      console.warn(`[lead] CRM rejected phone: ${msg}`);
      return json({ ok: false, errors: { phone: 'Check your phone number and try again.' } }, 400);
    }
    console.error(`[lead] CRM FAILED: ${err.message} ${JSON.stringify(err.data || {})}\nLEAD: ${JSON.stringify(lead)}`);
    return json({ ok: false, code: 'crm_failed' }, 502);
  }
};

export const config = { path: '/api/lead' };
