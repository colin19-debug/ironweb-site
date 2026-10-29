# CLAUDE.md — {{PROJECT_NAME}} | Website Rules

> **Template setup (Colin):** Copy this into the project root as `CLAUDE.md`. Fill in every `{{PLACEHOLDER}}` and delete sections marked *Optional* that don't apply. Then delete this note.
>
> **Claude:** If any `{{PLACEHOLDER}}` is still present in a section you need for the current task, stop and ask Colin for the value. Never guess, invent, or leave a placeholder in a deliverable.

---

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
- **Read this file fully**, plus any files in `docs/` (specs, brand board, decision notes).
- **Check `brand_assets/`** in the project root before designing anything (logo, photos, palette file, references).
  - **Logo/photo assets exist → always use them.** Never substitute placeholders or stock for real assets that are present.
  - **Palette file exists → use its exact hex values.** Otherwise use the token system below.
  - Fill photo gaps with high-quality licensed stock that fits the subject. Never leave empty galleries or sections.

---

## Project Identity
- **Business:** {{BUSINESS_NAME}}
- **Owner / contact person:** {{OWNER_NAME}}
- **What they do:** {{ONE_LINE_DESCRIPTION}}
- **Primary services (headline):** {{PRIMARY_SERVICES}}
- **Secondary services:** {{SECONDARY_SERVICES_OR_NONE}}
- **Domain:** {{DOMAIN}} ({{NEW_OR_REBUILD}})
- **Location:** {{CITY_STATE}}
- **Service area:** {{SERVICE_AREA}}
- **In business since:** {{YEAR}}
- **Phone:** {{PHONE_DISPLAY}} (tel: `{{PHONE_TEL}}`)
- **Email:** {{EMAIL}}
- **Tagline:** {{TAGLINE_OR_NONE}}
- **Logo:** {{LOGO_DESCRIPTION_OR_STATUS}}

## Site Goals
- **Primary:** {{PRIMARY_GOAL}} (e.g. make it effortless for a local customer to call or submit a quote request)
- **Secondary:** {{SECONDARY_GOAL}}
- **Tone anchor:** {{ONE_SENTENCE_THAT_CAPTURES_THE_BUSINESS}}

---

## Reference Sites
- **Reference:** {{REFERENCE_SITE_URL_OR_NONE}}. {{WHAT_TO_TAKE_FROM_IT}}. Match its layout logic and spacing discipline, never copy it outright. Translate it into an original design for this brand.
- **If a reference image is provided:** match layout, spacing, typography, and color exactly. Swap in this project's content. Do not improve or add to the design.

---

## Brand

### Aesthetic: {{AESTHETIC_NAME}}
{{2-3 sentences: who the business is, how the site should feel, and any directions the client explicitly rejected}}

