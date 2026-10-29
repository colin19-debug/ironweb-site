# IronWeb Digital v3 spec (2026-10-28)

Source: Hound's v3 prompt (`docs/ironweb-v3-claude-code-prompt.md`) plus Colin's answers on 2026-10-28. Where they
differ, this page wins. Built on the existing codebase (new content and structure, same engine); a clean restart
stays the fallback if the old structure fights us.

## Position
- **Who:** contractors and trade businesses only. The contractor is the hero; Colin appears only on About.
- **Story:** a busy contractor gets the front office handled by systems that run on their own, set up in the right
  order by someone who explains it plainly. AI is a tool, not a replacement.
- **Sales motion the site serves:** request an audit or try the demo → call/Zoom walkthrough → start.

## Products (published exactly as below, nothing else)
| Product | Price | What it is |
|---|---|---|
| IW Build | $600 one-time build + $97/month | Website, landing pages, funnels, SEO foundations. Monthly covers hosting, updates and upkeep, and instant text replies to website inquiries. |
| IW Grow | $597/month + ad spend | Social media management, paid ads, lead generation, content. Ad spend is separate. |
| IW Operate | $297/month | Missed-call text-back, instant lead response, AI reception, review requests, CRM and follow-up. Colin sets it up preloaded for contractors; the client runs it. Managed Operate: "pricing on request", no number. |

**Not public for now:** the combined managed package ($900/month + ad spend), content shoots, AI agent team claims.
**Removed:** the $97 stage ladder, Contractor and Real Estate bundles, $497 setup, "$600 value, included", the $1,500
build, $97 landing pages, Operate/Custom Operate, AIISA interest list, White Glove.
**Never in public copy:** the CRM platform's name (or Kling, Claude, Netlify). Say "the same platform as your CRM and
automations" where needed.

## Pages and menu
Menu: Home · Portfolio · Services (IW Build, IW Grow, IW Operate) · Demo · About · Contact, plus the header call button.

| Page | URL | Primary action | Notes |
|---|---|---|---|
| Home | `/` | Request an audit | Sections: hero, three products, demo teaser, process (4 steps), portfolio strip, proof (hidden until real quotes), FAQ, closing audit CTA. Keep the video hero. |
| IW Build | `/build/` | Request an audit | Deep detail + why it matters to contractors. Carries the old homepage industry demo: "Picture this for your business." / "Your customers see your website first, make it easy for them to choose you." Its own form: **"Get a free homepage preview"** → tag `needs-demo` (website demo workflow). Secondary: "See real client sites" → /portfolio/. |
| IW Grow | `/grow/` | Request an audit | No content-shoot mention. |
| IW Operate | `/operate/` | Try the demo | Links the live demo; AI receptionist explained here. |
| Demo | `/demo/` | Book a call (calendar) | Today's /contractor-demo/, renamed. Every demo button on the site points here. Booking widget `ironweb-contractor-demo` shown after the demo. Honest status labels stay. |
| Portfolio | `/portfolio/` | Request an audit | TMR, All Phaze, Homes by Heroux (homesbyheroux.com, not the netlify.app link), Ocean Groove. Verify every domain. |
| About | `/about/` | Request an audit | Why IronWeb, approach, who it helps. Photo block hidden until Colin supplies one. |
| Contact | `/contact/` | Audit intake form | One form + phone/email + the same booking widget. No "booking is being connected". |

Redirects (301): `/services/` → `/`, `/automations/` and `/automations/bundles/` → `/operate/`, `/growth/` → `/grow/`,
`/contractor-demo/` → `/demo/`. Remove the old `/operate` → `/automations/` redirect.

## Hero
- H1 "Systems That Stick." · kicker "Never miss another opportunity." · subhead about the free audit (draft below).
- Primary (red): **"Request your free audit"** → `/contact/#audit`. Secondary: **"See how the system works"** → `/demo/`.
- Draft subhead: "Find out where calls, inquiries and follow-ups slip through. We'll show you what to fix first."

## Audit intake form (the main lead path)
Same path as today's "Be the lead" form, with one addition:
1. Fields: name, mobile, email, business name, trade, website (optional), what you want looked at (optional), SMS consent.
2. Server creates/updates the contact, tag `website lead`, note, **and an open opportunity in the "website lead" pipeline
   (first stage)**. One open opportunity per contact.
3. The CRM workflow on that lead texts the prospect and Colin.
4. Success shown only when the CRM accepts; honest failure otherwise.

## Rules carried over
No em dashes. No guarantee language. No invented testimonials, results or stats; proof section stays hidden until
approved quotes exist. One primary action per section, red primary buttons, secondary visually quieter.
Checks pass before every deploy; deploy only on Colin's word; commit each stage to git.

## Verification before launch (report pass/fail honestly)
1. Every button goes where this page says (audit, demo, portfolio, call).
2. Audit form: contact + `website lead` tag + opportunity in the right pipeline/stage; prospect and Colin texts arrive.
3. Homepage-preview form tags `needs-demo`.
4. A test booking lands on Colin's calendar (then cancelled).
5. Heroux and all portfolio domains resolve to the real sites.
6. No old pages live or linked; redirects work.
7. Phone check of hero, buttons, demo, forms.

## Open items (needed from Colin)
1. **Is the audit free,** and what does it cover (website, Google profile, missed calls, follow-up)? Hero copy depends on it.
2. **"website lead" pipeline:** confirm the exact pipeline name and first stage, and that the workflow texting the
   prospect and you is published (and what triggers it: the tag or the new opportunity).
3. **SMS consent on the audit form:** keep it required (current homepage form) or make it optional (A2P-safer)?
4. **Ocean Groove** is a band site; keep it on a contractors-only portfolio?
5. Grow and Operate deep-page copy: anything you do or don't want claimed (e.g. which ad platforms, which review sites).
