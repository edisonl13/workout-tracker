import { useState, useCallback } from 'react';
import Layout from './components/Layout';
import type { Tab } from './components/Layout';
import TodayWorkout from './pages/TodayWorkout';
import ActiveWorkout from './pages/ActiveWorkout';
import WeightLogPage from './pages/WeightLog';
import CalendarPage from './pages/Calendar';
import type { WorkoutExercise } from './data/weeklyPlan';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [workoutMode, setWorkoutMode] = useState<{
    plan: WorkoutExercise[];
    planName: string;
  } | null>(null);

  const handleStartWorkout = useCallback((plan: WorkoutExercise[], planName: string) => {
    setWorkoutMode({ plan, planName });
    setActiveTab('workout');
  }, []);

  const handleExitWorkout = useCallback(() => {
    setWorkoutMode(null);
    setActiveTab('today');
  }, []);

  // If in workout mode, show full-screen workout
  if (workoutMode && activeTab === 'workout') {
    return (
      <ActiveWorkout
        plan={workoutMode.plan}
        planName={workoutMode.planName}
        onExit={handleExitWorkout}
      />
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <TodayWorkout onStartWorkout={handleStartWorkout} />}
      {activeTab === 'weight' && <WeightLogPage />}
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'workout' && !workoutMode && (
        <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
          <div>
            <div className="text-5xl mb-4">🏋️</div>
            <p className="text-lg text-slate-400">
              在「今日」页面选择训练计划，<br />点击「开始训练」进入训练模式
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
