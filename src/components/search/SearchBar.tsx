import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { cn } from '../../utils/cn';

export function SearchBar({
  onSearch,
  autoFocus = false,
  className,
}: {
  readonly onSearch?: () => void;
  readonly autoFocus?: boolean;
  readonly className?: string;
}) {
  const { query, setQuery, dataset } = useApp();
  const navigate = useNavigate();
  const suggestions = Array.from(
    new Set([dataset.defaultQuery, ...(dataset.testQueries ?? [])].filter(Boolean)),
  ).slice(0, 5) as string[];

  const submit = () => {
    if (onSearch) onSearch();
    else navigate('/search');
  };

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-blue-400 focus-within:shadow-md"
      >
        <Search className="ml-2 shrink-0 text-slate-400" size={18} aria-hidden="true" />
        <label htmlFor="mini-google-query" className="sr-only">
          Search query
        </label>
        <input
          id="mini-google-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus={autoFocus}
          placeholder={`Search ${dataset.name.replace(/^Scenario \d+: /, '')}…`}
          className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {suggestions.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Sparkles size={13} className="text-slate-400" aria-hidden="true" />
          <span className="text-xs text-slate-500">Try:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                query === suggestion
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
