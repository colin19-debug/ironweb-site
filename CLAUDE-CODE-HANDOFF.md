# IronWeb Digital — website rebuild brief

Approved direction, October 7, 2026. Owner: Colin Sullivan.

## Your task

Rebuild the existing ironwebdigital.com website as a polished multipage site using this brief and the attached visual assets. Inspect the existing repository, its instructions, deployment configuration, and forms before editing. Retain the existing stack and Netlify deployment where practical. Do not replace the project with a generic template. Work through implementation and local preview verification; report missing integration credentials precisely. Do not publish to production without Colin's instruction.

The deliverable is a functioning responsive website, not an image of a website. Preserve useful existing URLs or provide redirects for replaced routes. Do not delete unrelated assets or functionality. Work on a branch where available.

## Visual authority and assets

The owner approved the included brand board as PERFECT and requested that the hero look exactly like its hero composition. Treat it as the primary design reference, not loose inspiration.

- assets/ironweb-brand-board.png: approved brand direction and desktop hero composition.
- assets/ironweb-hero-dark-soft.png: superseded optional treatment; do not use by default.
- assets/ironweb-hero-sharp-source.png: latest approved hero background and poster. Owner reverted to the UNBLURRED version. Use this sharp source for the hero/video reference.
- A Kling-generated video will be supplied separately. It has NOT been created or included in this handoff. Build with the still now; make video replacement straightforward.

Do not display the brand board itself as the webpage. Build real HTML text, navigation, forms and buttons. Do not bake the headline into the video. Create separate responsive logo assets from the approved reference/existing identity; never stretch a whole brand-board crop as the logo. If a clean matching logo asset cannot be obtained, explicitly identify that asset need rather than quietly substituting an unrelated logo.

Palette: near-black #0B0B0F, charcoal #1A1A22, iron red #C1121F, white #F1F1F1, muted steel #A0A0A8, sparing steel blue #3A86FF. Red is the primary accent. Use Montserrat for readable headlines/body; Orbitron selectively for display accents. The reference logo has a custom angular wordmark; typography labels are not a promise that the logo is an unmodified font.

Mood: professional, enterprise-friendly with teeth; confident, direct, sales-oriented, angular and deliberate. Metallic web identity, clipped corners, subtle fine borders, strong whitespace. No generic robots, neon cyberpunk, excessive floating cards or invented performance statistics. Do not make the whole site illegible futuristic lettering.

## Business and audience

IronWeb Digital helps businesses with websites, marketing and follow-up. Primary audience: contractors and real estate. Serves small businesses nationwide and welcomes restaurants, bands and other creative projects. Based in Swansea, Massachusetts. On-site content work can be quoted across New England; digital services are nationwide.

Sell practical outcomes without guaranteeing revenue, rankings or lead counts. Emphasize attention, trust, clear next steps and consistent follow-up. The website itself can function as a conversion funnel; do not imply a separate funnel purchase is required to generate inquiries.

Customer-facing brand: IronWeb Digital. Service families: Build / Growth / Operate. Never name GoHighLevel or GHL in public copy. Call it the included software subscription, business platform or automation system as appropriate. GHL may be named in private implementation documentation.

## Approved prices and scope

All prices USD. Do not reuse older offers from the existing website.

