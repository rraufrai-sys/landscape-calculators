import { describe, expect, it } from "vitest";
import worker, { redirectTarget } from "../../worker.js";

describe("www to apex redirect", () => {
  it("sends http and https www to https on the apex, keeping path and query", () => {
    expect(redirectTarget("http://www.landscapecalcpro.com/gravel-calculator/?x=1")).toBe(
      "https://landscapecalcpro.com/gravel-calculator/?x=1",
    );
    expect(redirectTarget("https://www.landscapecalcpro.com/sod-calculator/")).toBe(
      "https://landscapecalcpro.com/sod-calculator/",
    );
    expect(redirectTarget("https://WWW.landscapecalcpro.com./")).toBe("https://landscapecalcpro.com/");
  });

  it("returns a 301 from the Worker and leaves other hosts to assets", async () => {
    const redirected = await worker.fetch(
      new Request("http://www.landscapecalcpro.com/gravel-calculator/?x=1"),
      { ASSETS: { fetch: () => { throw new Error("assets should not be fetched"); } } },
    );
    expect(redirected.status).toBe(301);
    expect(redirected.headers.get("location")).toBe(
      "https://landscapecalcpro.com/gravel-calculator/?x=1",
    );

    let fetched = false;
    const served = await worker.fetch(new Request("https://landscapecalcpro.com/"), {
      ASSETS: {
        fetch: () => {
          fetched = true;
          return new Response("ok", { status: 200 });
        },
      },
    });
    expect(fetched).toBe(true);
    expect(served.status).toBe(200);
  });

  it("does not redirect the apex, workers.dev, or a preview host", () => {
    expect(redirectTarget("https://landscapecalcpro.com/mulch-calculator/")).toBeNull();
    expect(redirectTarget("http://landscapecalcpro.com/")).toBeNull();
    expect(redirectTarget("https://landscape-calculators.example.workers.dev/")).toBeNull();
    expect(
      redirectTarget("https://pr-123.landscape-calculators.workers.dev/about/"),
    ).toBeNull();
  });
});
