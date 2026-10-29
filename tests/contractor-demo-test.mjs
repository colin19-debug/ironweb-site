// Tests /api/contractor-demo against a fake CRM (no network, no real contacts).
// Run: node tests/contractor-demo-test.mjs
import assert from 'node:assert/strict';

const ENV_KEYS = ['GHL_API_KEY', 'GHL_TOKEN', 'GHL_LOCATION_ID', 'CONTRACTOR_DEMO_LIVE', 'CONTRACTOR_DEMO_TRIGGER_WORKFLOWS',
  'CONTRACTOR_DEMO_PIPELINE_ID', 'CONTRACTOR_DEMO_NEW_LEAD_STAGE_ID', 'CONTRACTOR_DEMO_RECEPTIONIST_ENABLED',
  'CONTRACTOR_DEMO_RECEPTIONIST_NUMBER', 'CONTRACTOR_DEMO_BOOKING_URL'];
const setEnv = (vals = {}) => { for (const k of ENV_KEYS) delete process.env[k]; Object.assign(process.env, vals); };
const LIVE = { GHL_API_KEY: 'key', GHL_LOCATION_ID: 'loc', CONTRACTOR_DEMO_LIVE: 'true' };

let calls = [];
let failOn = null;
// Fake CRM state, reset per test where it matters.
const crm = { existingContact: null, openOpp: false, stages: [{ id: 'stage-new', name: 'New Lead' }, { id: 'stage-2', name: 'Contacted' }] };
globalThis.fetch = async (url, init) => {
  const u = new URL(url);
  const p = u.pathname;
  const method = init.method || 'GET';
  calls.push({ method, path: p, version: init.headers?.Version, query: Object.fromEntries(u.searchParams), body: init.body ? JSON.parse(init.body) : null });
  const ok = (o) => new Response(JSON.stringify(o), { status: 200 });
  if (failOn && p.startsWith(failOn)) return new Response('{"message":"nope"}', { status: 500 });
  if (p === '/contacts/search/duplicate') return ok(crm.existingContact ? { contact: { id: crm.existingContact } } : { contact: null });
  if (p === '/contacts/' && method === 'POST') return ok({ contact: { id: 'c-new' } });
  if (p === '/opportunities/pipelines') return ok({ pipelines: [{ id: 'z39DlXlHDKhSdPpo4FUz', stages: crm.stages }, { id: 'other', stages: [{ id: 'x', name: 'New Lead' }] }] });
  if (p === '/opportunities/search') return ok({ opportunities: crm.openOpp ? [{ id: 'o1', pipelineId: 'z39DlXlHDKhSdPpo4FUz', contactId: crm.existingContact || 'c-new' }] : [] });
  return ok({});
};
const reset = () => { calls = []; crm.existingContact = null; crm.openOpp = false; };
const logs = [];
console.log = ((orig) => (...a) => { logs.push(a.join(' ')); if (!String(a[0]).startsWith('{"evt"')) orig(...a); })(console.log);

const mod = await import('../netlify/functions/contractor-demo.mjs');
const handler = mod.default;
let n = 0;
const uid = () => `test-submission-${Date.now()}-${n++}-abcdef`;
const body = (over = {}) => ({
  submissionId: uid(), firstName: 'Jordan', lastName: 'Test', phone: `+1508555${String(1000 + n).slice(-4)}`,
  email: '', service: 'Painting', description: 'Repaint two bedrooms', consent: { agreed: false },
  bot_field: '', elapsedMs: 9000, ...over,
});
let ipN = 0;
const post = (b, ip) => handler(new Request('http://x/api/contractor-demo', { method: 'POST', body: JSON.stringify(b) }), { ip: ip || `10.1.0.${ipN++}` });
const get = () => handler(new Request('http://x/api/contractor-demo', { method: 'GET' }), {});
const consent = { agreed: true, text: 'I agree to receive text messages from Ironweb Digital Growth', timestamp: new Date().toISOString() };
const statuses = (j) => Object.fromEntries(j.events.map((e) => [e.key, e.status]));

let pass = 0;
const test = async (name, fn) => { await fn(); pass++; console.log('ok', name); };

