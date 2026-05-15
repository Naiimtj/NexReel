import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';
import { getSearch } from '../../services/TMDB/services-tmdb';
import SearchResults from '../components/Search/SearchResults';
import { BaseIcon } from '../components/base';

const SearchLayout = ({ hiden = false, fullWidth = false, onSelect }) => {
  const [t] = useTranslation('translation');
  const [moviesList, setMovies] = useState([]);
  const [tvList, setTvs] = useState([]);
  const [personsList, setPersons] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setSearchValue('');
    setMovies([]);
    setTvs([]);
    setPersons([]);
    setSearching(false);
  };

  const handleSelect = () => {
    reset();
    if (onSelect) onSelect();
  };

  useEffect(() => {
    if (!searching) return;
    const timerId = setTimeout(() => {
      Promise.all([
        getSearch(searchValue, 'person'),
        getSearch(searchValue, 'movie'),
        getSearch(searchValue, 'tv'),
      ]).then(([persons, movies, tvs]) => {
        setPersons(persons);
        setMovies(movies);
        setTvs(tvs);
      });
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchValue, searching]);

  useEffect(() => {
    if (hiden) reset();
    else inputRef.current?.focus();
  }, [hiden]);

  const onChangeInput = (e) => {
    setSearchValue(e.target.value);
    setSearching(true);
  };

  return (
    <div className={fullWidth ? 'w-full' : undefined}>
      <div
        className={`grid grid-flow-col max-w-full ${
          fullWidth ? 'auto-cols-fr w-full' : 'auto-cols-max'
        }`}
      >
        <div className="border-2 rounded-xl border-gray-600 flex flex-row p-1 w-full">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
              <BsSearch />
            </span>
            <input
              ref={inputRef}
              className="placeholder:italic placeholder:text-slate-400 block bg-transparent w-full min-w-0 border border-transparent pl-9 pr-8 shadow-sm focus:outline-none sm:text-sm text-grayNR"
              placeholder={t('movie, tv, person...')}
              value={searchValue}
              onChange={onChangeInput}
              type="text"
            />
            {searchValue && (
              <BaseIcon
                icon="close"
                size="sm"
                onClick={reset}
                tooltip={t('Clear')}
                className="fill-slate-400 transition duration-200 hover:fill-grayNR"
                wrapperClassName="absolute inset-y-0 right-0 flex items-center pr-2"
              />
            )}
          </div>
        </div>
      </div>
      {searchValue && (
        <div className="mt-1 w-full z-50 absolute left-0 grid gap-3 pb-4 pt-4 justify-items-center bg-local backdrop-blur-md bg-[#20283E]/60 rounded-b-lg text-gray-200 text-xl">
          {personsList.results?.length > 0 && (
            <SearchResults
              listMedias={personsList}
              media="person"
              hideSearch={handleSelect}
            />
          )}
          {moviesList.results?.length > 0 && (
            <SearchResults
              title={t('Movies')}
              listMedias={moviesList}
              media="movie"
              hideSearch={handleSelect}
            />
          )}
          {tvList.results?.length > 0 && (
            <SearchResults
              title={t('tv shows')}
              listMedias={tvList}
              media="tv"
              hideSearch={handleSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};
export default SearchLayout;
