import { describe, expect, it } from "vitest";
import { addItem, computeTotals, parseStoredCart, removeItem, setQty } from "./cart";
import { formatEUR, type PublicProduct } from "./shop";

const p = (id: string, priceCents: number): PublicProduct => ({
  id,
  name: id,
  shortDescription: "",
  description: "",
  priceCents,
  image: "",
});
const products = [p("hexenhut", 1490), p("zauberer-umhang", 2490)];

describe("cart", () => {
  it("adds items and merges quantities", () => {
    let lines = addItem([], "hexenhut");
    lines = addItem(lines, "hexenhut");
    expect(lines).toEqual([{ id: "hexenhut", qty: 2 }]);
  });

  it("clamps quantities to 1..10", () => {
    const lines = [{ id: "hexenhut", qty: 1 }];
    expect(setQty(lines, "hexenhut", 0)[0].qty).toBe(1);
    expect(setQty(lines, "hexenhut", 25)[0].qty).toBe(10);
    expect(addItem([{ id: "hexenhut", qty: 9 }], "hexenhut", 5)[0].qty).toBe(10);
  });

  it("removes items", () => {
    expect(removeItem([{ id: "hexenhut", qty: 1 }], "hexenhut")).toEqual([]);
  });

  it("computes 54,70 € subtotal for 2 Hexenhut + 1 Zauberer-Umhang", () => {
    const totals = computeTotals(
      [
        { id: "hexenhut", qty: 2 },
        { id: "zauberer-umhang", qty: 1 },
      ],
      products,
    );
    expect(formatEUR(totals.subtotalCents)).toBe("54,70 €");
    expect(totals.shippingCents).toBe(490);
    expect(totals.totalCents).toBe(5960);
  });

  it("marks inactive products unavailable and excludes them from checkout", () => {
    const totals = computeTotals(
      [
        { id: "hexenhut", qty: 1 },
        { id: "weg", qty: 3 },
      ],
      products,
    );
    expect(totals.lines[1].available).toBe(false);
    expect(totals.orderable).toEqual([{ id: "hexenhut", qty: 1 }]);
    expect(totals.subtotalCents).toBe(1490);
  });

  it("charges no shipping for an empty cart", () => {
    expect(computeTotals([], products).totalCents).toBe(0);
  });

  it("ignores malformed stored data", () => {
    expect(parseStoredCart("nicht json")).toEqual([]);
    expect(parseStoredCart('[{"id":"hexenhut","qty":99},{"x":1}]')).toEqual([{ id: "hexenhut", qty: 10 }]);
  });
});
