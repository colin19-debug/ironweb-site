// Contractor Core interactive demo (/contractor-demo/): server-side configuration.
// Everything is read from environment variables so no number, URL or credential lives in the page.
// Every live switch defaults to OFF: with nothing set, the demo runs in preview mode and makes no CRM calls.
//
//   CONTRACTOR_DEMO_LIVE=true              allow CRM writes (contact upsert + isolation tag + note). Default off.
//   CONTRACTOR_DEMO_TRIGGER_WORKFLOWS=true also add the workflow trigger tag after the isolation tag. Default off.
//                                          Only meaningful when LIVE is on. This is what can start SMS / alerts.
//   CONTRACTOR_DEMO_PIPELINE_ID            pipeline "IronWeb Contractor Demo" (default below; override if it changes)
//   CONTRACTOR_DEMO_NEW_LEAD_STAGE_ID      optional: its "New Lead" stage. If unset, looked up once by name and cached.
//   CONTRACTOR_DEMO_RECEPTIONIST_ENABLED=true  show the AI receptionist number. Default off ("coming soon").
//   CONTRACTOR_DEMO_RECEPTIONIST_NUMBER    E.164, e.g. +15085550100. Never shown unless ENABLED is true.
//   CONTRACTOR_DEMO_BOOKING_URL            optional override of DEFAULT_BOOKING_URL (IronWeb's consultation calendar,
//                                          NOT the demo business's estimate calendar).
//   GHL_API_KEY / GHL_LOCATION_ID          shared with /api/lead (IronWeb Digital Growth sub-account).

// GHL stores tags lowercase; use these exact strings (Colin, 2026-10-27).
export const DEMO_TAG = 'iw-contractor-demo'; // permanent isolation tag, always applied FIRST
export const TRIGGER_TAG = 'new lead - website'; // Contractor Core intake trigger; workflows may remove it
export const DEMO_CONSENT_TAG = 'iw-contractor-demo-sms-consent';
export const DEMO_SOURCE = 'Website - Contractor Demo';
// Not secrets: the demo pipeline in IronWeb Digital Growth (location 6H1Q1KjxVhzcVwnUcS6x).
export const DEFAULT_PIPELINE_ID = 'z39DlXlHDKhSdPpo4FUz';
export const NEW_LEAD_STAGE_NAME = 'New Lead';
// IronWeb's consultation calendar for the demo's "Book Your IronWeb Consultation" (Colin, 2026-10-27, confirmed live).
export const DEFAULT_BOOKING_URL = 'https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo';

export const DEMO_SERVICES = [
  'Landscaping',
  'Painting',
  'Carpentry',
  'Handyman Services',
  'Property Maintenance',
  'Other Home Services',
];

const on = (v) => String(v || '').trim().toLowerCase() === 'true';
const e164 = (v) => (/^\+1\d{10}$/.test(String(v || '').trim()) ? String(v).trim() : '');
const fmt = (n) => `(${n.slice(2, 5)}) ${n.slice(5, 8)}-${n.slice(8)}`;

export function demoConfig(env = process.env) {
  const crmReady = Boolean((env.GHL_API_KEY || env.GHL_TOKEN) && env.GHL_LOCATION_ID);
  const live = on(env.CONTRACTOR_DEMO_LIVE) && crmReady;
  const number = e164(env.CONTRACTOR_DEMO_RECEPTIONIST_NUMBER);
  const receptionistEnabled = on(env.CONTRACTOR_DEMO_RECEPTIONIST_ENABLED) && Boolean(number);
  const override = String(env.CONTRACTOR_DEMO_BOOKING_URL || '').trim();
  const booking = /^https:\/\//.test(override) ? override : DEFAULT_BOOKING_URL;
  return {
    live,
    triggerWorkflows: live && on(env.CONTRACTOR_DEMO_TRIGGER_WORKFLOWS),
    pipelineId: String(env.CONTRACTOR_DEMO_PIPELINE_ID || '').trim() || DEFAULT_PIPELINE_ID,
    newLeadStageId: String(env.CONTRACTOR_DEMO_NEW_LEAD_STAGE_ID || '').trim(),
    receptionist: receptionistEnabled ? { enabled: true, tel: number, display: fmt(number) } : { enabled: false },
    bookingUrl: booking,
  };
}

// What the browser is allowed to know. No IDs, no credentials, no unapproved numbers.
export function publicConfig(env = process.env) {
  const c = demoConfig(env);
  return {
    mode: c.live ? 'live' : 'preview',
    workflows: c.triggerWorkflows,
    receptionist: c.receptionist,
    bookingUrl: c.bookingUrl,
  };
}
