"use client";

import { useEffect, useRef } from "react";
import { useCart } from "./cart-context";

/** Empties the cart once, after the stored cart has been loaded. */
export function ClearCart() {
  const { loaded, clear } = useCart();
  const done = useRef(false);
  useEffect(() => {
    if (loaded && !done.current) {
      done.current = true;
      clear();
    }
  }, [loaded, clear]);
  return null;
}
