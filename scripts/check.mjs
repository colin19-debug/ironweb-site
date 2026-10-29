// Browser checks against the local server. v3 (2026-10-28): docs/IRONWEB-V3-SPEC.md.
// Run: PORT=3007 node serve.mjs, then BASE=http://localhost:3007 node scripts/check.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PRODUCTS } from '../src/data.mjs';

const BASE = process.env.BASE || 'http://localhost:3001';
const chromeRoot = path.join(os.homedir(), '.cache/puppeteer/chrome');
const executablePath = path.join(chromeRoot, fs.readdirSync(chromeRoot).sort().reverse()[0], 'chrome-win64/chrome.exe');
const PAGES = ['/', '/build/', '/grow/', '/operate/', '/demo/', '/portfolio/', '/about/', '/contact/', '/privacy/', '/terms/'];
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); else console.log('ok', msg); };

const browser = await puppeteer.launch({ executablePath, headless: 'new' });
const consoleErrors = [];
// Fresh tab helper: smooth-scroll-safe clicks + console error capture on every tab.
async function freshPage() {
  const pg = await browser.newPage();
  const clickRaw = pg.click.bind(pg);
  // The site scrolls smoothly; jump click targets into view first so coordinate clicks don't land mid-scroll.
  pg.click = async (sel, opts) => {
    await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })).catch(() => {});
    return clickRaw(sel, opts);
  };
  pg.on('pageerror', (e) => consoleErrors.push(`${pg.url()}: ${e.message}`));
  pg.on('console', (m) => { if (m.type() === 'error' && !/api\/lead/.test(m.text()) && !/50[23]|Service Unavailable|Bad Gateway/.test(m.text()) && !/leadconnector/i.test(m.location()?.url || '')) consoleErrors.push(`${pg.url()}: ${m.text()}`); });
  return pg;
}
let page = await freshPage();

