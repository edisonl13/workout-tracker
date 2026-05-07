import { useState } from 'react';
import { getWeightLogs, saveWeightEntry, deleteWeightEntry, fmtDate } from '../utils/storage';
import type { WeightEntry } from '../utils/storage';
import WeightTrend from '../components/WeightTrend';

export default function WeightLogPage() {
  const [logs, setLogs] = useState<WeightEntry[]>(getWeightLogs());
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const w = parseFloat(inputValue);
    if (isNaN(w) || w < 30 || w > 200) return;
    const entry: WeightEntry = { date: fmtDate(new Date()), weight: w };
    saveWeightEntry(entry);
    setLogs(getWeightLogs());
    setInputValue('');
  };

  const handleDelete = (date: string) => {
    deleteWeightEntry(date);
    setLogs(getWeightLogs());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  // Weekly average
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekLogs = logs.filter(l => new Date(l.date) >= weekStart);
  const weekAvg = weekLogs.length > 0
    ? weekLogs.reduce((s, l) => s + l.weight, 0) / weekLogs.length
    : null;

  // Previous week average
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekLogs = logs.filter(l => {
    const d = new Date(l.date);
    return d >= prevWeekStart && d < weekStart;
  });
  const prevWeekAvg = prevWeekLogs.length > 0
    ? prevWeekLogs.reduce((s, l) => s + l.weight, 0) / prevWeekLogs.length
    : null;

  const diff = (weekAvg !== null && prevWeekAvg !== null) ? weekAvg - prevWeekAvg : null;

  return (
    <div className="px-4 pt-4">
      {/* Input */}
      <div className="bg-surface rounded-xl p-4 mb-4">
        <label className="text-sm text-slate-400 block mb-2">今早空腹体重</label>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            inputMode="decimal"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="63.0"
            step="0.1"
            min="30"
            max="200"
            className="flex-1 bg-slate-800 text-white text-huge text-center py-3 rounded-xl border-2 border-slate-600 focus:border-accent outline-none"
          />
          <span className="text-xl text-slate-400">kg</span>
          <button
            onClick={handleAdd}
            className="bg-accent text-white text-lg font-bold py-3 px-6 rounded-xl active:scale-95"
          >
            记录
          </button>
        </div>
      </div>

      {/* Stats */}
      {weekAvg !== null && (
        <div className="bg-surface rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">本周平均</div>
            <div className="text-huge text-white">{weekAvg.toFixed(1)} <span className="text-lg text-slate-400">kg</span></div>
          </div>
          {diff !== null && (
            <div className={`text-right ${Math.abs(diff) < 0.1 ? 'text-slate-400' : diff < 0 ? 'text-accent' : 'text-danger'}`}>
              <div className="text-sm">较上周</div>
              <div className="text-xl font-bold">
                {diff < 0 ? '↓' : diff > 0 ? '↑' : '→'} {Math.abs(diff).toFixed(1)} kg
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trend chart */}
      <WeightTrend data={logs} />

      {/* History */}
      <div className="mt-4 mb-4">
        <h3 className="text-big text-white mb-3">历史记录</h3>
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">暂无记录</p>
        ) : (
          <div className="space-y-1">
            {logs.slice().reverse().map(l => (
              <div key={l.date} className="flex items-center justify-between bg-surface rounded-lg px-4 py-3">
                <span className="text-slate-300">{l.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">{l.weight} kg</span>
                  <button
                    onClick={() => handleDelete(l.date)}
                    className="text-slate-600 text-sm active:text-danger"
                  >
                    删
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
