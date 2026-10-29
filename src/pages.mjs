// Page bodies. Each export returns { path, title, description, body, ... } for scripts/build.mjs.
// v3 (2026-10-28): docs/IRONWEB-V3-SPEC.md. One primary action per section (red), secondary actions quieter.
import { SITE, PRODUCTS, AUDIT_POINTS, PROCESS, HOME_FAQ, WORK, TESTIMONIALS, HEADSHOT, AUTOMATIONS, CARE, COMPARE, AUDIT_HREF, AUDIT_CTA, DEMO_HREF, DEMO_CTA } from './data.mjs';
import {
  esc, icon, hero, pageHead, sectionLabel, auditForm, previewForm, interactiveDemo,
  bookingBlock, contactLines, faqList, ctaBand,
} from './components.mjs';

const ORG = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.name,
  url: `${SITE.domain}/`,
  logo: `${SITE.domain}/favicon.svg`,
  image: `${SITE.domain}/assets/img/og-image.jpg`,
  description: 'Websites, ads and automations for contractors and trades in Southeastern Massachusetts.',
  telephone: SITE.phoneTel,
  email: SITE.email,
  founder: { '@type': 'Person', name: SITE.founder },
  address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'US' },
  areaServed: [
    { '@type': 'City', name: 'Swansea, MA' },
    { '@type': 'AdministrativeArea', name: SITE.regionName },
  ],
};

const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

const serviceSchema = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: p.name,
  description: p.what,
  provider: { '@type': 'ProfessionalService', name: SITE.name, url: `${SITE.domain}/` },
  areaServed: SITE.regionName,
  audience: { '@type': 'BusinessAudience', audienceType: 'Contractors and trade businesses' },
  offers: { '@type': 'Offer', price: p.price.replace('$', ''), priceCurrency: 'USD', description: `${p.price} ${p.cadence}, ${p.extra}` },
});

const product = (key) => PRODUCTS.find((p) => p.key === key);
const auditBtn = (cls = 'btn-primary') => `<a class="btn ${cls}" href="${AUDIT_HREF}">${AUDIT_CTA}${cls === 'btn-primary' ? ` ${icon('arrow')}` : ''}</a>`;
const demoBtn = (cls = 'btn-primary') => `<a class="btn ${cls}" href="${DEMO_HREF}">${DEMO_CTA}${cls === 'btn-primary' ? ` ${icon('arrow')}` : ''}</a>`;
const checks = (items) => `<ul class="checks">${items.map((t) => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>`;
const priceTag = (amount, cadence, plus) => `<p class="price"><span class="price-amount">${amount}</span> <span class="price-cadence">${cadence}</span>${plus ? `<span class="price-plus">${plus}</span>` : ''}</p>`;
const facts = (list) => `<div class="facts">
      ${list.map((f) => `<div class="fact"><h3>${f.h}</h3><p>${f.p}</p></div>`).join('\n      ')}
    </div>`;

// Placeholder testimonials only render when building with SHOW_PLACEHOLDERS=1 (local preview).
const SHOW_PLACEHOLDERS = process.env.SHOW_PLACEHOLDERS === '1';

function workCards(list = WORK, { large = false } = {}) {
  return `<div class="work-grid${large ? ' work-grid--large' : ''}">
    ${list.map((w) => `<article class="work-card">
      <div class="browser">
        <div class="browser-bar" aria-hidden="true"><span class="browser-dots"><i></i><i></i><i></i></span><span class="browser-url">${w.host}</span></div>
        ${w.placeholder ? `<div class="work-shot-slot placeholder" role="img" aria-label="Screenshot placeholder">[SCREENSHOT – ${esc(w.name)}]</div>` : `<picture>
          <source type="image/webp" srcset="/assets/img/work/${w.key}-640.webp 640w, /assets/img/work/${w.key}-960.webp 960w" sizes="${large ? '(min-width: 1000px) 60vw, 100vw' : '(min-width: 1000px) 31vw, (min-width: 700px) 50vw, 100vw'}">
          <img src="/assets/img/work/${w.key}-960.jpg" srcset="/assets/img/work/${w.key}-640.jpg 640w, /assets/img/work/${w.key}-960.jpg 960w" sizes="${large ? '(min-width: 1000px) 60vw, 100vw' : '(min-width: 1000px) 31vw, (min-width: 700px) 50vw, 100vw'}" width="960" height="564" loading="lazy" decoding="async" alt="Homepage of ${esc(w.name)}">
        </picture>`}
      </div>
      <div class="work-body">
        <p class="work-kind${w.placeholder ? ' placeholder' : ''}">${esc(w.kind)}</p>
        <h3>${esc(w.name)}</h3>
        <p${w.placeholder ? ' class="placeholder"' : ''}>${esc(w.desc)}</p>
        <a class="text-link" href="${w.url}" target="_blank" rel="noopener">Visit live site ${icon('external')}<span class="sr-only"> (${esc(w.name)}, opens in a new tab)</span></a>
      </div>
    </article>`).join('\n    ')}
  </div>`;
}


