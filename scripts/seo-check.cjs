"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SITE_ORIGIN = "https://landscapecalcpro.com";
const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const pages = [
  { file: "index.html", path: "/", h1: "Calculators for gravel, mulch, topsoil, and sod", title: "Gravel, Mulch, Topsoil, and Sod Calculators", calculator: false, breadcrumb: false },
  { file: "gravel-calculator/index.html", path: "/gravel-calculator/", h1: "Gravel Calculator", title: "Gravel Calculator: Cubic Yards, Tons, and Bags", calculator: true },
  { file: "mulch-calculator/index.html", path: "/mulch-calculator/", h1: "Mulch Calculator", title: "Mulch Calculator: Cubic Yards and Bags", calculator: true },
  { file: "topsoil-calculator/index.html", path: "/topsoil-calculator/", h1: "Topsoil Calculator", title: "Topsoil Calculator: Cubic Yards, Tons, and Bags", calculator: true },
  { file: "sod-calculator/index.html", path: "/sod-calculator/", h1: "Sod Calculator", title: "Sod Calculator: Square Feet, Pallets, and Rolls", calculator: true },
  { file: "about/index.html", path: "/about/", h1: "About", title: "About This US Landscaping Calculator", calculator: false },
  { file: "contact/index.html", path: "/contact/", h1: "Contact", title: "Contact Abdul Rauf | Landscaping Calculators", calculator: false },
  { file: "methodology/index.html", path: "/methodology/", h1: "Methodology", title: "Formulas and Densities | Landscaping Calculators", calculator: false },
  { file: "privacy/index.html", path: "/privacy/", h1: "Privacy", title: "Privacy Notice | Landscaping Calculators", calculator: false },
  { file: "terms/index.html", path: "/terms/", h1: "Terms", title: "Terms of Use | Landscaping Calculators", calculator: false },
  { file: "disclaimer/index.html", path: "/disclaimer/", h1: "Disclaimer", title: "Disclaimer | Landscaping Calculators", calculator: false },
];

function fail(message) {
  console.error("SEO check failed: " + message);
  process.exitCode = 1;
}

function decode(value) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function jsonLdNodes(html, file) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const nodes = [];
  let match;
  while ((match = re.exec(html))) {
    let data;
    try {
      data = JSON.parse(match[1]);
    } catch (error) {
      fail(file + " has invalid JSON-LD: " + error.message);
      return [];
    }
    const graph = data["@graph"] || [data];
    graph.forEach(function (node) {
      nodes.push(node);
    });
  }
  if (!nodes.length) fail(file + " has no JSON-LD");
  return nodes;
}

function typesOf(node) {
  const value = node["@type"];
  return Array.isArray(value) ? value : [value];
}

function findType(nodes, type) {
  return nodes.filter(function (node) {
    return typesOf(node).indexOf(type) !== -1;
  });
}

function breadcrumbNames(html) {
  const start = html.indexOf('aria-label="Breadcrumb"');
  if (start === -1) return [];
  const chunk = html.slice(start).split("</nav>")[0];
  const names = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/g;
  let match;
  while ((match = re.exec(chunk))) names.push(decode(match[1]));
  return names;
}

function guideH2s(html) {
  const start = html.indexOf('class="prose guide"');
  if (start === -1) return [];
  const chunk = html.slice(start);
  const names = [];
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let match;
  while ((match = re.exec(chunk))) names.push(decode(match[1]));
  return names;
}

function howToSteps(html) {
  const start = html.indexOf('class="howto"');
  if (start === -1) return [];
  const chunk = html.slice(start).split("</ol>")[0];
  const steps = [];
  const re = /<li>([\s\S]*?)<\/li>/g;
  let match;
  while ((match = re.exec(chunk))) steps.push(decode(match[1]));
  return steps;
}

function faqPairs(html) {
  const start = html.indexOf('id="faq"');
  if (start === -1) return [];
  const chunk = html.slice(start).split("</section>")[0];
  const pairs = [];
  const re = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = re.exec(chunk))) {
    pairs.push({ question: decode(match[1]), answer: decode(match[2]) });
  }
  return pairs;
}

const forbiddenHost = "example" + ".com";

function mentionsPlaceholderHost(text) {
  return text.toLowerCase().includes(forbiddenHost);
}

function walkForExample(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkForExample(full);
      continue;
    }
    if (!/\.(astro|ts|js|cjs|mjs|json|jsonc|md|txt|css|html)$/.test(entry.name)) continue;
    const text = fs.readFileSync(full, "utf8");
    if (mentionsPlaceholderHost(text)) fail(path.relative(rootDir, full) + " still mentions the placeholder host");
  }
}

