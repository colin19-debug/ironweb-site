// POST /api/contractor-demo  : estimate request from the Contractor Core interactive demo (/contractor-demo/).
// GET  /api/contractor-demo  : public demo config (mode, receptionist availability, booking URL). No secrets.
//
// Safety model (see netlify/lib/contractor-demo-config.mjs):
// - PREVIEW (default): validate, record nothing, return events labelled "simulated". No CRM calls.
// - LIVE (CONTRACTOR_DEMO_LIVE=true): find the contact by phone/email (existing contacts keep their name and source;
//   new ones are created), apply the isolation tag `iw-contractor-demo` FIRST, add a note with the consent record,
//   then make sure there is ONE open opportunity in the demo pipeline's New Lead stage (reuse an open one).
// - Creating the opportunity starts DEMO - 01 (texts only contacts with BOTH demo tags; gated by its publish state).
// - WORKFLOWS (CONTRACTOR_DEMO_TRIGGER_WORKFLOWS=true, live only, normally false): also add `new lead - website`
//   (DEMO - 00). Only done when the visitor gave SMS consent.
// The response never claims an SMS was delivered or an alert was sent: workflow actions are reported as "pending".
import { ghlCall } from '../lib/ghl.mjs';

// Opportunity endpoints use the documented 2021-07-28 contract (location_id / pipeline_id / contact_id on search).
// Under the default 'v3' header, search rejected those names with a 422 (first live test, 2026-10-27).
const OPP_VERSION = '2021-07-28';
const oppCall = (method, path, body) => ghlCall(method, path, body, OPP_VERSION);
import {
  demoConfig, publicConfig, DEMO_TAG, TRIGGER_TAG, DEMO_CONSENT_TAG, DEMO_SOURCE, DEMO_SERVICES, NEW_LEAD_STAGE_NAME,
} from '../lib/contractor-demo-config.mjs';

const PHONE_RE = /^\+1\d{10}$/;
const EMAIL_RE = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
const ID_RE = /^[A-Za-z0-9-]{16,64}$/;
const MIN_FILL_MS = 2500;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Best-effort, per function instance.
const hits = new Map();
function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}
// Duplicate protection: same submissionId (double click / retry) or same phone within 2 minutes returns the first result.
const seen = new Map();
function remember(key, value) {
  seen.set(key, { at: Date.now(), value });
  if (seen.size > 2000) for (const [k, v] of seen) if (Date.now() - v.at > 10 * 60 * 1000) seen.delete(k);
}
function recall(key, maxAgeMs) {
  const hit = seen.get(key);
  return hit && Date.now() - hit.at < maxAgeMs ? hit.value : null;
}

export function validate(b) {
  const errors = {};
  if (!str(b.firstName, 60)) errors.firstName = 'Enter a first name.';
  if (!str(b.lastName, 60)) errors.lastName = 'Enter a last name.';
  if (!PHONE_RE.test(str(b.phone, 20))) errors.phone = 'Enter a 10-digit US phone number.';
  const email = str(b.email, 200).replace(/\.+$/, '');
  if (email && !EMAIL_RE.test(email)) errors.email = 'Enter a valid email address, or leave it blank.';
  if (!DEMO_SERVICES.includes(b.service)) errors.service = 'Choose a service.';
  if (str(b.description, 1200).length < 3) errors.description = 'Add a short project description.';
  if (!ID_RE.test(str(b.submissionId, 64))) errors.submissionId = 'Missing submission id.';
  const c = b.consent || {};
  if (c.agreed === true && (!str(c.text, 2000) || Number.isNaN(Date.parse(c.timestamp)))) errors.smsConsent = 'Consent record is incomplete.';
  return errors;
}

// "New Lead" stage id: from env, or looked up once per function instance by name.
let stageCache = null;
export function resetStageCache() { stageCache = null; }
async function newLeadStageId(cfg) {
  if (cfg.newLeadStageId) return cfg.newLeadStageId;
  if (stageCache && stageCache.pipelineId === cfg.pipelineId) return stageCache.id;
  const data = await oppCall('GET', `/opportunities/pipelines?locationId=${encodeURIComponent(process.env.GHL_LOCATION_ID)}`);
  const pipe = (data.pipelines || []).find((p) => p.id === cfg.pipelineId);
  const stage = pipe && (pipe.stages || []).find((st) => String(st.name).trim().toLowerCase() === NEW_LEAD_STAGE_NAME.toLowerCase());
  if (!stage) throw Object.assign(new Error('New Lead stage not found in the demo pipeline'), { status: 404 });
  stageCache = { pipelineId: cfg.pipelineId, id: stage.id };
  return stage.id;
}

