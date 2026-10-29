# IronWeb Digital website (V2)

Static multipage site for ironwebdigital.com: HTML generated locally into `/site`, deployed as-is
to Netlify, plus one Netlify Function (`/api/lead`) that sends form submissions to the CRM.

## Preview locally

```powershell
npm install                 # once (sharp + puppeteer-core for image/screenshot scripts)
node scripts/build.mjs      # regenerate /site from src/
node serve.mjs              # http://localhost:3001  (mirrors Netlify redirects, headers, /api/lead in stub mode)
```

Checks (server running):

```powershell
node tests/lead-test.mjs                 # function vs. mock CRM
node scripts/check.mjs                   # links, overflow, nav, redirects, prices, form states
node scripts/shot.mjs compare 1440 900 "temporary screenshots/cmp.png"   # hero vs. brand board
```

## Where things live

| Path | What |
|---|---|
| `src/data.mjs` | Business facts, **prices**, portfolio, FAQ, form choices, booking URL, hero video. Edit here. |
| `src/components.mjs` | Header, hero, forms, footer and other shared pieces |
| `src/pages.mjs` | Page content |
| `site/` | Generated output + `assets/` (css, js, images). The only folder that is published. |
| `site/assets/js/demo.js` | Interactive homepage demo (illustrative businesses, simulated inquiry, no network) |
| `netlify/functions/lead.mjs`, `netlify/lib/` | Lead endpoint and CRM client (secrets via env only) |
| `netlify/functions/contractor-demo.mjs`, `site/assets/js/contractor-demo.js` | Contractor Core demo (`/contractor-demo/`); preview mode unless env flags are set |
| `scripts/images.mjs` | Regenerates every web image from the approved sources |
| `docs/INTEGRATION-CHECKLIST.md` | What's left to connect (CRM, booking, workflows, A2P) |

Approved sources in the project root: `ironweb-brand-board.png` (visual authority),
`ironweb-hero-sharp-source.png` (hero background, never blurred), `ironweb-header-logo.svg`,
`ironweb-favicon.svg`.

## Adding the hero video

1. Keep the same framing as `ironweb-hero-sharp-source.png` (web hub right of centre, dark left side).
2. Encode short, muted, looping web versions, e.g. with ffmpeg:
   ```
   ffmpeg -i kling.mp4 -an -vf "scale=1672:-2" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 site/assets/video/hero.webm
   ffmpeg -i kling.mp4 -an -vf "scale=1672:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart site/assets/video/hero.mp4
   ```
   Aim for under ~3 MB each. Remove any watermark before use.
3. In `src/data.mjs` set
   `HERO_VIDEO.sources = [{ src: '/assets/video/hero.webm', type: 'video/webm' }, { src: '/assets/video/hero.mp4', type: 'video/mp4' }]`
   and run `node scripts/build.mjs`.

The sharp still stays as poster and fallback. Video is skipped under reduced motion, removed if
the source fails, paused offscreen and when the tab is hidden, and gets a pause button.
(These behaviours were verified with a throwaway test clip on 2026-10-07.)

## Deploy

Not deployed yet. The existing production site lives in `C:\Sites\Ironweb Digital` (Netlify site
`59c7e19d-6809-4e72-ace9-1d8c1c552921`). To ship V2 to that site, link this folder
(`netlify link --id 59c7e19d-…`), set env vars, then run a **draft** deploy first
(`netlify deploy`), review, and only run `netlify deploy --prod` on Colin's instruction.
Old URLs (`/services/`, `/pricing/`, `/portfolio/*`) redirect via `netlify.toml`.

### Current hero video (2026-10-12)
Source: `brand_assets/Animatedcircuit.mp4` (7 s loop, 1424×644, audio removed). Re-encode with the bundled
`ffmpeg-static` dev dependency (`npx ffmpeg` is not needed; path = `node -e "console.log(require('ffmpeg-static'))"`):
- desktop: `-an -c:v libx264 -preset slow -crf 27 -movflags +faststart` → `site/assets/video/hero-circuit-1424.mp4` (+ VP9 `.webm`, crf 38)
- phones: same with `-vf "crop=734:644:598:0,scale=640:-2"` (crf 28) → `hero-circuit-mobile-640.mp4/.webm`
- posters: first frame of each → `site/assets/img/hero-circuit-poster-1424.jpg`, `hero-circuit-poster-mobile-640.jpg`
If the video changes, use NEW file names: `/assets/*` is cached for 7 days.