// ---------- every page, every width ----------
const links = new Set();
const texts = {};
for (const w of [1440, 768, 390, 320]) {
  await page.setViewport({ width: w, height: 900 });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map((i) => i.src),
      hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      text: document.body.innerText,
      header: document.querySelector('.btn-cta') && { text: document.querySelector('.btn-cta').textContent.trim(), href: document.querySelector('.btn-cta').getAttribute('href') },
    }));
    ok(r.overflow <= 0, `${p} @${w}: no horizontal overflow (${r.overflow})`);
    if (w === 1440) {
      texts[p] = r.text;
      ok(r.h1 === 1, `${p}: exactly one h1`);
      ok(!/GHL|GoHighLevel|HighLevel|LeadConnector|Kling|Claude|Netlify/i.test(r.text), `${p}: no private vendor names in copy`);
      ok(!/—/.test(r.text), `${p}: no em dashes`);
      ok(!/guarantee/i.test(r.text.replace(/(can't|can|cannot) guarantee|no guaranteed|guarantee leads\?|No one honest can/gi, '')), `${p}: no guarantee claims`);
      ok(!/real estate|realtor|Real Estate Bundle|Contractor Bundle|White Glove|\$1,500|\$497|\$397|\$750|\$900|AIISA|content shoot|camera/i.test(r.text), `${p}: no removed offers, audiences or hidden packages`);
      ok(!/\[[A-Z][A-Z ]+[^\]]*\]/.test(r.text), `${p}: no bracketed placeholders`);
      ok(r.brokenImgs.length === 0, `${p}: images load`);
      ok(r.header && r.header.text === '(774) 486-7776' && r.header.href === 'tel:+17744867776', `${p}: header call button`);
      r.hrefs.forEach((h) => links.add(h));
    }
  }
}

// ---------- links, redirects, domains ----------
for (const h of links) {
  if (h.startsWith('tel:')) { ok(h === 'tel:+17744867776', `tel link ${h}`); continue; }
  if (h.startsWith('mailto:')) { ok(h === 'mailto:colin@ironwebdigital.com', `mailto link ${h}`); continue; }
  ok(!h.startsWith('sms:'), `no sms: links (${h})`);
  if (/^https?:/.test(h)) continue;
  if (h.startsWith('#')) continue;
  const res = await fetch(BASE + h.split('#')[0], { redirect: 'manual' });
  ok(res.status === 200, `internal link ${h} → ${res.status}`);
  ok(!/^\/(services|automations|growth|contractor-demo)\b/.test(h), `no links to removed pages (${h})`);
}
ok(!links.has('https://homes-by-heroux.netlify.app/') && links.has('https://homesbyheroux.com/'), 'Homes by Heroux links to homesbyheroux.com, not the staging link');
for (const ext of ['https://tmrconstructioncorp.com/', 'https://allphazepropertysolutions.com/', 'https://homesbyheroux.com/', 'https://oceangroovetheband.com/']) {
  try { const r = await fetch(ext, { redirect: 'follow' }); ok(r.ok, `external ${ext} → ${r.status}`); } catch (e) { fails.push(`external ${ext}: ${e.message}`); }
}
for (const [from, to] of [['/services/', '/'], ['/services/web-design/', '/'], ['/automations/', '/operate/'], ['/automations/bundles/', '/operate/'], ['/growth/', '/grow/'], ['/contractor-demo/', '/demo/'], ['/pricing/', '/'], ['/work/', '/portfolio/']]) {
  const r = await fetch(BASE + from, { redirect: 'manual' });
  ok(r.status === 301 && r.headers.get('location') === to, `redirect ${from} → ${to} (${r.status} ${r.headers.get('location')})`);
}
for (const p of ['/operate/', '/grow/', '/demo/']) ok((await fetch(BASE + p, { redirect: 'manual' })).status === 200, `${p} is a real page, not a redirect`);

// ---------- prices exactly as published ----------
ok(PRODUCTS.map((p) => `${p.name} ${p.price}`).join('|') === 'IW Build $97|IW Grow $597|IW Operate $297', 'data: three products only');
ok(/\$600\s*one-time/.test(texts['/build/']) && /\$97\/month/.test(texts['/build/']), 'Build: $600 one-time + $97/month');
ok(/\$597/.test(texts['/grow/']) && /ad spend/i.test(texts['/grow/']) && /not part of the \$597/i.test(texts['/grow/']), 'Grow: $597/month + ad spend, spend excluded');
ok(/\$297/.test(texts['/operate/']) && /Pricing on request/i.test(texts['/operate/']) && !/Managed Operate[^.]*\$\d/.test(texts['/operate/']), 'Operate: $297/month, managed on request with no price');
ok(['$97', '$600', '$597', '$297'].every((p) => texts['/'].includes(p)), 'home shows the three products with prices');

// ---------- navigation ----------
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
ok((await page.$$eval('.nav-list > li', (li) => li.map((l) => (l.querySelector('a, button').textContent.trim())))).join('|') === 'Home|Portfolio|Services|Demo|About|Contact', 'menu: Home, Portfolio, Services, Demo, About, Contact');
await page.focus('.menu-toggle');
await page.keyboard.press('Enter');
ok(await page.$eval('.menu-toggle', (b) => b.getAttribute('aria-expanded')) === 'true', 'Services menu opens with Enter');
ok((await page.$$eval('#services-menu a', (as) => as.map((a) => a.getAttribute('href')))).join('|') === '/build/|/grow/|/operate/', 'Services menu: IW Build, IW Grow, IW Operate');
await page.keyboard.press('Escape');
ok(await page.$eval('.menu-toggle', (b) => b.getAttribute('aria-expanded')) === 'false', 'Services menu closes with Escape');

// ---------- home ----------
const hero = await page.evaluate(() => ({
  h1: document.querySelector('.hero-title').textContent.replace(/\s+/g, ' ').trim(),
  text: document.querySelector('.hero').innerText,
  btns: [...document.querySelectorAll('.hero-actions .btn')].map((b) => [b.textContent.trim(), b.getAttribute('href'), b.className]),
  title: document.title,
  ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)),
}));
ok(hero.h1 === 'Systems That Stick.' && /Never miss another opportunity\./.test(hero.text), 'hero: "Systems That Stick." + kicker');
ok(!/receptionist/i.test(hero.text) && /free audit/i.test(hero.text), 'hero sells the free audit, not the receptionist');
ok(hero.btns.length === 2 && hero.btns[0][0] === 'Request your free audit' && hero.btns[0][1] === '/contact/#audit' && /btn-primary/.test(hero.btns[0][2])
  && hero.btns[1][0] === 'See how the system works' && hero.btns[1][1] === '/demo/' && /btn-outline/.test(hero.btns[1][2]), 'hero: red audit CTA + quieter demo CTA');
