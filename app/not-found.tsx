import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-blush">
      <p className="text-rose font-bold uppercase tracking-[0.3em] text-sm mb-4">
        404
      </p>
      <h1 className="text-5xl font-serif mb-6">Page not found</h1>
      <p className="text-ink/60 mb-10 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="rose-button">
        Back to home
      </Link>
    </div>
  );
}
