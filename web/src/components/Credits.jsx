import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { NoImage, people } from "../assets/image";
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { useAuthContext } from "../context/auth-context";
import { useEffect, useState } from "react";
import { postPlaylistMedia } from "../../services/DB/services-db";
import { FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AddForum from "../utils/Forum/AddForum";

export const Credits = ({
  repInfo,
  media,
  idInfo,
  isForum,
  changeSeenPending,
  setChangeSeenPending,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  basicForum,
}) => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const userExist = !!user;
  const {
    profile_path,
    name,
    known_for_department,
    character,
    id,
    roles,
    username,
    avatarURL,
  } = repInfo;
  const urlPoster =
    profile_path !== undefined
      ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${profile_path}`
      : null;

  const processInfo = {};
  switch (media) {
    case "movie":
      processInfo.repPoster = profile_path ? urlPoster : NoImage;
      processInfo.repName = name;
      processInfo.repCharacter = character;
      processInfo.repKnownForDepartment = known_for_department;
      processInfo.urlNavigation = `/${media}/${idInfo}/person/${id}`;
      processInfo.runTime = 0;
      break;
    case "tv":
      processInfo.repPoster = profile_path ? urlPoster : NoImage;
      processInfo.repName = name;
      processInfo.repCharacter =
        roles && roles.length > 0 ? roles[0].character : null;
      processInfo.repKnownForDepartment = known_for_department;
      processInfo.urlNavigation = `/${media}/${idInfo}/person/${id}`;
      processInfo.runTime = 0;
      break;
    case "person":
      processInfo.repPoster = profile_path ? urlPoster : NoImage;
      processInfo.repName = name;
      processInfo.repCharacter = known_for_department;
      processInfo.urlNavigation = `/person/${id}`;
      processInfo.runTime = 0;
      break;
    case "user":
      processInfo.repPoster = avatarURL !== null ? avatarURL : NoImage;
      processInfo.repName = username;
      processInfo.repCharacter = "User";
      processInfo.urlNavigation = `/users/${id}`;
      processInfo.runTime = 0;
      break;
    default:
      break;
  }

  const [playlistsList, setPlaylistsList] = useState(false);
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const handleAddPlaylist = async (playlistId) => {
    try {
      await postPlaylistMedia(playlistId, {
        mediaId: `${id}`,
        media_type: "person",
        runtime: processInfo.runTime,
      }).then(() => setPlaylistsList(false));
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddPlaylists(message);
      }
    }
  };

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
    event.stopPropagation();
    setPopSureDel(true);
    setIdDelete(id);
  };
  
  return (
    <div className="slide flex flex-col justify-start content-center items-center">
      <div>
        {profile_path || avatarURL ? (
          <img
            className={`cursor-pointer rounded-full object-cover ${
              media === "person" || media === "user" ? "h-28 w-28" : "h-40 w-40"
            } transition ease-in-out md:hover:scale-105 duration-300`}
            src={processInfo.repPoster}
            alt={processInfo.repName}
            onClick={() => navigate(processInfo.urlNavigation)}
          />
        ) : (
          <div
            className={`relative flex justify-center items-center cursor-pointer rounded-full object-cover ${
              media === "person" || media === "user" ? "h-28 w-28" : "h-40 w-40"
            } transition ease-in-out md:hover:scale-105 duration-300`}
            onClick={() => navigate(processInfo.urlNavigation)}
          >
            <img
              className={`absolute opacity-10 object-cover ${
                media === "person" || media === "user"
                  ? "h-14 w-14"
                  : "h-20 w-20"
              }`}
              src={people}
              alt={t("Icon people")}
            />
            <img
              className={`rounded-full object-cover ${
                media === "person" || media === "user"
                  ? "h-28 w-28"
                  : "h-40 w-40"
              } `}
              src={processInfo.repPoster}
              alt={t("No photo")}
            />
          </div>
        )}
        {/* <img
          className={`cursor-pointer rounded-full object-cover ${
            media === "person" || media === "user" ? "h-28 w-28" : "h-40 w-40"
          } transition ease-in-out md:hover:scale-105 duration-300`}
          src={processInfo.repPoster}
          alt={processInfo.repName}
          onClick={() => navigate(processInfo.urlNavigation)}
        /> */}
      </div>
      <div
        className=" cursor-pointer text-center mt-4 w-full"
        onClick={() => navigate(processInfo.urlNavigation)}
      >
        <h2
          className={`font-semibold ${
            media === "person" || media === "user" ? "text-sm" : "text-base"
          } break-words`}
        >
          {processInfo.repName}
        </h2>

        <div className="align-middle text-sm text-gray-400 break-words">
          {processInfo.repCharacter}
          {/* // ! Delete Button */}
          {isPlaylist && isPlaylist !== "" ? (
            <div className="inline-block align-middle text-xs ml-1">
              <FaTrash
                size={17}
                alt={t("Delete Playlist Icon")}
                className="text-red-500 md:hover:text-gray-500 duration-200"
                onClick={handleDeletePlaylist}
              />
            </div>
          ) : null}
          {/* //.BUTTON AND SEEN/UNSEEN */}
          {userExist ? (
            <div className="mb-1 w-full pr-4">
              {/* //-ADD BUTTON PLAYLIST */}
              {!isForum ? (
                <div className="relative text-base align-middle col-span-3 ">
                  <button
                    className={`cursor-pointer text-left font-semibold px:center ${
                      !playlistsList ? "text-[#7B6EF6]" : "text-gray-600"
                    } transition ease-in-out md:hover:scale-105 duration-300`}
                    onClick={(event) => {
                      event.stopPropagation(), setPlaylistsList(!playlistsList);
                    }}
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
                    {t("Playlists")}
                  </button>
                  {playlistsList ? (
                    <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
                      {errorAddPlaylists ? (
                        <div className="text-red-700 bg-gray-50/20 px-1 font-bold text-center">
                          {t(errorAddPlaylists)}
                        </div>
                      ) : null}
                      {user &&
                        user &&
                        user.playlists.map((i, index) => {
                          const roundedTopItem =
                            index === 0 ? "rounded-t-md" : null;
                          const roundedBottomItem =
                            user.playlists &&
                            user.playlists.length === index + 1
                              ? "rounded-b-md"
                              : null;
                          const isInPlaylist =
                            user.playlists &&
                            i.medias &&
                            i.medias.some(
                              (media) => Number(media.mediaId) === id
                            );
                          console.log(isInPlaylist);
                          return (
                            <div
                              key={i.id}
                              className={`hover:bg-gray-50 px-1 ${
                                user.playlists && user.playlists.length === 1
                                  ? "rounded-md"
                                  : null
                              } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                              onClick={(event) => {
                                event.stopPropagation(),
                                  handleAddPlaylist(i.id);
                              }}
                            >
                              <div
                                className={`${
                                  isInPlaylist
                                    ? "line-through text-gray-900"
                                    : "text-black"
                                } text-left`}
                              >
                                · {i.title}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {isForum ? (
                <AddForum
                  id={Number(id)}
                  runTime={processInfo.runTime}
                  type={media}
                  basicForum={basicForum}
                  changeSeenPending={changeSeenPending}
                  setChangeSeenPending={setChangeSeenPending}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Credits;

Credits.defaultProps = {
  idInfo: 0,
  repInfo: {},
  media: "",
  basicForum: {},
  isForum: false,
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  isPlaylist: false,
  setPopSureDel: () => {},
  setIdDelete: () => {},
};

Credits.propTypes = {
  idInfo: PropTypes.number,
  repInfo: PropTypes.object,
  media: PropTypes.string,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.bool,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
};
