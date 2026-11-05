import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import ChantScore from "@/components/ChantScore";
import GabcPlayground from "@/components/GabcPlayground";

export const metadata: Metadata = {
  title: "Reading chant",
  description:
    "A short guide to Gregorian square notation (the staff, clefs, neumes and the little ticks) and to gabc, the text format the chant in this app is written in.",
};

interface Example {
  name: string;
  /** Shown as code under the rendering; the clef is prepended automatically. */
  gabc: string;
  clef?: string;
  children: ReactNode;
}

function ExampleCard({ name, gabc, clef = "c4", children }: Example) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold">{name}</h3>
      <div className="my-2">
        <ChantScore gabc={`(${clef}) ${gabc}`} label={name} dropCap={false} size={1.6} />
      </div>
      <code className="block text-xs text-muted font-mono mb-2 break-all">{gabc}</code>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-14 scroll-mt-6">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      <div className="space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-card border border-border px-1 py-0.5 font-mono text-[0.85em]">{children}</code>;
}

const CHANTS = [
  { slug: "o-spem-miram", title: "O Spem Miram", mode: "I", final: "re" },
  { slug: "ave-maris-stella", title: "Ave Maris Stella", mode: "I", final: "re" },
  { slug: "pange-lingua", title: "Pange Lingua", mode: "III", final: "mi" },
  { slug: "adoro-te-devote", title: "Adoro Te Devote", mode: "V", final: "fa" },
  { slug: "veni-creator-spiritus", title: "Veni Creator Spiritus", mode: "VIII", final: "sol" },
];

