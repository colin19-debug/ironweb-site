// Every website form intent is declared here, and only here.
// The browser sends { intent: '<key>', name, email, phone?, answers{...}, consent, ... }.
//
// source:   human-readable source written to the CRM contact and note.
// tag:      CRM tag that triggers this intent's workflow ("Contact Tag added"). Must match exactly.
// choices:  allowed values for pick-one answers (empty = not answered, always allowed).
// allowed:  answer keys accepted for this intent (anything else is dropped).
// phone:    'required' to make a valid mobile number mandatory (default optional).
// consent:  'required' to make the SMS consent checkbox mandatory (default optional).
import { BUSINESS_TYPES, SERVICE_CHOICES, TIMELINES, BUDGETS, SPEED_BUSINESS_TYPES } from '../../src/data.mjs';

const shared = { businessType: BUSINESS_TYPES };

export const FORMS = {
  // Homepage "Text me" form (#talk, form talk-home). The tag "website lead" fires Colin's speed-to-lead workflow.
  speed: {
    source: 'Website - Text Me',
    tag: 'website lead',
    phone: 'required',
    consent: 'required',
    allowed: ['businessType', 'message'],
    choices: { businessType: SPEED_BUSINESS_TYPES },
  },
  inquiry: {
    source: 'Website - Inquiry',
    tag: 'website-inquiry',
    allowed: ['businessName', 'businessType', 'website', 'service', 'timeline', 'budget', 'message'],
    choices: { ...shared, service: SERVICE_CHOICES, timeline: TIMELINES, budget: BUDGETS },
  },
  demo: {
    source: 'Website - Demo Request',
    tag: 'website-demo-request',
    allowed: ['businessName', 'businessType', 'website', 'message'],
    choices: shared,
  },
  agentic: {
    source: 'Website - Agentic Interest',
    tag: 'website-agentic-interest',
    allowed: ['businessName', 'businessType', 'message'],
    choices: shared,
    // Interest only: never creates a sales opportunity.
    opportunity: false,
  },
};

// Answers copied into CRM custom fields (contact object). Key = the field key shown in
// Settings → Custom Fields, without the "contact." prefix. Missing fields are skipped
// automatically (the upsert retries without custom fields on a 4xx).
export const CUSTOM_FIELDS = {
  business_type: 'businessType',
  service_interest: 'service',
  project_timeline: 'timeline',
  project_budget: 'budget',
  inquiry_message: 'message',
};
