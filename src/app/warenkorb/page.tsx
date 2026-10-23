import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { activePublicProducts } from "@/lib/catalog";
import { seasonFromEnv } from "@/lib/season";

export const metadata: Metadata = { title: "Warenkorb" };

export default function CartPage() {
  const season = seasonFromEnv();
  return (
    <>
      <h1>Warenkorb</h1>
      <CartView products={activePublicProducts()} open={season.open} vatNote={season.vatNote} />
    </>
  );
}
