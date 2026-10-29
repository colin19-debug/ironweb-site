// CRM client (GoHighLevel / LeadConnector API v2). Server-side only. Private docs may name GHL;
// public site copy never does.
//   GHL_API_KEY             Private Integration token (Netlify env var, secret, Production only).
//                           GHL_TOKEN is still accepted as a fallback name.
//   GHL_LOCATION_ID         Sub-account Location ID
//   GHL_PIPELINE_ID         Optional. Overrides the pipeline lookup by name (FORMS[intent].opportunity)
//   GHL_PIPELINE_STAGE_ID   Optional, with GHL_PIPELINE_ID. Stage for new website leads
//   GHL_API_VERSION         Optional. Version header, defaults to "v3" (verified live in the Saltmarsh demo)
//
// Per lead: upsert contact (matched by email/phone, so repeat inquiries and later bookings reuse
// the same contact) → append tags (the upsert's tags field would overwrite) → add a note
// → one open opportunity per contact in the form's pipeline (looked up by name, first stage; no duplicates).
import { FORMS, CUSTOM_FIELDS } from './forms-config.mjs';

const BASE = 'https://services.leadconnectorhq.com';

const apiKey = () => process.env.GHL_API_KEY || process.env.GHL_TOKEN;
export const ghlConfigured = () => Boolean(apiKey() && process.env.GHL_LOCATION_ID);

// Opportunity endpoints use the documented 2021-07-28 contract; under 'v3' the search endpoint rejects
// location_id / pipeline_id / contact_id with a 422 (first live demo test, 2026-10-27).
export const OPP_VERSION = '2021-07-28';

// `version` overrides the Version header for endpoints whose parameters follow a specific API version.
async function call(method, path, body, version) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      Version: version || process.env.GHL_API_VERSION || 'v3',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text.slice(0, 500) }; }
  if (!res.ok) {
    const err = new Error(`CRM ${method} ${path} → ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function tagsFor(lead) {
  const form = FORMS[lead.intent] || {};
  const tags = [form.tag, ...(form.extraTags || []), 'source-website'];
  if (lead.answers.trade) tags.push(`trade-${lead.answers.trade.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  if (lead.consent?.agreed) tags.push('sms-consent');
  return [...new Set(tags.filter(Boolean))];
}

function customFieldsFor(lead) {
  const fields = Object.entries(CUSTOM_FIELDS).map(([key, a]) => [key, lead.answers[a]]).filter(([, v]) => v);
  if (lead.consent?.agreed) fields.push(['sms_consent_text', lead.consent.text], ['sms_consent_at', lead.consent.timestamp]);
  return fields.map(([key, v]) => ({ key, fieldValue: String(v) }));
}

export function noteFor(lead) {
  const form = FORMS[lead.intent];
  const lines = [form.source, `Received ${lead.receivedAt}`, ''];
  Object.entries(lead.answers).forEach(([k, v]) => { if (v) lines.push(`${k}: ${v}`); });
  lines.push('', lead.consent?.agreed ? `SMS consent: YES at ${lead.consent.timestamp}\n"${lead.consent.text}"` : 'SMS consent: not given');
  if (lead.pageUrl) lines.push(`Page: ${lead.pageUrl}`);
  const attr = Object.entries(lead.attribution || {}).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`);
  if (attr.length) lines.push(`Attribution: ${attr.join(', ')}`);
  return lines.join('\n');
}

// Pipeline + first stage by pipeline name, looked up once per function instance.
// GHL_PIPELINE_ID + GHL_PIPELINE_STAGE_ID skip the lookup.
const pipelineCache = new Map();
export const resetPipelineCache = () => pipelineCache.clear();
async function pipelineStage(pipelineName) {
  if (process.env.GHL_PIPELINE_ID && process.env.GHL_PIPELINE_STAGE_ID) {
    return { pipelineId: process.env.GHL_PIPELINE_ID, stageId: process.env.GHL_PIPELINE_STAGE_ID };
  }
  if (pipelineCache.has(pipelineName)) return pipelineCache.get(pipelineName);
  const data = await call('GET', `/opportunities/pipelines?locationId=${encodeURIComponent(process.env.GHL_LOCATION_ID)}`, undefined, OPP_VERSION);
  const want = pipelineName.trim().toLowerCase();
  const p = (data?.pipelines || []).find((x) => String(x.name || '').trim().toLowerCase() === want);
  const first = p && [...(p.stages || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
  if (!first) throw new Error(`pipeline "${pipelineName}" or its first stage not found`);
  const found = { pipelineId: p.id, stageId: first.id };
  pipelineCache.set(pipelineName, found);
  return found;
}

// One open opportunity per contact in the pipeline: reuse an open one, else create it in the first stage.
async function ensureOpportunity(contactId, name, pipelineName) {
  const { pipelineId, stageId } = await pipelineStage(pipelineName);
  const loc = process.env.GHL_LOCATION_ID;
  const q = new URLSearchParams({ location_id: loc, pipeline_id: pipelineId, contact_id: contactId, status: 'open' });
  const found = await call('GET', `/opportunities/search?${q}`, undefined, OPP_VERSION);
  if ((found?.opportunities || []).some((o) => o.pipelineId === pipelineId)) return 'existing';
  await call('POST', '/opportunities/', { locationId: loc, pipelineId, pipelineStageId: stageId, contactId, name, status: 'open' }, OPP_VERSION);
  return 'created';
}

export async function sendToGHL(lead) {
  const form = FORMS[lead.intent];
  const contact = {
    locationId: process.env.GHL_LOCATION_ID,
    firstName: lead.firstName,
    ...(lead.lastName ? { lastName: lead.lastName } : {}),
    email: lead.email,
    ...(lead.phone ? { phone: lead.phone } : {}),
    ...(lead.answers.businessName ? { companyName: lead.answers.businessName } : {}),
    ...(lead.answers.website ? { website: lead.answers.website } : {}),
    source: form.source,
  };
  const customFields = customFieldsFor(lead);

  let upserted;
  try {
    upserted = await call('POST', '/contacts/upsert', { ...contact, customFields });
  } catch (err) {
    if (err.status >= 400 && err.status < 500 && customFields.length) {
      console.warn('[crm] upsert with custom fields failed, retrying without them:', err.status, JSON.stringify(err.data));
      upserted = await call('POST', '/contacts/upsert', contact);
    } else {
      throw err;
    }
  }
  const contactId = upserted?.contact?.id || upserted?.id;
  if (!contactId) throw new Error(`CRM upsert returned no contact id: ${JSON.stringify(upserted).slice(0, 300)}`);

  const tags = tagsFor(lead);
  await call('POST', `/contacts/${contactId}/tags`, { tags });
  await call('POST', `/contacts/${contactId}/notes`, { body: noteFor(lead) });

  // Opportunity: best-effort. The contact, tags and note above are what trigger Colin's text
  // workflow, so an opportunity error is logged but doesn't fail the lead.
  let opportunity = 'skipped';
  if (form.opportunity) {
    try {
      const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') + (lead.answers.businessName ? ` - ${lead.answers.businessName}` : ' - Website');
      opportunity = await ensureOpportunity(contactId, name, form.opportunity);
    } catch (err) {
      opportunity = 'failed';
      console.error(`[crm] opportunity failed for contact ${contactId}: ${err.message} ${JSON.stringify(err.data || {})}`);
    }
  }
  return { contactId, isNew: Boolean(upserted?.new), tags, opportunity };
}

// Shared low-level client for other server endpoints (e.g. the contractor demo). Server-side only.
export { call as ghlCall };
