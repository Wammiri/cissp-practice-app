'use client';

import type { Question, UserAnswer } from '@/types/question';
import OptionSelector from './OptionSelector';

interface Props {
  question: Question;
  index: number;
  total: number;
  value: UserAnswer;
  onChange: (v: UserAnswer) => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
  /** review mode: reveal correctness + explanation */
  reveal?: boolean;
}

export default function QuestionCard({
  question,
  index,
  total,
  value,
  onChange,
  flagged,
  onToggleFlag,
  reveal,
}: Props) {
  return (
    <article className="qcard">
      <header className="qcard-head">
        <div className="qmeta">
          <span className="qnum">
            Question {index + 1} <span className="muted">/ {total}</span>
          </span>
          <span className={`tag tag-${question.difficulty}`}>{question.difficulty}</span>
          <span className="tag tag-type">{question.question_type.replace(/_/g, ' ')}</span>
          <span className="tag tag-domain">D{question.domain_number}</span>
        </div>
        {onToggleFlag && (
          <button
            type="button"
            className={`flag-btn ${flagged ? 'on' : ''}`}
            onClick={onToggleFlag}
            aria-pressed={flagged}
          >
            {flagged ? '★ Flagged' : '☆ Flag'}
          </button>
        )}
      </header>

      <p className="qstem">{question.question}</p>

      <OptionSelector question={question} value={value} onChange={onChange} reveal={reveal} />

      {reveal && (
        <section className="explain">
          <p className="explain-correct">
            <strong>Correct:</strong>{' '}
            {Array.isArray(question.correct_answer)
              ? question.correct_answer.join(', ')
              : question.correct_answer}
          </p>
          <p>
            <strong>Why:</strong> {question.explanation.why_correct}
          </p>
          {Object.keys(question.explanation.why_others_are_wrong ?? {}).length > 0 && (
            <ul className="explain-wrong">
              {Object.entries(question.explanation.why_others_are_wrong).map(([k, v]) => (
                <li key={k}>
                  <strong>{k}:</strong> {v}
                </li>
              ))}
            </ul>
          )}
          <p className="source muted">Source: {question.source_reference.syllabus_section}</p>
        </section>
      )}
    </article>
  );
}
