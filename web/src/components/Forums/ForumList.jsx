import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  deleteFollowForum,
  getDetailForum,
  postFollowForum,
} from "../../../services/DB/services-db";
import { useAuthContext } from "../../context/auth-context";
import { HiUserGroup } from "react-icons/hi";
import { FaTrash } from "react-icons/fa";
import ButtonIsFollowing from "../../utils/ButtonIsFollowing";

export const ForumList = ({
  info,
  setPopSureDel,
  setIdDelete,
  change,
  setChange,
}) => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const userExist = !!user;
  const { shortDescription, author, followers, imgForum, tags, title, id } =
    info;
  const isOtherUser = user.id !== author;
  const isForum = !isOtherUser ? id : "";
  const [ForumFollow, setForumFollow] = useState({});

  useEffect(() => {
    const ForumFollow = async () => {
      getDetailForum(id)
        .then((data) => {
          setForumFollow(data);
        })
        .catch((err) => err);
    };
    if (author) {
      ForumFollow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author, change]);
  // -FOLLOW
  const handleFollow = () => {
    postFollowForum(id).then(() => setChange(!change));
  };
  // -NO FOLLOW
  const handleUnFollow = () => {
    deleteFollowForum(id).then(() => setChange(!change));
  };
  const userFollowing =
    followers && followers.filter((f) => f.userId === user.id).length > 0;

  const forumCreate =
    ForumFollow &&
    ForumFollow.userCreate &&
    ForumFollow.userCreate[0] &&
    ForumFollow.userCreate[0].username;
  const handleDeleteForum = (event) => {
    event.stopPropagation();
    setPopSureDel(true);
    setIdDelete(id);
  };

  return (
    // BACKGROUND
    <div
      className="relative text-gray-200 rounded-2xl bg-cover w-full"
      style={{
        backgroundImage: `url(${imgForum})`,
      }}
    >
      <Link to={`/forums/${id}`}>
        <div className="grid grid-cols-5 justify-between gap-x-6 py-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
          {/* // - POSTER AND RATINGS */}
          <div className="col-span-1 flex min-w-0 gap-x-4">
            <div className="h-full">
              {/* // . POSTER*/}
              <div className="transition ease-in-out md:hover:scale-105 duration-300">
                <img
                  className=" static object-cover cursor-pointer rounded-xl w-[150px] h-[84px]"
                  src={imgForum}
                  alt={title}
                />
              </div>
            </div>
          </div>
          <div className="col-span-3 grid-cols-3 min-w-0 flex-auto">
            {/* // . TITLE */}
            <div className="flex font-semibold text-sm md:text-base cursor-pointer">
              <h1 className="text-xl line-clamp-3">{title}</h1>
            </div>
            {/* // - Short Description */}
            <div className="pl-4">
              <p className="font-light">{shortDescription}</p>
            </div>
            <div className="pl-4 text-xs text-gray-500">
              {tags && tags.join(", ")}
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-0 right-0 mt-2 flex gap-2 justify-end items-center pr-4">
        <p className="text-sm text-gray-400">{`${t("Created by")}:`}</p>
        <Link
          to={`${isOtherUser ? `/users/${author}` : "/me"}`}
          className="capitalize text-purpleNR hover:text-gray-200 transition duration-300"
        >
          {forumCreate}
        </Link>
      </div>
      {/* // - BUTTON AND FOLLOW/NO FOLLOW */}
      {userExist ? (
        <div className="absolute bottom-0 right-0 mb-1 flex justify-end items-center gap-6 pr-4">
          {/* // ! Delete Button */}
          {isForum !== "" ? (
            <div
              className="z-50 align-middle text-xs cursor-pointer"
              onClick={handleDeleteForum}
            >
              <FaTrash
                size={17}
                alt={t("Delete Playlist Icon")}
                className="text-red-500 md:hover:text-gray-500 duration-200 "
              />
            </div>
          ) : null}
          {/* // . FOLLOW/NO FOLLOW or NUM FOLLOWERS */}
          <div className="flex justify-end">
            {info && followers && isOtherUser ? (
              <div className="mb-1">
                <ButtonIsFollowing
                  isFollowing={!userFollowing}
                  handleFollow={handleFollow}
                  handleUnFollow={handleUnFollow}
                />
              </div>
            ) : null}
            {info && followers && !isOtherUser ? (
              <div className="flex justify-end gap-1">
                <HiUserGroup size={20} alt={t("Followers")} />
                {followers.length}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ForumList;

ForumList.defaultProps = {
  info: {},
  userId: "",
  isOtherUser: false,
  setPopSureDel: () => {},
  setIdDelete: () => {},
  change: false,
  setChange: () => {},
};

ForumList.propTypes = {
  info: PropTypes.object,
  userId: PropTypes.string,
  isOtherUser: PropTypes.bool,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  change: PropTypes.bool,
  setChange: PropTypes.func,
};
