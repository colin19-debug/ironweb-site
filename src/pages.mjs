// Page bodies. Each export returns { path, title, description, body, ... } for scripts/build.mjs.
import { SITE, PRICES, WORK, PROCESS, PREVIEW_STEPS, PREVIEW_FAQ, VALUE_POINTS, AUTOMATIONS, TESTIMONIALS, HEADSHOT, LADDER, BUNDLES, OBJECTION_FAQ } from './data.mjs';
import {
  esc, icon, hero, pageHead, sectionLabel, inquiryForm, talkForm, agenticForm, interactiveDemo, speedForm, SPEED_CTA, leadPhone,
  bookingBlock, contactLines, faqList, ctaBand, bookHref, demoHref, DEMO_CTA, talkHref, TALK_CTA,
} from './components.mjs';

const ORG = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.name,
  url: `${SITE.domain}/`,
  logo: `${SITE.domain}/favicon.svg`,
  image: `${SITE.domain}/assets/img/og-image.jpg`,
  description: 'Websites and speed-to-lead automation for contractors and real estate in Southeastern Massachusetts.',
  telephone: SITE.phoneTel,
  email: SITE.email,
  founder: { '@type': 'Person', name: SITE.founder },
  address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'US' },
  areaServed: [
    { '@type': 'City', name: 'Swansea, MA' },
    { '@type': 'AdministrativeArea', name: SITE.regionName },
    { '@type': 'Country', name: 'United States' },
  ],
};

// ---------- shared sections ----------
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

function processSteps() {
  return `<ol class="steps">
    ${PROCESS.map((s, i) => `<li class="step">
      <span class="step-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <h3>${s.name}</h3>
      <p>${s.text}</p>
    </li>`).join('\n    ')}
  </ol>`;
}

const previewSteps = () => `<ol class="demo-steps">
          ${PREVIEW_STEPS.map((d, i) => `<li><span class="step-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${d.name}</h3><p>${d.text}</p></div></li>`).join('\n          ')}
        </ol>`;

// "Let's talk about your website": the next step after the demo. Same form on Home (#talk) and Contact (#talk).
function talkSection({ id = 'talk-home', onHome = true, detailsOpen = false } = {}) {
  return `<section class="section talk-section" id="talk" aria-labelledby="${id}-title">
  <div class="wrap">
    <div class="panel demo">
      <div class="demo-copy">
        ${sectionLabel('Next step')}
        <h2 id="${id}-title">Let's talk about your website.</h2>
        <p>Tell us a little about your business. Colin will follow up personally, learn what you need, and if it's a fit, create a free homepage preview so you can see the direction before you commit.</p>
      </div>
      <div class="demo-form">
        ${talkForm(id, { detailsOpen })}
      </div>
      <div class="demo-steps-wrap">
        ${previewSteps()}
        <p class="talk-alt">Prefer to talk it through? <a href="${bookHref()}">Book a call</a>${onHome ? '' : ''}, call <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a> or email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
      </div>
    </div>
  </div>
</section>`;
}

// Homepage "Text me" section (#talk, form talk-home): speed-to-lead, phone + consent required.
function speedSection() {
  const steps = [
    ['You get a text in under a minute', 'The same automatic text-back your customers would get.'],
    ['Colin calls you personally', 'A real conversation about your business and what you need.'],
    ['Free homepage preview on a private link', 'See the direction before you commit to anything.'],
  ];
  return `<section class="section talk-section" id="talk" aria-labelledby="talk-home-title">
  <div class="wrap">
    <div class="panel demo">
      <div class="demo-copy">
        ${sectionLabel('Try it')}
        <h2 id="talk-home-title">Be the lead. See how fast we answer.</h2>
        <p>Send your details and you'll get exactly what your customers would get from an IronWeb system: a text back in under a minute, then a personal follow-up.</p>
      </div>
      <div class="demo-form">
        ${speedForm('talk-home')}
      </div>
      <div class="demo-steps-wrap">
        <ol class="demo-steps">
          ${steps.map(([h, t], i) => `<li><span class="step-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${h}</h3><p>${t}</p></div></li>`).join('\n          ')}
        </ol>
        <div class="founder-card">
          ${HEADSHOT.src ? `<img class="founder-photo" src="${HEADSHOT.src}" alt="${esc(HEADSHOT.alt)}" width="96" height="96" loading="lazy">` : ''}
          <p><strong>Colin Sullivan</strong><span>Builds and runs every IronWeb system, from Swansea, MA.</span></p>
        </div>
        <p class="talk-alt">Rather not get a text? Email <a href="mailto:${SITE.email}">${SITE.email}</a> or use the <a href="/contact/">contact page</a>.</p>
      </div>
    </div>
  </div>
