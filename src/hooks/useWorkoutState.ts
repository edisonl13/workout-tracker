import { useState, useCallback } from 'react';
import type { WorkoutExercise } from '../data/weeklyPlan';
import type { ExerciseLog, WorkoutLog } from '../utils/storage';
import { saveWorkoutLog, fmtDate } from '../utils/storage';
import { EXERCISE_LIBRARY } from '../data/exercises';
import type { ExerciseDef } from '../data/exercises';

export interface ActiveSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  def: ExerciseDef;
  targetSets: number;
  targetReps: number;
  weight: number;
  restSeconds: number;
  durationSeconds: number;
  sets: ActiveSet[];
  completed: boolean;
}

export type WorkoutPhase = 'idle' | 'active' | 'rest' | 'stretch' | 'done';

interface UseWorkoutStateReturn {
  phase: WorkoutPhase;
  exercises: ActiveExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number; // next uncompleted set in the current exercise
  isLastExercise: boolean;
  isLastSet: boolean;

  startWorkout: (plan: WorkoutExercise[]) => void;
  completeSet: (reps: number, weight: number) => void;
  startRest: () => void;
  skipRest: () => void;
  advanceExercise: () => void;
  completeWorkout: (planName: string) => void;
  reset: () => void;
}

function buildExercises(plan: WorkoutExercise[]): ActiveExercise[] {
  return plan.map(pe => {
    const def = EXERCISE_LIBRARY[pe.exerciseId] ?? EXERCISE_LIBRARY.squat;
    return {
      exerciseId: pe.exerciseId,
      def,
      targetSets: pe.sets,
      targetReps: pe.reps,
      weight: pe.weight,
      restSeconds: pe.restSeconds,
      durationSeconds: pe.durationSeconds,
      sets: Array.from({ length: pe.sets }, () => ({ reps: pe.reps, weight: pe.weight, completed: false })),
      completed: false,
    };
  });
}

export function useWorkoutState(): UseWorkoutStateReturn {
  const [phase, setPhase] = useState<WorkoutPhase>('idle');
  const [exercises, setExercises] = useState<ActiveExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const isLastExercise = currentExerciseIndex >= exercises.length - 1;
  const isLastSet = currentSetIndex >= (exercises[currentExerciseIndex]?.targetSets ?? 0) - 1;

  const startWorkout = useCallback((plan: WorkoutExercise[]) => {
    setExercises(buildExercises(plan));
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
    setPhase('active');
  }, []);

  const completeSet = useCallback((reps: number, weight: number) => {
    setExercises(prev => {
      const next = [...prev];
      const ex = { ...next[currentExerciseIndex] };
      const sets = [...ex.sets];
      sets[currentSetIndex] = { reps, weight, completed: true };
      ex.sets = sets;
      if (sets.every(s => s.completed)) {
        ex.completed = true;
      }
      next[currentExerciseIndex] = ex;
      return next;
    });

    // If this was the last set of the last exercise
    if (isLastSet && isLastExercise) {
      setPhase('done');
    } else if (isLastSet) {
      // Last set of this exercise, advance to next exercise after rest
      setPhase('rest');
    } else {
      setPhase('rest');
    }
  }, [currentExerciseIndex, currentSetIndex, isLastSet, isLastExercise]);

  const startRest = useCallback(() => {
    setPhase('rest');
  }, []);

  const skipRest = useCallback(() => {
    if (phase === 'done') return;
    if (isLastSet) {
      // Advance to next exercise
      setCurrentExerciseIndex(i => i + 1);
      setCurrentSetIndex(0);
      setPhase('active');
    } else {
      setCurrentSetIndex(i => i + 1);
      setPhase('active');
    }
  }, [phase, isLastSet]);

  const advanceExercise = useCallback(() => {
    setCurrentExerciseIndex(i => i + 1);
    setCurrentSetIndex(0);
    setPhase('active');
  }, []);

  const completeWorkout = useCallback((planName: string) => {
    const log: WorkoutLog = {
      date: fmtDate(new Date()),
      dayOfWeek: new Date().getDay(),
      planName,
      exercises: exercises.map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: s.completed })),
      })),
      completed: true,
    };
    saveWorkoutLog(log);
    setPhase('done');
  }, [exercises]);

  const reset = useCallback(() => {
    setPhase('idle');
    setExercises([]);
    setCurrentExerciseIndex(0);
    setCurrentSetIndex(0);
  }, []);

  return {
    phase, exercises, currentExerciseIndex, currentSetIndex,
    isLastExercise, isLastSet,
    startWorkout, completeSet, startRest, skipRest, advanceExercise, completeWorkout, reset,
  };
}