ok(await page.$('.hero-video') !== null, 'animated video hero kept');
ok(/Systems That Stick\./.test(await page.$eval('.site-footer', (f) => f.textContent)), 'footer tagline');
ok(hero.ld.some((j) => j['@type'] === 'ProfessionalService') && hero.ld.some((j) => j['@type'] === 'FAQPage'), 'home schema: business + FAQ');
const order = await page.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => s.id || s.className));
ok(JSON.stringify(order) === JSON.stringify(['hero', 'free-audit', 'services', 'demo', 'process', 'work', 'faq', 'section cta-band']), `home order: ${order.join(' > ')}`);
ok(await page.$$eval('#demo a.btn', (a) => a.every((x) => x.getAttribute('href') === '/demo/')), 'home demo teaser links to /demo/');
ok(!(await page.$('#testimonials')), 'no testimonials block until real quotes exist');
ok(!(await page.$('form[data-lead-form]')), 'home has no form (one path: the audit on Contact)');
ok(!/Ocean Groove/.test(texts['/']) && /Homes by Heroux/.test(texts['/']), 'home shows contractor sites only');
const assets = await page.$$eval('link[rel=stylesheet][href^="/assets"], script[src^="/assets"]', (els) => els.map((e) => e.getAttribute('href') || e.getAttribute('src')));
ok(assets.length >= 2 && assets.every((u) => /\?v=[a-f0-9]{10}$/.test(u)), 'CSS/JS URLs are content-hashed');
// every section: at most one red primary button
for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
  const multi = await page.$$eval('main section', (ss) => ss.filter((s) => [...s.querySelectorAll('.btn-primary')].filter((b) => !b.closest('section section') || b.closest('section') === s).filter((b) => b.closest('section') === s && !b.closest('form, .dx-site')).length > 1).map((s) => s.id || s.className));
  ok(multi.length === 0, `${p}: one primary action per section (${multi.join(', ')})`);
}
await page.$eval('body', () => document.querySelector('#work')?.scrollIntoView());
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.$eval('#work', (s) => s.scrollIntoView());
await page.waitForFunction(() => [...document.querySelectorAll('#work img')].every((i) => i.complete && i.naturalWidth > 0), { timeout: 8000 }).catch(() => {});
ok(await page.$$eval('#work img', (is) => is.length === 3 && is.every((i) => i.naturalWidth > 0)), 'contractor site previews load on scroll');

// hero audit CTA lands on the Contact form
await page.click('.hero-actions .btn-primary');
await page.waitForFunction(() => location.pathname === '/contact/' && document.readyState === 'complete', { timeout: 15000 });
await page.waitForFunction(() => { const t = document.getElementById('audit').getBoundingClientRect().top; return t >= -2 && t <= 80; }, { timeout: 6000 }).catch(() => {});
ok(await page.evaluate(() => { const t = document.getElementById('audit').getBoundingClientRect().top; return location.hash === '#audit' && t >= -2 && t <= 80; }), 'hero "Request your free audit" lands on the Contact audit form');

// ---------- portfolio ----------
await page.goto(BASE + '/portfolio/', { waitUntil: 'networkidle0' });
ok((await page.$$eval('.work-card h3', (h) => h.map((x) => x.textContent))).join('|') === 'TMR Construction|All Phaze Property Solutions|Homes by Heroux|Ocean Groove', 'Portfolio: four sites incl. Ocean Groove');

