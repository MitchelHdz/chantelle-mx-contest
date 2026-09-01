import Link from "next/link";

export default function NotFound() {
  return (
    <main className="legal-page error-page">
      <p className="eyebrow">Página no encontrada</p>
      <h1>Esta ruta no existe</h1>
      <p>Regresa al inicio para continuar con tu registro.</p>
      <Link href="/" className="button">
        Volver al inicio
      </Link>
    </main>
  );
}
