import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, P } from "@/components/legal-page";

export const metadata: Metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <h2>1. Geltungsbereich und Anbieter</h2>
      <p>
        <P>Vertragspartner, Geltungsbereich (nur Verbraucher in Deutschland)</P>
      </p>
      <h2>2. Vertragsschluss</h2>
      <p>
        Die Darstellung der Produkte ist kein bindendes Angebot. Mit Klick auf „Zahlen“ auf der Zahlungsseite gibst du
        eine verbindliche Bestellung ab. <P>Zeitpunkt der Annahme laut Generator</P>
      </p>
      <h2>3. Preise und Versandkosten</h2>
      <p>
        Es gelten die zum Zeitpunkt der Bestellung angegebenen Preise. Versandkosten: siehe{" "}
        <Link href="/versand-zahlung">Versand &amp; Zahlung</Link>.
      </p>
      <h2>4. Lieferung</h2>
      <p>
        Lieferung nur innerhalb Deutschlands. Die Ware wird direkt aus dem Lager unseres Lieferpartners in Deutschland
        versendet und kann in dessen Verpackung eintreffen.
      </p>
      <h2>5. Widerrufsrecht</h2>
      <p>
        Verbrauchern steht ein Widerrufsrecht zu, siehe <Link href="/widerrufsbelehrung">Widerrufsbelehrung</Link>. Den
        Widerruf kannst du jederzeit über <Link href="/vertrag-widerrufen">Vertrag widerrufen</Link> erklären.
      </p>
      <h2>6. Gewährleistung</h2>
      <p>
        <P>Gesetzliche Mängelhaftung laut Generator</P>
      </p>
    </LegalPage>
  );
}
