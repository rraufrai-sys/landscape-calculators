import { pageUrl, site } from "../config/site";
import { tools } from "../config/tools";

export interface Faq {
  question: string;
  answer: string;
}

export interface HowToStep {
  text: string;
}

const personId = `${site.url}/about/#person`;

export function calculatorJsonLd(input: {
  name: string;
  description: string;
  pathname: string;
  answer: string;
  faqs: readonly Faq[];
  howTo: { name: string; steps: readonly HowToStep[] };
}) {
  const url = pageUrl(input.pathname);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        name: input.name,
        url,
        description: input.answer,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web browser",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        inLanguage: "en-US",
      },
      {
        "@type": "HowTo",
        name: input.howTo.name,
        inLanguage: "en-US",
        step: input.howTo.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: step.text,
        })),
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
        "@id": `${site.url}/#website`,
        name: site.legalName,
        url: `${site.url}/`,
        description: site.description,
        inLanguage: "en-US",
        sameAs: site.social.map((profile) => profile.href),
        publisher: { "@id": personId },
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

export function webPageJsonLd(input: {
  title: string;
  description: string;
  pathname: string;
  breadcrumb: string;
}) {
  const url = pageUrl(input.pathname);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: input.title,
        description: input.description,
        url,
        inLanguage: "en-US",
        isPartOf: {
          "@id": `${site.url}/#website`,
        },
      },
      breadcrumb(input.breadcrumb, url),
    ],
  };
}

export function aboutJsonLd(description: string) {
  const url = pageUrl("/about/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: "About This US Landscaping Calculator",
        description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": personId },
      },
      personNode(),
      breadcrumb("About", url),
    ],
  };
}

export function contactJsonLd(description: string) {
  const url = pageUrl("/contact/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${url}#webpage`,
        url,
        name: "Contact Abdul Rauf | Landscaping Calculators",
        description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${site.url}/#website` },
        mainEntity: { "@id": personId },
      },
      personNode(),
      breadcrumb("Contact", url),
    ],
  };
}

function personNode() {
  return {
    "@type": "Person",
    "@id": personId,
    name: site.publisherName,
    email: site.contact.email,
    url: pageUrl("/about/"),
    sameAs: site.social.map((profile) => profile.href),
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
