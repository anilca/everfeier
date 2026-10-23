import type { Metadata } from "next";
import { LegalPage, P } from "@/components/legal-page";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>Verantwortlicher</h2>
      <p>
        <P>Name, Anschrift, E-Mail wie im Impressum</P>
      </p>

      <h2>Keine Tracking- oder Analyse-Tools</h2>
      <p>
        Diese Website verwendet keine Analyse-, Werbe- oder Tracking-Dienste. Der Warenkorb wird ausschließlich lokal in
        deinem Browser (localStorage) gespeichert und nicht an uns übertragen, bis du zur Kasse gehst.
      </p>

      <h2>Bestellung und Zahlung (Stripe)</h2>
      <p>
        Für die Bezahlung wirst du zu Stripe weitergeleitet (Stripe Payments Europe, Ltd., Irland). Dort werden Name,
        E-Mail, Lieferadresse und Zahlungsdaten zur Vertragsabwicklung verarbeitet (Art. 6 Abs. 1 lit. b DSGVO).
        <P>Details zu Speicherdauer, Drittlandübermittlung und Link zur Stripe-Datenschutzerklärung laut Generator</P>
      </p>

      <h2>Versand</h2>
      <p>
        Zur Lieferung geben wir Name und Lieferadresse an unseren Logistikpartner bzw. Lieferanten in Deutschland weiter
        (Art. 6 Abs. 1 lit. b DSGVO). <P>Partner benennen</P>
      </p>

      <h2>E-Mail-Versand (Resend)</h2>
      <p>
        Bestätigungen zu Widerrufserklärungen versenden wir über den Dienst Resend. <P>Anbieterangaben, Rechtsgrundlage, Drittland</P>
      </p>

      <h2>Hosting (Vercel)</h2>
      <p>
        Die Website wird bei Vercel gehostet. Beim Aufruf werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt)
        verarbeitet. <P>Anbieterangaben, Rechtsgrundlage, Drittland</P>
      </p>

      <h2>Deine Rechte</h2>
      <p>
        <P>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde bei der Aufsichtsbehörde – laut Generator</P>
      </p>
    </LegalPage>
  );
}