</section>`;
}

// Placeholder testimonials only render when building with SHOW_PLACEHOLDERS=1 (local preview).
const SHOW_PLACEHOLDERS = process.env.SHOW_PLACEHOLDERS === '1';
const smsHref = `sms:${SITE.phoneTel}?&amp;body=DEMO`;

function bundleCards() {
  return `<div class="bundle-grid">
      ${BUNDLES.map((b) => `<article class="panel bundle" id="bundle-${b.key}" aria-labelledby="bundle-${b.key}-h">
        <p class="bundle-flag">Most Popular</p>
        <h3 id="bundle-${b.key}-h">${b.name}</h3>
        <p class="price"><span class="price-amount">${b.price.replace('/month', '')}</span> <span class="price-cadence">per month</span></p>
        <p class="bundle-setup"><strong>${PRICES.bundleSetup} setup</strong>, ${PRICES.bundleSetupWaiver}.</p>
        <p class="bundle-pitch">${esc(b.pitch)}</p>
        <p class="bundle-sub">What it does</p>
        ${checks(b.functions.map(esc))}
        <p class="bundle-sub">What you get out of it</p>
        <ul class="bundle-goals">${b.goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
        <p class="bundle-site">${icon('check')}<span><strong>Website included.</strong> $600 value, included with the bundle.</span></p>
        <a class="btn btn-primary" href="/#talk">Ask about the ${b.name} ${icon('arrow')}</a>
      </article>`).join('\n      ')}
    </div>`;
}

const statusLabel = { ready: 'Ready now', scoped: 'Scoped on request', dev: 'In development' };

const priceTag = (amount, cadence, monthly) => `<p class="price"><span class="price-amount">${amount}</span> <span class="price-cadence">${cadence}</span>${monthly ? `<span class="price-plus">+ <strong>${monthly}</strong></span>` : ''}</p>`;
const checks = (items) => `<ul class="checks">${items.map((t) => `<li>${icon('check')}<span>${t}</span></li>`).join('')}</ul>`;

// ---------- pages ----------
export const home = {
  path: '/',
  title: '',
  fullTitle: 'Missed-Call Text-Back & Automations for Contractors & Realtors | Southeastern MA | IronWeb Digital',
  description: 'Systems that Stick. Missed-call text-back that answers every caller in under a minute, $97/month with no setup fee. Automation bundles and websites for contractors and real estate in Southeastern MA.',
  overlayHeader: true,
  preloadHero: true,
  jsonld: [ORG],
  scripts: ['/assets/js/demo.js'],
  body: () => `${hero()}

${interactiveDemo()}

<section class="section" id="automation" aria-labelledby="auto-title">
  <div class="wrap">
    <div class="offer-head">
      <div class="section-head">
        ${sectionLabel('Start where you are')}
        <h2 id="auto-title">Start small. Grow big.</h2>
        <p>$97/month per stage. No setup fee. Start with the problem costing you the most, then add the next stage when you're ready. No bloated packages and no paying for tools you don't need.</p>
      </div>
      ${leadPhone()}
    </div>
    <ol class="ladder">
      ${LADDER.map((st, i) => `<li class="ladder-step" id="stage-${st.key}">
        <div class="ladder-top">
          <span class="ladder-n" aria-hidden="true">Stage ${i + 1}</span>
          <span class="ladder-price"><strong>$97</strong>/month</span>
        </div>
        <h3><span class="sr-only">Stage ${i + 1}: </span>${esc(st.name)}</h3>
        <p class="ladder-outcome">${esc(st.outcome)}</p>
        ${checks(st.items.map(esc))}
        <p class="ladder-note">${esc(st.note)}</p>
      </li>`).join('\n      ')}
    </ol>
    <div class="ladder-foot">
      <p><strong>No setup fee on any stage.</strong> Add stages as you grow, or take a bundle below if you want it all at once.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-sms" href="${smsHref}">${icon('message')} Text DEMO to ${SITE.phoneDisplay}</a>
        <a class="btn btn-outline" href="#talk">Or we'll text you</a>
      </div>
    </div>
  </div>
</section>

<section class="section" id="bundles" aria-labelledby="bundles-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('The express option')}
      <h2 id="bundles-title">Want it all? Take the bundle.</h2>
      <p>Every stage your industry needs, set up together, with your website included. ${PRICES.bundleSetup} setup on bundles only, ${PRICES.bundleSetupWaiver}.</p>
    </div>
    ${bundleCards()}
  </div>
</section>

<section class="section" id="value" aria-labelledby="value-title">
  <div class="wrap value-grid">
    <div class="section-head">
      ${sectionLabel('Websites')}
      <h2 id="value-title">Need a website too?</h2>
      <p>Before anyone calls, they've already judged your business by your site. An IronWeb website is built to pass that test, then make reaching you easy.</p>
      <div class="site-price">
        <p><strong>$600 one-time.</strong> A finished site, handed over to you. No monthly plan required.</p>
        <p><strong>Included with either bundle.</strong> $600 value, included.</p>
        <a class="text-link" href="/build/">Website details ${icon('arrow')}</a>
      </div>
    </div>
    <dl class="value-list">
      ${VALUE_POINTS.map((v) => `<div><dt>${v.h}</dt><dd>${v.p}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>

<section class="section" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Real work')}
      <h2 id="work-title">Real websites, live today.</h2>
      <p>The demo shows the idea. These are real businesses with IronWeb websites. Have a look around them yourself.</p>
    </div>
    ${workCards(WORK.filter((w) => w.homepage !== false))}
  </div>
</section>

${(() => {
  const list = TESTIMONIALS.filter((t) => !t.placeholder || SHOW_PLACEHOLDERS);
  if (!list.length) return '';
  return `<section class="section" id="testimonials" aria-labelledby="testi-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Results')}
      <h2 id="testi-title" class="h-sub">In their words.</h2>
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
})()}

<section class="section" id="process" aria-labelledby="process-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Process')}
      <h2 id="process-title">How a website project runs.</h2>
      <p>One conversation to start, a preview before you commit, and a clear quote.</p>
    </div>
    ${processSteps()}
  </div>
</section>

<section class="section" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('Straight answers')}
      <h2 id="faq-title">The usual questions.</h2>
    </div>
    ${faqList(OBJECTION_FAQ)}
  </div>
</section>

${speedSection()}`,
};

// ---------- Services overview (2026-10-11): structure and copy adapted from the old ironwebdigital.com
// services page. Unsupported claims from that page (drone/FAA, "Rank #1", 50+ directories, 24/7 AI chat,
// 5-minute replies, "our team") were dropped or reworded.
const svcRow = ({ n, key, label, title, text, chips, points, price, cta, href, visual, flip }) => `<section class="svc-row${flip ? ' svc-row--flip' : ''}" id="${key}" aria-labelledby="${key}-title">
  <div class="svc-copy">
    <p class="svc-num"><span>${n}</span> ${label}</p>
    <h2 id="${key}-title">${title}</h2>
    <p class="svc-text">${text}</p>
    <ul class="chips" aria-label="${label} at a glance">${chips.map((c) => `<li>${c}</li>`).join('')}</ul>
    ${checks(points)}
    ${price ? `<p class="svc-row-price">${price}</p>` : ''}
    <a class="btn btn-primary" href="${href}">${cta} ${icon('arrow')}</a>
  </div>
  <div class="svc-visual">${visual}</div>
