interface Props {
  seconds: number;
  running: boolean;
  label?: string;
  total?: number; // if provided, show circular progress (for stretches)
}

export default function TimerDisplay({ seconds, running, label = '组间休息', total }: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : `${secs}`;

  const urgent = running && seconds <= 3 && seconds > 0;

  // Circular progress ring for stretch timers
  if (total && total > 0) {
    const progress = 1 - seconds / total;
    const circumference = 2 * Math.PI * 90; // r=90
    const offset = circumference * (1 - progress);
    const ringColor = progress > 0.9 ? '#ef4444' : progress > 0.5 ? '#f59e0b' : '#22c55e';

    return (
      <div className="text-center py-8">
        {/* Ring */}
        <div className="relative inline-flex items-center justify-center">
          <svg width="220" height="220" viewBox="0 0 200 200" className="-rotate-90">
            {/* Background circle */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="#334155" strokeWidth="10" />
            {/* Progress circle */}
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono select-none transition-colors ${urgent ? 'text-danger animate-pulse' : 'text-white'}`}
                  style={{ fontSize: '3.5rem', lineHeight: 1, fontWeight: 700 }}>
              {display}
            </span>
            <span className="text-lg text-slate-400 mt-1">{label}</span>
          </div>
        </div>
      </div>
    );
  }

  // Simple text display for rest timers
  return (
    <div className={`text-center py-8 transition-colors ${urgent ? 'text-danger animate-pulse' : 'text-white'}`}>
      <div className="text-timer font-mono select-none" style={{ fontSize: '5rem' }}>
        {display}
      </div>
      <div className="text-lg text-slate-400 mt-2">{label}</div>
    </div>
  );
}
