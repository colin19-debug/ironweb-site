// Reusable HTML pieces. Every page is assembled from these by scripts/build.mjs.
import { SITE, NAV, BOOKING, HERO_VIDEO, TRADES, DEMO_INDUSTRIES, DEMO_JOURNEY, AUDIT_HREF, AUDIT_CTA, DEMO_HREF, DEMO_CTA } from './data.mjs';

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// /assets/* is cached for 7 days (netlify.toml), so every CSS/JS URL carries a content hash.
// A changed file gets a new URL on the next build and browsers can't keep a stale copy.
const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../site');
export const asset = (url) => {
  try {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(SITE_DIR, url))).digest('hex').slice(0, 10);
    return `${url}?v=${hash}`;
  } catch { return url; }
};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Tabler outline icons (MIT), inlined.
const ICONS = {
  arrow: '<path d="M5 12l14 0"/><path d="M13 18l6 -6"/><path d="M13 6l6 6"/>',
  chevron: '<path d="M6 9l6 6l6 -6"/>',
  search: '<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/><path d="M21 21l-6 -6"/>',
  message: '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z"/>',
  star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>',
  user: '<path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
  menu: '<path d="M4 6l16 0"/><path d="M4 12l16 0"/><path d="M4 18l16 0"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>',
  phone: '<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2"/>',
  mail: '<path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z"/><path d="M3 7l9 6l9 -6"/>',
  external: '<path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"/><path d="M11 13l9 -9"/><path d="M15 4h5v5"/>',
  pause: '<path d="M6 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"/><path d="M14 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"/>',
  play: '<path d="M7 4v16l13 -8z"/>',
  check: '<path d="M5 12l5 5l10 -10"/>',
  calendar: '<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h16"/>',
};
export const icon = (name, cls = 'i') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

export function head({ title, fullTitle: forcedTitle, description, path, ogType = 'website', preloadHero = false, jsonld = [], scripts = [] }) {
  const url = `${SITE.domain}${path}`;
  const fullTitle = forcedTitle || (title ? `${title} | ${SITE.name}` : `${SITE.name} | Websites, Ads and Automations for Contractors`);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0B0B0F">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.domain}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Orbitron:wght@400;500&display=swap">
${preloadHero ? `<link rel="preload" as="image" href="/assets/img/hero-circuit-poster-1424.jpg" media="(min-width: 721px)" fetchpriority="high">\n<link rel="preload" as="image" href="/assets/img/hero-circuit-poster-mobile-640.jpg" media="(max-width: 720px)" fetchpriority="high">\n` : ''}<link rel="stylesheet" href="${asset('/assets/css/site.css')}">
<script src="${asset('/assets/js/main.js')}" defer></script>
${scripts.map((src) => `<script src="${asset(src)}" defer></script>`).join('\n')}
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>`;
}

export function header(currentPath, { overlay = false } = {}) {
  const isCurrent = (href) => ((href === '/' ? currentPath === '/' : currentPath.startsWith(href)) ? ' aria-current="page"' : '');
  const items = NAV.map((item) => {
    if (!item.children) return `<li><a class="nav-link" href="${item.href}"${isCurrent(item.href)}>${item.label}</a></li>`;
    const active = item.children.some((c) => currentPath.startsWith(c.href));
    return `<li class="has-menu">
        <button class="nav-link menu-toggle${active ? ' is-active' : ''}" type="button" aria-expanded="false" aria-controls="services-menu">${item.label}${icon('chevron', 'i i-chev')}</button>
        <ul class="submenu" id="services-menu">
          ${item.children.map((c) => `<li><a href="${c.href}"${isCurrent(c.href)}><span>${c.label}</span><small>${c.note}</small></a></li>`).join('\n          ')}
        </ul>
      </li>`;
  }).join('\n      ');
  const mobileItems = NAV.map((item) => (item.children
    ? `<li class="mobile-group"><span>${item.label}</span>
        <ul>${item.children.map((c) => `<li><a href="${c.href}">${c.label}</a></li>`).join('')}</ul>
      </li>`
    : `<li><a href="${item.href}">${item.label}</a></li>`)).join('\n      ');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header${overlay ? ' site-header--overlay' : ''}">
  <div class="header-bar">
    <a class="brand" href="/" aria-label="IronWeb Digital home"><img src="/assets/img/ironweb-logo.svg" alt="IronWeb Digital" width="680" height="160"></a>
    <nav class="primary-nav" aria-label="Primary">
      <ul class="nav-list">
      ${items}
      </ul>
    </nav>
    <a class="btn-cta btn-call" href="tel:${SITE.phoneTel}" aria-label="Call IronWeb Digital at ${SITE.phoneDisplay}">${icon('phone')}<span>${SITE.phoneDisplay}</span></a>
    <a class="nav-call" href="tel:${SITE.phoneTel}" aria-label="Call IronWeb Digital at ${SITE.phoneDisplay}">${icon('phone')}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav"><span class="sr-only">Menu</span>${icon('menu', 'i i-open')}${icon('x', 'i i-close')}</button>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile" hidden>
    <ul>
      ${mobileItems}
    </ul>
    <a class="btn btn-primary btn-block" href="${AUDIT_HREF}">${AUDIT_CTA} ${icon('arrow')}</a>
    <a class="btn btn-outline btn-block" href="${DEMO_HREF}">${DEMO_CTA}</a>
    <p class="mobile-contact"><a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></p>
  </nav>
</header>`;
}

