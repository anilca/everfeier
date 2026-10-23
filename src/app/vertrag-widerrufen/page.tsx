import type { Metadata } from "next";
import { WithdrawalForm } from "@/components/withdrawal-form";

export const metadata: Metadata = { title: "Vertrag widerrufen" };

export default function WithdrawalPage() {
  return (
    <>
      <h1>Vertrag widerrufen</h1>
      <p className="muted">
        Hier kannst du deinen Vertrag innerhalb der Widerrufsfrist widerrufen. Nach dem Absenden erhältst du sofort eine
        Eingangsbestätigung mit Inhalt und Zeitpunkt deiner Erklärung per E-Mail.
      </p>
      <WithdrawalForm />
    </>
  );
}
