import { describe, expect, it } from "vitest";
import { ORDER_STATUSES, trackingLink, validateTransition } from "./order-status";

describe("validateTransition", () => {
  it("allows the normal forward flow", () => {
    expect(validateTransition("eingegangen", { status: "in_bearbeitung" })).toEqual({ ok: true, status: "in_bearbeitung" });
    expect(validateTransition("in_bearbeitung", { status: "versendet", carrier: "dhl", trackingNo: " 0034 " })).toEqual({
      ok: true,
      status: "versendet",
      carrier: "dhl",
      trackingNo: "0034",
    });
    expect(validateTransition("versendet", { status: "zugestellt", carrier: "dhl", trackingNo: "0034" })).toMatchObject({ ok: true });
  });

  it("requires a tracking number and carrier for shipping", () => {
    expect(validateTransition("in_bearbeitung", { status: "versendet", carrier: "dhl" })).toEqual({ ok: false, message: "Sendungsnummer fehlt." });
    expect(validateTransition("in_bearbeitung", { status: "versendet", trackingNo: "1" })).toEqual({ ok: false, message: "Versanddienstleister fehlt." });
    expect(validateTransition("in_bearbeitung", { status: "versendet", carrier: "ups", trackingNo: "1" })).toMatchObject({ ok: false });
  });

  it("allows cancelling from open states", () => {
    expect(validateTransition("eingegangen", { status: "storniert" })).toEqual({ ok: true, status: "storniert" });
    expect(validateTransition("in_bearbeitung", { status: "storniert" })).toEqual({ ok: true, status: "storniert" });
  });

  it("treats cancellation as final", () => {
    for (const status of ORDER_STATUSES.filter((s) => s !== "storniert")) {
      expect(validateTransition("storniert", { status, carrier: "dhl", trackingNo: "1" })).toMatchObject({ ok: false });
    }
  });

  it("allows correcting a misclick backwards", () => {
    expect(validateTransition("in_bearbeitung", { status: "eingegangen" })).toMatchObject({ ok: true });
  });

  it("rejects unknown statuses", () => {
    expect(validateTransition("eingegangen", { status: "bezahlt" })).toMatchObject({ ok: false });
  });
});

describe("trackingLink", () => {
  it("links known carriers", () => {
    expect(trackingLink("dhl", "00340434")).toContain("dhl.de");
  });

  it("returns null for other carriers or missing numbers", () => {
    expect(trackingLink("other", "123")).toBeNull();
    expect(trackingLink("dhl", undefined)).toBeNull();
  });
});
