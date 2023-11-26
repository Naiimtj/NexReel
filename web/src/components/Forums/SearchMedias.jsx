import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { BsSearch } from "react-icons/bs";
import { getSearch } from "../../../services/TMDB/services-tmdb";
import SearchResults from "../Search/SearchResults";

const SearchMedias = ({ basicForum, hidden, setHidden, changeSeenPending,
  setChangeSeenPending, }) => {
  const [t] = useTranslation("translation");
  const [moviesList, setMovies] = useState([]);
  const [tvList, setTvs] = useState([]);
  const [personsList, setPersons] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (searching) {
      getSearch(searchValue, "person").then((persons) => {
        setPersons(persons);
        getSearch(searchValue, "movie").then((movies) => {
          setMovies(movies);
          getSearch(searchValue, "tv").then((tvs) => {
            setTvs(tvs);
          });
        });
      });
    }
  }, [searchValue, searching]);

  const onChangeInput = (e) => {
    setSearchValue(e.target.value);
    setSearching(true);
  };
  const hideSearch = () => {
    setHidden(false);
    setSearchValue("");
    setMovies([]);
    setTvs([]);
    setPersons([]);
    setSearching(false);
  };
  useEffect(() => {
    if (hidden) {
      setSearchValue("");
      setMovies([]);
      setTvs([]);
      setPersons([]);
      setSearching(false);
    }
  }, [hidden]);

  return (
    <div>
      <div className="grid grid-flow-col auto-cols-max justify-center">
        <div className="border-2 rounded-xl border-gray-600 flex flex-row p-3">
          <div className="relative w-1/6 md:w-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
              <BsSearch />
            </span>
            <input
              className="placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-transparent  pl-9 pr-3 shadow-sm focus:outline-none sm:text-sm text-grayNR"
              placeholder={t("movie, tv, person...")}
              value={searchValue}
              onChange={onChangeInput}
              type="text"
            />
          </div>
        </div>
      </div>
      {searchValue !== "" ? (
        <div className="mt-1 px-4 w-full z-50 grid gap-3 pb-4 pt-8 justify-items-center bg-local backdrop-blur-md bg-[#20283E]/60 rounded-b-lg text-gray-200 text-xl">
          {/* // PERSONS */}
          {personsList.results && personsList.results.length > 0 ? (
            <SearchResults
              listMedias={personsList}
              media={"person"}
              hideSearch={hideSearch}
              isForum
              basicForum={basicForum}
              changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
            />
          ) : null}
          {/* // MOVIES */}
          {moviesList.results && moviesList.results.length > 0 ? (
            <div className="text-left">
              <h1 className="ml-8 uppercase text-2xl">{t("Movies")}</h1>
              <SearchResults
                listMedias={moviesList}
                media={"movie"}
                hideSearch={hideSearch}
                isForum
                basicForum={basicForum}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
              />
            </div>
          ) : null}
          {/* // TV SHOWS */}
          {tvList.results && tvList.results.length > 0 ? (
            <div className="text-left">
              <h1 className="ml-8 uppercase text-2xl">{t("tv shows")}</h1>
              <SearchResults
                listMedias={tvList}
                media={"tv"}
                hideSearch={hideSearch}
                isForum
                basicForum={basicForum}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SearchMedias;

SearchMedias.defaultProps = {
  basicForum: {},
  hidden: false,
  setHidden: () => {},
  changeSeenPending: false,
  setChangeSeenPending: () => {},
};

SearchMedias.propTypes = {
  basicForum: PropTypes.object,
  hidden: PropTypes.bool,
  setHidden: PropTypes.func,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
};
