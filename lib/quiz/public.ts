import type { QuizQuestion } from "@/lib/quiz/schema";

type StripAnswerKeys<T> = Omit<T, "correctAnswer" | "explanation">;

export type PublicQuizQuestion =
  | StripAnswerKeys<Extract<QuizQuestion, { type: "short_text" }>>
  | StripAnswerKeys<Extract<QuizQuestion, { type: "multiple_choice" }>>
  | StripAnswerKeys<Extract<QuizQuestion, { type: "true_false" }>>;

export type PublicQuiz = {
  questions: PublicQuizQuestion[];
  scoringConfig: {
    passThreshold: number;
    masteryThreshold: number;
    maxAttempts: number;
    cooldownSeconds: number;
  };
};

export function sanitizeQuizQuestionForClient(
  question: QuizQuestion,
): PublicQuizQuestion {
  const { correctAnswer: _a, explanation: _e, ...rest } = question;
  return rest as PublicQuizQuestion;
}

export function toPublicQuiz(input: {
  questions: QuizQuestion[];
  scoringConfig: PublicQuiz["scoringConfig"];
}): PublicQuiz {
  return {
    questions: input.questions.map(sanitizeQuizQuestionForClient),
    scoringConfig: input.scoringConfig,
  };
}
