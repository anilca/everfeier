"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addItem, parseStoredCart, removeItem, setQty, type CartLine } from "@/lib/cart";

const STORAGE_KEY = "ef_cart";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  loaded: boolean;
  add: (id: string, qty?: number) => void;
  update: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  try {
    return parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeStorage(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage blocked (private mode, disabled site data): keep the cart in memory only.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Read after mount so server and client render the same initial markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage());
    setLoaded(true);
  }, []);

  const commit = useCallback((next: (prev: CartLine[]) => CartLine[]) => {
    setLines((prev) => {
      const value = next(prev);
      writeStorage(value);
      return value;
    });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      loaded,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      add: (id, qty = 1) => commit((prev) => addItem(prev, id, qty)),
      update: (id, qty) => commit((prev) => setQty(prev, id, qty)),
      remove: (id) => commit((prev) => removeItem(prev, id)),
      clear: () => commit(() => []),
    }),
    [lines, loaded, commit],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
