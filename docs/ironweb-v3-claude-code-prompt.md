# IronWeb Digital v3: Claude Code Build Prompt

Build a full rebuild of ironwebdigital.com from scratch. This is v3, not a patch of the current site. The current site's structure, tier pages, and CTA routing are superseded by this prompt. Do not carry over old pages, old pricing cards, or old demo routing unless this prompt explicitly says to keep something.

## Business context (so the copy is right)

IronWeb Digital Growth is Colin Sullivan's agency, based in Swansea, MA. Phone (774) 486-7776. Email colin@ironwebdigital.com. The agency sells to contractors and trade businesses only. The hero of the brand is the contractor, not Colin. The core story: a contractor drowning in work finally gets to breathe because automated systems run the front office, and the tech skeptic ends up doing more business than he imagined because someone walked him through what works, in order, until it runs on virtual autopilot. AI is a tool, not a replacement.

The sales motion: a prospect tries the interactive demo, books a Zoom walkthrough, sees the system work on their own problem, and closes on the call with "You saw it, are you confident?" A yes becomes a start immediately via a Stripe recurring invoice. The site must serve that motion, not distract from it.

The delivery system is GoHighLevel. Fresh Build clients start in a GHL template website so upgrading is easy and everything lives in one place. Operate clients are onboarded to GHL preloaded with the contractor snapshot.

## Audience

Contractors and trade businesses only. No real estate bundle, no generic local business targeting. The old real estate bundle card is gone in v3.

## Products (this is the pricing structure; present it exactly)

Three products, plus one master bundle. Do not invent additional tiers, and do not publish prices that are not listed here.

### IW Build
Websites, landing pages, funnels, SEO foundations.
- $97/mo: hosting, updates and upkeep, and instant lead SMS response from website inquiries.
- $600 one-time website build fee.
- Fresh clients start in a GHL template website from here on out, so upgrading is easy and everything is in one place.

### IW Grow
Social media management, paid ads, lead generation, and content.
- $597/mo for management, plus ad spend (ad spend is separate and not included in $597).
- Content shoots are scoped separately: going to a client's job with a camera to shoot content is priced separately for shoot and edit. It is not included in the $597/mo management fee. Say so plainly on the page.

### IW Operate
All automation work: missed-call text-back, instant lead response, AI reception, review requests, CRM and follow-ups.
- $297/mo handoff tier: Colin onboards the client to GHL preloaded with the contractor snapshot, and the client uses and maintains it.
- A done-for-you managed Operate bundle at a higher monthly price is under consideration but NOT decided. Do not publish a price for it. If the page needs to mention it, say managed Operate pricing is available on request, nothing more.

### Master IW bundle
Build plus Grow plus Operate, $1500/mo.
- The entire process from lead acquisition, intake, nurturing, closing, and requesting a review, all automated by AI agents that hand off only what the owner is absolutely needed for.
- Colin handles the upkeep and keeps as much off the owner's plate as possible.
- Present the master bundle on the homepage pricing section and the Services overview, and as its own page: the White Glove Digital Department page (see below).

## Navigation (exact)

- Home
- Portfolio
- Services (dropdown): IW Build, IW Grow, IW Operate, White Glove Digital Department. Each gets its own page going into deep detail about the services and why they help contractors.
- Demo (dedicated page for the interactive contractor demo)
- About
- Contact

Old pages (automations, bundles, growth, services index) are removed. Redirect or remove them cleanly; do not leave dead tier pages live.

## Home page

Hero, using this copy exactly:
- Headline: "Systems That Stick."
- Subhead: "Never miss another opportunity. Hire a receptionist to pick up the phone and book jobs during the hours you can't. $97/month."
- Red CTA button: "Call 774-486-7776" linking straight to a tel: call.
- Second CTA: "See How the System Works" linking directly to the interactive demo page.

Below the hero: the three products overview (Build, Grow, Operate, plus the master bundle), the process section (see below), a proof section (see proof rules), and a closing CTA to the demo or contact page.

The old homepage embedded demo section does NOT stay on the home page. It moves entirely to the IW Build page (see below).

## Portfolio page

Real client sites with real domains. Verify each domain during the build.
- Homes by Heroux: homesbyheroux.com. The old Netlify staging link (homes-by-heroux.netlify.app) must NOT be used.
- Keep the other portfolio entries from the current site (TMR Construction, All Phaze Property Solutions, Ocean Groove) with their real domains, verified during the build.
- The "See real client sites" CTA links here.

## IW Build page (in Services)

Deep detail on websites, landing pages, funnels, and SEO foundations, and why each helps a contractor. Pricing as listed above ($97/mo plus $600 one-time build fee, GHL template website standard).

This page also carries the moved homepage demo section, with this copy:
- Heading: "Picture this for your business."
- Subtext: "Your customers see your website first, make it easy for them to choose you."
- Red CTA: "Try it: text me the demo" linking to the lead intake form on the contact page.
- Secondary CTA: "See real client sites" linking to the portfolio page.