export function hero() {
  const video = HERO_VIDEO.sources.length
    ? `<video class="hero-video" autoplay muted loop playsinline disablepictureinpicture disableremoteplayback preload="auto" data-hero-video aria-hidden="true" tabindex="-1">
      ${HERO_VIDEO.sources.map((s) => `<source src="${s.src}" type="${s.type}"${s.media ? ` media="${s.media}"` : ''}>`).join('\n      ')}
    </video>`
    : '';
  const pause = HERO_VIDEO.sources.length
    ? `<button class="hero-pause" type="button" data-hero-pause hidden aria-pressed="false"><span class="sr-only" data-label>Pause background video</span>${icon('pause', 'i i-pause')}${icon('play', 'i i-play')}</button>`
    : '';
  return `<section class="hero" aria-labelledby="hero-title">
  <div class="hero-media" aria-hidden="true">
    <picture>
      <source media="(max-width: 720px)" srcset="${HERO_VIDEO.posterMobile}">
      <img class="hero-still" src="${HERO_VIDEO.poster}" alt="" width="1424" height="644" fetchpriority="high" decoding="async">
    </picture>
    ${video}
  </div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-frame" aria-hidden="true"></div>
  <div class="hero-inner">
    <div class="hero-copy">
      <p class="eyebrow hero-eyebrow">Contractors <span class="slash">/</span> Trades</p>
      <h1 id="hero-title" class="hero-title">Systems That <span class="accent">Stick.</span></h1>
      <p class="hero-kicker">Never miss another opportunity.</p>
      <p class="hero-sub hero-sub--wedge">We build it, configure it, and keep the technology running. You stay in control of your customers and jobs.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${AUDIT_HREF}">${AUDIT_CTA} ${icon('arrow')}</a>
        <a class="btn btn-outline" href="${DEMO_HREF}">${DEMO_CTA}</a>
        <p class="hero-micro-sms">Free report. No obligation.</p>
        <p class="hero-signature"><span class="sr-only">Services: </span><span>Build</span><span class="slash" aria-hidden="true">/</span><span>Grow</span><span class="slash" aria-hidden="true">/</span><span>Operate</span></p>
      </div>
    </div>
  </div>
  ${pause}
</section>`;
}

export function pageHead({ eyebrow, title, lead }) {
  return `<section class="page-head">
  <div class="page-head-art" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`;
}

export const sectionLabel = (text) => `<p class="label"><span class="slash" aria-hidden="true">/</span> ${text}</p>`;

// ---------- Forms ----------
// Static HTML (compliance scanners read raw HTML). Wired by /assets/js/lead-form.js.
const opt = (list) => list.map((v) => `<option>${esc(v)}</option>`).join('');

const field = (id, label, control, { required = false, hint = '' } = {}) => `<div class="field">
        <label for="${id}">${label}${required ? ' <span class="req">(required)</span>' : ' <span class="opt">(optional)</span>'}</label>
        ${control}
        ${hint ? `<p class="hint">${hint}</p>` : ''}
        <p class="field-error" aria-live="polite"></p>
      </div>`;

// SMS consent is always optional (Colin, 2026-10-28): texting is never a condition of reaching IronWeb.
const smsConsent = (id) => `<div class="field field-check">
        <input type="checkbox" id="${id}-sms" name="smsConsent" value="yes">
        <label for="${id}-sms">I agree to receive text messages from ${SITE.legalName} (IronWeb Digital) at the phone number I provided, including automated texts about my request and scheduling. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. See our <a href="/privacy/">Privacy Policy</a> and <a href="/terms/">Terms</a>. (Optional.)</label>
      </div>`;

