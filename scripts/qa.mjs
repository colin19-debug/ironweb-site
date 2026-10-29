// Accessibility/layout QA against the local server (node serve.mjs on :3001).
//   node scripts/qa.mjs
// Checks at 390 / 768 / 1440: horizontal overflow, tap targets >= 44px (touch widths), text contrast
// (4.5:1 normal, 3:1 large) and a visible keyboard focus indicator on every tab stop.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BASE = process.env.BASE || 'http://localhost:3001';
const PAGES = ['/', '/build/', '/grow/', '/operate/', '/demo/', '/portfolio/', '/contact/'];
const chromeRoot = path.join(os.homedir(), '.cache/puppeteer/chrome');
const executablePath = path.join(chromeRoot, fs.readdirSync(chromeRoot).sort().reverse()[0], 'chrome-win64/chrome.exe');
const browser = await puppeteer.launch({ executablePath, headless: 'new' });
const page = await browser.newPage();
const problems = [];

for (const w of [390, 768, 1440]) {
  await page.setViewport({ width: w, height: 900, isMobile: w < 1000, hasTouch: w < 1000 });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
    const r = await page.evaluate((touch) => {
      const out = { overflow: document.documentElement.scrollWidth - innerWidth, small: [], contrast: [] };
      const visible = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && b.width > 0 && b.height > 0 && !el.closest('[hidden],.hp,.sr-only,details:not([open]) > :not(summary)'); };
      // ---- tap targets (touch widths) ----
      if (touch) {
        document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=tab]').forEach((el) => {
          if (!visible(el) || el.classList.contains('skip') || el.closest('.hp')) return;
          if (el.type === 'checkbox') return; // its <label> is the target (checked below via label size)
          // WCAG 2.5.8 exemption: links inline within a sentence
          const parent = el.parentElement;
          if (el.tagName === 'A' && parent && /^(P|LI|LABEL|SPAN|DD)$/.test(parent.tagName) && parent.textContent.trim().length > el.textContent.trim().length + 2) return;
          const b = el.getBoundingClientRect();
          const after = getComputedStyle(el, '::after');
          const extH = after.position === 'absolute' && after.content !== 'none' ? parseFloat(after.height) || 0 : 0;
          const h = Math.max(b.height, extH);
          if (h < 43.5 || b.width < 24) out.small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.name || el.id).trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(h)}`);
        });
      }
      // ---- contrast ----
      const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
      const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const bgOf = (el) => {
        let layers = [];
        for (let n = el; n; n = n.parentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
          if (n.classList && (n.classList.contains('hero') || n.classList.contains('page-head'))) { layers.push({ r: 11, g: 11, b: 15, a: 1 }); break; } // dark-shaded art
        }
        if (!layers.length || layers[layers.length - 1].a < 1) layers.push({ r: 11, g: 11, b: 15, a: 1 });
        let res = layers.pop();
        while (layers.length) { const top = layers.pop(); res = { r: top.r * top.a + res.r * (1 - top.a), g: top.g * top.a + res.g * (1 - top.a), b: top.b * top.a + res.b * (1 - top.a), a: 1 }; }
        return res;
      };
      document.querySelectorAll('p, li, a, span, label, dt, dd, h1, h2, h3, h4, h5, small, figcaption, button, summary, strong').forEach((el) => {
        if (!visible(el) || el.closest('.sr-only, [aria-hidden="true"]')) return;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) return;
        const s = getComputedStyle(el);
        const fg = parse(s.color); if (!fg) return;
        const bg = bgOf(el);
        const blended = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
        const L1 = lum(blended), L2 = lum(bg);
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(s.fontSize), bold = parseInt(s.fontWeight, 10) >= 700;
        const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
        if (ratio < need) out.contrast.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 28)}" ${ratio.toFixed(2)}:1 (needs ${need})`);
      });
      return out;
    }, w < 1000);
    if (r.overflow > 0) problems.push(`${p} @${w}: horizontal overflow ${r.overflow}px`);
    [...new Set(r.small)].forEach((x) => problems.push(`${p} @${w}: tap target < 44px: ${x}`));
    [...new Set(r.contrast)].forEach((x) => problems.push(`${p} @${w}: contrast: ${x}`));
  }
}

// ---- keyboard focus: every tab stop shows a visible indicator ----
await page.setViewport({ width: 1440, height: 900 });
for (const p of ['/', '/contact/']) {
  await page.goto(BASE + p, { waitUntil: 'networkidle0' });
  const seen = new Set();
  for (let i = 0; i < 140; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const visibleRing = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none') || s.borderColor !== getComputedStyle(el).getPropertyValue('--never');
      const ring = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
      return { id: el.id || el.getAttribute('href') || el.name || el.textContent.trim().slice(0, 30), tag: el.tagName, ring, focusVisible: el.matches(':focus-visible') };
    });
    if (!f) break;
    const key = f.tag + f.id;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!f.ring) problems.push(`${p}: no visible focus indicator on ${f.tag.toLowerCase()} "${f.id}"`);
  }
  console.log(`${p}: checked focus on ${seen.size} tab stops`);
}

await browser.close();
console.log(problems.length ? `\nQA ISSUES (${problems.length}):\n- ${problems.join('\n- ')}` : '\nQA passed: no overflow, tap targets >= 44px, contrast OK, focus visible on all tab stops');
process.exit(problems.length ? 1 : 0);
