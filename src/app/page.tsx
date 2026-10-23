import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import { Price } from "@/components/price";
import { activePublicProducts } from "@/lib/catalog";
import { seasonFromEnv } from "@/lib/season";
import { DELIVERY_TIME } from "@/lib/shop";

export default function HomePage() {
  const season = seasonFromEnv();
  const products = activePublicProducts();

  return (
    <>
      <h1>Halloween-Kostüme &amp; Deko</h1>
      <p className="muted">
        Versand aus Deutschland, Lieferzeit {DELIVERY_TIME}.{" "}
        {season.open ? "Rechtzeitig bestellen und gruselig feiern." : "Die Saison ist beendet."}
      </p>
      <div className="grid">
        {products.map((p) => (
          <article key={p.id} className="card">
            <Link href={`/produkt/${p.id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} width={600} height={600} />
            </Link>
            <div className="card-body">
              <Link href={`/produkt/${p.id}`} className="card-title">
                {p.name}
              </Link>
              <span className="muted small">{p.shortDescription}</span>
              <Price cents={p.priceCents} vatNote={season.vatNote} />
              <AddToCart productId={p.id} open={season.open} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