| Offer | Price | Scope |
|---|---|---|
| Compact Build | $600 one-time | Focused 1–3-page straightforward site, completion and handoff. No compulsory IronWeb monthly plan; client-arranged hosting or optional managed plan. This hosting interpretation was stated in the planning exchange; make the hosting arrangement explicit in the quote. |
| IronWeb Build | $1,500 setup + $100/month | Up to five pages, professional copy, mobile optimization, forms, basic SEO, animation where relevant, two consolidated revision rounds plus a final polish pass. Managed hosting and one hour of edits per month. |
| Landing page / simple funnel add-on | $97 each | Existing managed clients, existing branding, one focused campaign. Simple funnel may be landing page plus thank-you page. No additional recurring management fee for the add-on. Bespoke functionality/integrations separately quoted; edits remain inside the existing monthly allowance. |
| IronWeb Growth | $597/month | Three original posts per week, adapted across agreed channels including social and Google Business Profile. Captions, scheduling and client approval included. |
| Paid Ads: one platform | $750/month + ad spend | Agreed advertising platform, campaign management, optimization and monthly reporting. Define campaign/creative scope in proposal. |
| Paid Ads: expanded scope | From $1,000/month + ad spend | Multiple platforms or more complex campaigns, scoped by proposal. |
| IronWeb Operate | $750 setup + $297/month | Standard missed-call text-back, speed-to-lead, nurture pipelines, review requests, software subscription and upkeep of agreed automations. |
| Custom Operate | Up to $1,000 setup + $350/month for the discussed expanded package | More involved automation scope, quoted after discovery. Do not imply an unlimited custom-development ceiling. |
| Agentic Operations | In development — interest form | Future AI chief of staff with specialist agents to identify issues, draft and coordinate. No public pricing, checkout, availability promise or launch date. |

All services above except Agentic Operations are available, subject to the content-production limitations below. Growth, Ads and Operate are distinct services, not implied inclusions in Build. Make recurring versus one-time charges unmistakable.

Build payment: 50% deposit, remaining 50% before launch. One-week turnaround for the standard build starts after deposit and required materials arrive; client feedback delays move the timeline. Do not promise a one-week completion for every custom integration project.

Monthly edits cover existing text, photos, forms and offers, up to one hour. New pages, redesigns and new functionality are quoted separately. Do not invent rollover rules, cancellation notice periods, contract minimums, extra-hour rates or refund guarantees.

Managed hosting is the default for standard Build. Fully paid clients may move on and receive transferable site files/domain information where applicable. Distinguish transferable custom website files from platform-dependent automations/funnels; do not promise every system exports as a standalone site. Clients can request a handoff arrangement instead of continued management.

Messaging/phone/email/AI usage, where applicable, is billed separately from Operate's base subscription. Show a clear usage-cost note; don't invent unit rates or unlimited allowances.

Growth means three original weekly posts total, adapted to agreed platforms, not three different posts per platform. Assets may be client supplied. On-site iPhone photo/video sessions are custom quoted including travel. Owner has no professional camera setup or drone qualification yet: do not advertise currently available professional drone services or imply credentials/equipment. AI-generated video can be discussed and separately scoped, not implied unlimited in Growth. Human comment/DM management is not included. Comment/DM automation may be scoped under Operate, depending on integration support.

## Information architecture

Use /, /build, /growth, /operate, /work, /about, /contact (adapt existing routes with redirects as needed). Header: Work, Services dropdown (Build/Growth/Operate), About, prominent Book a Call. Logo links home. Pricing lives on relevant service pages; a separate pricing page is unnecessary unless the existing architecture makes it useful.

Home sequence:
1. Reference-matched hero.
2. Actual completed work: browser-style homepage previews with project name, short accurate description and Visit live site.
3. Free personalized demo offer, visibly presented on Home.
4. Build / Growth / Operate overview with clear starting/standard prices and links.
5. Short founder/trust section.
6. Simple discovery → concept → build/revisions → launch process.
7. Focused FAQ addressing price, monthly care, ownership, timeline, and demo.
8. Short inquiry form and booking CTA.

Build page: full pricing distinction, included scope, process, demo, existing-client add-ons, hosting/ownership and FAQs.
Growth page: content plan and three-post scope, asset/approval process, separate production and ad management pricing. No fabricated campaign metrics.
Operate page: concrete missed-call / inquiry response / nurture / review-request examples, pricing and usage notes. Separate In Development section for chief-of-staff service and interest form. Illustrative UI must be labeled as illustrative, not presented as client results.
Work page: actual supplied sites; no fictitious case-study outcomes.
About page: founder narrative and approach; no invented team or credentials.
Contact page: discovery-call booking plus short inquiry path; usable phone and email.

