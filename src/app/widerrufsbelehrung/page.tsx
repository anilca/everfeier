import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, P } from "@/components/legal-page";

export const metadata: Metadata = { title: "Widerrufsbelehrung" };

export default function WiderrufsbelehrungPage() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <h2>Widerrufsrecht</h2>
      <p>
        Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.{" "}
        <P>Vollständiger Text der aktuellen Muster-Widerrufsbelehrung (Fassung ab 19.06.2026) inkl. Fristbeginn, Anschrift und Rücksendekosten</P>
      </p>
      <p>
        Du kannst den Widerruf direkt online über die Funktion{" "}
        <Link href="/vertrag-widerrufen">„Vertrag widerrufen“</Link> erklären. Wir bestätigen den Eingang unverzüglich per
        E-Mail.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        <P>Text laut Muster: Rückzahlung binnen 14 Tagen, Zahlungsmittel, Rücksendung, Wertersatz</P>
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p className="muted small">
        (Wenn du den Vertrag widerrufen willst, kannst du auch dieses Formular ausfüllen und an uns zurücksenden.)
      </p>
      <div className="panel">
        <p>
          An: <P>Name, Anschrift, E-Mail</P>
        </p>
        <p>
          Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren
          (*)/die Erbringung der folgenden Dienstleistung (*)
        </p>
        <p>— Bestellt am (*)/erhalten am (*)</p>
        <p>— Name des/der Verbraucher(s)</p>
        <p>— Anschrift des/der Verbraucher(s)</p>
        <p>— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)</p>
        <p>— Datum</p>
        <p className="small">(*) Unzutreffendes streichen.</p>
      </div>
    </LegalPage>
  );
}
