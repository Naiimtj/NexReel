import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/auth-context";
import { useTranslation } from "react-i18next";
// services
import {
  deleteFollowPlaylist,
  deletePlaylist,
  deletePlaylistMedia,
  getDetailPlaylist,
  getDetailUser,
  getUser,
  patchFollowPlaylist,
  postFollowPlaylist,
} from "../../../services/DB/services-db";
// icons
import { BsGrid3X2GapFill, BsListUl } from "react-icons/bs";
import {
  MdModeEditOutline,
  MdOutlinePlaylistAdd,
  MdOutlinePlaylistRemove,
  MdViewCarousel,
} from "react-icons/md";
import { HiSortAscending, HiSortDescending, HiUserGroup } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
// components
import Multi from "../../components/MediaList/Multi";
import MultiList from "../../components/MediaList/MultiList";
import Carousel from "../../utils/Carousel/Carousel";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import Spinner from "../../utils/Spinner/Spinner";
import EditPlaylist from "../../components/Users/Playlist/EditPlaylist";
import PopSureDelete from "../../components/PopUp/PopSureDelete";
import PageTitle from "../../components/PageTitle";

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : check &&
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return DataPendingOrder;
}

const PlaylistSingle = () => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const { userId, id } = useParams();
  const isOtherUser = user.id !== userId;
  const [dataPlaylist, setDataPlaylist] = useState({});
  const [dataUser, setDataUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesing, setVisualDesign] = useState(0);
  useEffect(() => {
    const playlistData = async () => {
      getDetailPlaylist(id).then((data) => {
        setDataPlaylist(data);
      });
    };
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    };
    const userData = async () => {
      getDetailUser(userId).then((d) => {
        setDataUser(d.user);
      });
    };
    if (!isOtherUser) {
      Data();
    }
    if (isOtherUser) {
      userData();
    }
    playlistData();
  }, [changeSeenPending, id, isOtherUser, userId]);

  const { title, description, tags, medias, imgPlaylist, followersPlaylist } =
    dataPlaylist;
  const TotalFollowsPlaylist = followersPlaylist && followersPlaylist.length;
  const TotalLikesFollowPlaylist =
    TotalFollowsPlaylist > 0
      ? followersPlaylist &&
        followersPlaylist.filter((f) => f.like === true).length
      : 0;

  const isUserFollowPlaylist = isOtherUser
    ? followersPlaylist && followersPlaylist.filter((f) => f.userId === user.id)
    : null;
  const isUserLiked =
    isUserFollowPlaylist && isUserFollowPlaylist.length > 0
      ? isUserFollowPlaylist.filter((f) => f.like === true).length > 0
      : null;
  const checkMedias = !!(dataPlaylist && medias && medias.length > 0);
  const [isAsc, setIsAsc] = useState(false);
  const dataMedias = checkMedias ? DataOrder(checkMedias, medias, isAsc) : null;

  let isCarousel;
  let isSquare;
  let isList;
  switch (visualDesing) {
    case 0:
      isCarousel = true;
      isSquare = null;
      isList = null;
      break;
    case 1:
      isCarousel = null;
      isSquare = true;
      isList = null;
      break;
    case 2:
      isCarousel = null;
      isSquare = null;
      isList = true;
      break;
    default:
      isCarousel = true;
      isSquare = null;
      isList = null;
      break;
  }

  // -FOLLOW
  const handleFollow = () => {
    postFollowPlaylist(id).then(() => setChangeSeenPending(!changeSeenPending));
  };
  // -UNFOLLOW
  const handleUnFollow = () => {
    deleteFollowPlaylist(id).then(() =>
      setChangeSeenPending(!changeSeenPending)
    );
  };
  const isFollowing =
    isUserFollowPlaylist && !isUserFollowPlaylist.length > 0 ? (
      <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300 text-purpleNR hover:text-gray-600">
        <MdOutlinePlaylistAdd
          className="inline-block"
          size={30}
          color="#FFCA28"
          alt={t("Follow Playlist")}
          onClick={handleFollow}
        />
      </button>
    ) : (
      <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300 text-purpleNR hover:text-gray-600">
        <MdOutlinePlaylistRemove
          className="inline-block"
          size={25}
          alt={t("UnFollow Playlist")}
          onClick={handleUnFollow}
        />
      </button>
    );

  // -LIKE
  const handleLike = () => {
    patchFollowPlaylist(id, { like: true }).then(() =>
      setChangeSeenPending(!changeSeenPending)
    );
  };
  // -UNLIKE
  const handleUnLike = () => {
    patchFollowPlaylist(id, { like: false }).then(() =>
      setChangeSeenPending(!changeSeenPending)
    );
  };
  const TimeTotalSeenMin =
    dataMedias &&
    dataMedias
      .map(function (objeto) {
        return objeto.runtime;
      })
      .reduce(function (acumulador, valorActual) {
        return acumulador + valorActual;
      }, 0);
  const TimeTotalSeen = new DateAndTimeConvert(
    TimeTotalSeenMin,
    t
  ).TimeConvert();

  const [editPlaylist, setEditPlaylist] = useState(false);
  // -DELETE PLAYLIST

  const [answerDelMedia, setAnswerDelMedia] = useState(false);
  const [popSureDelMedia, setPopSureDelMedia] = useState(false);
  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState(false);

  const handleDeletePlaylist = () => {
    setPopSureDel(true);
    setIdDelete(id);
  };

  useEffect(() => {
    const deletPlaylist = async () => {
      try {
        await deletePlaylist(idDelete).then(() => {
          window.location.href = `/playlists/${dataUser.id}`;
        });
        setChangeSeenPending(!changeSeenPending);
        setAnswerDel(!answerDel);
        setIdDelete(null);
      } catch (error) {
        if (error) {
          const { message } = error.response?.data || {};
          setErrorDelete(message);
        }
      }
    };
    if (answerDel) {
      deletPlaylist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDel]);

  useEffect(() => {
    const deleteMedia = async () => {
      try {
        await deletePlaylistMedia(!isOtherUser ? id : "", {
          mediaIdDelete: idDelete,
        });
        setChangeSeenPending(!changeSeenPending);
        setAnswerDelMedia(!answerDelMedia);
      } catch (error) {
        if (error) {
          const { message } = error.response?.data || {};
          setErrorDelete(message);
        }
      }
    };

    if (answerDelMedia) {
      deleteMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDelMedia]);

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorDelete) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorDelete(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorDelete]);

  return (
    <>
      <PageTitle title={`${Object.keys(user).length && `Playlist-${title}`}`} />
      {!followersPlaylist ? (
        <Spinner result />
      ) : (
        <div className="w-full h-full text-gray-200">
          <div className="relative text-gray-200 mb-20 mt-6">
            {/* // . BACK USER & PLAYLIST */}
            <div className="text-gray-200 mb-4">
              <Link
                to={!isOtherUser ? "/me" : `/users/${dataUser.id}`}
                className="ml-5 pt-5 text-[#b1a9fa] md:hover:text-gray-500 capitalize"
              >
                <IoIosArrowBack
                  className="inline-block mr-1"
                  size={25}
                  alt={t("Left arrow icon")}
                />
                {dataUser.username}
              </Link>
              <Link
                to={`/playlists/${dataUser.id}`}
                className="ml-5 pt-5 text-[#b1a9fa] md:hover:text-gray-500 capitalize"
              >
                <IoIosArrowBack
                  className="inline-block mr-1"
                  size={25}
                  alt={t("Left arrow icon")}
                />
                {t("Playlists")}
              </Link>
            </div>
            {!editPlaylist ? (
              <div
                className="text-gray-200 rounded-xl bg-cover w-full"
                style={{
                  backgroundImage: `url(${imgPlaylist})`,
                }}
              >
                <div className="bg-local backdrop-blur-md bg-[#20283E]/80 rounded-xl h-full py-10 px-3">
                  <div className="relative">
                    {/* // - POP DELETE */}
                    {popSureDel ? (
                      <div className="absolute object-cover backdrop-blur-md bg-transparent/30 rounded-3xl h-full w-full z-50 grid justify-center align-middle">
                        <PopSureDelete
                          setPopSureDel={setPopSureDel}
                          setAnswerDel={setAnswerDel}
                        />
                      </div>
                    ) : null}
                    {/* // - TOP */}
                    <h1 className="text-sm md:text-3xl uppercase text-gray-200 text-center underline underline-offset-4 mb-1">
                      {t(title)}
                    </h1>
                    {/* // . TAGS */}
                    <div className="text-xs text-gray-500 text-center mb-4">
                      {tags && tags.join(", ")}
                    </div>
                    <div className="grid grid-cols-6 border-b border-gray-700 mb-2 pb-2">
                      {/* //-PORTADA*/}
                      <div className="col-start-1 col-span-2 flex justify-center">
                        <img
                          className="static object-cover rounded-lg w-[600px] h-full"
                          src={imgPlaylist}
                          alt={title}
                        />
                      </div>
                      {/* // - INFO PLAYLIST */}
                      <div className="col-span-4 ml-10 grid grid-cols-4">
                        <div className="col-span-2">
                          <div className="flex gap-2">
                            <p className="text-gray-400">{`${t(
                              "Create by"
                            )}:`}</p>
                            <Link
                              to={
                                isOtherUser
                                  ? `/users/${dataPlaylist.user[0].id}`
                                  : "/me"
                              }
                              className="capitalize text-purpleNR hover:text-gray-600 transition duration-300"
                            >
                              {dataPlaylist &&
                                dataPlaylist.user &&
                                dataPlaylist.user[0].username}
                            </Link>
                          </div>
                        </div>
                        <div className="col-span-4 flex gap-2">
                          <div className="text-gray-400">{`${t(
                            "Description"
                          )}:`}</div>
                          <p className="font-normal">{description}</p>
                        </div>
                        <div className="col-span-2">
                          <div className="flex gap-2 mb-4">
                            <p className="text-gray-400">{`${t(
                              "Quantity"
                            )}:`}</p>
                            <div className="inline-block capitalize">
                              {dataMedias && dataMedias.length}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <p className="text-gray-400">{`${t(
                              "Total Time"
                            )}:`}</p>
                            <div className="inline-block">{TimeTotalSeen}</div>
                          </div>
                        </div>
                      </div>
                      {/* // - LIKES/FOLLOWS & BUTTONS */}
                      <div className="col-start-1 col-span-2 mt-1 flex justify-between items-center">
                        {/* // . DATA PLAYLIST */}
                        <div className="ml-4 flex items-center gap-4">
                          {!isOtherUser ? (
                            <div className="text-center flex items-center gap-2">
                              <BiSolidHeart
                                size={20}
                                alt={t("Solid Heart Icon")}
                                className=""
                              />
                              <p>{TotalLikesFollowPlaylist}</p>
                            </div>
                          ) : null}
                          <div className="text-center flex items-center gap-2">
                            <HiUserGroup size={20} alt={t("Followers")} />
                            <p>{TotalFollowsPlaylist}</p>
                          </div>
                        </div>
                        {/* // . LIKES & FOLLOWS */}
                        <div className="flex items-center gap-4">
                          {/* // LIKE & UNLIKE / DELETE PLAYLIST */}
                          {(isUserFollowPlaylist &&
                            isUserFollowPlaylist.length > 0) ||
                          !isOtherUser ? (
                            <>
                              {isOtherUser ? (
                                !isUserLiked ? (
                                  <div className="text-center flex items-center gap-2">
                                    <p>{TotalLikesFollowPlaylist}</p>
                                    <BiHeart
                                      size={20}
                                      alt={t("No Heart Icon")}
                                      className="text-purpleNR cursor-pointer hover:text-gray-600 transition ease-in-out md:hover:scale-110 duration-300"
                                      onClick={handleLike}
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center flex items-center gap-2">
                                    <p>{TotalLikesFollowPlaylist}</p>
                                    <BiSolidHeart
                                      size={20}
                                      alt={t("Solid Heart Icon")}
                                      className="cursor-pointer text-red-200 hover:text-purpleNR transition ease-in-out md:hover:scale-110 duration-300"
                                      onClick={handleUnLike}
                                    />
                                  </div>
                                )
                              ) : (
                                <FaTrash
                                  size={17}
                                  alt={t("Delete Playlist Icon")}
                                  className="text-red-500 md:hover:text-gray-500 duration-200 cursor-pointer"
                                  onClick={handleDeletePlaylist}
                                />
                              )}
                            </>
                          ) : null}
                          {/* // FOLLOW & UNFOLLOW or NUM FOLLOWERS / EDIT PLAYLIST */}
                          <div className="mr-4">
                            {isOtherUser ? (
                              dataPlaylist && followersPlaylist ? (
                                isFollowing
                              ) : null
                            ) : (
                              <MdModeEditOutline
                                size={20}
                                alt={t("Edit Playlist Icon")}
                                className="text-[#b1a9fa] md:hover:text-gray-500 duration-200 cursor-pointer"
                                onClick={() => setEditPlaylist(true)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* // - DOWN */}
                  <div className="relative">
                    {/* // - POP DELETE */}
                    {popSureDelMedia ? (
                      <div className="absolute object-cover backdrop-blur-md bg-transparent/30 rounded-3xl h-full w-full z-50 grid justify-center align-middle">
                        <PopSureDelete
                          setPopSureDel={setPopSureDelMedia}
                          setAnswerDel={setAnswerDelMedia}
                        />
                      </div>
                    ) : null}
                    {/* // . ORDER & VISUALITATION */}
                    <div className="grid grid-cols-3">
                      {/* // Asc/Desc */}
                      <div className="flex items-center justify-start">
                        {isAsc ? (
                          <div
                            className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                            onClick={() =>
                              checkMedias && dataMedias.length
                                ? setIsAsc(!isAsc)
                                : null
                            }
                          >
                            {t("Date Added")}
                            <HiSortAscending
                              className="ml-1 text-2xl inline-block"
                              alt={t("Ascendant")}
                            />
                          </div>
                        ) : (
                          <div
                            className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                            onClick={() =>
                              checkMedias && dataMedias.length
                                ? setIsAsc(!isAsc)
                                : null
                            }
                          >
                            {t("Date Added")}
                            <HiSortDescending
                              className="ml-1 text-2xl inline-block"
                              alt={t("Descending")}
                            />
                          </div>
                        )}
                      </div>
                      {/* // . BUTTONS */}
                      <div className="col-span-2 flex items-center justify-end">
                        {/* // CAROUSEL */}
                        <div
                          className={`mr-2 ${
                            isCarousel
                              ? "text-gray-500"
                              : "cursor-pointer text-[#b1a9fa] md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
                          }`}
                        >
                          <MdViewCarousel
                            className="h-14 w-14 md:h-8 md:w-8"
                            onClick={() => setVisualDesign(0)}
                          />
                        </div>
                        {/* // SQUARE */}
                        <div
                          className={`mr-2 ${
                            isSquare
                              ? "text-gray-500"
                              : "cursor-pointer text-[#b1a9fa] md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
                          }`}
                        >
                          <BsGrid3X2GapFill
                            className="h-14 w-14 md:h-8 md:w-8"
                            onClick={() => setVisualDesign(1)}
                          />
                        </div>
                        {/* // LIST */}
                        <div
                          className={`mr-2 ${
                            isList
                              ? "text-gray-500"
                              : "cursor-pointer text-[#b1a9fa] md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
                          }`}
                        >
                          <BsListUl
                            className="h-14 w-14 md:h-8 md:w-8"
                            onClick={() => setVisualDesign(2)}
                          />
                        </div>
                      </div>
                    </div>
                    {errorDelete ? (
                      <div className="text-red-600 bg-white/50 rounded-2xl text-center uppercase px-1 font-bold">
                        {t(errorDelete)}
                      </div>
                    ) : null}
                    {/* // - CAROUSEL */}
                    {checkMedias && dataMedias.length > 0 && isCarousel ? (
                      <Carousel
                        info={dataMedias}
                        isUser
                        isAsc={isAsc}
                        isPlaylist={!isOtherUser ? id : ""}
                        setPopSureDel={setPopSureDelMedia}
                        setIdDelete={setIdDelete}
                      />
                    ) : null}
                    {/* // - SQUAR */}
                    {checkMedias && dataMedias.length > 0 && isSquare ? (
                      <div className="my-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {dataMedias.map((card, index) => (
                          <Multi
                            key={`Square${index}${userId}`}
                            info={card}
                            isUser
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                            isPlaylist={!isOtherUser ? id : ""}
                            setPopSureDel={setPopSureDelMedia}
                            setIdDelete={setIdDelete}
                          />
                        ))}
                      </div>
                    ) : null}
                    {/* // - LIST */}
                    {checkMedias && dataMedias.length > 0 && isList ? (
                      <div className="flex flex-col gap-1">
                        {dataMedias.map((card, index) => (
                          <MultiList
                            key={`MultiList${index}${userId}`}
                            info={card}
                            isUser
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                            isPlaylist={!isOtherUser ? id : ""}
                            setPopSureDel={setPopSureDelMedia}
                            setIdDelete={setIdDelete}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
            {!isOtherUser && editPlaylist ? (
              <EditPlaylist
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                setEditPlaylist={setEditPlaylist}
                dataPlaylist={dataPlaylist}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default PlaylistSingle;
