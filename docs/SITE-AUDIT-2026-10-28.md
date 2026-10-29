# IronWeb Digital site audit (2026-10-28)

Scope: everything live on ironwebdigital.com as of deploy 6ae1554d659153d5269de27f, plus the code, CRM wiring and
project setup behind it. Prepared by Claude Code for Colin; written so Hound and ChatGPT can read it cold.

## 1. The core problem in one paragraph

The site was built in four passes, each with a different main message, and later passes were added on top of
earlier ones instead of replacing them:

| Pass | Date | Main message | Still visible on |
|---|---|---|---|
| Rebuild / demo-first | Oct 7-8 | "Get your free demo" (homepage preview) | Build, Contact ("free homepage preview" steps) |
| Website-first | Oct 10 | "Let's talk about your website", "Explore the demo" | About, Build, Portfolio, Contact, mobile menu, contact form budget options |
| Speed-to-lead | Oct 11 | "Every lead answered in 60 seconds", "Text me the demo" | Homepage form ("Try it: text me the demo", "Be the lead"), Saltmarsh SMS mockup |
| Automation offer architecture | Oct 16 | "Systems that Stick", $97 stages, bundles | Homepage hero + ladder + bundles, Automations, Bundles |
| Contractor demo | Oct 27 | Live interactive demo with real text + AI receptionist | /contractor-demo/ only (buried in the Services menu) |

Each piece is reasonable alone. Together a visitor gets several different pitches, three different "demos", and
seven different calls to action. The best asset on the site (a live demo that actually texts you and an AI
receptionist that actually answers) is the hardest thing to find.

## 2. Positioning and messaging

- **Two opposite stories.** Homepage, Automations, Bundles: automations first, websites secondary. About, Build,
  Portfolio, Contact: websites first ("Let's talk about your website" is the H1 of Contact and the closing CTA
  of About, Build and Portfolio).
