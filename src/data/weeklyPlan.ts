import type { ExerciseDef } from './exercises';
import { EXERCISE_LIBRARY } from './exercises';

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
  durationSeconds: number;
}

export interface WorkoutDay {
  name: string;
  exercises: WorkoutExercise[];
}

function ex(id: string, overrides?: Partial<WorkoutExercise>): WorkoutExercise {
  const def: ExerciseDef = EXERCISE_LIBRARY[id];
  return {
    exerciseId: id,
    sets: def.defaultSets,
    reps: def.defaultReps,
    weight: def.defaultWeight,
    restSeconds: def.defaultRestSeconds,
    durationSeconds: def.defaultDurationSeconds,
    ...overrides,
  };
}

// dayOfWeek: 0=Sun, 1=Mon ... 6=Sat
export const WEEKLY_PLAN: Record<number, WorkoutDay> = {
  1: { // 周一 - 下肢力量
    name: '下肢力量',
    exercises: [
      ex('squat'),
      ex('rdls'),
      ex('lunges'),
      ex('glute_bridge'),
      ex('plank'),
      ex('high_knees'),
    ]
  },
  2: { // 周二 - 上肢力量+背部
    name: '上肢力量+背部',
    exercises: [
      ex('pushup'),
      ex('floor_press'),
      ex('shoulder_press'),
      ex('db_row'),
      ex('rear_fly'),
      ex('plank'),
      ex('burpee'),
    ]
  },
  3: { // 周三 - 心肺+核心
    name: '心肺+核心',
    exercises: [
      ex('high_knees'),
      ex('mountain_climber'),
      ex('jumping_jack'),
      ex('burpee'),
      ex('plank'),
      ex('side_plank'),
    ]
  },
  4: { // 周四 - 同周一
    name: '下肢力量',
    exercises: [
      ex('squat'),
      ex('rdls'),
      ex('lunges'),
      ex('glute_bridge'),
      ex('plank'),
      ex('high_knees'),
    ]
  },
  5: { // 周五 - 同周二
    name: '上肢力量+背部',
    exercises: [
      ex('pushup'),
      ex('floor_press'),
      ex('shoulder_press'),
      ex('db_row'),
      ex('rear_fly'),
      ex('plank'),
      ex('burpee'),
    ]
  },
  6: { // 周六 - 户外
    name: '户外日',
    exercises: [
      ex('pullup'),
      ex('brisk_walk'),
    ]
  },
  0: { // 周日 - 休息日
    name: '休息日',
    exercises: [
      ex('wall_stand'),
    ]
  }
};
