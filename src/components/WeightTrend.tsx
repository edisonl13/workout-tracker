import type { WeightEntry } from '../utils/storage';

interface Props {
  data: WeightEntry[];
  days?: number;
}

export default function WeightTrend({ data, days = 14 }: Props) {
  if (data.length < 2) {
    return (
      <div className="text-center text-slate-500 py-8">
        数据不足，记录更多体重后会显示趋势图
      </div>
    );
  }

  const recent = data.slice(-days);
  const weights = recent.map(e => e.weight);
  const min = Math.floor(Math.min(...weights) - 1);
  const max = Math.ceil(Math.max(...weights) + 1);
  const range = max - min || 1;

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - days);

  // Build points
  const points = recent.map((e, i) => {
    const x = (i / (recent.length - 1 || 1)) * 100;
    const y = 100 - ((e.weight - min) / range) * 100;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  // Average line
  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;

  return (
    <div className="bg-surface rounded-xl p-4">
      <div className="flex justify-between text-sm text-slate-400 mb-3">
        <span>{max} kg</span>
        <span className="text-accent font-bold">均 {avg.toFixed(1)}</span>
        <span>{min} kg</span>
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-48" preserveAspectRatio="none">
        {/* Grid lines */}
        {[25, 50, 75].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.3" />
        ))}
        {/* Data line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {points.map((p, i) => {
          const [x, y] = p.split(',').map(Number);
          return (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#22c55e" />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>{recent[0]?.date.slice(5)}</span>
        <span>{recent[recent.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}
