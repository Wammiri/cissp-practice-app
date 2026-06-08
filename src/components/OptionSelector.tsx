'use client';

import type { Question, UserAnswer } from '@/types/question';

interface Props {
  question: Question;
  value: UserAnswer;
  onChange: (value: UserAnswer) => void;
  /** When true, show correct/incorrect styling and disable input (review mode). */
  reveal?: boolean;
  disabled?: boolean;
}

function asArray(v: UserAnswer): string[] {
  return Array.isArray(v) ? v : [];
}
function asMap(v: UserAnswer): Record<string, string> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {};
}

/** Renders the correct answer set for highlighting in reveal mode. */
function correctLabels(q: Question): Set<string> {
  const c = q.correct_answer;
  if (Array.isArray(c)) return new Set(c);
  if (typeof c === 'string' && /^[A-H]$/.test(c)) return new Set([c]);
  return new Set();
}

export default function OptionSelector({ question, value, onChange, reveal, disabled }: Props) {
  const locked = reveal || disabled;
  const correct = correctLabels(question);

  // ---- single best / scenario: radio ----
  if (question.question_type === 'single_best_answer' || question.question_type === 'scenario_based') {
    return (
      <ul className="options" role="radiogroup">
        {question.options.map((o) => {
          const selected = value === o.label;
          const cls = reveal
            ? correct.has(o.label)
              ? 'option correct'
              : selected
              ? 'option wrong'
              : 'option'
            : selected
            ? 'option selected'
            : 'option';
          return (
            <li key={o.label}>
              <button
                type="button"
                className={cls}
                disabled={locked}
                onClick={() => onChange(o.label)}
                role="radio"
                aria-checked={selected}
              >
                <span className="bullet">{o.label}</span>
                <span className="otext">{o.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  // ---- multiple correct: checkboxes ----
  if (question.question_type === 'multiple_correct_answers') {
    const sel = new Set(asArray(value));
    return (
      <ul className="options">
        {question.options.map((o) => {
          const checked = sel.has(o.label);
          const cls = reveal
            ? correct.has(o.label)
              ? 'option correct'
              : checked
              ? 'option wrong'
              : 'option'
            : checked
            ? 'option selected'
            : 'option';
          return (
            <li key={o.label}>
              <button
                type="button"
                className={cls}
                disabled={locked}
                onClick={() => {
                  const next = new Set(sel);
                  if (next.has(o.label)) next.delete(o.label);
                  else next.add(o.label);
                  onChange([...next].sort());
                }}
                aria-pressed={checked}
              >
                <span className={`bullet check ${checked ? 'on' : ''}`}>{checked ? '✓' : ''}</span>
                <span className="otext">
                  <strong>{o.label}.</strong> {o.text}
                </span>
              </button>
            </li>
          );
        })}
        <li className="hint">Select all that apply.</li>
      </ul>
    );
  }

  // ---- matching: a dropdown per prompt ----
  if (question.question_type === 'matching') {
    const map = asMap(value);
    const prompts = question.prompts ?? [];
    return (
      <div className="matching">
        {prompts.map((p, i) => {
          const key = String(i + 1);
          return (
            <div className="match-row" key={key}>
              <span className="match-prompt">
                <strong>{key}.</strong> {p}
              </span>
              <select
                className="match-select"
                value={map[key] ?? ''}
                disabled={locked}
                onChange={(e) => onChange({ ...map, [key]: e.target.value })}
              >
                <option value="">— choose —</option>
                {question.options.map((o) => (
                  <option key={o.label} value={o.label}>
                    {o.label}. {o.text}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <ul className="match-legend">
          {question.options.map((o) => (
            <li key={o.label}>
              <strong>{o.label}.</strong> {o.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ---- sequence ordering: reorder with up/down ----
  if (question.question_type === 'sequence_ordering') {
    const order = asArray(value).length
      ? asArray(value)
      : question.options.map((o) => o.label); // default = displayed order
    const byLabel = new Map(question.options.map((o) => [o.label, o.text]));
    const move = (idx: number, delta: number) => {
      const next = order.slice();
      const j = idx + delta;
      if (j < 0 || j >= next.length) return;
      [next[idx], next[j]] = [next[j], next[idx]];
      onChange(next);
    };
    return (
      <div className="sequence">
        <p className="hint">Put the items in the correct order (top = first).</p>
        <ol className="seq-list">
          {order.map((label, idx) => (
            <li key={label} className="seq-item">
              <span className="seq-pos">{idx + 1}</span>
              <span className="seq-text">
                <strong>{label}.</strong> {byLabel.get(label)}
              </span>
              <span className="seq-controls">
                <button type="button" disabled={locked || idx === 0} onClick={() => move(idx, -1)} aria-label="Move up">
                  ▲
                </button>
                <button
                  type="button"
                  disabled={locked || idx === order.length - 1}
                  onClick={() => move(idx, 1)}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return null;
}
