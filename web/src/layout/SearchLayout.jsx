import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BsSearch } from 'react-icons/bs';
import { getSearch } from '../../services/TMDB/services-tmdb';
import SearchResults from '../components/Search/SearchResults';

const SearchLayout = ({ hiden = false }) => {
  const [t] = useTranslation('translation');
  const [moviesList, setMovies] = useState([]);
  const [tvList, setTvs] = useState([]);
  const [personsList, setPersons] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);

  const reset = () => {
    setSearchValue('');
    setMovies([]);
    setTvs([]);
    setPersons([]);
    setSearching(false);
  };

  useEffect(() => {
    if (!searching) return;
    Promise.all([
      getSearch(searchValue, 'person'),
      getSearch(searchValue, 'movie'),
      getSearch(searchValue, 'tv'),
    ]).then(([persons, movies, tvs]) => {
      setPersons(persons);
      setMovies(movies);
      setTvs(tvs);
    });
  }, [searchValue, searching]);

  useEffect(() => {
    if (hiden) reset();
  }, [hiden]);

  const onChangeInput = (e) => {
    setSearchValue(e.target.value);
    setSearching(true);
  };

  return (
    <div>
      <div className="grid grid-flow-col auto-cols-max">
        <div className="border-2 rounded-xl border-gray-600 flex flex-row p-1">
          <div className="relative w-1/6 md:w-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
              <BsSearch />
            </span>
            <input
              className="placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-transparent pl-9 pr-3 shadow-sm focus:outline-none sm:text-sm text-grayNR"
              placeholder={t('movie, tv, person...')}
              value={searchValue}
              onChange={onChangeInput}
              type="text"
            />
          </div>
        </div>
      </div>
      {searchValue && (
        <div className="mt-1 w-full z-50 absolute left-0 grid gap-3 pb-4 pt-4 justify-items-center bg-local backdrop-blur-md bg-[#20283E]/60 rounded-b-lg text-gray-200 text-xl">
          {personsList.results?.length > 0 && (
            <SearchResults
              listMedias={personsList}
              media="person"
              hideSearch={reset}
            />
          )}
          {moviesList.results?.length > 0 && (
            <SearchResults
              title={t('Movies')}
              listMedias={moviesList}
              media="movie"
              hideSearch={reset}
            />
          )}
          {tvList.results?.length > 0 && (
            <SearchResults
              title={t('tv shows')}
              listMedias={tvList}
              media="tv"
              hideSearch={reset}
            />
          )}
        </div>
      )}
    </div>
  );
};

SearchLayout.propTypes = { hiden: PropTypes.bool };

export default SearchLayout;
