// Re-captures homepage screenshots of the live portfolio sites into brand_assets/work-captures/.
// Then run: node scripts/images.mjs  (crops to 1440x846 and writes web sizes)
// Never invent a capture: if a site is unreachable this reports it and leaves the old file.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { WORK } from '../src/data.mjs';

const chromeRoot = path.join(os.homedir(), '.cache/puppeteer/chrome');
const executablePath = path.join(chromeRoot, fs.readdirSync(chromeRoot).sort().reverse()[0], 'chrome-win64/chrome.exe');
const browser = await puppeteer.launch({ executablePath, headless: 'new' });
for (const w of WORK) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  try {
    const res = await page.goto(w.url, { waitUntil: 'networkidle2', timeout: 45000 });
    if (!res || !res.ok()) throw new Error(`HTTP ${res && res.status()}`);
    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: `brand_assets/work-captures/${w.key}.png` });
    console.log('captured', w.url);
  } catch (e) {
    console.error('NOT captured', w.url, e.message);
  }
  await page.close();
}
await browser.close();
