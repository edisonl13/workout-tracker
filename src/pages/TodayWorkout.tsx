import { useState } from 'react';
import { WEEKLY_PLAN, type WorkoutExercise } from '../data/weeklyPlan';
import { EXERCISE_LIBRARY, type ExerciseDef } from '../data/exercises';
import { getPlanOverride, getCheckinDates, getTodayLog } from '../utils/storage';
import type { ExerciseLog } from '../utils/storage';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseDemoModal from '../components/ExerciseDemoModal';

interface Props {
  onStartWorkout: (plan: WorkoutExercise[], planName: string) => void;
}

function getCompletedSets(exerciseLogs: ExerciseLog[] | undefined, exerciseId: string): number {
  const found = exerciseLogs?.find(el => el.exerciseId === exerciseId);
  if (!found) return 0;
  return found.sets.filter(s => s.completed).length;
}

export default function TodayWorkout({ onStartWorkout }: Props) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const checkinDates = getCheckinDates();
  const todayLog = getTodayLog();
  const [demoExercise, setDemoExercise] = useState<{ def: ExerciseDef; weight: number } | null>(null);

  const override = getPlanOverride(dayOfWeek);
  const plan = override
    ? { name: '自定义', exercises: override }
    : (WEEKLY_PLAN[dayOfWeek] ?? WEEKLY_PLAN[0]);

  const sortedChecks = checkinDates.slice().sort().reverse();
  let streak = 0;
  const checkToday = new Date(today);
  for (let i = 0; i < sortedChecks.length; i++) {
    const d = new Date(sortedChecks[i]);
    const expected = new Date(checkToday);
    expected.setDate(expected.getDate() - i);
    if (d.toDateString() === expected.toDateString()) streak++;
    else break;
  }

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  let weekTrained = 0;
  for (const d of checkinDates) {
    if (new Date(d) >= weekStart) weekTrained++;
  }

  const alreadyDone = todayLog?.completed ?? false;

  return (
    <div className="px-4 pt-4">
      <div className="bg-surface rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">连续训练</div>
          <div className="text-huge text-white">{streak} <span className="text-lg text-slate-400">天</span></div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">本周</div>
          <div className="text-huge text-accent">{weekTrained}<span className="text-lg text-slate-400">/5</span></div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-big text-white">
          今日计划 · <span className="text-accent">{plan.name}</span>
        </h2>
        {alreadyDone && (
          <span className="bg-accent text-white text-xs px-3 py-1 rounded-full font-bold">已完成</span>
        )}
      </div>

      {plan.exercises.map((ex, i) => {
        const def = EXERCISE_LIBRARY[ex.exerciseId];
        if (!def) return null;
        const completedSets = getCompletedSets(todayLog?.exercises, ex.exerciseId);
        return (
          <ExerciseCard
            key={`${ex.exerciseId}-${i}`}
            index={i}
            name={def.name}
            equipment={def.equipment}
            weight={ex.weight}
            sets={ex.sets}
            reps={ex.reps}
            restSeconds={ex.restSeconds}
            durationSeconds={ex.durationSeconds}
            completedSets={completedSets}
            active={false}
            onDemo={() => setDemoExercise({ def, weight: ex.weight })}
          />
        );
      })}

      <button
        onClick={() => onStartWorkout(plan.exercises, plan.name)}
        className="w-full bg-accent hover:bg-green-600 text-white text-xl font-bold py-4 rounded-xl mt-4 mb-4 transition-colors active:scale-95"
      >
        {alreadyDone ? '🔄 重新训练' : '▶ 开始训练'}
      </button>

      {demoExercise && (
        <ExerciseDemoModal
          exercise={demoExercise.def}
          weight={demoExercise.weight}
          onClose={() => setDemoExercise(null)}
        />
      )}
    </div>
  );
}
