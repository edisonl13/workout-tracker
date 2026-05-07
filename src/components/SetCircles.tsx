interface Props {
  total: number;
  completed: number;
  size?: 'sm' | 'lg';
}

export default function SetCircles({ total, completed, size = 'sm' }: Props) {
  const dim = size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`${dim} rounded-full flex items-center justify-center font-bold border-2 transition-all ${
            i < completed
              ? 'bg-accent border-accent text-white'
              : 'border-slate-500 text-slate-500'
          }`}
        >
          {i < completed ? '✓' : i + 1}
        </div>
      ))}
    </div>
  );
}
