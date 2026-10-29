// Browser checks against the local server (node serve.mjs must be running on :3001).
// Run: node scripts/check.mjs
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { PRICES } from '../src/data.mjs';

const BASE = process.env.BASE || 'http://localhost:3001';
const chromeRoot = path.join(os.homedir(), '.cache/puppeteer/chrome');
const executablePath = path.join(chromeRoot, fs.readdirSync(chromeRoot).sort().reverse()[0], 'chrome-win64/chrome.exe');
const PAGES = ['/', '/services/', '/build/', '/automations/', '/automations/bundles/', '/growth/', '/contractor-demo/', '/portfolio/', '/about/', '/contact/', '/privacy/', '/terms/'];
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
  pg.on('console', (m) => { if (m.type() === 'error' && !/api\/lead/.test(m.text()) && !/50[23]|Service Unavailable|Bad Gateway/.test(m.text())) consoleErrors.push(`${pg.url()}: ${m.text()}`); });
  return pg;
}
let page = await freshPage();

const links = new Set();
for (const w of [1440, 768, 390, 320]) {
  await page.setViewport({ width: w, height: 900 });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy').map((i) => i.src),
      hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      text: document.body.innerText,
    }));
    ok(r.overflow <= 0, `${p} @${w}: no horizontal overflow (${r.overflow})`);
    if (w === 1440) {
      ok(r.h1 === 1, `${p}: exactly one h1`);
      ok(!/GHL|GoHighLevel|HighLevel|Kling|Claude|Netlify/i.test(r.text), `${p}: no private vendor names in copy`);
      ok(r.brokenImgs.length === 0, `${p}: images load`);
      r.hrefs.forEach((h) => links.add(h));
    }
  }
}

// internal links + assets resolve; tel/mailto correct
for (const h of links) {
  if (h.startsWith('tel:')) { ok(h === 'tel:+17744867776', `tel link ${h}`); continue; }
  if (h.startsWith('mailto:')) { ok(h === 'mailto:colin@ironwebdigital.com', `mailto link ${h}`); continue; }
  if (h.startsWith('sms:')) { ok(h === 'sms:+17744867776?&body=DEMO', `sms link ${h}`); continue; }
  if (/^https?:/.test(h)) continue;
  const res = await fetch(BASE + h.split('#')[0], { redirect: 'manual' });
  ok(res.status === 200, `internal link ${h} → ${res.status}`);
}
for (const ext of ['https://tmrconstructioncorp.com/', 'https://allphazepropertysolutions.com/', 'https://homes-by-heroux.netlify.app/']) {
  try { const r = await fetch(ext, { redirect: 'follow' }); ok(r.ok, `external ${ext} → ${r.status}`); } catch (e) { fails.push(`external ${ext}: ${e.message}`); }
}

// redirects for old routes
for (const [from, to] of [['/services/web-design/', '/services/'], ['/operate/', '/automations/'], ['/pricing/', '/build/'], ['/work/', '/portfolio/'], ['/portfolio/tmr-construction/', '/portfolio/']]) {
  const r = await fetch(BASE + from, { redirect: 'manual' });
  ok(r.status === 301 && r.headers.get('location') === to, `redirect ${from} → ${to}`);
}

// prices appear exactly as approved
await page.setViewport({ width: 1440, height: 900 });
const priceText = {};
for (const p of ['/', '/build/', '/growth/', '/automations/', '/automations/bundles/']) { await page.goto(BASE + p); priceText[p] = await page.evaluate(() => document.body.innerText); }
ok(/\$600\s*one-time/i.test(priceText['/build/']), 'Compact Build $600 one-time on /build/');
ok(priceText['/build/'].includes('$1,500') && priceText['/build/'].includes('$100/month'), 'Build $1,500 + $100/month');
ok(priceText['/build/'].includes('$97'), 'Landing page add-on $97 (one-time)');
ok(/\$600 one-time/.test(priceText['/']) && /\$600 value, included/.test(priceText['/']) && !/\$1,500|\$750|\$597|\$350/.test(priceText['/']), 'home: website $600 one-time / included with bundles; no legacy prices');
ok(priceText['/growth/'].includes('$597') && priceText['/growth/'].includes('$750') && priceText['/growth/'].includes('From $1,000'), 'Growth + ads prices');
ok((priceText['/'].match(/\$97\s*\/month/g) || []).length >= 3 && /No setup fee/i.test(priceText['/']) && priceText['/automations/'].includes('$97/month'), 'ladder: $97/month per stage, no setup fee');
ok(/\$297/.test(priceText['/']) && /\$397/.test(priceText['/']) && (priceText['/'].match(/Most Popular/gi) || []).length === 2 && /\$497 setup/.test(priceText['/']) && /waived with 6 months prepaid/.test(priceText['/']), 'home: two Most Popular bundles with $497 setup note');
const b = priceText['/automations/bundles/'];
ok(b.includes('$297') && b.includes('$397') && b.includes('$497 setup') && !/\$750|\$350|Custom Operate/.test(b), 'bundles page: Contractor $297 + Real Estate $397, $497 setup, no legacy bundles');
const future = priceText['/automations/'].split('Further out')[1]?.split('Automation questions')[0] || '';
ok(future.length > 0 && !/\$\s*\d/.test(future), 'AIISA / agent team shows no price');
ok(PRICES.compact.amount === '$600' && PRICES.automationsFrom === '$97/month', 'data: compact + automation starting price');