export default function ChantGuidePage() {
  return (
    <article>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Reading chant</h1>
        <p className="mt-3 text-lg text-muted max-w-prose">
          The hymns in this library can be shown in the square notation of
          Gregorian chant. It looks strange at first, but there are only a few
          ideas to learn. Every example on this page is drawn live from its gabc
          code (shown under it), the same way the hymns are.
        </p>
        <nav className="mt-5 flex flex-wrap gap-2 text-sm">
          {[
            ["staff", "Staff & clefs"],
            ["neumes", "Notes & neumes"],
            ["ticks", "The little ticks"],
            ["bars", "Bars & breathing"],
            ["text", "Signs in the text"],
            ["modes", "Modes"],
            ["gabc", "What is gabc?"],
            ["try", "Try it"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full border border-border px-3 py-1 text-muted hover:border-accent hover:text-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <Section id="staff" title="The staff and the clef">
        <p>
          Chant is written on a staff of <strong>four lines</strong>, not five:
          a chant melody rarely spans more than an octave or so, and a ledger
          line handles the odd note that goes beyond it.
        </p>
        <p>
          The staff doesn’t fix an absolute pitch. Instead, the <strong>clef</strong>{" "}
          tells you where one note of the scale sits, and you read every other
          note from there, like solfège with a movable <em>do</em>. The singer
          (or the choir’s cantor) picks a comfortable starting pitch.
        </p>
        <Grid>
          <ExampleCard name="C clef (do clef)" gabc="Do(j) ti(i) la(h) sol(g) fa(f) mi(e) re(d) do(c)">
            The bracket shape marks <em>do</em>. Here it’s on the 4th (top) line,
            so the top line is <em>do</em> and the scale runs down from it. This
            is <Code>c4</Code>.
          </ExampleCard>
          <ExampleCard
            name="The same clef, one line lower"
            clef="c3"
            gabc="Do(h) ti(g) la(f) sol(e) fa(d) mi(c)"
          >
            Clefs move to keep a melody on the staff. In <Code>c3</Code>, the
            third line is <em>do</em>. Veni Creator is written this way.
          </ExampleCard>
          <ExampleCard name="F clef (fa clef)" clef="f3" gabc="Fa(h) mi(g) re(f) do(e) do(e) re(f) mi(g) fa(h)">
            This shape marks <em>fa</em>, here on the 3rd line (<Code>f3</Code>).
            It’s used less often, for melodies that sit lower.
          </ExampleCard>
          <ExampleCard name="Clef with a flat" clef="cb3" gabc="Do(h) ti(g) la(f) ti(g) do(h)">
            A flat beside the clef flattens <em>ti</em> for the whole piece, so it
            sounds a half step lower (<Code>cb3</Code>). Adoro Te Devote uses
            one.
          </ExampleCard>
        </Grid>
      </Section>

      <Section id="neumes" title="Notes and neumes">
        <p>
          Each square is one note. The notes sung on a single syllable are drawn
          together as a <strong>neume</strong>. You read left to right, except
          that <strong>when two notes are stacked, you sing the lower one
          first</strong>. Every note gets roughly the same short value; there are
          no quarter or half notes.
        </p>
        <Grid>
          <ExampleCard name="Punctum" gabc="(g) (h) (f)">
            The basic square note: one note, one beat.
          </ExampleCard>
          <ExampleCard name="Virga" gabc="(gv) (hv)">
            A note with a stem on the right. Today it’s sung just like a punctum;
            the stem is a reminder of older handwritten neumes.
          </ExampleCard>
          <ExampleCard name="Podatus (pes)" gabc="(gh) (fh)">
            Two notes stacked: <strong>sing the bottom note first</strong>, then
            step up.
          </ExampleCard>
          <ExampleCard name="Clivis" gabc="(hg) (hf)">
            Two notes going down, joined by a stem on the left.
          </ExampleCard>
          <ExampleCard name="Torculus" gabc="(ghg) (fhg)">
            Three notes: up, then down.
          </ExampleCard>
          <ExampleCard name="Porrectus" gabc="(hgh) (igh)">
            Three notes: down, then up. The slanted stroke stands for the first
            two notes: its top-left corner is the first note, its bottom-right
            end the second.
          </ExampleCard>
          <ExampleCard name="Scandicus" gabc="(fgh)">
            Three or more notes rising.
          </ExampleCard>
          <ExampleCard name="Climacus" gabc="(hvGF) (ivHGF)">
            A note followed by small <strong>diamonds</strong> (puncta
            inclinata) running down: a quick descent, sung smoothly.
          </ExampleCard>
          <ExampleCard name="Quilisma" gabc="(fgwh)">
            The jagged middle note. Sing it lightly; the note <em>before</em> it
            is lengthened a little.
          </ExampleCard>
          <ExampleCard name="Liquescent" gabc="(gh~) (hg~)">
            A smaller last note, on syllables that end in a soft consonant (n, m,
            l, r) or a diphthong. It marks a gentle glide; sing the note, just
            lightly.
          </ExampleCard>
        </Grid>
      </Section>

      <Section id="ticks" title="The little ticks (rhythm marks)">
        <p>
          The small marks next to the notes don’t change their pitch; they shape
          the rhythm. They come from the editions of the monks of Solesmes, whose
          books (like the <em>Liber Usualis</em>) most of these hymns are taken
          from.
        </p>
        <Grid>
          <ExampleCard name="Vertical episema (ictus)" gabc="(g') (h) (g) (f') (g)">
            The short vertical tick under (or over) a note. It marks where a
            rhythmic group of two or three notes begins. It’s a gentle
            “touchdown”, <strong>not an accent</strong>: don’t sing it louder.
            Many singers just let it guide the phrasing.
          </ExampleCard>
          <ExampleCard name="Dot (mora)" gabc="(g) (h) (g.) (f.)">
            A dot after a note roughly <strong>doubles</strong> its length. You’ll
            see it at the end of phrases.
          </ExampleCard>
          <ExampleCard name="Horizontal episema" gabc="(g_) (h_) (g) (f)">
            A short dash above the note: <strong>broaden it slightly</strong>,
            without doubling it.
          </ExampleCard>
          <ExampleCard name="Custos (guide)" gabc="(g) (h) (g) (h+)">
            The tiny note with a tail at the <strong>end of each line</strong>.
            It isn’t sung; it previews the first note of the next line so your
            eye is ready for it.
          </ExampleCard>
        </Grid>
      </Section>

      <Section id="bars" title="Bars and breathing">
        <p>
          Bars in chant are about <strong>phrasing and breath</strong>, not
          counting beats.
        </p>
        <Grid>
          <ExampleCard name="Quarter bar" gabc="(g) (h) (,) (g)">
            A tick through the top line. The shortest pause: take a quick breath
            only if you need one.
          </ExampleCard>
          <ExampleCard name="Half bar" gabc="(g) (h) (;) (g)">
            Across the middle of the staff: a short breath.
          </ExampleCard>
          <ExampleCard name="Full bar" gabc="(g) (h) (:) (g)">
            Across the whole staff: the end of a phrase, a full breath.
          </ExampleCard>
          <ExampleCard name="Double bar" gabc="(g) (h) (::)">
            The end of a piece, or of a section (often where the choir takes
            over, or a new verse begins).
          </ExampleCard>
          <ExampleCard name="Flat and natural" gabc="(ixhi) (iyhi)">
            Only <em>ti</em> is ever flattened. A flat in the line lasts until the
            next bar or the end of the word; a natural sign cancels it.
          </ExampleCard>
        </Grid>
      </Section>

      <Section id="text" title="Signs in the text">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>The big initial</strong> is the first letter of the text.
            Keep reading the word with the syllables under the first notes:{" "}
            <em>A · ve</em>, <em>P · ange</em>.
          </li>
          <li>
            <strong>The numeral above the initial</strong> (I, III, V, VIII…) is
            the <a href="#modes" className="text-accent hover:underline">mode</a>.
            O Spem Miram also says <em>℟. toni i.</em>: a responsory in the first
            mode.
          </li>
          <li>
            <strong>Accents</strong> (<em>Dómine</em>, <em>glória</em>) mark the
            stressed syllable. Latin doesn’t need them, but chant books print
            them to help with pronunciation.
          </li>
          <li>
            <strong>An asterisk ✱</strong> marks where the choir joins in after
            the cantor’s opening, or where a repeat begins.
          </li>
          <li>
            <strong>℟ and ℣</strong> mark the response (sung by everyone) and the
            verse (often sung by a soloist).
          </li>
          <li>
            <strong>2., 3., …</strong> are the verse numbers of a hymn: every
            verse uses the same melody.
          </li>
          <li>
            <strong>T.P.</strong> (<em>Tempore Paschali</em>) means “in
            Eastertide”: the bit that follows, usually an Alleluia, is added only
            during the Easter season.
          </li>
        </ul>
      </Section>

      <Section id="modes" title="Modes">
        <p>
          Chant uses eight <strong>modes</strong> rather than major and minor
          keys. A mode is a scale with its own home note (the{" "}
          <strong>final</strong>, where melodies come to rest) and its own
          character. Modes come in pairs that share a final: I &amp; II end on{" "}
          <em>re</em>, III &amp; IV on <em>mi</em>, V &amp; VI on <em>fa</em>,
          VII &amp; VIII on <em>sol</em>. The odd modes tend to range above the
          final, the even ones around it.
        </p>
        <p>The hymns in this library:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted border-b border-border">
              <tr>
                <th className="py-2 pr-4 font-medium">Hymn</th>
                <th className="py-2 pr-4 font-medium">Mode</th>
                <th className="py-2 font-medium">Ends on</th>
              </tr>
            </thead>
            <tbody>
              {CHANTS.map((c) => (
                <tr key={c.slug} className="border-b border-border">
                  <td className="py-2 pr-4">
                    <Link href={`/hymns/${c.slug}`} className="text-accent hover:underline">
                      {c.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{c.mode}</td>
                  <td className="py-2"><em>{c.final}</em></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="gabc" title="What is gabc?">
        <p>
          <strong>gabc</strong> is a plain-text way of writing chant, made for{" "}
          <a href="https://gregorio-project.github.io/" className="text-accent hover:underline">
            Gregorio
          </a>
          , the open-source chant engraver. The name nods to{" "}
          <em>ABC notation</em>, a text format for folk tunes, with a{" "}
          <em>g</em> for Gregorio (and Gregorian). The chants in this app are
          stored as gabc files and drawn in your browser by{" "}
          <a href="https://github.com/bbloomf/exsurge" className="text-accent hover:underline">
            exsurge
          </a>
          .
        </p>
        <p>
          You write the words, and after each syllable put its notes in
          parentheses:
        </p>
        <ExampleCard name="One phrase of Pange Lingua" gabc="Pan(e)ge(e') lin(f)gua(ed) glo(g')ri(g)ó(hj)si(j.) (,)">
          <Code>(c4)</Code> sets the clef, <Code>Pan(e)</Code> sings{" "}
          <em>Pan</em> on the note <Code>e</Code>, <Code>gua(ed)</Code> sings two
          notes (a clivis) on <em>gua</em>, <Code>&apos;</Code> adds a tick,{" "}
          <Code>.</Code> adds a dot, and <Code>(,)</Code> is a quarter bar.
        </ExampleCard>
        <p>
          The one surprise: <strong>the letters aren’t note names</strong>. They
          are <strong>positions on the staff</strong>, from <Code>a</Code> (below
          the staff) up to <Code>m</Code> (above it). The lines are{" "}
          <Code>d</Code>, <Code>f</Code>, <Code>h</Code> and <Code>j</Code>, and
          the letters between them are the spaces. What a letter sounds like
          depends on the clef.
        </p>
        <ExampleCard name="Every staff position" gabc="a(a) b(b) c(c) d(d) e(e) f(f) g(g) h(h) i(i) j(j) k(k) l(l) m(m)">
          Under each note is the letter that puts it there. With the{" "}
          <Code>c4</Code> clef, <Code>j</Code> is <em>do</em>; with{" "}
          <Code>c3</Code>, <Code>h</Code> is.
        </ExampleCard>
        <p>The rest of the symbols you’ll meet in this app’s chants:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <tbody>
              {(
                [
                  ["c4, c3, f3, cb3", "Clef: C or F (b adds a flat), on line 1–4"],
                  ["g", "A note (punctum) at that position"],
                  ["gh, hg, ghg …", "Several notes on one syllable make a neume"],
                  ["gv", "Virga (stem)"],
                  ["G", "Capital letter: a diamond (punctum inclinatum)"],
                  ["gw", "Quilisma"],
                  ["g~", "Liquescent (small) note"],
                  ["g.", "Dot: lengthen"],
                  ["g_", "Horizontal episema: broaden slightly"],
                  ["g'", "Vertical episema: the little tick"],
                  ["ix, iy", "Flat or natural at that position"],
                  [", ; : ::", "Quarter, half, full and double bar"],
                  ["g+", "Custos (guide note at the end of a line)"],
                  ["z, Z", "Force a line break (justified or ragged)"],
                  ["/ and space", "Small or larger gaps between neumes on one syllable"],
                  ["<i>…</i>, <c>…</c>", "Italic text, or red (rubric) text"],
                ] as [string, string][]
              ).map(([code, meaning]) => (
                <tr key={code} className="border-b border-border">
                  <td className="py-2 pr-4 font-mono whitespace-nowrap">{code}</td>
                  <td className="py-2">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          A gabc file starts with a few header lines (<Code>name:</Code>,{" "}
          <Code>mode:</Code>, <Code>book:</Code> …) and a <Code>%%</Code> line,
          then the chant. Thousands of chants are transcribed this way on{" "}
          <a href="https://gregobase.selapa.net/" className="text-accent hover:underline">
            GregoBase
          </a>
          , which is where most of this library’s chants come from.
        </p>
      </Section>

      <Section id="try" title="Try it">
        <p>
          Change a letter and watch the note move. Try adding <Code>&apos;</Code>,{" "}
          <Code>.</Code> or <Code>~</Code> after a note, or <Code>(:)</Code>{" "}
          between words.
        </p>
        <GabcPlayground />
      </Section>
    </article>
  );
}
