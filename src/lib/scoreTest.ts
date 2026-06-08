import type { Question, UserAnswer } from '@/types/question';
import type { DomainScore, QuestionResult, TestResult } from '@/types/test';

export const PASS_THRESHOLD = 70; // CISSP-style scaled pass ~ 700/1000

/** Parse a matching answer string "1-B,2-A" into { "1": "B", "2": "A" }. */
export function parseMatching(s: string): Record<string, string> {
  const map: Record<string, string> = {};
  s.split(',').forEach((pair) => {
    const [p, l] = pair.split('-');
    if (p && l) map[p.trim()] = l.trim();
  });
  return map;
}

function sameStringSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

function sameMap(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
}

/** Is the user's answer correct for this question? */
export function isCorrect(q: Question, answer: UserAnswer): boolean {
  if (answer == null) return false;
  const correct = q.correct_answer;

  switch (q.question_type) {
    case 'single_best_answer':
    case 'scenario_based':
      return typeof answer === 'string' && answer === correct;

    case 'multiple_correct_answers': {
      const want = Array.isArray(correct) ? correct : [correct];
      const got = Array.isArray(answer) ? answer : [answer as string];
      return sameStringSet(got, want);
    }

    case 'sequence_ordering': {
      const want = Array.isArray(correct) ? correct.join(',') : String(correct);
      const got = Array.isArray(answer) ? answer.join(',') : String(answer);
      return got === want;
    }

    case 'matching': {
      const want = parseMatching(Array.isArray(correct) ? correct.join(',') : String(correct));
      const got =
        typeof answer === 'object' && !Array.isArray(answer)
          ? (answer as Record<string, string>)
          : {};
      return sameMap(got, want);
    }

    default:
      return false;
  }
}

export function isAnswered(q: Question, answer: UserAnswer): boolean {
  if (answer == null) return false;
  if (typeof answer === 'string') return answer.length > 0;
  if (Array.isArray(answer)) return answer.length > 0;
  // matching: answered when every prompt has a selection
  const need = q.prompts?.length ?? 0;
  return Object.keys(answer).length >= need && need > 0;
}

/** Build the full TestResult for a completed attempt. */
export function scoreTest(
  testId: string,
  title: string,
  questions: Question[],
  answers: Record<string, UserAnswer>,
  elapsedSeconds: number
): TestResult {
  const results: QuestionResult[] = questions.map((q) => {
    const ua = answers[q.id] ?? null;
    return {
      questionId: q.id,
      domain: q.domain,
      domainNumber: q.domain_number,
      answered: isAnswered(q, ua),
      correct: isCorrect(q, ua),
      userAnswer: ua,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const totalQuestions = questions.length;
  const scorePercent = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const byDomain = new Map<number, DomainScore>();
  for (const q of questions) {
    if (!byDomain.has(q.domain_number)) {
      byDomain.set(q.domain_number, {
        domain: q.domain,
        domainNumber: q.domain_number,
        correct: 0,
        total: 0,
      });
    }
    const ds = byDomain.get(q.domain_number)!;
    ds.total += 1;
    if (isCorrect(q, answers[q.id] ?? null)) ds.correct += 1;
  }
  const domainScores = [...byDomain.values()].sort((a, b) => a.domainNumber - b.domainNumber);

  return {
    testId,
    title,
    completedAt: Date.now(),
    elapsedSeconds,
    totalQuestions,
    correctCount,
    scorePercent,
    passed: scorePercent >= PASS_THRESHOLD,
    domainScores,
    results,
    answers,
  };
}
