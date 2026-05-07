import { useState } from 'react';
import { getCheckinDates } from '../utils/storage';
import CalendarGrid from '../components/CalendarGrid';

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const checkinDates = getCheckinDates();

  const goPrev = () => {
    if (month === 1) {
      setYear(y => y - 1);
      setMonth(12);
    } else {
      setMonth(m => m - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setYear(y => y + 1);
      setMonth(1);
    } else {
      setMonth(m => m + 1);
    }
  };

  // Stats for current month
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthChecks = checkinDates.filter(d => d.startsWith(monthPrefix));
  const daysInMonth = new Date(year, month, 0).getDate();

  // Consecutive streak
  const sorted = checkinDates.slice().sort().reverse();
  let streak = 0;
  const checkDay = new Date(today);
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    const expected = new Date(checkDay);
    expected.setDate(expected.getDate() - i);
    if (d.toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  const totalChecks = checkinDates.length;

  return (
    <div className="px-4 pt-4">
      {/* Stats */}
      <div className="bg-surface rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">连续训练</div>
          <div className="text-huge text-white">{streak} <span className="text-lg text-slate-400">天</span></div>
        </div>
        <div className="text-center">
          <div className="text-sm text-slate-400">本月</div>
          <div className="text-huge text-accent">{monthChecks.length}<span className="text-lg text-slate-400">/{daysInMonth}</span></div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">总计</div>
          <div className="text-huge text-white">{totalChecks} <span className="text-lg text-slate-400">次</span></div>
        </div>
      </div>

      {/* Month switcher */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goPrev} className="text-2xl text-slate-400 active:text-white px-2">
          ‹
        </button>
        <span className="text-big text-white">{year}年{month}月</span>
        <button onClick={goNext} className="text-2xl text-slate-400 active:text-white px-2">
          ›
        </button>
      </div>

      {/* Calendar */}
      <CalendarGrid year={year} month={month} checkinDates={checkinDates} />
    </div>
  );
}
