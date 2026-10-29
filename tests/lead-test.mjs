// Tests POST /api/lead against a fake CRM (no network, no real contacts).
// Run: node tests/lead-test.mjs
import assert from 'node:assert/strict';

const handler = (await import('../netlify/functions/lead.mjs')).default;
const { resetPipelineCache } = await import('../netlify/lib/ghl.mjs');
let pass = 0;
const test = async (name, fn) => { await fn(); pass++; console.log('ok', name); };

const consent = { agreed: true, text: 'I agree to receive text messages from Ironweb Digital Growth', timestamp: new Date().toISOString() };
const body = (over = {}) => ({
  intent: 'audit', name: 'Test Person', email: 'colin19sullivan+test@gmail.com', phone: '+15555550123',
  answers: { businessName: 'Test Painting', trade: 'Painting', town: 'Swansea', message: 'hi' },
  consent: { agreed: false }, bot_field: '', elapsedMs: 9000, pageUrl: 'http://localhost/', attribution: { utm_source: 'test' }, ...over,
});
const post = (b) => handler(new Request('http://x/api/lead', { method: 'POST', body: JSON.stringify(b), headers: { 'content-type': 'application/json' } }), { ip: `10.0.0.${Math.floor(Math.random() * 250)}` });

let calls = [];
let failOn = null;
// Fake CRM: a "Website Leads" pipeline whose first stage (by position) is s-new.
const crm = { openOpp: false, pipelines: [
  { id: 'p-other', name: 'IronWeb Contractor Demo', stages: [{ id: 'x', name: 'New Lead', position: 0 }] },
  { id: 'p-web', name: 'Website Leads', stages: [{ id: 's-2', name: 'Contacted', position: 1 }, { id: 's-new', name: 'New', position: 0 }] },
] };
globalThis.fetch = async (url, init) => {
  const u = new URL(url);
  const path = u.pathname;
  calls.push({ path, method: init.method, query: Object.fromEntries(u.searchParams), body: init.body ? JSON.parse(init.body) : null, headers: init.headers });
  if (failOn && path.startsWith(failOn)) return new Response(JSON.stringify({ message: 'nope' }), { status: 500 });
  if (path === '/contacts/upsert') return new Response(JSON.stringify({ new: true, contact: { id: 'c123' } }), { status: 200 });
  if (path === '/opportunities/pipelines') return new Response(JSON.stringify({ pipelines: crm.pipelines }), { status: 200 });
  if (path === '/opportunities/search') return new Response(JSON.stringify({ opportunities: crm.openOpp ? [{ id: 'o1', pipelineId: 'p-web' }] : [] }), { status: 200 });
  return new Response('{}', { status: 200 });
};
const setEnv = (on, pipeline = false) => {
  for (const k of ['GHL_TOKEN', 'GHL_API_KEY', 'GHL_LOCATION_ID', 'GHL_PIPELINE_ID', 'GHL_PIPELINE_STAGE_ID']) delete process.env[k];
  if (on) { process.env.GHL_API_KEY = 'key123'; process.env.GHL_LOCATION_ID = 'loc'; }
  if (pipeline) { process.env.GHL_PIPELINE_ID = 'pipe'; process.env.GHL_PIPELINE_STAGE_ID = 'stage'; }
  resetPipelineCache(); crm.openOpp = false;
};
const paths = () => calls.map((c) => `${c.method} ${c.path}`);

await test('stub mode returns 503 not_connected and sends nothing', async () => {
  setEnv(false); calls = [];
  const r = await post(body());
  assert.equal(r.status, 503);
  assert.equal((await r.json()).code, 'not_connected');
  assert.equal(calls.length, 0);
});

await test('audit validation: name, email, mobile and business name required; trade choices enforced', async () => {
  setEnv(true);
  const r = await post(body({ name: '', email: 'bad', phone: null, answers: { trade: 'Real estate' } }));
  assert.equal(r.status, 400);
  const j = await r.json();
  assert.ok(j.errors.name && j.errors.email && j.errors.phone && j.errors.businessName && j.errors.trade);
});

await test('audit: SMS consent is optional (no consent still succeeds)', async () => {
  setEnv(true); calls = [];
  const r = await post(body());
  assert.equal(r.status, 200);
  assert.ok(!calls[1].body.tags.includes('sms-consent'));
});

await test('SMS consent requires a phone and a complete record', async () => {
  setEnv(true);
  assert.equal((await post(body({ intent: 'preview', phone: null, consent: { agreed: true, text: 'x', timestamp: new Date().toISOString() } }))).status, 400);
  assert.equal((await post(body({ consent: { agreed: true, text: '', timestamp: 'nope' } }))).status, 400);
});

await test('honeypot and too-fast submissions are dropped without CRM calls', async () => {
  setEnv(true); calls = [];
  assert.equal((await post(body({ bot_field: 'spam' }))).status, 200);
  assert.equal((await post(body({ elapsedMs: 300 }))).status, 200);
  assert.equal(calls.length, 0);
});

