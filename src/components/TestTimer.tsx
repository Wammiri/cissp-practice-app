'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  /** seconds already elapsed (resumed attempts) */
  initialSeconds?: number;
  running?: boolean;
  onTick?: (seconds: number) => void;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default function TestTimer({ initialSeconds = 0, running = true, onTick }: Props) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  return (
    <span className="timer" title="Elapsed time" aria-label="Elapsed time">
      ⏱ {formatDuration(seconds)}
    </span>
  );
}