function compareTable() {
  return `<div class="compare-wrap">
    <table class="compare">
      <caption class="sr-only">A typical agency compared with IronWeb</caption>
      <thead><tr><th scope="col">Typical agency</th><th scope="col">IronWeb</th></tr></thead>
      <tbody>
        ${COMPARE.map((r) => `<tr><td>${icon('x', 'i i-no')}<span>${esc(r.them)}</span></td><td>${icon('check', 'i i-yes')}<span>${esc(r.us)}</span></td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>`;
}

function processSteps() {
  return `<ol class="steps">
    ${PROCESS.map((s, i) => `<li class="step">
      <span class="step-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h3>${s.name}</h3>
      <p>${s.text}</p>
    </li>`).join('\n    ')}
  </ol>`;
}

function productCards() {
  return `<div class="svc-grid">
      ${PRODUCTS.map((p) => `<article class="panel svc" id="svc-${p.key}">
        <h3 class="svc-name">${p.name}</h3>
        <p class="svc-line">${esc(p.what)}</p>
        <p class="svc-price">${p.price} <span class="price-cadence">${p.cadence}</span></p>
        <p class="svc-note">${esc(p.extra)}</p>
        ${checks(p.includes.map(esc))}
        <a class="text-link" href="${p.href}">${p.name} details ${icon('arrow')}</a>
      </article>`).join('\n      ')}
    </div>`;
}

function testimonials() {
  const list = TESTIMONIALS.filter((t) => !t.placeholder || SHOW_PLACEHOLDERS);
  if (!list.length) return '';
  return `<section class="section" id="testimonials" aria-labelledby="testi-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('In their words')}
      <h2 id="testi-title" class="h-sub">What contractors say.</h2>
    </div>
    <div class="testi-grid">
      ${list.map((t) => `<figure class="testi${t.placeholder ? ' testi--placeholder' : ''}">
        ${t.result ? `<p class="testi-result${t.placeholder ? ' placeholder' : ''}">${esc(t.result)}</p>` : ''}
        <blockquote><p${t.placeholder ? ' class="placeholder"' : ''}>“${esc(t.quote)}”</p></blockquote>
        <figcaption><strong>${esc(t.name)}</strong>${t.business ? `, ${esc(t.business)}` : ''}</figcaption>
      </figure>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

// ---------- pages ----------
export const home = {
  path: '/',
  title: '',
  fullTitle: 'Websites, Ads and Automations for Contractors | Southeastern MA | IronWeb Digital',
  description: 'Systems That Stick. We build it, configure it and keep it running; you stay in control and own everything. Websites from $600 + $97/month, social and ads $597/month, automations $297/month. For contractors and trades.',
  overlayHeader: true,
  preloadHero: true,
  jsonld: [ORG, faqSchema(HOME_FAQ)],
  body: () => `${hero()}

<section class="section" id="free-audit" aria-labelledby="audit-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('The free audit')}
      <h2 id="audit-title">See exactly where jobs are slipping away.</h2>
      <p>Most contractors lose work they never hear about: a missed call, a listing with an old phone number, a Google profile with no website. The audit finds it, and Colin walks you through what to fix first.</p>
    </div>
    ${facts(AUDIT_POINTS)}
    <div class="section-actions">
      ${auditBtn()}
    </div>
  </div>
</section>

<section class="section" id="services" aria-labelledby="services-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Services')}
      <h2 id="services-title">Three ways to take work off your plate.</h2>
      <p>Start with the one that fixes your biggest leak. Prices are published, and one-time costs are spelled out.</p>
    </div>
    ${productCards()}
  </div>
</section>

<section class="section" id="partner" aria-labelledby="partner-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Ongoing partner')}
      <h2 id="partner-title">We don't hand it off and disappear.</h2>
      <p>We build it, configure it, and keep the technology running. You stay in control of your customers and jobs, and you own everything we set up.</p>
    </div>
    ${facts(CARE)}
    ${compareTable()}
  </div>
</section>

<section class="section" id="demo" aria-labelledby="demo-title">
  <div class="wrap">
    <div class="panel demo demo--callout">
      <div class="demo-copy">
        ${sectionLabel('Interactive demo')}
        <h2 id="demo-title">Try the system yourself.</h2>
        <p>Play the customer. Request an estimate from a demo contractor, get the text back, call the AI receptionist, and see the pipeline the owner sees. About three minutes.</p>
        <div class="callout-actions">
          ${demoBtn()}
        </div>
      </div>
      <div>
        <ol class="demo-steps">
          <li><span class="step-n" aria-hidden="true">01</span><div><h3>Be the customer</h3><p>Send an estimate request like a homeowner would.</p></div></li>
          <li><span class="step-n" aria-hidden="true">02</span><div><h3>Get the response</h3><p>See the follow-up and call the AI receptionist.</p></div></li>
          <li><span class="step-n" aria-hidden="true">03</span><div><h3>See behind the scenes</h3><p>The pipeline that keeps every job organized.</p></div></li>
        </ol>
      </div>
    </div>
  </div>
</section>

<section class="section" id="process" aria-labelledby="process-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Process')}
      <h2 id="process-title">How it works.</h2>
      <p>Four steps. The last one doesn't end: we stay on to keep it running.</p>
    </div>
    ${processSteps()}
  </div>
</section>

<section class="section" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Real work')}
      <h2 id="work-title">Real contractor sites, live today.</h2>
      <p>Have a look around them yourself.</p>
    </div>
    ${workCards(WORK.filter((w) => w.trade !== false))}
    <p class="section-more"><a class="text-link" href="/portfolio/">See the full portfolio ${icon('arrow')}</a></p>
  </div>
</section>

${testimonials()}

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('Straight answers')}
      <h2 id="faq-title">The usual questions.</h2>
    </div>
    ${faqList(HOME_FAQ)}
  </div>
</section>

${ctaBand()}`,
};

const BUILD_FAQ = [
  { q: 'Is $600 the whole build price?', a: 'Yes. $600 is a one-time build fee. After launch, $97/month covers hosting, updates and upkeep, and the instant text reply to website inquiries.' },
  { q: 'How long does a build take?', a: 'About a week once the deposit and your materials (logo, photos, services, service area) are in. Feedback delays move the timeline.' },
  { q: 'What is the free homepage preview?', a: 'A first-draft homepage for your business on a private link, so you can see the direction before you pay anything. Request one at the bottom of this page.' },
  { q: 'Do I need IW Build to use IW Operate?', a: 'No. Operate works with the website you already have. Building on our platform just makes connecting everything simpler.' },
];

export const build = {
  path: '/build/',
  title: 'IW Build: Contractor Websites, $600 + $97/month',
  description: 'IW Build: websites, landing pages, funnels and SEO foundations for contractors. $600 one-time build, then $97/month for hosting, updates, upkeep and an instant text reply to every website inquiry.',
  scripts: ['/assets/js/demo.js'],
  jsonld: [serviceSchema(product('build')), faqSchema(BUILD_FAQ)],
  body: () => `${pageHead({ eyebrow: 'IW Build', title: 'A website that makes calling you the obvious next step.', lead: 'Websites, landing pages, funnels and SEO foundations for contractors. $600 to build. $97/month to keep it running.' })}

<section class="section" aria-labelledby="price-title">
  <div class="wrap">
    <div class="plan-grid">
      <article class="panel plan plan--main">
        ${sectionLabel('Pricing')}
        <h2 id="price-title" class="h-sub">IW Build</h2>
        ${priceTag('$600', 'one-time build', '+ <strong>$97/month</strong> after launch')}
        <p>A site built for your trade and the towns you work in, then kept running for you.</p>
        ${checks(product('build').includes)}
        ${auditBtn()}
      </article>
      <div class="plan-side">
        ${facts([
          { h: 'What $97/month covers', p: 'Hosting, updates and upkeep, plus an instant text reply to every website inquiry so the customer hears from you before they call the next name.' },
          { h: 'Built on one platform', p: 'Your site runs on the same platform as your CRM and automations, so adding IW Operate later is a switch, not a rebuild.' },
        ])}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="what-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('What you get')}
      <h2 id="what-title">What it includes, and why it matters.</h2>
    </div>
    ${facts([
      { h: 'A website for your trade', p: 'Services, service area, photos of your work and why you, written plainly. Homeowners judge your business by your site before they ever call.' },
      { h: 'Built for the phone', p: 'Most homeowners find you on a phone. Tap-to-call and a short estimate form sit where people decide, on every screen.' },
      { h: 'Landing pages and funnels', p: 'One focused page per campaign or service, with one form and one next step. Ads and mailers convert better when they land somewhere specific.' },
      { h: 'SEO foundations', p: 'Pages for the towns you cover, schema search engines can read, a fast site and your Google Business Profile linked, so you show up when someone searches for your trade nearby.' },
    ])}
  </div>
</section>

<section class="section" aria-labelledby="terms-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('The details')}
      <h2 id="terms-title">Payment, timeline and changes.</h2>
    </div>
    ${facts([
      { h: 'Payment', p: 'Half of the $600 build fee to start and the other half before launch. The $97/month starts when the site goes live.' },
      { h: 'Timeline', p: 'About a week once the deposit and your materials are in. Projects with custom integrations are scheduled individually.' },
      { h: 'Changes', p: 'Updates and upkeep are part of the $97/month: changes to existing text, photos and offers. New pages and new features are quoted before any work starts.' },
      { h: 'Your domain', p: 'Your domain name stays yours. We connect it to the site and handle the technical setup.' },
    ])}
  </div>
</section>

${interactiveDemo()}

<section class="section talk-section" id="preview" aria-labelledby="preview-title">
  <div class="wrap">
    <div class="panel demo">
      <div class="demo-copy">
        ${sectionLabel('Free homepage preview')}
        <h2 id="preview-title">See your homepage before you pay anything.</h2>
        <p>Tell us about your business. If it's a fit, Colin builds a first-draft homepage for you on a private link, so you can judge the direction before you commit.</p>
      </div>
      <div class="demo-form">
        ${previewForm('preview-form')}
      </div>
      <div class="demo-steps-wrap">
        <ol class="demo-steps">
          <li><span class="step-n" aria-hidden="true">01</span><div><h3>Tell us about your business.</h3><p>Name and email are enough to start.</p></div></li>
          <li><span class="step-n" aria-hidden="true">02</span><div><h3>Colin follows up personally.</h3><p>A short conversation about your trade, your area and what the site needs to do.</p></div></li>
          <li><span class="step-n" aria-hidden="true">03</span><div><h3>You see the preview.</h3><p>On a private link. If you like it, you get a clear quote.</p></div></li>
        </ol>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('FAQ')}
      <h2 id="faq-title">Build questions.</h2>
    </div>
    ${faqList(BUILD_FAQ)}
  </div>
</section>

${ctaBand()}`,
};

const GROW_FAQ = [
  { q: 'Is ad spend included in the $597?', a: 'No. Ad spend is paid directly to the ad platform and is separate from the $597/month management fee. You set the budget.' },
  { q: 'Do I need to send photos?', a: 'It helps. Your own job photos and short clips make the strongest posts. Send what you have and we turn it into posts.' },
  { q: 'Which platforms?', a: 'The ones that fit your trade and your customers, usually Facebook, Instagram, Google Business Profile and Google ads. We agree on them before anything starts.' },
  { q: 'Can you guarantee leads?', a: 'No one honest can. You get consistent, approved content, managed ads and clear reporting on what the money is doing.' },
];

export const grow = {
  path: '/grow/',
  title: 'IW Grow: Social Media, Ads and Lead Generation, $597/month',
  description: 'IW Grow: social media management, paid ads, lead generation and content for contractors. $597/month plus ad spend, paid directly to the ad platform.',
  jsonld: [serviceSchema(product('grow')), faqSchema(GROW_FAQ)],
  body: () => `${pageHead({ eyebrow: 'IW Grow', title: 'Stay in front of homeowners without living on your phone.', lead: 'Social media management, paid ads, lead generation and content for contractors. $597/month plus ad spend.' })}

<section class="section" aria-labelledby="price-title">
  <div class="wrap">
    <div class="plan-grid">
      <article class="panel plan plan--main">
        ${sectionLabel('Pricing')}
        <h2 id="price-title" class="h-sub">IW Grow</h2>
        ${priceTag('$597', 'per month', '+ <strong>ad spend</strong>, paid to the ad platform')}
        <p>Your social channels kept active and your ads managed, so the phone keeps ringing between referrals.</p>
        ${checks(product('grow').includes)}
        <p class="plan-note">Ad spend is paid directly to the ad platform. It is not part of the $597.</p>
        ${auditBtn()}
      </article>
      <div class="plan-side">
        ${facts([
          { h: 'Why it matters', p: 'Homeowners check your Facebook and Google profile before they call. A page that went quiet two years ago makes people wonder if you are still in business.' },
          { h: 'Your approval first', p: 'We write the posts and set up the ads. Nothing goes out until you approve it.' },
        ])}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="what-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('What you get')}
      <h2 id="what-title">What it includes, and why it helps.</h2>
    </div>
    ${facts([
      { h: 'Social media management', p: 'Three original posts a week across the channels we agree on, written and scheduled for you. Steady proof that you are busy and doing good work.' },
      { h: 'Paid ads', p: 'Campaigns set up and managed on the platforms that fit your trade, with clear monthly reporting on what the spend brought in.' },
      { h: 'Lead generation', p: 'Ads send homeowners to a focused page with a short form. Add IW Operate and every lead gets an instant reply and lands in your pipeline.' },
      { h: 'Content', p: 'Posts built from your job photos and clips: before and afters, finished jobs, crews at work, written in plain language.' },
    ])}
  </div>
</section>

<section class="section" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('How it works')}
      <h2 id="how-title">Your work, turned into posts and leads.</h2>
    </div>
    <ol class="steps steps--3">
      <li class="step"><span class="step-n" aria-hidden="true">01</span><h3>Send what you have</h3><p>Job photos, short clips, news. We tell you what works best.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">02</span><h3>Review and approve</h3><p>Posts, captions and ads come to you first. Nothing is published until you say so.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">03</span><h3>Posted and managed</h3><p>Posts go out three times a week and ads are watched and adjusted every month.</p></li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('FAQ')}
      <h2 id="faq-title">Grow questions.</h2>
    </div>
    ${faqList(GROW_FAQ)}
  </div>
