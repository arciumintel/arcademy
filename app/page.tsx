import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Users } from "lucide-react";
import AsciiFrontispiece from "@/components/home/AsciiFrontispiece";
import { listPrograms } from "@/lib/preview-data";

export default async function HomePage() {
  const programs = listPrograms();
  const featured = programs.find((p) => p.hubStatus === "featured") ?? programs[0];

  return (
    <div className="relative mx-auto w-full max-w-[1180px] pb-32 pt-6 md:pt-8">
      {/* Slim masthead */}
      <div className="mb-14 flex items-center justify-between border-y border-ink py-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink">
          Arcidex
        </span>
        <span
          className="hidden font-display italic text-[0.85rem] text-ink-muted sm:inline"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          Ecosystem onboarding for the Arcium network
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-soft">
          Hub · v1
        </span>
      </div>

      {/* Hero */}
      <section className="relative mb-24 grid items-end gap-12 md:grid-cols-[1fr_280px] lg:gap-20">
        <div
          className="pointer-events-none absolute right-[-4%] top-[-2%] z-0 hidden md:block"
          aria-hidden
        >
          <AsciiFrontispiece />
        </div>

        <div className="relative z-10">
          <p className="mb-5 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-accent">
            Launching with Arcium
          </p>
          <h1
            className="font-masthead text-[2.4rem] leading-[0.98] text-ink md:text-[3.6rem] lg:text-[4.4rem]"
            style={{
              fontWeight: 300,
              letterSpacing: "-0.035em",
              fontVariationSettings: "'opsz' 144, 'SOFT' 30",
            }}
          >
            One{" "}
            <em
              className="font-display"
              style={{
                fontStyle: "italic",
                fontWeight: 200,
                color: "var(--accent-c, #C5462E)",
                fontVariationSettings: "'opsz' 144, 'SOFT' 50",
              }}
            >
              checkpoint
            </em>{" "}
            for every ecosystem program.
          </h1>
          <p
            className="mt-7 max-w-[640px] font-display italic text-[1.22rem] leading-[1.45] text-ink-muted"
            style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
          >
            Partner apps in the Arcium ecosystem turn their docs into structured learning paths with
            comprehension checks. Learners get one account and a curated catalog. Staff governs publishing
            so nothing ships before it&rsquo;s ready.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            {featured ? (
              <Link
                href={`/programs/${featured.slug}`}
                className="ui-btn-filled inline-flex items-center gap-2 rounded-[2px] bg-ink px-6 py-3 font-ui text-[0.86rem] font-medium text-paper-deep hover:bg-accent"
              >
                Open {featured.title}
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            ) : null}
            <Link
              href="/programs"
              className="font-display italic text-[0.98rem] text-ink-muted underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              style={{ fontVariationSettings: "'opsz' 144" }}
            >
              or, browse all programs
            </Link>
          </div>
        </div>

        <dl
          className="relative z-10 grid grid-cols-2 gap-y-4 border-l border-rule pl-6 md:grid-cols-1 md:gap-y-5"
          style={{ paddingBottom: "0.4rem" }}
        >
          {[
            ["Programs", `${programs.length} listed`],
            ["Partners", "1 organisation"],
            ["Phase", "1 · learner loop"],
            ["Edition", "v1 · launching"],
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
      </section>

      {/* Three-pillar strip */}
      <section className="mb-24 grid grid-cols-1 gap-y-7 border-y border-ink py-9 md:grid-cols-3 md:gap-x-10 md:gap-y-0">
        {[
          {
            num: "i.",
            Icon: BookOpen,
            title: "Reading-first lessons",
            line: "Each program is a curated path of short readings, set in print-quality type. No video walls, no autoplay.",
          },
          {
            num: "ii.",
            Icon: ShieldCheck,
            title: "Verified comprehension",
            line: "Quizzes use platform-defined question types — partners configure the bounds, not the schema.",
          },
          {
            num: "iii.",
            Icon: Users,
            title: "One account, many programs",
            line: "Learners keep progress across every partner program; staff oversees what reaches the hub.",
          },
        ].map((pillar) => (
          <div key={pillar.title} className="relative block md:border-r md:border-rule md:pr-10 md:last:border-r-0">
            <div className="mb-2 flex items-center gap-3 text-accent">
              <span
                className="font-display italic text-[0.9rem]"
                style={{ fontVariationSettings: "'opsz' 144" }}
              >
                {pillar.num}
              </span>
              <pillar.Icon size={20} strokeWidth={1.4} className="text-ink-soft" />
            </div>
            <h3
              className="mb-2 font-display italic text-[1.32rem] text-ink"
              style={{
                fontWeight: 400,
                letterSpacing: "-0.015em",
                fontVariationSettings: "'opsz' 144, 'SOFT' 50",
              }}
            >
              {pillar.title}
            </h3>
            <p className="text-[0.96rem] leading-[1.55] text-ink-muted">{pillar.line}</p>
          </div>
        ))}
      </section>

      {/* Featured catalog */}
      <section className="mb-24">
        <div className="mb-8 flex items-baseline justify-between">
          <h2
            className="font-display italic text-[2rem] text-ink md:text-[2.4rem]"
            style={{
              fontWeight: 400,
              letterSpacing: "-0.02em",
              fontVariationSettings: "'opsz' 144, 'SOFT' 50",
            }}
          >
            On the hub
          </h2>
          <Link
            href="/programs"
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft hover:text-accent"
          >
            View all →
          </Link>
        </div>

        <ol className="border-t border-ink stagger">
          {programs.map((program, idx) => (
            <li key={program.slug}>
              <Link
                href={`/programs/${program.slug}`}
                className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-3 border-b border-dotted border-rule py-7 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b last:border-solid last:border-ink hover:pl-3 md:grid-cols-[64px_1fr_120px_auto] md:gap-y-0 md:py-9"
              >
                <span
                  className="self-stretch border-r border-rule pr-3 text-right font-display italic text-[1.5rem] text-accent md:flex md:items-center md:justify-end"
                  style={{ fontVariationSettings: "'opsz' 144" }}
                >
                  {romanize(idx + 1)}.
                </span>

                <div>
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3
                      className="font-display text-[1.5rem] text-ink transition-colors group-hover:text-accent md:text-[1.7rem]"
                      style={{
                        fontWeight: 400,
                        letterSpacing: "-0.015em",
                        fontVariationSettings: "'opsz' 144",
                      }}
                    >
                      {program.title}
                    </h3>
                    {program.hubStatus === "featured" ? (
                      <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-accent">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="max-w-[56ch] text-[0.98rem] leading-[1.55] text-ink-muted">
                    {program.tagline}
                  </p>
                </div>

                <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft">
                  <div>{program.trackCount} tracks</div>
                  <div className="mt-1">{program.lessonCount} lessons</div>
                  <div className="mt-1">~{program.estimatedHours} hrs</div>
                </div>

                <div className="self-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-accent">
                  Open →
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <footer className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-8 font-ui text-[0.82rem] text-ink-muted">
        <Link
          href="/programs"
          className="underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent"
        >
          Programs
        </Link>
        <Link
          href="/account"
          className="underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent"
        >
          Account
        </Link>
      </footer>
    </div>
  );
}

function romanize(n: number): string {
  const map: Array<[number, string]> = [
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let result = "";
  let num = n;
  for (const [value, sym] of map) {
    while (num >= value) {
      result += sym;
      num -= value;
    }
  }
  return result;
}
