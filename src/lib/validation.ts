import type { Question } from '@/types/question';
import type { TestFile } from '@/types/test';

const TYPES = new Set([
  'single_best_answer',
  'scenario_based',
  'multiple_correct_answers',
  'matching',
  'sequence_ordering',
]);

/** Lightweight runtime validation of a question object. Returns error strings. */
export function validateQuestion(q: Question): string[] {
  const errs: string[] = [];
  const where = q?.id ?? '(no id)';
  if (!q.id) errs.push('missing id');
  if (!q.question || q.question.length < 5) errs.push(`${where}: missing question text`);
  if (!Array.isArray(q.options) || q.options.length < 3) errs.push(`${where}: needs >=3 options`);
  if (!TYPES.has(q.question_type)) errs.push(`${where}: bad question_type`);
  if (!q.explanation?.why_correct) errs.push(`${where}: missing why_correct`);
  if (!q.topic) errs.push(`${where}: missing topic`);
  const labels = (q.options ?? []).map((o) => o.label);
  const a = q.correct_answer;
  let ok = false;
  if (typeof a === 'string' && /^[A-H]$/.test(a)) ok = labels.includes(a);
  else if (Array.isArray(a)) ok = a.length > 0 && a.every((x) => labels.includes(x));
  else if (typeof a === 'string' && a.includes('-')) ok = /\d+-[A-H]/.test(a);
  else if (typeof a === 'string' && a.includes(',')) ok = a.split(',').every((x) => labels.includes(x.trim()));
  if (!ok) errs.push(`${where}: invalid correct_answer`);
  return errs;
}

/** Validate a test file: 100 questions, all IDs present in the bank. */
export function validateTest(test: TestFile, bankIds: Set<string>): string[] {
  const errs: string[] = [];
  if (test.total_questions !== test.questions.length) errs.push(`${test.test_id}: total_questions mismatch`);
  if (test.questions.length !== 100) errs.push(`${test.test_id}: expected 100 questions`);
  const unresolved = test.questions.filter((id) => !bankIds.has(id));
  if (unresolved.length) errs.push(`${test.test_id}: ${unresolved.length} IDs not in bank`);
  const dups = test.questions.length - new Set(test.questions).size;
  if (dups) errs.push(`${test.test_id}: ${dups} duplicate IDs`);
  return errs;
}