</section>

${ctaBand()}`,
};

const OPERATE_FAQ = [
  { q: 'What does "set up for you, you run it" mean?', a: 'Colin builds the system preloaded for contractors, connects your phone number and forms, writes the messages with you and walks you through it. After that, it runs on its own and you use it day to day.' },
  { q: 'Can you run it for me instead?', a: 'Yes. Managed Operate pricing is available on request.' },
  { q: 'Do I need an IronWeb website?', a: 'No. Operate works with the website you already have. We confirm how your forms and phone number connect before anything is switched on.' },
  { q: 'Will texts go out without permission?', a: 'Automated texts only go to people who reached out to you or gave permission, and anyone can reply STOP to opt out.' },
  { q: 'What does usage cost?', a: 'Text messages, phone calls and AI usage are billed separately based on what your account actually uses. We go through expected volume before you start.' },
];

export const operate = {
  path: '/operate/',
  title: 'IW Operate: Missed-Call Text-Back, AI Receptionist and Follow-Up, $297/month',
  description: 'IW Operate: missed-call text-back, instant lead response, an AI receptionist, review requests, CRM and follow-up for contractors. $297/month, set up for you and preloaded for contractors.',
  jsonld: [serviceSchema(product('operate')), faqSchema(OPERATE_FAQ)],
  body: () => `${pageHead({ eyebrow: 'IW Operate', title: 'Your front office, running while you are on the job.', lead: 'Missed-call text-back, instant lead response, AI reception, review requests, CRM and follow-up. $297/month.' })}

