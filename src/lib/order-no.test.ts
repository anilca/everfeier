import { describe, expect, it } from "vitest";
import { generateOrderNo, normalizeOrderNo, ORDER_NO_PATTERN } from "./order-no";

describe("generateOrderNo", () => {
  it("matches the EF-XXXXXX format", () => {
    for (let i = 0; i < 500; i++) expect(generateOrderNo()).toMatch(ORDER_NO_PATTERN);
  });

  it("never contains look-alike characters", () => {
    const all = Array.from({ length: 500 }, () => generateOrderNo().slice(3)).join("");
    expect(all).not.toMatch(/[01OI]/);
  });

  it("maps every byte value into the alphabet", () => {
    expect(generateOrderNo(() => new Uint8Array([0, 31, 32, 255, 128, 64]))).toBe("EF-2Z2Z22");
  });
});

describe("normalizeOrderNo", () => {
  it("accepts lower case and surrounding spaces", () => {
    expect(normalizeOrderNo(" ef-7k3qxm ")).toBe("EF-7K3QXM");
  });

  it("rejects anything else", () => {
    expect(normalizeOrderNo("EF-7K3QX")).toBeNull();
    expect(normalizeOrderNo("EF-7K3QX0")).toBeNull();
    expect(normalizeOrderNo("' OR 1")).toBeNull();
  });
});
