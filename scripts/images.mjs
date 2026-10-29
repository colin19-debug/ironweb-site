// Generates every web image in /site/assets/img from the approved sources.
// Run after replacing a source: node scripts/images.mjs
//   ironweb-hero-sharp-source.png   approved hero background (sharp, unblurred; never blur it)
//   ironweb-header-logo.svg         header logo
//   ironweb-favicon.svg             favicon mark
//   brand_assets/work-captures/*    homepage captures of live client sites (scripts/capture-work.mjs)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (p) => path.join(root, 'site/assets', p);
const HERO = path.join(root, 'ironweb-hero-sharp-source.png');

fs.mkdirSync(out('img/work'), { recursive: true });

// Hero, desktop: full frame at native width (1672px is the largest the source allows).
for (const w of [1672, 1200, 800]) {
  const img = sharp(HERO).resize({ width: w });
  await img.clone().webp({ quality: 88, smartSubsample: true }).toFile(out(`img/hero-${w}.webp`));
  await img.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(out(`img/hero-${w}.jpg`));
}
// Hero, mobile: crop around the web's hub so it reads at portrait widths.
const mobileCrop = { left: 600, top: 0, width: 1072, height: 941 };
for (const w of [1072, 720]) {
  const img = sharp(HERO).extract(mobileCrop).resize({ width: w });
  await img.clone().webp({ quality: 86 }).toFile(out(`img/hero-mobile-${w}.webp`));
  await img.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(out(`img/hero-mobile-${w}.jpg`));
}
// Homepage hero background (2026-10-12): IW processor / circuit-web art. New file names so the 7-day
// asset cache can't serve the old rebar image. Overlay is applied in CSS, the image itself stays unedited.
const CHIP = path.join(root, 'brand_assets/IW laser engraving on a processor.png');
for (const w of [1860, 1200, 800]) {
  await sharp(CHIP).resize({ width: w }).jpeg({ quality: 86, mozjpeg: true }).toFile(out(`img/hero-chip-${w}.jpg`));
}
// Mobile: crop centred on the IW chip (x≈1260 of 1860).
for (const w of [962, 720]) {
  await sharp(CHIP).extract({ left: 780, top: 0, width: 962, height: 845 }).resize({ width: w }).jpeg({ quality: 84, mozjpeg: true }).toFile(out(`img/hero-chip-mobile-${w}.jpg`));
}

// Inner-page header strip.
await sharp(HERO).extract({ left: 500, top: 120, width: 1172, height: 560 }).resize({ width: 1172 })
  .webp({ quality: 82 }).toFile(out('img/page-head.webp'));

// Logo and favicon (copied untouched) + PNG fallbacks.
fs.copyFileSync(path.join(root, 'ironweb-header-logo.svg'), out('img/ironweb-logo.svg'));
fs.copyFileSync(path.join(root, 'ironweb-favicon.svg'), path.join(root, 'site/favicon.svg'));
const fav = fs.readFileSync(path.join(root, 'ironweb-favicon.svg'));
await sharp(fav, { density: 300 }).resize(32, 32).png().toFile(path.join(root, 'site/favicon-32.png'));
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#0B0B0F' } })
  .composite([{ input: await sharp(fav, { density: 600 }).resize(140, 140).png().toBuffer(), gravity: 'center' }])
  .png().toFile(path.join(root, 'site/apple-touch-icon.png'));

// Open Graph image: hero art + logo on the dark side. Social previews only, never the page hero.
const logo = await sharp(fs.readFileSync(path.join(root, 'ironweb-header-logo.svg')), { density: 300 })
  .resize({ width: 560 }).png().toBuffer();
const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0B0B0F" stop-opacity=".96"/>
  <stop offset=".45" stop-color="#0B0B0F" stop-opacity=".7"/><stop offset=".7" stop-color="#0B0B0F" stop-opacity="0"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/></svg>`);
await sharp(HERO).resize(1200, 630, { fit: 'cover', position: 'right' })
  .composite([{ input: shade }, { input: logo, left: 64, top: 240 }])
  .jpeg({ quality: 86, mozjpeg: true }).toFile(out('img/og-image.jpg'));

// Portfolio previews. Captures are 1440x900; keep the top 1440x846 (16:9.4) homepage view.
const caps = path.join(root, 'brand_assets/work-captures');
for (const f of fs.readdirSync(caps).filter((f) => f.endsWith('.png'))) {
  const key = path.basename(f, '.png');
  for (const w of [960, 640]) {
    const img = sharp(path.join(caps, f)).extract({ left: 0, top: 0, width: 1440, height: 846 }).resize({ width: w });
    await img.clone().webp({ quality: 82 }).toFile(out(`img/work/${key}-${w}.webp`));
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(out(`img/work/${key}-${w}.jpg`));
  }
}
console.log('images done');