- **The homepage itself is mixed.** In order: automation hero, a *website* demo ("what a customer experiences on an
  IronWeb website"), automation ladder, bundles, websites, portfolio, *website* project process ("Free homepage
  preview"), FAQ, speed-to-lead form ("Be the lead"). Three of nine sections sell websites, and the closing form
  promises a "free homepage preview".
- **Audience drifts.** Homepage title says contractors and realtors in Southeastern MA; footer says "contractors,
  real estate and local businesses ... nationwide"; About says "Built for contractors and real estate. Open to
  others."; the live demo is contractor-only; the homepage ladder example is a real estate SMS (Saltmarsh Realty).
- **Product names don't line up.** "Contractor Core" (demo), "Contractor Bundle" (pricing), stages 1-3 (ladder),
  "building blocks" (Automations page), "IronWeb Build", "Compact Build", "IronWeb Growth", "AIISA". A visitor
  can't tell how these relate.

## 3. Structure and navigation

Current header: Portfolio · Services (6 items) · About · call button.
Services menu: All services, Websites, Automations, Bundles, Growth, Contractor demo.

- **The menu is upside down for the current offer.** The lead offer (automations) is item 3 of 6 inside a dropdown;
  the demo is item 6; Websites is item 2.
- **/services/ duplicates three other pages.** It was adapted from the old site (Oct 11) and restates Build,
  Automations, Growth and local search, each with its own price line and CTA, then sends people back to those pages.
- **Automations vs Bundles split.** The ladder lives on the homepage; /automations/ uses the same H1 ("Start small.
  Grow big.") but presents five "building blocks" in a card grid with "Ask about this automation" buttons, which
  reads as the pick-and-choose menu the Oct 16 brief rules out. Its "Further out: AIISA and an AI agent team"
  interest form is a fourth lead path.
- **Mobile menu** still ends with "Explore the demo" (to the old homepage website demo) and "Let's talk about your
  website".
- **Footer** lists the same six service links; no Demo or Pricing entry.

## 4. Page by page

| Page | Words | What works | What's wrong |
|---|---|---|---|
| Home `/` | ~2,000 | Hero, video, ladder, bundles, FAQ, honest form states | Too long; 3 website sections; old industry demo instead of the live demo; 2 forms' worth of CTAs ("Text DEMO", "Or we'll text you", "Try it: text me the demo"); closing form promises a homepage preview |
| Services `/services/` | 810 | Clear plain-language sections | Duplicates 3 pages; mixes old and new prices; CTA "Book your demo" goes to the homepage form |
| Build `/build/` | 998 | Thorough (payment, timeline, ownership) | Website-first copy; "$1,500 setup + $100/month" IronWeb Build not in the Oct 16 architecture; "free homepage preview" process; 4x "Let's talk about your website" + 2x "Explore the demo" |
| Automations `/automations/` | 802 | Good problem/what-it-does copy per automation | Same H1 as homepage section; menu-style grid; AIISA interest form; CTAs go to Contact "Book a Call" which isn't bookable |
| Bundles `/automations/bundles/` | 398 | Clean; usage billing disclosed | CTAs go to the homepage form (`/#talk`) and to Contact |
| Growth `/growth/` | 480 | Honest scope ("what's quoted separately") | $597/mo content + ads from $750/mo sit outside the current offer; 3x "Book a Call" to an unbookable section |
| Contractor demo | 928 | The strongest page: live, honest statuses, real text, real receptionist | Not in the main nav; different visual language and title case headings; ends on "Explore IronWeb Services" back to /services/ |
| Portfolio | 243 | Real sites | Website-only framing; no automation proof |
| About | 292 | Honest founder story, "You talk to Colin" | Closes with website CTA + old demo |
| Contact | 556 | Two working forms | H1 is "Let's talk about your website"; budget options ($1,000 to $5,000+) are website budgets; **"Book a call" says online booking "is being connected"** although a booking calendar now exists |
| Privacy / Terms | 690 | Cover the text program, legal name | Need a check against what the site now does (AI receptionist calls, demo texts) |

## 5. Offers and pricing

`src/data.mjs` PRICES still holds every offer from every pass:

| Offer | Price | Where shown | Status vs Oct 16 architecture |
|---|---|---|---|
| Automation stage | $97/month each, no setup | Home, Automations, Services | Current (the wedge) |
| Contractor Bundle | $297/month, $497 setup (waived w/ 6 mo prepaid) | Home, Bundles, Services | Current |
| Real Estate Bundle | $397/month, same setup terms | Home, Bundles | Current |
| Compact Build (website) | $600 one-time, or "$600 value, included" with a bundle | Home, Build, Services | Current |
| Landing page / funnel | $97 one-time each | Build | Not addressed in Oct 16; same number as a stage, which confuses |
| IronWeb Build | $1,500 setup + $100/month | Build, Services | **Open question since Oct 16** (keep, rework, drop) |
| IronWeb Growth | $597/month | Growth, Services | Not in the architecture |
| Paid ads | from $750/month + spend; expanded from $1,000 | Growth, Services | Not in the architecture |
| IronWeb Operate / Custom Operate | $750 + $297/mo; up to $1,000 + $350/mo | Not shown (removed Oct 16) | Dead data, still in PRICES |
| AIISA / AI agent team | interest list | Automations | Undefined offer |

Effects: seven prices on /services/ alone; "$97" means both a monthly stage and a one-time landing page; the
Contractor Bundle ($297/month) shares a number with the removed Operate monthly fee.

## 6. Calls to action, forms and lead paths

Distinct CTA labels in use: "Text DEMO to (774) 486-7776", "Or we'll text you", "Try it: text me the demo",
"Explore the demo", "Let's talk about your website", "Start your website project", "Book your demo", "Book a Call",
"Send an inquiry", "Ask about the X Bundle", "Ask about this automation", "Try the Live Demo",
"Book Your IronWeb Consultation", "Call (774) 486-7776", plus the header call button.

Ways a lead can reach you today (7):

| Path | Where | Goes to CRM as | Opportunity? |
|---|---|---|---|
| Text DEMO keyword | Hero sms: link | Depends on a DEMO keyword workflow in the CRM (not verified) | ? |
| Homepage "text me the demo" form (`speed`) | Home | tag `website lead`, SMS consent required | No (see 8) |
| Contact "talk about your website" form (`demo`) | Contact | website-inquiry tags | No |
| Contact inquiry form (`inquiry`) | Contact | inquiry tags | No |
| AIISA interest form (`agentic`) | Automations | interest tags | No |
| Contractor demo estimate form | /contractor-demo/ | demo tags, demo pipeline | Yes (demo pipeline) |
| Phone call / AI receptionist | (774) 486-7776 everywhere | Receptionist's own CRM handling | ? |

Problems:
- **"Book a Call" is a dead end.** Five buttons on Automations, Bundles and Growth go to
  `/contact/#book`, which says booking "is being connected". The contractor demo's consultation button goes to a
  real calendar; nothing else does.
- **Homepage form requires SMS consent** (Colin's Oct 11 decision). Still flagged as an A2P / forced-opt-in risk;
  the contractor demo uses optional consent.
- **Bundles CTAs** send people from /automations/bundles/ back to the homepage form, which is framed as a demo
  request, not a bundle inquiry.

## 7. The three demos

1. **Homepage "See it in action"** (Oct 10): a clickable mock *website* for trades / real estate / local services.
   Shows websites, not automations. Linked by "Explore the demo" on About, Build, Portfolio, mobile menu.
2. **"Text DEMO"** (Oct 16 hero): depends on a keyword workflow on the A2P line; the site can't see it working.
3. **/contractor-demo/** (Oct 27): the real system, live end to end, plus the AI receptionist.

Only one should be called "the demo". The live one is the obvious choice for contractors; real estate has no
equivalent yet.

## 8. CRM and operations (affects what the site can promise)

- **Main site forms create no opportunity.** Netlify Production only has `GHL_API_KEY` and `GHL_LOCATION_ID`;
  `GHL_PIPELINE_ID` / `GHL_PIPELINE_STAGE_ID` are unset, so `/api/lead` leads get a contact, tags and note but no
  pipeline card. Only demo leads land in a pipeline.
- **One phone number does everything.** (774) 486-7776 is the A2P texting line, the main business line in the header
  and footer, the "Text DEMO" number, and the AI receptionist. The receptionist answers as Summit Home Services in
  the demo context; real sales calls hit the same line. Contacts it creates mix with real leads.
- **Owner alerts for demo leads** are not wired (DEMO - 0 has no opportunity trigger; owner mobile is a placeholder).
- **Booking** exists only as the demo consultation calendar.

## 9. SEO

- Titles and meta descriptions are present and specific on every page.
- Structured data (JSON-LD) only on Home and About; no Service / Offer / FAQ markup on Services, Automations,
  Bundles, Build, or the FAQ blocks.
- Several pages compete for the same terms (Home, Services, Automations, Bundles all target automations for
  contractors); consolidating pages will help, not hurt.
- Homepage title leads with "Missed-Call Text-Back", which is one Stage 2 feature, not the offer.
- Sitemap and redirects are fine; any page merges need new 301s.

## 10. Technical and project hygiene

- **No version control.** The project folder is not a git repo. The only history is Netlify's deploy list and
  CLAUDE.md. A cleanup this size should start with `git init` and a first commit (and a private GitHub remote,
  which could sit alongside the knowledge base repo).
- **Stray Netlify site** `soft-dango-e8c2e6` still serves an Oct 27 copy of the site at its netlify.app address.
- **Dead code/data:** Operate and Custom Operate prices, `proofStrip()`, the old homepage demo (`demo.js`, ~130
  lines + CSS) once replaced, speed-to-lead copy.
- **One 1,400-line stylesheet** with the demo's styles appended; fine for performance (92 KB total CSS) but hard to
  maintain. `src/pages.mjs` is 1,100+ lines holding every page.
- **Root clutter:** source PNGs (4 MB), an unused `CLAUDE-template.md`, `temporary screenshots/`.
- **Test suite:** 267 browser checks plus 41 function tests, good coverage; two homepage scroll checks are flaky.
  Many checks assert old copy, so they will need updating as copy changes (that is expected, not a problem).
- **Performance:** hero video 0.8 MB desktop / 0.4 MB mobile with posters; images 3.5 MB total across all pages.
  Acceptable; no action needed now.

## 11. What to keep (don't lose these in the cleanup)

- Hero ("Systems that Stick", video, Text DEMO) and the brand system.
- The three-stage ladder and the two bundles as the offer.
- The live contractor demo and the honest Confirmed / Pending / Simulated statuses.
- Honest form behaviour (success only on CRM acceptance), the legal name in consent text, no invented proof.
- Real portfolio sites; the objection FAQ; the Automations page's problem / what-it-does copy (reuse it inside the
  ladder stages).
- Test suite and the deploy discipline (checks pass before deploy; deploy only on Colin's word).

## 12. Decisions needed from Colin

1. **Primary action site-wide:** "Text DEMO to (774) 486-7776" or "Try the live demo" (/contractor-demo/)? The
   other becomes the secondary everywhere.
2. **Audience:** contractors only for now, or contractors + real estate? (The demo and portfolio are contractor
   heavy; the Real Estate Bundle has no demo.)
3. **Old offers:** keep / rework / drop for IronWeb Build ($1,500 + $100/mo), Growth ($597/mo), paid ads, $97
   landing pages, AIISA interest list.
4. **Booking:** use one real calendar for every "book a call" button (the demo consultation calendar or a new
   general one), or remove booking language and go text/call only?
5. **Phone line:** keep one number for everything, or move the AI receptionist demo to a dedicated number later?
6. **Main form pipeline:** should site leads create an opportunity in a sales pipeline? (needs the pipeline and
   stage ids)

## 13. Proposed cleanup, in stages

Each stage is built locally, reviewed by Colin, then deployed only on his word.

**Stage 0: Safety net (no visible change)**
`git init` + first commit; private GitHub remote; delete the stray Netlify site (with Colin's OK); tidy root files.

**Stage 1: Decide the message (doc only)**
Settle the six decisions above. Write a one-page messaging sheet (one-liner, audience, offer names, primary and
secondary CTA, price list) into the knowledge base. Everything after this follows it.

**Stage 2: Structure and navigation**
Proposed sitemap: Home · How it works (ladder + bundles + pricing on one page) · Demo · Websites · Portfolio ·
About · Contact. Merge /services/ and /automations/bundles/ into "How it works" (301 redirects); fold Growth into
Websites or an add-ons section (or drop, per decision 3). Header: How it works · Demo · Websites · Portfolio ·
About + call button. Footer to match.

**Stage 3: Homepage**
Cut to: hero, live demo teaser (links to /contractor-demo/), ladder, bundles, websites (short), portfolio, FAQ,
one closing CTA. Remove the old industry demo and the website process section. Target roughly half the current
length.

**Stage 4: Inner pages**
Rewrite About, Contact, Websites (Build), Portfolio closings to the single story and CTA pair. Contact: one form,
no website budget picker, real booking (or none). Restyle the demo page headings to match the site.

**Stage 5: Offers and data**
Clean PRICES to the decided list; remove dead offers and code; one name per product used everywhere.

**Stage 6: CRM wiring that the copy depends on**
Booking calendar on every "book" CTA; main-form opportunities (if decided); Text DEMO keyword verified end to end;
owner alerts for demo leads.

**Stage 7: SEO and polish**
Titles per page around the offer, Service/FAQ structured data, update the test suite to the new copy, final QA on
phone and desktop, deploy.
