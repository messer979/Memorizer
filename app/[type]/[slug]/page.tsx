import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AudioPlayer from "@/components/AudioPlayer";
import Reader from "@/components/Reader";
import { getAllPieceParams, getPiece } from "@/lib/content";
import { TYPE_LABELS, isContentType } from "@/lib/types";

export function generateStaticParams() {
  return getAllPieceParams();
}

// The whole library is enumerated at build time; 404 unknown slugs statically.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}): Promise<Metadata> {
  const { type, slug } = await params;
  if (!isContentType(type)) return {};
  const piece = getPiece(type, slug);
  if (!piece) return {};
  return {
    title: piece.title,
    description: piece.description ?? piece.author,
  };
}

export default async function PiecePage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;
  if (!isContentType(type)) notFound();

  const piece = getPiece(type, slug);
  if (!piece) notFound();

  return (
    <article>
      <div className="mb-8">
        <Link
          href={`/${type}`}
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← {TYPE_LABELS[type].plural}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {piece.title}
        </h1>
        {(piece.author || piece.source) && (
          <p className="mt-2 text-muted">
            {piece.author}
            {piece.author && piece.source ? " · " : ""}
            {piece.source}
          </p>
        )}
        {piece.tags && piece.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {piece.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {piece.audio && (
        <div className="mb-8">
          <AudioPlayer src={piece.audio} />
        </div>
      )}

      <Reader
        content={piece.content}
        lookupLang={piece.tags?.includes("latin") ? "la" : undefined}
      />
    </article>
  );
}