// ---------- Build: website demo + homepage preview ----------
await page.goto(BASE + '/build/', { waitUntil: 'networkidle0' });
const bt = await page.evaluate(() => document.body.innerText);
ok(/Picture this for your business\./.test(bt) && /Your customers see your website first, make it easy for them to choose you\./.test(bt), 'Build: moved demo copy');
ok(await page.$eval('.dx-after .btn-primary', (a) => a.getAttribute('href') === '#preview' && /homepage preview/i.test(a.textContent)) && await page.$eval('.dx-after .btn-outline', (a) => a.getAttribute('href') === '/portfolio/' && /See real client sites/.test(a.textContent)), 'Build demo CTAs: homepage preview (red) + real client sites');
ok(await page.$eval('#preview form', (f) => f.dataset.leadForm) === 'preview', 'Build: homepage preview form (intent preview → needs-demo)');
const dx = () => page.evaluate(() => {
  const panel = document.querySelector('.dx-site:not([hidden])');
  return { industry: panel.dataset.industry, url: document.querySelector('.dx-url').textContent, step: document.querySelector('[data-step][aria-current="step"]').dataset.step, tab: document.querySelector('[role=tab][aria-selected="true"]').textContent };
});
ok((await dx()).tab === 'Roofing', 'website demo starts on Roofing');
ok((await page.$$eval('[role=tab]', (t) => t.map((x) => x.textContent))).join('|') === 'Roofing|Landscaping|Painting', 'website demo: trades only');
await page.focus('#dx-tab-trades');
await page.keyboard.press('ArrowRight');
const s1 = await dx();
ok(s1.tab === 'Landscaping' && s1.url === 'examplelandscape.co' && await page.evaluate(() => document.activeElement.id) === 'dx-tab-realestate', 'ArrowRight switches trade; focus follows');
await page.keyboard.press('End');
ok((await dx()).tab === 'Painting', 'End selects last trade');
let netCalls = 0;
const countNet = (req) => { if (req.url().includes('/api/')) netCalls++; };
page.on('request', countNet);
await page.type('.dx-site:not([hidden]) .m-form input', 'Jordan');
await page.click('.dx-site:not([hidden]) .m-form [type=submit]');
await new Promise((r) => setTimeout(r, 900));
ok(await page.$eval('.dx-site:not([hidden]) .m-sent', (e) => !e.hidden), 'website demo inquiry is simulated');
page.off('request', countNet);
ok(netCalls === 0, 'website demo makes no network requests');

