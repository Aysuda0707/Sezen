import { MAX_ATTEMPTS } from '../lib/game';
import type { Stats } from '../types';

export function StatsPanel({ stats }: { stats: Stats }) {
  const winRate =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxDist = Math.max(1, ...stats.guessDistribution);

  const items = [
    { label: 'Oynanan', value: stats.played },
    { label: 'Kazanma %', value: winRate },
    { label: 'Seri', value: stats.currentStreak },
    { label: 'En Uzun Seri', value: stats.maxStreak },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        İstatistikler
      </h3>
      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        {items.map((it) => (
          <div key={it.label}>
            <div className="text-2xl font-bold text-white">{it.value}</div>
            <div className="text-[11px] leading-tight text-slate-400">
              {it.label}
            </div>
          </div>
        ))}
      </div>

      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Tahmin Dağılımı
      </h4>
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
          const count = stats.guessDistribution[i] ?? 0;
          const width = Math.max(6, (count / maxDist) * 100);
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-slate-400">{i + 1}</span>
              <div className="h-4 flex-1 rounded bg-white/5">
                <div
                  className="flex h-4 items-center justify-end rounded bg-fuchsia-600 px-1.5 font-semibold text-white"
                  style={{ width: `${width}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