</section>`;

const visWebsite = `<figure class="vis vis-site" aria-label="Example website layout">
      <div class="vis-bar" aria-hidden="true"><span class="browser-dots"><i></i><i></i><i></i></span><span class="vis-url">yourbusiness.com</span></div>
      <div class="vis-site-body" aria-hidden="true">
        <div class="vis-site-nav"><b>YOUR BUSINESS NAME</b><span>Services</span><span>Work</span><span class="vis-call">${icon('phone')} Call now</span></div>
        <div class="vis-site-hero"><span class="vis-line w70"></span><span class="vis-line w50"></span><span class="vis-line w60 thin"></span><span class="vis-btns"><i>Get a free quote</i><i class="ghost">Our work</i></span></div>
        <div class="vis-site-cards"><span></span><span></span><span></span></div>
      </div>
      <figcaption>Click-to-call and the quote form, above the fold</figcaption>
    </figure>`;

const visPipeline = `<figure class="vis vis-pipe" aria-labelledby="pipe-cap">
      <p class="vis-head">Lead pipeline · example</p>
      <ol class="pipe">
        <li class="on"><span>New lead from website form</span><time>Now</time></li>
        <li class="on"><span>Auto text sent: "We'll call you right back"</span><time>0:12</time></li>
        <li class="on"><span>Lead entered follow-up sequence</span><time>0:13</time></li>
        <li><span>Day 3: Reminder + booking link</span><time>Scheduled</time></li>
        <li><span>After the job: review request</span><time>Scheduled</time></li>
      </ol>
      <figcaption id="pipe-cap">Example of an automated follow-up timeline</figcaption>
    </figure>`;

const visContent = `<figure class="vis vis-cal" aria-labelledby="cal-cap">
      <p class="vis-head">This week's posts</p>
      <ul class="cal">
        <li><b>Mon</b><span>Before/after: kitchen drywall repair</span><em class="ok">Approved</em></li>
        <li><b>Wed</b><span>Tip: what to ask before hiring a contractor</span><em class="ok">Approved</em></li>
        <li><b>Fri</b><span>Job site photo + Google Business update</span><em>Awaiting you</em></li>
      </ul>
      <p class="cal-ch" aria-hidden="true"><span>Facebook</span><span>Instagram</span><span>Google Business</span></p>
      <figcaption id="cal-cap">Example content week: three posts, adapted to each channel</figcaption>
    </figure>`;

const visLocal = `<figure class="vis vis-local" aria-labelledby="local-cap">
      <div class="vis-search" aria-hidden="true">${icon('search')}<span>contractor near me</span></div>
      <div class="vis-gbp">
        <span class="vis-pin" aria-hidden="true"></span>
        <div><b>Your Business Name</b><span>Contractor · Swansea, MA</span><span class="vis-gbp-acts" aria-hidden="true"><i>Website</i><i>Call</i><i>Directions</i></span></div>
      </div>
      <ul class="vis-local-list">
        <li>Service pages for each town you cover</li>
        <li>Schema markup search engines can read</li>
        <li>Profile, website and calls all pointing the same way</li>
      </ul>
      <figcaption id="local-cap">Example of a local search listing</figcaption>
    </figure>`;

export const services = {
  path: '/services/',
  title: 'Services: Websites, Automations and Local Growth',
  description: 'IronWeb Digital services: websites built to close leads, automations that follow up after hours, content that keeps you visible, and local search setup. Southeastern MA and nationwide.',
  body: () => `${pageHead({ eyebrow: 'Services', title: 'Services built to grow your business.', lead: 'Not a menu of features: a system designed to get your phone ringing. Every service connects to the next, so new leads come in, get answered and stay warm.' })}

<div class="wrap svc-rows">
${svcRow({
  n: '01', key: 'websites', label: 'Websites', title: 'A website built to close leads, not just look good.',
  text: 'Your website is the first thing a customer judges your business on. We build custom sites that load fast, work on every phone, and guide visitors straight to your contact form or phone number. No page-builders, no templates: built from the ground up to convert.',
  chips: ['Mobile-first', 'SEO-ready', 'Fast load', 'Conversion-focused', 'Custom design'],
  points: ['Custom design, no templates or Squarespace', 'Built to load fast on phones', 'Click-to-call and lead forms above the fold', 'Google Business Profile linked', 'Schema markup for local search'],
  price: '<strong>From $600 one-time.</strong> Included with either automation bundle. Managed builds $1,500 setup + $100/month.',
  cta: 'Start your website project', href: '/contact/#talk', visual: visWebsite,
})}
${svcRow({
  n: '02', key: 'automations', label: 'Automations', title: 'Your business keeps running after hours.', flip: true,
  text: 'While competitors are still calling leads back by hand, forgetting to ask for reviews and letting inquiries go cold, your systems keep working. Missed calls get an instant text. New leads enter a follow-up sequence and stay warm until they book. Happy customers get a review request.',
  chips: ['Missed-call text-back', 'Review requests', 'Two-way texting', 'Email follow-up', 'Lead pipelines', 'Appointment reminders'],
  points: ['Instant text-back on every missed call', 'Review requests after completed jobs', 'Email and text follow-up for new and cold leads', 'Two-way texting from one inbox', 'Booking confirmations and reminders, scoped per business'],
  price: '<strong>$97/month per stage, no setup fee.</strong> Bundles from $297/month.',
  cta: 'Build your automation system', href: '/automations/', visual: visPipeline,
})}
${svcRow({
  n: '03', key: 'growth', label: 'Growth', title: 'Show up where your customers are looking.',
  text: 'Social content that builds trust and a Google Business Profile that turns searches into calls. Three original posts a week, written for you and adapted to the channels you use, so you stay top of mind without spending hours on your phone.',
  chips: ['Google Business', 'Social media', 'Content plan', 'Paid ads'],
  points: ['Three original posts a week, adapted to each channel', 'Facebook, Instagram and Google Business Profile, as agreed', 'Captions written and posts scheduled for you', 'Nothing goes out without your approval', 'Paid ad management available'],
  price: '<strong>$597/month.</strong> Paid ads from $750/month + ad spend.',
  cta: 'Grow your local presence', href: '/growth/', visual: visContent,
})}
${svcRow({
  n: '04', key: 'local-search', label: 'Local search', title: 'Get found in your area.', flip: true,
  text: 'When someone searches "contractor near me" or "realtor in Fall River", your business should be easy to find and easy to choose. Every IronWeb site is built with local search in mind, and Growth keeps your Google Business Profile active.',
  chips: ['Local keywords', 'Service-area pages', 'Schema markup', 'Google Business'],
  points: ['Keywords for your services and the towns you cover', 'Service and service-area pages', 'Schema markup on every build', 'Google Business Profile setup and linking', 'Ongoing profile updates with Growth'],
  price: '<strong>Included</strong> in every website build: no separate fee.',
  cta: 'Ask about local search', href: '/contact/?interest=local-search#inquiry', visual: visLocal,
})}
</div>

