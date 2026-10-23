import type { Metadata } from "next";
import { LegalPage, P } from "@/components/legal-page";

export const metadata: Metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        <P>Vorname Nachname</P>
        <br />
        everfeier
        <br />
        <P>Straße Hausnummer</P>
        <br />
        <P>PLZ Ort</P>
        <br />
        Deutschland
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <P>kontakt@example.de</P>
        <br />
        Telefon: <P>+49 …</P>
      </p>
      <h2>Umsatzsteuer</h2>
      <p>
        <P>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG, falls vorhanden – sonst Abschnitt entfernen</P>
      </p>
      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        <P>Hinweis nach § 36 VSBG gemäß Generator</P>
      </p>
    </LegalPage>
  );
}
