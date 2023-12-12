import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { BsSearch } from "react-icons/bs";
import SearchResults from "../Search/SearchResults";
import { getSearchUsers } from "../../../services/DB/services-db";

const SearchUsers = ({ hiden }) => {
  const [t] = useTranslation("translation");
  const [users, setUsers] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    if (searching) {
      getSearchUsers(searchValue).then((users) => {
        setUsers(users);
      });
    }
  }, [searchValue, searching]);
  const onChangeInput = (e) => {
    setSearchValue(e.target.value);
    setSearching(true);
  };
  const hideSearch = () => {
    setSearchValue("");
    setUsers({});
    setSearching(false);
  };
  useEffect(() => {
    if (hiden) {
      setSearchValue("");
      setUsers({});
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
              placeholder={t("username")}
              value={searchValue}
              onChange={onChangeInput}
              type="text"
            />
          </div>
        </div>
      </div>
      {searchValue !== "" ? (
        // USERS
        <SearchResults
          searchValue={searchValue}
          listMedias={users}
          media={"user"}
          hideSearch={hideSearch}
        />
      ) : null}
    </div>
  );
};

export default SearchUsers;

SearchUsers.defaultProps = {
  hiden: false,
};

SearchUsers.propTypes = {
  hiden: PropTypes.bool,
};
