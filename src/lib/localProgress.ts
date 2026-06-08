import type { TestProgress, TestResult } from '@/types/test';

const PROGRESS_KEY = (testId: string) => `cissp:progress:${testId}`;
const RESULT_KEY = (testId: string) => `cissp:result:${testId}`;
const RESULTS_INDEX = 'cissp:results:index';

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage;

// ---- in-progress attempts ----
export function saveProgress(p: TestProgress): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(PROGRESS_KEY(p.testId), JSON.stringify({ ...p, updatedAt: Date.now() }));
  } catch {
    /* storage full / disabled — ignore */
  }
}

export function loadProgress(testId: string): TestProgress | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY(testId));
    return raw ? (JSON.parse(raw) as TestProgress) : null;
  } catch {
    return null;
  }
}

export function clearProgress(testId: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(PROGRESS_KEY(testId));
  } catch {
    /* ignore */
  }
}

// ---- completed results ----
export function saveResult(result: TestResult): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(RESULT_KEY(result.testId), JSON.stringify(result));
    const idx = loadResultsIndex();
    if (!idx.includes(result.testId)) {
      idx.push(result.testId);
      localStorage.setItem(RESULTS_INDEX, JSON.stringify(idx));
    }
  } catch {
    /* ignore */
  }
}

export function loadResult(testId: string): TestResult | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(RESULT_KEY(testId));
    return raw ? (JSON.parse(raw) as TestResult) : null;
  } catch {
    return null;
  }
}

export function loadResultsIndex(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(RESULTS_INDEX);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function clearResult(testId: string): void {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(RESULT_KEY(testId));
    const idx = loadResultsIndex().filter((id) => id !== testId);
    localStorage.setItem(RESULTS_INDEX, JSON.stringify(idx));
  } catch {
    /* ignore */
  }
}
