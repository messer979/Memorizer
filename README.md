# Memorizer

A quiet library of **poems, prayers, and hymns** — built to read, listen to, and
commit to memory. Content is plain markdown committed straight to the repo, so
adding a piece is just adding a file.

Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

## Adding content

Each piece is a markdown file in one of three folders:

```
content/
  poems/
  prayers/
  hymns/
```

The file name becomes the URL slug (`content/poems/the-road-not-taken.md` →
`/poems/the-road-not-taken`). Every file starts with YAML frontmatter:

```markdown
---
title: The Road Not Taken      # required
author: Robert Frost           # optional
source: Mountain Interval (1916)  # optional — book, tradition, scripture ref
tags: [choice, nature]         # optional
audio: /audio/poems/the-road-not-taken.mp3  # optional — see below
description: One line shown in previews and metadata.  # optional
---

Two roads diverged in a yellow wood,
And sorry I could not travel both
...
```

**Line breaks are preserved.** Single newlines render as line breaks (via
`remark-breaks`), and blank lines separate stanzas — so just paste verse as-is.
Standard markdown (headings, *emphasis*, blockquotes) works too; the
`Veni Creator Spiritus` hymn shows Latin + an English translation under a
heading.

## Audio (AI narration)

The reading experience is built around playback for memorization. To attach
audio to a piece:

1. Drop the file in `public/audio/<type>/`, e.g.
   `public/audio/hymns/veni-creator-spiritus.mp3`.
2. Point the `audio:` frontmatter field at it (path is relative to `public/`).

The piece page then shows a player with a **speed control** (0.75×–1.5×), and
listings mark audio-enabled pieces with a ♪. This is where AI-generated
recordings get wired in — just commit the audio files alongside the markdown.

## Memorize mode

Every piece page has three reading modes:

- **Read** — the full text.
- **Blur** — text is blurred; tap a line to reveal it.
- **First letters** — each word collapses to its first letter (`Whose woods…` →
  `W… w…`), the classic recall drill. Tap a line to check yourself.

## Latin word lookup

On any piece **tagged `latin`**, the Read view lets you look up a word: select
it (or double-click) and a **Look up** button appears; clicking it opens a
definition popover.

Definitions come from public dictionaries, not a hand-maintained lexicon, via a
small server route (`app/api/define`):

- **Whitaker's Words** — parses *inflected* Latin forms back to the dictionary
  headword and reports the grammar (case/tense/mood). This is what makes
  clicking `spiritui` resolve to `spiritus`.
- **Wiktionary** — used as a fallback and for other languages; returns clean
  JSON definitions.

The route caches results and never hard-fails: if an upstream is down it just
returns whatever it has, and the popover shows a graceful message. To enable
lookup on a piece, add `latin` to its `tags`.

## Project layout

```
app/
  page.tsx                 # home / full library
  [type]/page.tsx          # a category listing (poems | prayers | hymns)
  [type]/[slug]/page.tsx   # an individual piece
  api/define/route.ts      # dictionary lookup proxy (Whitaker's + Wiktionary)
components/                # Reader, AudioPlayer, PieceList, LookupProvider
lib/
  content.ts               # reads & parses markdown from /content
  types.ts                 # content types + frontmatter shape
content/                   # the library itself (markdown)
public/audio/              # narration files
```