const formTail = (id, buttonText, success) => `<div class="hp" aria-hidden="true"><label for="${id}-bf">Leave this field empty</label><input id="${id}-bf" name="bot_field" tabindex="-1" autocomplete="off"></div>
      <div class="form-foot">
        <button class="btn btn-primary" type="submit">${buttonText} ${icon('arrow')}</button>
        <p class="form-note">By sending this you agree to our <a href="/privacy/">Privacy Policy</a>.</p>
      </div>
      <div class="form-status" role="alert" aria-live="assertive"></div>
      <template data-success>${success}</template>`;

const nameField = (id) => field(`${id}-name`, 'Name', `<input id="${id}-name" name="name" type="text" autocomplete="name" required data-error="Enter your name." maxlength="120">`, { required: true });
const emailField = (id) => field(`${id}-email`, 'Email', `<input id="${id}-email" name="email" type="email" autocomplete="email" required data-error="Enter your email address." maxlength="200">`, { required: true });
const bizField = (id, required) => field(`${id}-biz`, 'Business name', `<input id="${id}-biz" name="businessName" type="text" autocomplete="organization" maxlength="160"${required ? ' required data-error="Enter your business name."' : ''}>`, { required });
const tradeField = (id) => field(`${id}-trade`, 'Trade', `<select id="${id}-trade" name="trade"><option value="">Choose one</option>${opt(TRADES)}</select>`);
const siteField = (id) => field(`${id}-site`, 'Current website', `<input id="${id}-site" name="website" type="text" inputmode="url" placeholder="yourbusiness.com" maxlength="300">`);

// The main lead path (intent `audit`): tag "website lead" starts Colin's text workflow, and the lead gets an
// open opportunity in the "Website Leads" pipeline (netlify/lib/ghl.mjs).
export function auditForm(id = 'audit-form') {
  return `<form class="lead-form" id="${id}" data-lead-form="audit" aria-labelledby="${id}-h" novalidate>
      <h3 id="${id}-h" class="form-title">Request your free audit</h3>
      <div class="grid-2">
      ${nameField(id)}
      ${bizField(id, true)}
      ${field(`${id}-phone`, 'Mobile phone', `<input id="${id}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required data-error="Enter your mobile number." maxlength="20">`, { required: true })}
      ${emailField(id)}
      ${tradeField(id)}
      ${field(`${id}-town`, 'Town or service area', `<input id="${id}-town" name="town" type="text" autocomplete="address-level2" maxlength="120">`)}
      </div>
      ${siteField(id)}
      ${field(`${id}-msg`, 'Anything you want us to look at?', `<textarea id="${id}-msg" name="message" rows="3" maxlength="3000"></textarea>`)}
      ${smsConsent(id)}
      ${formTail(id, 'Request my free audit', `<h3 tabindex="-1">Thanks, {firstName}. Your audit request is in.</h3><p>Colin will run your audit and follow up personally to walk you through it. Questions before then? Call <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a>.</p>`)}
    </form>`;
}

// IW Build page: personal homepage preview (intent `preview`, tag needs-demo starts the website demo workflow).
export function previewForm(id = 'preview-form') {
  return `<form class="lead-form" id="${id}" data-lead-form="preview" aria-labelledby="${id}-h" novalidate>
      <h3 id="${id}-h" class="form-title">Get a free homepage preview</h3>
      <div class="grid-2">
      ${nameField(id)}
      ${emailField(id)}
      ${bizField(id, false)}
      ${tradeField(id)}
      ${field(`${id}-phone`, 'Mobile phone', `<input id="${id}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20">`)}
      ${siteField(id)}
      </div>
      ${field(`${id}-msg`, 'What should your website do better?', `<textarea id="${id}-msg" name="message" rows="3" maxlength="3000"></textarea>`)}
      ${smsConsent(id)}
      ${formTail(id, 'Get my homepage preview', `<h3 tabindex="-1">Thanks, {firstName}. Your preview request is in.</h3><p>Colin will follow up personally and, if it's a fit, build a homepage preview for your business on a private link.</p>`)}
    </form>`;
}

export function bookingBlock() {
  return `<div class="booking">
      ${BOOKING.embed ? `<iframe class="booking-frame" src="${esc(BOOKING.url)}" title="Book a call with IronWeb Digital" loading="lazy"></iframe>` : ''}
      <p class="booking-fallback">Calendar not loading? <a href="${esc(BOOKING.url)}" target="_blank" rel="noopener">Open the booking page ${icon('external')}</a></p>
    </div>`;
}

export function contactLines() {
  return `<ul class="contact-lines">
      <li><a href="tel:${SITE.phoneTel}">${icon('phone')} ${SITE.phoneDisplay}</a></li>
      <li><a href="mailto:${SITE.email}">${icon('mail')} ${SITE.email}</a></li>
    </ul>`;
}

export function footer() {
  const services = NAV.find((n) => n.children).children;
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="/" aria-label="IronWeb Digital home"><img src="/assets/img/ironweb-logo.svg" alt="IronWeb Digital" width="680" height="160" loading="lazy"></a>
      <p class="footer-tagline">Systems That Stick.</p>
      <p>Websites, ads and automations for contractors and trades. Based in Swansea, Massachusetts.</p>
    </div>
    <nav aria-label="Footer: services">
      <p class="footer-h">Services</p>
      <ul>${services.map((c) => `<li><a href="${c.href}">${c.label}</a></li>`).join('')}<li><a href="/demo/">Demo</a></li></ul>
    </nav>
    <nav aria-label="Footer: company">
      <p class="footer-h">Company</p>
      <ul><li><a href="/portfolio/">Portfolio</a></li><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li></ul>
    </nav>
    <div>
      <p class="footer-h">Contact</p>
      ${contactLines()}
    </div>
  </div>
  <div class="wrap footer-base">
    <p>&copy; <span data-year>2026</span> ${SITE.legalName} (IronWeb Digital). Swansea, MA.</p>
    <p><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></p>
  </div>
</footer>
<script src="${asset('/assets/js/lead-form.js')}" defer></script>
</body>
</html>`;
}

