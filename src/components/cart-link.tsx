"use client";

import Link from "next/link";
import { useCart } from "./cart-context";

export function CartLink() {
  const { count } = useCart();
  return <Link href="/warenkorb">Warenkorb{count > 0 ? ` (${count})` : ""}</Link>;
}
