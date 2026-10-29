# CLAUDE.md — IronWeb Digital V2

Read `CLAUDE-CODE-HANDOFF.md` (approved brief), `README.md` and `docs/INTEGRATION-CHECKLIST.md` first.
`ironweb-ghl-playbook.md` is background for the CRM wiring; where it conflicts with the handoff, the handoff wins.

## Hard rules
- v3 (2026-10-28) is the source of truth: docs/IRONWEB-V3-SPEC.md. Contractors and trades only (no real estate).
  Published products ONLY: IW Build $600 one-time + $97/month; IW Grow $597/month + ad spend; IW Operate $297/month
  (managed Operate "pricing on request", no number). NOT public: the $900 combined package, content shoots, AI agent
  claims. All Oct 16 offers (stage ladder, bundles, $497 setup) are gone.
- Hero: "Systems That Stick." (H1, also in footer), kicker "Never miss another opportunity.", primary (red)
  "Request your free audit" -> /contact/#audit, secondary "See how the system works" -> /demo/. Keep the video hero.
- Menu: Home, Portfolio, Services (IW Build, IW Grow, IW Operate), Demo, About, Contact. One primary action per section.
- Audit form (intent `audit`): tag "website lead" (+ website-audit-request), SMS consent OPTIONAL, opportunity in the
  "Website Leads" pipeline, first stage (looked up by name). Build page preview form (intent `preview`): tag needs-demo.
  Booking calendar embedded on /demo/ and /contact/ (frame-src allows api.leadconnectorhq.com).
- No em dashes anywhere in copy (scripts/check.mjs asserts it on every page).
- Hero background = animated circuit video (see README); headline, nav and buttons stay real HTML.
- Prices live only in `src/data.mjs` (PRODUCTS). Always state one-time vs. monthly.
- Never name GHL/GoHighLevel/LeadConnector, Kling, Claude or Netlify in public copy (`scripts/check.mjs` enforces this).
- No invented reviews, results, credentials, team, social links, or camera/content-shoot services.
  Testimonials with `placeholder: true` never render publicly (preview: SHOW_PLACEHOLDERS=1 node scripts/build.mjs).
- Forms: success only on CRM acceptance (`200 {ok:true}`); stub/failed states must say nothing was sent.
- Tests: run the dev server on a free port and pass BASE, e.g. `PORT=3007 node serve.mjs` then
  `BASE=http://localhost:3007 node scripts/check.mjs` (port 3001 may be used by other projects). Restart the server
  between back-to-back suite runs (the form rate limiter is in-memory).
- Contractor demo: never enable CONTRACTOR_DEMO_LIVE / _TRIGGER_WORKFLOWS / receptionist without Colin's approval;
  tests: `node tests/contractor-demo-test.mjs`, `node tests/lead-test.mjs`. Deploy with
  `--site 59c7e19d-6809-4e72-ace9-1d8c1c552921` only after the browser suite passes.
- Edit `src/`, then `node scripts/build.mjs`. Don't hand-edit generated HTML in `site/`.
- Don't deploy to production without Colin's explicit instruction.

## Decision log (newest first)
- 2026-10-28: v3 DEPLOYED (deploy 6ae2b513df941fea9e990185; rollback 6ae1554d659153d5269de27f). Live checks: audit form
  PASS (contact + website lead tags + Website Leads opportunity created); preview form PASS (needs-demo, no opp);
  booking UNCONFIRMED (test "IronWeb TestBooking" Oct 29 8:00 AM submitted, slot still offered afterwards).
  Test contacts to delete: IronWeb TestAudit, IronWeb TestPreview, IronWeb TestBooking (555-0199, +v3 emails).
- 2026-10-28: v3 built on the existing engine. Pages: / /build/ /grow/ /operate/ /demo/ /portfolio/
  /about/ /contact/ (+ legal). Removed /services/ /automations/ /automations/bundles/ /growth/ /contractor-demo/ with
  301s. Old intents speed/inquiry/demo/agentic removed. Homepage industry demo moved to /build/ (trades only).
  Homes by Heroux -> homesbyheroux.com. Ocean Groove on Portfolio only. Tests: lead 15, demo 25, browser 265, QA pass.
