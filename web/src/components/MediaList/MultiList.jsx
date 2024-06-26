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
import SeenPending from "./SeenPendingMedia/SeenPending";
import ShowPlaylistMenu from "../../utils/Playlists/ShowPlaylistMenu";
import SeenPendingButton from "../../utils/Buttons/SeenPendingButton";

export const MultiList = ({
  info,
  mediaMovie,
  mediaTv,
  isUser,
  changeSeenPending,
  setChangeSeenPending,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  mediasUser,
}) => {
  const [t, i18next] = useTranslation("translation");
  const navigate = useNavigate();
  const { user, onReload } = useAuthContext();
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
  }, [i18next.language, id, changeSeenPending, pendingSeen, mediaType]);
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
  // ! USER COMPACTION
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
  }, [changeSeenPending, pendingSeen, id, userExist, mediasUser, mediaType]);
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
  // ADD MEDIA TO PLAYLIST
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
  // ! DELETE MEDIA
  const handleDeletePlaylist = (event) => {
    event.stopPropagation();
    setPopSureDel(true);
    setIdDelete(id);
  };

  return (
    // BACKGROUND
    <div
      className="relative text-gray-200 rounded-2xl bg-cover w-full"
      style={{
        backgroundImage: `url(${processInfo.bgPoster})`,
      }}
    >
      <div className="grid grid-row-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
        <div
          className="relative"
          onClick={() =>
            navigate(
              `/${mediaMovie ? "movie" : mediaTv ? "tv" : mediaType}/${id}`
            )
          }
        >
          <div className="grid grid-cols-6 justify-between gap-x-6 py-2">
            {/* //-AVERAGE RATINGS */}
            {processInfo.voteAverage && processInfo.voteAverage > 0 && (
              <div className="absolute bottom-auto right-0 left-auto px-2 mr-2 inset-y-2 inset-x-8 backdrop-blur-md bg-black/50 rounded-lg">
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
            <div className="col-span-6 flex min-w-0 gap-x-4 mb-2 md:mb-0">
              {/* //.POSTER AND RATINGS */}
              <div className="h-full w-14">
                {/* //-POSTER*/}
                <div className="transition ease-in-out md:hover:scale-105 duration-300">
                  {url ? (
                    <img
                      className=" static aspect-auto w-full cursor-pointer rounded-xl "
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
                        alt={t("Icon people")}
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
              <div className="min-w-0 flex-auto mt-4 px-2">
                <div className="mb-1 flex flex-row gap-4">
                  {/* //-ICON BY TYPE */}
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
                  <div className="text-right align-middle text-xs">
                    {processInfo.date !== null ? processInfo.date : null}
                  </div>
                </div>
                {/* //-TITLE */}
                <div className="font-semibold text-sm md:text-base cursor-pointer">
                  <p className="line-clamp-3">{processInfo.title}</p>
                  {/* // ! Delete Button */}
                  {isPlaylist !== "" ? (
                    <div
                      className="absolute z-50 align-middle text-xs cursor-pointer"
                      onClick={handleDeletePlaylist}
                    >
                      <FaTrash
                        size={17}
                        alt={t("Delete Playlist Icon")}
                        className="text-red-500 md:hover:text-gray-500 duration-200 "
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* //.BUTTON AND SEEN/UNSEEN */}
      {userExist ? (
        <div className="absolute bottom-0 mb-1 flex justify-end gap-6 w-full pr-4 z-40">
          {/* //-ADD BUTTON */}
          <ShowPlaylistMenu
            userId={user.id}
            id={Number(id)}
            type={processInfo.type}
            runTime={processInfo.runTime}
          />
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
  );
};

export default MultiList;

MultiList.defaultProps = {
  info: {},
  mediaMovie: false,
  mediaTv: false,
  isUser: false,
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  isPlaylist: "",
  setPopSureDel: () => {},
  setIdDelete: () => {},
  mediasUser: [],
};

MultiList.propTypes = {
  info: PropTypes.object,
  mediaMovie: PropTypes.bool,
  mediaTv: PropTypes.bool,
  isUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  mediasUser: PropTypes.array,
};