<section class="section" aria-labelledby="ind-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Who we build for')}
      <h2 id="ind-title">Built for businesses like yours.</h2>
      <p>Every local business is different, but they all want more calls and more booked jobs. Most of our work is for contractors, trades and real estate, and we build for other local businesses too.</p>
    </div>
    <ul class="ind-chips">
      <li>Contractors</li><li>Trades</li><li>Real estate</li><li>Property services</li><li>Home services</li><li>Restaurants</li><li>Music and entertainment</li><li>Local services</li>
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('How it works')}
      <h2 id="how-title">From first call to launch.</h2>
      <p>No drawn-out agency timelines. One conversation, a preview before you commit, and a clear quote.</p>
    </div>
    <ol class="steps">
      <li class="step"><span class="step-n" aria-hidden="true">01</span><h3>Free strategy call</h3><p>A short call about your business and what's costing you leads. No pitch, just findings.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">02</span><h3>Your game plan</h3><p>A plan for your business and market: what gets built, what it costs, and a free homepage preview on a private link.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">03</span><h3>We build it</h3><p>Website, automations, content. Colin handles the build while you keep running your business.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">04</span><h3>Leads start coming in</h3><p>Once you're live, your site does its job, and with automations every missed call gets a text and every lead gets followed up.</p></li>
    </ol>
  </div>
</section>

<section class="section cta-band">
  <div class="wrap cta-band-inner">
    <div>
      <h2>Not sure which services you need?</h2>
      <p>Get on a free strategy call. We'll tell you what your business is missing. No obligation, no pitch.</p>
    </div>
    <div class="cta-band-actions">
      <a class="btn btn-primary" href="/#talk">Book your demo ${icon('arrow')}</a>
      <a class="btn btn-outline" href="tel:${SITE.phoneTel}">Call ${SITE.phoneDisplay}</a>
    </div>
  </div>
</section>`,
};

export const build = {
  path: '/build/',
  title: 'Websites from $600',
  description: 'Compact Build: $600 one-time for a focused 1–3 page site. IronWeb Build: $1,500 setup + $100/month with managed hosting and monthly edits.',
  body: () => `${pageHead({ eyebrow: 'Websites', title: 'A website that makes the next step obvious.', lead: 'Strong design, mobile-first layouts, clear messaging and a deliberate path to inquiry. Two ways to get one: a one-time Compact Build, or a fully managed IronWeb Build.' })}

<section class="section" aria-labelledby="plans-title">
  <div class="wrap">
    <h2 id="plans-title" class="sr-only">Build pricing</h2>
    <div class="plan-grid">
      <article class="panel plan">
        ${sectionLabel('One-time')}
        <h3>${PRICES.compact.name}</h3>
        ${priceTag(PRICES.compact.amount, PRICES.compact.cadence)}
        <p>A focused one to three page site for a straightforward business. Built, finished and handed over.</p>
        ${checks(['Up to three pages', 'Mobile-friendly layout', 'Contact form and click-to-call', 'Completion and handoff'])}
        <p class="plan-note"><strong>Included with either automation bundle</strong> ($600 value, included).</p>
        <p class="plan-note"><strong>Hosting:</strong> no IronWeb monthly plan is required. You arrange your own hosting, or add optional managed hosting. Your quote spells out which.</p>
        <a class="btn btn-outline" href="${talkHref()}">${TALK_CTA}</a>
      </article>
      <article class="panel plan plan--main">
        ${sectionLabel('Managed')}
        <h3>${PRICES.build.name}</h3>
        ${priceTag(PRICES.build.amount, PRICES.build.cadence, PRICES.build.monthly)}
        <p>The standard build: a complete site, managed and kept current after launch.</p>
        ${checks(['Up to five pages', 'Professional copywriting', 'Mobile optimization', 'Forms', 'Basic SEO setup', 'Animation where it helps', 'Two consolidated revision rounds plus a final polish pass', 'Managed hosting', 'One hour of edits each month'])}
        <p class="plan-note"><strong>$1,500</strong> is a one-time setup fee. <strong>$100/month</strong> is recurring for hosting and edits.</p>
        <a class="btn btn-primary" href="${talkHref()}">${TALK_CTA} ${icon('arrow')}</a>
      </article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="terms-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('The details')}
      <h2 id="terms-title">Payment, timeline and edits.</h2>
    </div>
    <div class="facts">
      <div class="fact"><h3>Payment</h3><p>50% deposit to start, and the remaining 50% before launch.</p></div>
      <div class="fact"><h3>Timeline</h3><p>A standard build takes about one week. The clock starts once the deposit and the materials we need have arrived. Feedback delays move the timeline, and projects with custom integrations are scheduled individually.</p></div>
      <div class="fact"><h3>Monthly edits</h3><p>Managed sites include up to one hour a month of edits to existing text, photos, forms and offers. New pages, redesigns and new functionality are quoted separately.</p></div>
      <div class="fact"><h3>Hosting and ownership</h3><p>Managed hosting is the default on the IronWeb Build. Once your build is fully paid, you can move on and receive your custom site files and domain information where applicable, or ask for a handoff instead of ongoing management. Automations and funnels that run on the business platform depend on it and don't export as a standalone site.</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="addon-title">
  <div class="wrap">
    <div class="panel addon">
      <div>
        ${sectionLabel('For existing clients')}
        <h2 id="addon-title">Landing page or simple funnel</h2>
        ${priceTag(PRICES.addon.amount, PRICES.addon.cadence)}
      </div>
      <div>
        <p>For managed clients running one focused campaign. Built with your existing branding. A simple funnel can be a landing page plus a thank-you page.</p>
        ${checks(['No extra monthly fee for the add-on', 'Later edits come out of your existing monthly hour', 'Bespoke functionality and integrations are quoted separately'])}
        <p class="plan-note">Your main website already works as a funnel. You don't need an add-on to start getting inquiries.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="process-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Process')}
      <h2 id="process-title">How a build runs.</h2>
    </div>
    ${processSteps()}
  </div>
