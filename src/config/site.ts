/**
 * Public site origin. This is the only place the site URL is defined.
 * Canonical links, Open Graph URLs, the sitemap, robots.txt, and JSON-LD
 * all read `siteUrl`. No trailing slash.
 *
 * Replace it when the Cloudflare custom domain is connected, then rebuild.
 */
export const siteUrl = "https://example.com";

export const site = {
  url: siteUrl,
  name: "Yardwork",
  legalName: "Yardwork Calculators",
  tagline: "Free US calculators for gravel, mulch, topsoil, and sod.",
  description:
    "Free US landscaping calculators for gravel, mulch, topsoil, and sod. Estimate cubic yards, short tons, bags, pallets, and material cost.",
  locale: "en_US",
  language: "en-US",
  updatedLabel: "November 16, 2026",
  contact: {
    email: "contact@example.com",
    mailingAddress: "TODO: street address, city, ST 00000, United States",
  },
} as const;

/** Page URL, with a trailing slash so it matches the canonical build. */
export function pageUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/") return new URL("/", `${siteUrl}/`).href;
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return new URL(withSlash, `${siteUrl}/`).href;
}

/** File URL. Does not add a trailing slash. */
export function assetUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(path, `${siteUrl}/`).href;
}