// Find an existing contact by phone/email without changing it.
async function findContact(lead) {
  const q = new URLSearchParams({ locationId: process.env.GHL_LOCATION_ID, number: lead.phone });
  if (lead.email) q.set('email', lead.email);
  const data = await ghlCall('GET', `/contacts/search/duplicate?${q}`);
  return data?.contact?.id || null;
}

const ev = (key, status, detail) => ({ key, status, ...(detail ? { detail } : {}) });

function log(entry, level = 'log') {
  // Structured and PII-free: no names, phone numbers, emails or descriptions.
  console[level](JSON.stringify({ evt: 'contractor_demo', ...entry }));
}

function crmMessage(err) {
  const m = err?.data?.message ?? err?.data?.msg ?? err?.data?.error ?? err?.message ?? '';
  return String(Array.isArray(m) ? m.join('; ') : m)
    .replace(/[^\s@]+@[^\s@]+/g, '[email]').replace(/\+?\d[\d\s().-]{6,}\d/g, '[number]').slice(0, 200);
}

export default async (req, context) => {
  if (req.method === 'GET') return json({ ok: true, config: publicConfig() });
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  const started = Date.now();
  const requestId = Math.random().toString(36).slice(2, 10);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: 'Invalid JSON' }, 400); }
  if (!b || typeof b !== 'object') return json({ ok: false, error: 'Invalid body' }, 400);

  if (str(b.bot_field) || (typeof b.elapsedMs === 'number' && b.elapsedMs < MIN_FILL_MS)) {
    log({ requestId, outcome: 'dropped_spam' });
    return json({ ok: true, mode: 'preview', events: [] });
  }
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || '';
  if (rateLimited(ip)) return json({ ok: false, code: 'rate_limited' }, 429);

  const errors = validate(b);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const submissionId = str(b.submissionId, 64);
  const phone = str(b.phone, 20);
  const dup = recall(`id:${submissionId}`, 10 * 60 * 1000) || recall(`ph:${phone}`, 2 * 60 * 1000);
  if (dup) return json({ ...dup, duplicate: true });

  const cfg = demoConfig();
  const consent = b.consent?.agreed === true
    ? { agreed: true, text: str(b.consent.text, 2000), timestamp: b.consent.timestamp, recordedAt: new Date().toISOString() }
    : { agreed: false };
  const lead = {
    firstName: str(b.firstName, 60),
    lastName: str(b.lastName, 60),
    phone,
    email: str(b.email, 200).replace(/\.+$/, '').toLowerCase(),
    service: b.service,
    description: str(b.description, 1200),
  };

  let result;
  if (!cfg.live) {
    // PREVIEW: nothing is stored or sent. Every backend step is reported as simulated.
    result = {
      ok: true,
      mode: 'preview',
      firstName: lead.firstName,
      consent: consent.agreed,
      events: [
        ev('submitted', 'confirmed'),
        ev('contact', 'simulated'),
        ev('opportunity', 'simulated'),
        ev('sms', consent.agreed ? 'simulated' : 'skipped', consent.agreed ? null : 'not_opted_in'),
        ev('owner_alert', 'simulated'),
      ],
    };
  } else {
    const events = [ev('submitted', 'confirmed')];
    let step = 'start';
    let saved = false;
    try {
      // 1) Contact: existing contacts are matched by phone/email and left as they are (no name/source overwrite).
      step = 'contact_search';
      let contactId = await findContact(lead);
      const existing = Boolean(contactId);
      if (!contactId) {
        step = 'contact_create';
        const created = await ghlCall('POST', '/contacts/', {
          locationId: process.env.GHL_LOCATION_ID,
          firstName: lead.firstName,
          lastName: lead.lastName,
          phone: lead.phone,
          ...(lead.email ? { email: lead.email } : {}),
          source: DEMO_SOURCE,
        });
        contactId = created?.contact?.id || created?.id;
      }
      if (!contactId) throw new Error('no contact id');

      // 2) Isolation tag BEFORE anything that can start a workflow.
      step = 'tags';
      saved = true; // from here on, something may already exist in the CRM
      await ghlCall('POST', `/contacts/${contactId}/tags`, { tags: consent.agreed ? [DEMO_TAG, DEMO_CONSENT_TAG] : [DEMO_TAG] });
      step = 'note';
      await ghlCall('POST', `/contacts/${contactId}/notes`, {
        body: [
          'Contractor Core interactive demo submission (fictional business: Summit Home Services).',
          `Name entered: ${lead.firstName} ${lead.lastName}${lead.email ? ` <${lead.email}>` : ''}`,
          `Service: ${lead.service}`,
          `Project: ${lead.description}`,
          consent.agreed ? `SMS consent: YES at ${consent.timestamp}\n"${consent.text}"` : 'SMS consent: not given',
          `Received ${consent.recordedAt || new Date().toISOString()}`,
        ].join('\n'),
      });
      events.push(ev('contact', 'confirmed', existing ? 'existing' : 'created'));

      // 3) Opportunity: always exactly one open card in the demo pipeline. Reuse an open one if it exists.
      step = 'opportunity_search';
      const found = await oppCall('GET', `/opportunities/search?${new URLSearchParams({
        location_id: process.env.GHL_LOCATION_ID, pipeline_id: cfg.pipelineId, contact_id: contactId, status: 'open',
      })}`);
      const open = (found?.opportunities || []).find((o) => o.pipelineId === cfg.pipelineId && (o.contactId === contactId || o.contact?.id === contactId));
      // DEMO - 01 is triggered by this opportunity being CREATED (pipeline + New Lead). Its first step requires BOTH
      // demo tags, so the tags above must already be on the contact: never move this step before step 2.
      const oppCreated = !open;
      if (open) {
        events.push(ev('opportunity', 'confirmed', 'existing'));
      } else {
        step = 'stage_lookup';
        const stageId = await newLeadStageId(cfg);
        step = 'opportunity_create';
        await oppCall('POST', '/opportunities/', {
          locationId: process.env.GHL_LOCATION_ID,
          pipelineId: cfg.pipelineId,
          pipelineStageId: stageId,
          contactId,
          name: `${lead.firstName} ${lead.lastName} - Contractor Demo`,
          status: 'open',
        });
        events.push(ev('opportunity', 'confirmed', 'created'));
      }

      // 4) Optional intake trigger (DEMO - 00), only with consent. Off by default: the endpoint already creates the
      //    opportunity, and DEMO - 00 would only try to create a duplicate (blocked at sub-account level).
      const trigger = cfg.triggerWorkflows && consent.agreed;
      step = 'trigger_tag';
      if (trigger) await ghlCall('POST', `/contacts/${contactId}/tags`, { tags: [TRIGGER_TAG] });
      // Honest reporting: a new opportunity hands the lead to DEMO - 01, which texts consenting contacts once it is
      // published. We can't see delivery (or whether it's published), so that's "pending", never "sent".
      const handedOff = oppCreated || trigger;
      events.push(ev('sms', !consent.agreed ? 'skipped' : handedOff ? 'pending' : 'simulated',
        !consent.agreed ? 'not_opted_in' : handedOff ? null : 'existing_opportunity'));
      // DEMO - 0 Owner Alerts has no opportunity-created trigger; of what this endpoint does, only the trigger tag
      // starts it. Without that tag the alert is "simulated".
      events.push(ev('owner_alert', trigger ? 'pending' : 'simulated'));
      result = { ok: true, mode: 'live', firstName: lead.firstName, consent: consent.agreed, events };
    } catch (err) {
      // Which step failed and the CRM's own message (scrubbed of emails/numbers), so failures can be diagnosed.
      log({ requestId, mode: 'live', outcome: 'crm_failed', step, partial: saved, status: err.status || null,
        crm: crmMessage(err), ms: Date.now() - started }, 'error');
      return json({ ok: false, code: 'crm_failed', step, partial: saved }, 502);
    }
  }

  remember(`id:${submissionId}`, result);
  remember(`ph:${phone}`, result);
  log({
    requestId,
    mode: result.mode,
    outcome: 'ok',
    consent: consent.agreed,
    service: lead.service,
    events: Object.fromEntries(result.events.map((e) => [e.key, e.status])),
    ms: Date.now() - started,
  });
  return json(result);
};

export const config = { path: '/api/contractor-demo' };
