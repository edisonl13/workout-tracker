import { useState, useCallback, useEffect, useRef } from 'react';
import type { WorkoutExercise } from '../data/weeklyPlan';
import { EXERCISE_LIBRARY, type ExerciseDef } from '../data/exercises';
import { WARMUP, COOLDOWN } from '../data/routines';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from '../components/TimerDisplay';
import SetCircles from '../components/SetCircles';
import ExerciseDemoModal from '../components/ExerciseDemoModal';
import { playSetCompleteBeep } from '../utils/audio';

interface Props {
  plan: WorkoutExercise[];
  planName: string;
  onExit: () => void;
}

type WorkoutPhase = 'warmup' | 'main' | 'cooldown' | 'done';

function fmtDuration(s: number): string {
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}分${sec}秒` : `${m}分钟`;
  }
  return `${s}秒`;
}

function fmtEquipment(eq: string, w: number): string {
  if (eq === 'bodyweight') return '徒手';
  if (eq === 'dumbbell') return `哑铃 ${w}kg×2`;
  if (eq === 'barbell') return `杠铃 ${w}kg`;
  if (eq === 'pullup_bar') return '引体杆';
  return eq;
}

function getPhase(exIndex: number, totalAll: number, warmupCount: number, mainCount: number): WorkoutPhase {
  if (exIndex < warmupCount) return 'warmup';
  if (exIndex < warmupCount + mainCount) return 'main';
  return 'cooldown';
}

const PHASE_COLORS: Record<WorkoutPhase, string> = {
  warmup: 'text-amber-400',
  main: 'text-accent',
  cooldown: 'text-blue-400',
  done: 'text-white',
};

const PHASE_NAMES: Record<WorkoutPhase, string> = {
  warmup: '热身激活',
  main: '正式训练',
  cooldown: '拉伸放松',
  done: '完成',
};

export default function ActiveWorkout({ plan, planName, onExit }: Props) {
  const ws = useWorkoutState();
  const [repCount, setRepCount] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timerLabel, setTimerLabel] = useState('组间休息');
  const [demoExercise, setDemoExercise] = useState<{ def: ExerciseDef; weight: number } | null>(null);
  const [waterTip, setWaterTip] = useState(false);
  const timerModeRef = useRef<'rest' | 'stretch'>('rest');
  const combinedPlan = useRef<WorkoutExercise[]>([]);
  const warmupCount = useRef(0);
  const mainCount = useRef(0);

  const handleTimerComplete = useCallback(() => {
    setShowTimer(false);
    if (timerModeRef.current === 'stretch') {
      const wasLastSet = ws.isLastSet;
      const wasLastExercise = ws.isLastExercise;
      ws.completeSet(1, ws.exercises[ws.currentExerciseIndex]?.weight ?? 0);
      if (wasLastSet && wasLastExercise) {
        ws.completeWorkout(planName);
      } else if (wasLastSet && !wasLastExercise) {
        timerModeRef.current = 'rest';
        setTimerLabel('组间休息');
        setShowTimer(true);
        timer.start(ws.exercises[ws.currentExerciseIndex]?.restSeconds ?? 60);
      } else {
        timerModeRef.current = 'rest';
        setTimerLabel('组间休息');
        setShowTimer(true);
        timer.start(ws.exercises[ws.currentExerciseIndex]?.restSeconds ?? 60);
      }
    } else {
      if (ws.isLastSet) {
        ws.advanceExercise();
      } else {
        ws.skipRest();
      }
    }
  }, [ws, planName]);

  const timer = useTimer(handleTimerComplete);

  // Build combined plan: warmup + main + cooldown
  useEffect(() => {
    const full = [...WARMUP, ...plan, ...COOLDOWN];
    combinedPlan.current = full;
    warmupCount.current = WARMUP.length;
    mainCount.current = plan.length;
    ws.startWorkout(full);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentEx = ws.exercises[ws.currentExerciseIndex];
  const currentDef = currentEx?.def;
  const isTimedExercise = currentEx ? currentEx.durationSeconds > 0 : false;
  const initialReps = currentEx?.targetReps ?? 12;
  const phase: WorkoutPhase = getPhase(
    ws.currentExerciseIndex,
    ws.exercises.length,
    warmupCount.current,
    mainCount.current,
  );

  // Set reps when exercise changes
  useEffect(() => {
    setRepCount(initialReps);
    // Show water tip after every 3rd exercise in main phase
    const exIdx = ws.currentExerciseIndex - warmupCount.current;
    if (phase === 'main' && exIdx > 0 && exIdx % 3 === 0) {
      setWaterTip(true);
    }
  }, [ws.currentExerciseIndex, initialReps, phase]);

  const handleCompleteSet = () => {
    playSetCompleteBeep();
    const reps = isTimedExercise ? 1 : repCount;
    ws.completeSet(reps, currentEx.weight);

    if (ws.isLastSet && ws.isLastExercise) {
      ws.completeWorkout(planName);
    } else {
      timerModeRef.current = 'rest';
      setTimerLabel(isTimedExercise ? '拉伸完成，休息' : '组间休息');
      setShowTimer(true);
      timer.start(currentEx.restSeconds);
    }
  };

  const handleSkipRest = () => {
    timer.skip();
    setShowTimer(false);
    if (timerModeRef.current === 'stretch') {
      handleCompleteSet();
    } else if (ws.isLastSet) {
      ws.advanceExercise();
    } else {
      ws.skipRest();
    }
  };

  const handleStartStretch = () => {
    timerModeRef.current = 'stretch';
    setTimerLabel(currentDef?.name ?? '保持');
    setShowTimer(true);
    timer.start(currentEx.durationSeconds);
  };

  // ---- Done state ----
  if (ws.phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-safe px-6 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-huge text-white mb-2">训练完成！</h2>
        <p className="text-lg text-slate-400 mb-2">{planName}</p>
        <p className="text-slate-500 mb-4">热身 + 训练 + 拉伸 全部完成</p>
        <div className="bg-surface rounded-xl p-4 mb-8 text-left w-full max-w-sm">
          <div className="text-sm text-slate-400 mb-2">💡 训练后提示</div>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>· 30分钟内补充蛋白质（鸡蛋/蛋白粉/鸡胸）</li>
            <li>· 今晚早点睡，肌肉在睡眠中修复</li>
            <li>· 明天不同部位可以接着练</li>
          </ul>
        </div>
        <button
          onClick={onExit}
          className="bg-accent text-white text-xl font-bold py-4 px-12 rounded-xl active:scale-95"
        >
          返回首页
        </button>
      </div>
    );
  }

  // ---- Load check ----
  if (!currentEx) {
    return (
      <div className="flex items-center justify-center min-h-safe">
        <p className="text-slate-400">加载中...</p>
      </div>
    );
  }

  // ---- Rest Timer overlay ----
  if (showTimer && ws.phase === 'rest') {
    return (
      <div className="flex flex-col min-h-safe bg-slate-900">
        <div className="bg-slate-800 px-4 py-3 pt-safe flex items-center justify-between">
          <button onClick={onExit} className="text-slate-400 text-lg active:text-white">
            ← 退出
          </button>
          <span className="text-white font-bold">
            {currentDef?.name} · {ws.currentSetIndex + 1}/{currentEx.targetSets}
          </span>
          <button onClick={handleSkipRest} className="text-accent text-lg font-bold">
            跳过
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <TimerDisplay seconds={timer.seconds} running={timer.running} label={timerLabel} />
          <div className="mt-4 text-slate-400 text-lg">
            下一个：{ws.isLastSet ? '下一个动作' : `第 ${ws.currentSetIndex + 2} 组`}
          </div>
          {phase === 'main' && (
            <div className="mt-4 text-slate-500 text-sm">💧 组间可以小口喝水，别大口灌</div>
          )}
          <button
            onClick={handleSkipRest}
            className="mt-8 bg-surface-light text-white text-lg font-bold py-3 px-8 rounded-xl active:scale-95"
          >
            跳过休息
          </button>
        </div>
      </div>
    );
  }

  // ---- Stretch timer overlay ----
  if (showTimer && isTimedExercise && ws.phase === 'active') {
    return (
      <div className="flex flex-col min-h-safe bg-slate-900">
        <div className="bg-slate-800 px-4 py-3 pt-safe flex items-center justify-between">
          <button onClick={() => { timer.reset(); setShowTimer(false); }} className="text-slate-400 text-lg">
            ← 返回
          </button>
          <span className="text-white font-bold">{currentDef?.name}</span>
          <span className="text-slate-400">{currentEx.durationSeconds}秒</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <TimerDisplay seconds={timer.seconds} running={timer.running} label="保持呼吸，不要憋气" total={currentEx.durationSeconds} />
          {phase === 'cooldown' && (
            <p className="text-blue-400 text-sm mt-4">🧘 这是训练后拉伸，帮助肌肉恢复</p>
          )}
          <button
            onClick={handleSkipRest}
            className="mt-8 bg-danger text-white text-lg font-bold py-3 px-8 rounded-xl active:scale-95"
          >
            提前结束
          </button>
        </div>
      </div>
    );
  }

  // ---- Water tip overlay ----
  if (waterTip) {
    return (
      <div className="flex flex-col min-h-safe bg-slate-900 items-center justify-center px-8 text-center">
        <div className="text-6xl mb-6">💧</div>
        <h2 className="text-huge text-white mb-3">喝口水吧</h2>
        <p className="text-lg text-slate-400 mb-4">
          小口抿，不要大口灌<br />
          冰水会影响消化，温水最好
        </p>
        <p className="text-sm text-slate-600 mb-8">
          训练中保持水分补充，有助于维持运动表现
        </p>
        <button
          onClick={() => setWaterTip(false)}
          className="bg-accent text-white text-xl font-bold py-4 px-12 rounded-xl active:scale-95"
        >
          继续训练
        </button>
      </div>
    );
  }

  // ---- Active workout ----
  const exIdxInPhase = phase === 'warmup'
    ? ws.currentExerciseIndex
    : phase === 'main'
      ? ws.currentExerciseIndex - warmupCount.current
      : ws.currentExerciseIndex - warmupCount.current - mainCount.current;
  const totalInPhase = phase === 'warmup'
    ? warmupCount.current
    : phase === 'main'
      ? mainCount.current
      : COOLDOWN.length;

  return (
    <div className="flex flex-col min-h-safe bg-slate-900">
      {/* Top bar */}
      <div className="bg-slate-800 px-4 py-3 pt-safe flex items-center justify-between">
        <button onClick={onExit} className="text-slate-400 text-lg active:text-white">
          ← 退出
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">{currentDef?.name}</span>
          <button
            onClick={() => currentDef && setDemoExercise({ def: currentDef, weight: currentEx.weight })}
            className="w-6 h-6 rounded-full bg-slate-600 text-slate-300 text-xs font-bold flex items-center justify-center active:bg-slate-500"
          >
            ?
          </button>
        </div>
        <span className="text-accent font-bold">
          {ws.currentSetIndex + 1}/{currentEx.targetSets}
        </span>
      </div>

      {/* Phase indicator */}
      <div className="bg-slate-800/50 px-4 py-2 flex items-center justify-center border-b border-slate-700">
        <span className={`text-sm font-bold ${PHASE_COLORS[phase]}`}>
          {PHASE_NAMES[phase]}
        </span>
        <span className="text-slate-500 text-sm mx-2">·</span>
        <span className="text-slate-500 text-sm">
          动作 {exIdxInPhase + 1}/{totalInPhase}
        </span>
        {phase === 'warmup' && (
          <span className="text-amber-400/70 text-xs ml-2">🔥 激活关节，预防受伤</span>
        )}
        {phase === 'cooldown' && (
          <span className="text-blue-400/70 text-xs ml-2">🧘 拉伸放松，帮助恢复</span>
        )}
      </div>

      {/* Exercise info */}
      <div className="px-6 pt-6 pb-4 text-center">
        <p className="text-slate-400 text-lg mb-1">
          {phase === 'warmup'
            ? '热身 | ' + fmtEquipment(currentDef.equipment, currentEx.weight)
            : fmtEquipment(currentDef.equipment, currentEx.weight)
          }
        </p>
        {!isTimedExercise && currentEx.restSeconds > 0 && (
          <p className="text-slate-400 text-sm">
            组间休息 {fmtDuration(currentEx.restSeconds)}
          </p>
        )}
      </div>

      {/* Set circles */}
      <div className="flex justify-center mb-6">
        <SetCircles total={currentEx.targetSets} completed={ws.currentSetIndex} size="lg" />
      </div>

      {/* Rep counter (for rep-based exercises) */}
      {!isTimedExercise && (
        <div className="flex flex-col items-center mb-6">
          <div className="text-sm text-slate-500 mb-2">每次</div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setRepCount(r => Math.max(1, r - 1))}
              className="w-14 h-14 bg-surface-light text-white text-2xl font-bold rounded-full active:scale-90 flex items-center justify-center"
            >
              −
            </button>
            <span className="text-huge text-white w-20 text-center">{repCount}</span>
            <button
              onClick={() => setRepCount(r => Math.min(99, r + 1))}
              className="w-14 h-14 bg-surface-light text-white text-2xl font-bold rounded-full active:scale-90 flex items-center justify-center"
            >
              +
            </button>
          </div>
          <div className="text-sm text-slate-500 mt-2">次</div>
        </div>
      )}

      {/* Weight display */}
      {currentEx.weight > 0 && !isTimedExercise && (
        <div className="text-center mb-4">
          <span className="text-sm text-slate-500">重量: </span>
          <span className="text-lg text-amber-400 font-bold">{currentEx.weight} kg × 2</span>
        </div>
      )}

      {/* Phase-specific tips */}
      {phase === 'warmup' && (
        <div className="text-center mb-4 text-amber-400/60 text-sm">
          热身不做力竭，激活关节和肌肉即可
        </div>
      )}

      {/* Action buttons */}
      <div className="px-6 mt-auto mb-8 flex flex-col gap-3">
        {isTimedExercise ? (
          <button
            onClick={handleStartStretch}
            className={`w-full text-white text-xl font-bold py-5 rounded-xl active:scale-95 ${
              phase === 'cooldown' ? 'bg-blue-600' : phase === 'warmup' ? 'bg-amber-600' : 'bg-accent'
            }`}
          >
            开始 {currentDef?.name} · {fmtDuration(currentEx.durationSeconds)}
          </button>
        ) : (
          <button
            onClick={handleCompleteSet}
            className={`w-full text-white text-xl font-bold py-5 rounded-xl active:scale-95 ${
              phase === 'cooldown' ? 'bg-blue-600' : phase === 'warmup' ? 'bg-amber-600' : 'bg-accent'
            }`}
          >
            完成第 {ws.currentSetIndex + 1} 组
          </button>
        )}

        <div className="text-center text-sm text-slate-500">
          动作 {ws.currentExerciseIndex + 1} / {ws.exercises.length}
        </div>
      </div>

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
