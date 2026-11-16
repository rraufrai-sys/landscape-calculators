import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { siteUrl } from "./src/config/site";

export default defineConfig({
  site: siteUrl,
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
    inlineStylesheets: "never",
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("404"),
    }),
  ],
});