export function faqList(items) {
  return `<div class="faq">
    ${items.map((f) => `<details>
      <summary><span>${esc(f.q)}</span>${icon('chevron', 'i i-chev')}</summary>
      <div class="faq-a"><p>${esc(f.a)}</p></div>
    </details>`).join('\n    ')}
  </div>`;
}

// Closing band: one primary action (red), one quieter secondary.
export function ctaBand({ title = 'Find out what is costing you jobs.', text = 'Request a free audit of your Google profile, listings, reviews, website and map ranking. Colin walks you through it.', primary = 'audit' } = {}) {
  const audit = (cls) => `<a class="btn ${cls}" href="${AUDIT_HREF}">${AUDIT_CTA}${cls === 'btn-primary' ? ` ${icon('arrow')}` : ''}</a>`;
  const demo = (cls) => `<a class="btn ${cls}" href="${DEMO_HREF}">${DEMO_CTA}${cls === 'btn-primary' ? ` ${icon('arrow')}` : ''}</a>`;
  const actions = primary === 'demo' ? `${demo('btn-primary')}\n      ${audit('btn-outline')}` : `${audit('btn-primary')}\n      ${demo('btn-outline')}`;
  return `<section class="section cta-band">
  <div class="wrap cta-band-inner">
    <div>
      <h2>${title}</h2>
      <p>${text}</p>
    </div>
    <div class="cta-band-actions">
      ${actions}
    </div>
  </div>
</section>`;
}

