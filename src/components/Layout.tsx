import type { ReactNode } from 'react';

export type Tab = 'today' | 'workout' | 'weight' | 'calendar';

interface Props {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  children: ReactNode;
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'today', label: '今日', icon: '🏋️' },
  { key: 'workout', label: '训练', icon: '⏱️' },
  { key: 'weight', label: '体重', icon: '⚖️' },
  { key: 'calendar', label: '打卡', icon: '📅' },
];

const HEADER_PT = { paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' };
const NAV_PB = { paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' };

export default function Layout({ activeTab, onTabChange, children }: Props) {
  return (
    <div className="min-h-safe flex flex-col bg-slate-900">
      <header
        className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-10"
        style={HEADER_PT}
      >
        <h1 className="text-xl font-bold text-center text-white tracking-wider">体态重塑</h1>
      </header>
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-2 py-1 flex justify-around z-20"
        style={NAV_PB}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`flex flex-col items-center py-1 px-3 rounded-lg min-w-[64px] transition-colors ${
              activeTab === t.key ? 'text-accent' : 'text-slate-400'
            }`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className="text-xs mt-0.5">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
