import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  deleteFollowPlaylist,
  getFollowPlaylistDetail,
  postFollowPlaylist,
} from "../../../../services/DB/services-db";
import { useAuthContext } from "../../../context/auth-context";
import { MdOutlinePlaylistAdd, MdOutlinePlaylistRemove } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";
import { FaTrash } from "react-icons/fa";

export const PlaylistsList = ({
  info,
  userId,
  isOtherUser,
  setPopSureDel,
  setIdDelete,
}) => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const userExist = !!user;
  const {
    description,
    id,
    followersPlaylist,
    imgPlaylist,
    medias,
    tags,
    title,
  } = info;
  const isPlaylist = !isOtherUser ? id : "";

  const [changeDataUser, setChangeDataUser] = useState(false);
  const [playlistFollow, setPlayListFollow] = useState({});
  useEffect(() => {
    const PlaylistFollow = async () => {
      getFollowPlaylistDetail(id)
        .then((data) => {
          setPlayListFollow(data);
        })
        .catch((err) => err);
    };
    if (id) {
      PlaylistFollow();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, changeDataUser]);
  // -FOLLOW
  const handleFollow = () => {
    postFollowPlaylist(id).then(() => setChangeDataUser(!changeDataUser));
  };
  // -UNFOLLOW
  const handleUnFollow = () => {
    deleteFollowPlaylist(id).then(() => setChangeDataUser(!changeDataUser));
  };

  const isFollowing =
    playlistFollow === "" ? (
      <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
        <MdOutlinePlaylistAdd
          className="inline-block"
          size={25}
          color="#FFCA28"
          alt={t("Follow Playlist")}
          onClick={handleFollow}
        />
      </button>
    ) : (
      <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300 text-purpleNR">
        <MdOutlinePlaylistRemove
          className="inline-block"
          size={25}
          alt={t("UnFollow Playlist")}
          onClick={handleUnFollow}
        />
      </button>
    );

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
        backgroundImage: `url(${imgPlaylist})`,
      }}
    >
      <Link to={`/playlists/${userId}/${id}`}>
        <div className="grid grid-cols-5 justify-between gap-x-6 py-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
          {/* // - POSTER AND RATINGS */}
          <div className="col-span-2 flex min-w-0 gap-x-4">
            <div className="h-full">
              {/* // . POSTER*/}
              <div className="transition ease-in-out md:hover:scale-105 duration-300">
                <img
                  className=" static object-cover cursor-pointer rounded-xl w-[150px] h-[84px]"
                  src={imgPlaylist}
                  alt={title}
                />
              </div>
            </div>
            <div className="min-w-0 flex-auto mt-4 px-2">
              {/* // . TITLE */}
              <div className="flex font-semibold text-sm md:text-base cursor-pointer">
                <h1 className="pl-4 text-xl line-clamp-3">{title}</h1>
                <p className="ml-1 text-xs">{`( ${
                  medias && medias.length
                } )`}</p>
              </div>
              {/* // . TAGS */}
              <div className="pl-4 text-xs text-gray-500">
                {tags && tags.join(", ")}
              </div>
            </div>
          </div>
          {/* // - DESCRIPTION */}
          <div className="col-span-3">
            <p className="font-light">{description}</p>
          </div>
        </div>
      </Link>
      {/* // - BUTTON AND SEEN/UNSEEN / DELETE */}
      {userExist ? (
        <div className="absolute bottom-0 mb-1 flex items-center justify-end gap-6 w-full pr-4">
          {/* // ! Delete Button */}
          {isPlaylist !== "" ? (
            <div
              className="z-50 align-middle text-xs cursor-pointer"
              onClick={handleDeletePlaylist}
            >
              <FaTrash
                size={17}
                alt={t("Delete Playlist Icon")}
                className="text-red-500 md:hover:text-gray-500 duration-200 "
              />
            </div>
          ) : null}
          {/* // . FOLLOW/UNFOLLOW or NUM FOLLOWERS */}
          <div className="flex justify-end">
            {info && followersPlaylist && isOtherUser ? isFollowing : null}
            {info && followersPlaylist && !isOtherUser ? (
              <div className="flex justify-end gap-1">
                <HiUserGroup size={20} alt={t("Followers")} />
                {followersPlaylist.length}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PlaylistsList;

PlaylistsList.defaultProps = {
  info: {},
  userId: "",
  isOtherUser: false,
  setPopSureDel: () => {},
  setIdDelete: () => {},
};

PlaylistsList.propTypes = {
  info: PropTypes.object,
  userId: PropTypes.string,
  isOtherUser: PropTypes.bool,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
};