// services overview (adapted from the old site)
await page.goto(BASE + '/services/', { waitUntil: 'networkidle0' });
const sv = await page.evaluate(() => ({ rows: [...document.querySelectorAll('.svc-row h2')].map((h) => h.textContent), text: document.body.innerText, ctas: [...document.querySelectorAll('.svc-row .btn')].map((a) => a.getAttribute('href')) }));
ok(sv.rows.join('|') === 'A website built to close leads, not just look good.|Your business keeps running after hours.|Show up where your customers are looking.|Get found in your area.', 'services: four numbered sections with the old headlines');
ok(sv.ctas.join('|') === '/contact/#talk|/automations/|/growth/|/contact/?interest=local-search#inquiry', 'services: each section has a working next step');
ok(!/drone|FAA|Rank #1|50\+ directories|24\/7|within 5 minutes|our team/i.test(sv.text), 'services: unsupported claims from the old page are gone');
ok(/From \$600 one-time/.test(sv.text) && /\$97\/month/.test(sv.text) && /\$597\/month/.test(sv.text), 'services: prices match approved pricing');
ok(await page.$eval('#services-menu a', (a) => a.getAttribute('href') === '/services/'), 'Services dropdown starts with All services');

// automation menu: every service explains problem, what it does, next step; status labels honest
await page.goto(BASE + '/automations/', { waitUntil: 'networkidle0' });
const items = await page.$$eval('.auto-item', (els) => els.map((e) => ({
  status: e.querySelector('.status').textContent.trim(),
  dts: [...e.querySelectorAll('dt')].map((d) => d.textContent.trim()),
  href: e.querySelector('a').getAttribute('href'),
})));
ok(items.length === 5 && items.every((i) => i.dts.join('|') === 'The problem|What it does' && /\/contact\/\?interest=.+#inquiry/.test(i.href)), 'automation menu: problem, what it does, next step on every item');
ok(items.filter((i) => i.status === 'Ready now').length === 4 && items.some((i) => i.status === 'Scoped on request'), 'ready vs scoped labels');
ok(await page.$eval('#agentic', (f) => f.dataset.leadForm === 'agentic'), 'AIISA section keeps the agentic interest form');
await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), page.click('#missed-call .text-link')]);
const pre = await page.evaluate(() => ({ svc: document.querySelector('#inquiry [name=service]').value, msg: document.querySelector('#inquiry [name=message]').value }));
ok(pre.svc === 'Automations' && /Missed-call text-back/.test(pre.msg), '"Ask about this automation" prefills the inquiry form');

// desktop dropdown: keyboard
await page.goto(BASE + '/');
await page.focus('.menu-toggle');
await page.keyboard.press('Enter');
ok(await page.$eval('.menu-toggle', (b) => b.getAttribute('aria-expanded')) === 'true', 'Services menu opens with Enter');
ok(await page.$eval('#services-menu', (m) => getComputedStyle(m).visibility) === 'visible', 'Services menu visible');
ok((await page.$$eval('#services-menu a', (as) => as.map((a) => a.textContent.trim()))).join('|').startsWith('All servicesHow it all fits together|WebsitesFrom $600'), 'Services menu: All services, then Websites first');
await page.keyboard.press('Escape');
ok(await page.$eval('.menu-toggle', (b) => b.getAttribute('aria-expanded')) === 'false', 'Services menu closes with Escape');

