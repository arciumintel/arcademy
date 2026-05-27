/**
 * Preview-mode data — used when `DATABASE_URL` is absent (typical for
 * design previews and local dev without a Neon connection). Returns the
 * same shapes the production repositories return so server pages can opt
 * into preview mode by checking `PREVIEW_MODE` first.
 *
 * The Arcium program below is structurally identical to what
 * `scripts/seed-arcium.mjs` writes to Postgres at boot — a single curated
 * launch program. New partner programs join the catalog through staff
 * authoring, not by editing this file.
 */
import type { ContentBlock } from "@/lib/content-blocks/schema";

export const PREVIEW_MODE = !process.env.DATABASE_URL;

export type PreviewProgram = {
  slug: string;
  title: string;
  tagline: string;
  org: string;
  hubStatus: "listed" | "featured";
  featuredRank: number | null;
  lessonCount: number;
  trackCount: number;
  estimatedHours: number;
  tracks: PreviewTrack[];
};

export type PreviewTrack = {
  slug: string;
  title: string;
  description: string;
  lessons: PreviewLessonSummary[];
};

export type PreviewLessonSummary = {
  slug: string;
  title: string;
  blurb: string;
  readingMinutes: number;
  hasQuiz: boolean;
};

export type PreviewLesson = {
  slug: string;
  programSlug: string;
  trackSlug: string;
  trackTitle: string;
  title: string;
  blurb: string;
  readingMinutes: number;
  blocks: ContentBlock[];
  quiz: {
    passScore: number;
    questions: Array<
      | { id: string; type: "single"; prompt: string; choices: string[] }
      | { id: string; type: "short"; prompt: string }
    >;
  } | null;
};

const ARCIUM: PreviewProgram = {
  slug: "arcium",
  title: "Arcium Fundamentals",
  tagline:
    "Confidential compute on Solana — from MPC primitives to reading a live MXE program.",
  org: "Arcium",
  hubStatus: "featured",
  featuredRank: 1,
  lessonCount: 6,
  trackCount: 3,
  estimatedHours: 2,
  tracks: [
    {
      slug: "primitives",
      title: "Primitives",
      description:
        "What MPC is, what it isn't, and why public blockchains needed it.",
      lessons: [
        {
          slug: "what-is-confidential-compute",
          title: "What confidential compute is for",
          blurb:
            "Why every transaction on Solana is public by default — and what that costs the user.",
          readingMinutes: 7,
          hasQuiz: true,
        },
        {
          slug: "mpc-primer",
          title: "Multi-party computation, plainly",
          blurb:
            "Secret sharing, garbled circuits, and why three honest-but-curious nodes can compute a function nobody sees.",
          readingMinutes: 12,
          hasQuiz: true,
        },
      ],
    },
    {
      slug: "network",
      title: "The Arcium network",
      description: "Arx nodes, clusters, and the MXE.",
      lessons: [
        {
          slug: "arx-nodes",
          title: "Arx nodes",
          blurb:
            "The compute peers that hold encrypted shares. What they see, what they don't, and how clusters form.",
          readingMinutes: 9,
          hasQuiz: true,
        },
        {
          slug: "mxe",
          title: "The MXE",
          blurb:
            "MPC eXecution Environment — the execution surface where Arcium runs your code.",
          readingMinutes: 10,
          hasQuiz: false,
        },
      ],
    },
    {
      slug: "writing",
      title: "Writing for the MXE",
      description: "How a confidential program looks when you read it.",
      lessons: [
        {
          slug: "annotation-and-flow",
          title: "Annotations and flow",
          blurb:
            "The Rust attributes that mark code for confidential execution, and what they imply at the network level.",
          readingMinutes: 11,
          hasQuiz: true,
        },
        {
          slug: "settling-onchain",
          title: "Settling onchain",
          blurb:
            "How the MXE's verifiable result lands on Solana, and what the receipt looks like to the rest of the chain.",
          readingMinutes: 8,
          hasQuiz: true,
        },
      ],
    },
  ],
};

const PROGRAMS: PreviewProgram[] = [ARCIUM];

export function listPrograms(): PreviewProgram[] {
  return PROGRAMS;
}

export function getProgramBySlug(slug: string): PreviewProgram | null {
  return PROGRAMS.find((p) => p.slug === slug) ?? null;
}

export function findLesson(
  programSlug: string,
  lessonSlug: string,
): PreviewLesson | null {
  const program = getProgramBySlug(programSlug);
  if (!program) return null;
  for (const track of program.tracks) {
    const lesson = track.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) {
      return {
        slug: lesson.slug,
        programSlug,
        trackSlug: track.slug,
        trackTitle: track.title,
        title: lesson.title,
        blurb: lesson.blurb,
        readingMinutes: lesson.readingMinutes,
        blocks: buildPreviewBlocks(programSlug, lesson.slug),
        quiz: buildPreviewQuiz(lesson.slug, lesson.hasQuiz),
      };
    }
  }
  return null;
}

