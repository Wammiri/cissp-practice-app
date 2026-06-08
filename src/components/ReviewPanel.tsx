'use client';

import { useState } from 'react';
import type { Question } from '@/types/question';
import type { TestResult } from '@/types/test';
import QuestionCard from './QuestionCard';

interface Props {
  result: TestResult;
  questions: Question[];
}

type Filter = 'all' | 'incorrect' | 'flagged-unanswered';

export default function ReviewPanel({ result, questions }: Props) {
  const [filter, setFilter] = useState<Filter>('incorrect');

  const resById = new Map(result.results.map((r) => [r.questionId, r]));

  const filtered = questions.filter((q) => {
    const r = resById.get(q.id);
    if (!r) return false;
    if (filter === 'incorrect') return !r.correct;
    if (filter === 'flagged-unanswered') return !r.answered;
    return true;
  });

  const incorrectCount = result.results.filter((r) => !r.correct).length;
  const unansweredCount = result.results.filter((r) => !r.answered).length;

  return (
    <section className="review">
      <div className="review-head">
        <h3>Review answers</h3>
        <div className="review-filters">
          <button className={filter === 'incorrect' ? 'chip on' : 'chip'} onClick={() => setFilter('incorrect')}>
            Incorrect ({incorrectCount})
          </button>
          <button
            className={filter === 'flagged-unanswered' ? 'chip on' : 'chip'}
            onClick={() => setFilter('flagged-unanswered')}
          >
            Unanswered ({unansweredCount})
          </button>
          <button className={filter === 'all' ? 'chip on' : 'chip'} onClick={() => setFilter('all')}>
            All ({questions.length})
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="muted empty">Nothing to show for this filter. 🎉</p>
      ) : (
        <div className="review-list">
          {filtered.map((q) => {
            const r = resById.get(q.id)!;
            return (
              <div key={q.id} className={`review-item ${r.correct ? 'ok' : 'bad'}`}>
                <div className="review-status">{r.correct ? '✓ Correct' : r.answered ? '✗ Incorrect' : '— Unanswered'}</div>
                <QuestionCard
                  question={q}
                  index={questions.indexOf(q)}
                  total={questions.length}
                  value={r.userAnswer}
                  onChange={() => {}}
                  reveal
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
