'use client';

interface Props {
  total: number;
  current: number;
  answered: boolean[];
  flagged: boolean[];
  onJump: (index: number) => void;
}

export default function QuestionNavigator({ total, current, answered, flagged, onJump }: Props) {
  return (
    <nav className="navigator" aria-label="Question navigator">
      <div className="nav-legend">
        <span><i className="dot answered" /> Answered</span>
        <span><i className="dot flagged" /> Flagged</span>
        <span><i className="dot" /> Unanswered</span>
      </div>
      <div className="nav-grid">
        {Array.from({ length: total }).map((_, i) => {
          const cls = [
            'nav-cell',
            i === current ? 'current' : '',
            answered[i] ? 'answered' : '',
            flagged[i] ? 'flagged' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => onJump(i)}
              aria-current={i === current}
              aria-label={`Question ${i + 1}${answered[i] ? ', answered' : ''}${flagged[i] ? ', flagged' : ''}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
