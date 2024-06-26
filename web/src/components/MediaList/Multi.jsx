import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { NoImage, star, movie, people, tv } from "../../assets/image";
import {
  getExternalId,
  getMediaDetails,
} from "../../../services/TMDB/services-tmdb";
import { getRating } from "../../../services/IMDB/services-imdb";
import calculateAverageVote from "./calculateAverageVote";
import { useAuthContext } from "../../context/auth-context";
import { FaStar, FaTrash } from "react-icons/fa";
import AddForum from "../../utils/Forum/AddForum";
import ShowPlaylistMenu from "../../utils/Playlists/ShowPlaylistMenu";
import SeenPending from "./SeenPendingMedia/SeenPending";
import SeenPendingButton from "../../utils/Buttons/SeenPendingButton";

export const Multi = ({
  info,
  mediaMovie,
  mediaTv,
  isUser,
  changeSeenPending,
  setChangeSeenPending,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  hideSearch,
  isForum,
  basicForum,
  mediasUser,
}) => {
  const [t, i18next] = useTranslation("translation");
  const { user, onReload } = useAuthContext();
  const navigate = useNavigate();
  const userExist = !!user;
  const { media_type } = info;
  const id = isUser ? info.mediaId : info.id;
  const mediaType = mediaMovie ? "movie" : mediaTv ? "tv" : media_type;
  const [pendingSeen, setPendingSeen] = useState(false);
  // - ALL INFO MEDIA
  const [dataMedia, setDataMedia] = useState({});
  useEffect(() => {
    if (i18next.language) {
      getMediaDetails(mediaType, id, i18next.language).then((d) => {
        setDataMedia(d);
      });
    }
  }, [id, mediaType, i18next.language]);
  const {
    poster_path,
    vote_average,
    release_date,
    first_air_date,
    known_for_department,
    profile_path,
    runtime,
    number_of_episodes,
    episode_run_time,
    title,
    name,
  } = dataMedia;
  // - IMDB DATA
  const [imdbID, setImdbID] = useState("");
  useEffect(() => {
    if (i18next.language && mediaType && id) {
      getExternalId(mediaType, id, i18next.language).then((data) => {
        setImdbID(data.imdb_id);
      });
    }
  }, [i18next.language, id, mediaType]);
  const [imdbData, setImdbData] = useState({});
  useEffect(() => {
    if (i18next.language && mediaType && imdbID !== "") {
      getRating(imdbID, i18next.language, true).then((data) => {
        setImdbData(data);
      });
    }
  }, [i18next.language, imdbID, mediaType]);
  // Poster
  const url =
    poster_path && poster_path !== undefined
      ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${poster_path}`
      : null || (profile_path && profile_path !== null)
      ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${profile_path}`
      : null;
  const processInfo = {
    bgPoster: url || NoImage,
    voteAverage: calculateAverageVote(
      vote_average > 0 ? Math.round(vote_average * 10) / 10 : 0,
      imdbData.imDb > 0 ? Number(imdbData.imDb) : null,
      imdbData.filmAffinity > 0 ? Number(imdbData.filmAffinity) : null
    ),
    title: title || name,
    date: release_date
      ? new Date(release_date).getFullYear()
      : first_air_date
      ? new Date(first_air_date).getFullYear()
      : known_for_department,
    type: mediaType,
    runTime:
      runtime || (episode_run_time && number_of_episodes * episode_run_time[0]),
  };

  if (mediaMovie) {
    processInfo.type = "movie";
  } else if (mediaTv) {
    processInfo.type = "tv";
  }
  // ! USER COMPARATIVE
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (userExist) {
      const isInMediaUser =
        mediasUser &&
        mediasUser.find(
          (f) => Number(f.mediaId) === Number(id) && mediaType === f.media_type
        );
      if (isInMediaUser) {
        setDataMediaUser(isInMediaUser);
      } else {
        setDataMediaUser({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeSeenPending, pendingSeen, id, userExist, mediasUser]);

  const { seen, pending, vote } = dataMediaUser;
  const runTime = processInfo.runTime;

  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      mediaType,
      runTime,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      "seen",
      onReload
    );
  };
  // - PENDING/NO PENDING
  const handlePending = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      mediaType,
      runTime,
      pending,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      "pending",
      onReload
    );
  };

  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorAddPlaylists) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorAddPlaylists(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorAddPlaylists]);

  const handleDeletePlaylist = (event) => {
    if (event) {
      event.stopPropagation();
      setPopSureDel(true);
      setIdDelete(id);
    } else {
      setErrorAddPlaylists(t("Is in the playlist"));
    }
  };

  return (
    // BACKGROUND
    <div
      className="static text-gray-200 rounded-2xl bg-cover w-full"
      style={{
        backgroundImage: `url(${processInfo.bgPoster})`,
      }}
    >
      <div
        className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full"
        onClick={hideSearch}
      >
        <div
          className="relative"
          onClick={() =>
            navigate(
              `/${mediaMovie ? "movie" : mediaTv ? "tv" : mediaType}/${id}`
            )
          }
        >
          {/* //.POSTER AND RATINGS */}
          <div className="relative cursor-pointer">
            {/* //-AVERAGE RATINGS */}
            {processInfo.voteAverage && processInfo.voteAverage > 0 && (
              <div className="absolute bottom-auto right-auto left-0 px-2 ml-2 inset-y-2 inset-x-8 backdrop-blur-md bg-black/50 rounded-lg">
                <img className="inline-block pr-1 py-2 w-4" src={star} />
                <div className="inline-block inset-y-2  inset-x-5 text-amber-400 text-xs text-left leading-4">
                  {processInfo.voteAverage}
                </div>
                {/* // * User Vote */}
                {userExist ? (
                  vote >= 0 ? (
                    <div className="flex items-start">
                      <FaStar
                        size={12}
                        color="#FFCA28"
                        alt={t("Seen")}
                        className="mr-1"
                      />
                      <div className="inset-b-2 inset-x-5 mb-1 text-amber-400 text-xs text-left leading-4">
                        {vote}
                      </div>
                    </div>
                  ) : null
                ) : null}
              </div>
            )}
            {/* //-POSTER*/}
            <div className="transition ease-in-out md:hover:scale-105 duration-300">
              {url ? (
                <img
                  className="static aspect-auto w-full cursor-pointer rounded-xl"
                  src={processInfo.bgPoster}
                  alt={processInfo.title}
                />
              ) : (
                <div className="relative flex justify-center items-center">
                  <img
                    className="absolute h-24 opacity-10"
                    src={
                      processInfo.type === "movie"
                        ? movie
                        : processInfo.type === "tv"
                        ? tv
                        : processInfo.type === "person"
                        ? people
                        : null
                    }
                    alt={t("Icon")}
                  />
                  <img
                    className="static aspect-auto w-full cursor-pointer rounded-xl"
                    src={processInfo.bgPoster}
                    alt={t("No photo")}
                  />
                </div>
              )}
            </div>
          </div>
          {/* //.ICONS AND TITLE */}
          <div className="mt-4 px-2 cursor-pointer">
            <div className="mb-1 grid grid-cols-2 gap-4 ">
              {/* //-ICON BY TYPE */}
              <div className="text-xs align-middle">
                {processInfo.type !== "No media_type" ? (
                  <img
                    className="w-4"
                    src={
                      processInfo.type === "movie"
                        ? movie
                        : processInfo.type === "tv"
                        ? tv
                        : processInfo.type === "person"
                        ? people
                        : null
                    }
                  />
                ) : media_type === "movie" ? (
                  <img className="w-4" src={movie} />
                ) : media_type === "tv" ? (
                  <img className="w-4" src={tv} />
                ) : media_type === "person" ? (
                  <img className="w-4" src={people} />
                ) : null}
              </div>
              <div className="text-right align-middle text-xs">
                {processInfo.date !== null ? processInfo.date : null}
                {/* // ! Delete Button */}
                {isPlaylist !== "" ? (
                  <div className="inline-block align-middle text-xs ml-1">
                    <FaTrash
                      size={17}
                      alt={t("Delete Playlist Icon")}
                      className="text-red-500 md:hover:text-gray-500 duration-200"
                      onClick={handleDeletePlaylist}
                    />
                  </div>
                ) : null}
              </div>
            </div>
            {/* //-TITLE */}
            <div
              className={`font-semibold ${
                isUser ? "text-sm line-clamp-3" : "text-sm"
              } ${userExist ? "pb-8" : "pb-2"} cursor-pointer`}
            >
              <p className="line-clamp-3 h-max-[4.5rem]">{processInfo.title}</p>
            </div>
          </div>
        </div>
        {/* //.BUTTON AND SEEN/UNSEEN */}
        {userExist ? (
          <div className="mb-1 grid grid-cols-5 gap-2 bottom-0 absolute w-full pr-4">
            {/* //-ADD BUTTON PLAYLIST */}
            {!isForum ? (
              <ShowPlaylistMenu
                userId={user.id}
                id={Number(id)}
                type={processInfo.type}
                runTime={processInfo.runTime}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
              />
            ) : null}
            {isForum ? (
              <AddForum
                id={Number(id)}
                runTime={processInfo.runTime}
                type={processInfo.type}
                basicForum={basicForum}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
              />
            ) : null}
            {/* //-SEEN/UNSEEN */}
            <div className="text-right align-middle">
              {mediaType !== "person" ? (
                <SeenPendingButton
                  condition={seen}
                  size={20}
                  text={"Seen"}
                  handle={handleSeenMedia}
                />
              ) : null}
            </div>
            {/* //-PENDING/NO PENDING */}
            <div className="text-right align-middle">
              {mediaType !== "person" ? (
                <SeenPendingButton
                  condition={pending}
                  size={17}
                  text={"Pending"}
                  handle={handlePending}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Multi;

Multi.defaultProps = {
  info: {},
  mediaMovie: false,
  mediaTv: false,
  isUser: false,
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  isPlaylist: "",
  setPopSureDel: () => {},
  setIdDelete: () => {},
  hideSearch: () => {},
  basicForum: {},
  isForum: false,
  dataUser: {},
  mediasUser: [],
  playlistUser: [],
};

Multi.propTypes = {
  info: PropTypes.object,
  mediaMovie: PropTypes.bool,
  mediaTv: PropTypes.bool,
  isUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  hideSearch: PropTypes.func,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
  dataUser: PropTypes.object,
  mediasUser: PropTypes.array,
  playlistUser: PropTypes.array,
};
