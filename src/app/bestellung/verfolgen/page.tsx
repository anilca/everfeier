import type { Metadata } from "next";
import { TrackingForm } from "@/components/tracking-form";

export const metadata: Metadata = { title: "Bestellung verfolgen" };

type Props = { searchParams: Promise<{ bestellung?: string | string[] }> };

export default async function TrackingPage({ searchParams }: Props) {
  const initial = (await searchParams).bestellung;
  return (
    <>
      <h1>Bestellung verfolgen</h1>
      <p className="muted">
        Gib deine Bestellnummer (z. B. EF-7K3QXM) und die E-Mail-Adresse ein, mit der du bestellt hast. Neue
        Bestellungen sind nach etwa einer Minute abrufbar.
      </p>
      <TrackingForm initialOrderNo={typeof initial === "string" ? initial : ""} />
    </>
  );
}
