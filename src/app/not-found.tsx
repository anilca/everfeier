import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Seite nicht gefunden</h1>
      <p>Diese Seite existiert nicht (mehr). Vielleicht wurde der Artikel aus dem Sortiment genommen.</p>
      <Link href="/" className="btn">
        Zum Sortiment
      </Link>
    </>
  );
}
