# Ironweb Digital Growth: Website → GoHighLevel Playbook

Everything learned building the **Saltmarsh Realty Group** demo (Sept–Oct 2026), rewritten so
you can build the **Ironweb Digital Growth** site with the same GHL integration, plus a
tested starter kit in `docs/ironweb-ghl-kit/`.

**How to use this document**

- **Colin:** read sections 1, 7–9 and 13 before touching GHL. They hold the hard-won lessons.
- **Claude Code (new Ironweb project):** read this whole file before writing code. Then copy
  `docs/ironweb-ghl-kit/` into the new project and follow section 4. Every rule in section 14
  ("Rules that must survive") is a requirement, not a suggestion.

---

## 1. Business context

- **Ironweb Digital Growth** (a DBA, Swansea MA; contact colin19sullivan@gmail.com) sells a
  **"virtual inside sales department"** to small real estate firms: 10 agents or fewer, with no
  in-house ISA (inside sales agent).
- **Offer:**
  - a website with a registration gate (lead capture);
  - instant follow-up;
  - AI qualification over text;
  - long-term nurture;
  - hot-lead routing;
  - CRM admin automation.
- **Price:** a one-time build fee plus **$500–800/month**. The client pays the IDX listings feed directly.
- **Why it sells:**
  - Most local firm sites are a "meet the team" page with old listings or none at all.
  - Many leads are 3–6 months out, and agents don't keep them warm.
- **Validated with Colin's uncle (a realtor), 2026-10-02:**
  - **Automated follow-up that qualifies over text, then hands a warm lead to a human to close.**
  - **Automated CRM admin**, which frees 15–20 minutes per lead.
- **The Ironweb site should practice what it sells.** Its own forms feed GHL, get instant
  follow-up, and route to Colin. A prospect who fills out the Ironweb form *experiences* the
  product.

---

## 2. What exists in the Saltmarsh demo (reference implementation)

- **Live:** https://saltmarsh-demo-458.netlify.app (Netlify project `saltmarsh-demo-458`, team `colin19sullivan`)
- **Repo:** `C:\Sites\Real Estate V1`
- **Stack:**
  - static HTML/CSS/vanilla JS, no build step;
  - one Netlify Function (`/api/lead`) → GHL API v2;
  - GHL sub-account "Saltmarsh Realty Group (Demo)".
- **Pages:** Home (photo hero, search, newest listings), Listings (filters), Listing detail, Home value
  (seller form), About/Team, Privacy, Terms, 404.
- **Registration gate:**
  - The 4th unique listing view blurs the page and opens a sign-up modal.
  - It's configurable through `GATE_AFTER` and `GATE_MODE` (hard/soft).
  - Demo shortcuts: `?reset=1`, `?gate=soft`, `?gate_after=N`.
  - `DEMO_MODE` keeps gate state per browser tab, so each pitch starts fresh.
- **Forms → GHL:** listing gate, Home value, showing request and contact all post to
  `/api/lead`. Each creates or updates the contact, adds tags, sets custom fields and adds a note.
  **Verified live 2026-10-01**, about 1.1 seconds from submit to the contact appearing in GHL.
- **Docs in that repo:**
  - `docs/ghl-setup.md`: GHL setup steps and Workflow 1;
  - `docs/ghl-snapshot.md`: the full client snapshot design;
  - `docs/realestate-demo-spec.md`: the original spec;
  - `CLAUDE.md`: decision log.

---

## 3. Architecture

