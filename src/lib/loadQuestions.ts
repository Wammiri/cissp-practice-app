import type { Question, QuestionBank } from '@/types/question';
import type { TestFile, TestManifest } from '@/types/test';

/**
 * Data is served statically from /public/data. Use a base-aware path so the app
 * also works when hosted under a sub-path (set NEXT_PUBLIC_BASE_PATH if needed).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const dataUrl = (file: string) => `${BASE}/data/${file}`;

let bankCache: Map<string, Question> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return (await res.json()) as T;
}

/** Load the full question bank as a Map keyed by question id (cached). */
export async function loadBank(): Promise<Map<string, Question>> {
  if (bankCache) return bankCache;
  const bank = await fetchJson<QuestionBank>(dataUrl('cissp-question-bank.json'));
  bankCache = new Map(bank.questions.map((q) => [q.id, q]));
  return bankCache;
}

export async function loadManifest(): Promise<TestManifest> {
  return fetchJson<TestManifest>(dataUrl('test-manifest.json'));
}

export async function loadTestFile(testId: string): Promise<TestFile> {
  return fetchJson<TestFile>(dataUrl(`${testId}.json`));
}

/** Load a test plus its fully-resolved Question objects (in test order). */
export async function loadTestWithQuestions(
  testId: string
): Promise<{ test: TestFile; questions: Question[] }> {
  const [test, bank] = await Promise.all([loadTestFile(testId), loadBank()]);
  const questions = test.questions
    .map((id) => bank.get(id))
    .filter((q): q is Question => Boolean(q));
  return { test, questions };
}
