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

// Day label + plan name for the weekly strip
const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const DAY_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function getDayType(day: number): 'training' | 'recovery' | 'rest' {
  if (day === 0) return 'rest';       // Sunday
  if (day === 6) return 'recovery';    // Saturday
  return 'training';                   // Mon-Fri
}

function getDayLabel(day: number): string {
  const plan = WEEKLY_PLAN[day];
  if (!plan) return '';
  const t = getDayType(day);
  if (t === 'rest') return '休息';
  if (t === 'recovery') return '恢复';
  return plan.name;
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

  const dayType = getDayType(dayOfWeek);

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
      {/* Streak & Week Progress */}
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

      {/* Weekly Overview Strip — like Keep/Hardcore */}
      <div className="bg-surface rounded-xl p-3 mb-4">
        <div className="flex justify-between items-center">
          {[0, 1, 2, 3, 4, 5, 6].map(day => {
            const dt = getDayType(day);
            const isToday = day === dayOfWeek;
            const checked = checkinDates.some(d => {
              const cd = new Date(d);
              const weekDay = cd.getDay();
              // Check if this check-in falls on this day of the current week
              const checkDate = new Date(d);
              return checkDate.getDay() === day && checkDate >= weekStart;
            });
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                {/* Day name */}
                <span className={`text-xs font-medium ${
                  isToday ? 'text-white' : 'text-slate-500'
                }`}>
                  {DAY_LABELS[day]}
                </span>
                {/* Indicator dot */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isToday
                    ? dt === 'rest' ? 'bg-slate-600 text-white border-2 border-slate-500'
                    : 'bg-accent text-white'
                  : checked
                    ? 'bg-accent-dim text-white'
                    : dt === 'rest'
                      ? 'bg-slate-700 text-slate-500'
                      : dt === 'recovery'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-surface-light text-slate-400'
                }`}>
                  {checked ? '✓' : dt === 'rest' ? '休' : DAY_LABELS[day]}
                </div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-accent inline-block" /> 训练
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> 恢复
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" /> 休息
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-accent-dim inline-block" /> ✓ 完成
          </span>
        </div>
      </div>

      {/* Today's header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-big text-white">
            {DAY_SHORT[dayOfWeek]} · <span className={
              dayType === 'rest' ? 'text-slate-500' :
              dayType === 'recovery' ? 'text-blue-400' : 'text-accent'
            }>{plan.name}</span>
          </h2>
          {dayType === 'rest' && (
            <p className="text-slate-500 text-sm mt-1">🧘 今天休息，让肌肉修复生长</p>
          )}
          {dayType === 'recovery' && (
            <p className="text-blue-400/70 text-sm mt-1">🌿 户外恢复日，低强度活动</p>
          )}
        </div>
        {alreadyDone && (
          <span className="bg-accent text-white text-xs px-3 py-1 rounded-full font-bold">已完成</span>
        )}
      </div>

      {/* Exercise list */}
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

      {/* Start / Rest prompt */}
      {dayType === 'rest' ? (
        <div className="bg-surface rounded-xl p-4 mt-4 mb-4 text-center">
          <p className="text-slate-400 text-lg mb-2">😴 休息日不需要训练</p>
          <p className="text-slate-500 text-sm">
            肌肉在休息时生长。睡眠 + 营养比多练一天更重要。
          </p>
        </div>
      ) : (
        <button
          onClick={() => onStartWorkout(plan.exercises, plan.name)}
          className={`w-full text-white text-xl font-bold py-4 rounded-xl mt-4 mb-4 transition-colors active:scale-95 ${
            dayType === 'recovery' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-accent hover:bg-green-600'
          }`}
        >
          {alreadyDone ? '🔄 重新训练' : dayType === 'recovery' ? '🌿 开始恢复' : '▶ 开始训练'}
        </button>
      )}

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
