import Link from "next/link";
import type { PieceMeta } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";

/** A list of pieces; optionally shows each piece's type (for mixed lists). */
export default function PieceList({
  pieces,
  showType = false,
}: {
  pieces: PieceMeta[];
  showType?: boolean;
}) {
  if (pieces.length === 0) {
    return (
      <p className="text-muted">
        Nothing here yet. Add a markdown file under the matching{" "}
        <code>content/</code> folder.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {pieces.map((p) => (
        <li key={`${p.type}/${p.slug}`}>
          <Link
            href={`/${p.type}/${p.slug}`}
            className="group flex items-baseline justify-between gap-4 py-4"
          >
            <span className="flex-1">
              <span className="text-lg group-hover:text-accent transition-colors">
                {p.title}
              </span>
              {p.author && (
                <span className="block text-sm text-muted">{p.author}</span>
              )}
            </span>
            <span className="flex items-center gap-3 shrink-0 text-xs text-muted">
              {p.audio && <span title="Audio available">♪</span>}
              {showType && <span>{TYPE_LABELS[p.type].singular}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
