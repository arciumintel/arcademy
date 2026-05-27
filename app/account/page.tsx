import Link from "next/link";

export const metadata = {
  title: "Account",
  description: "Your enrollments and progress across every program on the Arcidex hub.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-[860px] pb-32 pt-6 md:pt-10">
      <header className="mb-12 border-b border-ink pb-10">
        <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft">
          Account
        </p>
        <h1
          className="font-masthead text-[2.4rem] leading-[0.98] text-ink md:text-[3.2rem]"
          style={{
            fontWeight: 300,
            letterSpacing: "-0.035em",
            fontVariationSettings: "'opsz' 144, 'SOFT' 30",
          }}
        >
          Your enrollments.
        </h1>
        <p
          className="mt-6 max-w-[620px] font-display italic text-[1.12rem] leading-[1.5] text-ink-muted"
          style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
        >
          One Arcidex account holds your progress across every program on the hub. Sign in to keep
          a lesson, restart a quiz, and resume where you left off.
        </p>
      </header>

      <section className="rounded-[3px] border border-rule bg-paper-deep p-8 md:p-10">
        <p
          className="font-display italic text-[1.05rem] text-ink-muted"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          You&rsquo;re reading as a guest.
        </p>
        <p className="mt-4 font-body text-[1.02rem] leading-[1.62] text-ink">
          Phase 1 of Arcidex includes a guest-friendly path: open Lesson 01 of any featured program,
          read it through, and choose to save progress on completion. Until you sign up, nothing is
          tracked beyond the current tab.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="ui-btn-filled rounded-[2px] bg-ink px-5 py-2.5 font-ui text-[0.84rem] font-medium text-paper-deep hover:bg-accent"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="font-display italic text-[0.96rem] text-ink-muted underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            or, create an account
          </Link>
        </div>
      </section>

      <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
        Auth wiring: <span className="text-ink-muted">better-auth · /api/auth/[...all]</span>
      </p>
    </div>
  );
}
