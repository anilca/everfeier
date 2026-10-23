import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-session";

type Props = { searchParams: Promise<{ fehler?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await isAdmin()) redirect("/admin");
  const { fehler } = await searchParams;

  return (
    <>
      <h1>Admin-Anmeldung</h1>
      {fehler && (
        <div className="notice error">
          {fehler === "zu-viele" ? "Zu viele Versuche. Bitte warte eine Minute." : "Anmeldung fehlgeschlagen."}
        </div>
      )}
      <form className="form panel" method="post" action="/api/admin/login">
        <div className="field">
          <label htmlFor="password">Passwort</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button className="btn" type="submit">
          Anmelden
        </button>
      </form>
    </>
  );
}
