# Integration checklist (private, not deployed)

## v3 status (2026-10-28) — read this first
The CRM is connected in Production (`GHL_API_KEY`, `GHL_LOCATION_ID`). Sections below are history; where they
mention the `speed`, `inquiry`, `demo` or `agentic` forms, those were removed in v3.

| Form | Where | Tags | Opportunity | SMS consent |
|---|---|---|---|---|
| `audit` | /contact/#audit (every "Request your free audit") | `website lead`, `website-audit-request`, `source-website`, `trade-<trade>`, `sms-consent` if ticked | One open opportunity in pipeline **"Website Leads"**, first stage (looked up by name; `GHL_PIPELINE_ID` + `GHL_PIPELINE_STAGE_ID` override) | Optional |
| `preview` | /build/#preview | `needs-demo`, `source-website`, `trade-<trade>`, `sms-consent` if ticked | None | Optional |
| contractor demo | /demo/ | see section 9 | demo pipeline | Optional |

- The "website lead" workflow is published and tag-triggered: it texts the prospect and Colin. **Because consent is
  optional, the prospect text must be gated on the `sms-consent` tag** (If/Else in the workflow), or prospects who
  didn't opt in will be texted.
- Opportunity creation is best-effort: if the pipeline lookup fails, the lead still succeeds (tags fire the
  workflow) and the function logs `[crm] opportunity failed`.
- Booking: the `ironweb-contractor-demo` calendar is embedded on /demo/ and /contact/.

## 1. CRM (GHL sub-account for IronWeb Digital)

Needed from Colin (never paste the token into chat):

| Item | Where it goes |
|---|---|
| Private Integration token (scopes: View/Edit Contacts, View/Edit Opportunities, View Custom Fields) | Netlify env `GHL_TOKEN` (secret, Production only) |
| Location ID | Netlify env `GHL_LOCATION_ID` |
| Pipeline ID + "New Inquiry" stage ID (optional, see §3) | `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID` |

Then redeploy (env vars apply only after a deploy).

### Tags the website applies (workflow triggers must match exactly)

| Form intent | Source written to contact | Tag |
|---|---|---|
| General inquiry (Contact `#inquiry`; automation "Ask about" links prefill it) | `Website - Inquiry` | `website-inquiry` |
| "Let's talk about your website" / free homepage preview (Home `#talk`, Contact `#talk`) | `Website - Demo Request` | `website-demo-request` |
| AIISA / agent team interest (`/automations/`) | `Website - Agentic Interest` | `website-agentic-interest` |
| Every website lead | | `source-website` |
| Service dropdown answered | | `interest-<service>` e.g. `interest-compact-build` |
| SMS box ticked | | `sms-consent` |

Discovery booking is the fourth intent; it comes from the calendar itself (see §2), not this function.

### Custom fields to create (Contact object; key without `contact.` prefix)

`business_type`, `service_interest`, `project_timeline`, `project_budget`, `inquiry_message` (multi-line),
`sms_consent_text` (multi-line), `sms_consent_at`.
Business name → standard `companyName`; current website → standard `website`.
Missing fields are skipped silently by the CRM: send one test lead and check every field.
`companyName`/`website` on upsert were never tested live (kit note); remove those lines in
`netlify/lib/ghl.mjs` if the CRM rejects them.

### What each lead does (server: `netlify/functions/lead.mjs`)

1. Upsert contact (matched by email/phone → no duplicate contacts on repeat inquiries or later bookings).
2. Append tags. 3. Add a note with all answers, page URL, UTM/referrer and the SMS consent record.
4. If pipeline env vars are set: upsert one open opportunity for the contact (not for agentic interest).

