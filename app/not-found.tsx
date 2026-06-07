import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-semibold mb-3">Not found</h1>
      <p className="text-muted mb-6">
        That piece isn&apos;t in the library.
      </p>
      <Link href="/" className="text-accent hover:underline">
        Back to the library
      </Link>
    </div>
  );
}
