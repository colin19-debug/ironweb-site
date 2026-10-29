// Generates the static HTML in /site from src/data.mjs, src/components.mjs and src/pages.mjs.
// Zero dependencies. The output is committed and deployed as-is (no build step on Netlify).
// Usage: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/data.mjs';
import { head, header, footer } from '../src/components.mjs';
import { PAGES } from '../src/pages.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = path.join(root, 'site');

for (const page of PAGES) {
  let html = `${head({
    title: page.title,
    fullTitle: page.fullTitle,
    description: page.description,
    path: page.path,
    preloadHero: page.preloadHero,
    jsonld: page.jsonld || [],
    scripts: page.scripts || [],
  })}
<body class="${page.overlayHeader ? 'page-home' : 'page-inner'}">
${header(page.path, { overlay: page.overlayHeader })}
<main id="main">
${page.body()}
</main>
${footer()}`;
  if (page.noindex) html = html.replace('content="index, follow"', 'content="noindex"');
  const file = page.file || path.join(page.path, 'index.html');
  const dest = path.join(siteDir, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html.replace(/[ \t]+$/gm, ''));
  console.log('wrote', path.relative(root, dest));
}

const indexable = PAGES.filter((p) => !p.noindex);
fs.writeFileSync(path.join(siteDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${SITE.domain}${p.path}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(siteDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
console.log('wrote site/sitemap.xml, site/robots.txt');
