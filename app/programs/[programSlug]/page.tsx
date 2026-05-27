import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { getProgramBySlug, listPrograms } from "@/lib/preview-data";

interface Props {
  params: Promise<{ programSlug: string }>;
}

export async function generateStaticParams() {
  return listPrograms().map((p) => ({ programSlug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { programSlug } = await params;
  const program = getProgramBySlug(programSlug);
  if (!program) return { title: "Not found" };
  return {
    title: program.title,
    description: program.tagline,
  };
}

export default async function ProgramPage({ params }: Props) {
  const { programSlug } = await params;
  const program = getProgramBySlug(programSlug);
  if (!program) notFound();

  const firstLesson = program.tracks[0]?.lessons[0];

  return (
    <div className="mx-auto w-full max-w-[1180px] pb-32 pt-6 md:pt-10">
      <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-soft">
        <Link href="/programs" className="hover:text-accent">Programs</Link>
        <span aria-hidden className="mx-2 text-ink-faint">/</span>
        {program.org}
      </p>

      <header className="mb-12 grid items-end gap-10 border-b border-ink pb-12 md:grid-cols-[1fr_280px]">
        <div>
          <h1
            className="font-masthead text-[2.4rem] leading-[0.98] text-ink md:text-[3.4rem]"
            style={{
              fontWeight: 300,
              letterSpacing: "-0.035em",
              fontVariationSettings: "'opsz' 144, 'SOFT' 30",
            }}
          >
            {program.title}
          </h1>
          <p
            className="mt-6 max-w-[640px] font-display italic text-[1.2rem] leading-[1.45] text-ink-muted"
            style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
          >
            {program.tagline}
          </p>

          {firstLesson ? (
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href={`/programs/${program.slug}/lessons/${firstLesson.slug}`}
                className="ui-btn-filled inline-flex items-center gap-2 rounded-[2px] bg-ink px-6 py-3 font-ui text-[0.86rem] font-medium text-paper-deep hover:bg-accent"
              >
                Begin reading
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
              <span
                className="font-display italic text-[0.95rem] text-ink-muted"
                style={{ fontVariationSettings: "'opsz' 144" }}
              >
                Starts with: {firstLesson.title}
              </span>
            </div>
          ) : null}
        </div>

        <dl
          className="grid grid-cols-2 gap-y-4 border-l border-rule pl-6 md:grid-cols-1 md:gap-y-5"
          style={{ paddingBottom: "0.4rem" }}
        >
          {[
            ["Organisation", program.org],
            ["Tracks", `${program.trackCount}`],
            ["Lessons", `${program.lessonCount}`],
            ["Reading time", `~${program.estimatedHours} hrs`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
                {label}
              </dt>
              <dd
                className="font-display italic text-[0.98rem] text-ink"
                style={{ fontVariationSettings: "'opsz' 144" }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <section>
        <div className="mb-8 flex items-baseline justify-between">
          <h2
            className="font-display italic text-[1.8rem] text-ink"
            style={{
              fontWeight: 400,
              letterSpacing: "-0.02em",
              fontVariationSettings: "'opsz' 144, 'SOFT' 50",
            }}
          >
            The reading path
          </h2>
          <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
            {program.trackCount} {program.trackCount === 1 ? "track" : "tracks"}
          </div>
        </div>

        <div className="space-y-12">
          {program.tracks.map((track, ti) => (
            <article key={track.slug}>
              <header className="mb-5 flex items-baseline gap-4">
                <span
                  className="shrink-0 font-display italic text-[1rem] text-accent"
                  style={{ fontVariationSettings: "'opsz' 144" }}
                >
                  Track {romanize(ti + 1)}.
                </span>
                <span className="h-px flex-1 bg-rule" />
                <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">
                  {track.lessons.length} {track.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </header>

              <div className="mb-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <h3
                  className="font-display text-[1.45rem] text-ink md:text-[1.65rem]"
                  style={{
                    fontWeight: 400,
                    letterSpacing: "-0.015em",
                    fontVariationSettings: "'opsz' 144",
                  }}
                >
                  {track.title}
                </h3>
                <span
                  className="font-display italic text-[0.95rem] text-ink-muted"
                  style={{ fontVariationSettings: "'opsz' 144" }}
                >
                  {track.description}
                </span>
              </div>

              <ol className="border-t border-rule">
                {track.lessons.map((lesson, li) => (
                  <li key={lesson.slug}>
                    <Link
                      href={`/programs/${program.slug}/lessons/${lesson.slug}`}
                      className="group grid grid-cols-1 items-baseline gap-x-6 gap-y-2 border-b border-dotted border-rule py-5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b-rule hover:pl-3 md:grid-cols-[80px_1fr_auto] md:gap-y-0"
                    >
                      <span
                        className="font-display italic text-[1rem] text-ink-soft md:text-right"
                        style={{ fontVariationSettings: "'opsz' 144" }}
                      >
                        {String(li + 1).padStart(2, "0")}.
                      </span>
                      <div>
                        <h4
                          className="font-display text-[1.18rem] text-ink transition-colors group-hover:text-accent"
                          style={{
                            fontWeight: 400,
                            letterSpacing: "-0.012em",
                            fontVariationSettings: "'opsz' 144",
                          }}
                        >
                          {lesson.title}
                        </h4>
                        <p className="mt-1 max-w-[58ch] text-[0.95rem] leading-[1.5] text-ink-muted">
                          {lesson.blurb}
                        </p>
                      </div>
                      <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                        <span>{lesson.readingMinutes} min</span>
                        {lesson.hasQuiz ? (
                          <span className="ml-3 text-accent">+ quiz</span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function romanize(n: number): string {
  const map: Array<[number, string]> = [
    [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
  ];
  let result = "";
  let num = n;
  for (const [v, s] of map) {
    while (num >= v) { result += s; num -= v; }
  }
  return result;
}
