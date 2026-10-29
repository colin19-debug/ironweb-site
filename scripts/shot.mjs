// Screenshot helper for local review.
//   node scripts/shot.mjs <url> <width> <height> <out.png> [full] [dpr]
//   node scripts/shot.mjs compare <width> <height> <out.png>
// "compare" renders the home hero at the given viewport and stacks it under the brand-board hero,
// both scaled to the same width, so composition, crop and type can be compared directly.
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const chromeRoot = path.join(os.homedir(), '.cache/puppeteer/chrome');
const chromeDir = fs.readdirSync(chromeRoot).sort().reverse()[0];
const executablePath = path.join(chromeRoot, chromeDir, 'chrome-win64/chrome.exe');

const [mode, ...args] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath, headless: 'new' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

async function load(url, w, h, dpr = 1) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 300));
}

if (mode === 'compare') {
  const [w, h, out] = args;
  await load(process.env.BASE ? process.env.BASE + '/' : 'http://localhost:3001/', Number(w), Number(h));
  const box = await page.$eval('.hero', (el) => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; });
  const heroPng = await page.screenshot({ clip: { x: 0, y: 0, width: box.width, height: box.height } });
  const W = 1520;
  const board = await sharp('ironweb-brand-board.png').extract({ left: 8, top: 630, width: 1520, height: 382 }).png().toBuffer();
  const mine = await sharp(heroPng).resize({ width: W }).png().toBuffer();
  const mh = (await sharp(mine).metadata()).height;
  await sharp({ create: { width: W, height: 382 + 24 + mh, channels: 3, background: '#ff00ff' } })
    .composite([{ input: board, top: 0, left: 0 }, { input: mine, top: 406, left: 0 }])
    .png().toFile(out);
  console.log(`hero ${box.width}x${box.height} → ${out}`);
} else {
  const [w, h, out, full, dpr] = args;
  await load(mode, Number(w), Number(h), Number(dpr) || 1);
  await page.screenshot({ path: out, fullPage: full === 'full' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${out} (horizontal overflow: ${overflow}px)`);
}
if (errors.length) console.log('PAGE ERRORS:', errors);
await browser.close();
