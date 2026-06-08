import type { UserAnswer } from './question';

export interface TestFile {
  test_id: string;
  title: string;
  total_questions: number;
  domain_distribution: Record<string, number>;
  questions: string[]; // question IDs referencing the bank
}

export interface ManifestEntry {
  test_id: string;
  title: string;
  total_questions: number;
  domain_distribution: Record<string, number>;
  file: string;
}

export interface TestManifest {
  meta: Record<string, unknown>;
  tests: ManifestEntry[];
}

/** Per-question scoring result. */
export interface QuestionResult {
  questionId: string;
  domain: string;
  domainNumber: number;
  answered: boolean;
  correct: boolean;
  userAnswer: UserAnswer;
}

export interface DomainScore {
  domain: string;
  domainNumber: number;
  correct: number;
  total: number;
}

/** Saved result of a completed test attempt. */
export interface TestResult {
  testId: string;
  title: string;
  completedAt: number; // epoch ms
  elapsedSeconds: number;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  domainScores: DomainScore[];
  results: QuestionResult[];
  answers: Record<string, UserAnswer>;
}

/** In-progress saved state for a test attempt. */
export interface TestProgress {
  testId: string;
  answers: Record<string, UserAnswer>;
  flagged: string[];
  current: number;
  startedAt: number;
  updatedAt: number;
}
