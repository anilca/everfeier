import { describe, expect, it } from "vitest";
import { formatCutoffDay, isShopOpen, vatNote } from "./season";

const cutoff = "2026-10-28T23:59:00+01:00";

describe("isShopOpen", () => {
  it("is open before the cutoff in open mode", () => {
    expect(isShopOpen(new Date("2026-10-27T12:00:00+01:00"), "open", cutoff)).toBe(true);
  });

  it("closes after the cutoff", () => {
    expect(isShopOpen(new Date("2026-10-29T00:00:00+01:00"), "open", cutoff)).toBe(false);
  });

  it("is closed in closed mode", () => {
    expect(isShopOpen(new Date("2026-10-20T12:00:00+02:00"), "closed", cutoff)).toBe(false);
  });

  it("fails closed on a missing or invalid cutoff", () => {
    expect(isShopOpen(new Date(), "open", undefined)).toBe(false);
    expect(isShopOpen(new Date(), "open", "kaputt")).toBe(false);
  });
});

describe("formatCutoffDay", () => {
  it("formats in Berlin time", () => {
    expect(formatCutoffDay(cutoff)).toBe("28.10.");
  });
});

describe("vatNote", () => {
  it("shows the § 19 note for Kleinunternehmer", () => {
    expect(vatNote("kleinunternehmer")).toContain("§ 19 UStG");
  });

  it("shows VAT included in regular mode", () => {
    expect(vatNote("regular")).toBe("inkl. 19 % MwSt.");
  });
});
