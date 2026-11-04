import { Activity, FileText, Layers, Link2 } from 'lucide-react';
import type { RankingMode } from '../../types';
import { useApp } from '../../state/AppContext';
import { cn } from '../../utils/cn';
import { MODE_DESCRIPTIONS, MODE_LABELS } from '../../utils/format';

const MODE_ICONS = {
  keyword: FileText,
  pagerank: Link2,
  hybrid: Layers,
  experimental: Activity,
} as const;

const MODES: RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

export function ModeTabs() {
  const { mode, setMode } = useApp();
  return (
    <div>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="tablist"
        aria-label="Ranking algorithm"
      >
        {MODES.map((item) => {
          const Icon = MODE_ICONS[item];
          const active = mode === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition',
                active
                  ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
              )}
            >
              <Icon size={16} aria-hidden="true" className={active ? 'text-blue-600' : 'text-slate-400'} />
              <span className="text-xs font-semibold sm:text-sm">{MODE_LABELS[item]}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{MODE_DESCRIPTIONS[mode]}</p>
    </div>
  );
}