// forms: validation and honest stub result (no success without CRM)
await page.goto(BASE + '/contact/');
await page.click('#inquiry [type=submit]');
ok(await page.$eval('#inquiry-name', (i) => i.getAttribute('aria-invalid')) === 'true', 'empty submit flags name');
ok((await page.$eval('#inquiry', (f) => f.querySelector('#inquiry-email').closest('.field').querySelector('.field-error').textContent)).length > 0, 'empty submit shows email error');
await page.type('#inquiry-name', 'Test Person');
await page.type('#inquiry-email', 'colin19sullivan+test@gmail.com');
await page.click('#inquiry-sms');
await page.click('#inquiry [type=submit]');
ok(/mobile number/i.test(await page.$eval('#inquiry', (f) => f.querySelector('#inquiry-phone').closest('.field').innerText)), 'SMS consent without phone is flagged');
await page.click('#inquiry-sms');
await new Promise((r) => setTimeout(r, 2600));
await page.click('#inquiry [type=submit]');
await page.waitForFunction(() => document.querySelector('#inquiry .form-status')?.textContent.length > 0, { timeout: 8000 });
ok(/Nothing was sent/.test(await page.$eval('#inquiry .form-status', (s) => s.textContent)), 'stub mode shows "Nothing was sent" notice');
ok(!(await page.$('.form-success')), 'no success state without CRM acceptance');
ok(/Online booking is being connected/.test(await page.$eval('#book', (s) => s.innerText)), 'booking shows honest pending state');
ok(await page.$eval('#talk-contact-more', (d) => d.open), 'contact talk form details open (phone + SMS box visible for opt-in review)');

