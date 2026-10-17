import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap flex min-h-[60vh] max-w-xl flex-col items-start justify-center py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lime">404</p>
      <h1 className="mt-3 text-[28px] font-extrabold tracking-tight">This path is not on the map.</h1>
      <Link href="/" className="mt-6 text-sm font-semibold text-lime">
        Back to Sherwood
      </Link>
    </main>
  );
}
