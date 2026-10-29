// Tests POST /api/lead against a fake CRM (no network, no real contacts).
// Run: node tests/lead-test.mjs
import assert from 'node:assert/strict';

const handler = (await import('../netlify/functions/lead.mjs')).default;
let pass = 0;
const test = async (name, fn) => { await fn(); pass++; console.log('ok', name); };

const body = (over = {}) => ({
  intent: 'inquiry', name: 'Test Person', email: 'colin19sullivan+test@gmail.com', phone: '+15555550123',
  answers: { businessName: 'Test Co', businessType: 'Real estate', service: 'Build', message: 'hi' },
  consent: { agreed: false }, bot_field: '', elapsedMs: 9000, pageUrl: 'http://localhost/', attribution: { utm_source: 'test' }, ...over,
});
const post = (b) => handler(new Request('http://x/api/lead', { method: 'POST', body: JSON.stringify(b), headers: { 'content-type': 'application/json' } }), { ip: `10.0.0.${Math.floor(Math.random() * 250)}` });

let calls = [];
let failOn = null;
globalThis.fetch = async (url, init) => {
  const path = new URL(url).pathname;
  calls.push({ path, method: init.method, body: init.body ? JSON.parse(init.body) : null, headers: init.headers });
  if (failOn && path.startsWith(failOn)) return new Response(JSON.stringify({ message: 'nope' }), { status: 500 });
  if (path === '/contacts/upsert') return new Response(JSON.stringify({ new: true, contact: { id: 'c123' } }), { status: 200 });
  return new Response('{}', { status: 200 });
};
const setEnv = (on, pipeline = false) => {
  for (const k of ['GHL_TOKEN', 'GHL_API_KEY', 'GHL_LOCATION_ID', 'GHL_PIPELINE_ID', 'GHL_PIPELINE_STAGE_ID']) delete process.env[k];
  if (on) { process.env.GHL_TOKEN = 'tok'; process.env.GHL_LOCATION_ID = 'loc'; }
  if (pipeline) { process.env.GHL_PIPELINE_ID = 'pipe'; process.env.GHL_PIPELINE_STAGE_ID = 'stage'; }
};

await test('stub mode returns 503 not_connected and sends nothing', async () => {
  setEnv(false); calls = [];
  const r = await post(body());
  assert.equal(r.status, 503);
  assert.equal((await r.json()).code, 'not_connected');
  assert.equal(calls.length, 0);
});

await test('validation: name and email required, choices enforced', async () => {
  setEnv(true);
  const r = await post(body({ name: '', email: 'bad', answers: { budget: 'a million' } }));
  assert.equal(r.status, 400);
  const j = await r.json();
  assert.ok(j.errors.name && j.errors.email && j.errors.budget);
});

await test('optional fields can all be empty', async () => {
  setEnv(true); calls = [];
  const r = await post(body({ phone: null, answers: {} }));
  assert.equal(r.status, 200);
});

await test('SMS consent requires a phone and a complete record', async () => {
  setEnv(true);
  const r = await post(body({ phone: null, consent: { agreed: true, text: 'x', timestamp: new Date().toISOString() } }));
  assert.equal(r.status, 400);
});

await test('honeypot and too-fast submissions are dropped without CRM calls', async () => {
  setEnv(true); calls = [];
  assert.equal((await post(body({ bot_field: 'spam' }))).status, 200);
  assert.equal((await post(body({ elapsedMs: 300 }))).status, 200);
  assert.equal(calls.length, 0);
});

await test('success: upsert → tags (append) → note, ok:true; auth header server-side', async () => {
  setEnv(true); calls = [];
  const r = await post(body());
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
  assert.deepEqual(calls.map((c) => c.path), ['/contacts/upsert', '/contacts/c123/tags', '/contacts/c123/notes']);
  assert.equal(calls[0].headers.Authorization, 'Bearer tok');
  assert.equal(calls[0].body.firstName, 'Test');
  assert.equal(calls[0].body.lastName, 'Person');
  assert.equal(calls[0].body.companyName, 'Test Co');
  assert.equal(calls[0].body.tags, undefined, 'upsert must not set tags (it overwrites)');
  assert.ok(calls[1].body.tags.includes('website-inquiry'));
  assert.ok(calls[2].body.body.includes('utm_source=test'));
});

await test('pipeline configured: one opportunity upsert per lead', async () => {
  setEnv(true, true); calls = [];
  await post(body());
  const opp = calls.filter((c) => c.path === '/opportunities/upsert');
  assert.equal(opp.length, 1);
  assert.equal(opp[0].body.contactId, 'c123');
  assert.equal(opp[0].body.pipelineStageId, 'stage');
});

await test('agentic interest never creates an opportunity', async () => {
  setEnv(true, true); calls = [];
  const r = await post(body({ intent: 'agentic', answers: { message: 'interested' } }));
  assert.equal(r.status, 200);
  assert.equal(calls.filter((c) => c.path === '/opportunities/upsert').length, 0);
  assert.ok(calls[1].body.tags.includes('website-agentic-interest'));
});

await test('CRM failure returns 502 crm_failed (never a fake success)', async () => {
  setEnv(true); calls = []; failOn = '/contacts/upsert';
  const r = await post(body());
  failOn = null;
  assert.equal(r.status, 502);
  assert.equal((await r.json()).code, 'crm_failed');
});

await test('opportunity failure still succeeds (contact + tags created)', async () => {
  setEnv(true, true); calls = []; failOn = '/opportunities';
  const r = await post(body());
  failOn = null;
  assert.equal(r.status, 200);
});

await test('speed form: phone + SMS consent required server-side', async () => {
  setEnv(true);
  const r = await post(body({ intent: 'speed', phone: null, consent: { agreed: false }, answers: { businessType: 'Real estate' } }));
  assert.equal(r.status, 400);
  const j = await r.json();
  assert.ok(j.errors.phone && j.errors.smsConsent);
});

await test('speed form: GHL_API_KEY auth, tag "website lead", business type + details in note', async () => {
  setEnv(false); calls = [];
  process.env.GHL_API_KEY = 'key123'; process.env.GHL_LOCATION_ID = 'loc';
  const r = await post(body({ intent: 'speed', consent: { agreed: true, text: 'I agree to receive texts from IronWeb Digital', timestamp: new Date().toISOString() }, answers: { businessType: 'Real estate', message: 'Need a site' } }));
  assert.equal(r.status, 200);
  assert.equal(calls[0].headers.Authorization, 'Bearer key123');
  assert.ok(calls[1].body.tags.includes('website lead'));
  assert.ok(calls[1].body.tags.includes('sms-consent'));
  assert.ok(/businessType: Real estate/.test(calls[2].body.body) && /message: Need a site/.test(calls[2].body.body));
  delete process.env.GHL_API_KEY;
});

await test('speed form: unknown business type rejected', async () => {
  setEnv(true);
  const r = await post(body({ intent: 'speed', consent: { agreed: true, text: 'x', timestamp: new Date().toISOString() }, answers: { businessType: 'Restaurant / hospitality' } }));
  assert.equal(r.status, 400);
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

await test('unknown intent rejected', async () => {
  setEnv(true);
  assert.equal((await post(body({ intent: 'checkout' }))).status, 400);
});

console.log(`\n${pass} passed`);