## Hero — preserve exact approved direction

Eyebrow: CONTRACTORS / REAL ESTATE
Headline: Your next customer is looking.
Make “looking.” iron red, with remaining headline off-white; line breaks follow reference on desktop and adapt sensibly on mobile.
Supporting text: Websites, marketing, and follow-up built around your business.
Primary button: Book a Call
Secondary button: View Our Work
Small service signature where space allows: BUILD / GROWTH / OPERATE.

Large metallic web positioned on right, dark copy space on left. The final background must stay SHARP and unblurred, per the latest owner correction. Use a localized CSS black gradient behind the text if needed, without globally blurring the artwork. Overlay crisp real text and buttons. Navigation is a real header above/in the hero, styled like the board.

Video integration: optional muted, looping, autoplay, playsinline background video with poster. Do not load an empty/broken source if video is absent. Render poster immediately and preserve it if playback fails. Respect prefers-reduced-motion with still image and offer an accessible pause control for persistent motion. Stop unnecessary playback offscreen. Compress and size video for the web; don't ship a huge original. No audio. No scroll hijacking. Do not stack elaborate scroll movement over the video: subtle lighting motion is sufficient.

Mobile: no tiny desktop layout shrink. Keep headline and buttons readable, use a deliberate image crop/focal position, darken behind copy as needed. No horizontal overflow. Test real narrow widths. Header dropdown and mobile menu must work with keyboard and touch.

## Portfolio

- TMR Construction — https://tmrconstructioncorp.com/
- All Phaze Property Solutions — https://allphazepropertysolutions.com/
- Ocean Groove — https://oceangroovetheband.com/

Capture current homepage screenshots for actual preview images; use browser-style frames, image dimensions and lazy loading. Visit live site is a clear external link. Do not depend on live iframe embedding. Don't invent screenshots if sites are unreachable: flag the missing capture and use an honest temporary state in development. Review live content before writing specific project descriptions. No invented traffic, ROI or conversion metrics. The planning session did not complete a visual audit of all portfolio sites.

## Founder and trust

Colin Sullivan, based in Swansea, MA. Construction/sitework background and inside-sales experience inform the business: understands owners balancing delivery with answering leads and maintaining an online presence. Write a short grounded story connecting that experience to practical websites and follow-up. Do not invent years of agency experience, certifications, employees, awards or named client endorsements. No founder photo is available; design without one. No actual testimonials yet; omit review/star widgets until real approved quotes arrive. Live work and clear process supply initial evidence.

## Conversion and integrations

Public contact: Colin19sullivan@gmail.com; (774) 451-3964. Use working mailto/tel links. Domain: https://ironwebdigital.com/. Social profiles not created: omit icons/links until real URLs exist.

Primary CTA books a discovery call directly. Secondary inquiry lets Colin personally follow up. Free-demo request available directly on Home/Build, followed by discovery/qualification before construction. Demo is a working personalized first-stage homepage made in Claude Code and privately shared via Netlify; no promise of a complete free production site or endless free revisions.

Inquiry form recommended required fields: name and email. Optional phone, business name, business-type dropdown, current website, desired-service dropdown, timeline, budget, message. The owner explicitly requires business type/current site/service/timeline/budget to be optional. Name/email required are a sensible implementation default, not a separately approved commercial term.

Suggested business choices: contractor/home services, real estate, restaurant/hospitality, music/entertainment, other. Service choices: Compact Build, Build, Growth, Paid Ads, Operate, Free Website Demo, Not Sure. Agentic interest can use a separate form/intent rather than suggesting it is purchasable.

