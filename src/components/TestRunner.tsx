'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Question, UserAnswer } from '@/types/question';
import type { TestFile } from '@/types/test';
import { loadTestWithQuestions } from '@/lib/loadQuestions';
import { isAnswered, scoreTest } from '@/lib/scoreTest';
import { clearProgress, loadProgress, saveProgress, saveResult } from '@/lib/localProgress';
import QuestionCard from './QuestionCard';
import QuestionNavigator from './QuestionNavigator';
import TestTimer from './TestTimer';

export default function TestRunner({ testId }: { testId: string }) {
  const router = useRouter();
  const [test, setTest] = useState<TestFile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);

  // load test + restore any saved progress
  useEffect(() => {
    let alive = true;
    loadTestWithQuestions(testId)
      .then(({ test, questions }) => {
        if (!alive) return;
        setTest(test);
        setQuestions(questions);
        const prog = loadProgress(testId);
        if (prog) {
          setAnswers(prog.answers ?? {});
          setFlagged(new Set(prog.flagged ?? []));
          setCurrent(Math.min(prog.current ?? 0, questions.length - 1));
          setStartedAt(prog.startedAt ?? Date.now());
          const secs = Math.floor((Date.now() - (prog.startedAt ?? Date.now())) / 1000);
          setElapsed(Math.max(secs, 0));
        }
      })
      .catch((e) => alive && setLoadError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
  }, [testId]);

  // persist progress on change
  useEffect(() => {
    if (!test) return;
    saveProgress({
      testId,
      answers,
      flagged: [...flagged],
      current,
      startedAt,
      updatedAt: Date.now(),
    });
  }, [test, testId, answers, flagged, current, startedAt]);

  const answeredFlags = useMemo(
    () => questions.map((q) => isAnswered(q, answers[q.id] ?? null)),
    [questions, answers]
  );
  const flaggedFlags = useMemo(() => questions.map((q) => flagged.has(q.id)), [questions, flagged]);
  const answeredCount = answeredFlags.filter(Boolean).length;

  if (loadError) {
    return (
      <div className="panel error">
        <p>Could not load this test: {loadError}</p>
        <Link className="btn" href="/tests/">
          Back to tests
        </Link>
      </div>
    );
  }
  if (!test || questions.length === 0) {
    return <div className="panel">Loading test…</div>;
  }

  const q = questions[current];
  const setAnswer = (v: UserAnswer) => setAnswers((prev) => ({ ...prev, [q.id]: v }));
  const toggleFlag = () =>
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });

  const submit = () => {
    const result = scoreTest(test.test_id, test.title, questions, answers, elapsed);
    saveResult(result);
    clearProgress(testId);
    router.push(`/results/${testId}/`);
  };

  return (
    <div className="runner">
      <div className="runner-main">
        <div className="runner-bar">
          <Link className="link-back" href="/tests/">
            ← Exit
          </Link>
          <strong>{test.title}</strong>
          <span className="spacer" />
          <span className="muted">
            {answeredCount}/{questions.length} answered
          </span>
          <TestTimer initialSeconds={elapsed} running onTick={setElapsed} />
        </div>

        <QuestionCard
          question={q}
          index={current}
          total={questions.length}
          value={answers[q.id] ?? null}
          onChange={setAnswer}
          flagged={flagged.has(q.id)}
          onToggleFlag={toggleFlag}
        />

        <div className="runner-controls">
          <button className="btn ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            ← Previous
          </button>
          {current < questions.length - 1 ? (
            <button className="btn" onClick={() => setCurrent((c) => c + 1)}>
              Next →
            </button>
          ) : (
            <button className="btn primary" onClick={() => setShowSubmit(true)}>
              Finish test
            </button>
          )}
        </div>
      </div>

      <aside className="runner-side">
        <QuestionNavigator
          total={questions.length}
          current={current}
          answered={answeredFlags}
          flagged={flaggedFlags}
          onJump={setCurrent}
        />
        <button className="btn primary block" onClick={() => setShowSubmit(true)}>
          Submit test
        </button>
      </aside>

      {showSubmit && (
        <div className="modal-backdrop" onClick={() => setShowSubmit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Submit test?</h3>
            <p>
              You answered <strong>{answeredCount}</strong> of {questions.length} questions.
              {answeredCount < questions.length && ' Unanswered questions are marked incorrect.'}
            </p>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setShowSubmit(false)}>
                Keep working
              </button>
              <button className="btn primary" onClick={submit}>
                Submit & score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
