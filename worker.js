// Sends www.landscapecalcpro.com to the apex host. Every other hostname,
// including workers.dev and pull-request preview URLs, is served unchanged.

export const WWW_HOST = "www.landscapecalcpro.com";
export const APEX_HOST = "landscapecalcpro.com";

/** Absolute https URL on the apex host, or null when this request should be served as-is. */
export function redirectTarget(requestUrl) {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host !== WWW_HOST) return null;
  url.protocol = "https:";
  url.hostname = APEX_HOST;
  return url.toString();
}

export default {
  async fetch(request, env) {
    const target = redirectTarget(request.url);
    if (target) return Response.redirect(target, 301);
    return env.ASSETS.fetch(request);
  },
};