Distinct intents: general inquiry, demo request, discovery booking, agentic interest. Capture source page and available UTM metadata. Submit to GHL through existing supported integration or a secure server-side adapter. Never expose API credentials or secret webhooks in client code. Use validated inputs, honeypot/rate limiting or existing spam controls, loading/success/error states, and duplicate-submit prevention.

On actual successful inquiry: create/update contact; create/update the correct pipeline opportunity; notify Colin via email/SMS/configured app; trigger suitable acknowledgement. Avoid duplicate contacts/opportunities/acknowledgements when an inquirer subsequently books. SMS only with a supplied number and appropriate opt-in; don't require SMS marketing consent to inquire. Respect opt-outs. Legal/privacy language must reflect actual data flows and be reviewed before launch; do not claim compliance certification.

Direct booking must use the real scheduling integration, reflect availability/timezones and sync to Colin's connected calendar. Confirm real appointment creation rather than displaying a fake success. Prefer the existing GHL calendar embed/link if configured. Include a fallback booking link if an embed cannot load.

Exact calendar link/ID, CRM location credentials, pipeline/stage IDs, webhook, notification routing, and workflow IDs were NOT supplied. Inspect existing configuration first. Prepare .env.example with placeholders and a concise integration checklist. Implement the complete frontend without pretending these connections are live. If unavailable in development, clearly distinguish demo form behavior; never show a real submission success without successful backend acceptance. Missing secrets must not block all design work.

## Content rules

Use concise, confident, clear copy, concrete benefits and transparent prices. No “guaranteed leads,” fabricated reviews, unsupported ranking claims, scarcity countdowns, stock team images, or fictitious results. Do not mention Claude Code, Kling, Netlify or GHL in sales copy unless specifically relevant to an owner-approved disclosure. Internal implementation details belong in documentation. Existing site text is not authoritative when it conflicts with this brief.

## Quality and delivery

Keep content/pricing in maintainable shared data; reusable header/footer/buttons/service cards/forms. Preserve semantic HTML and accessible labels, focus states, contrast and error messages. Optimize responsive images, font loading, below-fold assets and video. Add unique titles/descriptions, canonical URLs, sitemap/robots and accurate structured data if appropriate; no fake aggregate ratings.

Verify desktop/tablet/mobile, navigation, dropdowns, all internal/external links, tel/mailto, price consistency, poster/video fallback, reduced-motion behavior, no horizontal overflow, and form success/failure paths. Validate live CRM/calendar behavior only when configured and authorized; use tagged test data and avoid sending unnecessary real notifications. Run the project's build/lint checks. Take screenshots and compare the hero against the board. Fix material discrepancies rather than reporting them as complete.

Deliver a summary of changed files, local preview instructions, verification results, and the exact remaining launch blockers. Owner will supply video and any missing integration settings. Do not call an unconnected form or booking flow complete. Do not deploy production automatically.

## Suggested first message to Claude Code

Read this entire brief and inspect the three assets before coding. Audit the current repository, then rebuild the site to match the approved board and sharp hero treatment. Keep approved pricing and scope exact. Work autonomously through implementation and preview validation, using the still hero until I provide the video. Ask only for genuinely blocking access/configuration, and list any missing integration settings without holding up the visual build. Do not publish to production yet.

## Final asset update
The owner reverted to the sharp/unblurred hero after the initial brief. This overrides every earlier blur instruction. Use assets/ironweb-header-logo.svg (transparent, outlined lettering, off-white/red for dark backgrounds) and assets/ironweb-favicon.svg (transparent red simplified web, viewBox 64 × 64). These are clean flat vector adaptations of the approved identity, not exact metallic raster traces. No external font loading is needed for these logos. Header viewBox 680 × 160; preserve aspect ratio. Set the favicon using rel="icon" type="image/svg+xml"; generate PNG/ICO fallback from that source if needed.

## Revision — October 8, 2026 (supersedes earlier CTA and demo instructions above)

Approved by Colin after reviewing the draft preview. Future edits must not revert these.

