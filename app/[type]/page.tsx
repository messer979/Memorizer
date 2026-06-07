import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PieceList from "@/components/PieceList";
import { getPiecesByType } from "@/lib/content";
import { CONTENT_TYPES, TYPE_LABELS, isContentType } from "@/lib/types";

export function generateStaticParams() {
  return CONTENT_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  if (!isContentType(type)) return {};
  return { title: TYPE_LABELS[type].plural };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isContentType(type)) notFound();

  const pieces = getPiecesByType(type);

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        {TYPE_LABELS[type].plural}
      </h1>
      <PieceList pieces={pieces} />
    </div>
  );
}
