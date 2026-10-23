"use client";

import { useState } from "react";
import { useCart } from "./cart-context";

export function AddToCart({ productId, open, block = false }: { productId: string; open: boolean; block?: boolean }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={`btn add-to-cart${block ? " block" : ""}`}
      disabled={!open}
      onClick={() => {
        add(productId);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      {!open ? "Saison beendet" : added ? "Hinzugefügt ✓" : "In den Warenkorb"}
    </button>
  );
}
