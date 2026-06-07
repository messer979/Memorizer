import type { Metadata } from "next";
import Link from "next/link";
import { CONTENT_TYPES, TYPE_LABELS } from "@/lib/types";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Memorizer — Poems, Prayers & Hymns",
    template: "%s · Memorizer",
  },
  description:
    "A quiet library of poems, prayers, and hymns to read, listen to, and commit to memory.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Memorizer
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted">
              {CONTENT_TYPES.map((type) => (
                <Link
                  key={type}
                  href={`/${type}`}
                  className="hover:text-accent transition-colors"
                >
                  {TYPE_LABELS[type].plural}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-10">
          {children}
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-6 text-sm text-muted">
            Read it. Hear it. Know it by heart.
          </div>
        </footer>
      </body>
    </html>
  );
}
