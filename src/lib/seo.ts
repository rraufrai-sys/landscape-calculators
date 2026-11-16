import { pageUrl, site } from "../config/site";
import { tools } from "../config/tools";

export interface Faq {
  question: string;
  answer: string;
}

export function calculatorJsonLd(input: {
  name: string;
  description: string;
  pathname: string;
  faqs: readonly Faq[];
}) {
  const url = pageUrl(input.pathname);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: input.name,
        url,
        description: input.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        browserRequirements:
          "Requires JavaScript to recalculate. The example result is included in the page HTML.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        isAccessibleForFree: true,
        inLanguage: "en-US",
        provider: {
          "@type": "Organization",
          name: site.legalName,
          url: `${site.url}/`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: input.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
      breadcrumb(input.name, url),
    ],
  };
}

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: site.legalName,
        url: `${site.url}/`,
        description: site.description,
        inLanguage: "en-US",
        publisher: {
          "@type": "Organization",
          name: site.legalName,
          url: `${site.url}/`,
        },
      },
      {
        "@type": "ItemList",
        name: "Landscaping calculators",
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: pageUrl(tool.href),
        })),
      },
    ],
  };
}

export function webPageJsonLd(title: string, description: string, pathname: string) {
  const url = pageUrl(pathname);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        description,
        url,
        inLanguage: "en-US",
        isPartOf: {
          "@type": "WebSite",
          name: site.legalName,
          url: `${site.url}/`,
        },
      },
      breadcrumb(title, url),
    ],
  };
}

function breadcrumb(name: string, url: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${site.url}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: url,
      },
    ],
  };
}
