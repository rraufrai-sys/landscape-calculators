/**
 * Public site origin. This is the only place the site URL is defined.
 * Canonical links, Open Graph URLs, the sitemap, robots.txt, and JSON-LD
 * all read `siteUrl`. Apex host, no www, no trailing slash.
 */
export const siteUrl = "https://landscapecalcpro.com";

export const social = [
  { name: "Pinterest", href: "https://www.pinterest.com/landscapecalcpro/" },
  { name: "YouTube", href: "https://www.youtube.com/@LandscapeCalcPro" },
  { name: "Facebook", href: "https://www.facebook.com/landscapecalcpro" },
  { name: "X", href: "https://x.com/LandscapeCalc" },
] as const;

export const site = {
  url: siteUrl,
  name: "Landscape Calc Pro",
  legalName: "Landscape Calc Pro",
  tagline: "Free US calculators for gravel, mulch, topsoil, and sod.",
  description:
    "Free US calculators for gravel, mulch, topsoil, and sod. Estimate cubic yards, short tons, bags, pallets, and a material cost from your own price.",
  locale: "en_US",
  language: "en-US",
  updatedLabel: "November 16, 2026",
  publisherName: "Abdul Rauf",
  contact: {
    email: "r.rauf.rai@gmail.com",
  },
  social,
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
