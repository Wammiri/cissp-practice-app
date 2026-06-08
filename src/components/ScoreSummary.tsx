'use client';

import type { TestResult } from '@/types/test';
import { PASS_THRESHOLD } from '@/lib/scoreTest';
import { formatDuration } from './TestTimer';

export default function ScoreSummary({ result }: { result: TestResult }) {
  const { scorePercent, correctCount, totalQuestions, passed, elapsedSeconds } = result;
  return (
    <div className={`score-summary ${passed ? 'pass' : 'fail'}`}>
      <div className="score-ring" aria-hidden>
        <div className="score-pct">{scorePercent}%</div>
        <div className="score-sub">
          {correctCount}/{totalQuestions}
        </div>
      </div>
      <div className="score-meta">
        <p className={`verdict ${passed ? 'pass' : 'fail'}`}>
          {passed ? 'PASS' : 'BELOW PASSING'}
          <span className="muted"> (threshold {PASS_THRESHOLD}%)</span>
        </p>
        <p className="muted">Time: {formatDuration(elapsedSeconds)}</p>
        <p className="muted">
          Completed {new Date(result.completedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
