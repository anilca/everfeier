import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CartLink } from "@/components/cart-link";
import { CartProvider } from "@/components/cart-context";
import { seasonFromEnv } from "@/lib/season";
import "./globals.css";

// Season state depends on the request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "everfeier – Halloween-Kostüme & Deko", template: "%s | everfeier" },
  description: "Halloween-Kostüme und gruselige Deko mit schneller Lieferung innerhalb Deutschlands.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const season = seasonFromEnv();

  return (
    <html lang="de">
      <body>
        <CartProvider>
          {season.open ? (
            <div className="season-banner" role="status">
              Bestellungen bis {season.cutoffDay} – Lieferung bis Halloween
            </div>
          ) : (
            <div className="season-banner closed" role="status">
              Die Saison ist beendet – Bestellungen sind nicht mehr möglich. Sendungsverfolgung und Widerruf bleiben verfügbar.
            </div>
          )}
          <header className="site-header">
            <div className="container">
              <Link href="/" className="logo">
                ever<span>feier</span>
              </Link>
              <nav className="nav" aria-label="Hauptnavigation">
                <Link href="/">Sortiment</Link>
                <Link href="/bestellung/verfolgen">Bestellung verfolgen</Link>
                <CartLink />
              </nav>
            </div>
          </header>
          <main>
            <div className="container">{children}</div>
          </main>
          <footer className="site-footer">
            <div className="container">
              <nav aria-label="Rechtliches">
                <Link href="/impressum">Impressum</Link>
                <Link href="/datenschutz">Datenschutz</Link>
                <Link href="/agb">AGB</Link>
                <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>
                <Link href="/versand-zahlung">Versand &amp; Zahlung</Link>
                <Link href="/vertrag-widerrufen" className="withdraw-link">
                  Vertrag widerrufen
                </Link>
              </nav>
              <div>© {new Date().getFullYear()} everfeier · {season.vatNote}</div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
