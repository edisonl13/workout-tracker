interface Props {
  year: number;
  month: number; // 1-12
  checkinDates: string[]; // YYYY-MM-DD
}

const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

export default function CalendarGrid({ year, month, checkinDates }: Props) {
  const checkinSet = new Set(checkinDates);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  // day of week: 0=Sun ... 6=Sat, we want Mon=0
  let startCol = firstDay.getDay() - 1;
  if (startCol < 0) startCol = 6;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-surface rounded-xl p-4">
      <h2 className="text-lg font-bold text-center mb-4">
        {year}年{month}月
      </h2>
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map(n => (
          <div key={n} className="text-center text-xs text-slate-500 py-1">{n}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const checked = checkinSet.has(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div
              key={dateStr}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                checked
                  ? 'bg-accent text-white'
                  : isToday
                    ? 'bg-surface-light text-white border border-accent'
                    : 'text-slate-400'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