</section>

<section class="section" aria-labelledby="see-title">
  <div class="wrap">
    <div class="panel demo demo--callout">
      <div class="demo-copy">
        ${sectionLabel('Before you commit')}
        <h2 id="see-title">See it in action, then see yours.</h2>
        <p>Walk through the interactive demo to see how an IronWeb site takes a visitor from first impression to inquiry. When you're ready, get in touch: if it's a fit, Colin creates a free homepage preview for your business.</p>
        <div class="callout-actions">
          <a class="btn btn-primary" href="${demoHref()}">${DEMO_CTA} ${icon('arrow')}</a>
          <a class="btn btn-outline" href="${talkHref()}">${TALK_CTA}</a>
        </div>
      </div>
      <div>
        ${previewSteps()}
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
    ${faqList([
      { q: 'Which build is right for me?', a: 'If you need a simple site with a few pages and would rather handle hosting yourself, the Compact Build fits. If you want copywriting, more pages, managed hosting and someone to make changes each month, choose the IronWeb Build.' },
      { q: 'Is the $600 Compact Build really one-time?', a: 'Yes. There is no compulsory IronWeb monthly plan. You arrange hosting yourself or add optional managed hosting, and the quote states which.' },
      { q: 'What happens if I need more than an hour of edits in a month?', a: 'Edits beyond the monthly hour, along with new pages, redesigns and new functionality, are quoted before any work starts.' },
      { q: 'Can I leave and take my site with me?', a: 'Once your build is fully paid, yes. You receive your custom site files and domain information where applicable. Platform-dependent automations and funnels stay on the platform.' },
      { q: 'Do you write the copy?', a: 'Professional copywriting is included in the IronWeb Build. For a Compact Build, we work from the content you provide.' },
      ...PREVIEW_FAQ,
    ])}
  </div>
</section>

${ctaBand()}`,
};

export const growth = {
  path: '/growth/',
  title: 'Growth: Content and Paid Ads',
  description: 'IronWeb Growth: three original posts a week, adapted to your channels, with captions, scheduling and approval for $597/month. Paid ads from $750/month plus ad spend.',
  body: () => `${pageHead({ eyebrow: 'Growth', title: 'Stay visible without writing every post yourself.', lead: 'A steady content plan for your social channels and Google Business Profile, plus paid ad management when you want to push harder.' })}

<section class="section" aria-labelledby="growth-title">
  <div class="wrap">
    <div class="plan-grid">
      <article class="panel plan plan--main">
        ${sectionLabel('Content plan')}
        <h3 id="growth-title">${PRICES.growth.name}</h3>
        ${priceTag('$597', 'per month')}
        <p>Three original posts a week in total, each adapted to the channels we agree on. That's three posts across your platforms, not three per platform.</p>
        ${checks(['Three original posts per week', 'Adapted for agreed channels, including social and Google Business Profile', 'Captions written for you', 'Scheduling handled', 'Nothing goes out without your approval'])}
        <a class="btn btn-primary" href="${bookHref()}">Book a Call ${icon('arrow')}</a>
      </article>
      <article class="panel plan">
        ${sectionLabel('Paid ads')}
        <h3>Ad management</h3>
        <div class="price-rows">
          <div><p class="price-row-name">One platform</p>${priceTag('$750', 'per month')}<p class="price-sub">plus ad spend</p></div>
          <div><p class="price-row-name">Expanded scope</p>${priceTag('From $1,000', 'per month')}<p class="price-sub">plus ad spend</p></div>
        </div>
        <p>Campaign management, optimization and monthly reporting on the platform we agree on. Multiple platforms or more complex campaigns are scoped by proposal. Campaign and creative scope is defined in your proposal.</p>
        <p class="plan-note">Ad spend is paid separately, directly to the ad platform. It is not included in the management fee.</p>
        <a class="btn btn-outline" href="${bookHref()}">Book a Call</a>
      </article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('How it works')}
      <h2 id="how-title">Your work, turned into posts.</h2>
    </div>
    <ol class="steps steps--3">
      <li class="step"><span class="step-n" aria-hidden="true">01</span><h3>Send what you have</h3><p>Job photos, short clips, listings, news. Assets can be supplied by you, and we'll tell you what works best.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">02</span><h3>Review and approve</h3><p>We write the posts and captions and send them to you. Nothing is published until you approve it.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">03</span><h3>Scheduled and posted</h3><p>Approved posts are adapted to each agreed channel and scheduled, three a week.</p></li>
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="scope-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Scope')}
      <h2 id="scope-title">What's included, and what's quoted separately.</h2>
    </div>
    <div class="facts">
      <div class="fact"><h3>On-site photo and video</h3><p>On-site sessions shot on iPhone can be arranged and are custom quoted, including travel. On-site work is quoted across New England.</p></div>
      <div class="fact"><h3>AI-generated video</h3><p>Available to discuss and scoped separately. It isn't part of the monthly plan.</p></div>
      <div class="fact"><h3>Comments and messages</h3><p>Replying to comments and DMs by hand isn't included. Automated comment and message handling can be scoped as an <a href="/automations/">automation</a>, depending on what your platforms support.</p></div>
      <div class="fact"><h3>Results</h3><p>Growth buys consistent, approved content and clear reporting on ads. It doesn't guarantee a number of leads, followers or rankings.</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('FAQ')}
      <h2 id="faq-title">Growth questions.</h2>
    </div>
    ${faqList([
      { q: 'Is Growth included with a website build?', a: 'No. Websites, Growth and automations are separate services. You can take Growth on its own or alongside a website.' },
      { q: 'Do I need to supply photos?', a: 'It helps. Your own job photos and clips usually make the strongest posts. On-site iPhone sessions can be custom quoted if you need them.' },
      { q: 'Which channels do you post to?', a: 'The channels we agree on together, which can include your social profiles and Google Business Profile. Each week\'s three posts are adapted to fit each one.' },
      { q: 'Is ad spend included in the ad management fee?', a: 'No. Ad spend is paid directly to the ad platform, separate from the monthly management fee.' },
    ])}
  </div>
