import Link from "next/link";
import { listPrograms } from "@/lib/preview-data";

export const metadata = {
  title: "Programs",
  description: "The full Arcidex program catalog — every learning path on the hub.",
};

export default async function ProgramsPage() {
  const programs = listPrograms();

  return (
    <div className="mx-auto w-full max-w-[1180px] pb-32 pt-6 md:pt-10">
      <header className="mb-12 border-b border-ink pb-10">
        <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft">
          Catalog
        </p>
        <h1
          className="font-masthead text-[2.4rem] leading-[0.98] text-ink md:text-[3.6rem]"
          style={{
            fontWeight: 300,
            letterSpacing: "-0.035em",
            fontVariationSettings: "'opsz' 144, 'SOFT' 30",
          }}
        >
          Every program on{" "}
          <em
            className="font-display"
            style={{
              fontStyle: "italic",
              fontWeight: 200,
              color: "var(--accent-c, #C5462E)",
              fontVariationSettings: "'opsz' 144, 'SOFT' 50",
            }}
          >
            the hub
          </em>
          .
        </h1>
        <p
          className="mt-6 max-w-[680px] font-display italic text-[1.15rem] leading-[1.5] text-ink-muted"
          style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
        >
          {programs.length} {programs.length === 1 ? "program" : "programs"} listed. Each is a structured reading
          path produced by, or in partnership with, an ecosystem team.
        </p>
      </header>

      <ol className="border-t border-ink stagger">
        {programs.map((program, idx) => (
          <li key={program.slug}>
            <Link
              href={`/programs/${program.slug}`}
              className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-3 border-b border-dotted border-rule py-8 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b last:border-solid last:border-ink hover:pl-3 md:grid-cols-[64px_1fr_180px] md:gap-y-0 md:py-10"
            >
              <span
                className="self-stretch border-r border-rule pr-3 text-right font-display italic text-[1.5rem] text-accent md:flex md:items-center md:justify-end"
                style={{ fontVariationSettings: "'opsz' 144" }}
              >
                {romanize(idx + 1)}.
              </span>

              <div>
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2
                    className="font-display text-[1.6rem] text-ink transition-colors group-hover:text-accent md:text-[1.85rem]"
                    style={{
                      fontWeight: 400,
                      letterSpacing: "-0.015em",
                      fontVariationSettings: "'opsz' 144",
                    }}
                  >
                    {program.title}
                  </h2>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-soft">
                    by {program.org}
                  </span>
                  {program.hubStatus === "featured" ? (
                    <span className="rounded-[2px] border border-accent px-1.5 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-accent">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="max-w-[62ch] text-[1rem] leading-[1.55] text-ink-muted">
                  {program.tagline}
                </p>
              </div>

              <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft">
                <div>{program.trackCount} tracks</div>
                <div className="mt-1">{program.lessonCount} lessons</div>
                <div className="mt-1">~{program.estimatedHours} hrs</div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
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
