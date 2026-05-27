import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LessonBlockRenderer from "@/components/lessons/LessonBlockRenderer";
import { findLesson, getProgramBySlug, listPrograms } from "@/lib/preview-data";

interface Props {
  params: Promise<{ programSlug: string; lessonSlug: string }>;
}

export async function generateStaticParams() {
  const out: { programSlug: string; lessonSlug: string }[] = [];
  for (const program of listPrograms()) {
    for (const track of program.tracks) {
      for (const lesson of track.lessons) {
        out.push({ programSlug: program.slug, lessonSlug: lesson.slug });
      }
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props) {
  const { programSlug, lessonSlug } = await params;
  const lesson = findLesson(programSlug, lessonSlug);
  if (!lesson) return { title: "Not found" };
  return { title: lesson.title, description: lesson.blurb };
}

export default async function LessonPage({ params }: Props) {
  const { programSlug, lessonSlug } = await params;
  const lesson = findLesson(programSlug, lessonSlug);
  const program = getProgramBySlug(programSlug);
  if (!lesson || !program) notFound();

  // Build a flat lesson list to compute prev/next within the program
  const flat = program.tracks.flatMap((t) =>
    t.lessons.map((l) => ({ slug: l.slug, title: l.title, trackTitle: t.title })),
  );
  const idx = flat.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const lessonNumberLabel = String(idx + 1).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-3xl pb-32 pt-6 md:pt-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-10 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-soft"
      >
        <Link href="/programs" className="hover:text-ink">Programs</Link>
        <span aria-hidden className="text-ink-faint">/</span>
        <Link href={`/programs/${program.slug}`} className="hover:text-ink">{program.title}</Link>
        <span aria-hidden className="text-ink-faint">/</span>
        <span>Lesson {lessonNumberLabel}</span>
      </nav>

      <header className="border-b border-ink pb-10">
        <div
          className="mb-5 flex items-center gap-3 font-display italic text-[0.92rem] text-ink-soft"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          <span className="text-accent">{lesson.trackTitle}</span>
          <span aria-hidden className="h-px w-[22px] bg-rule" />
          <span>Lesson {lessonNumberLabel} of {String(flat.length).padStart(2, "0")}</span>
        </div>
        <h1
          className="font-masthead text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.98] text-ink"
          style={{
            fontWeight: 300,
            letterSpacing: "-0.035em",
            fontVariationSettings: "'opsz' 144, 'SOFT' 30",
          }}
        >
          {lesson.title}
        </h1>
        <p
          className="mt-7 max-w-[42rem] font-display italic text-[1.2rem] leading-[1.45] text-ink-muted"
          style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
        >
          {lesson.blurb}
        </p>
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] tabular-nums text-ink-soft">
          <span>By the editors</span>
          <span aria-hidden className="text-ink-faint">·</span>
          <span>{lesson.readingMinutes} min read</span>
          {lesson.quiz ? (
            <>
              <span aria-hidden className="text-ink-faint">·</span>
              <span className="text-accent">+ comprehension check</span>
            </>
          ) : null}
        </p>
      </header>

      <article className="mt-10 md:mt-12">
        <LessonBlockRenderer blocks={lesson.blocks} />
      </article>

      {lesson.quiz ? (
        <section className="mt-16 border-t border-ink pt-12">
          <header className="mb-7">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft">
              § Comprehension check
            </p>
            <h2
              className="mt-2 font-display italic text-[1.6rem] text-ink md:text-[1.95rem]"
              style={{
                fontWeight: 400,
                letterSpacing: "-0.02em",
                fontVariationSettings: "'opsz' 144, 'SOFT' 50",
              }}
            >
              Check yourself
            </h2>
          </header>
          <div className="rounded-[3px] border border-rule bg-paper-deep p-6 md:p-8">
            <ol className="space-y-8">
              {lesson.quiz.questions.map((q, qi) => (
                <li key={q.id}>
                  <div className="mb-3 flex items-baseline gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                    <span className="text-accent">Q{qi + 1}.</span>
                    <span>{q.type === "single" ? "Single choice" : "Short answer"}</span>
                  </div>
                  <p className="mb-4 font-body text-[1.05rem] leading-[1.55] text-ink">{q.prompt}</p>
                  {q.type === "single" ? (
                    <ul className="space-y-2">
                      {q.choices.map((choice, ci) => (
                        <li key={ci}>
                          <label className="group flex items-baseline gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              className="mt-1 h-3 w-3 accent-[var(--accent-c,#C5462E)]"
                            />
                            <span className="text-[0.98rem] leading-[1.55] text-ink-muted group-hover:text-ink">
                              {choice}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <textarea
                      className="w-full min-h-[80px] rounded-[2px] border border-rule bg-paper p-3 font-body text-[0.98rem] leading-[1.6] text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
                      placeholder="One or two sentences."
                    />
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                className="ui-btn-filled rounded-[2px] bg-ink px-5 py-2.5 font-ui text-[0.84rem] font-medium text-paper-deep hover:bg-accent"
              >
                Submit answers
              </button>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                Not submitted
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <div
        className="my-12 text-center font-display text-[1.2rem] tracking-[0.5em] text-ink-soft"
        style={{ fontVariationSettings: "'opsz' 144" }}
        aria-hidden
      >
        ⸙
      </div>

      <nav
        aria-label="Lesson navigation"
        className="flex flex-col gap-8 pt-2 sm:flex-row sm:justify-between"
      >
        {prev ? (
          <Link
            href={`/programs/${program.slug}/lessons/${prev.slug}`}
            className="ui-tap group max-w-sm"
          >
            <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              <ArrowLeft size={12} strokeWidth={1.5} /> Previous
            </span>
            <span
              className="mt-1 block font-display italic text-[1.05rem] leading-snug text-ink group-hover:text-accent"
              style={{ fontVariationSettings: "'opsz' 144" }}
            >
              {prev.title}
            </span>
          </Link>
        ) : (
          <span
            className="font-display italic text-[0.92rem] text-ink-soft"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            First lesson
          </span>
        )}
        {next ? (
          <Link
            href={`/programs/${program.slug}/lessons/${next.slug}`}
            className="ui-tap group max-w-sm sm:text-right"
          >
            <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              Next <ArrowRight size={12} strokeWidth={1.5} />
            </span>
            <span
              className="mt-1 block font-display italic text-[1.05rem] leading-snug text-ink group-hover:text-accent"
              style={{ fontVariationSettings: "'opsz' 144" }}
            >
              {next.title}
            </span>
          </Link>
        ) : (
          <span
            className="font-display italic text-[0.92rem] text-ink-soft sm:text-right"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            End of program
          </span>
        )}
      </nav>
    </div>
  );
}
