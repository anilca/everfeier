import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { activePublicProducts, allProducts, getProduct, toPublicProduct } from "./catalog";

describe("catalog", () => {
  it("has 13 products with unique ids", () => {
    const ids = allProducts().map((p) => p.id);
    expect(ids).toHaveLength(13);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only existing bundle components", () => {
    for (const p of allProducts()) {
      for (const c of p.components ?? []) expect(getProduct(c), `${p.id} -> ${c}`).toBeDefined();
    }
  });

  it("points every product to an existing image", () => {
    for (const p of allProducts()) {
      expect(existsSync(join(process.cwd(), "public", p.image)), p.image).toBe(true);
    }
  });

  it("has a supplier link for every product", () => {
    for (const p of allProducts()) expect(p.supplier.links.length).toBeGreaterThan(0);
  });
});

describe("toPublicProduct", () => {
  it("never exposes supplier data", () => {
    for (const p of allProducts()) {
      const pub = toPublicProduct(p);
      expect(pub).not.toHaveProperty("supplier");
      expect(pub).not.toHaveProperty("active");
      expect(JSON.stringify(pub).toLowerCase()).not.toContain("temu");
    }
  });

  it("lists bundle contents by name", () => {
    expect(toPublicProduct(getProduct("sensenmann-set")!).contents).toEqual([
      "Sensenmann-Kostüm",
      "Sense 130 cm",
    ]);
  });

  it("omits inactive products from the public list", () => {
    const active = allProducts().filter((p) => p.active).length;
    expect(activePublicProducts()).toHaveLength(active);
  });
});