- 2026-10-28: Project is now a git repo (branch main, baseline bbab09b = live deploy 6ae1554d). Commit after each
  cleanup stage; LF line endings (core.autocrlf false). Site audit + staged cleanup plan: docs/SITE-AUDIT-2026-10-28.md.
- 2026-10-27: AI receptionist enabled on the demo (Colin set CONTRACTOR_DEMO_RECEPTIONIST_ENABLED=true, NUMBER
  +17744867776, IronWeb's main line). Deployed 6ae1554d659153d5269de27f. Next: site cleanup (one story, one demo,
  one primary CTA); awaiting Colin's decisions + context from other agents.
- Note: scripts/check.mjs homepage example-site scroll checks are occasionally flaky; rerun on a fresh server.
- 2026-10-27: First successful live demo test: contact, tags, note, New Lead opportunity created; Colin published the
  DEMO workflows and the DEMO - 01 text arrived. Demo is fully live for the public (texts go to consenting visitors).
  CONTRACTOR_DEMO_TRIGGER_WORKFLOWS still unset; owner alert still Simulated (DEMO - 0 has no opportunity trigger).
- 2026-10-27: First live demo test failed at opportunity search (422: under Version 'v3' the endpoint rejects
  location_id/pipeline_id/contact_id). Opportunity calls now send Version 2021-07-28 (tested); contact calls keep v3.
  Failures log the step + scrubbed CRM message and tell the page when the contact was already saved. Deployed
  6ae150d653cc24691cbc464f.
- 2026-10-27: Deployed Oct 16 homepage rework + contractor demo (preview mode) to ironwebdigital.com (deploy
  6ae149a6c21a18b664736e59; rollback 6ace6e7d62e5436780d46901). The folder had been linked to the wrong Netlify site
  (soft-dango-e8c2e6, no domain); relinked to "ironwebdigital" 59c7e19d-6809-4e72-ace9-1d8c1c552921. Always deploy
  with that site id. Then CONTRACTOR_DEMO_LIVE=true set on Production (Colin) and redeployed (deploy
  6ae14aae0cc94999318a4ed7): demo is LIVE (CRM writes), TRIGGER_WORKFLOWS unset, DEMO workflows still Draft.
- 2026-10-27 (latest): Demo owner alert always reports "Simulated" (DEMO - 0 doesn't fire on opportunity creation;
  only the trigger tag, which stays off, would start it). First live test may run in production (all DEMO workflows
  Draft). "Website leads" integration gets View/Edit Opportunities (Colin). (774) 486-7776 is IronWeb's own
  A2P-verified line, so "Text DEMO" stays.
- 2026-10-27: DEMO - 01 triggers on Opportunity created (demo pipeline, New Lead) and requires BOTH demo tags, so the
  endpoint must tag before creating the opportunity (tested). Consent tag always applied; texting gated by DEMO - 01
  publish state. CONTRACTOR_DEMO_TRIGGER_WORKFLOWS stays false. Page reports the text as Pending when a new
  opportunity was created with consent. Booking confirmations are tracked in GHL, clicks only on the site.
- 2026-10-27: Demo consultation CTA -> https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo (default in
  contractor-demo-config.mjs, env override; opens in a new tab). DEMO - 01 texts only contacts with BOTH demo tags.
- 2026-10-27 (later): GHL side set up by Colin. Demo tags are lowercase (`iw-contractor-demo`,
  `iw-contractor-demo-sms-consent`). Endpoint always ensures one open opportunity in pipeline z39DlXlHDKhSdPpo4FUz
  "New Lead" (stage looked up by name, cached); existing contacts keep name/source (search duplicate, no upsert).
  Workflows stay Draft until tested; receptionist + booking stay "Coming soon". Live flags still OFF.