**Demo-first CTA hierarchy**
- **Header exception (Colin, later on Oct 8):** the top-right header button is **"Book a Call"** → `/contact/#book`, as on the brand board; the mobile menu leads with Book a Call and offers the demo second.
- Primary CTA everywhere else (hero, Build plans, default CTA bands): **"Get Your Free Demo"** → `/#demo` (the homepage demo section, immediately after the portfolio). There is one demo form on the site, on Home; demo CTAs on other pages link to it.
- Hero secondary stays **"View Our Work"**.
- **"Book a Call"** is a secondary option: on Contact (`/contact/#book`), in CTA bands as the outline button, and as the contextual primary on Growth and Operate, where a homepage preview isn't the natural next step.
- The Agentic Operations form on Operate stays an interest form ("Register interest"), never a purchase or demo path.

**Demo journey (describe it the same way everywhere: Home, Build, Contact, FAQ, process)**
Request → Colin personally follows up to understand the business and qualify the project → personalized working homepage preview on a private link → the prospect decides whether to proceed.
- A scheduled call is optional and never a prerequisite for a demo.
- Don't say a demo is built for every submission before any discussion, and don't promise a delivery deadline.
- No payment or commitment to request one. The demo is a first-stage homepage preview, not a complete production site. Explain scope neutrally in the FAQ, not as restrictions in the pitch.
- Section copy: "See your new website before you commit." / "Tell us a little about your business. Colin will follow up personally, learn what you need, and create a homepage preview so you can see the direction before deciding to move forward." Steps: Tell us about your business. → We connect and create your preview. → You decide whether to move forward.
- Confirmation (only after the backend accepts): "Thanks—your demo request is in. Colin will follow up personally to learn more about your business and discuss your homepage preview." Never imply a call is booked or a demo is already being built.

**Forms**
- Demo: name + email required; business name visible and optional; current website, business type, phone, project details and the optional SMS consent sit inside an "Add project details" disclosure. Submit: "Request My Free Demo".
- General inquiry: name + email required; every other field (phone, business name/type, website, service, timeline, budget, message, SMS consent) sits inside the disclosure. The disclosure is collapsed on Home, where the inquiry is visually secondary to the demo, and open on Contact so the phone field and SMS box are visible immediately for A2P opt-in review.
- Field names and backend intents are unchanged (`demo`, `inquiry`, `agentic`; booking comes from the calendar). SMS consent stays optional and unticked.

**Founder story**
Use: "With experience in construction, sitework, and inside sales, Colin understands both delivering the work and following up with the next customer." Don't state a chronology (e.g. "construction, then inside sales"), durations, credentials or team members.

Pricing and service scope are unchanged.


## Revision — October 10, 2026: website-first (supersedes the October 8 CTA and demo decisions above)

**Direction.** IronWeb is website-first. High-quality business websites are the main offer. The broader idea: IronWeb helps business owners and salespeople spend more time selling and less time on monotonous admin. Websites start the relationship; practical automations are an optional extension. Tone: polished and enterprise-safe with teeth. No generic "AI automation agency" look, no revolution promises, no guaranteed revenue or lead counts.

**Hero.** Keep the board composition and the approved headline "Your next customer is looking." Supporting line: "You handle the close. We build the website that gets the conversation started." The eyebrow leads with "Websites". Hero CTAs: **Explore the demo** (primary, `#demo`) and **View Our Work**.

**CTA hierarchy.**
- Header (desktop and mobile menu) and hero: **"Explore the demo"** → `/#demo`. This supersedes the Oct 8 "Book a Call" header button.
- After the demo, and as the default closing CTA: **"Let's talk about your website"** → `#talk` on Home, `/contact/#talk` elsewhere.
- "Book a Call" stays secondary (Contact `#book`, talk section, CTA bands). It's the contextual primary on Growth, Automations and Bundles.

