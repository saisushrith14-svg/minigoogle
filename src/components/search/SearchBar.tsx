import { useNavigate } from 'react-router-dom';
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
  const { query, setQuery, dataset, switchDatasetAndQuery, detectDatasetForQuery } = useApp();
  const navigate = useNavigate();
  const suggestions = Array.from(
    new Set([dataset.defaultQuery, ...(dataset.testQueries ?? [])].filter(Boolean)),
  ).slice(0, 5) as string[];

  const submit = () => {
    const trimmed = query.trim();
    if (trimmed) {
      const targetDatasetId = detectDatasetForQuery(trimmed);
      if (targetDatasetId !== dataset.id) {
        switchDatasetAndQuery(targetDatasetId, trimmed);
      }
    }
    if (onSearch) onSearch();
    else navigate('/search');
  };

  return (
    <div className={cn('w-full font-sans', className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <label htmlFor="mini-google-query" className="sr-only">
          Search query
        </label>
        <input
          id="mini-google-query"
          aria-label="Search query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus={autoFocus}
          placeholder={`Search ${dataset.name.replace(/^Scenario \d+: /, '')}…`}
          className="input-retro flex-1 min-w-[200px] text-sm py-1"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="btn-retro font-sans py-1 px-3">
          Google Search
        </button>
      </form>

      {suggestions.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#555555]">
          <span className="font-bold text-black">Try:</span>
          {suggestions.map((suggestion, idx) => (
            <span key={suggestion} className="inline-flex items-center">
              {idx > 0 && <span className="mx-1 text-[#808080]">|</span>}
              <button
                type="button"
                onClick={() => setQuery(suggestion)}
                className={`text-[#0000CC] underline cursor-pointer hover:text-[#CC0000] ${
                  query === suggestion ? 'font-bold' : ''
                }`}
              >
                {suggestion}
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
