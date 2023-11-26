import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { BsSearch } from "react-icons/bs";
import SearchResults from "../../Search/SearchResults";
import { getSearchPlaylists } from "../../../../services/DB/services-db";

const SearchPlaylists = ({ hiden }) => {
  const [t] = useTranslation("translation");
  const [playlists, setPlaylists] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (searching) {
      getSearchPlaylists(searchValue).then((playlists) => {
        setPlaylists(playlists);
      });
    }
  }, [searchValue, searching]);
  const onchangeinput = (e) => {
    setSearchValue(e.target.value);
    setSearching(true);
  };
  const hideSearch = () => {
    setSearchValue("");
    setPlaylists({});
    setSearching(false);
  };
  useEffect(() => {
    if (hiden) {
      setSearchValue("");
      setPlaylists({});
      setSearching(false);
    }
  }, [hiden]);
  return (
    <div className="flex flex-col justify-end">
      <div className="grid grid-flow-col justify-end auto-cols-max">
        <div className="border-2 rounded-xl border-gray-600 flex flex-row p-1">
          <div className="relative w-1/6 md:w-auto">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
              <BsSearch />
            </span>
            <input
              className="placeholder:italic placeholder:text-slate-400 block bg-transparent w-full border border-transparent pl-9 pr-3 shadow-sm focus:outline-none sm:text-sm text-grayNR"
              placeholder={t("playlists title or tag")}
              value={searchValue}
              onChange={onchangeinput}
              type="text"
            />
          </div>
        </div>
      </div>
      {searchValue !== "" ? (
        // PLAYLISTS
        <div className="relative mt-1 w-full left-0 grid gap-3 pb-4 pt-4 justify-items-center bg-local backdrop-blur-md bg-[#20283E]/60 rounded-b-lg text-gray-200 text-xl">
          <SearchResults
            searchValue={searchValue}
            listMedias={playlists}
            media={"playlists"}
            hideSearch={hideSearch}
          />
        </div>
      ) : null}
    </div>
  );
};

export default SearchPlaylists;

SearchPlaylists.defaultProps = {
  hiden: false,
};

SearchPlaylists.propTypes = {
  hiden: PropTypes.bool,
};
