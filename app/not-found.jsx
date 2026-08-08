import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-7xl">🔱</p>
      <h1 className="mt-4 font-serif text-3xl font-bold text-dharma-black">404 — Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-dharma-black/60">
        The page you&apos;re looking for has wandered off. Let&apos;s get you back on the path.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}