await test('GET config: preview by default, receptionist hidden, no secrets', async () => {
  setEnv({ GHL_API_KEY: 'secret-key', GHL_LOCATION_ID: 'loc-123', CONTRACTOR_DEMO_RECEPTIONIST_NUMBER: '+15085550100' });
  const j = await (await get()).json();
  assert.equal(j.config.mode, 'preview');
  assert.deepEqual(j.config.receptionist, { enabled: false });
  assert.equal(j.config.bookingUrl, 'https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo', 'default booking calendar');
  const raw = JSON.stringify(j);
  assert.ok(!/secret-key|loc-123|5085550100/.test(raw));
});

await test('GET config: non-https booking override is ignored (falls back to the default)', async () => {
  setEnv({ CONTRACTOR_DEMO_BOOKING_URL: 'javascript:alert(1)' });
  assert.equal((await (await get()).json()).config.bookingUrl, 'https://api.leadconnectorhq.com/widget/bookings/ironweb-contractor-demo');
});

await test('GET config: receptionist shown only when enabled with a valid number', async () => {
  setEnv({ CONTRACTOR_DEMO_RECEPTIONIST_ENABLED: 'true', CONTRACTOR_DEMO_RECEPTIONIST_NUMBER: '+15085550100', CONTRACTOR_DEMO_BOOKING_URL: 'https://example.com/book' });
  const j = await (await get()).json();
  assert.deepEqual(j.config.receptionist, { enabled: true, tel: '+15085550100', display: '(508) 555-0100' });
  assert.equal(j.config.bookingUrl, 'https://example.com/book');
  setEnv({ CONTRACTOR_DEMO_RECEPTIONIST_ENABLED: 'true', CONTRACTOR_DEMO_RECEPTIONIST_NUMBER: 'not-a-number' });
  assert.deepEqual((await (await get()).json()).config.receptionist, { enabled: false });
});

await test('live flag without CRM credentials stays in preview', async () => {
  setEnv({ CONTRACTOR_DEMO_LIVE: 'true' });
  calls = [];
  const j = await (await post(body())).json();
  assert.equal(j.mode, 'preview');
  assert.equal(calls.length, 0);
});

await test('preview: validates, makes no CRM calls, everything behind the scenes is simulated', async () => {
  setEnv();
  calls = [];
  const r = await post(body({ consent }));
  const j = await r.json();
  assert.equal(r.status, 200);
  assert.equal(j.mode, 'preview');
  assert.equal(calls.length, 0);
  assert.deepEqual(statuses(j), { submitted: 'confirmed', contact: 'simulated', opportunity: 'simulated', sms: 'simulated', owner_alert: 'simulated' });
});

await test('preview: no consent => sms skipped (not opted in)', async () => {
  setEnv();
  const j = await (await post(body())).json();
  assert.equal(statuses(j).sms, 'skipped');
});

await test('validation: required fields, phone, service list, optional email', async () => {
  setEnv();
  const r = await post(body({ firstName: '', lastName: '', phone: '555', service: 'Plumbing', description: '', email: 'bad@' }));
  assert.equal(r.status, 400);
  const e = (await r.json()).errors;
  for (const k of ['firstName', 'lastName', 'phone', 'service', 'description', 'email']) assert.ok(e[k], k);
  assert.equal((await post(body({ email: 'jordan@example.com.' }))).status, 200, 'trailing dot trimmed');
});

await test('incomplete consent record rejected', async () => {
  setEnv();
  assert.equal((await post(body({ consent: { agreed: true, text: '', timestamp: 'x' } }))).status, 400);
});

await test('spam: honeypot and too-fast submissions dropped without CRM calls', async () => {
  setEnv(LIVE);
  calls = [];
  await post(body({ bot_field: 'x' }));
  await post(body({ elapsedMs: 200 }));
  assert.equal(calls.length, 0);
});

const seq = () => calls.map((c) => `${c.method} ${c.path}`);
const tagCalls = () => calls.filter((c) => c.path.endsWith('/tags')).map((c) => c.body.tags);

