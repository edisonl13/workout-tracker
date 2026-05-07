import SetCircles from './SetCircles';

interface Props {
  name: string;
  equipment: string;
  weight: number;
  sets: number;
  reps: number;
  restSeconds: number;
  durationSeconds: number;
  completedSets: number;
  index: number;
  active: boolean;
  onClick?: () => void;
  onDemo?: () => void;
}

function fmtEquipment(eq: string, weight: number): string {
  if (eq === 'bodyweight') return '徒手';
  if (eq === 'dumbbell') return `哑铃 ${weight}kg×2`;
  if (eq === 'barbell') return `杠铃 ${weight}kg`;
  if (eq === 'pullup_bar') return '引体杆';
  return eq;
}

function fmtTarget(reps: number, durationSeconds: number): string {
  if (durationSeconds > 0) return fmtDuration(durationSeconds);
  return `${reps} 次`;
}

function fmtDuration(s: number): string {
  if (s >= 60) return `${Math.floor(s / 60)}分${s % 60 > 0 ? s % 60 + '秒' : ''}`;
  return `${s}秒`;
}

export default function ExerciseCard({
  name, equipment, weight, sets, reps, restSeconds, durationSeconds,
  completedSets, index, active, onClick, onDemo,
}: Props) {
  return (
    <div
      className={`w-full text-left rounded-xl p-4 mb-3 transition-all border-2 ${
        active
          ? 'bg-surface-light border-accent shadow-lg shadow-accent/20'
          : 'bg-surface border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-slate-500 font-bold text-sm w-6 shrink-0">{index + 1}</span>
          <span className="text-big text-white truncate">{name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            equipment === 'bodyweight' ? 'bg-slate-600 text-slate-300' : 'bg-amber-900/50 text-amber-400'
          }`}>
            {fmtEquipment(equipment, weight)}
          </span>
          {onDemo && (
            <button
              onClick={e => { e.stopPropagation(); onDemo(); }}
              className="w-6 h-6 rounded-full bg-slate-600 text-slate-300 text-xs font-bold flex items-center justify-center active:bg-slate-500 shrink-0"
            >
              ?
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between" onClick={onClick}>
        <SetCircles total={sets} completed={completedSets} />
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span>{fmtTarget(reps, durationSeconds)}</span>
          {restSeconds > 0 && <span className="text-slate-500">⏳{fmtDuration(restSeconds)}</span>}
        </div>
      </div>
    </div>
  );
}
