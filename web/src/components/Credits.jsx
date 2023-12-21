import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { NoImage, people } from "../assets/image";
import { useAuthContext } from "../context/auth-context";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AddForum from "../utils/Forum/AddForum";
import ShowPlaylistMenu from "../utils/Playlists/showPlaylistMenu";

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
                <ShowPlaylistMenu
                userId={user.id}
                id={Number(id)}
                type={"person"}
                runTime={processInfo.runTime}
              />
                
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