function buildPreviewBlocks(programSlug: string, lessonSlug: string): ContentBlock[] {
  if (programSlug !== "arcium") return [];
  switch (lessonSlug) {
    case "what-is-confidential-compute":
      return [
        {
          type: "paragraph",
          text: {
            en: "If you build on a public chain today, every input to every program — wallet balances, the size of a trade, the strategy behind a position — is broadcast in plaintext to every validator. This was not an oversight. Public chains were designed around the premise that verifiability requires visibility: you cannot prove a transaction is valid, the argument went, unless every node can independently see what it does.",
          },
        },
        {
          type: "paragraph",
          text: {
            en: "For ten years this was acceptable, and even generative. Transparent state made on-chain analytics possible, lending markets composable, and exchanges interrogable. It is hard to overstate how much of crypto's first decade was built on the assumption that everything could be read.",
          },
        },
        { type: "divider" },
        {
          type: "heading",
          level: 2,
          text: { en: "The cost of plaintext" },
        },
        {
          type: "paragraph",
          text: {
            en: "But the choice was not free. When you place an order on a transparent AMM, the validator who orders your transaction can see your intent before it lands — and front-run it. When a DAO votes, every member's stance is recorded in the open. When a fund rebalances, the market sees its hand. The result is a constant extraction tax that ordinary users, institutions, and treasuries pay simply for using the system.",
          },
        },
        {
          type: "callout",
          variant: "note",
          text: {
            en: "Confidential compute is the substrate that closes this gap: arbitrary code can run over secrets, produce a verifiable result, and never reveal the inputs.",
          },
        },
      ];
    case "mpc-primer":
      return [
        {
          type: "paragraph",
          text: {
            en: "Multi-party computation (MPC) is a cryptographic technique that lets a group of parties jointly compute a function over their private inputs without revealing those inputs to each other. The classical formulation is the millionaire problem: two people want to know who is richer without disclosing how rich they are.",
          },
        },
        {
          type: "heading",
          level: 2,
          text: { en: "Secret sharing" },
        },
        {
          type: "paragraph",
          text: {
            en: "The most direct route is secret sharing. The secret s is split into n shares such that any t shares can reconstruct s, but t-1 reveal nothing. Each party holds one share. Computation proceeds share-by-share. The result is reconstructed only at the end — and only the result, never the inputs.",
          },
        },
        {
          type: "code",
          language: "rust",
          snippet: `// Pseudocode — secret sharing as Arcium models it
let s = secret_input(user);
let (s1, s2, s3) = split(s, threshold = 2, n = 3);

let r1 = node_1.compute(f, s1);
let r2 = node_2.compute(f, s2);
let r3 = node_3.compute(f, s3);

let f_s = reconstruct([r1, r2, r3]); // any 2 of 3 shares
publish(f_s);`,
        },
      ];
    case "arx-nodes":
      return [
        {
          type: "paragraph",
          text: {
            en: "An Arx node is one of the compute peers that holds an encrypted share of state during a confidential computation. Nodes never reconstruct the cleartext on their own. They run the protocol step-by-step — multiplying, adding, comparing — over their shares.",
          },
        },
        {
          type: "callout",
          variant: "warning",
          text: {
            en: "An Arx node is not a generic Solana validator. It participates only in the MPC protocol, not in block production or consensus.",
          },
        },
      ];
    case "mxe":
      return [
        {
          type: "paragraph",
          text: {
            en: "The MXE — MPC eXecution Environment — is the surface where Arcium runs confidential code. From a developer's perspective, you write a function annotated `#[arcium::confidential]`; the compiler emits the protocol circuit; the cluster of Arx nodes runs it; and Solana receives a verifiable receipt of the result.",
          },
        },
      ];
    case "annotation-and-flow":
      return [
        {
          type: "code",
          language: "rust",
          snippet: `#[arcium::confidential]
pub fn match_orders(
    bids: Vec<EncryptedOrder>,
    asks: Vec<EncryptedOrder>,
) -> EncryptedMatch {
    // executes entirely inside the MXE.
    crossover(bids, asks)
}`,
        },
        {
          type: "paragraph",
          text: {
            en: "The annotation marks the function for confidential execution. Inputs arrive encrypted; the body runs over shares; the return value lands as ciphertext that the caller can decrypt — or settle directly onchain without ever decrypting.",
          },
        },
      ];
    case "settling-onchain":
      return [
        {
          type: "paragraph",
          text: {
            en: "The MXE's final move is to emit a verifiable receipt. Solana sees the receipt and can act on it — settle a trade, release a payment, update state — without learning the inputs that produced it. To the chain it is just a transaction with a proof; to the user it is the confidential computation, fully witnessed.",
          },
        },
      ];
    default:
      return [
        {
          type: "paragraph",
          text: { en: "This lesson is in draft and will be published shortly." },
        },
      ];
  }
}

function buildPreviewQuiz(lessonSlug: string, hasQuiz: boolean): PreviewLesson["quiz"] {
  if (!hasQuiz) return null;
  return {
    passScore: 0.7,
    questions: [
      {
        id: `${lessonSlug}-q1`,
        type: "single",
        prompt: "Which statement best describes confidential compute on Arcium?",
        choices: [
          "Arbitrary code runs over encrypted inputs and emits a verifiable result.",
          "All Solana transactions become private by default.",
          "Validators take turns holding the cleartext.",
        ],
      },
      {
        id: `${lessonSlug}-q2`,
        type: "short",
        prompt: "In one sentence, what would change for ordinary users if confidential execution were the baseline?",
      },
    ],
  };
}