Response codes and visitor messages: 200 success · 400 field errors · 429 rate limit ·
502 CRM failed (lead logged in full as `[lead] CRM FAILED … LEAD: {…}` for manual re-entry, visitor
told it didn't go through) · 503 not connected.

## 2. Discovery-call booking

Needed: the public booking URL of the CRM calendar connected to Colin's calendar (timezone set).

1. Paste it into `BOOKING.url` in `src/data.mjs`, run `node scripts/build.mjs`.
2. Add the calendar's host to `frame-src` (and any `script-src`/`connect-src` the console reports)
   in `netlify.toml`. Add only what the browser console shows as blocked.
3. The contact page then embeds the calendar with an "Open the booking page" fallback link.
   Set `BOOKING.embed = false` to link out only (no CSP change needed for a plain link).
4. Test: book a real slot with a `+test` email; confirm the appointment exists in the CRM and on
   Colin's calendar, then cancel it.

## 3. Workflows to build (CRM, from scratch, publish after testing)

Avoid duplicates: either let the website function create the opportunity (env vars set) **or**
let the workflow create it — not both. Use "Allow duplicate opportunities: off".

1. **Website inquiry** — trigger tag `website-inquiry`: internal email + in-app alert to Colin;
   acknowledgement email to the lead; SMS steps only inside If/Else `sms-consent`; end by removing
   the trigger tag (enables re-entry).
2. **Demo request** — trigger `website-demo-request`: alert; task "Follow up with {{contact.first_name}} about their
   demo" (Colin qualifies the project first; the preview is built after that conversation, not automatically);
   acknowledgement email matching the site: Colin will follow up personally to learn about the business and discuss
   the homepage preview. Don't promise a delivery date or imply a call has been booked.
3. **Agentic interest** — trigger `website-agentic-interest`: add to an "Agentic interest" list/tag only;
   short thank-you email; **no** opportunity, no sales sequence.
4. **Discovery call booked** (calendar trigger): update the *existing* opportunity stage to
   "Discovery Call Booked" (no new opportunity); confirmation + reminders. If the contact already got
   an inquiry acknowledgement in the last 24 h, skip the generic acknowledgement.
5. SMS: register A2P first. First text to a new opt-in = the registered opt-in message, word for word.

## 4. SMS / A2P

- The consent text on every form names **"IronWeb Digital"**. It must match the brand registered for
  A2P exactly. The playbook used the DBA "Ironweb Digital Growth" — confirm the registered name and,
  if different, change the label text in `src/components.mjs` (`smsConsent`) and the legal pages.
- Opt-in URL for the registration: `https://ironwebdigital.com/contact/` (phone field and checkbox
  visible immediately, static HTML).

## 5. Before launch

- [ ] Privacy Policy and Terms reviewed by Colin (and counsel if desired) against the real data flows.
- [ ] CRM env vars set; one tagged test lead per intent (`colin19sullivan+test@gmail.com`, 555 number);
      contact, tags, note, custom fields, opportunity and notifications verified; test contacts deleted.
- [ ] Booking URL set, CSP updated, real test booking verified.
- [ ] Hero video (if supplied) encoded and added (see README).
- [ ] Deploy preview reviewed, then production deploy on Colin's instruction.

## 6. Service dropdown values changed (2026-10-10)

`service` choices are now: Compact Build, Build, Growth, Paid Ads, **Automations**, **Automation bundle**,
**Free homepage preview**, Not Sure (previously "Operate" and "Free Website Demo"). Tags follow automatically
(`interest-automations`, `interest-automation-bundle`, `interest-free-homepage-preview`). Nothing is connected yet,
so no CRM data needs migrating. Build workflows against the new values.

The interactive demo on Home is fully client-side and never calls `/api/lead`.

## 7. Speed-to-lead homepage form (2026-10-11)

- Homepage `#talk` form (`talk-home`) posts intent **`speed`** → source `Website - Text Me`, tags **`website lead`**,
  `source-website`, `sms-consent`. Business type and project details go into the contact note (and custom fields
  `business_type` / `inquiry_message` if created). Name, mobile, email and SMS consent are required server-side.
- Env vars: **`GHL_API_KEY`** (preferred; `GHL_TOKEN` still accepted) and `GHL_LOCATION_ID`. Set both in Netlify
  (API key secret, Production only), then redeploy.
- Speed-to-lead workflow trigger: Contact Tag added = `website lead` (exact, with the space). First text must be the
  registered A2P opt-in message.
- **The homepage promises a text in under a minute.** That's only true once the CRM is connected, the workflow is
  published, and IronWeb's A2P registration is approved. Don't deploy the new homepage before then.
- **Compliance risk:** the homepage SMS checkbox is required (Colin's decision). Carriers and the CRM's compliance
  review treat required SMS consent as forced opt-in. Mitigations in place: the consent label names the business,
  includes frequency, rates, STOP/HELP and "not a condition of purchase", and the Contact page keeps an
  email-only form with optional consent. Register A2P against `/contact/` as the opt-in URL, or make the homepage
  box optional if the review fails.
- The public email changed to colin@ironwebdigital.com. Update the A2P HELP reply, the CRM notification sender
  and any templates that still show the Gmail address. Sole-proprietor A2P brand registration needs a public-domain
  email (Gmail), so keep Gmail on the registration itself.
- Public phone changed to (774) 486-7776 (2026-10-11). Use it in A2P sample messages/HELP text where a callback
  number appears, and make sure it's the number Colin wants customers to call (the texting number in the CRM is
  separate).

## 8. "Text DEMO" hero CTA (2026-10-16)

The homepage hero and ladder say **"Text DEMO to (774) 486-7776 and see how fast we answer."** (an `sms:` link with
the body prefilled). For that promise to be true:
- (774) 486-7776 must be the number that receives texts in the CRM (the IronWeb texting number), not a personal cell
  that only Colin sees. If the public number and the CRM texting number differ, change `SITE.phoneDisplay/phoneTel`
  or port/forward the number.
- Build a CRM workflow: trigger **Inbound message contains keyword "DEMO"** (case-insensitive) -> instant auto-reply
  (the demo experience) -> tag the contact (e.g. `sms-demo`) -> alert Colin.
- A2P: an inbound keyword text is the person opting in; the first reply should identify Ironweb Digital Growth and
  include STOP/HELP language. Add a DEMO sample message to the campaign registration.
- Service dropdown values now include "Contractor Bundle" and "Real Estate Bundle" (replacing "Automation bundle").

## 9. Contractor Core interactive demo (/contractor-demo/), 2026-10-27

Built and tested in **preview mode only**. No GHL workflow was modified, no contact created, no SMS or call made.

**How it works** (updated 2026-10-27 after the GHL setup)
- Page: `/contractor-demo/` (`contractorDemo` in `src/pages.mjs`, behaviour in `site/assets/js/contractor-demo.js`).
- Endpoint: `POST /api/contractor-demo` (estimate request), `GET /api/contractor-demo` (public config: mode,
  receptionist availability, booking URL; never IDs or credentials). Code: `netlify/functions/contractor-demo.mjs`,
  config `netlify/lib/contractor-demo-config.mjs`. Separate from `/api/lead`, so demo activity never uses IronWeb's
  sales tags (`website lead`, `website-inquiry`, ...).
- Location `6H1Q1KjxVhzcVwnUcS6x` (already the `GHL_LOCATION_ID` in Netlify, verified). Pipeline
  "IronWeb Contractor Demo" `z39DlXlHDKhSdPpo4FUz` is the built-in default (`CONTRACTOR_DEMO_PIPELINE_ID` overrides).
  The "New Lead" stage id is looked up once by name via `GET /opportunities/pipelines?locationId=…` and cached;
  set `CONTRACTOR_DEMO_NEW_LEAD_STAGE_ID` to skip the lookup.
- Live order of operations:
  1. `GET /contacts/search/duplicate` by phone (+ email). **Existing contact: name and source are NOT changed.**
     New contact: `POST /contacts/` with name, phone, email, source `Website - Contractor Demo`.
  2. Tags `iw-contractor-demo` (+ `iw-contractor-demo-sms-consent` if opted in), lowercase, before anything else.
  3. Note: name entered, service, description, consent text + timestamp.
  4. Opportunity: `GET /opportunities/search` for an open one in the demo pipeline for this contact; reuse it, else
     `POST /opportunities/` in New Lead. Always exactly one open demo card.
  5. Only if `CONTRACTOR_DEMO_TRIGGER_WORKFLOWS=true` AND SMS consent: tag `new lead - website` (last call).
     Keep it **false**: it starts DEMO - 00, which only tries to create a duplicate opportunity (blocked at the
     sub-account level).
- **Workflow wiring (GHL side):** DEMO - 01 triggers on *Opportunity created* in pipeline z39DlXlHDKhSdPpo4FUz, stage
  New Lead; its first If/Else continues only with BOTH `iw-contractor-demo` and `iw-contractor-demo-sms-consent`.
  Texting is gated by DEMO - 01's publish state (Draft until Colin approves). **Tags must land before the
  opportunity** (steps 2 then 4); `tests/contractor-demo-test.mjs` enforces this for new and existing contacts.
- Page status for the text: consent + newly created opportunity = "Pending" (handed to DEMO - 01, delivery not
  confirmed); reused opportunity = "Simulated" (no new trigger); no consent = "Skipped".
- Owner alert: always "Simulated" while `CONTRACTOR_DEMO_TRIGGER_WORKFLOWS=false`. DEMO - 0 Owner Alerts triggers on
  form submission, `new lead - website`, appointment booked, missed call, `voice ai - new lead` and customer reply,
  not on opportunity creation. To make it live, add an "Opportunity created in IronWeb Contractor Demo" trigger to
  DEMO - 0 (demo contacts only), replace the placeholder owner mobile number, then change the `owner_alert` status
  in `contractor-demo.mjs` to follow the opportunity like the SMS does.
- "Consultation booked" is recorded in GHL (appointments on calendar "IronWeb – Contractor Demo Consultation");
  the site tracks clicks only.
- Private integration scopes needed: contacts read + write (search, create, tags, notes) and opportunities read +
  write (pipelines, search, create). Done 2026-10-27: Colin added View/Edit Opportunities to the existing
  "Website leads" private integration, so `GHL_API_KEY` stays as is (the key lives only in Netlify).
- Honest statuses returned to the page: `confirmed` (API call succeeded), `pending` (handed to a workflow, not
  confirmed), `simulated` (preview), `skipped` (no SMS consent). SMS and owner alerts are never shown as delivered.
- Protection: validation, honeypot, 2.5 s minimum fill time, 5 requests / 10 min per IP (per function instance),
  duplicate guard (same submission id 10 min, same phone 2 min), PII-free structured logs (`evt: contractor_demo`).

**Before turning live mode on**
1. Done (GHL side): workflows isolated on `iw-contractor-demo`, still Draft until tested.
2. Done: the endpoint always creates the New Lead opportunity, so the workflows must NOT also create one.
3. Done: existing contacts (matched by phone/email) keep their name and source; only demo tags + note are added.
4. First live test: production is safe while every DEMO workflow is Draft (it only creates the contact, tags, note
   and opportunity; no texts). `GHL_API_KEY` is Production-only, so a deploy-preview test would also need the key
   added to the Deploy Previews context. Set `CONTRACTOR_DEMO_LIVE=true`, submit one test, verify contact, tags,
   note and New Lead opportunity in GHL, then delete them.
5. Only after step 4: `CONTRACTOR_DEMO_TRIGGER_WORKFLOWS=true`, and confirm the intake workflow's first SMS is
   A2P-approved copy that names Ironweb Digital Growth with STOP/HELP.
6. AI receptionist: validate the demo Voice AI on a dedicated number (not Erick's/All Phaze), then set
   `CONTRACTOR_DEMO_RECEPTIONIST_NUMBER` and `CONTRACTOR_DEMO_RECEPTIONIST_ENABLED=true`. Until then the page shows
   "Coming soon" and no number.
7. Done: booking defaults to https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo (link-out, new tab;
   no CSP change needed). Without JS the button falls back to /contact/#book.
8. Analytics: events are pushed to `window.dataLayer` (`iw_demo_page_viewed`, `iw_demo_started`,
   `iw_estimate_form_submitted`, `iw_sms_consent_selected`, `iw_receptionist_call_clicked`,
   `iw_pipeline_reveal_viewed`, `iw_demo_completed`, `iw_consultation_cta_clicked`, `iw_consultation_booked`).
   No analytics or ad pixel is installed. `iw_consultation_booked` fires only when a booking integration dispatches
   `iw:booking-confirmed` after a confirmed appointment. A Meta Pixel can be wired later by loading it with approval
   and setting `window.IW_FB_ENABLED = true` (mapping in contractor-demo.js).
9. CSP: if the receptionist or booking is embedded later (iframe/widget), add exactly the hosts the console reports.
