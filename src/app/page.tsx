import Link from 'next/link';
import { DOMAIN_WEIGHTS } from '@/lib/domainWeighting';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Master the CISSP with 1,000 practice questions.</h1>
        <p>
          Ten full-length, exam-weighted practice tests covering all eight CISSP domains — with
          scenario questions, multi-select, matching, and ordering items, plus detailed answer
          explanations and per-domain scoring.
        </p>
        <div className="cta">
          <Link className="btn primary" href="/tests/">
            Start a practice test →
          </Link>
          <a className="btn ghost" href="#how">
            How it works
          </a>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat">
          <div className="n">1,000</div>
          <div className="l">Original questions</div>
        </div>
        <div className="stat">
          <div className="n">8</div>
          <div className="l">CISSP domains</div>
        </div>
        <div className="stat">
          <div className="n">10</div>
          <div className="l">Weighted tests</div>
        </div>
        <div className="stat">
          <div className="n">100</div>
          <div className="l">Questions per test</div>
        </div>
      </section>

      <section id="how" className="features">
        <div className="feature">
          <h3>📊 Exam-weighted tests</h3>
          <p>
            Every test mirrors the official domain weights (16/10/13/13/13/12/13/10), so practice
            feels like the real exam.
          </p>
        </div>
        <div className="feature">
          <h3>🧠 Real question types</h3>
          <p>
            Single best answer, scenario, multiple-correct, matching, and sequence-ordering items —
            each with full explanations of why every option is right or wrong.
          </p>
        </div>
        <div className="feature">
          <h3>💾 Progress saved locally</h3>
          <p>
            Your answers, timer, and results are stored in your browser — resume any test or review
            past results anytime, no account needed.
          </p>
        </div>
      </section>

      <section className="page-head">
        <h1>The eight domains</h1>
        <p>Coverage proportional to each domain&apos;s exam weight.</p>
      </section>
      <div className="tests-grid">
        {DOMAIN_WEIGHTS.map((d) => (
          <div className="test-card" key={d.number}>
            <div className="tc-meta">Domain {d.number}</div>
            <h3>{d.name}</h3>
            <div className="weight-bar" aria-hidden>
              <span className="weight-seg" style={{ width: `${d.weight}%`, background: 'var(--primary)' }} />
              <span className="weight-seg" style={{ width: `${100 - d.weight}%`, background: 'var(--bg-2)' }} />
            </div>
            <div className="tc-meta">{d.weight}% of exam weight</div>
          </div>
        ))}
      </div>
    </>
  );
}
