import Link from "next/link";
import { formatEUR } from "@/lib/shop";

export function Price({ cents, vatNote }: { cents: number; vatNote: string }) {
  return (
    <div>
      <div className="price">{formatEUR(cents)}</div>
      <div className="price-note">
        {vatNote} zzgl. <Link href="/versand-zahlung">Versandkosten</Link>
      </div>
    </div>
  );
}