async function main() {
  if (!fs.existsSync(distDir)) {
    fail("dist/ is missing. Run npm run build before npm run seo.");
    return;
  }

  const { redirectTarget } = await import("../worker.js");
  const redirects = [
    ["http://www.landscapecalcpro.com/gravel-calculator/?x=1", "https://landscapecalcpro.com/gravel-calculator/?x=1"],
    ["https://www.landscapecalcpro.com/sod-calculator/", "https://landscapecalcpro.com/sod-calculator/"],
    ["https://WWW.landscapecalcpro.com./", "https://landscapecalcpro.com/"],
  ];
  redirects.forEach(function (pair) {
    if (redirectTarget(pair[0]) !== pair[1]) {
      fail("www redirect for " + pair[0] + " was " + redirectTarget(pair[0]));
    }
  });
  ["https://landscapecalcpro.com/mulch-calculator/", "http://landscapecalcpro.com/", "https://landscape-calculators.example.workers.dev/", "https://pr-1.landscape-calculators.workers.dev/about/"].forEach(function (url) {
    if (redirectTarget(url) !== null) fail(url + " should not redirect");
  });

  const titles = [];
  const descriptions = [];

  pages.forEach(function (page) {
    const filePath = path.join(distDir, page.file);
    if (!fs.existsSync(filePath)) {
      fail("missing built page " + page.file);
      return;
    }
    const html = fs.readFileSync(filePath, "utf8");
    const canonical = SITE_ORIGIN + page.path;
    if (mentionsPlaceholderHost(html)) fail(page.file + " still mentions the placeholder host");
    if (html.indexOf('lang="en-US"') === -1) fail(page.file + " is missing lang en-US");
    if (html.indexOf('name="viewport"') === -1) fail(page.file + " is missing a viewport meta");
    if (html.indexOf("<title>" + page.title + "</title>") === -1) fail(page.file + " title does not match " + page.title);
    titles.push(page.title);
    const descriptionMatch = html.match(/name="description" content="([^"]*)"/);
    if (!descriptionMatch || descriptionMatch[1].length < 50 || descriptionMatch[1].length > 180) {
      fail(page.file + " description is missing or outside 50–180 characters: " + (descriptionMatch ? descriptionMatch[1].length : "none"));
    } else {
      descriptions.push(descriptionMatch[1]);
    }
    if (html.indexOf('rel="canonical" href="' + canonical + '"') === -1) fail(page.file + " canonical is not " + canonical);
    if (html.indexOf('property="og:url" content="' + canonical + '"') === -1) fail(page.file + " og:url is not " + canonical);
    if (html.indexOf('property="og:title"') === -1 || html.indexOf('name="twitter:card"') === -1) {
      fail(page.file + " is missing Open Graph or Twitter card tags");
    }
    const h1s = html.match(/<h1[\s>]/g) || [];
    if (h1s.length !== 1 || html.indexOf("<h1>" + page.h1 + "</h1>") === -1) {
      fail(page.file + " should have one h1 reading " + page.h1);
    }

    const nodes = jsonLdNodes(html, page.file);
    nodes.forEach(function (node) {
      typesOf(node).forEach(function (type) {
        if (type === "Organization" || type === "AggregateRating" || type === "Review") {
          fail(page.file + " includes unsupported structured data type " + type);
        }
      });
      if (node.telephone || node.streetAddress || (node.address && node.address.streetAddress)) {
        fail(page.file + " invents a phone number or street address");
      }
    });

    if (page.breadcrumb !== false) {
      const crumbs = findType(nodes, "BreadcrumbList");
      if (crumbs.length !== 1) {
        fail(page.file + " should have one BreadcrumbList");
      } else {
        const visible = breadcrumbNames(html);
        const marked = (crumbs[0].itemListElement || []).map(function (item) { return item.name; });
        if (visible.join("|") !== marked.join("|")) {
          fail(page.file + " breadcrumb mismatch. Visible: " + visible.join(" > ") + ". JSON-LD: " + marked.join(" > "));
        }
        (crumbs[0].itemListElement || []).forEach(function (item) {
          if (String(item.item || "").indexOf(SITE_ORIGIN) !== 0) fail(page.file + " breadcrumb item is not on the live origin");
        });
      }
    }

    if (page.calculator) {
      const h1At = html.indexOf("<h1>");
      const h1End = html.indexOf("</h1>");
      const calc = html.indexOf("data-calculator=");
      const answerAt = html.indexOf('class="answer"');
      if (!(html.indexOf("United States") !== -1 && html.indexOf("United States") < h1At)) {
        fail(page.file + " is missing the US line above the heading");
      }
      if (!(h1End !== -1 && h1End < calc && calc < answerAt)) {
        fail(page.file + " should place the calculator directly under the heading, then the answer");
      }
      if (/<p[\s>]/.test(html.slice(h1End, calc))) {
        fail(page.file + " has a paragraph between the heading and the calculator");
      }
      const answerMatch = html.match(/<p class="answer">([\s\S]*?)<\/p>/);
      if (!answerMatch) fail(page.file + " is missing the direct answer paragraph");
      else {
        const count = wordCount(decode(answerMatch[1]));
        if (count < 40 || count > 60) fail(page.file + " answer paragraph is " + count + " words, expected 40–60");
      }
      const headings = guideH2s(html);
      if (!headings.length || headings.some(function (heading) { return !heading.endsWith("?"); })) {
        fail(page.file + " guide headings should be questions: " + headings.join(" | "));
      }
      const apps = findType(nodes, "WebApplication");
      if (apps.length !== 1 || typesOf(apps[0]).indexOf("SoftwareApplication") === -1) {
        fail(page.file + " needs one WebApplication that is also a SoftwareApplication");
      } else if (!apps[0].offers || apps[0].offers.price !== "0" || apps[0].offers.priceCurrency !== "USD" || apps[0].isAccessibleForFree !== true) {
        fail(page.file + " application offer is not free USD");
      }
      const steps = howToSteps(html);
      const howtos = findType(nodes, "HowTo");
      const markedSteps = howtos[0] ? (howtos[0].step || []).map(function (step) { return step.text; }) : [];
      if (howtos.length !== 1 || markedSteps.join("|") !== steps.join("|")) {
        fail(page.file + " HowTo steps do not match the visible list");
      }
      const faqs = faqPairs(html);
      const faqNodes = findType(nodes, "FAQPage");
      const markedFaqs = faqNodes[0] ? (faqNodes[0].mainEntity || []).map(function (item) { return item.name + "||" + item.acceptedAnswer.text; }) : [];
      const visibleFaqs = faqs.map(function (item) { return item.question + "||" + item.answer; });
      if (!faqs.length || faqNodes.length !== 1 || markedFaqs.join("\n") !== visibleFaqs.join("\n")) {
        fail(page.file + " FAQPage does not match the visible questions");
      }
    }

    if (page.file === "index.html" && findType(nodes, "WebSite").length !== 1) fail("home page should have one WebSite node");
    if (page.file !== "index.html" && findType(nodes, "WebSite").length) fail(page.file + " should not repeat the WebSite node");
  });

  if (new Set(titles).size !== titles.length) fail("titles are not unique");
  if (new Set(descriptions).size !== descriptions.length) fail("meta descriptions are not unique");

  ["about/index.html", "contact/index.html"].forEach(function (file) {
    const html = fs.readFileSync(path.join(distDir, file), "utf8");
    const people = findType(jsonLdNodes(html, file), "Person");
    if (people.length !== 1 || people[0].name !== "Abdul Rauf" || people[0].email !== "r.rauf.rai@gmail.com") {
      fail(file + " Person structured data does not match Abdul Rauf and the public email");
    }
    const visible = decode(html.split("</head>")[1] || "");
    if (visible.indexOf("Abdul Rauf") === -1 || visible.indexOf("r.rauf.rai@gmail.com") === -1) {
      fail(file + " does not show the owner name and email");
    }
    if (file === "contact/index.html" && /<form[\s>]/i.test(html)) fail("contact page should not include a form");
  });

  const robots = fs.readFileSync(path.join(distDir, "robots.txt"), "utf8");
  if (robots.indexOf("Sitemap: " + SITE_ORIGIN + "/sitemap-index.xml") === -1) fail("robots.txt sitemap line is wrong");
  if (mentionsPlaceholderHost(robots)) fail("robots.txt mentions the placeholder host");

  const sitemap = fs.readFileSync(path.join(distDir, "sitemap-0.xml"), "utf8");
  pages.forEach(function (page) {
    if (sitemap.indexOf("<loc>" + SITE_ORIGIN + page.path + "</loc>") === -1) fail("sitemap is missing " + page.path);
  });
  if ((sitemap.match(/<loc>/g) || []).length !== pages.length) fail("sitemap should list only the public pages");
  if (sitemap.includes("404") || mentionsPlaceholderHost(sitemap)) fail("sitemap includes a page that should stay out, or the placeholder host");

  const missing = fs.readFileSync(path.join(distDir, "404.html"), "utf8");
  if (missing.indexOf('content="noindex, follow"') === -1 || missing.indexOf('rel="canonical"') !== -1) {
    fail("404.html should be noindex and should not declare a canonical");
  }

  ["README.md", "worker.js", "wrangler.jsonc", "package.json"].forEach(function (name) {
    if (fs.existsSync(path.join(distDir, name))) fail("dist should not contain " + name);
  });

  walkForExample(rootDir);

  if (!process.exitCode) console.log("SEO checks passed for " + pages.length + " pages. Live origin: " + SITE_ORIGIN);
}

main();