</section>

${ctaBand({ title: 'Talk through a content plan.', text: 'Book a call, or send a short note and Colin will follow up personally.', primary: 'book' })}`,
};

export const automations = {
  path: '/automations/',
  title: 'Automations from $97/month',
  description: 'Practical automations for missed calls, follow-up, review requests and appointment admin. Start with one from $97/month and add more as your business grows.',
  body: () => `${pageHead({ eyebrow: 'Automations', title: 'Start small. Grow big.', lead: `No bloated packages. No paying for tools you don't need. Each stage is $97/month with no setup fee. Start where you are and add as you grow.` })}

<section class="section" aria-labelledby="closer-title">
  <div class="wrap ops-grid">
    <div>
      <div class="section-head">
        ${sectionLabel('Why automate')}
        <h2 id="closer-title">Your best closer shouldn't be buried in busywork.</h2>
        <p>Every hour spent chasing callbacks, sending reminders and asking for reviews is an hour not spent selling. Pick the automation that fixes your biggest leak first, then add more when it's worth it.</p>
      </div>
    </div>
    <figure class="phone-mock" aria-label="Illustrative example of a missed-call text-back conversation">
      <div class="phone">
        <p class="phone-head">Missed call, 2:14 PM</p>
        <p class="bubble bubble--out">Hi, sorry we missed your call. We're on a job right now. What can we help you with?</p>
        <p class="bubble bubble--in">Looking for a quote on a new driveway.</p>
        <p class="bubble bubble--out">Thanks! We'll call you back today. What's the best time to reach you?</p>
      </div>
      <figcaption>Illustrative example only. Not a real client conversation.</figcaption>
    </figure>
  </div>
</section>

<section class="section" id="menu" aria-labelledby="menu-title">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('The menu')}
      <h2 id="menu-title">Choose what you need.</h2>
      <p>These are the building blocks behind the three stages. Each stage is $97/month with no setup fee; your quote lists exactly what's included and expected usage before anything is switched on.</p>
    </div>
    <div class="auto-menu">
      ${AUTOMATIONS.map((a) => `<article class="panel auto-item" id="${a.key}">
        <p class="status status--${a.status}">${statusLabel[a.status]}</p>
        <h3>${esc(a.name)}</h3>
        <dl>
          <dt>The problem</dt><dd>${esc(a.problem)}</dd>
          <dt>What it does</dt><dd>${esc(a.does)}</dd>
        </dl>
        <a class="text-link" href="/contact/?interest=${a.key}#inquiry">${a.status === 'ready' ? 'Ask about this automation' : 'Ask about scoping this'} ${icon('arrow')}<span class="sr-only">: ${esc(a.name)}</span></a>
      </article>`).join('\n      ')}
    </div>
    <div class="usage-note" role="note">
      <h3>What to expect on cost</h3>
      <p>Text messages, phone calls, email sending and AI usage are billed separately from the automation price, based on what your account actually uses. We'll go through expected usage before you start. There are no unlimited allowances.</p>
      <p>Automations run on the business platform and depend on it. They don't export as a standalone website.</p>
    </div>
    <p class="menu-bundles">Need several? <a class="text-link" href="/automations/bundles/">Compare bundles ${icon('arrow')}</a></p>
  </div>
</section>

<section class="section" id="future" aria-labelledby="agentic-title">
  <div class="wrap">
    <div class="panel agentic agentic--quiet">
      <div>
        <p class="tag-dev">In development</p>
        <h2 id="agentic-title" class="h-sub">Further out: AIISA and an AI agent team.</h2>
        <p>We're developing AIISA, an AI inside sales assistant, alongside a wider team of AI agents for routine admin. They aren't available yet: no pricing, no checkout and no launch date.</p>
        <p>If you'd like to hear when there's something real to show, register your interest.</p>
      </div>
      <div>
        ${agenticForm('agentic')}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('FAQ')}
      <h2 id="faq-title">Automation questions.</h2>
    </div>
    ${faqList([
      { q: 'Do I need an IronWeb website to use automations?', a: 'No. Automations are a separate service. They work alongside your existing site, and we\'ll confirm how your forms and phone number connect before anything is set up.' },
      { q: 'What does "Scoped on request" mean?', a: 'It\'s something we can set up for your business, but it isn\'t a standard, fixed item yet. We\'ll look at how you work today and quote it before anything is built.' },
      { q: 'What does usage cost?', a: 'It depends on how many messages, calls, emails and AI actions your account uses. Usage is billed separately, and we\'ll talk through expected volume before you start.' },
      { q: 'Will texts go out without permission?', a: 'Text follow-up only goes to people who have given permission, and anyone can reply STOP to opt out.' },
      { q: 'Can I start with one and add more later?', a: 'Yes. That\'s the point. Start with the automation that solves your biggest problem, then add more or move to a bundle as your business grows.' },
    ])}
  </div>