- 2026-10-27: Contractor Core interactive demo at /contractor-demo/ (+ Services menu, mobile menu, footer). Endpoint
  /api/contractor-demo, PREVIEW by default; live CRM writes and workflow triggers are separate env flags, both off.
  Isolation tag `iw-contractor-demo` always applied before the `new lead - website` trigger, which is only added with
  SMS consent. Receptionist hidden ("Coming soon") until enabled with a validated number. No em dashes kept (house
  rule) even though the brief's copy used them. Not deployed. See docs/INTEGRATION-CHECKLIST.md section 9.
- 2026-10-27: Fixed cross-page anchor landings (e.g. /build/ -> /#demo) overshooting: main.js disables smooth
  scrolling during an anchor landing, aligns once after load + fonts, then restores it.
- 2026-10-16: Homepage reworked around the automation offer architecture (Colin's prompt file). Order: hero, demo,
  ladder (#automation), bundles, websites (#value), portfolio, testimonials (hidden until real), process, objection
  FAQ, text-me form. /automations/bundles/ now shows Contractor + Real Estate bundles (IronWeb Operate $750+$297 and
  Custom Operate removed). Not deployed yet.
- 2026-10-13: Deployed mobile hero centring fix (deploy 6ace6e7d62e5436780d46901; rollback 6acd89ed34bea69e8543a2a7).
- 2026-10-13: Mobile hero was off-centre when the desktop video file played at phone width (source media is only read once at load). main.js now picks the mobile/desktop file for the current width on load and on breakpoint change.
- 2026-10-12: Deployed animated hero video (deploy 6acd89ed34bea69e8543a2a7; rollback 6acd093e34730f66a25fb177).
- 2026-10-12: Hero background is the animated circuit video (autoplay muted loop playsinline; phones get a chip-centred
  640px crop; first-frame posters; pause button; reduced motion = still). Encoding steps in README.
- 2026-10-12: Deployed IW processor hero (deploy 6acd093e34730f66a25fb177; rollback 6acc4e3cc15d914af63c0963).
- 2026-10-12: Homepage hero background is now brand_assets/IW laser engraving on a processor.png (hero-chip-*.jpg) with a 45% dark overlay; copy/layout unchanged. Inner page heads still use the rebar art.
- 2026-10-12: Deployed services page + email fix + legal name (deploy 6acc4e3cc15d914af63c0963; rollback 6acc42eace03373e6d8c1e13).
- 2026-10-11: /services/ overview page added, adapted from the old site's services page (copy + structure). Dropped/reworded:
  drone/FAA, "Rank #1", 50+ directories, 24/7 AI chat, 5-minute replies, "our team". Local SEO is presented as included in builds.
- 2026-10-11: First live GHL test: auth OK; CRM 422 on "name@gmail.com." (trailing dot). Email validation tightened +
  trailing dot trimmed; CRM 422 email/phone shown as field errors. Legal/SMS sender name is "Ironweb Digital Growth"
  (registered DBA) via SITE.legalName: consent labels, legal pages, footer. Brand stays "IronWeb Digital".
- 2026-10-11: Deployed Book your demo + Portfolio rename + Ocean Groove (deploy 6acc32431511aa8f8c89ba96; rollback 6acc19618aa94a33f1cf8d11).
- 2026-10-11: Work page renamed Portfolio at /portfolio/ (/work/ redirects). Ocean Groove added to the Portfolio page
  (`homepage: false`); homepage keeps TMR, All Phaze, Homes by Heroux.
- 2026-10-11: Proof strip removed from the homepage (Colin). `proofStrip()` remains in components if wanted later.
- 2026-10-11: Hero primary CTA is "Book your demo" -> #talk (the working demo-request form; the calendar isn't connected).
- 2026-10-11: Deployed hero restore + cache-busting to production (deploy 6acc19618aa94a33f1cf8d11; rollback 6acc15648aa94a1a34cf8d34).
- 2026-10-11 (latest): Hero restored to the Oct 10 version at Colin's request ("Your next customer is looking.",
  Explore the demo / View Our Work, BUILD/GROWTH/OPERATE signature). The Saltmarsh SMS mockup moved beside
  "Never miss another lead." Video and headshot blocks render only once files exist (no bracket placeholders).
  CSS/JS URLs are content-hashed (`asset()` in src/components.mjs) because /assets/* is cached for 7 days; the
  unstyled sections Colin saw were a stale cached site.css.
- 2026-10-11: Speed-to-lead homepage deployed to production on Colin's instruction (deploy 6acc15648aa94a1a34cf8d34;
  rollback point 6aca802f77f564193d6e1e2e). CRM env vars still unset at deploy: forms return not_connected.
- 2026-10-11 (later): Public phone is (774) 486-7776 / +17744867776 everywhere (Colin; replaces 451-3964).
  Top-right header button is a call button to that number (mobile: call icon beside the menu); this replaces the
  header "Explore the demo". Third portfolio client = Homes by Heroux, linking to homes-by-heroux.netlify.app
  (URL bar shows homesbyheroux.com); switch `url` to https://www.homesbyheroux.com/ once his domain moves.
  No testimonials yet: the homepage block renders only when a real quote is added to TESTIMONIALS.
- 2026-10-11: Homepage reworked to sell speed-to-lead (Colin). H1 "Every lead answered in 60 seconds.", hero CTA
  "Try it: text me the demo" -> #talk, CSS phone mockup (Saltmarsh Realty), proof strip, automations moved up as
  "Never miss another lead.", single homepage price line, testimonial/portfolio/video/headshot placeholders.
  #talk form = intent `speed` (tag "website lead"): name, mobile, email required; SMS consent REQUIRED by Colin's
  decision despite A2P/forced-opt-in risk (Contact keeps the optional-consent path). Env var GHL_API_KEY
  (GHL_TOKEN fallback). Public email is now colin@ironwebdigital.com. Placeholders must be filled before deploy:
  `node scripts/qa.mjs` + grep for "[" placeholders. Colin deploys himself.
- 2026-10-10: V2 deployed to production at ironwebdigital.com on Colin's instruction (deploy 6aca802f77f564193d6e1e2e;
  previous live deploy 6a4c5efaf7b5d74d1b147b90 is the rollback point). Forms/booking still unconnected at launch.
- 2026-10-10: Website-first repositioning. Header + hero CTA "Explore the demo" (supersedes the Oct 8 "Book a Call"
  header button). Interactive industry demo at /#demo; free homepage preview folded into "Let's talk about your
  website" (intent `demo` unchanged). Home order: hero, demo, work, value, process, automations, talk. New
  /automations/ menu and /automations/bundles/; /operate/ redirects. See the Oct 10 Revision in CLAUDE-CODE-HANDOFF.md.
- 2026-10-08: Demo-first. Primary CTA "Get Your Free Demo" → /#demo (one demo form, on Home, right after Work);
  "Book a Call" is secondary (Contact, CTA bands; contextual primary on Growth/Operate). Demo journey = request →
  Colin follows up personally → homepage preview → prospect decides; a call is optional. Optional fields sit in
  an "Add project details" disclosure (open on Contact for A2P review). Founder line: "With experience in
  construction, sitework, and inside sales…" with no chronology. Full detail: the Revision section at the end of
  CLAUDE-CODE-HANDOFF.md. scripts/check.mjs asserts these, so a regression fails the check.
- 2026-10-07: Rebuild from handoff. Sharp/unblurred hero (overrides earlier blur notes). Contact is
  (774) 451-3964 / Colin19sullivan@gmail.com (overrides old site's 774-486-7776 / colin@ironwebdigital.com).
  Montserrat headlines, Orbitron only for small labels (overrides old "Orbitron for all headings").
  Portfolio = TMR, All Phaze, Ocean Groove; old portfolio/pricing/services URLs redirect.
  Playbook's "visitor always sees success" replaced by honest error states per handoff.
  Hero desktop height: full viewport (Colin, 2026-10-07, after preview; replaced the earlier 34.7vw board-proportion height).
