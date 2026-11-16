# Yardwork Calculators

Free, US-focused calculators for gravel, mulch, topsoil, and sod. The site is a static [Astro](https://astro.build) project aimed at search and at a later AdSense review: unique titles and descriptions, canonical URLs, Open Graph, FAQ and WebApplication structured data, a sitemap, a 404 page, and the About, methodology, privacy, terms, and contact pages reviewers expect.

The calculators run in the browser. A shared TypeScript module does the math, and the same module renders the example on each page so the numbers match the working even before JavaScript runs.

## Local development

Node.js 22.12 or newer (Astro 7).

```bash
npm install
npm test
npm run dev
```

`npm run dev` serves the site at <http://localhost:4321>. `npm run build` writes the static site to `dist/`. `npm run preview` serves that build. `npm run check` typechecks the project.

## Site URL

The public origin is one value, `siteUrl`, in [`src/config/site.ts`](src/config/site.ts). Canonical links, Open Graph URLs, JSON-LD, the sitemap, and `robots.txt` all read it. There is no trailing slash.

It is `https://example.com` until the domain is connected. Change that constant and rebuild before launch. Do not also hardcode the host anywhere else.

The contact email and mailing address live in the same file. They are placeholders and are marked TODO on the contact page. Replace them before you publish or apply for AdSense.

## Calculators

| Page | Result |
| --- | --- |
| `/gravel-calculator/` | Cubic yards, cubic feet, short tons, 0.5 cu ft bags, 50 lb bags |
| `/mulch-calculator/` | Cubic yards, 2 cu ft bags, 3 cu ft bags |
| `/topsoil-calculator/` | Cubic yards, short tons, 1 cu ft, 0.75 cu ft, and 40 lb bags. `/soil-calculator` redirects here |
| `/sod-calculator/` | Square feet, pallets, and rolls |

Each volume calculator takes a rectangle, circle, or triangle, a depth, an editable density, and a waste or compaction allowance. Optional prices estimate material cost by the yard, the short ton, or the bag. The metric switch converts the measurements you type. Order quantities stay in the US units suppliers sell.

Formulas, coverage identity (one cubic yard, one inch deep, covers 324 square feet), rounding rules, and the source for each density are on `/methodology/`.

## Cloudflare

New sites on Cloudflare should use [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), not a new Pages project. This repo is an assets-only Worker: Astro pre-renders every page, so [`wrangler.jsonc`](wrangler.jsonc) has no Worker script. It points at `./dist`, serves `404.html` for unknown URLs (`not_found_handling: "404-page"`), and uses trailing-slash HTML handling that matches the build.

`public/_headers` and `public/_redirects` are copied into the build. Headers set a strict content security policy (no third-party scripts), and they send `X-Robots-Tag: noindex` on `*.workers.dev` and `*.pages.dev` hostnames so the preview host does not compete with the domain once `siteUrl` is real.

### Deploy from your machine

```bash
npx wrangler login
npm run deploy
```

`npm run deploy` is `npm run build && wrangler deploy`. A dry run that checks the asset bundle without publishing:

```bash
npm run build
npx wrangler deploy --dry-run
```

After the first deploy, attach the domain in the Workers dashboard (Workers & Pages → the Worker → Settings → Domains & Routes), or with `routes` in `wrangler.jsonc` once the hostname exists. Then set `siteUrl` to `https://your-domain` and deploy again so the canonical host matches the domain.

### Workers Builds (deploy from GitHub)

In the Cloudflare dashboard, create a Worker connected to this repository and set:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Workers Builds’ default Node.js is new enough for Astro 7. If you override it, use Node.js 22.12 or newer. Production deploys should track `main`. Preview builds of other branches are public unless you put Cloudflare Access in front of them.

### Pages, if you already have a project

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js | 22 |

Pages serves `404.html`, `_headers`, and `_redirects` from that directory. The `wrangler.jsonc` file is unused by Pages and can stay.

### After the domain is on Cloudflare

Turn on HTTPS and, once you are sure every URL is served over TLS, consider HSTS in the zone’s SSL/TLS settings. The static headers file does not set HSTS, so a preview hostname is not pinned to HTTPS by this repo.

## Advertising placeholders

Calculator pages and the homepage reserve fixed boxes labeled Advertisement. Nothing is loaded in them. The rectangle slot is 280px tall and the banner slot is 120px tall, so a later ad of that size does not push the page down. There is no AdSense script, no `ads.txt`, and the privacy policy says ads are off until the policy is updated.

## Layout

```
src/config/site.ts          site URL, name, contact placeholders
src/lib/calc/               shared math, densities, and tests
src/components/             calculators, SEO, ad slots
src/pages/                  one route per page, plus robots.txt
public/_headers             security and cache headers
public/_redirects           /soil-calculator → /topsoil-calculator
wrangler.jsonc              Workers static assets
```

Bag and pallet counts round up. Yards, tons, and money are rounded only for display. The tests in `src/lib/calc/engine.test.ts` cover the conversions, the preset densities, both shapes, metric input, and that rounding.