</section>

${ctaBand({ title: 'Talk through your biggest time sink.', text: 'Book a call, or send a short note about what\'s slipping and Colin will follow up personally.', primary: 'book' })}`,
};

export const bundles = {
  path: '/automations/bundles/',
  title: 'Automation Bundles',
  description: 'IronWeb automation bundles: Contractor Bundle $297/month and Real Estate Bundle $397/month. $497 setup, waived with 6 months prepaid. Website included.',
  body: () => `${pageHead({ eyebrow: 'Bundles', title: 'Want it all? Take the bundle.', lead: 'The express option: every stage your industry needs, set up together, with your website included. $497 setup on bundles only, waived with 6 months prepaid.' })}

<section class="section" aria-labelledby="bundle-title">
  <div class="wrap">
    <h2 id="bundle-title" class="sr-only">Bundle pricing</h2>
    ${bundleCards()}
    <div class="usage-note" role="note">
      <h3>Usage is billed separately</h3>
      <p>Text messages, phone calls, email sending and AI usage are billed separately from the bundle, based on what your account actually uses. We'll go through expected usage with you before you start. There are no unlimited allowances.</p>
    </div>
    <p class="menu-bundles">Not ready for everything? <a class="text-link" href="/#automation">Start with one $97/month stage ${icon('arrow')}</a></p>
  </div>
</section>

<section class="section" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="section-head">
      ${sectionLabel('FAQ')}
      <h2 id="faq-title">Bundle questions.</h2>
    </div>
    ${faqList([
      { q: 'Should I start with a bundle or a single stage?', a: 'Start with whatever solves your biggest problem. A single stage is $97/month with no setup fee. A bundle makes sense when you want everything running at once.' },
      { q: 'Is a website included?', a: 'Yes. Either bundle includes a website, a $600 value, at no extra charge.' },
      { q: 'How does the setup fee work?', a: 'Bundles have a one-time $497 setup fee. It\'s waived if you prepay 6 months. Individual $97/month stages never have a setup fee.' },
    ])}
  </div>
</section>

${ctaBand({ title: 'Talk through a bundle.', text: 'Book a call, or send a short note and Colin will follow up personally.', primary: 'book' })}`,
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

${ctaBand({ title: 'Want one like these?', text: 'Send a few details and Colin will follow up personally. If it\'s a fit, you\'ll see a free homepage preview before you commit.' })}`,
};

export const about = {
  path: '/about/',
  title: 'About',
  description: 'IronWeb Digital is run by Colin Sullivan in Swansea, Massachusetts: high-quality business websites and practical automations, shaped by construction and inside-sales experience.',
  jsonld: [ORG],
  body: () => `${pageHead({ eyebrow: 'About', title: 'Practical work, from someone who has done the job.', lead: 'IronWeb Digital is run by Colin Sullivan in Swansea, Massachusetts.' })}

<section class="section">
  <div class="wrap founder-grid">
    <div>
      ${sectionLabel('The story')}
      <h2>Why IronWeb exists.</h2>
    </div>
    <div class="founder-text">
      <p>With experience in construction, sitework, and inside sales, Colin understands both delivering the work and following up with the next customer.</p>
      <p>On a job, answering calls, returning messages and keeping some kind of presence online all compete with the work itself. In sales, a quick reply and steady follow-up are often what keep an inquiry from going cold.</p>
      <p>IronWeb Digital helps business owners and salespeople spend more time selling and less time on monotonous admin. It starts with a website that tells a customer clearly what you do and how to reach you. When you're ready, practical automations can take the repetitive follow-up off your plate.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Approach')}
      <h2>How we work.</h2>
    </div>
    <div class="facts">
      <div class="fact"><h3>Published prices</h3><p>Every service has a clear price on its page, and the difference between one-time and monthly costs is spelled out.</p></div>
      <div class="fact"><h3>Honest scope</h3><p>You'll know what's included, what's quoted separately, and what we can't promise. No guaranteed lead counts or rankings.</p></div>
      <div class="fact"><h3>You talk to Colin</h3><p>Discovery, quotes and follow-up come from the person doing the work.</p></div>
      <div class="fact"><h3>Where we work</h3><p>Based in Swansea, Massachusetts. Digital services for small businesses nationwide; on-site content work quoted across New England.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      ${sectionLabel('Who we help')}
      <h2>Built for contractors and real estate. Open to others.</h2>
      <p>Most of our work is for contractors, home services and real estate. We also take on restaurants, bands and other creative projects. If you're not sure you fit, ask.</p>
    </div>
  </div>
</section>

${ctaBand()}`,
};

