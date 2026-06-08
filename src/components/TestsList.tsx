'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ManifestEntry } from '@/types/test';
import { loadManifest } from '@/lib/loadQuestions';
import { loadProgress, loadResult } from '@/lib/localProgress';
import { DOMAIN_WEIGHTS } from '@/lib/domainWeighting';

const SEG_COLORS = ['#6c8cff', '#43d6a0', '#f0b429', '#ef6a6a', '#9b6cff', '#43c9d6', '#f08bd0', '#9aa3c7'];

interface Status {
  done?: { score: number; passed: boolean };
  inProgress?: { answered: number };
}

export default function TestsList() {
  const [tests, setTests] = useState<ManifestEntry[] | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifest()
      .then((m) => {
        setTests(m.tests);
        const st: Record<string, Status> = {};
        for (const t of m.tests) {
          const result = loadResult(t.test_id);
          const prog = loadProgress(t.test_id);
          st[t.test_id] = {
            done: result ? { score: result.scorePercent, passed: result.passed } : undefined,
            inProgress:
              !result && prog ? { answered: Object.keys(prog.answers ?? {}).length } : undefined,
          };
        }
        setStatus(st);
      })
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  if (error) {
    return (
      <div className="panel error">
        <p>Could not load tests: {error}</p>
        <p className="muted">Make sure the app data was prepared (npm run prepare:data) and is served from /data.</p>
      </div>
    );
  }
  if (!tests) return <div className="panel">Loading tests…</div>;

  return (
    <div className="tests-grid">
      {tests.map((t) => {
        const st = status[t.test_id] ?? {};
        return (
          <div className="test-card" key={t.test_id}>
            <div className="tc-meta">{t.total_questions} questions · exam-weighted</div>
            <h3>{t.title}</h3>

            <div className="weight-bar" aria-hidden>
              {DOMAIN_WEIGHTS.map((d, i) => {
                const count = t.domain_distribution[d.name] ?? 0;
                return (
                  <span
                    key={d.number}
                    className="weight-seg"
                    title={`D${d.number}: ${count}`}
                    style={{ width: `${count}%`, background: SEG_COLORS[i % SEG_COLORS.length] }}
                  />
                );
              })}
            </div>
            <div className="tc-meta">Domains 1–8 · 16/10/13/13/13/12/13/10</div>

            {st.done ? (
              <div className={`tc-status done`}>
                ✓ Completed — {st.done.score}% {st.done.passed ? '(pass)' : '(below pass)'}
              </div>
            ) : st.inProgress ? (
              <div className="tc-status progress">▶ In progress — {st.inProgress.answered} answered</div>
            ) : (
              <div className="tc-status muted">Not started</div>
            )}

            <div className="tc-actions">
              <Link className="btn primary" href={`/tests/${t.test_id}/`}>
                {st.inProgress ? 'Resume' : st.done ? 'Retake' : 'Start'}
              </Link>
              {st.done && (
                <Link className="btn ghost" href={`/results/${t.test_id}/`}>
                  Results
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
