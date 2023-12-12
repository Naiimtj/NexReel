import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";
import CarouselPersons from "./CarouselPersons";
import { IoClose } from "react-icons/io5";
import PlaylistsList from "../Users/Playlist/PlaylistsList";
import Carousel from "../../utils/Carousel/Carousel";

const SearchResults = ({
  title,
  listMedias,
  media,
  hideSearch,
  isForum,
  basicForum,
  changeSeenPending,
  setChangeSeenPending,
}) => {
  const [t] = useTranslation("translation");
  const mediaMovie = media === "movie" ? true : null;
  const mediaTv = media === "tv" ? true : null;
  const mediaPerson = media === "person" ? true : null;
  const users = media === "user" ? true : null;
  const playlists = media === "playlists" ? true : null;

  return (
    <div
      className={
        users
          ? "mt-1 w-full z-50 absolute left-0 grid gap-3 pb-4 pt-4 justify-items-center bg-local backdrop-blur-md bg-[#20283E]/60 rounded-b-lg text-gray-200 text-xl"
          : "w-full"
      }
    >
      <div
        className="absolute z-50 my-2 mx-2 top-0 right-0 cursor-pointer"
        onClick={hideSearch}
      >
        <IoClose size={30} alt={t("Close")} />
      </div>
      <div className="w-full px-4">
        {/* // - MOVIES & TV SHOWS */}
        {mediaMovie || mediaTv ? (
          <div className="w-full">
            {listMedias && listMedias.results && listMedias.results ? (
              <Carousel
                title={t(title)}
                info={listMedias.results}
                mediaMovie={mediaMovie}
                mediaTv={mediaTv}
                media={media}
                hideSearch={hideSearch}
                isForum={isForum}
                basicForum={basicForum}
                isChange={changeSeenPending}
                isSetChange={setChangeSeenPending}
                isAllCards
              />
            ) : null}
          </div>
        ) : null}
        {/* // - PERSONS */}
        {mediaPerson ? (
          <div className="w-full">
            {listMedias &&
            listMedias.results &&
            listMedias.results.length > 0 ? (
              <CarouselPersons
                title={t("Persons")}
                info={listMedias.results}
                media={media}
                hideSearch={hideSearch}
                isForum={isForum}
                basicForum={basicForum}
                isChange={changeSeenPending}
                isSetChange={setChangeSeenPending}
              />
            ) : null}
          </div>
        ) : null}
        {/* // - USERS */}
        {users ? (
          <div className="w-full">
            {listMedias &&
            listMedias.results &&
            listMedias.results.length > 0 ? (
              <CarouselPersons
                title={t("Users")}
                info={listMedias.results}
                media={"user"}
                isForum={isForum}
              />
            ) : null}
          </div>
        ) : null}
        {/* // - PLAYLISTS */}
        {playlists ? (
          <div className="w-full">
            {listMedias && listMedias.results && listMedias.results.length > 0
              ? listMedias.results.map((playlist) => (
                  <PlaylistsList
                    key={`Search${playlist.id}`}
                    info={playlist}
                    isOtherUser={true}
                    userId={playlist.author}
                    isForum={isForum}
                  />
                ))
              : null}
          </div>
        ) : null}
        {/* {listMedias && listMedias.results && listMedias.results.length > 0 ? (
        <div className="col-span-full flex justify-end text-sm">
          <Link
            to={`/search/${searchValue}`}
            className="transition ease-in-out text-purpleNR fill-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 pr-2"
          >
            {listMedias.total_results} {t("All Results")}
          </Link>
        </div>
      ) : null} */}
        {listMedias && listMedias.results && listMedias.results.length === 0 ? (
          <div className="mt-1 w-full text-center text-gray-200 text-xl">
            {t("No Results")}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchResults;

SearchResults.defaultProps = {
  title: "",
  listMedias: {},
  media: "",
  hideSearch: () => {},
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  basicForum: {},
  isForum: false,
};

SearchResults.propTypes = {
  title: PropTypes.string,
  listMedias: PropTypes.object,
  media: PropTypes.string,
  hideSearch: PropTypes.func,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
};
