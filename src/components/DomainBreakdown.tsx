'use client';

import type { DomainScore } from '@/types/test';
import { shortDomainName, weightFor } from '@/lib/domainWeighting';

export default function DomainBreakdown({ scores }: { scores: DomainScore[] }) {
  return (
    <div className="domain-breakdown">
      <h3>Performance by domain</h3>
      <table className="dtable">
        <thead>
          <tr>
            <th>Domain</th>
            <th>Weight</th>
            <th>Score</th>
            <th aria-label="bar" />
          </tr>
        </thead>
        <tbody>
          {scores.map((d) => {
            const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
            const level = pct >= 70 ? 'good' : pct >= 50 ? 'ok' : 'low';
            return (
              <tr key={d.domainNumber}>
                <td>
                  <span className="dnum">D{d.domainNumber}</span> {shortDomainName(d.domain)}
                </td>
                <td className="muted">{weightFor(d.domainNumber)}%</td>
                <td>
                  {d.correct}/{d.total} <span className="muted">({pct}%)</span>
                </td>
                <td className="bar-cell">
                  <span className="bar">
                    <span className={`bar-fill ${level}`} style={{ width: `${pct}%` }} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
