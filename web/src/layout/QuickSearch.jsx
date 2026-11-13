import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getSearch } from '../../services/TMDB/services-tmdb';
import { BaseIcon } from '../components/base';

const THUMB_BASE = 'https://www.themoviedb.org/t/p/w94_and_h141_bestv2';
const MAX_RESULTS = 6;

/**
 * Navbar movie-only search with instant suggestions. Enter or the footer
 * opens the full search (people, movies and TV) with the same query.
 */
const QuickSearch = ({
  onOpenFull = () => {},
  onSelect,
  autoFocus = false,
}) => {
  const [t, i18next] = useTranslation('translation');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const term = query.trim();

  useEffect(() => {
    if (!term) return undefined;
    let active = true;
    setResults(null);
    const timerId = setTimeout(() => {
      getSearch(term, 'movie', i18next.language).then((data) => {
        if (active) setResults((data.results || []).slice(0, MAX_RESULTS));
      });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [term, i18next.language]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
  };

  const openFull = () => {
    onOpenFull(term);
    close();
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <BaseIcon
        icon="search"
        size="small"
        className="text-gray-500"
        wrapperClassName="pointer-events-none absolute inset-y-0 left-3 flex items-center"
      />
      <input
        type="text"
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false);
          if (event.key === 'Enter' && term) openFull();
        }}
        placeholder={t('Search movies...')}
        aria-label={t('Search movies...')}
        className="w-full rounded-full bg-white/5 py-1.5 pl-9 pr-3 text-sm text-gray-200 ring-1 ring-white/10 transition placeholder:text-gray-500 focus:bg-white/10 focus:outline-none focus:ring-purpleNR/50"
      />
      {isOpen && term ? (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-[#20283E]/95 text-left shadow-xl ring-1 ring-white/10 backdrop-blur-md">
          {results === null ? (
            <p className="px-4 py-3 text-xs text-gray-500">
              {t('Searching...')}
            </p>
          ) : null}
          {results?.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-500">{t('No Results')}</p>
          ) : null}
          {results?.length > 0 ? (
            <ul className="py-1">
              {results.map((movie) => (
                <li key={movie.id}>
                  <Link
                    to={`/movie/${movie.id}`}
                    onClick={() => {
                      close();
                      onSelect?.();
                    }}
                    className="flex items-center gap-3 px-3 py-1.5 transition hover:bg-white/5"
                  >
                    {movie.poster_path ? (
                      <img
                        src={`${THUMB_BASE}${movie.poster_path}`}
                        alt=""
                        className="h-12 w-8 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span className="h-12 w-8 shrink-0 rounded bg-white/10" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-gray-200">
                        {movie.title}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {movie.release_date?.slice(0, 4)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={openFull}
            className="flex w-full items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-purpleNR transition hover:bg-white/5"
          >
            {t('Full search')}
            <kbd className="font-sans text-[10px] text-gray-500">Enter</kbd>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default QuickSearch;
