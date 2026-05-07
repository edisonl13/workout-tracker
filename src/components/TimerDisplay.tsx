interface Props {
  seconds: number;
  running: boolean;
  label?: string;
}

export default function TimerDisplay({ seconds, running, label = '组间休息' }: Props) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = mins > 0
    ? `${mins}:${String(secs).padStart(2, '0')}`
    : `${secs}`;

  const urgent = running && seconds <= 3 && seconds > 0;

  return (
    <div className={`text-center py-8 transition-colors ${urgent ? 'text-danger animate-pulse' : 'text-white'}`}>
      <div className="text-timer font-mono select-none" style={{ fontSize: '5rem' }}>
        {display}
      </div>
      <div className="text-lg text-slate-400 mt-2">{label}</div>
    </div>
  );
}
