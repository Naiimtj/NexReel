import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Spinner from "../../../utils/Spinner/Spinner";
import { Link } from "react-router-dom";
import {
  MdOutlinePlaylistAdd,
  MdOutlinePlaylistRemove,
} from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";
import {
  deleteFollowPlaylist,
  getFollowPlaylistDetail,
  postFollowPlaylist,
} from "../../../../services/DB/services-db";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

const Forum = ({ data, userId, isOtherUser, setPopSureDel, setIdDelete }) => {
  const [t] = useTranslation("translation");
  const { description, id, followersPlaylist, imgPlaylist, medias, title } =
    data;
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
    <div className="mb-2">
      {!data && !Object.keys(data).length > 0 ? (
        <Spinner result />
      ) : (
        <div
          className="static text-gray-200 rounded-xl bg-cover w-full"
          style={{
            backgroundImage: `url(${imgPlaylist})`,
          }}
        >
          <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl h-full">
            <Link to={`/playlists/${userId}/${id}`}>
              <div className="relative">
                {/* //-PORTADA*/}
                <div className="transition ease-in-out md:hover:scale-105 duration-300">
                  <img
                    className="static object-cover cursor-pointer rounded-lg w-full h-[220px] lg:h-[160px] 2xl:h-[240px]"
                    src={imgPlaylist}
                    alt={title}
                  />
                </div>
              </div>
            </Link>
            {/* //.ICONS AND TITLE */}
            <div className="mt-2 px-2">
              {/* //-ICON BY TYPE & YEAR */}
              <Link to={`/playlists/${userId}/${id}`}>
                {/* //-TITLE*/}
                <div className="flex text-gray-200">
                  <h1 className="pl-4 text-xl">{title}</h1>
                  <p className="ml-1 text-xs">{`( ${
                    medias && medias.length
                  } )`}</p>
                </div>
                <div className="font-semibold">
                  <p className="font-normal text-xs">{description}</p>
                </div>
              </Link>
              <div className="">
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
                {/* //- FOLLOW/UNFOLLOW or NUM FOLLOWERS */}
                <div className="flex justify-end">
                  {data && followersPlaylist && isOtherUser
                    ? isFollowing
                    : null}
                  {data && followersPlaylist && !isOtherUser ? (
                    <div className="flex justify-end gap-1">
                      <HiUserGroup size={20} alt={t("Followers")} />
                      {followersPlaylist.length}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;

Forum.defaultProps = {
  data: {},
  isOtherUser: false,
  userId: "",
  setPopSureDel: () => {},
  setIdDelete: () => {},
};

Forum.propTypes = {
  data: PropTypes.object,
  isOtherUser: PropTypes.bool,
  userId: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
};
