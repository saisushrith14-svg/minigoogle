import type { RankingMode } from '../../types';
import { useApp } from '../../state/AppContext';
import { cn } from '../../utils/cn';
import { MODE_DESCRIPTIONS, MODE_LABELS } from '../../utils/format';

const MODES: RankingMode[] = ['keyword', 'pagerank', 'hybrid', 'experimental'];

export function ModeTabs() {
  const { mode, setMode } = useApp();
  return (
    <div className="font-sans">
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Ranking algorithm"
      >
        {MODES.map((item) => {
          const active = mode === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item)}
              style={
                active
                  ? {
                      border: '2px inset #7F9DB9',
                      backgroundColor: '#FFFFFF',
                      fontWeight: 'bold',
                    }
                  : {
                      border: '2px outset #FFFFFF',
                      borderRightColor: '#808080',
                      borderBottomColor: '#808080',
                      backgroundColor: '#EFEFEF',
                    }
              }
              className={cn(
                'px-2.5 py-1 text-xs select-none cursor-pointer text-black font-sans',
                active ? 'text-[#0000CC]' : 'hover:bg-[#E5E5E5]',
              )}
            >
              {MODE_LABELS[item]}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#555555] font-sans">{MODE_DESCRIPTIONS[mode]}</p>
    </div>
  );
}
