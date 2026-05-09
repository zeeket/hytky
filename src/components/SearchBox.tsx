import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { useDebounce } from '~/hooks/useDebounce';

const MIN_QUERY_LENGTH = 2;

function IconSearch() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const queryEnabled = debouncedQuery.length >= MIN_QUERY_LENGTH;
  const showDropdown = isOpen && query.length >= MIN_QUERY_LENGTH;

  const {
    data: results = [],
    isLoading,
    isFetching,
  } = api.search.search.useQuery(
    { query: debouncedQuery },
    { enabled: queryEnabled }
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = useCallback(
    (path: string) => {
      setIsOpen(false);
      setQuery('');
      void router.push(path);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, -1));
        break;
      case 'Enter': {
        const hit = results[selectedIndex];
        if (selectedIndex >= 0 && hit) {
          e.preventDefault();
          navigateTo(hit.path);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const showSpinner =
    showDropdown && (isLoading || (isFetching && debouncedQuery !== query));

  return (
    <div
      ref={containerRef}
      className="relative my-3 w-full max-w-80"
      data-testid="search-container"
    >
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-gray-400">
          <IconSearch />
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-controls="search-listbox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-label="Hae kategorioita ja lankoja"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Hae kategorioita ja lankoja..."
          data-testid="search-input"
          className="w-full rounded-md border border-gray-600 bg-gray-900 py-2 pr-4 pl-9 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      {showDropdown && (
        <div
          id="search-listbox"
          role="listbox"
          data-testid="search-dropdown"
          className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-600 bg-gray-900 shadow-2xl"
        >
          {showSpinner && (
            <div className="px-4 py-3 text-sm text-gray-400">Ladataan...</div>
          )}

          {!showSpinner && results.length === 0 && (
            <div
              className="px-4 py-3 text-sm text-gray-400"
              data-testid="search-no-results"
            >
              Ei tuloksia haulle &ldquo;{query}&rdquo;
            </div>
          )}

          {results.length > 0 && (
            <ul>
              {results.map((result, index) => (
                <li
                  key={`${result.type}-${result.id}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <button
                    type="button"
                    onClick={() => navigateTo(result.path)}
                    data-testid="search-result"
                    data-result-type={result.type}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors ${
                      index === selectedIndex
                        ? 'bg-purple-700 text-white'
                        : 'text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="mt-0.5 text-gray-400">
                      {result.type === 'category' ? (
                        <IconFolder />
                      ) : (
                        <IconDocument />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {result.name}
                      </span>
                      {result.snippet && (
                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            index === selectedIndex
                              ? 'text-purple-200'
                              : 'text-gray-400'
                          }`}
                        >
                          {result.snippet}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 shrink-0 text-right text-xs text-gray-500">
                      {result.type === 'category'
                        ? 'Kategoria'
                        : result.type === 'thread'
                          ? 'Lanka'
                          : 'Viesti'}
                      {result.isArchive && (
                        <span className="ml-1 rounded bg-gray-700 px-1 py-0.5 text-gray-400">
                          arkisto
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
