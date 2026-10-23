import "server-only";
import { Resend } from "resend";
import { env } from "./env";
import type { Mail } from "./withdrawal";

let client: Resend | null = null;

export async function sendMail(mail: Mail): Promise<void> {
  client ??= new Resend(env("RESEND_API_KEY"));
  const { error } = await client.emails.send({
    from: env("MAIL_FROM"),
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
  });
  if (error) throw new Error(`E-Mail-Versand fehlgeschlagen: ${error.message}`);
}
