import Link from "next/link";
import PieceList from "@/components/PieceList";
import { getAllPieces, getCounts } from "@/lib/content";
import { CONTENT_TYPES, TYPE_LABELS } from "@/lib/types";

export default function HomePage() {
  const counts = getCounts();
  const pieces = getAllPieces();

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          A library to learn by heart
        </h1>
        <p className="text-muted text-lg max-w-prose">
          Poems, prayers, and hymns — gathered to read, to listen to, and to
          commit to memory.
        </p>
      </section>

      <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CONTENT_TYPES.map((type) => (
          <Link
            key={type}
            href={`/${type}`}
            className="rounded-lg border border-border bg-card p-5 hover:border-accent transition-colors"
          >
            <div className="text-2xl font-semibold">{counts[type]}</div>
            <div className="text-muted">{TYPE_LABELS[type].plural}</div>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted mb-2">
          All pieces
        </h2>
        <PieceList pieces={pieces} showType />
      </section>
    </div>
  );
}