```
Browser (static HTML form, data-lead-form="Website - X")
   │  POST /api/lead  { source, firstName, lastName, email, phone(E.164), answers{…}, consent{agreed,text,timestamp}, pageUrl }
   ▼
Netlify Function  netlify/functions/lead.mjs   ← validates against netlify/lib/forms-config.mjs
   │  (no GHL env vars → STUB: logs only)
   ▼
netlify/lib/ghl.mjs → https://services.leadconnectorhq.com   (Authorization: Bearer GHL_TOKEN, Version: v3)
   1. POST /contacts/upsert        contact + customFields   (matches existing contact by email/phone)
   2. POST /contacts/{id}/tags     tags (APPENDS — upsert's tags field would OVERWRITE)
   3. POST /contacts/{id}/notes    human-readable summary incl. consent record
   ▼
GHL workflow trigger: "Contact Tag added = website-…" → alerts, opportunity, email, SMS (only if tag sms-consent)
```

**Design choices to keep:**
- **Secrets never touch the browser.** The token lives only in Netlify environment variables.
- **Stub mode.** Without env vars the function only logs. Local development and tests never create real contacts.
- **Never lose a lead.** If GHL fails, the visitor still sees success, and the full lead is logged
  (`[lead] GHL FAILED: … LEAD: {…}`) for manual re-entry.
  - *Open improvement:* also email Colin when this happens. Discussed, not built.