export const contact = {
  path: '/contact/',
  title: 'Contact',
  description: 'Talk to IronWeb Digital about your website: send a few details, book a call, or ask about automations. Call (774) 486-7776 or email colin@ironwebdigital.com.',
  scripts: [],
  body: () => `${pageHead({ eyebrow: 'Contact', title: 'Let\'s talk about your website.', lead: 'Send a few details, book a call, or ask about automations. Either way, Colin follows up personally.' })}

${talkSection({ id: 'talk-contact', onHome: false, detailsOpen: true })}

<section class="section" id="book" aria-labelledby="book-title">
  <div class="wrap contact-grid">
    <div class="contact-intro">
      ${sectionLabel('Prefer to talk?')}
      <h2 id="book-title" class="h-sub">Book a call.</h2>
      <p>A short conversation about what you do, who your customers are, and what you need. It's optional: you don't need a call to get started.</p>
      ${contactLines()}
    </div>
    <div class="panel">
      ${bookingBlock()}
    </div>
  </div>
</section>

<section class="section" id="questions" aria-labelledby="inquiry-h">
  <div class="wrap narrow">
    <div class="panel form-panel">
      ${inquiryForm('inquiry', { heading: 'Questions about automations or anything else', detailsOpen: true })}
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
  body: () => legalWrap('Privacy Policy', 'October 7, 2026', `
<h2>Who runs this site</h2>
<p>This website is operated by ${SITE.legalName}, doing business as IronWeb Digital, Swansea, Massachusetts. Contact: <a href="mailto:${SITE.email}">${SITE.email}</a>, <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a>.</p>
<h2>What we collect</h2>
<p>When you submit a form, we collect what you enter: your name and email address, and any optional details you choose to provide, such as phone number, business name, business type, current website, the service you're interested in, timeline, budget and message. We also record the page you submitted from, how you arrived (for example a referring site or campaign tags in the link), and the time of submission. If you book a call, the booking system collects the details you enter there.</p>
<h2>How we use it</h2>
<p>We use your information to respond to your inquiry, prepare a homepage preview or quote you requested, schedule calls, and follow up about the services you asked about. Submissions are sent securely to our customer management system, which we use to keep track of inquiries and send follow-up messages.</p>
<h2>Text messages</h2>
<p>If you tick the optional text message box, you agree to receive marketing and informational text messages from ${SITE.legalName} (IronWeb Digital) about your inquiry and scheduling. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time, or HELP for help. We record the consent wording you agreed to and when.</p>
<p><strong>We don't sell or share your mobile number or text message consent with third parties or affiliates for their marketing purposes.</strong></p>
<h2>Cookies and browser storage</h2>
<p>This site doesn't use advertising cookies. It keeps campaign tags from the link you arrived on (such as utm_source) in your browser's session storage so they can be included with a form submission; this clears when you close the tab. Fonts are loaded from Google Fonts, which receives your IP address when serving them. If the booking calendar is embedded, its provider may set its own cookies.</p>
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

// ---------- Contractor Core interactive demo (2026-10-27) ----------
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
  path: '/contractor-demo/',
  title: 'Contractor Core Interactive Demo',
  description: 'Try the Contractor Core system yourself: submit an estimate request to a demo home-service business and see the follow-up, the AI receptionist and the pipeline a contractor sees.',
  scripts: ['/assets/js/contractor-demo.js'],
  body: () => `<section class="page-head cd-hero" aria-labelledby="cd-title">
  <div class="page-head-art" aria-hidden="true"></div>
  <div class="wrap">
    <p class="cd-chip"><span class="cd-chip-dot" aria-hidden="true"></span>Interactive demo · Powered by IronWeb</p>
    <h1 id="cd-title">Your Next Customer Is Calling. Is Your Business Ready?</h1>
    <p class="lead">Experience the system that captures inquiries, follows up with customers, and keeps your jobs organized, even when you're busy working.</p>
    <div class="hero-actions cd-hero-actions">
      <a class="btn btn-primary" href="#experience" data-cd-start>Try the Live Demo ${icon('arrow')}</a>
      <a class="btn btn-outline" href="#how">See How It Works</a>
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
      <li class="step"><span class="step-n" aria-hidden="true">01</span><h3>Be the Customer</h3><p>Submit a realistic estimate request to a demo home-service business.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">02</span><h3>Experience the Response</h3><p>See the follow-up and try the AI receptionist.</p></li>
      <li class="step"><span class="step-n" aria-hidden="true">03</span><h3>See Behind the Scenes</h3><p>Explore the pipeline and how the system keeps every job organized.</p></li>
    </ol>
  </div>
</section>

<section class="section cd-exp" id="experience" aria-labelledby="exp-title" data-cd data-step="1">
  <div class="wrap">
    <h2 id="exp-title" class="sr-only">Interactive demo</h2>
    <div class="cd-bar">
      <ol class="cd-progress" aria-label="Demo progress">
        <li><button type="button" data-goto="1" aria-current="step"><span class="cd-n">01</span><span class="cd-t">Be the Customer</span></button></li>
        <li><button type="button" data-goto="2" disabled><span class="cd-n">02</span><span class="cd-t">Experience the Response</span></button></li>
        <li><button type="button" data-goto="3" disabled><span class="cd-n">03</span><span class="cd-t">See Behind the Scenes</span></button></li>
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
        <h3 id="cd-s2-h" class="cd-h" tabindex="-1">Your Request Has Been Received.</h3>
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
          <h4 id="cd-recep-h">What Happens When You're Too Busy to Answer?</h4>
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
        <h3 id="cd-s3-h" class="cd-h" tabindex="-1">Here's What the Business Owner Sees.</h3>
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
        <h4>One System. From First Inquiry to Finished Job.</h4>
        <ul class="cd-caps">
          ${CD_CAPS.map(([ic, h, p]) => `<li><span class="offer-ic">${icon(ic)}</span><div><strong>${h}</strong><p>${p}</p></div></li>`).join('\n          ')}
        </ul>
        <p class="cd-pipe-note">These are capabilities of the Contractor Core system, not a list of everything that ran during this short demo.</p>
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
      <h2 id="cd-conv-title">Imagine This Running for Your Business.</h2>
      <p>Your website captures the inquiry. Your system follows up. Your pipeline keeps everything organized. You focus on getting the job done.</p>
    </div>
    <div class="cta-band-actions">
      <a class="btn btn-primary" href="${bookHref()}" data-cd-book>Book Your IronWeb Consultation ${icon('arrow')}</a>
      <a class="btn btn-outline" href="/services/">Explore IronWeb Services</a>
    </div>
  </div>
</section>`,
};

export const PAGES = [home, services, build, automations, bundles, growth, contractorDemo, work, about, contact, privacy, terms, notFound];