await test('live, new contact, no workflows: create contact, lowercase isolation tag, note, New Lead opportunity; NO trigger', async () => {
  setEnv(LIVE); reset(); mod.resetStageCache();
  const j = await (await post(body({ consent }))).json();
  assert.equal(j.mode, 'live');
  assert.deepEqual(seq(), ['GET /contacts/search/duplicate', 'POST /contacts/', 'POST /contacts/c-new/tags', 'POST /contacts/c-new/notes',
    'GET /opportunities/search', 'GET /opportunities/pipelines', 'POST /opportunities/']);
  assert.deepEqual(tagCalls(), [['iw-contractor-demo', 'iw-contractor-demo-sms-consent']]);
  assert.equal(calls[1].body.source, 'Website - Contractor Demo');
  const opp = calls.find((c) => c.path === '/opportunities/');
  assert.equal(opp.body.pipelineId, 'z39DlXlHDKhSdPpo4FUz');
  assert.equal(opp.body.pipelineStageId, 'stage-new');
  assert.equal(opp.body.contactId, 'c-new');
  assert.equal(calls.find((c) => c.path === '/opportunities/search').query.pipeline_id, 'z39DlXlHDKhSdPpo4FUz');
  // Search takes snake_case params only under the 2021-07-28 contract (v3 answered 422 in the first live test).
  for (const c of calls.filter((x) => x.path.startsWith('/opportunities'))) assert.equal(c.version, '2021-07-28', c.path);
  for (const c of calls.filter((x) => x.path.startsWith('/contacts'))) assert.equal(c.version, 'v3', c.path);
  assert.ok(/SMS consent: YES/.test(calls[3].body.body));
  const s = statuses(j);
  assert.equal(s.contact, 'confirmed');
  assert.equal(s.opportunity, 'confirmed');
  assert.equal(s.sms, 'pending', 'new opportunity hands a consenting lead to DEMO - 01: pending, never sent');
  assert.equal(s.owner_alert, 'simulated', 'DEMO - 0 owner alert does not fire on opportunity creation');
});

const idx = (pred) => calls.findIndex(pred);
for (const existing of [null, 'c-old']) {
  await test(`ORDER (${existing ? 'existing' : 'new'} contact): BOTH demo tags are applied before the opportunity is created`, async () => {
    setEnv(LIVE); reset(); mod.resetStageCache(); crm.existingContact = existing;
    await post(body({ consent }));
    const tagI = idx((c) => c.path.endsWith('/tags') && c.body.tags.includes('iw-contractor-demo') && c.body.tags.includes('iw-contractor-demo-sms-consent'));
    const oppI = idx((c) => c.method === 'POST' && c.path === '/opportunities/');
    assert.ok(tagI >= 0, 'both tags applied in one call');
    assert.ok(oppI > tagI, `opportunity (${oppI}) must come after the tags (${tagI})`);
    assert.ok(!calls.slice(0, tagI).some((c) => c.path.startsWith('/opportunities')), 'no opportunity call before tagging');
  });
}

await test('reused opportunity: DEMO - 01 not re-triggered, so the text is reported as simulated', async () => {
  setEnv(LIVE); reset(); crm.existingContact = 'c-old'; crm.openOpp = true;
  const s = statuses(await (await post(body({ consent }))).json());
  assert.equal(s.sms, 'simulated');
  assert.equal(s.owner_alert, 'simulated');
});

await test('live, EXISTING contact: no create/update (name + source untouched); only tags, note, opportunity', async () => {
  setEnv(LIVE); reset(); crm.existingContact = 'c-old';
  await post(body({ email: 'jordan@example.com' }));
  assert.ok(!calls.some((c) => c.path === '/contacts/' || c.path === '/contacts/upsert' || (c.method === 'PUT' && c.path.startsWith('/contacts/'))));
  const dup = calls.find((c) => c.path === '/contacts/search/duplicate');
  assert.equal(dup.query.email, 'jordan@example.com');
  assert.ok(dup.query.number.startsWith('+1'));
  assert.deepEqual(tagCalls(), [['iw-contractor-demo']]);
  assert.ok(calls.some((c) => c.path === '/contacts/c-old/notes'));
  assert.equal(calls.find((c) => c.path === '/opportunities/').body.contactId, 'c-old');
});

await test('live: an open demo opportunity is reused, not duplicated', async () => {
  setEnv(LIVE); reset(); crm.existingContact = 'c-old'; crm.openOpp = true;
  const j = await (await post(body())).json();
  assert.ok(!calls.some((c) => c.path === '/opportunities/' && c.method === 'POST'));
  assert.equal(j.events.find((e) => e.key === 'opportunity').detail, 'existing');
});

await test('live: New Lead stage id looked up once and cached; env override skips the lookup', async () => {
  setEnv(LIVE); reset(); mod.resetStageCache();
  await post(body()); await post(body());
  assert.equal(calls.filter((c) => c.path === '/opportunities/pipelines').length, 1);
  setEnv({ ...LIVE, CONTRACTOR_DEMO_NEW_LEAD_STAGE_ID: 'stage-env' }); reset(); mod.resetStageCache();
  await post(body());
  assert.equal(calls.filter((c) => c.path === '/opportunities/pipelines').length, 0);
  assert.equal(calls.find((c) => c.path === '/opportunities/').body.pipelineStageId, 'stage-env');
});