// ---------- Website demo (IW Build page) ----------
// Illustrative businesses only; the inquiry is simulated in the browser by /assets/js/demo.js and sends
// nothing. All three examples are rendered as static tabpanels so the content exists without JS.
const mockSite = (d, i) => `<div class="dx-site" id="dx-panel-${d.key}" role="tabpanel" aria-labelledby="dx-tab-${d.key}" data-industry="${d.key}" data-host="${d.host}"${i ? ' hidden' : ''}>
          <div class="dx-scroll" tabindex="0" aria-label="Example website for ${esc(d.biz)}. Scrollable.">
            <div class="m-nav"><span class="m-logo">${esc(d.biz)}</span><span class="m-links" aria-hidden="true"><span>Services</span><span>About</span><span>Contact</span></span><span class="m-call" aria-hidden="true">${icon('phone')}<span>Call</span></span></div>
            <section class="m-hero" data-region="first" aria-label="First impression">
              <p class="m-tag">${esc(d.tagline)}</p>
              <h3 class="m-h">${esc(d.headline)}</h3>
              <p class="m-sub">${esc(d.sub)}</p>
              <div class="m-ctas"><button type="button" class="m-btn" data-goto="inquiry">${esc(d.primary)}</button><button type="button" class="m-btn m-btn--ghost" data-goto="inquiry">${esc(d.secondary)}</button></div>
              <ul class="m-badges">${d.badges.map((b) => `<li>${icon('check')}${esc(b)}</li>`).join('')}</ul>
            </section>
            <section class="m-proof" data-region="proof" aria-label="Builds confidence">
              <h4>${esc(d.proofTitle)}</h4>
              <div class="m-cards">${d.proof.map((c) => `<div class="m-card"><h5>${esc(c.h)}</h5><p>${esc(c.p)}</p></div>`).join('')}</div>
              <h4>${esc(d.galleryTitle)}</h4>
              <div class="m-gallery" aria-hidden="true"><span></span><span></span><span></span></div>
              <h4>How it works</h4>
              <ol class="m-steps">${d.steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
            </section>
            <section class="m-inquiry" data-region="inquiry" aria-label="Easy inquiry">
              <h4>${esc(d.formTitle)}</h4>
              <form class="m-form" data-demo-form novalidate>
                <label for="dx-${d.key}-name">Name</label>
                <input id="dx-${d.key}-name" name="dxName" type="text" autocomplete="off" placeholder="Try typing a name">
                <label for="dx-${d.key}-opt">${esc(d.formField)}</label>
                <select id="dx-${d.key}-opt" name="dxOption">${d.formOptions.map((o) => `<option>${esc(o)}</option>`).join('')}</select>
                <button type="submit" class="m-btn">Send request</button>
                <p class="m-error" role="alert"></p>
              </form>
              <div class="m-sent" role="status" hidden></div>
            </section>
            <section class="m-after" data-region="after" aria-label="After they reach out">
              <h4>What happens next</h4>
              <div class="m-msgs">
                <div class="m-msg"><p class="m-msg-k">To you</p><p class="m-msg-t" data-notify>${esc(d.notify)}</p></div>
                <div class="m-msg m-msg--auto"><p class="m-msg-k">To the customer <span>Automatic</span></p><p class="m-msg-t">${esc(d.reply)}</p></div>
              </div>
            </section>
            <div class="m-foot">© ${esc(d.biz)}</div>
          </div>
        </div>`;

export function interactiveDemo() {
  return `<section class="section dx-section" id="website-demo" aria-labelledby="demo-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Website demo')}
      <h2 id="demo-title">See it in action.</h2>
      <p>Pick a trade and walk through what a homeowner experiences on an IronWeb website, from first impression to the text they get back.</p>
    </div>
    <div class="dx" data-demo>
      <div class="dx-controls">
        <div class="dx-tabs" role="tablist" aria-label="Choose a trade">
          ${DEMO_INDUSTRIES.map((d, i) => `<button type="button" role="tab" id="dx-tab-${d.key}" aria-controls="dx-panel-${d.key}" aria-selected="${i ? 'false' : 'true'}"${i ? ' tabindex="-1"' : ''}>${esc(d.tab)}</button>`).join('\n          ')}
        </div>
        <div class="dx-view" role="group" aria-label="Preview size">
          <button type="button" data-view="desktop" aria-pressed="true">Desktop</button>
          <button type="button" data-view="phone" aria-pressed="false">Phone</button>
        </div>
      </div>
      <div class="dx-body">
        <ol class="dx-journey" aria-label="Customer journey">
          ${DEMO_JOURNEY.map((j, i) => `<li><button type="button" data-step="${j.key}"${i ? '' : ' aria-current="step"'}><span class="dx-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="dx-name">${j.name}</span><span class="dx-text">${j.text}</span></button></li>`).join('\n          ')}
        </ol>
        <div class="dx-stage">
          <div class="dx-frame" data-view="desktop">
            <div class="dx-bar" aria-hidden="true"><span class="browser-dots"><i></i><i></i><i></i></span><span class="dx-url">${DEMO_INDUSTRIES[0].host}</span></div>
            ${DEMO_INDUSTRIES.map(mockSite).join('\n            ')}
          </div>
          <p class="dx-disclaimer">Example businesses. The demo form doesn't send anything.</p>
        </div>
      </div>
      <div class="dx-after">
        <div>
          <h3>Picture this for your business.</h3>
          <p>Your customers see your website first, make it easy for them to choose you.</p>
        </div>
        <div class="dx-after-actions">
          <a class="btn btn-primary" href="#preview">Get a free homepage preview ${icon('arrow')}</a>
          <a class="btn btn-outline" href="/portfolio/">See real client sites</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