// ---------- forms: audit (Contact) ----------
await page.close();
page = await freshPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/contact/', { waitUntil: 'networkidle0' });
ok(!/being connected|not live yet/i.test(await page.evaluate(() => document.body.innerText)), 'Contact: no "booking is being connected" language');
ok(await page.$eval('#book iframe', (f) => f.src === 'https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo'), 'Contact: live booking calendar embedded');
ok(await page.$$eval('form[data-lead-form]', (f) => f.map((x) => x.dataset.leadForm).join()) === 'audit', 'Contact: one form, the audit intake');
const req = await page.$$eval('#audit-form [required]', (els) => els.map((e) => e.name).sort().join(','));
ok(req === 'businessName,email,name,phone', `audit required fields: ${req}`);
ok(await page.$eval('#audit-form-sms', (c) => !c.required && !c.checked), 'audit SMS consent optional and unchecked');
ok(/Ironweb Digital Growth \(IronWeb Digital\)/.test(await page.$eval('label[for="audit-form-sms"]', (l) => l.textContent)), 'consent names the legal sender');
await page.click('#audit-form [type=submit]');
const errs = await page.$$eval('#audit-form [aria-invalid="true"]', (els) => els.map((e) => e.name));
ok(['name', 'businessName', 'phone', 'email'].every((n) => errs.includes(n)), `empty submit flags ${errs.join(', ')}`);
ok(await page.evaluate(() => document.activeElement.id) === 'audit-form-name', 'focus moves to first invalid field');
await page.type('#audit-form-name', 'Test Person');
await page.type('#audit-form-biz', 'Test Painting');
await page.type('#audit-form-phone', '508 555 0123');
await page.type('#audit-form-email', 'colin19sullivan+test@gmail.com');
await page.select('#audit-form-trade', 'Painting');
await page.type('#audit-form-town', 'Swansea');
await page.setRequestInterception(true);
let posts = [];
let mode = 'fail';
const onReq = (r) => {
  if (r.url().endsWith('/api/lead')) {
    posts.push(JSON.parse(r.postData()));
    const body = mode === 'ok' ? { ok: true } : { ok: false, code: 'crm_failed' };
    setTimeout(() => r.respond({ status: mode === 'ok' ? 200 : 502, contentType: 'application/json', body: JSON.stringify(body) }), 400);
  } else r.continue();
};
page.on('request', onReq);
await new Promise((r) => setTimeout(r, 2600));
await page.click('#audit-form [type=submit]');
await page.click('#audit-form [type=submit]').catch(() => {});
await page.waitForFunction(() => document.querySelector('#audit-form .form-status')?.textContent.length > 0);
ok(posts.length === 1, `duplicate submit prevented (${posts.length} request)`);
const pl = posts[0];
ok(pl.intent === 'audit' && pl.name === 'Test Person' && pl.phone === '+15085550123' && pl.answers.businessName === 'Test Painting' && pl.answers.trade === 'Painting' && pl.answers.town === 'Swansea', 'audit payload: intent, contact, business, trade, town');
ok(pl.consent.agreed === false && pl.attribution.landing && pl.pageUrl, 'audit payload: no consent unless ticked; attribution + page');
ok(/didn't go through/.test(await page.$eval('#audit-form .form-status', (s) => s.textContent)) && !(await page.$('.form-success')), 'CRM failure → inline error, no success');
mode = 'ok';
await page.click('#audit-form [type=submit]');
await page.waitForSelector('.form-success', { timeout: 5000 });
ok(/Your audit request is in\./.test(await page.$eval('.form-success', (s) => s.innerText)), 'success only after backend acceptance');
page.off('request', onReq);
await page.setRequestInterception(false);

// stub mode (local server has no CRM): honest "Nothing was sent"
await page.goto(BASE + '/build/', { waitUntil: 'networkidle0' });
await page.type('#preview-form-name', 'Test Person');
await page.type('#preview-form-email', 'colin19sullivan+test@gmail.com');
await page.click('#preview-form-sms');
await page.click('#preview-form [type=submit]');
ok(/mobile number/i.test(await page.$eval('#preview-form', (f) => f.querySelector('#preview-form-phone').closest('.field').innerText)), 'SMS consent without phone is flagged');
await page.click('#preview-form-sms');
await new Promise((r) => setTimeout(r, 2600));
await page.click('#preview-form [type=submit]');
await page.waitForFunction(() => document.querySelector('#preview-form .form-status')?.textContent.length > 0, { timeout: 8000 });
ok(/Nothing was sent/.test(await page.$eval('#preview-form .form-status', (s) => s.textContent)) && !(await page.$('.form-success')), 'stub mode: "Nothing was sent", no success');

// ---------- Operate / Grow / About ----------
await page.goto(BASE + '/operate/', { waitUntil: 'networkidle0' });
ok((await page.$$('.auto-item')).length === 5 && await page.$$eval('.auto-item', (els) => els.every((e) => [...e.querySelectorAll('dt')].map((d) => d.textContent).join('|') === 'The problem|What it does')), 'Operate: five building blocks, problem + what it does');
ok(/AI receptionist/.test(texts['/operate/']) && /Usage is billed separately/.test(texts['/operate/']), 'Operate: AI reception + usage disclosure');
await page.goto(BASE + '/about/', { waitUntil: 'networkidle0' });
ok(!(await page.$('.founder-photo')) && !/HEADSHOT|PHOTO/i.test(texts['/about/']), 'About: photo block hidden until supplied');
ok(/Colin/.test(texts['/about/']) && !/then in inside sales|Before IronWeb, Colin worked/i.test(texts['/about/']), 'About: founder story without chronology');

// ---------- mobile ----------
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
ok(await page.$eval('.nav-call', (a) => a.getAttribute('href') === 'tel:+17744867776' && a.getBoundingClientRect().width >= 44 && getComputedStyle(a).display !== 'none'), 'mobile header shows a 44px call button');
await page.tap('.nav-toggle');
ok(await page.$eval('#mobile-nav', (n) => !n.hidden), 'mobile menu opens on tap');
ok(await page.$eval('#mobile-nav .btn-primary', (a) => a.getAttribute('href')) === '/contact/#audit' && await page.$eval('#mobile-nav .btn-outline', (a) => a.getAttribute('href')) === '/demo/', 'mobile menu: audit (red) + demo');
await page.keyboard.press('Escape');
ok(await page.$eval('#mobile-nav', (n) => n.hidden), 'mobile menu closes with Escape');
ok(await page.$$eval('.hero-actions .btn', (bs) => bs.every((b) => b.getBoundingClientRect().height >= 44 && b.getBoundingClientRect().right <= innerWidth)), 'mobile hero buttons fit and are tappable');

// ---------- Demo page (/demo/) ----------
await page.close();
page = await freshPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/demo/', { waitUntil: 'networkidle0' });
const cdText = await page.evaluate(() => document.body.innerText);
ok(/Your next customer is calling\. Is your business ready\?/.test(cdText) && /Interactive demo · Powered by IronWeb/i.test(cdText), 'demo hero headline + indicator');
ok(/Fictional demonstration business/.test(cdText) && /Summit Home Services/.test(cdText), 'mock business labelled fictional');
ok(/Preview mode/.test(cdText), 'preview mode banner shown when not live (local)');
ok(await page.$eval('[data-cd-book]', (a) => a.getAttribute('href') === '#book' && !a.target), 'demo booking CTA scrolls to the embedded calendar');
ok(await page.$eval('#book iframe', (f) => /ironweb-contractor-demo/.test(f.src)), 'demo page embeds the booking calendar');
ok(await page.$eval('#cd-sms', (c) => !c.checked && !c.required), 'demo SMS consent optional and unchecked');
ok(await page.$eval('[data-cd-next]', (b) => b.disabled), 'steps 2-3 locked until the form is submitted');
await page.$eval('.sm-submit', (b) => b.click());
const cdErrs = await page.$$eval('.sm-form [aria-invalid="true"]', (els) => els.map((e) => e.name));
ok(['firstName', 'lastName', 'phone', 'service', 'description'].every((n) => cdErrs.includes(n)) && !cdErrs.includes('email'), `demo form validation (${cdErrs.join(', ')})`);
await page.type('#cd-first', 'Jordan');
await page.type('#cd-last', 'Test');
await page.type('#cd-phone', '508 555 0142');
await page.select('#cd-service', 'Painting');
await page.type('#cd-desc', 'Repaint two bedrooms');
let cdPosts = 0;
const cdCount = (r) => { if (r.url().endsWith('/api/contractor-demo') && r.method() === 'POST') cdPosts++; };
page.on('request', cdCount);
await new Promise((r) => setTimeout(r, 2700));
await page.$eval('.sm-submit', (b) => { b.click(); b.click(); });
await page.waitForFunction(() => document.querySelector('[data-cd]').dataset.step === '2', { timeout: 8000 });
await new Promise((r) => setTimeout(r, 2500));
page.off('request', cdCount);
ok(cdPosts === 1, `demo: duplicate submit prevented (${cdPosts})`);
const evs = await page.$$eval('[data-ev]', (l) => Object.fromEntries(l.map((x) => [x.dataset.ev, x.querySelector('[data-badge]').textContent])));
ok(evs.submitted === 'Confirmed' && evs.contact === 'Simulated' && evs.opportunity === 'Simulated' && evs.owner_alert === 'Simulated' && /Skipped/.test(evs.sms), `demo events honest in preview: ${JSON.stringify(evs)}`);
await page.$eval('[data-cd-next]', (b) => b.click());
await new Promise((r) => setTimeout(r, 1200));
ok(await page.$eval('[data-cd-card]', (c) => !c.hidden && c.querySelector('[data-cd-card-name]').textContent === 'Jordan'), 'pipeline: demo card in New Lead');
const dl = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event));
ok(['iw_demo_page_viewed', 'iw_demo_started', 'iw_estimate_form_submitted', 'iw_pipeline_reveal_viewed'].every((e) => dl.includes(e)), `analytics events: ${dl.join(', ')}`);
ok(!JSON.stringify(await page.evaluate(() => window.dataLayer)).includes('Jordan'), 'analytics carry no personal data');
ok(await page.evaluate(() => typeof window.fbq === 'undefined'), 'no ad pixel loaded');
await page.$eval('.cd-bar [data-cd-restart]', (b) => b.click());
ok(await page.$eval('[data-cd]', (r) => r.dataset.step) === '1' && await page.$eval('#cd-first', (i) => i.value === ''), 'restart resets the demo');

ok(consoleErrors.length === 0, `no console errors ${consoleErrors.join(' | ')}`);
await browser.close();
console.log(fails.length ? `\nFAILED (${fails.length}):\n- ${fails.join('\n- ')}` : '\nAll checks passed');
process.exit(fails.length ? 1 : 0);
