import type { ExerciseDef } from '../data/exercises';

interface Props {
  exercise: ExerciseDef;
  weight: number;
  onClose: () => void;
}

function fmtEquipment(def: ExerciseDef, weight: number): string {
  if (def.equipment === 'bodyweight') return '徒手';
  if (def.equipment === 'dumbbell') return `哑铃 ${weight || def.defaultWeight}kg×2`;
  if (def.equipment === 'barbell') return `杠铃 ${weight || def.defaultWeight}kg`;
  if (def.equipment === 'pullup_bar') return '引体杆';
  return def.equipment;
}

export default function ExerciseDemoModal({ exercise, weight, onClose }: Props) {
  const hasGif = !!exercise.gifUrl;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col" onClick={onClose}>
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="text-slate-400 text-2xl active:text-white w-10 h-10 flex items-center justify-center"
        >
          ✕
        </button>
        <span className="text-white text-lg font-bold">{exercise.name}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-900/50 text-amber-400 font-medium">
          {fmtEquipment(exercise, weight)}
        </span>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        onClick={e => e.stopPropagation()}
      >
        {/* GIF / Visual */}
        <div className="bg-surface rounded-xl overflow-hidden mb-6">
          {hasGif ? (
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full h-auto max-h-[300px] object-contain bg-slate-800"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-48 bg-slate-800 text-slate-500 text-lg">
              <div className="text-center">
                <div className="text-5xl mb-3">
                  {exercise.type === 'strength' ? '💪' : exercise.type === 'cardio' ? '🔥' : '🧘'}
                </div>
                <p>{exercise.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="flex gap-3 mb-6 text-sm">
          <div className="flex-1 bg-surface rounded-lg p-3 text-center">
            <div className="text-slate-500 mb-1">组数</div>
            <div className="text-white text-xl font-bold">{exercise.defaultSets}</div>
          </div>
          <div className="flex-1 bg-surface rounded-lg p-3 text-center">
            <div className="text-slate-500 mb-1">
              {exercise.defaultDurationSeconds > 0 ? '时长' : '次数'}
            </div>
            <div className="text-white text-xl font-bold">
              {exercise.defaultDurationSeconds > 0
                ? exercise.defaultDurationSeconds >= 60
                  ? `${Math.floor(exercise.defaultDurationSeconds / 60)}分${exercise.defaultDurationSeconds % 60 > 0 ? exercise.defaultDurationSeconds % 60 + '秒' : ''}`
                  : `${exercise.defaultDurationSeconds}秒`
                : `${exercise.defaultReps}次`
              }
            </div>
          </div>
          <div className="flex-1 bg-surface rounded-lg p-3 text-center">
            <div className="text-slate-500 mb-1">休息</div>
            <div className="text-white text-xl font-bold">
              {exercise.defaultRestSeconds >= 60
                ? `${Math.floor(exercise.defaultRestSeconds / 60)}分${exercise.defaultRestSeconds % 60 > 0 ? exercise.defaultRestSeconds % 60 + '秒' : ''}`
                : `${exercise.defaultRestSeconds}秒`
              }
            </div>
          </div>
        </div>

        {/* Form Instructions */}
        <div>
          <h3 className="text-big text-white mb-4">动作要领</h3>
          <ol className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-accent font-bold text-lg shrink-0 mt-0.5">{i + 1}.</span>
                <span className="text-slate-300 text-lg leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* No GIF note */}
        {!hasGif && (
          <p className="text-slate-600 text-sm text-center mt-8">
            暂无动作示范GIF，请仔细阅读文字要领
          </p>
        )}
      </div>
    </div>
  );
}