- **Custom fields are best-effort.** If GHL rejects them (e.g. a field doesn't exist yet), the upsert retries without them.
- **Forms are static HTML**, not built by JavaScript, because A2P compliance scanners read raw HTML (section 9).

---

## 4. The starter kit (`docs/ironweb-ghl-kit/`), tested 2026-10-06

| File | Purpose |
|---|---|
| `netlify/lib/forms-config.mjs` | **The only file you edit per form.** Source name → tag, phone required/optional, required answers, allowed choices, answers that become tags; plus the answer → custom field map. Pre-filled for Ironweb: Strategy Call, Site Audit, Contact. |
| `netlify/lib/ghl.mjs` | GHL client: upsert, then tags, then note. Retries without custom fields on a 4xx. Sends `companyName` and `website` when answered. |
| `netlify/functions/lead.mjs` | `POST /api/lead`: validation, honeypot (`bot_field`), stub mode, failure handling. `export const config = { path: '/api/lead' }`. |
| `js/lead-form.js` | Browser script. Wires any `<form data-lead-form="…">`: inline errors, phone normalized to E.164, consent text **read from the checkbox's own label**, success `<template data-success>`. |
| `example-form.html` | A complete static Strategy Call form with a compliant optional consent box. |
| `tests/ghl-mock-test.mjs` | 15 checks against a fake GHL API: stub mode, call order, headers, custom fields, tags, validation, honeypot, custom-field retry, GHL-down behavior. Run: `node tests/ghl-mock-test.mjs`. |

**Tested:**
- the mock test passes (15/15);
- `lead-form.js` passed a headless-Chrome test against the real function in stub mode: required errors, bad email/phone, payload shape, consent text from label, success template, no page errors.

**Not yet tested against live GHL:** `companyName` and `website` on the upsert. Those two are new in the kit; the demo never sent them. GHL's contact schema includes them, but confirm on your first test lead. If GHL rejects them, remove those two lines in `sendToGHL`.

**Wiring steps in the new project:**
1. Copy `netlify/`, `js/lead-form.js` and `tests/` into the project root.
2. Edit `forms-config.mjs`: one entry per form. The `tag` value must match the GHL workflow trigger exactly.
3. Write each form as **static HTML** (copy `example-form.html`). Field names:
   - `firstName`, `lastName`, `email`, `phone`, `smsConsent` (value `yes`), `bot_field` (honeypot);
   - every other named field goes into `answers` (e.g. `brokerage`, `agents`, `websiteUrl`, `message`).
4. Each input sits in a `.field` with a `<p class="field-error">`. Mark required inputs `required`, with an optional `data-error="…"` message.
5. Add `<script type="module" src="/js/lead-form.js"></script>` to every page with a form.
6. `netlify.toml`: functions directory plus security headers (section 5).
7. Run `node tests/ghl-mock-test.mjs`, then a local server test (section 6), then deploy and send one live test lead (section 11).

---

## 5. Netlify

### netlify.toml (proven pattern)
```toml
[build]
  publish = "."

[functions]
  directory = "netlify/functions"

[[redirects]]                       # block working files if they ever get uploaded
  from = "/netlify/*"
  to = "/404.html"
  status = 404
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'"
```

- **The GHL call happens server-side,** so the browser only ever talks to `'self'` and the CSP needs nothing for GHL.
- **If you embed GHL things in the page** (calendar booking widget, chat widget, forms), you must add their
  hosts to `script-src`, `frame-src` and `connect-src`. Add **exactly** what the browser console
  reports as blocked, then re-check the console. Don't guess hosts.
- **Keep `script-src 'self'` with no inline scripts.** JSON-LD (`type="application/ld+json"`) is fine because it isn't executed.

### Environment variables (Project configuration → Environment variables)
| Key | Secret? | Value | Scope / contexts |
|---|---|---|---|
| `GHL_TOKEN` | **Yes** | Private Integration token | Must include **Functions**. Ticking "secret" forces per-context values: fill **Production only**, leave Deploy Previews / Branch / Preview Server / **Local development empty** (keeps local runs in stub mode). |
| `GHL_LOCATION_ID` | No | Sub-account Location ID | "Same value for all deploy contexts". |

- **New variables only take effect after a redeploy.**
- Check with `netlify env:list` (it shows keys; secret values stay hidden).

### Deploying
- **Deploy from a clean copy that holds only the site files, never the project root.** In the demo, a scratch
  `deploy/` folder held only the HTML, `css/`, `js/`, `data/`, images, `netlify/` and `netlify.toml`:
  `netlify deploy --prod --dir . --functions netlify/functions` run from that folder.
  - This keeps `docs/` (pricing, strategy, this playbook), screenshots and CLAUDE.md off the public site.
  - In the new project you could put the site in a `site/` subfolder and set `publish = "site"` instead.
- **Live function logs:** `netlify logs:function lead` streams them. Run it, submit a form, read the output.
  - Successful send: `[lead] sent to GHL: contact <id> (new|existing), tags: …`
  - Failed send: `[lead] GHL FAILED: …`, followed by the full lead.
  - Older logs: Netlify UI → project → **Logs → Functions → lead**.

---

## 6. Local development

- `serve.mjs` (copy from `C:\Sites\Real Estate V1\serve.mjs`):
  - zero-dependency Node server that mirrors Netlify;
  - clean URLs;
  - **imports the real `netlify/functions/lead.mjs`** and routes `POST /api/lead` to it;
  - sends the `netlify.toml` security headers, so CSP problems show up locally.
- Run with `PORT=3001 node serve.mjs`. Port 3000 was taken by another project on this machine.
- Locally there are no GHL env vars, so leads print to the terminal as `[lead] STUB …`. That's intended.
- **Restart the server after changing the function.** It imports the function once at startup.
- **Puppeteer:** the path in the old CLAUDE.md template (`AppData/Local/Temp/puppeteer-test/`) doesn't exist.
  - Chrome builds are in `C:/Users/Colin/.cache/puppeteer/chrome/` (e.g. `win64-153.0.8010.36/chrome-win64/chrome.exe`).
  - Install `puppeteer-core` in a scratch folder and point scripts at that Chrome.
  - There was no `screenshot.mjs`. Claude wrote its own.

---

## 7. GHL setup, step by step (what actually worked)

1. **Sub-account.** Agency view → Sub-Accounts → Create, blank. Use the **real business name and address**; texting registration checks them.
   - For the Ironweb site, this is Ironweb's own sub-account, separate from client and demo sub-accounts.
2. **Private Integration.** Sub-account **Settings → Private Integrations → Create new integration**.
   - **Name:** `Website leads`.
   - **Description:** "Sends leads from the website into this sub-account: creates or updates the contact, adds tags and a note with the lead details and SMS consent. Used by the Netlify function /api/lead."
   - **Scopes:**
     - View Contacts and Edit Contacts (required);
     - View Custom Fields (lets Claude confirm field keys);
     - View/Edit Opportunities (later).
   - **Copy the token immediately.** It's shown once. Put it straight into Netlify; **never paste it into chat.**
   - **Plan note:** GHL's docs don't say which plans include Private Integrations. It worked on **Agency Starter**. If it's ever missing, the fallback is an Inbound Webhook workflow trigger.
3. **Location ID.** Settings → Business Profile, or the ID after `/location/` in the URL.
4. **Custom fields.** **Settings → Custom Fields → Create field** → type, **Add to object = Contact**, name, **Folder (required, or the Create button stays disabled)**.
   - The **Key** auto-generates from the name (e.g. "Towns of Interest" → `towns_of_interest`).
   - **The API uses that key without the `contact.` prefix** (`{ key: 'towns_of_interest', fieldValue: … }`). Verified live.
   - **In message templates, the key gets the prefix:** `{{contact.towns_of_interest}}`.
   - **GHL silently ignores keys that don't exist.** No error, and the field stays blank. After creating fields, send a test lead and check the contact.
   - **For Ironweb, create:**
     - `brokerage_name`
     - `website_url`
     - `agent_count`
     - `current_crm`
     - `biggest_problem` (Multi line)
     - `sms_consent_text` (Multi line)
     - `sms_consent_at`
5. **Pipeline.** Opportunities → Pipelines → Create.
   - Rename GHL's default stages; don't keep "Proposal Sent" etc. unless they fit.
   - **There's no "Lost" stage in GHL.** Lost is an opportunity **status** (Open / Won / Lost / Abandoned).
   - Colors by temperature worked well, with red = act now.
6. **Your mobile on your GHL user profile** (avatar → Profile). Internal SMS alerts go to the profile number.
7. **Email sending.** A new sub-account may need **Settings → Email Services** (sending domain) checked. For anything client-facing, set up a dedicated sending domain (e.g. `mail.ironwebdigital.com`) so follow-up doesn't land in spam.

---

## 8. Building GHL workflows: lessons that cost time

- **Build from scratch.** *Create workflow → Start from scratch*, not the AI builder. Compliance steps must be exact, and the AI adds or rewords things.
- **Trigger:** Contact Tag → **Tag added** = the form's tag (e.g. `website-strategy-call`). The tag shows up in the picker once a test lead has created it.
- **Draft workflows do not run.** "No emails arrived" was just the workflow sitting in Draft. Use **Test workflow** (top right) to run it on one contact without publishing, then check **Execution logs**.
- **Pasting text breaks merge fields.** Pasted rich text split `{{ }}` into fragments: *"There are issues in your custom variables"*.
  - Paste with **Ctrl+Shift+V** (plain text), or insert each field with the **tag icon**.
  - Copying from a markdown file also brings in stray `>` quote characters. Delete them.
- **If/Else branches never merge back.** Put actions that everyone gets (alerts, opportunity, email) **before** the If/Else.
- **Use the "Has tag" recipe for consent:** Tags → Includes → `sms-consent`. Only that branch sends SMS. The "None" branch is your no-consent path.
- **Repeat demos need re-entry.** "Tag added" only fires when the tag is new to the contact. Do two things:
  - turn on **Settings → Allow re-entry**;
  - end **both** branches with **Remove Contact Tag** for the trigger tag.
- **The first SMS to a new opt-in is the opt-in confirmation message registered with A2P, word for word.** Then wait about 1 minute, then send the personal message.
- **Name steps clearly** (⋯ → rename): "Alert: in-app", "Opt-in confirmation" and so on. Execution logs become readable.
- **Internal notifications:** add one of type **Email** (To user type: Particular user → yourself; From name and email left blank) and one of type **In-App**. Add an **SMS** one once texting is approved.
- **Workflow 1 that was built for the demo** ("Speed to Lead: Listing Gate", still Draft):
  1. Trigger: tag `website-listing-gate`.
  2. Alert: in-app.
  3. Alert: email.
  4. Create/Update Opportunity (Website Leads → New Lead, name `{{contact.name}} – Website`, no duplicates).
  5. Email.
  6. If/Else on `sms-consent`:
     - Yes: opt-in SMS → wait 1 minute → agent intro SMS → remove tag;
     - No: remove tag.

---

## 9. SMS compliance and A2P 10DLC: the big one

**Why it matters:** carriers block GHL texts from unregistered numbers. The demo's "text arrives in
seconds" pitch moment depends on an approved campaign. **The Saltmarsh demo campaign was
rejected** (2026-10-03; reason not yet reviewed). The probable cause is the core problem: the site
is a *fictional brand* operated by a different registered business. **The Ironweb site is the
easy case:** a real business registering its own real site. Register Ironweb's number under
Ironweb, against the Ironweb website.

### Brand type
- A DBA is legally a **sole proprietorship**.
  - **No EIN → Sole Proprietor brand:** your legal name plus the DBA name, identity verification by OTP to a real mobile (not a LeadConnector or VoIP number), **1 phone number only**, about 3,000 segments a day, $22.50 one-time plus $2/month (as quoted in GHL, Oct 2026).
  - **Has an EIN → Standard brand.** Choosing Sole Proprietor with an EIN gets rejected.
- **The business name must match the website exactly:** "Ironweb Digital Growth".
- **Use the address on the DBA filing.**
- Sole-proprietor registration requires a **public email domain** (Gmail is accepted; private domains are not).

### Campaign answers that went in (adapt the wording to Ironweb)
- **Use case:** Sole Proprietor (locked for that brand type), covering both marketing and transactional messages.
- **Opt-in method:** Website Form.
  - **Opt-in URL = a page where the phone field and checkbox are visible immediately.** A form that appears later, like a gate after 4 views, can't be found by a reviewer.
  - **Chat widget vs manual:** GHL pushes its chat widget ("recommended"). **Switch to manual setup** works when your own forms collect consent. If the widget is used, it must be installed and visible on the site before you can continue.
- **Opt-in message (≤320 chars), registered and sent as the first text:**
  > Ironweb Digital Growth: Thanks for signing up for texts about your inquiry. Msg frequency varies. Msg & data rates may apply. Reply HELP for help or STOP to opt out.
- **STOP reply:**
  > Ironweb Digital Growth: You're unsubscribed and won't receive more messages.
- **HELP reply:**
  > Ironweb Digital Growth: For help, email colin19sullivan@gmail.com. Msg frequency varies. Msg & data rates may apply. Reply STOP to opt out.
- **Sample messages** must name the business and include STOP wording. Write them to match the real workflow texts; reviewers compare the two.

### GHL's built-in Compliance Review: the checklist it runs (from the demo)

**Opt-in form (8):**
1. Business name in the consent text
2. Checkbox not pre-checked
3. Privacy & terms links
4. Opt-out instructions
5. Message frequency
6. Checkbox optional (not required to submit)
7. **Message type disclosure** (say "marketing and informational")
8. Message & data rates

**Privacy policy (7):**
1. What information is collected
2. How it's used
3. SMS opt-in details
4. Cookies & tracking
5. **Data security practices**
6. User rights (unsubscribe, update, delete)
7. **Clear "no sharing" statement for SMS opt-ins (CRITICAL)**

**Terms (7):**
1. Description of the SMS program and use cases
2. STOP instructions
3. Support contact
4. Message/data rates
5. Carrier liability disclaimer
6. **Age restriction (18+)**
7. Link to the Privacy Policy

**Failures hit, and their fixes:**
- **"Business name in consent text" and "message type" failed** while the form was built by JavaScript. The scanner reads raw HTML. **Fix: static HTML forms.** The kit's `example-form.html` follows this.
- **Data security:** add a section covering HTTPS, access-controlled storage, who has access, and deletion on request.
- **Age:** add "You must be at least 18…" to the terms, and "you confirm you are 18 or older" in the SMS terms.

### Consent rules (built into the kit)
- **The checkbox is optional and starts unticked.** Required SMS consent is "forced opt-in", which carriers reject.
- **People who don't tick it are email-only leads.** Every SMS step sits behind `sms-consent`.
- **Store the exact consent text and timestamp on the contact:** the `sms_consent_text` and `sms_consent_at` fields, plus the note.
- **The kit reads the consent text from the label the visitor saw.**
- **Ironweb consent text** (business name first, both message types):
  > I agree to receive marketing and informational text messages from Ironweb Digital Growth at the phone number I provided, including automated texts about my inquiry and scheduling. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. See our Privacy Policy and Terms. (Optional.)
- **HELP and contact details must be real.** The demo's fake 555 number and `.example` email had to be replaced on the legal pages.

### Brand disclosure (for client and demo sites)
When Ironweb operates a site or sends texts for another brand, say so: in the footer ("A demo site by
Ironweb Digital Growth"), in "Who runs this site" sections on the privacy and terms pages, and
in the consent text. For **real client sites**, the client registers A2P under their own brokerage,
and the site names the client, not Ironweb.

---

## 10. Legal pages: minimum content (both pages linked from every consent box)

**Privacy:**
- Who runs the site
- What we collect (form fields, pages viewed)
- How we use it (CRM follow-up)
- **Text messages** (consent, frequency, rates, STOP/HELP, "consent not a condition of purchase")
- **"We don't sell or share your mobile number or text message consent with third parties or affiliates for their marketing purposes."**
- Cookies / browser storage
- **How we protect your information**
- Your rights / deletion on request
- Contact (real email)

**Terms:**
- Who runs the site
- **Eligibility (18+)**
- Description of the SMS program
- Text message terms: STOP, HELP plus a real email, frequency, rates, "carriers are not liable for delayed or undelivered messages", consent not a condition of purchase
- Link to the Privacy Policy
- Contact

Live examples to adapt: https://saltmarsh-demo-458.netlify.app/privacy and /terms.

---

## 11. Testing and debugging

1. **`node tests/ghl-mock-test.mjs`** after any change to the function or config.
2. **Local:** submit each form on `serve.mjs` and read the `[lead] STUB` output in the terminal. Check the tags line.
3. **Live test lead:** use a plus-address of your Gmail (`colin19sullivan+test@gmail.com`) and a 555 number, so test contacts are easy to spot and delete.
   - **Same email or phone = same contact.** An upsert updates the existing contact. The log says `(existing)`.
4. **Read the live function log** (`netlify logs:function lead`) while submitting.
   - `{"ok":true}` with no `stub` and no `crm` = sent to GHL.
   - `{"ok":true,"stub":true}` = env vars missing or not redeployed.
   - `{"ok":true,"crm":"failed"}` = GHL rejected it. The log has the reason.
5. **In GHL, check:** the contact, tags, note, custom fields (blank = wrong key or field missing) and source.
6. **Workflows:** Test workflow, then Execution logs. Email not arriving: the workflow is in Draft, or check spam, or Email Services.
7. **"Nothing showed up in GHL" during the demo** was a contact that appeared after a delay. Check the log before assuming failure.

---

## 12. The client snapshot (what Ironweb sells, built in the demo sub-account)

Full spec: `C:\Sites\Real Estate V1\docs\ghl-snapshot.md`. Summary:

- **Decisions (2026-10-03):**
  - **GHL Conversation AI** qualifies leads over SMS;
  - **round-robin** assignment (Assign to User → Split traffic equally → only unassigned contacts);
  - **all admin automated.**
- **Conversation AI:**
  - Start in **Suggestive** mode, then Auto-Pilot.
  - It only talks to contacts tagged `ai-active`; workflows add and remove that tag.
  - Its prompt asks one question at a time (timeline, pre-approval, selling first, price range, must-haves) and writes each answer to a custom field.
  - It hands over to a human when asked for one, or on offers, legal/lending questions or upset leads.
  - **Fair housing guardrails:** it never describes areas by who lives there or by safety.
  - It discloses that it's a virtual assistant.
  - **Cost:** about $0.04 per AI reply, or $97/month unlimited per sub-account.
- **Fields added for the AI:** Pre-Approved, Selling First, Price Range, Must-Haves, Lead Summary, Qualification Status (New / Qualifying / Qualified / Needs Human / Unresponsive), Showing Feedback, Contract Date, Closing Date.
- **Workflows:**

| # | Workflow | What it does |
|---|---|---|
| W1 | Speed to lead (per form: gate / home value / showing / contact) | Round-robin assign, opportunity, alerts, email; with consent: opt-in SMS, intro SMS, `ai-active` |
| W2 | Qualified handoff | Stops the AI; stage set by timeline; SMS alert with Lead Summary; 15-minute call task; auto-note |
| W3 | Needs a human | Stops the AI; alert; 15-minute task |
| W4 | No reply follow-up | Day 1 / 3 / 7 nudges; exits on reply; then marks Unresponsive and moves to Long-Term |
| W5 | Long-term nurture | Weekly, then bi-weekly, then monthly, up to 12 months; SMS only with consent |
| W6 | Showing booked | Stage, confirmation, 24-hour and 2-hour reminders, prep task |
| W7 | After the showing | Feedback text 2 hours later (AI saves it), next-day task |
| W8 | Stale lead alert | Stale Opportunities trigger after 5 days of no activity |
| W9 | Under contract | Checklist tasks (inspection, appraisal, commitment, walkthrough, closing) |
| W10 | Closed | Leave nurture; review request; home-anniversary check-in |
| W11 | Missed-call text back | Text back missed calls |

- **Sender in messages:** use `{{user.first_name}}` (the assigned user), not a website-supplied agent name, once round robin is on.
- **Per client:** their own A2P, phone number, sending domain, users and calendar, AI knowledge base (crawl their site), Private Integration token and Location ID in their Netlify site.

---

## 13. Applying this to the Ironweb Digital site

The same plumbing, aimed at **brokerage owners** instead of home buyers.

**Forms (already in `forms-config.mjs`):**

| Source | Tag | Purpose |
|---|---|---|
| Website - Strategy Call | `website-strategy-call` | Main call to action. Name, email, phone, brokerage, agent count (`agents-6-10` tag), biggest problem. |
| Website - Site Audit | `website-site-audit` | Lower-commitment lead magnet. Their website URL, phone optional. |
| Website - Contact | `website-contact` | General message. |

**Suggested Ironweb pipeline (own sub-account):** New Inquiry → Contacted → Discovery Call Booked →
Demo Given → Proposal Sent → Won (status), with Lost as a status, not a stage.

**Suggested Ironweb workflows:**
1. **Speed to lead**, per form tag: alert Colin (in-app, email, and SMS once approved), create an opportunity, send an email, and with consent: opt-in SMS → personal SMS from Colin.
2. **Site Audit:** a task for Colin ("Record a Loom audit of {{contact.website_url}}") due within 24 hours, then an email with the audit link.
3. **Strategy Call booked** (GHL calendar): confirmation and reminders, stage → Discovery Call Booked.
4. **No-show / no-reply nurture:** short cadence, then monthly value emails.
5. **Proof moment:** in sales calls, point out that the prospect just experienced the product when they filled out the form.

**Build notes for Claude Code:**
- Use the `frontend-design` skill and the CLAUDE.md template workflow as for Saltmarsh: brand step → plan → build, with approval stops, at least 2 screenshot rounds and mobile checks.
- **Static HTML forms only** (section 9). Every form page links to Privacy and Terms, and both pages carry the full checklist from section 10.
- **If you embed a GHL booking calendar**, update the CSP to exactly the hosts the console reports. Or link out to the calendar page instead, which needs no CSP change.
- Keep a `docs/` folder out of the deployed output (section 5).
- `robots`: Ironweb is a real business, so use `index, follow`. Saltmarsh used `noindex` only because it's fictional.

---

## 14. Rules that must survive into the new project

1. The GHL token lives only in Netlify env vars (secret, Production only). Never in the repo, the browser or chat.
2. Tags are added with `POST /contacts/{id}/tags`, never through the upsert's `tags` field, which overwrites.
3. Custom field keys in the API have no `contact.` prefix. Templates use `{{contact.key}}`.
4. The SMS consent checkbox is optional and unticked, the text names the registered business and both message types, and the exact text plus timestamp is stored on the contact.
5. Every SMS step in GHL sits behind an If/Else on `sms-consent`.
6. Forms that collect phone numbers are static HTML.
7. The first SMS to a new opt-in is the registered opt-in message, word for word.
8. The visitor always sees success. GHL failures are logged in full (consider adding an email alert).
9. Stub mode when env vars are missing. Local runs never write to GHL.
10. Deploy only the site files (`docs/`, screenshots and CLAUDE.md stay private).
11. The privacy and terms pages pass GHL's compliance checklist (section 9) before submitting A2P.
12. HELP and contact details on the legal pages are real.

---

## 15. Chronological decision log (Saltmarsh session)

| Date | Decision |
|---|---|
| 2026-10-01 | Brand approved: Saltmarsh Realty Group, "Marsh & Shingle" (Young Serif + Libre Franklin; brass and cream rejected as clichés). Fictional agents, 555 numbers, .example email. `noindex`. |
| 2026-10-01 | Gate built (4th unique listing, hard/soft, `?reset=1`). Gate copy softened to "Looking for homes?". |
| 2026-10-01 | Deployed to `saltmarsh-demo-458` (`saltmarsh-demo` was taken), always from a clean copy so `docs/` stays private. |
| 2026-10-01 | Hero restructured after a reference (structure only): transparent header, photo hero, buy/sell/phone buttons, "Why Saltmarsh" panel, `/home-value` seller form. |
| 2026-10-01 | `DEMO_MODE`: gate state per tab, so demos reset themselves. |
| 2026-10-01 | GHL client built (upsert → tags → note, stub mode, never-lose-a-lead). Verified against a mock, then live. |
| 2026-10-01 | Operator disclosure: Ironweb Digital Growth (DBA) in the footer, privacy, terms and consent text. Real contact: colin19sullivan@gmail.com. |
| 2026-10-01 | SMS consent made **optional**, overriding the spec's "required", because carriers reject forced opt-in. |
| 2026-10-01 | A2P compliance fixes: static HTML opt-in form, "marketing and informational" wording, data security section, 18+ terms. |
| 2026-10-01 | Custom fields created (keys verified working); "Website Leads" pipeline; `assigned_agent` field; Workflow 1 built (Draft). |
| 2026-10-03 | Demo A2P **rejected**, parked. Snapshot direction: Conversation AI, round robin, admin automation (`ghl-snapshot.md`). |
| 2026-10-06 | This playbook and the generic kit written; kit tested (15 mock checks plus a browser test). |

## 16. Open items

- Review the Saltmarsh A2P rejection reason, so client registrations don't hit the same issue.
- Email Colin automatically on `GHL FAILED`.
- Decide on IDX (MLS PIN vs Rhode Island; iHomefinder / IDX Broker / Showcase IDX vs a custom feed) for the first real client.
- Turn the Saltmarsh site into a client template (one `client.json` plus a fill-in script), as proposed.
- Pricing tiers inside $500–800/month (AI qualifying as the top tier?), the website fee, and the outreach list.
- Build W2–W11 in the demo sub-account, test them, then save the snapshot.