Form rule (critical): prospects who come in through the "Try it: text me the demo" CTA must be tagged needs-demo in GHL so the website demo workflow kicks off. Build the contact form routing to satisfy this. Verify it in testing.

## IW Grow page (in Services)

Deep detail on social media management, paid ads, lead generation, and content, and why each helps a contractor. Pricing: $597/mo management plus ad spend. State plainly that content shoots (camera to a client's job) are scoped separately for shoot and edit and are not included in the $597.

## IW Operate page (in Services)

Deep detail on missed-call text-back, instant lead response, AI reception, review requests, CRM and follow-ups, and why each helps a contractor. Pricing: $297/mo handoff tier as described above. Managed Operate: mention only as available on request, no price.

## White Glove Digital Department page (in Services)

This is the master bundle page. White Glove Digital Department is the name for the master bundle meshing all three services for $1500/mo: funnels, landing pages, SEO improvement, social media and ads management, lead generation, and Operate automations with agentic AI implemented.
- The entire process from lead acquisition, intake, nurturing, closing, and requesting a review, all automated by AI agents that hand off only what the owner is absolutely needed for.
- Colin handles the upkeep and keeps as much off the owner's plate as possible.
- $1500/mo. Do not add other prices to this page.

## Demo page

A dedicated page for the interactive contractor demo. Evolve the current /contractor-demo/ page into this.
- The demo must link the live LeadConnector booking widget (ironweb-contractor-demo) that hooks right up to Colin's calendar, so internet traffic that visits can book a call right after the demo.
- Verify in testing that a test booking lands in the IronWeb calendar. Report the result. Do not claim the booking flow works until a test booking proves it.
- If any part of the demo is simulated or preview-only, label it honestly on the page. Do not promise that submitting a demo form books a live pipeline slot until the wiring is verified.
- Every demo CTA sitewide points to this page. No demo CTA points to a general sales form.

## About page

- A photo of Colin plus a short blurb. Colin supplies the photo; use a placeholder image block until he does, clearly marked.
- Why IronWeb exists, the approach, and who it helps (contractors and trades).
- CTA at the bottom (demo or contact).
- This is the one place Colin appears. Everywhere else, the contractor stays the hero. IronWeb is not a personal brand about Colin.

## Contact page

- Sales intake form plus contact info: phone (774) 486-7776, email colin@ironwebdigital.com.
- The "Try it: text me the demo" CTA from the IW Build page lands on this form, and those prospects get tagged needs-demo (see IW Build page rule).
- The live LeadConnector booking widget is embedded here as well as on the demo page, so booking is one consistent path, not a contradiction. Remove any "booking is being connected" or "not live yet" language.

## Process section

Position it like the classic consult, plan, build, grow flow, rephrased for IronWeb. Four steps, plain language, contractor framing. This is the site's process story. It is separate from the sales motion (demo to Zoom to close on the call), which the demo page and CTAs serve.

## Proof rules (strict)

- Do NOT invent testimonials, reviews, client results, or statistics. None are approved yet. Colin still has to ask for testimonials (Erick, Heroux, and others).
- Build a testimonials and proof section designed to hold real quotes, but leave it honestly empty or clearly marked as forthcoming until Colin supplies approved quotes. Never fill it with placeholder quotes that look real.
- Portfolio sites are real proof and may be shown. The Heroux domain fix above is mandatory.

## Copy rules (strict)

- Direct, plain-spoken, numbers-first. Short sentences. No corporate fluff.
- No em dashes anywhere in site copy. Colin flags them as an AI giveaway.
- No guarantee language (no "guaranteed results," no revenue promises, no "never miss a lead" as a guarantee; the hero's "Never miss another opportunity" is approved headline copy, not a guarantee claim about results).
- Contractor hero, never Colin hero, except the About page blurb.
- One primary CTA per section. Red primary CTA buttons. No CTA sprawl: every page has a clear primary action, and secondary actions are demoted visually.

## Verification checklist before calling the build done

1. Every CTA target checked by clicking: demo CTAs go to the demo page, "Try it: text me the demo" goes to the contact form, "See real client sites" goes to the portfolio, "Call 774-486-7776" dials.
2. Test booking through the LeadConnector widget lands in the IronWeb calendar. Report pass or fail honestly.
3. Contact form submission from the demo CTA tags the prospect needs-demo in GHL. Report pass or fail honestly.
4. Heroux links to homesbyheroux.com, not the Netlify staging subdomain.
5. No placeholder copy that looks finished, no invented testimonials or stats, no em dashes, no guarantee language.
6. No leftover old tier pages (automations, bundles, growth, services index) live or linked.
7. Mobile check: hero, CTAs, demo page, and forms all usable on a phone.
8. Report anything you could not verify, anything Colin still needs to supply (photo, testimonial quotes, managed Operate price), and anything you deliberately left out.
