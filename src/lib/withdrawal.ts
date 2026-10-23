import { normalizeOrderNo } from "./order-no";
import { emailMatches, type Order } from "./orders";

export type WithdrawalInput = { name: string; orderNo: string; email: string; message: string };

export type WithdrawalResult =
  | { ok: false; errors: Partial<Record<keyof WithdrawalInput, string>> }
  | {
      ok: true;
      input: WithdrawalInput;
      receivedAt: Date;
      matchedOrderNo: string | null;
      customerMailSent: boolean;
    };

export type Mail = { to: string; subject: string; text: string; replyTo?: string };

export type WithdrawalDeps = {
  findOrderByNo: (orderNo: string) => Promise<Order | null>;
  markWithdrawal: (order: Order, receivedAt: Date) => Promise<void>;
  sendMail: (mail: Mail) => Promise<void>;
  operatorEmail: string;
  now?: () => Date;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseWithdrawalInput(form: Record<string, unknown>): WithdrawalResult | { ok: true; input: WithdrawalInput } {
  const str = (k: string) => (typeof form[k] === "string" ? (form[k] as string).trim() : "");
  const input: WithdrawalInput = { name: str("name"), orderNo: str("orderNo"), email: str("email"), message: str("message") };
  const errors: Partial<Record<keyof WithdrawalInput, string>> = {};
  if (!input.name || input.name.length > 200) errors.name = "Bitte gib deinen Namen an.";
  if (!input.orderNo || input.orderNo.length > 50) errors.orderNo = "Bitte gib deine Bestellnummer an.";
  if (!EMAIL_RE.test(input.email) || input.email.length > 200) errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
  if (input.message.length > 2000) errors.message = "Die Nachricht ist zu lang (max. 2000 Zeichen).";
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, input };
}

export function formatBerlin(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export function declarationText(input: WithdrawalInput, receivedAt: Date): string {
  return [
    "Hiermit widerrufe ich den von mir abgeschlossenen Vertrag.",
    "",
    `Name: ${input.name}`,
    `Bestellnummer: ${input.orderNo}`,
    `E-Mail: ${input.email}`,
    input.message ? `Nachricht: ${input.message}` : null,
    "",
    `Eingegangen am: ${formatBerlin(receivedAt)} (Europe/Berlin)`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/**
 * Records a withdrawal declaration (§ 356a BGB). A declaration is never rejected for
 * an unknown order: it is confirmed to the customer and forwarded to the operator.
 */
export async function processWithdrawal(input: WithdrawalInput, deps: WithdrawalDeps): Promise<WithdrawalResult> {
  const receivedAt = (deps.now ?? (() => new Date()))();

  let matched: Order | null = null;
  const orderNo = normalizeOrderNo(input.orderNo);
  if (orderNo) {
    const order = await deps.findOrderByNo(orderNo);
    if (order && emailMatches(order, input.email)) matched = order;
  }
  if (matched) await deps.markWithdrawal(matched, receivedAt);

  const declaration = declarationText(input, receivedAt);

  let customerMailSent = true;
  try {
    await deps.sendMail({
      to: input.email,
      subject: "Eingangsbestätigung deines Widerrufs",
      text: [
        `Hallo ${input.name},`,
        "",
        "wir bestätigen den Eingang deiner Widerrufserklärung mit folgendem Inhalt:",
        "",
        declaration,
        "",
        "Wir melden uns mit den nächsten Schritten zur Rücksendung und Erstattung.",
        "",
        "Viele Grüße",
        "everfeier",
      ].join("\n"),
    });
  } catch {
    customerMailSent = false;
  }

  try {
    await deps.sendMail({
      to: deps.operatorEmail,
      replyTo: input.email,
      subject: `Widerruf ${matched ? matched.orderNo : "(nicht zugeordnet)"}`,
      text: [
        matched ? `Zugeordnete Bestellung: ${matched.orderNo}` : "Status: nicht zugeordnet – bitte manuell prüfen.",
        customerMailSent ? "" : "ACHTUNG: Bestätigung an den Kunden konnte nicht gesendet werden.",
        "",
        declaration,
      ].join("\n"),
    });
  } catch {
    // The customer confirmation is what the law requires; the operator copy is best effort.
  }

  return { ok: true, input, receivedAt, matchedOrderNo: matched?.orderNo ?? null, customerMailSent };
}
