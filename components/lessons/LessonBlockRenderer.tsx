import type { ContentBlock } from "@/lib/content-blocks/schema";

/**
 * Sanitised renderer for the v1 block set: heading | paragraph | callout |
 * code | image | divider. No raw HTML, no Markdoc — each block is a typed
 * leaf with deterministic mapping to JSX.
 */
export default function LessonBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} index={i} />
      ))}
    </div>
  );
}

function Block({ block, index }: { block: ContentBlock; index: number }) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2
          className="mt-10 font-display text-[1.55rem] text-ink md:text-[1.85rem]"
          style={{
            fontWeight: 400,
            letterSpacing: "-0.02em",
            fontVariationSettings: "'opsz' 144, 'SOFT' 40",
          }}
        >
          {block.text.en}
        </h2>
      );
    }
    return (
      <h3
        className="mt-8 font-display italic text-[1.25rem] text-ink"
        style={{
          fontWeight: 400,
          letterSpacing: "-0.015em",
          fontVariationSettings: "'opsz' 144, 'SOFT' 50",
        }}
      >
        {block.text.en}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p
        className={
          index === 0
            ? "drop-cap font-body text-[1.08rem] leading-[1.72] text-ink md:text-[1.1rem]"
            : "font-body text-[1.08rem] leading-[1.72] text-ink md:text-[1.1rem]"
        }
      >
        {block.text.en}
      </p>
    );
  }

  if (block.type === "callout") {
    const variantColor =
      block.variant === "warning"
        ? "border-l-accent text-ink"
        : "border-l-ochre text-ink-muted";
    return (
      <aside
        className={`my-6 border-l-2 ${variantColor} bg-paper-deep px-5 py-4 font-body text-[0.98rem] leading-[1.65]`}
      >
        <span
          aria-hidden
          className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink-soft"
        >
          {block.variant === "warning" ? "Caution" : "Note"}
        </span>
        {block.text.en}
      </aside>
    );
  }

  if (block.type === "code") {
    return (
      <div className="my-6 overflow-hidden rounded-[3px] border border-rule bg-paper-shade">
        <header className="flex items-center justify-between border-b border-rule px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft">
          <span>{block.language}</span>
          <span className="font-display italic" style={{ fontStyle: "italic" }}>
            snippet
          </span>
        </header>
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.82rem] leading-[1.65] text-ink">
          {block.snippet}
        </pre>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.cloudinary_url}
          alt={block.alt.en}
          className="block w-full border border-rule"
        />
        {block.caption ? (
          <figcaption
            className="mt-3 text-center font-display italic text-[0.92rem] text-ink-muted"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            {block.caption.en}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "divider") {
    return (
      <div className="my-8 text-center font-display text-[1.1rem] tracking-[0.5em] text-ink-soft" aria-hidden>
        ⁂
      </div>
    );
  }

  return null;
}