**Interactive demo (`#demo`, `site/assets/js/demo.js`).** An on-page walkthrough of an example website. Industry tabs: Trades / Real estate / Local services (WAI-ARIA tabs). A Desktop/Phone toggle reflows the example site through container queries. A four-step journey (first impression → builds confidence → easy inquiry → after they reach out) scrolls the example site to the relevant section. The businesses are fictional "Example …" names and clearly labelled illustrative. The demo inquiry is simulated in the browser, says "Nothing was sent", and makes no network request. Example-site accent colours live in `site.css` (CSP forbids inline styles).

**Free homepage preview.** The personalised preview offer is no longer called a "free demo", so it isn't confused with the interactive demo. It lives in the "Let's talk about your website" form, whose backend intent is unchanged (`demo`, source "Website - Demo Request", tag `website-demo-request`). Journey: request → Colin follows up personally → preview on a private link when it's a fit → the prospect decides. A call is optional.

**Home order.** Hero → interactive demo → real work → value ("A website should earn the conversation", with verified website pricing) → process → optional automations (concise) → Let's talk. The founder story and FAQ live on About and Build.

**Automations.**
- Anchor copy: "Start small. Grow big." / "No bloated packages. No paying for tools you don't need. Just practical automations that solve real problems, starting at $97/month. Add more as your business grows." Support: "Your best closer shouldn't be buried in busywork."
- `$97/month` is the starting price Colin supplied on Oct 10. Per-automation prices are not confirmed, so the site states only the starting point.
- `/automations/` is the piecemeal menu. Each item gives the problem, what it does and a next step that prefills the Contact inquiry.
  - *Ready now:* missed-call text-back, instant inquiry response, follow-up sequences, review requests (the confirmed Operate items).
  - *Scoped on request:* appointment admin. Not confirmed as a standard item, so confirm before upgrading it to Ready.
- `/automations/bundles/`: IronWeb Operate ($750 setup + $297/month) and Custom Operate (up to $1,000 setup + $350/month). `/operate/` redirects to `/automations/`.
- AIISA and the AI agent team appear only as a restrained "In development" section on `/automations/`, with the agentic interest form. They never appear in the hero, main offer or primary CTA.

Website pricing and Growth pricing are unchanged.

## Revision — October 11, 2026: speed-to-lead homepage (supersedes the Oct 10 homepage order and hero copy)

Homepage now sells speed-to-lead retainers. Hero: eyebrow "Southeastern MA / Contractors / Real Estate" (no separate BUILD/GROWTH/OPERATE line); H1 "Every lead answered in 60 seconds." ("60 seconds." red); CTAs "Try it: text me the demo" → #talk and "See real client sites" → /work/; microcopy "Free homepage preview before you commit. Built and run by Colin, in Swansea."; CSS-only Saltmarsh Realty SMS mockup. Order: hero → proof strip → demo (one disclaimer line, video slot) → automations ("Never miss another lead.") → work (TMR, All Phaze, Homes by Heroux placeholder) → testimonial placeholders → why it works (single price line "Websites from $600 · Automations from $97/mo") → process → Text me form. #talk form = intent `speed`, tag "website lead", phone + SMS consent required (Colin's call; see the integration checklist's compliance note). Public email: colin@ironwebdigital.com. Title: "Web Design & Lead Follow-Up for Contractors & Realtors | Southeastern MA | IronWeb Digital".

Update (Oct 11, later): public phone (774) 486-7776 sitewide; top-right header button calls it. Homes by Heroux replaces the Homes-by-Heroux placeholder and the [THIRD CLIENT] slot. Testimonials stay hidden until real, approved quotes exist.

## Revision: October 16, 2026, automation-first offer architecture (supersedes earlier hero/CTA/pricing revisions)

Source: `ironweb-claude-code-prompt-2026-10-16.md` (Colin). Implemented exactly; see CLAUDE.md "Offer architecture".
