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
import {
  deleteMedia,
  getDetailMedia,
  patchMedia,
  postMedia,
  postPlaylistMedia,
} from "../../../services/DB/services-db";
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";
import { useAuthContext } from "../../context/auth-context";
import { FaStar, FaTrash } from "react-icons/fa";
import { IoIosRemove, IoMdAdd } from "react-icons/io";

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
}) => {
  const [t, i18next] = useTranslation("translation");
  const navigate = useNavigate();
  const { user } = useAuthContext();
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
  // ! USER COMPARATION
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (userExist) {
      getDetailMedia(id).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [changeSeenPending, pendingSeen, id, userExist]);
  const { like, seen, pending, vote } = dataMediaUser;
  useEffect(() => {
    if (userExist && !like && !seen && !pending && vote === -1) {
      deleteMedia(id).then(() => {
        setChangeSeenPending(!changeSeenPending);
        setPendingSeen(!pendingSeen);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMediaUser]);
  //- VISTO/NO VISTO
  const handleSeenMedia = () => {
    if (Object.keys(dataMediaUser).length) {
      patchMedia(id, { seen: !seen }).then(
        () => setChangeSeenPending(!changeSeenPending),
        setPendingSeen(!pendingSeen)
      );
    } else {
      postMedia({
        mediaId: id,
        media_type: mediaType,
        runtime: processInfo.runTime,
        like: false,
        seen: true,
      }).then((data) => {
        if (data) {
          setChangeSeenPending(!changeSeenPending),
            setPendingSeen(!pendingSeen);
        }
      });
    }
  };
  // - PENDING/NO PENDING
  const handlePending = () => {
    if (Object.keys(dataMediaUser).length) {
      patchMedia(id, { pending: !pending }).then(
        () => setChangeSeenPending(!changeSeenPending),
        setPendingSeen(!pendingSeen)
      );
    } else {
      postMedia({
        mediaId: id,
        media_type: mediaType,
        runtime: processInfo.runtime,
        pending: true,
      }).then((data) => {
        if (data) {
          setChangeSeenPending(!changeSeenPending),
            setPendingSeen(!pendingSeen);
        }
      });
    }
  };
  // ADD MEDIA TO PLAYLIST
  const [playlistsList, setPlaylistsList] = useState(false);
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const [isTimeout, setIsTimeout] = useState(true);
  const handleAddPlaylist = async (playlistId) => {
    try {
      await postPlaylistMedia(playlistId, {
        mediaId: id,
        media_type: processInfo.type,
        runtime: processInfo.runTime,
      });
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddPlaylists(message);
        setIsTimeout(true);
      }
    }
  };
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
        {playlistsList ? (
          <div className="grid grid-cols-6">
            <div className="col-start-5 flex flex-col text-base bg-grayNR/60 rounded-md mb-5">
              {errorAddPlaylists ? (
                <div className="text-white bg-gray-50/20 px-1 font-bold">
                  {t(errorAddPlaylists)}
                </div>
              ) : null}
              {user &&
                user.playlists.map((i, index) => {
                  const roundedTopItem = index === 0 ? "rounded-t-md" : null;
                  const roundedBottomItem =
                    user.playlists.length === index + 1 ? "rounded-b-md" : null;

                  return (
                    <div
                      key={i.id}
                      className={`hover:bg-gray-50 px-1 ${
                        user.playlists.length === 1 ? "rounded-md" : null
                      } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                      onClick={() => handleAddPlaylist(i.id)}
                    >
                      <div className="text-black text-left">· {i.title}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}
      </div>

      {/* //.BUTTON AND SEEN/UNSEEN */}

      {userExist ? (
        <div className="absolute bottom-0 mb-1 flex justify-end gap-6 w-full pr-4">
          {/* //-ADD BUTTON */}
          <div className="relative text-base align-middle col-span-3 ">
            <button
              className={`cursor-pointer text-left font-semibold px:center ${
                !playlistsList ? "text-[#7B6EF6]" : "text-gray-600"
              } transition ease-in-out md:hover:scale-105 duration-300`}
              onClick={() => setPlaylistsList(!playlistsList)}
            >
              {!playlistsList ? (
                <IoMdAdd
                  className="inline-block"
                  size={20}
                  alt={t("Add to one list")}
                />
              ) : (
                <IoIosRemove
                  className="inline-block"
                  size={20}
                  alt={t("Add to one list")}
                />
              )}
              {t("List")}
            </button>
          </div>
          {/* //-SEEN/UNSEEN */}
          <div className="text-right align-middle">
            {mediaType !== "person" ? (
              seen !== true ? (
                <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                  <IoCheckmarkCircleOutline
                    className="inline-block"
                    size={20}
                    color="#FFCA28"
                    alt={t("Seen")}
                    onClick={handleSeenMedia}
                  />
                </button>
              ) : (
                <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                  <IoCheckmarkCircleSharp
                    className="inline-block"
                    size={20}
                    color="#FFCA28"
                    alt={t("Unseen")}
                    onClick={handleSeenMedia}
                  />
                </button>
              )
            ) : null}
          </div>
          {/* //-PENDING/NO PENDING */}
          <div className="text-right align-middle">
            {mediaType !== "person" ? (
              pending !== true ? (
                <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                  <BsAlarm
                    className="inline-block"
                    size={17}
                    color="#FFCA28"
                    alt={t("Pending")}
                    onClick={handlePending}
                  />
                </button>
              ) : (
                <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                  <BsAlarmFill
                    className="inline-block"
                    size={17}
                    color="#FFCA28"
                    alt={t("No Pending")}
                    onClick={handlePending}
                  />
                </button>
              )
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
};
