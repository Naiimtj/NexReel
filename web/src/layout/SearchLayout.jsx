import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { getSearch } from "../../services/TMDB/services-tmdb";
import { BsSearch } from "react-icons/bs";
import SearchResults from "../components/Search/SearchResults";

const SearchLayout = ({ hiden }) => {
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

  const onchangeinput = (e) => {
    setSearchValue(e.target.value);
    setSearching(true);
  };
  const ocultarSearch = () => {
    setSearchValue("");
    setMovies([]);
    setTvs([]);
    setPersons([]);
    setSearching(false);
  };
  useEffect(() => {
    if (hiden) {
      setSearchValue("");
      setMovies([]);
      setTvs([]);
      setPersons([]);
      setSearching(false);
    }
  }, [hiden]);

  return (
    <div>
      <div className="grid grid-flow-col auto-cols-max">
        <div className="border-2 rounded-xl border-gray-600 flex flex-row p-1">
          <div className="relative w-1/6 md:w-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
              <BsSearch />
            </span>
            <input
              className="placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-transparent  pl-9 pr-3 shadow-sm focus:outline-none sm:text-sm text-grayNR"
              placeholder={t("movie, tv, person...")}
              value={searchValue}
              onChange={onchangeinput}
              type="text"
            />
          </div>
        </div>
      </div>
      {searchValue !== "" ? (
        <div className="mt-1 w-full z-50 absolute left-0 grid gap-3 pb-4 pt-4 justify-items-center bg-local backdrop-blur-md bg-[#20283E]/60 rounded-b-lg text-gray-200 text-xl">
          {/* // PERSONS */}
          {personsList.results && personsList.results.length > 0 ? (
            <SearchResults
              listMedias={personsList}
              media={"person"}
              ocultarSearch={ocultarSearch}
            />
          ) : null}
          {/* // MOVIES */}
          {moviesList.results && moviesList.results.length > 0 ? (
            <>
              <h1>{t("Movies")}</h1>
              <SearchResults
                listMedias={moviesList}
                media={"movie"}
                ocultarSearch={ocultarSearch}
              />
            </>
          ) : null}
          {/* // TV SHOWS */}
          {tvList.results && tvList.results.length > 0 ? (
            <>
              <h1>{t("tv shows")}</h1>
              <SearchResults
                listMedias={tvList}
                media={"tv"}
                ocultarSearch={ocultarSearch}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default SearchLayout;

SearchLayout.defaultProps = {
  hiden: false,
};

SearchLayout.propTypes = {
  hiden: PropTypes.bool,
};
