import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  CONTENT_TYPES,
  type ContentType,
  type Piece,
  type PieceFrontmatter,
  type PieceMeta,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function typeDir(type: ContentType): string {
  return path.join(CONTENT_DIR, type);
}

/** Turn "the-road-not-taken.md" into "the-road-not-taken". */
function fileToSlug(file: string): string {
  return file.replace(/\.md$/i, "");
}

function readMarkdownFiles(type: ContentType): string[] {
  const dir = typeDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".md"));
}

function parsePiece(type: ContentType, file: string): Piece {
  const fullPath = path.join(typeDir(type), file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as PieceFrontmatter;
  const slug = fileToSlug(file);

  return {
    type,
    slug,
    title: fm.title ?? slug,
    author: fm.author,
    source: fm.source,
    tags: fm.tags ?? [],
    audio: fm.audio,
    description: fm.description,
    content: content.trim(),
  };
}

/** All pieces of a given type, sorted alphabetically by title. */
export function getPiecesByType(type: ContentType): PieceMeta[] {
  return readMarkdownFiles(type)
    .map((file) => {
      // Strip the heavy `content` field for listing pages.
      const { content: _content, ...meta } = parsePiece(type, file);
      void _content;
      return meta;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Every piece across all content types. */
export function getAllPieces(): PieceMeta[] {
  return CONTENT_TYPES.flatMap((type) => getPiecesByType(type)).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

/** A single piece, or null if the file doesn't exist. */
export function getPiece(type: ContentType, slug: string): Piece | null {
  const file = `${slug}.md`;
  const fullPath = path.join(typeDir(type), file);
  if (!fs.existsSync(fullPath)) return null;
  return parsePiece(type, file);
}

/** For generateStaticParams: every (type, slug) pair. */
export function getAllPieceParams(): { type: ContentType; slug: string }[] {
  return CONTENT_TYPES.flatMap((type) =>
    readMarkdownFiles(type).map((file) => ({ type, slug: fileToSlug(file) })),
  );
}

/** Count of pieces per type, for the home page overview. */
export function getCounts(): Record<ContentType, number> {
  return Object.fromEntries(
    CONTENT_TYPES.map((type) => [type, readMarkdownFiles(type).length]),
  ) as Record<ContentType, number>;
}
