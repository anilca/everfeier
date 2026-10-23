import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { Price } from "@/components/price";
import { getActiveProduct, toPublicProduct } from "@/lib/catalog";
import { seasonFromEnv } from "@/lib/season";
import { DELIVERY_TIME } from "@/lib/shop";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getActiveProduct((await params).id);
  return product ? { title: product.name, description: product.shortDescription } : {};
}

export default async function ProductPage({ params }: Props) {
  const product = getActiveProduct((await params).id);
  if (!product) notFound();
  const p = toPublicProduct(product);
  const season = seasonFromEnv();

  return (
    <>
      <p className="small">
        <Link href="/">← Zurück zum Sortiment</Link>
      </p>
      <div className="detail">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name} width={600} height={600} />
        <div className="stack">
          <h1>{p.name}</h1>
          <Price cents={p.priceCents} vatNote={season.vatNote} />
          <p>{p.description}</p>
          {p.contents && (
            <div>
              <strong>Im Set enthalten:</strong>
              <ul>
                {p.contents.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="muted small">
            Lieferzeit: {DELIVERY_TIME} innerhalb Deutschlands. Versand direkt durch unser Partnerlager in Deutschland.
          </p>
          <AddToCart productId={p.id} open={season.open} block />
        </div>
      </div>
    </>
  );
}
