"use client";

import { useState, type FormEvent } from "react";

type Confirmation = { declaration: string; receivedAt: string; customerMailSent: boolean };
type Errors = Partial<Record<"name" | "orderNo" | "email" | "message", string>>;

export function WithdrawalForm() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setErrors({});
    try {
      const res = await fetch("/api/widerruf", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<Confirmation> & { errors?: Errors; error?: string };
      if (res.ok && data.declaration && data.receivedAt) {
        setConfirmation({ declaration: data.declaration, receivedAt: data.receivedAt, customerMailSent: Boolean(data.customerMailSent) });
      } else if (data.errors) {
        setErrors(data.errors);
      } else {
        setError(data.error ?? "Der Widerruf konnte gerade nicht übermittelt werden. Bitte versuche es erneut.");
      }
    } catch {
      setError("Der Widerruf konnte gerade nicht übermittelt werden. Bitte versuche es erneut.");
    } finally {
      setPending(false);
    }
  }

  if (confirmation) {
    return (
      <div className="stack" role="status">
        <div className="notice ok">
          <strong>Dein Widerruf ist bei uns eingegangen.</strong>
        </div>
        <div className="panel">
          <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{confirmation.declaration}</pre>
        </div>
        {confirmation.customerMailSent ? (
          <p>Eine Bestätigung mit diesem Inhalt wurde an deine E-Mail-Adresse gesendet.</p>
        ) : (
          <div className="notice error">
            Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte speichere diese Seite (z. B. als Screenshot) –
            dein Widerruf ist trotzdem eingegangen und wir melden uns bei dir.
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required autoComplete="name" aria-invalid={Boolean(errors.name)} />
        {errors.name && <div className="field-error">{errors.name}</div>}
      </div>
      <div className="field">
        <label htmlFor="orderNo">Bestellnummer</label>
        <input id="orderNo" name="orderNo" required placeholder="EF-XXXXXX" autoComplete="off" aria-invalid={Boolean(errors.orderNo)} />
        {errors.orderNo && <div className="field-error">{errors.orderNo}</div>}
      </div>
      <div className="field">
        <label htmlFor="email">E-Mail-Adresse (für die Eingangsbestätigung)</label>
        <input id="email" name="email" type="email" required autoComplete="email" aria-invalid={Boolean(errors.email)} />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>
      <div className="field">
        <label htmlFor="message">Nachricht (optional, z. B. welche Artikel)</label>
        <textarea id="message" name="message" maxLength={2000} />
        {errors.message && <div className="field-error">{errors.message}</div>}
      </div>
      {error && <div className="notice error">{error}</div>}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Wird übermittelt …" : "Widerruf bestätigen"}
      </button>
    </form>
  );
}
