import type { WorkoutExercise } from './weeklyPlan';

// Fixed 5-minute warmup — prepended to every workout
export const WARMUP: WorkoutExercise[] = [
  {
    exerciseId: 'jumping_jack', // 开合跳 1分钟
    sets: 1, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 60,
  },
  {
    exerciseId: 'cat_cow', // 猫牛式 ×10
    sets: 1, reps: 10, weight: 0, restSeconds: 0, durationSeconds: 0,
  },
  {
    exerciseId: 'spine_rotation', // 脊柱旋转 每边10
    sets: 1, reps: 10, weight: 0, restSeconds: 0, durationSeconds: 0,
  },
  {
    exerciseId: 'hip_circle', // 髋关节环绕 每边10
    sets: 1, reps: 10, weight: 0, restSeconds: 0, durationSeconds: 0,
  },
  {
    exerciseId: 'shoulder_circle', // 肩部环绕 前后各10
    sets: 1, reps: 10, weight: 0, restSeconds: 0, durationSeconds: 0,
  },
  {
    exerciseId: 'bodyweight_squat_warmup', // 自体重深蹲15个激活下肢
    sets: 1, reps: 15, weight: 0, restSeconds: 0, durationSeconds: 0,
  },
];

// Fixed 5-minute post-workout cooldown stretch — appended to every workout
export const COOLDOWN: WorkoutExercise[] = [
  {
    exerciseId: 'hip_flexor_stretch', // 髋屈肌 每边60s
    sets: 1, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 60,
  },
  {
    exerciseId: 'hamstring_stretch', // 大腿后侧 每边60s
    sets: 1, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 60,
  },
  {
    exerciseId: 'chest_stretch', // 胸部拉伸 30s×2
    sets: 2, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 30,
  },
  {
    exerciseId: 'calf_stretch', // 小腿拉伸 每边30s
    sets: 1, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 30,
  },
  {
    exerciseId: 'back_stretch', // 背部拉伸(婴儿式) 60s
    sets: 1, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 60,
  },
  {
    exerciseId: 'wall_stand', // 靠墙站立 3分钟
    sets: 1, reps: 1, weight: 0, restSeconds: 0, durationSeconds: 180,
  },
];