await test('live: missing New Lead stage => 502, nothing claimed', async () => {
  setEnv(LIVE); reset(); mod.resetStageCache(); crm.stages = [{ id: 's', name: 'Contacted' }];
  const r = await post(body());
  crm.stages = [{ id: 'stage-new', name: 'New Lead' }];
  mod.resetStageCache();
  assert.equal(r.status, 502);
});

await test('live + workflows + consent: isolation tags strictly BEFORE trigger tag, which comes last', async () => {
  setEnv({ ...LIVE, CONTRACTOR_DEMO_TRIGGER_WORKFLOWS: 'true' }); reset(); mod.resetStageCache();
  const j = await (await post(body({ consent }))).json();
  assert.deepEqual(tagCalls(), [['iw-contractor-demo', 'iw-contractor-demo-sms-consent'], ['new lead - website']]);
  assert.equal(seq().at(-1), 'POST /contacts/c-new/tags', 'trigger is the final call, after the opportunity exists');
  const s = statuses(j);
  assert.equal(s.sms, 'pending');
  assert.equal(s.owner_alert, 'pending');
  assert.equal(s.opportunity, 'confirmed');
});

await test('live + workflows WITHOUT consent: never adds the trigger tag (workflow could text)', async () => {
  setEnv({ ...LIVE, CONTRACTOR_DEMO_TRIGGER_WORKFLOWS: 'true' }); reset();
  const j = await (await post(body())).json();
  assert.ok(!tagCalls().flat().includes('new lead - website'));
  assert.deepEqual(tagCalls(), [['iw-contractor-demo']]);
  assert.equal(statuses(j).sms, 'skipped');
});

await test('CRM failure => 502, nothing claimed', async () => {
  setEnv(LIVE); reset();
  failOn = '/contacts/search';
  const r = await post(body());
  failOn = null;
  assert.equal(r.status, 502);
  const j = await r.json();
  assert.equal(j.code, 'crm_failed');
  assert.equal(j.step, 'contact_search');
  assert.equal(j.partial, false, 'nothing written before the failure');
});

await test('CRM failure after the contact exists => partial, failing step and scrubbed CRM message logged', async () => {
  setEnv(LIVE); reset(); mod.resetStageCache();
  failOn = '/opportunities/search';
  const errs = [];
  const origErr = console.error; console.error = (...a) => errs.push(a.join(' '));
  const r = await post(body({ email: 'jordan@example.com' }));
  console.error = origErr; failOn = null;
  const j = await r.json();
  assert.equal(r.status, 502);
  assert.equal(j.step, 'opportunity_search');
  assert.equal(j.partial, true);
  const line = JSON.parse(errs.find((l) => l.startsWith('{"evt"')));
  assert.equal(line.step, 'opportunity_search');
  assert.equal(line.status, 500);
  assert.equal(line.crm, 'nope');
  assert.ok(!/jordan|508555/i.test(errs.join(' ')), 'no PII in error logs');
});

await test('duplicate submission id returns the first result without new CRM calls', async () => {
  setEnv(LIVE);
  const b = body();
  await post(b);
  calls = [];
  const j = await (await post({ ...b, phone: '+15085559999' })).json();
  assert.equal(j.duplicate, true);
  assert.equal(calls.length, 0);
});

await test('same phone within 2 minutes is treated as a duplicate', async () => {
  setEnv(LIVE);
  await post(body({ phone: '+15085557777' }));
  calls = [];
  const j = await (await post(body({ phone: '+15085557777' }))).json();
  assert.equal(j.duplicate, true);
  assert.equal(calls.length, 0);
});

await test('rate limit per IP', async () => {
  setEnv();
  let last;
  for (let i = 0; i < 7; i++) last = await post(body(), '10.9.9.9');
  assert.equal(last.status, 429);
});

await test('logs are structured and contain no personal data', async () => {
  const demoLogs = logs.filter((l) => l.startsWith('{"evt":"contractor_demo"'));
  assert.ok(demoLogs.length > 0);
  for (const l of demoLogs) assert.ok(!/Jordan|Test|508555|Repaint|example\.com/.test(l), l);
});

console.log(`\n${pass} passed`);
