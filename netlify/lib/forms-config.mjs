// Every website form intent is declared here, and only here.
// The browser sends { intent: '<key>', name, email, phone?, answers{...}, consent, ... }.
//
// source:      human-readable source written to the CRM contact and note.
// tag:         CRM tag that triggers this intent's workflow ("Contact Tag added"). Must match exactly.
// choices:     allowed values for pick-one answers (empty = not answered, always allowed).
// allowed:     answer keys accepted for this intent (anything else is dropped).
// required:    answer keys that must be filled in.
// phone:       'required' to make a valid mobile number mandatory (default optional).
// consent:     'required' to make the SMS consent checkbox mandatory (default optional). v3: always optional.
// opportunity: pipeline NAME to open one opportunity in (first stage), or false for none.
import { TRADES } from '../../src/data.mjs';

export const FORMS = {
  // The main lead path (Contact #audit). "website lead" starts Colin's text workflow (published, tag-triggered).
  audit: {
    source: 'Website - Audit Request',
    tag: 'website lead',
    extraTags: ['website-audit-request'],
    phone: 'required',
    required: ['businessName'],
    allowed: ['businessName', 'trade', 'town', 'website', 'message'],
    choices: { trade: TRADES },
    opportunity: 'Website Leads',
  },
  // IW Build page: personal homepage preview. "needs-demo" starts the website demo workflow.
  preview: {
    source: 'Website - Homepage Preview',
    tag: 'needs-demo',
    allowed: ['businessName', 'trade', 'website', 'message'],
    choices: { trade: TRADES },
    opportunity: false,
  },
};

export const REQUIRED_MESSAGES = { businessName: 'Enter your business name.' };

// Answers copied into CRM custom fields (contact object). Key = the field key shown in
// Settings → Custom Fields, without the "contact." prefix. Missing fields are skipped
// automatically (the upsert retries without custom fields on a 4xx).
export const CUSTOM_FIELDS = {
  business_type: 'trade',
  inquiry_message: 'message',
};
