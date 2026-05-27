"use client";

import { usePathname } from "next/navigation";

const EASE = "cubic-bezier(0.22,1,0.36,1)";

const TITLE_MAP: Record<string, string> = {
  "/": "",
  "/programs": "Programs",
  "/account": "Account",
};

function deriveTitle(pathname: string): string {
  if (TITLE_MAP[pathname] !== undefined) return TITLE_MAP[pathname];
  if (pathname.startsWith("/programs/")) {
    const segs = pathname.split("/").filter(Boolean);
    // /programs/[slug] or /programs/[slug]/lessons/[lessonSlug]
    if (segs.length >= 4 && segs[2] === "lessons") {
      return `${capitalize(segs[1] ?? "")} · ${capitalize(segs[3] ?? "")}`;
    }
    return capitalize(segs[1] ?? "Program");
  }
  return "";
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

export default function PortalTopBar() {
  const pathname = usePathname() || "/";
  const title = deriveTitle(pathname);
  const isHome = pathname === "/";

  return (
    <header
      className="sticky top-0 z-40 w-full bg-background"
      style={{ transition: `box-shadow 280ms ${EASE}` }}
    >
      <div
        className="flex w-full items-baseline justify-between gap-6"
        style={{
          paddingLeft: "clamp(20px, 4vw, 64px)",
          paddingRight: "clamp(20px, 4vw, 64px)",
          paddingTop: "1.1rem",
          paddingBottom: "0.6rem",
        }}
      >
        <div className="flex min-w-0 flex-1 items-baseline gap-4">
          {!isHome ? (
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ink-soft md:inline">
              Arcidex
              <span aria-hidden className="mx-2 text-ink-faint">·</span>
            </span>
          ) : null}

          {isHome ? (
            <span className="sr-only">Hub</span>
          ) : (
            <h1
              className="m-0 min-w-0 truncate font-display italic text-ink"
              style={{
                fontWeight: 400,
                fontSize: "1.35rem",
                letterSpacing: "-0.012em",
                fontVariationSettings: "'opsz' 144, 'SOFT' 50",
              }}
            >
              {title}
            </h1>
          )}
        </div>
      </div>
      <span aria-hidden className="block h-px w-full bg-rule" />
    </header>
  );
}
