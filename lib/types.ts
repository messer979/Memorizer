export const CONTENT_TYPES = ["poems", "prayers", "hymns"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** Singular, display-friendly label for a content type. */
export const TYPE_LABELS: Record<ContentType, { singular: string; plural: string }> = {
  poems: { singular: "Poem", plural: "Poems" },
  prayers: { singular: "Prayer", plural: "Prayers" },
  hymns: { singular: "Hymn", plural: "Hymns" },
};

export interface PieceFrontmatter {
  title: string;
  author?: string;
  /** Where the text comes from, e.g. a book, tradition, or scripture reference. */
  source?: string;
  /** Free-form tags for grouping/filtering. */
  tags?: string[];
  /**
   * Path to an audio file for playback, relative to /public
   * (e.g. "/audio/poems/the-road-not-taken.mp3").
   * This is where AI-narrated recordings get wired in.
   */
  audio?: string;
  /** Optional short description shown in listings. */
  description?: string;
}

export interface PieceMeta extends PieceFrontmatter {
  type: ContentType;
  slug: string;
}

export interface Piece extends PieceMeta {
  /** Raw markdown body (frontmatter stripped). */
  content: string;
}

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}