// ---------- website-first CTA hierarchy (2026-10-10) ----------
for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
  const cta = await page.$eval('.btn-cta', (a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') }));
  ok(cta.text === '(774) 486-7776' && cta.href === 'tel:+17744867776', `${p}: top-right header button calls (774) 486-7776`);
}
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
const heroBtns = await page.$$eval('.hero-actions .btn', (bs) => bs.map((b) => [b.textContent.trim(), b.getAttribute('href')]));
ok(/^Text DEMO to \(774\) 486-7776$/.test(heroBtns[0][0]) && heroBtns[0][1] === 'sms:+17744867776?&body=DEMO' && heroBtns[1][1] === '#talk', 'hero CTA: Text DEMO (sms link) + we text you (#talk)');
const hero = await page.evaluate(() => ({
  h1: document.querySelector('.hero-title').textContent.replace(/\s+/g, ' ').trim(),
  red: document.querySelector('.hero-title .accent').textContent,
  text: document.querySelector('.hero').innerText,
  sig: !!document.querySelector('.hero-signature'),
  imgAlt: document.querySelector('.hero-still').getAttribute('alt'),
  title: document.title,
  desc: document.querySelector('meta[name=description]').content,
  ld: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
}));
ok(hero.h1 === 'Systems that Stick' && hero.red === 'Stick', 'hero header "Systems that Stick"');
ok(/Never miss another opportunity\./.test(hero.text) && /under a minute/.test(hero.text) && /\$97\/month/.test(hero.text) && /see how fast we answer/i.test(hero.text), 'hero: wedge kicker, under a minute, $97/month');
ok(await page.$('.hero-video') !== null, 'animated video hero kept');
ok(/Systems that Stick/i.test(await page.$eval('.site-footer', (f) => f.innerText)), 'footer tagline');
ok(hero.imgAlt === '', 'decorative hero image alt=""');
const auto = await page.$eval('#automation', (a) => a.innerText);
ok(/Saltmarsh Realty/.test(auto) && /replied in 0:42/.test(auto) && /Example: a real estate lead, answered automatically/.test(auto), 'SMS mockup sits beside "Never miss another lead"');
const assets = await page.$$eval('link[rel=stylesheet][href^="/assets"], script[src^="/assets"]', (els) => els.map((e) => e.getAttribute('href') || e.getAttribute('src')));
ok(assets.length >= 4 && assets.every((u) => /\?v=[a-f0-9]{10}$/.test(u)), 'CSS/JS URLs are content-hashed (no stale cache)');
ok(await page.evaluate(() => getComputedStyle(document.querySelector('.nav-call')).display === 'none'), 'desktop: one call button');
ok(hero.title === 'Missed-Call Text-Back & Automations for Contractors & Realtors | Southeastern MA | IronWeb Digital', 'homepage <title>');
ok(/Systems that Stick/.test(hero.desc) && /\$97\/month/.test(hero.desc) && /contractors/i.test(hero.desc) && /real estate/i.test(hero.desc) && /Southeastern MA/.test(hero.desc), 'meta description: tagline, $97/month, contractors, real estate, SE MA');
ok(hero.ld.address.addressLocality === 'Swansea' && hero.ld.areaServed.some((a) => a.name === 'Southeastern Massachusetts') && hero.ld.email === 'colin@ironwebdigital.com', 'schema: Swansea + Southeastern Massachusetts + new email');
const order = await page.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => s.id || s.className));
ok(JSON.stringify(order.slice(1)) === JSON.stringify(['demo', 'automation', 'bundles', 'value', 'work', 'process', 'faq', 'talk']), `home order: ${order.join(' > ')}`);
const homeText = await page.evaluate(() => document.body.innerText);
ok(!(await page.$('.proof-strip')) && !/3–6 months/.test(homeText), 'proof strip removed from home');
ok(['Get Found', 'Never Miss an Opportunity', 'Track Everything'].every((t) => homeText.includes(t)) && (await page.$$('.ladder-step')).length === 3, 'ladder: three stages in order');
ok((await page.$$('#faq details')).length === 4 && /hostage/.test(await page.$eval('#faq', (f) => f.textContent)), 'objection FAQ: four questions');
ok(!/—/.test(homeText), 'no em dashes in homepage copy');
ok(/Start small\. Grow big\./i.test(homeText), 'automation anchor copy present');
ok(!/Ocean Groove/.test(homeText) && /Homes by Heroux/.test(homeText), 'home shows the three business clients');
await page.goto(BASE + '/portfolio/', { waitUntil: 'networkidle0' });
const pf = await page.evaluate(() => ({ h: document.querySelector('.page-head .eyebrow').textContent, names: [...document.querySelectorAll('.work-card h3')].map((h) => h.textContent), og: [...document.querySelectorAll('.work-card a')].some((a) => a.href === 'https://oceangroovetheband.com/'), nav: [...document.querySelectorAll('.nav-list a')].map((a) => a.textContent.trim()) }));
ok(pf.h === 'Portfolio' && pf.nav.includes('Portfolio') && !pf.nav.includes('Work'), 'Work renamed to Portfolio (page + nav)');
ok(pf.names.join('|') === 'TMR Construction|All Phaze Property Solutions|Homes by Heroux|Ocean Groove' && pf.og, 'Portfolio includes Ocean Groove with its live link');
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
ok(!(await page.$('#testimonials')) && !/TESTIMONIAL/.test(homeText), 'no testimonials block until real quotes exist');
ok(!/\[[A-Z][A-Z ]+[^\]]*\]/.test(homeText), 'no bracketed placeholders on home');
ok(!/guarantee/i.test(homeText.replace(/doesn't guarantee/gi, '')), 'no guarantee claims on home');
ok(await page.$$eval('form[data-lead-form]', (f) => f.map((x) => x.dataset.leadForm).join()) === 'speed', 'home has one form: the speed-to-lead form');
const disclaimers = (await page.$eval('#demo', (d) => d.innerText)).match(/illustrative|simulated|nothing (is|was) sent|doesn't send/gi) || [];
ok(disclaimers.length === 1, `demo has one short disclaimer line (${disclaimers.length})`);
ok(await page.$('#demo .dx-video') === null && !/\[VIDEO/.test(homeText), 'no video block until a recording is supplied');
ok(!/\[HEADSHOT/.test(homeText) && await page.$('.founder-photo--slot') === null, 'no headshot placeholder until a photo is supplied');

// lazy work images load when scrolled into view
await page.$eval('#work', (s) => s.scrollIntoView());
await page.waitForFunction(() => [...document.querySelectorAll('#work img')].every((i) => i.complete && i.naturalWidth > 0), { timeout: 8000 }).catch(() => {});
ok(await page.$$eval('#work img', (is) => is.length === 3 && is.every((i) => i.naturalWidth > 0)), 'TMR, All Phaze + Homes by Heroux previews load on scroll');
ok(await page.$eval('#work', (w) => [...w.querySelectorAll('a')].some((a) => a.href === 'https://homes-by-heroux.netlify.app/')), 'Homes by Heroux links to its live Netlify site');

// interactive demo
const demoTop = async () => page.evaluate(() => document.getElementById('demo').getBoundingClientRect().top);
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.click('.hero-actions .btn-outline'); // primary is an sms: link; headless browsers can't follow it
await new Promise((r) => setTimeout(r, 300));
ok(await page.evaluate(() => { const t = document.getElementById('talk').getBoundingClientRect().top; return t >= 0 && t <= 40; }), 'hero secondary CTA scrolls to the text-me form (#talk)');
let top;
ok(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'reduced motion: instant scroll');
ok(await page.$eval('.dx-scroll', (s) => getComputedStyle(s).scrollBehavior) === 'auto', 'reduced motion: demo scroll is instant');
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

const dx = () => page.evaluate(() => {
  const panel = document.querySelector('.dx-site:not([hidden])');
  return {
    industry: panel.dataset.industry,
    headline: panel.querySelector('.m-h').textContent,
    form: panel.querySelector('.m-inquiry h4').textContent,
    url: document.querySelector('.dx-url').textContent,
    step: document.querySelector('[data-step][aria-current="step"]').dataset.step,
    selected: [...document.querySelectorAll('[role=tab]')].filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.id),
  };
});
let s0 = await dx();
ok(s0.industry === 'trades' && s0.step === 'first' && s0.selected.length === 1, 'demo starts on Trades, first step');
await page.focus('#dx-tab-trades');
await page.keyboard.press('ArrowRight');
let s1 = await dx();
ok(s1.industry === 'realestate' && s1.headline !== s0.headline && s1.form !== s0.form && s1.url === 'examplerealty.co' && await page.evaluate(() => document.activeElement.id) === 'dx-tab-realestate', 'ArrowRight switches industry: content, journey form and URL change; focus follows');
await page.keyboard.press('End');
ok((await dx()).industry === 'local', 'End selects last industry');
await page.keyboard.press('Home');
ok((await dx()).industry === 'trades', 'Home selects first industry');
await page.click('#dx-tab-local');
ok((await dx()).industry === 'local', 'click selects industry');
await page.click('[data-step="proof"]');
await new Promise((r) => setTimeout(r, 800));
ok(await page.evaluate(() => { const sc = document.querySelector('.dx-site:not([hidden]) .dx-scroll'); const r = sc.querySelector('[data-region="proof"]'); return Math.abs(sc.scrollTop - (r.offsetTop - 12)) < 30 && r.classList.contains('is-focus'); }), 'journey step scrolls the example site to that section');
await page.click('[data-view="phone"]');
await new Promise((r) => setTimeout(r, 500));
ok(await page.evaluate(() => document.querySelector('.dx-frame').dataset.view === 'phone' && document.querySelector('.dx-site:not([hidden]) .dx-scroll').clientWidth <= 380 && getComputedStyle(document.querySelector('.dx-site:not([hidden]) .m-links')).display === 'none'), 'Phone view reflows the example site to mobile layout');
await page.click('[data-view="desktop"]');
// simulated inquiry: validation, honest feedback, no network
let leadCalls = 0;
const countLead = (req) => { if (req.url().includes('/api/')) leadCalls++; };
page.on('request', countLead);
await page.click('.dx-site:not([hidden]) .m-btn[data-goto]');
await new Promise((r) => setTimeout(r, 900));
ok((await dx()).step === 'inquiry', 'example-site CTA jumps to the inquiry step');
await page.click('.dx-site:not([hidden]) .m-form [type=submit]');
ok(/Add a name/.test(await page.$eval('.dx-site:not([hidden]) .m-error', (e) => e.textContent)), 'demo inquiry validates');
await page.type('.dx-site:not([hidden]) .m-form input', 'Jordan');
await page.click('.dx-site:not([hidden]) .m-form [type=submit]');
await new Promise((r) => setTimeout(r, 900));
const sent = await page.$eval('.dx-site:not([hidden]) .m-sent', (e) => ({ hidden: e.hidden, text: e.textContent }));
ok(!sent.hidden && /On a real site/.test(sent.text) && /would/.test(sent.text) && (await dx()).step === 'after', 'demo inquiry: conditional wording, advances to "after"');
ok(/Jordan/.test(await page.$eval('.dx-site:not([hidden]) [data-notify]', (e) => e.textContent)), 'demo "to you" message reflects the simulated request');
page.off('request', countLead);
ok(leadCalls === 0, 'demo makes no network requests');
ok(/Example businesses\. The demo form doesn't send anything\./.test(await page.$eval('#demo', (d) => d.innerText)), 'demo keeps its one disclaimer');
// after-demo CTA reaches the working contact flow
await page.click('.dx-after .btn-primary');
await page.waitForFunction(() => { const t = document.getElementById('talk').getBoundingClientRect().top; return t >= -2 && t <= 60; }, { timeout: 5000 }).catch(() => {});
ok(await page.evaluate(() => { const t = document.getElementById('talk').getBoundingClientRect().top; return t >= -2 && t <= 60; }), '"Let\'s talk about your website" scrolls to the form');

// cross-page demo CTA
await page.goto(BASE + '/build/', { waitUntil: 'networkidle0' });
await page.$eval('.demo--callout .btn-primary', (b) => b.click()); // smooth scrolling makes coordinate clicks miss
await page.waitForFunction(() => location.pathname === '/' && document.readyState !== 'loading', { timeout: 15000 });
// Smooth scrolling may animate from a restored position; wait for it to settle where it should.
await page.waitForFunction(() => { const t = document.getElementById('demo').getBoundingClientRect().top; return t >= -2 && t <= 60; }, { timeout: 6000 }).catch(() => {});
top = await demoTop();
ok(page.url().endsWith('/#demo') && top >= -2 && top <= 60, `Build "Explore the demo" lands on homepage #demo (top=${Math.round(top)}px)`);
await page.goto(BASE + '/about/', { waitUntil: 'networkidle0' });
ok(!/then in inside sales|Then came inside sales|Before IronWeb, Colin worked/i.test(await page.evaluate(() => document.body.innerText)), 'founder chronology stays removed (about)');

// speed form (home #talk / talk-home): required fields, consent, disclosure, payload, duplicate guard, honest states
await page.close();
page = await freshPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
const req = await page.$$eval('#talk-home [required]', (els) => els.map((e) => e.name));
ok(['name', 'phone', 'email', 'smsConsent'].every((n) => req.includes(n)) && req.length === 4, `speed form required: ${req.join(', ')}`);
ok(await page.$eval('#talk-home-phone', (i) => !i.closest('details')), 'phone is outside the collapsible details');
ok((await page.$$eval('#talk-home-type option', (o) => o.map((x) => x.textContent))).slice(1).join('|') === 'Contractor / trade|Real estate|Other', 'business type options');
ok(await page.$eval('#talk-home [type=submit]', (b) => b.textContent.trim()) === 'Text me now', 'button "Text me now"');
ok(/under a minute/.test(await page.$eval('#talk-home .form-note', (n) => n.textContent)), 'speed microcopy');
ok(/I agree to receive texts from Ironweb Digital Growth \(IronWeb Digital\) about my inquiry\. Msg &(amp;)? data rates may apply\. Reply STOP to opt out\./.test(await page.$eval('label[for="talk-home-sms"]', (l) => l.textContent)), 'consent wording');
ok(await page.$('#talk-home [name="bot_field"]') !== null, 'honeypot kept');
ok(await page.$eval('#talk-home-more', (d) => !d.open), 'project details collapsed by default');
await page.focus('#talk-home-more > summary');
await page.keyboard.press('Enter');
ok(await page.$eval('#talk-home-more', (d) => d.open), 'details open with Enter');
await page.keyboard.press('Space');
ok(await page.$eval('#talk-home-more', (d) => !d.open), 'details close with Space');
await page.click('#talk-home [type=submit]');
const errs = await page.$$eval('#talk-home [aria-invalid="true"]', (els) => els.map((e) => e.name));
ok(['name', 'phone', 'email', 'smsConsent'].every((n) => errs.includes(n)), `empty submit flags ${errs.join(', ')}`);
ok(await page.evaluate(() => document.activeElement.id) === 'talk-home-name', 'focus moves to first invalid field');
await page.type('#talk-home-name', 'Test Person');
await page.type('#talk-home-phone', '508 555 0123');
await page.type('#talk-home-email', 'colin19sullivan+test@gmail.com');
await page.select('#talk-home-type', 'Real estate');
await page.click('#talk-home-more > summary');
await page.type('#talk-home-msg', 'Need a new homepage');
await page.click('#talk-home [type=submit]');
ok(await page.$eval('#talk-home-sms', (c) => c.getAttribute('aria-invalid')) === 'true', 'consent required before sending');
await page.click('#talk-home-sms');
await page.setRequestInterception(true);
let posts = [];
let mode = 'fail';
const onReq = (req) => {
  if (req.url().endsWith('/api/lead')) {
    posts.push(JSON.parse(req.postData()));
    const body = mode === 'ok' ? { ok: true } : { ok: false, code: 'crm_failed' };
    setTimeout(() => req.respond({ status: mode === 'ok' ? 200 : 502, contentType: 'application/json', body: JSON.stringify(body) }), 400);
  } else req.continue();
};
page.on('request', onReq);
await new Promise((r) => setTimeout(r, 2600));
await page.click('#talk-home [type=submit]');
await page.click('#talk-home [type=submit]').catch(() => {});
await page.waitForFunction(() => document.querySelector('#talk-home .form-status')?.textContent.length > 0);
ok(posts.length === 1, `duplicate submit prevented (${posts.length} request)`);
const pl = posts[0];
ok(pl.intent === 'speed' && pl.name === 'Test Person' && pl.email === 'colin19sullivan+test@gmail.com' && pl.phone === '+15085550123', 'speed payload: intent, name, email, E.164 phone');
ok(pl.answers.businessType === 'Real estate' && pl.answers.message === 'Need a new homepage', 'speed payload: business type + project details');
ok(pl.consent.agreed === true && /IronWeb Digital/.test(pl.consent.text) && !Number.isNaN(Date.parse(pl.consent.timestamp)) && pl.attribution.landing && pl.pageUrl, 'speed payload: consent record, attribution, page URL');
ok(/didn't go through/.test(await page.$eval('#talk-home .form-status', (s) => s.textContent)) && !(await page.$('.form-success')), 'CRM failure → inline error, no success');
mode = 'ok';
await page.click('#talk-home [type=submit]');
await page.waitForSelector('.form-success', { timeout: 5000 });
ok(/You're in\./.test(await page.$eval('.form-success', (s) => s.innerText)), 'inline success only after backend acceptance');
ok(page.url().startsWith(BASE + '/'), 'no navigation away (no silent form.submit)');

// inquiry form mapping (contact)
posts = [];
await page.goto(BASE + '/contact/', { waitUntil: 'networkidle0' });
ok(await page.$eval('#talk-contact-sms', (c) => !c.required), 'Contact keeps an optional-consent, email-only path');
ok(await page.$eval('#inquiry-more', (d) => d.open), 'contact inquiry details open');
await page.type('#inquiry-name', 'Test Person');
await page.type('#inquiry-email', 'colin19sullivan+test@gmail.com');
await page.select('#inquiry-svc', 'Automations');
await page.select('#inquiry-time', 'Within a month');
await page.select('#inquiry-budget', 'Under $1,000');
await page.type('#inquiry-phone', '5085550123');
await page.click('#inquiry-sms');
await new Promise((r) => setTimeout(r, 2600));
mode = 'fail';
await page.click('#inquiry [type=submit]');
await page.waitForFunction(() => document.querySelector('#inquiry .form-status')?.textContent.length > 0);
const ip = posts[0];
ok(ip.intent === 'inquiry' && ip.answers.service === 'Automations' && ip.answers.timeline === 'Within a month' && ip.answers.budget === 'Under $1,000', 'inquiry payload keeps service/timeline/budget mappings');
ok(ip.consent.agreed === true && /IronWeb Digital/.test(ip.consent.text) && !Number.isNaN(Date.parse(ip.consent.timestamp)), 'SMS consent record sent when ticked');
page.off('request', onReq);
await page.setRequestInterception(false);

// mobile: menu, demo tabs by touch, details by touch, demo CTA
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
ok(await page.$eval('.nav-call', (a) => a.getAttribute('href') === 'tel:+17744867776' && a.getBoundingClientRect().width >= 44 && getComputedStyle(a).display !== 'none'), 'mobile header shows a 44px call button');
await page.tap('.nav-toggle');
ok(await page.$eval('#mobile-nav', (n) => !n.hidden && n.getBoundingClientRect().height > 100), 'mobile menu opens on tap');
await page.keyboard.press('Escape');
ok(await page.$eval('#mobile-nav', (n) => n.hidden), 'mobile menu closes with Escape');
await page.tap('.nav-toggle');
await page.tap('#mobile-nav .btn-primary');
await new Promise((r) => setTimeout(r, 900));
top = await demoTop();
ok(await page.$eval('#mobile-nav', (n) => n.hidden) && top >= -2 && top <= 40, `mobile menu "Explore the demo" closes menu and scrolls to #demo (top=${Math.round(top)})`);
await page.tap('#dx-tab-realestate');
ok((await dx()).industry === 'realestate', 'industry tab works by tap');
ok(await page.$eval('.dx-site:not([hidden]) .dx-scroll', (s) => s.getBoundingClientRect().right <= innerWidth + 0.5), 'demo fits the mobile viewport');
await page.$eval('#talk-home-more > summary', (s) => s.scrollIntoView({ block: 'center' }));
await page.tap('#talk-home-more > summary');
ok(await page.$eval('#talk-home-more', (d) => d.open), 'details open on tap');

// ---------- Contractor Core interactive demo (2026-10-27) ----------
await page.close();
page = await freshPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/contractor-demo/', { waitUntil: 'networkidle0' });
const cdText = await page.evaluate(() => document.body.innerText);
ok(/Your Next Customer Is Calling\. Is Your Business Ready\?/.test(cdText) && /Interactive demo · Powered by IronWeb/i.test(cdText), 'demo hero headline + indicator');
ok(/Fictional demonstration business/.test(cdText) && /Summit Home Services/.test(cdText), 'mock business labelled fictional');
ok(!/—/.test(cdText), 'demo page: no em dashes');
ok(/Preview mode/.test(cdText), 'preview mode banner shown when not live');
ok(await page.$eval('[data-cd-recep] button', (b) => b.disabled) && /Coming soon/i.test(await page.$eval('[data-cd-recep]', (r) => r.textContent)) && !(await page.$('[data-cd-recep] a[href^="tel:"]')), 'receptionist: coming soon, no number exposed');
ok(await page.$eval('#cd-sms', (c) => !c.checked && !c.required), 'demo SMS consent optional and unchecked');
ok(await page.$eval('[data-cd-next]', (b) => b.disabled) && await page.$eval('[data-goto="2"]', (b) => b.disabled), 'steps 2-3 locked until the form is submitted');
await page.waitForFunction(() => document.querySelector('[data-cd-book]').getAttribute('href') !== '/contact/#book', { timeout: 5000 }).catch(() => {});
ok(await page.$eval('[data-cd-book]', (a) => a.getAttribute('href') === 'https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo' && a.target === '_blank' && /noopener/.test(a.rel)), 'consultation CTA opens the IronWeb consultation calendar in a new tab');
await page.$eval('.sm-submit', (b) => b.click());
const cdErrs = await page.$$eval('.sm-form [aria-invalid="true"]', (els) => els.map((e) => e.name));
ok(['firstName', 'lastName', 'phone', 'service', 'description'].every((n) => cdErrs.includes(n)) && !cdErrs.includes('email'), `demo form validation (${cdErrs.join(', ')})`);
await page.type('#cd-first', 'Jordan');
await page.type('#cd-last', 'Test');
await page.type('#cd-phone', '508 555 0142');
await page.select('#cd-service', 'Painting');
await page.type('#cd-desc', 'Repaint two bedrooms');
let cdPosts = 0;
const cdCount = (req) => { if (req.url().endsWith('/api/contractor-demo') && req.method() === 'POST') cdPosts++; };
page.on('request', cdCount);
await new Promise((r) => setTimeout(r, 2700));
await page.$eval('.sm-submit', (b) => { b.click(); b.click(); });
await page.waitForFunction(() => document.querySelector('[data-cd]').dataset.step === '2', { timeout: 8000 });
await new Promise((r) => setTimeout(r, 2500));
page.off('request', cdCount);
ok(cdPosts === 1, `demo: duplicate submit prevented (${cdPosts})`);
const evs = await page.$$eval('[data-ev]', (l) => Object.fromEntries(l.map((x) => [x.dataset.ev, x.querySelector('[data-badge]').textContent])));
ok(evs.submitted === 'Confirmed' && evs.contact === 'Simulated' && evs.opportunity === 'Simulated' && evs.owner_alert === 'Simulated' && /Skipped/.test(evs.sms), `demo events honest in preview: ${JSON.stringify(evs)}`);
ok(/No text was sent|nothing was sent/i.test(await page.$eval('[data-cd-sms-cap]', (c) => c.textContent)), 'example SMS labelled, no delivery claimed');
await page.$eval('[data-cd-next]', (b) => b.click());
await new Promise((r) => setTimeout(r, 1200));
const card = await page.$eval('[data-cd-card]', (c) => ({ hidden: c.hidden, name: c.querySelector('[data-cd-card-name]').textContent, badge: c.querySelector('[data-cd-card-badge]').textContent }));
ok(!card.hidden && card.name === 'Jordan' && card.badge === 'Simulated', 'pipeline: demo card in New Lead with first name, labelled simulated');
ok((await page.$$('.cd-stage')).length === 6 && /Manual step/i.test(await page.$eval('[data-stage="3"]', (s) => s.textContent)), 'pipeline: six stages, Quote Sent manual');
const dl = await page.evaluate(() => (window.dataLayer || []).map((e) => e.event));
ok(['iw_demo_page_viewed', 'iw_demo_started', 'iw_estimate_form_submitted', 'iw_pipeline_reveal_viewed'].every((e) => dl.includes(e)), `analytics events: ${dl.join(', ')}`);
ok(!JSON.stringify(await page.evaluate(() => window.dataLayer)).includes('Jordan') && !JSON.stringify(await page.evaluate(() => window.dataLayer)).includes('5085550142'), 'analytics carry no personal data');
ok(await page.evaluate(() => typeof window.fbq === 'undefined'), 'no ad pixel loaded');
await page.$eval('[data-cd-prev]', (b) => b.click());
ok(await page.$eval('[data-cd]', (r) => r.dataset.step) === '2', 'Previous goes back a step');
await page.$eval('.cd-bar [data-cd-restart]', (b) => b.click());
ok(await page.$eval('[data-cd]', (r) => r.dataset.step) === '1' && await page.$eval('#cd-first', (i) => i.value === '') && await page.$eval('[data-cd-next]', (b) => b.disabled), 'restart resets the demo');

ok(consoleErrors.length === 0, `no console errors ${consoleErrors.join(' | ')}`);
await browser.close();
console.log(fails.length ? `\nFAILED (${fails.length}):\n- ${fails.join('\n- ')}` : '\nAll checks passed');
process.exit(fails.length ? 1 : 0);
