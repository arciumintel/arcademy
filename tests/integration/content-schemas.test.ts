import { describe, it, expect } from "vitest";
import { parseLessonBlocks } from "@/lib/content-blocks/schema";
import { parseQuizQuestions } from "@/lib/quiz/schema";
import { toPublicQuiz } from "@/lib/quiz/public";

describe("content schemas", () => {
  it("accepts valid lesson blocks", () => {
    const result = parseLessonBlocks([
      { type: "heading", level: 2, text: { en: "Title" } },
      { type: "paragraph", text: { en: "Body" } },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects invalid block type", () => {
    const result = parseLessonBlocks([{ type: "unknown", text: { en: "x" } }]);
    expect(result.success).toBe(false);
  });

  it("strips quiz answer keys for client payloads", () => {
    const questions = parseQuizQuestions([
      {
        id: "q1",
        type: "true_false",
        prompt: "Test?",
        points: 1,
        correctAnswer: "true",
        explanation: "Because.",
      },
    ]);
    expect(questions.success).toBe(true);
    if (!questions.success) return;

    const pub = toPublicQuiz({
      questions: questions.data,
      scoringConfig: {
        passThreshold: 70,
        masteryThreshold: 90,
        maxAttempts: 3,
        cooldownSeconds: 0,
      },
    });

    expect(pub.questions[0]).not.toHaveProperty("correctAnswer");
    expect(pub.questions[0]).not.toHaveProperty("explanation");
  });
});
