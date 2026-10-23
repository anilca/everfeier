import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("rejects the 21st request within a minute", () => {
    let t = 0;
    const allow = createRateLimiter(20, 60_000, () => t);
    for (let i = 0; i < 20; i++) expect(allow("1.2.3.4")).toBe(true);
    expect(allow("1.2.3.4")).toBe(false);
    expect(allow("5.6.7.8")).toBe(true);
    t = 60_000;
    expect(allow("1.2.3.4")).toBe(true);
  });
});