await test('audit success: upsert → tags → note → Website Leads opportunity in the FIRST stage', async () => {
  setEnv(true); calls = [];
  const r = await post(body({ consent }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
  assert.deepEqual(paths(), ['POST /contacts/upsert', 'POST /contacts/c123/tags', 'POST /contacts/c123/notes',
    'GET /opportunities/pipelines', 'GET /opportunities/search', 'POST /opportunities/']);
  assert.equal(calls[0].headers.Authorization, 'Bearer key123');
  assert.equal(calls[0].body.companyName, 'Test Painting');
  assert.equal(calls[0].body.tags, undefined, 'upsert must not set tags (it overwrites)');
  for (const t of ['website lead', 'website-audit-request', 'source-website', 'trade-painting', 'sms-consent']) assert.ok(calls[1].body.tags.includes(t), t);
  assert.ok(/trade: Painting/.test(calls[2].body.body) && /town: Swansea/.test(calls[2].body.body) && /utm_source=test/.test(calls[2].body.body));
  const opp = calls.at(-1).body;
  assert.equal(opp.pipelineId, 'p-web');
  assert.equal(opp.pipelineStageId, 's-new', 'first stage by position');
  assert.equal(opp.contactId, 'c123');
  assert.equal(opp.name, 'Test Person - Test Painting');
  assert.equal(calls.find((c) => c.path === '/opportunities/search').query.pipeline_id, 'p-web');
  for (const c of calls.filter((x) => x.path.startsWith('/opportunities'))) assert.equal(c.headers.Version, '2021-07-28', c.path);
  assert.equal(calls[0].headers.Version, 'v3');
});

await test('audit: an open Website Leads opportunity is reused, not duplicated; pipeline lookup cached', async () => {
  setEnv(true); calls = [];
  await post(body());
  crm.openOpp = true; calls = [];
  await post(body());
  assert.ok(!paths().includes('POST /opportunities/'));
  assert.ok(!paths().includes('GET /opportunities/pipelines'), 'lookup cached per instance');
});

await test('env pipeline ids skip the lookup', async () => {
  setEnv(true, true); calls = [];
  await post(body());
  assert.ok(!paths().includes('GET /opportunities/pipelines'));
  assert.equal(calls.at(-1).body.pipelineStageId, 'stage');
});

await test('missing Website Leads pipeline: lead still succeeds (tags fire the workflow), opportunity logged as failed', async () => {
  setEnv(true); calls = [];
  const saved = crm.pipelines; crm.pipelines = [];
  const r = await post(body());
  crm.pipelines = saved;
  assert.equal(r.status, 200);
  assert.ok(!paths().includes('POST /opportunities/'));
});

await test('preview: tag needs-demo, no opportunity, phone optional', async () => {
  setEnv(true); calls = [];
  const r = await post(body({ intent: 'preview', phone: null, answers: { businessName: 'Test Roofing', trade: 'Roofing', website: 'testroofing.com' } }));
  assert.equal(r.status, 200);
  assert.ok(calls[1].body.tags.includes('needs-demo'));
  assert.ok(!calls[1].body.tags.includes('website lead'));
  assert.ok(!paths().some((p) => p.includes('/opportunities')));
});

await test('CRM failure returns 502 crm_failed (never a fake success)', async () => {
  setEnv(true); calls = []; failOn = '/contacts/upsert';
  const r = await post(body());
  failOn = null;
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'crm_failed');
});

await test('opportunity failure still succeeds (contact + tags created)', async () => {
  setEnv(true); calls = []; failOn = '/opportunities';
  const r = await post(body());
  failOn = null;
  assert.equal(r.status, 200);
});

await test('email: trailing period is trimmed; malformed domains rejected', async () => {
  setEnv(true); calls = [];
  const r = await post(body({ email: 'colin19sullivan+test@gmail.com.' }));
  assert.equal(r.status, 200);
  assert.equal(calls[0].body.email, 'colin19sullivan+test@gmail.com');
  for (const bad of ['a@b', 'a@gmail..com', 'a@-x.com', 'a@x.c']) assert.equal((await post(body({ email: bad }))).status, 400, bad);
});

await test('CRM 422 on email becomes a field error, not a server failure', async () => {
  setEnv(true); calls = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ message: ['email must be an email'] }), { status: 422 });
  const r = await post(body());
  globalThis.fetch = orig;
  assert.equal(r.status, 400);
  assert.ok((await r.json()).errors.email);
});

await test('old intents (speed, inquiry, demo, agentic) and unknown intents are rejected', async () => {
  setEnv(true);
  for (const intent of ['speed', 'inquiry', 'demo', 'agentic', 'checkout']) assert.equal((await post(body({ intent }))).status, 400, intent);
});

console.log(`\n${pass} passed`);
