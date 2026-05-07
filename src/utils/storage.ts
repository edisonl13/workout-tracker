import type { WorkoutExercise } from '../data/weeklyPlan';

// --- Types ---

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutLog {
  date: string; // YYYY-MM-DD
  dayOfWeek: number;
  planName: string;
  exercises: ExerciseLog[];
  completed: boolean;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface WorkoutPlanOverride {
  dayOfWeek: number;
  exercises: WorkoutExercise[];
}

// --- Keys ---

const KEYS = {
  WORKOUT_LOGS: 'wt_workout_logs',
  WEIGHT_LOGS: 'wt_weight_logs',
  PLAN_OVERRIDES: 'wt_plan_overrides',
};

// --- Generic helpers ---

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Workout Logs ---

export function getWorkoutLogs(): WorkoutLog[] {
  return getItem<WorkoutLog[]>(KEYS.WORKOUT_LOGS, []);
}

export function getTodayLog(): WorkoutLog | null {
  const today = fmtDate(new Date());
  return getWorkoutLogs().find(l => l.date === today) ?? null;
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const logs = getWorkoutLogs().filter(l => l.date !== log.date);
  logs.push(log);
  logs.sort((a, b) => b.date.localeCompare(a.date));
  setItem(KEYS.WORKOUT_LOGS, logs);
}

export function getCheckinDates(): string[] {
  return getWorkoutLogs().filter(l => l.completed).map(l => l.date);
}

// --- Weight Logs ---

export function getWeightLogs(): WeightEntry[] {
  return getItem<WeightEntry[]>(KEYS.WEIGHT_LOGS, []);
}

export function saveWeightEntry(entry: WeightEntry): void {
  const logs = getWeightLogs().filter(l => l.date !== entry.date);
  logs.push(entry);
  logs.sort((a, b) => a.date.localeCompare(b.date));
  setItem(KEYS.WEIGHT_LOGS, logs);
}

export function deleteWeightEntry(date: string): void {
  const logs = getWeightLogs().filter(l => l.date !== date);
  setItem(KEYS.WEIGHT_LOGS, logs);
}

// --- Plan Overrides (user customizations) ---

export function getPlanOverrides(): WorkoutPlanOverride[] {
  return getItem<WorkoutPlanOverride[]>(KEYS.PLAN_OVERRIDES, []);
}

export function savePlanOverride(dayOfWeek: number, exercises: WorkoutExercise[]): void {
  const overrides = getPlanOverrides().filter(o => o.dayOfWeek !== dayOfWeek);
  overrides.push({ dayOfWeek, exercises });
  setItem(KEYS.PLAN_OVERRIDES, overrides);
}

export function getPlanOverride(dayOfWeek: number): WorkoutExercise[] | null {
  const found = getPlanOverrides().find(o => o.dayOfWeek === dayOfWeek);
  return found?.exercises ?? null;
}

// --- Helpers ---

export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