### Mood & Positioning
- {{POSITIONING_POINT_1}}
- {{POSITIONING_POINT_2}}
- **Brand promises (client's own words):** {{PROMISES}}

### Typography
Load via Google Fonts `<link>` in `<head>`. Never substitute the locked pairing.
- **Headings:** {{HEADING_FONT}}, weight {{HEADING_WEIGHTS}}
- **Body:** {{BODY_FONT}}, weight 400–500, generous line-height
- **Avoid:** {{FONT_STYLES_TO_AVOID}}

### Color Tokens
Define every color as a CSS variable. Never hardcode hex values in components.
```css
/* Backgrounds */
--color-bg:            {{HEX}};  /* Page canvas */
--color-surface:       {{HEX}};  /* Cards, elevated sections */
--color-border:        {{HEX}};  /* Dividers, outlines, inputs */

/* Brand */
--color-primary:       {{HEX}};  /* CTAs, key headings, active states */
--color-primary-hover: {{HEX}};  /* Hover/pressed */
--color-accent:        {{HEX_OR_DELETE}};

/* Neutrals */
--color-text:          {{HEX}};  /* Primary text — never pure #000 */
--color-text-muted:    {{HEX}};  /* Secondary text, captions */
--color-text-subtle:   {{HEX}};  /* Disabled/placeholder */
```
- **Colors to never use:** {{BANNED_COLORS_OR_NONE}}

### Color Usage Rules
- Primary color for CTAs, key headings, and active states. One dominant primary element per section.
- Near-black for body text, never pure `#000`.
- Shadows soft and tinted from the text color, never harsh black: e.g. `0 4px 20px rgba(<text-rgb>, 0.08)`.

### Design Patterns
- Real photography first, licensed stock for gaps. No AI-generated hero art or logos.
- Tactile buttons: subtle hover lift + shadow increase, not flat color swaps.
- Generous whitespace. Restraint over dense blocks of information.
- {{PROJECT_SPECIFIC_PATTERNS}} (e.g. before/after sliders, listing cards, project galleries)

---

## Icons
- **Never generate custom or AI-created icons.** Use Tabler Icons, outline style, inline SVG.
- `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. Never an icon webfont.
- Primary action icons (call, contact) use `var(--color-primary)`. Secondary/info icons use the muted text color.
- Sizes: 24px inline, 28–32px in feature cards, 20–22px in badges.

---

## Output Defaults
- **Structure:** {{SINGLE_PAGE_OR_PAGE_LIST}}
- **Static HTML, no build step, no bundler.** A local Node script may be used to keep shared header/footer boilerplate consistent across pages, but its output is checked in as plain HTML and never runs at deploy time.
- **Styling:** {{TAILWIND_CDN_OR_VANILLA_CSS}}
  - If Tailwind CDN: `<script src="https://cdn.tailwindcss.com"></script>`, with brand tokens mapped into the Tailwind config. Never use default Tailwind colors as brand colors.
  - If vanilla CSS: all tokens in one file (e.g. `css/tokens.css`) so the site can be reskinned.
- **Placeholder images:** `https://placehold.co/WIDTHxHEIGHT` until real photos or stock arrive.
- **Mobile-first.** Verify at 375px, 768px, and 1280px.
- **Shared chrome:** when editing the header, nav, footer, or shared styles on a multi-page site, apply the change to every page.

---

## Page Structure
{{List pages, and for the homepage, sections in order with a one-line purpose each. Example:
1. Header/Nav — logo left, click-to-call phone prominent
2. Hero — headline, subhead, primary CTA, real or stock image
3. Services — grid with icons, no paragraph dumps
4. Why Us — 3–4 short trust points
5. Testimonial(s) — real only
6. Contact — form + click-to-call + service area
7. Footer — name, phone, email, service area, socials}}

---

## Local Server
- **Always serve on localhost.** Never screenshot or preview a `file:///` URL.
- Start: `node serve.mjs` (serves project root at `http://localhost:3000`). Run it in the background before screenshots.
- If the server is already running, do not start a second instance.
- Fallback if `serve.mjs` is missing: `npx serve .` or `python -m http.server 3000`.
- If the project uses Netlify Functions, use `netlify dev` instead so functions run locally.

---

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/Colin/AppData/Local/Temp/puppeteer-test/`. Chrome cache: `C:/Users/Colin/.cache/puppeteer/`.
- `screenshot.mjs` lives in the project root. Use it as-is. If it's missing, ask Colin to copy it in from a previous project.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Saves to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten). Optional label: `node screenshot.mjs http://localhost:3000 label` → `screenshot-N-label.png`.
- After screenshotting, read the PNG with the Read tool and analyze it directly.
- Every review round: desktop (1280px) **and** mobile (375px).

### Comparison Protocol
Compare every screenshot against `brand_assets/`, any reference, and this file. Log issues specifically ("H1 renders at 500 weight, should be 700"; "card padding is 12px, should be 16px").

**Universal checks, every round:**
- [ ] Heading and body fonts match the locked pairing
- [ ] No off-palette colors, and none of the banned colors anywhere
- [ ] Primary color is the dominant CTA color, one dominant element per section
- [ ] Text uses token colors, not pure `#000` or framework default grays
- [ ] Aesthetic matches the brief, not a generic template
- [ ] Services/content match the Content Reference exactly, nothing invented
- [ ] Phone and email hardcoded correctly, no bracketed placeholders
- [ ] `tel:` link works, forms present and have a success state
- [ ] No horizontal scroll, mobile nav works at 375px
- [ ] Every interactive element has hover, focus-visible, and active states

**Project-specific checks:**
- [ ] {{PROJECT_CHECK_1}}
- [ ] {{PROJECT_CHECK_2}}

**Minimum 2 screenshot rounds.** Stop only when every check passes or Colin says to stop. Never declare work complete after one pass.

---

## Deployment
- **Hosting:** Netlify via CLI (`netlify deploy --prod`). No build command, deployed as-is.
- **Domain:** {{DOMAIN}} ({{DNS_STATUS}})
- **Transactional email:** Resend
- **Always generate `netlify.toml`** with the security headers below.
- Secrets (Resend key, GHL token, etc.) live only in Netlify environment variables, never in frontend code or the repo.

---

## Forms & Lead Capture
**Default: Netlify Forms**
- `<form name="..." method="POST" data-netlify="true" data-netlify-honeypot="bot-field">`
- Honeypot: `<input name="bot-field" style="display:none" />`
- Confirmation emails via Resend.
- Always a success state: redirect to `/thank-you.html` or inline confirmation. Never a silent form.
- **Required fields:** {{REQUIRED_FIELDS}}
- **Click-to-call:** `<a href="tel:{{PHONE_TEL}}">{{PHONE_DISPLAY}}</a>` in the header and contact section.

**Optional: GoHighLevel**
- Submit to a Netlify Function that creates/updates the contact via the GHL API and applies a tag that triggers the workflow.
- Any SMS opt-in needs a required consent checkbox with TCPA-compliant language, with the consent text and timestamp stored on the contact.

---

## SEO Defaults — Every Build
```html
<meta name="description" content="{{META_DESCRIPTION}}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://{{DOMAIN}}/" />

<meta property="og:type" content="website" />
<meta property="og:title" content="{{OG_TITLE}}" />
<meta property="og:description" content="{{OG_DESCRIPTION}}" />
<meta property="og:url" content="https://{{DOMAIN}}/" />
<meta property="og:image" content="https://{{DOMAIN}}/brand_assets/og-image.jpg" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "{{SCHEMA_TYPE}}",
  "name": "{{BUSINESS_NAME}}",
  "description": "{{SCHEMA_DESCRIPTION}}",
  "url": "https://{{DOMAIN}}",
  "telephone": "{{PHONE_E164}}",
  "email": "{{EMAIL}}",
  "areaServed": [{{AREAS_AS_JSON_STRINGS}}]
}
</script>
```
- Each page of a multi-page site gets its own title, description, and canonical URL.
- `{{SCHEMA_TYPE}}` examples: `HomeAndConstructionBusiness`, `RealEstateAgent`, `LocalBusiness`, `MusicGroup`.
- Generate a 1200×630 branded OG image once the logo is final.

---

## Security — Always Generate `netlify.toml`
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://placehold.co; media-src 'self'; connect-src 'self';"
```
- **Whenever you add an external service** (map embed, video host, GHL widget, analytics, image CDN), update the CSP to allow exactly that host, then confirm in the browser console that nothing is blocked.
- Remove `https://placehold.co` from `img-src` before launch once real images are in.

---

## Anti-Generic Guardrails
- **Colors:** brand tokens only. Never framework defaults (Tailwind blue/indigo/gray) as brand colors.
- **Typography:** locked pairing, never swapped.
- **Imagery:** real photos first, licensed stock for gaps, no AI-generated hero art.
- **Positioning:** keep the headline services as the headline. Don't let the site drift into "does everything."
- **Interaction:** hover, focus-visible, and active states on everything clickable.
- **Restraint:** no animation libraries or heavy JS. These are fast, simple local-business sites.
- **Copy:** confident and direct, anchored in what the client actually said. No "we care about quality" filler.

---

## Content Reference — Do Not Fabricate
- **Services (exact list, add nothing):** {{SERVICES_LIST}}
- **Contact:** {{PHONE_DISPLAY}} · {{EMAIL}}
- **Service area:** {{SERVICE_AREA}}
- **In business since:** {{YEAR}}
- **Differentiators (client's own words):** {{DIFFERENTIATORS}}
- **Testimonials:** {{TESTIMONIALS_OR_NONE}} (never invent more)
- **Featured projects:** {{PROJECTS_OR_NONE}}

---

## Decision Log
Dated client feedback and decisions that override earlier direction. Newest first. Always honor these.
- {{YYYY-MM-DD}}: {{DECISION}} (e.g. "Client doesn't want the word 'handyman' anywhere. Use 'general remodeling' instead.")

---

## Hard Rules
- Do not add sections or content not in this brief.
- Do not invent testimonials, reviews, services, stats, or credentials.
- Do not leave bracketed or `{{}}` placeholders in a live deliverable.
- Do not use `file:///` URLs for preview. Always localhost.
- Do not stop after one screenshot pass. Minimum 2 rounds.
- Do not deploy without `netlify.toml` and the full SEO block.
- Do not put API keys or tokens in frontend code.
- Do not add a build step (Vite, webpack, etc.).
- Do not use `transition-all`.
- Do not use a default favicon, emoji, or unrelated icon. Logo mark or omit.
- Do not generate AI art for the hero or logo.
- {{PROJECT_SPECIFIC_HARD_RULES}}
