import type { ReactNode } from "react";

/** Marks text that must be replaced with real data before going live. */
export function P({ children }: { children: ReactNode }) {
  return <span className="placeholder">[{children}]</span>;
}

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="legal">
      <h1>{title}</h1>
      <div className="notice">
        Platzhalter: Gelb markierte Stellen und den Text vor dem Livegang mit einem Rechtstext-Generator oder anwaltlich
        prüfen lassen und ersetzen.
      </div>
      {children}
    </article>
  );
}