<section class="section" aria-labelledby="price-title">
  <div class="wrap">
    <div class="plan-grid">
      <article class="panel plan plan--main">
        ${sectionLabel('Pricing')}
        <h2 id="price-title" class="h-sub">IW Operate</h2>
        ${priceTag('$297', 'per month')}
        <p>Set up for you, preloaded for contractors. Colin connects your phone number and forms, writes the messages with you and walks you through it. Then it's yours to run.</p>
        ${checks(product('operate').includes)}
        ${demoBtn()}
      </article>
      <div class="plan-side">
        ${facts([
          { h: 'Want it managed?', p: `Managed Operate, where we run it for you, is available. Pricing on request: <a class="text-link" href="${AUDIT_HREF}">ask when you request your audit</a>.` },
          { h: 'Usage is billed separately', p: 'Text messages, phone calls and AI usage are billed on what your account actually uses. We go through expected volume before you start.' },
        ])}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="blocks-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('What it does')}
      <h2 id="blocks-title">Five jobs it takes off your plate.</h2>
    </div>
    <div class="auto-menu">
      ${AUTOMATIONS.map((a) => `<article class="panel auto-item" id="${a.key}">
        <span class="offer-ic">${icon(a.icon)}</span>
        <h3>${esc(a.name)}</h3>
        <dl>
          <dt>The problem</dt><dd>${esc(a.problem)}</dd>
          <dt>What it does</dt><dd>${esc(a.does)}</dd>
        </dl>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="try-title">
  <div class="wrap">
    <div class="panel demo demo--callout">
      <div class="demo-copy">
        ${sectionLabel('Try it')}
        <h2 id="try-title">Be the customer for three minutes.</h2>
        <p>The demo runs on the same system: send an estimate request, get the text back, call the AI receptionist and see the pipeline.</p>
        <div class="callout-actions">
          ${demoBtn()}
        </div>
      </div>
      <div>
        <ol class="demo-steps">
          <li><span class="step-n" aria-hidden="true">01</span><div><h3>Send a request</h3><p>To a demo contractor, like a homeowner would.</p></div></li>
          <li><span class="step-n" aria-hidden="true">02</span><div><h3>Get the reply</h3><p>The text comes back on its own if you opt in.</p></div></li>
          <li><span class="step-n" aria-hidden="true">03</span><div><h3>Call the receptionist</h3><p>Ask it about a job and hear how it handles you.</p></div></li>
        </ol>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('FAQ')}
      <h2 id="faq-title">Operate questions.</h2>
    </div>
    ${faqList(OPERATE_FAQ)}
  </div>
</section>

${ctaBand({ title: 'See it work before you talk to anyone.', text: 'Try the demo, or request a free audit and Colin will show you where it fits.', primary: 'demo' })}`,
};

export const work = {
  path: '/portfolio/',
  title: 'Portfolio',
  description: 'Websites built by IronWeb Digital: TMR Construction, All Phaze Property Solutions, Homes by Heroux and Ocean Groove. Visit each live site.',
  body: () => `${pageHead({ eyebrow: 'Portfolio', title: 'Live sites, built for real businesses.', lead: 'Each of these is online right now. Visit them and judge for yourself.' })}

<section class="section">
  <div class="wrap">
    ${workCards(WORK, { large: true })}
  </div>
</section>

${ctaBand({ title: 'Want one like these?', text: 'Request a free audit and Colin will show you what your site and Google profile are missing.' })}`,
};

export const about = {
  path: '/about/',
  title: 'About',
  description: 'IronWeb Digital is run by Colin Sullivan in Swansea, Massachusetts: websites, ads and automations for contractors and trades, shaped by construction and inside-sales experience.',
  jsonld: [ORG],
  body: () => `${pageHead({ eyebrow: 'About', title: 'Practical systems, from someone who has done the work.', lead: 'IronWeb Digital is run by Colin Sullivan in Swansea, Massachusetts.' })}

<section class="section">
  <div class="wrap founder-grid">
    <div>
      ${HEADSHOT.src ? `<img class="founder-photo founder-photo--about" src="${HEADSHOT.src}" alt="${esc(HEADSHOT.alt)}" width="480" height="480" loading="lazy">` : ''}
      ${sectionLabel('The story')}
      <h2>Why IronWeb exists.</h2>
    </div>
    <div class="founder-text">
      <p>With experience in construction, sitework, and inside sales, Colin knows both sides: doing the work, and chasing the next job.</p>
      <p>On a job site, answering calls, returning texts and keeping a presence online all compete with the work itself. In sales, the fastest reply and the steadiest follow-up usually win the job.</p>
      <p>IronWeb builds the systems that handle that front office for contractors, then stays on to keep them running. You stay in control of your customers and jobs, and you own everything we set up. AI is a tool here, not a replacement for you.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Approach')}
      <h2>How we work.</h2>
    </div>
    ${facts([
      { h: 'Published prices', p: 'Every service has its price on its page, and one-time and monthly costs are spelled out.' },
      { h: 'Honest scope', p: 'You know what is included, what is quoted separately and what we cannot promise. No guaranteed lead counts or rankings.' },
      { h: 'You talk to Colin', p: 'The audit, the plan and the follow-up come from the person doing the work.' },
      { h: 'You own everything', p: 'Your domain, your phone number and your contacts. If we ever part ways, you take all of it with you.' },
      { h: 'We stay on', p: 'Hosting, updates, maintenance and a monthly check-in. Something breaks, call Colin.' },
      { h: 'Contractors and trades', p: 'Roofers, painters, landscapers, carpenters, site work and property maintenance. Based in Swansea, Massachusetts.' },
    ])}
  </div>
</section>

${ctaBand()}`,
};

export const contact = {
  path: '/contact/',
  title: 'Request Your Free Audit',
  description: 'Request a free audit of your Google Business Profile, listings, reviews, website and local map ranking. Or call (774) 486-7776, email colin@ironwebdigital.com, or book a call.',
  body: () => `${pageHead({ eyebrow: 'Contact', title: 'Request your free audit.', lead: 'Tell us about your business. Colin runs the audit and walks you through what he finds.' })}

<section class="section talk-section" id="audit" aria-labelledby="audit-copy-title">
  <div class="wrap">
    <div class="panel demo">
      <div class="demo-copy">
        ${sectionLabel('What we check')}
        <h2 id="audit-copy-title">Your audit covers:</h2>
        <ul class="audit-list">
          ${AUDIT_POINTS.map((a) => `<li>${icon('check')}<span><strong>${a.h}.</strong> ${a.p}</span></li>`).join('\n          ')}
        </ul>
        ${contactLines()}
      </div>
      <div class="demo-form">
        ${auditForm('audit-form')}
      </div>
    </div>
  </div>
</section>

<section class="section" id="book" aria-labelledby="book-title">
  <div class="wrap contact-grid">
    <div class="contact-intro">
      ${sectionLabel('Prefer to talk?')}
      <h2 id="book-title" class="h-sub">Book a call.</h2>
      <p>Pick a time that works for you. A short call about your business and what's slipping through.</p>
      ${contactLines()}
    </div>
    <div class="panel">
      ${bookingBlock()}
    </div>
  </div>
</section>`,
};

const legalWrap = (h1, updated, html) => `${pageHead({ eyebrow: 'Legal', title: h1, lead: `Last updated ${updated}.` })}
<section class="section"><div class="wrap narrow prose">${html}</div></section>`;

export const privacy = {
  path: '/privacy/',
  title: 'Privacy Policy',
  description: 'How IronWeb Digital collects, uses and protects information submitted through this website.',
  body: () => legalWrap('Privacy Policy', 'October 28, 2026', `
<h2>Who runs this site</h2>
<p>This website is operated by ${SITE.legalName}, doing business as IronWeb Digital, Swansea, Massachusetts. Contact: <a href="mailto:${SITE.email}">${SITE.email}</a>, <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a>.</p>
<h2>What we collect</h2>
<p>When you submit a form, we collect what you enter: your name, email address and phone number, and details about your business such as its name, your trade, your town or service area, your current website and your message. We also record the page you submitted from, how you arrived (for example a referring site or campaign tags in the link), and the time of submission. If you book a call, the booking system collects the details you enter there.</p>
<h2>How we use it</h2>
<p>We use your information to respond to your request, run the audit or prepare the homepage preview or quote you asked for, schedule calls, and follow up about our services. Submissions are sent securely to our customer management system, which we use to keep track of inquiries and send follow-up messages.</p>
<h2>Phone calls</h2>
<p>Calls to our number may be answered by an AI receptionist, which takes down your name, number and what you need so we can follow up.</p>
<h2>Text messages</h2>
<p>If you tick the optional text message box, you agree to receive marketing and informational text messages from ${SITE.legalName} (IronWeb Digital) about your inquiry and scheduling. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time, or HELP for help. We record the consent wording you agreed to and when.</p>
<p><strong>We don't sell or share your mobile number or text message consent with third parties or affiliates for their marketing purposes.</strong></p>
<h2>Cookies and browser storage</h2>
<p>This site doesn't use advertising cookies. It keeps campaign tags from the link you arrived on (such as utm_source) in your browser's session storage so they can be included with a form submission; this clears when you close the tab. Fonts are loaded from Google Fonts, which receives your IP address when serving them. The booking calendar is provided by our customer management platform, which may set its own cookies.</p>
<h2>Service providers</h2>
<p>We use a website hosting provider, a customer management and messaging platform, and Google Fonts to operate this site and respond to you. They process information on our behalf to provide those services.</p>
<h2>How we protect your information</h2>
<p>The site is served over HTTPS. Form submissions travel over an encrypted connection to a server function and then to our customer management system, where access is limited to accounts we control and protected by login. Credentials for these systems are never placed in the website's code. We keep inquiry information only as long as it's useful for responding to you and for our business records.</p>
<h2>Your choices</h2>
<p>You can ask us to show, correct or delete the information we hold about you, or to stop contacting you, by emailing <a href="mailto:${SITE.email}">${SITE.email}</a>. Reply STOP to any text to stop text messages.</p>
<h2>Changes</h2>
<p>If we change this policy, we'll update the date at the top of this page.</p>`),
};

export const terms = {
  path: '/terms/',
  title: 'Terms',
  description: 'Terms of use for the IronWeb Digital website and text message program.',
  body: () => legalWrap('Terms of Use', 'October 7, 2026', `
<h2>Who runs this site</h2>
<p>This website is operated by ${SITE.legalName}, doing business as IronWeb Digital, Swansea, Massachusetts. Contact: <a href="mailto:${SITE.email}">${SITE.email}</a>, <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a>.</p>
<h2>Eligibility</h2>
<p>You must be at least 18 years old to submit a form or opt in to text messages on this site.</p>
<h2>Information on this site</h2>
<p>Prices and service descriptions on this site are provided for information. Your written quote or proposal sets out the final scope, price and terms of any work.</p>
<h2>Text message program</h2>
<p>If you opt in on one of our forms, ${SITE.legalName} (IronWeb Digital) may send you marketing and informational text messages about your inquiry, scheduling and our services. By opting in you confirm you are 18 or older.</p>
<ul>
<li>Message frequency varies.</li>
<li>Message and data rates may apply.</li>
<li>Reply <strong>STOP</strong> to opt out at any time. You'll receive one confirmation message and no further texts.</li>
<li>Reply <strong>HELP</strong> for help, or email <a href="mailto:${SITE.email}">${SITE.email}</a>.</li>
<li>Consent to receive texts is not a condition of any purchase.</li>
<li>Carriers are not liable for delayed or undelivered messages.</li>
</ul>
<p>See our <a href="/privacy/">Privacy Policy</a> for how we handle your information.</p>
<h2>Contact</h2>
<p>Questions about these terms: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`),
};

export const notFound = {
  path: '/404.html',
  file: '404.html',
  title: 'Page not found',
  description: 'This page could not be found.',
  noindex: true,
  body: () => `${pageHead({ eyebrow: '404', title: 'That page isn\'t here.', lead: 'It may have moved when the site was rebuilt.' })}
<section class="section"><div class="wrap">
  <div class="hero-actions">
    <a class="btn btn-primary" href="/">Go to the homepage ${icon('arrow')}</a>
    <a class="btn btn-outline" href="/contact/">Contact</a>
  </div>
</div></section>`,
};

// ---------- Interactive contractor demo (/demo/, was /contractor-demo/ until 2026-10-28) ----------
// One page for guided (on the phone) and self-guided use. Behaviour: /assets/js/contractor-demo.js.
// Backend: /api/contractor-demo (preview mode by default; see netlify/lib/contractor-demo-config.mjs).
const CD_SERVICES = [
  ['Landscaping', 'Lawn care, plantings, mulch and seasonal cleanups.'],
  ['Painting', 'Interior and exterior painting, prep included.'],
  ['Carpentry', 'Trim, decks, built-ins and repairs.'],
  ['Handyman Services', 'The small jobs on your list, handled in one visit.'],
  ['Property Maintenance', 'Ongoing upkeep for homes and rental properties.'],
  ['Other Home Services', 'Tell us what you need and we will let you know.'],
];
const CD_STAGES = [
  ['New Lead', 'The inquiry lands here the moment it is submitted.'],
  ['Contacted', 'Someone has reached out by text or phone.'],
  ['Estimate Booked', 'A visit or call is on the calendar, with reminders.'],
  ['Quote Sent', 'The business sends the estimate. Always a manual step.'],
  ['Job Scheduled', 'The customer said yes and the work has a date.'],
  ['Job Completed', 'Work is done. Review and referral requests go out.'],
];
const CD_CAPS = [
  ['message', 'Instant inquiry acknowledgment', 'Every form request gets a reply right away, so the customer knows they were heard.'],
  ['phone', 'Missed-call recovery', 'Missed a call on a job site? The caller gets a text back so the conversation keeps going.'],
  ['user', 'AI receptionist', 'Answers when you cannot, gathers the project details and captures the callback.'],
  ['calendar', 'Estimate scheduling and reminders', 'Estimate visits get booked and confirmed, with reminders so nobody forgets.'],
  ['arrow', 'Quote follow-up', 'Once you send a quote, polite follow-ups keep it from going quiet.'],
  ['star', 'Review and referral requests', 'When the job is done, the customer is asked for a review and a referral.'],
];

export const contractorDemo = {
  path: '/demo/',
  title: 'Interactive Contractor Demo',
  description: 'Try the system yourself: submit an estimate request to a demo home-service business and see the follow-up, the AI receptionist and the pipeline a contractor sees.',
  scripts: ['/assets/js/contractor-demo.js'],
  body: () => `<section class="page-head cd-hero" aria-labelledby="cd-title">
  <div class="page-head-art" aria-hidden="true"></div>
  <div class="wrap">
    <p class="cd-chip"><span class="cd-chip-dot" aria-hidden="true"></span>Interactive demo · Powered by IronWeb</p>
    <h1 id="cd-title">Your next customer is calling. Is your business ready?</h1>
    <p class="lead">Experience the system that captures inquiries, follows up with customers, and keeps your jobs organized, even when you're busy working.</p>
    <div class="hero-actions cd-hero-actions">
      <a class="btn btn-primary" href="#experience" data-cd-start>Try the live demo ${icon('arrow')}</a>
      <a class="btn btn-outline" href="#how">See how it works</a>
    </div>
  </div>
</section>

<section class="section" id="how" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('How it works')}
      <h2 id="how-title">Three steps. About three minutes.</h2>
      <p>You play the customer. We show you what happens next, from the first reply to the pipeline the business owner sees.</p>
    </div>
    <ol class="steps steps--3">
      <li class="step"><span class="step-n" aria-hidden="true">01</span><h3>Be the customer</h3><p>Submit a realistic estimate request to a demo home-service business.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">02</span><h3>Experience the response</h3><p>See the follow-up and try the AI receptionist.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">03</span><h3>See behind the scenes</h3><p>Explore the pipeline and how the system keeps every job organized.</p></li>
    </ol>
  </div>
</section>

<section class="section cd-exp" id="experience" aria-labelledby="exp-title" data-cd data-step="1">
  <div class="wrap">
    <h2 id="exp-title" class="sr-only">Interactive demo</h2>
    <div class="cd-bar">
      <ol class="cd-progress" aria-label="Demo progress">
        <li><button type="button" data-goto="1" aria-current="step"><span class="cd-n">01</span><span class="cd-t">Be the customer</span></button></li>
        <li><button type="button" data-goto="2" disabled><span class="cd-n">02</span><span class="cd-t">Experience the response</span></button></li>
        <li><button type="button" data-goto="3" disabled><span class="cd-n">03</span><span class="cd-t">See behind the scenes</span></button></li>
      </ol>
      <button type="button" class="cd-restart" data-cd-restart>Restart demo</button>
    </div>
    <p class="cd-mode" data-cd-mode role="note"><strong>Preview mode.</strong> This demo isn't connected to a live system yet. Your request won't be stored, and anything we show happening behind the scenes is labeled as simulated.</p>

    <!-- STEP 1: be the customer -->
    <div class="cd-panel" data-panel="1" aria-labelledby="cd-s1-h">
      <div class="cd-panel-head">
        <p class="cd-kicker">Step 1 of 3</p>
        <h3 id="cd-s1-h" class="cd-h" tabindex="-1">Be the customer.</h3>
        <p>This is the website of a home-service business. Find a service you might need and request an estimate, just like a real customer would.</p>
      </div>
      <div class="cd-site-frame">
        <div class="cd-site-bar" aria-hidden="true"><span class="browser-dots"><i></i><i></i><i></i></span><span class="cd-site-url">summithomeservices.example</span></div>
        <p class="cd-fiction">Fictional demonstration business</p>
        <div class="cd-site" data-cd-site>
          <div class="sm-nav"><span class="sm-logo"><span aria-hidden="true">▲</span> Summit Home Services</span><span class="sm-links" aria-hidden="true"><span>Services</span><span>About</span><span>Contact</span></span></div>
          <div class="sm-hero">
            <p class="sm-tag">Home services, done right</p>
            <p class="sm-h">Your home, taken care of.</p>
            <p class="sm-sub">Landscaping, painting, carpentry and handyman work for homeowners and property managers.</p>
            <a class="sm-btn" href="#cd-estimate">Request a Free Estimate</a>
          </div>
          <div class="sm-services">
            <p class="sm-h2">What we do</p>
            <ul class="sm-grid">
              ${CD_SERVICES.map(([n, d]) => `<li><strong>${n}</strong><span>${d}</span></li>`).join('')}
            </ul>
          </div>
          <div class="sm-form-wrap" id="cd-estimate">
            <p class="sm-h2">Request a free estimate</p>
            <p class="cd-before" role="note">${icon('message')}<span>You're about to experience what happens when a customer requests an estimate from a business using IronWeb.</span></p>
            <form class="sm-form" data-cd-form novalidate>
              <div class="sm-row">
                <div class="field"><label for="cd-first">First Name <span class="req">(required)</span></label><input id="cd-first" name="firstName" autocomplete="given-name" required maxlength="60" data-error="Enter your first name."><p class="field-error" aria-live="polite"></p></div>
                <div class="field"><label for="cd-last">Last Name <span class="req">(required)</span></label><input id="cd-last" name="lastName" autocomplete="family-name" required maxlength="60" data-error="Enter your last name."><p class="field-error" aria-live="polite"></p></div>
              </div>
              <div class="sm-row">
                <div class="field"><label for="cd-phone">Phone Number <span class="req">(required)</span></label><input id="cd-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" data-error="Enter a 10-digit phone number."><p class="field-error" aria-live="polite"></p></div>
                <div class="field"><label for="cd-email">Email Address <span class="opt">(optional)</span></label><input id="cd-email" name="email" type="email" autocomplete="email" maxlength="200"><p class="field-error" aria-live="polite"></p></div>
              </div>
              <div class="field"><label for="cd-service">Service Needed <span class="req">(required)</span></label><select id="cd-service" name="service" required data-error="Choose a service."><option value="">Choose a service</option>${CD_SERVICES.map(([n]) => `<option>${n}</option>`).join('')}</select><p class="field-error" aria-live="polite"></p></div>
              <div class="field"><label for="cd-desc">Brief Project Description <span class="req">(required)</span></label><textarea id="cd-desc" name="description" rows="3" required maxlength="1200" data-error="Add a short project description." placeholder="For example: repaint two bedrooms and a hallway"></textarea><p class="field-error" aria-live="polite"></p></div>
              <div class="field field-check">
                <input type="checkbox" id="cd-sms" name="smsConsent" value="yes">
                <label for="cd-sms">I agree to receive text messages from ${SITE.legalName} (IronWeb Digital) about this demo request, including an automated reply. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. See our <a href="/privacy/">Privacy Policy</a> and <a href="/terms/">Terms</a>. (Optional.)</label>
              </div>
              <div class="hp" aria-hidden="true"><label for="cd-bf">Leave this field empty</label><input id="cd-bf" name="bot_field" tabindex="-1" autocomplete="off"></div>
              <button type="submit" class="sm-btn sm-submit">Submit My Demo Request</button>
              <p class="cd-status" role="alert" aria-live="assertive"></p>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- STEP 2: experience the response -->
    <div class="cd-panel" data-panel="2" hidden aria-labelledby="cd-s2-h">
      <div class="cd-panel-head">
        <p class="cd-kicker">Step 2 of 3</p>
        <h3 id="cd-s2-h" class="cd-h" tabindex="-1">Your request has been received.</h3>
        <p>Here's what just happened behind the scenes.</p>
      </div>
      <div class="cd-two">
        <div>
          <ol class="cd-events" data-cd-events>
            <li data-ev="submitted"><span class="cd-ev-dot" aria-hidden="true"></span><span class="cd-ev-t">Customer submits estimate request.</span><span class="cd-badge" data-badge></span></li>
            <li data-ev="contact"><span class="cd-ev-dot" aria-hidden="true"></span><span class="cd-ev-t">Contact is created or updated in the CRM.</span><span class="cd-badge" data-badge></span></li>
            <li data-ev="opportunity"><span class="cd-ev-dot" aria-hidden="true"></span><span class="cd-ev-t">Opportunity enters the New Lead pipeline stage.</span><span class="cd-badge" data-badge></span></li>
            <li data-ev="sms"><span class="cd-ev-dot" aria-hidden="true"></span><span class="cd-ev-t">Customer receives an acknowledgment text, if opted in and messaging is enabled.</span><span class="cd-badge" data-badge></span></li>
            <li data-ev="owner_alert"><span class="cd-ev-dot" aria-hidden="true"></span><span class="cd-ev-t">Business owner receives a notification, when configured.</span><span class="cd-badge" data-badge></span></li>
          </ol>
          <p class="cd-legend"><span class="cd-badge is-confirmed">Confirmed</span> happened for real · <span class="cd-badge is-pending">Pending</span> handed to the automation, not yet confirmed · <span class="cd-badge is-simulated">Simulated</span> shown for the demo only</p>
        </div>
        <div class="cd-followup">
          <h4>Experience the follow-up</h4>
          <p>Most contractors can't answer every inquiry immediately. IronWeb helps make sure new opportunities don't get forgotten.</p>
          <figure class="cd-sms" aria-labelledby="cd-sms-cap">
            <div class="cd-sms-bubble" data-cd-sms-text>Hi <span data-cd-first>there</span>, thanks for contacting Summit Home Services about your project. We got your request and will reach out shortly to set up your free estimate. Reply STOP to opt out.</div>
            <figcaption id="cd-sms-cap" data-cd-sms-cap>Example message. No text was sent.</figcaption>
          </figure>
        </div>
      </div>

      <div class="cd-recep" aria-labelledby="cd-recep-h">
        <div>
          <h4 id="cd-recep-h">What happens when you're too busy to answer?</h4>
          <p>Imagine you're on a job site and a potential customer calls. Experience how an AI receptionist can answer, gather project details, and help capture the opportunity.</p>
          <p class="cd-ask">Try asking:</p>
          <ul class="cd-asks">
            <li>"Do you offer painting services?"</li>
            <li>"Can I request an estimate?"</li>
            <li>"Can someone call me back about a project?"</li>
          </ul>
        </div>
        <div class="cd-recep-cta" data-cd-recep>
          <span class="cd-soon">Coming soon</span>
          <button type="button" class="btn btn-outline" disabled>${icon('phone')} Call the AI Receptionist</button>
          <p class="cd-recep-note">The demo receptionist line is being set up and isn't open yet. Book a consultation below and we'll show it to you live.</p>
        </div>
      </div>
    </div>

    <!-- STEP 3: behind the scenes -->
    <div class="cd-panel" data-panel="3" hidden aria-labelledby="cd-s3-h">
      <div class="cd-panel-head">
        <p class="cd-kicker">Step 3 of 3</p>
        <h3 id="cd-s3-h" class="cd-h" tabindex="-1">Here's what the business owner sees.</h3>
        <p>Every inquiry becomes a card on a simple pipeline. As the job moves forward, the card moves with it.</p>
      </div>
      <div class="cd-pipe-wrap" tabindex="0" aria-label="Example pipeline, scrollable">
        <ol class="cd-pipe">
          ${CD_STAGES.map(([n, d], i) => `<li class="cd-stage${i === 0 ? ' is-first' : ''}" data-stage="${i}">
            <p class="cd-stage-n">${n}</p>
            <p class="cd-stage-d">${d}</p>
            ${i === 0 ? '<div class="cd-card" data-cd-card hidden><strong data-cd-card-name>Demo customer</strong><span data-cd-card-svc>Estimate request</span><span class="cd-badge" data-cd-card-badge>Simulated</span></div>' : ''}
            ${i === 3 ? '<span class="cd-manual">Manual step</span>' : ''}
          </li>`).join('\n          ')}
        </ol>
      </div>
      <p class="cd-swipe" aria-hidden="true">Swipe to see all six stages →</p>
      <p class="cd-pipe-note">Only the New Lead card reflects your demo request. The other stages are illustrative: the demo never moves a real opportunity forward, and Quote Sent only happens when a business actually sends an estimate.</p>

      <div class="cd-system">
        <h4>One system, from first inquiry to finished job.</h4>
        <ul class="cd-caps">
          ${CD_CAPS.map(([ic, h, p]) => `<li><span class="offer-ic">${icon(ic)}</span><div><strong>${h}</strong><p>${p}</p></div></li>`).join('\n          ')}
        </ul>
        <p class="cd-pipe-note">These are capabilities of IW Operate, not a list of everything that ran during this short demo.</p>
      </div>
    </div>

    <div class="cd-nav">
      <button type="button" class="btn btn-outline" data-cd-prev disabled>Previous</button>
      <p class="cd-hint" data-cd-hint>Submit the estimate request to continue.</p>
      <button type="button" class="cd-restart cd-restart--nav" data-cd-restart>Restart demo</button>
      <button type="button" class="btn btn-primary" data-cd-next disabled>Next ${icon('arrow')}</button>
    </div>
  </div>
</section>

<section class="section cta-band cd-convert" aria-labelledby="cd-conv-title">
  <div class="wrap cta-band-inner">
    <div>
      <h2 id="cd-conv-title">Imagine this running for your business.</h2>
      <p>Your website captures the inquiry. Your system follows up. Your pipeline keeps everything organized. You focus on getting the job done.</p>
    </div>
    <div class="cta-band-actions">
      <a class="btn btn-primary" href="#book" data-cd-book>Book a call with Colin ${icon('arrow')}</a>
      <a class="btn btn-outline" href="/operate/">See IW Operate</a>
    </div>
  </div>
</section>

<section class="section" id="book" aria-labelledby="book-title">
  <div class="wrap contact-grid">
    <div class="contact-intro">
      ${sectionLabel('Book a call')}
      <h2 id="book-title" class="h-sub">See it on your own business.</h2>
      <p>Pick a time for a walkthrough. Colin shows you how the system would handle your calls, leads and reviews.</p>
      ${contactLines()}
    </div>
    <div class="panel">
      ${bookingBlock()}
    </div>
  </div>
</section>`,
};

export const PAGES = [home, build, grow, operate, contractorDemo, work, about, contact, privacy, terms, notFound];
