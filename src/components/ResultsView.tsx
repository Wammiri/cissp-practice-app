'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Question } from '@/types/question';
import type { TestResult } from '@/types/test';
import { loadTestWithQuestions } from '@/lib/loadQuestions';
import { loadResult, clearResult } from '@/lib/localProgress';
import ScoreSummary from './ScoreSummary';
import DomainBreakdown from './DomainBreakdown';
import ReviewPanel from './ReviewPanel';

export default function ResultsView({ testId }: { testId: string }) {
  const [result, setResult] = useState<TestResult | null | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setResult(loadResult(testId));
    let alive = true;
    loadTestWithQuestions(testId)
      .then(({ questions }) => alive && setQuestions(questions))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [testId]);

  if (result === undefined) return <div className="panel">Loading results…</div>;

  if (result === null) {
    return (
      <div className="panel">
        <h2>No saved result</h2>
        <p className="muted">You haven&apos;t completed this test on this device yet.</p>
        <div className="row gap">
          <Link className="btn primary" href={`/tests/${testId}/`}>
            Take this test
          </Link>
          <Link className="btn ghost" href="/tests/">
            All tests
          </Link>
        </div>
      </div>
    );
  }

  const retake = () => {
    clearResult(testId);
    window.location.href = `/tests/${testId}/`;
  };

  return (
    <div className="results">
      <div className="results-head">
        <div>
          <Link className="link-back" href="/tests/">
            ← All tests
          </Link>
          <h2>{result.title} — Results</h2>
        </div>
        <div className="row gap">
          <button className="btn ghost" onClick={retake}>
            Retake
          </button>
        </div>
      </div>

      <ScoreSummary result={result} />
      <DomainBreakdown scores={result.domainScores} />

      {questions.length > 0 ? (
        <ReviewPanel result={result} questions={questions} />
      ) : (
        <p className="muted">Loading question details for review…</p>
      )}
    </div>
  );
}
