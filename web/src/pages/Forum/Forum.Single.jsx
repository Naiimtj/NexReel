import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/auth-context";
import { useTranslation } from "react-i18next";
// services
import {
  deleteFollowForum,
  deleteForum,
  deleteForumsMedia,
  getDetailForum,
  patchFollowForum,
  postFollowForum,
} from "../../../services/DB/services-db";
// icons
import { BsGrid3X2GapFill, BsListUl } from "react-icons/bs";
import { MdModeEditOutline, MdViewCarousel } from "react-icons/md";
import { HiSortAscending, HiSortDescending, HiUserGroup } from "react-icons/hi";
import { IoIosArrowBack } from "react-icons/io";
import {
  BiHeart,
  BiSolidHeart,
} from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
// components
import Multi from "../../components/MediaList/Multi";
import MultiList from "../../components/MediaList/MultiList";
import Carousel from "../../utils/Carousel/Carousel";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import Spinner from "../../utils/Spinner/Spinner";
import EditForum from "../../components/Forums/EditForum";
import PopSureDelete from "../../components/PopUp/PopSureDelete";
import ForumChat from "../../components/Forums/ForumReplay/ForumChat";
import AddMediaForum from "../../components/Forums/AddMediaForum";
import PageTitle from "../../components/PageTitle";

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : check &&
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return DataPendingOrder;
}

const ForumSingle = () => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const { id } = useParams();
  const [dataForum, setDataForum] = useState({});
  const isOtherUser = user.id !== dataForum.author;
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesign, setVisualDesign] = useState(0);
  useEffect(() => {
    const ForumData = async () => {
      getDetailForum(id).then((data) => {
        setDataForum(data);
      });
    };
    ForumData();
  }, [changeSeenPending, id, dataForum.author, isOtherUser]);
  const {
    title,
    shortDescription,
    tags,
    description,
    medias,
    imgForum,
    followers,
    userCreate,
  } = dataForum;
  const TotalFollowsForum = followers && followers.length;
  const TotalLikesFollowForum =
    TotalFollowsForum > 0
      ? followers && followers.filter((f) => f.like === true).length
      : 0;

  const isUserFollowForum = isOtherUser
    ? followers && followers.filter((f) => f.userId === user.id)
    : null;
  const isUserLiked =
    isUserFollowForum && isUserFollowForum.length > 0
      ? isUserFollowForum.filter((f) => f.like === true).length > 0
      : null;
  const checkMedias = !!(dataForum && medias && medias.length > 0);
  const [isAsc, setIsAsc] = useState(false);
  const dataMedias = checkMedias ? DataOrder(checkMedias, medias, isAsc) : null;

  let isCarousel;
  let isSquare;
  let isList;
  switch (visualDesign) {
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
    postFollowForum(id).then(() => setChangeSeenPending(!changeSeenPending));
  };
  // -NOFOLLOW
  const handleUnFollow = () => {
    deleteFollowForum(id).then(() => setChangeSeenPending(!changeSeenPending));
  };
  const isFollowing =
    isUserFollowForum && !isUserFollowForum.length > 0 ? (
      <button
      className="cursor-pointer transition duration-300 border px-1 rounded-md hover:border-purpleNR hover:text-purpleNR "
      onClick={handleFollow}
    >
      {t("Follow")}
    </button>
    ) : (
      <button
      className="cursor-pointer transition duration-300 text-purpleNR border px-1 rounded-md border-purpleNR hover:border-white hover:text-white"
      onClick={handleUnFollow}
    >
      {t("No Follow")}
    </button>
    );
  // -LIKE
  const handleLike = () => {
    patchFollowForum(id, { like: true }).then(() =>
      setChangeSeenPending(!changeSeenPending)
    );
  };
  // -UNLIKE
  const handleUnLike = () => {
    patchFollowForum(id, { like: false }).then(() =>
      setChangeSeenPending(!changeSeenPending)
    );
  };
  const TimeTotalSeenMin =
    dataMedias &&
    dataMedias
      .map(function (object) {
        return object.runtime;
      })
      .reduce(function (accumulator, valorActual) {
        return accumulator + valorActual;
      }, 0);
  const TimeTotalSeen = new DateAndTimeConvert(
    TimeTotalSeenMin,
    t
  ).TimeConvert();
  const [editForum, setEditForum] = useState(false);

  // -DELETE FORUM
  const [answerDelMedia, setAnswerDelMedia] = useState(false);
  const [popSureDelMedia, setPopSureDelMedia] = useState(false);
  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState(false);

  const handleDeleteForum = () => {
    setPopSureDel(true);
    setIdDelete(id);
  };
  useEffect(() => {
    const deleteSingleForum = async () => {
      try {
        await deleteForum(idDelete).then(() => {
          window.location.href = `/forums`;
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
      deleteSingleForum();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDel]);

  // - DELETE MEDIA
  useEffect(() => {
    const deleteMedia = async () => {
      try {
        await deleteForumsMedia(!isOtherUser ? id : "", {
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

  const basicForum = { id, title };
  return (
    <>
      {!followers ? (
        <Spinner result />
      ) : (
        <div className="w-full h-full text-gray-200">
          <PageTitle
            title={`${
              Object.keys(dataForum).length && `${t("Forum")}-${title}`
            }`}
          />
          <div className="relative text-gray-200 mb-20 mt-6">
            {/* // . BACK USER & FORUM */}
            <div className="text-gray-200 mb-4">
              <Link
                to={`/forums`}
                className="ml-5 pt-5 text-purpleNR md:hover:text-gray-500 capitalize"
              >
                <IoIosArrowBack
                  className="inline-block mr-1"
                  size={25}
                  alt={t("Left arrow icon")}
                />
                {t("Forums")}
              </Link>
            </div>
            {!editForum ? (
              <div className="text-gray-200 rounded-xl">
                <div className="bg-local backdrop-blur-md bg-[#20283E]/80 rounded-xl h-full">
                  <div
                    className="text-gray-200 rounded-t-xl bg-cover w-full"
                    style={{
                      backgroundImage: `url(${imgForum})`,
                    }}
                  >
                    <div className="relative bg-local backdrop-blur-md bg-[#20283E]/80 rounded-t-xl h-full pt-5 px-3 border-b border-gray-700">
                      {/* // - POP DELETE */}
                      {popSureDel ? (
                        <div className="absolute object-cover backdrop-blur-md bg-transparent/30 rounded-3xl h-full w-full z-50 grid justify-center align-middle">
                          <PopSureDelete
                            setPopSureDel={setPopSureDel}
                            setAnswerDel={setAnswerDel}
                          />
                        </div>
                      ) : null}
                      {/* // ! TOP */}
                      <h1 className="text-sm md:text-3xl uppercase text-gray-200 text-center">
                        {t(title)}
                      </h1>
                      { shortDescription && <p className="font-extralight text-center italic text-sm mt-1 mb-4">{`"${shortDescription}"`}</p>}
                      <div className="grid grid-cols-6 mb-2 pb-2">
                        {/* //-POSTER*/}
                        <div className="col-span-2 flex justify-center">
                          <img
                            className="static object-cover rounded-lg w-[600px] h-full"
                            src={imgForum}
                            alt={title}
                          />
                        </div>
                        {/* // - INFO Forum */}
                        <div className="col-span-4 ml-10 grid grid-cols-4">
                          {dataForum && tags && tags[0] !== "" ? (
                            <div className="col-span-3">
                              <p className="text-gray-400 text-xs">
                                {tags.join(", ")}
                              </p>
                            </div>
                          ) : null}
                          <div className="flex justify-end gap-2">
                            <p className="text-gray-400">{`${t(
                              "Create by"
                            )}:`}</p>
                            <Link
                              to={
                                isOtherUser
                                  ? `/users/${userCreate[0].id}`
                                  : "/me"
                              }
                              className="capitalize text-purpleNR hover:text-gray-600 transition duration-300"
                            >
                              {dataForum &&
                                userCreate &&
                                userCreate[0].username}
                            </Link>
                          </div>
                          <div className="col-span-4 flex flex-col">
                            <div className="text-gray-400">{`${t(
                              "Description"
                            )}:`}</div>
                            <p className="font-normal">{description}</p>
                          </div>
                          <div className="col-span-4 grid grid-cols-2">
                            <div className="flex gap-2">
                              <p className="text-gray-400">{`${t(
                                "Quantity"
                              )}:`}</p>
                              <div className="inline-block capitalize">
                                {dataMedias && dataMedias.length > 0
                                  ? dataMedias.length
                                  : 0}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <p className="text-gray-400">{`${t(
                                "Total Time"
                              )}:`}</p>
                              <div className="inline-block capitalize">
                                {TimeTotalSeen}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* // - LIKES/FOLLOWS & BUTTONS */}
                        <div className="col-start-1 col-span-2 mt-1 flex justify-between items-center">
                          {/* // . DATA Forum */}
                          <div className="ml-4 flex items-center gap-4">
                            {!isOtherUser ? (
                              <div className="text-center flex items-center gap-2">
                                <BiSolidHeart
                                  size={20}
                                  alt={t("Solid Heart Icon")}
                                  className=""
                                />
                                <p>{TotalLikesFollowForum}</p>
                              </div>
                            ) : null}
                            <div className="text-center flex items-center gap-2">
                              <HiUserGroup size={20} alt={t("Followers")} />
                              <p>{TotalFollowsForum}</p>
                            </div>
                          </div>
                          {/* // . LIKES & FOLLOWS */}
                          <div className="flex items-center gap-4">
                            {/* // LIKE & UNLIKE / DELETE Forum */}
                            {(isUserFollowForum &&
                              isUserFollowForum.length > 0) ||
                            !isOtherUser ? (
                              <>
                                {isOtherUser ? (
                                  !isUserLiked ? (
                                    <div className="text-center flex items-center gap-2">
                                      <p>{TotalLikesFollowForum}</p>
                                      <BiHeart
                                        size={20}
                                        alt={t("No Heart Icon")}
                                        className="text-purpleNR cursor-pointer hover:text-gray-600 transition ease-in-out md:hover:scale-110 duration-300"
                                        onClick={handleLike}
                                      />
                                    </div>
                                  ) : (
                                    <div className="text-center flex items-center gap-2">
                                      <p>{TotalLikesFollowForum}</p>
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
                                    alt={t("Delete Forum Icon")}
                                    className="text-red-500 md:hover:text-gray-500 duration-200 cursor-pointer"
                                    onClick={handleDeleteForum}
                                  />
                                )}
                              </>
                            ) : null}
                            {/* // FOLLOW & NOFOLLOW or NUM FOLLOWERS / EDIT Forum */}
                            <div className="mr-4 mt-1">
                              {isOtherUser ? (
                                dataForum && followers ? (
                                  isFollowing
                                ) : null
                              ) : (
                                <MdModeEditOutline
                                  size={20}
                                  alt={t("Edit Forum Icon")}
                                  className="text-purpleNR md:hover:text-gray-500 duration-200 cursor-pointer"
                                  onClick={() => setEditForum(true)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* // - ADD MEDIA FORUM */}
                  {!isOtherUser ? (
                    <div className="pt-4">
                      <AddMediaForum
                        changeSeenPending={changeSeenPending}
                        setChangeSeenPending={setChangeSeenPending}
                        basicForum={basicForum}
                      />
                    </div>
                  ) : null}
                  {/* // ! DOWN */}
                  <div className="px-3 pb-6">
                    <div className="relative border-b border-gray-700 pb-4">
                      {/* // - POP DELETE */}
                      {popSureDelMedia ? (
                        <div className="absolute object-cover backdrop-blur-md bg-transparent/30 rounded-3xl h-full w-full z-50 grid justify-center align-middle">
                          <PopSureDelete
                            setPopSureDel={setPopSureDelMedia}
                            setAnswerDel={setAnswerDelMedia}
                          />
                        </div>
                      ) : null}
                      {/* // . ORDER & VISUALIZATION */}
                      <div className="grid grid-cols-3">
                        {/* // - Asc/Desc */}
                        <div className="flex items-center justify-start">
                          {isAsc ? (
                            <div
                              className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
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
                              className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
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
                        {/* // - BUTTONS */}
                        <div className="col-span-2 flex items-center justify-end">
                          {/* // CAROUSEL */}
                          <div
                            className={`mr-2 ${
                              isCarousel
                                ? "text-gray-500"
                                : "cursor-pointer text-purpleNR md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
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
                                : "cursor-pointer text-purpleNR md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
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
                                : "cursor-pointer text-purpleNR md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
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
                          isPlaylist={!isOtherUser ? user.id : ""}
                          setPopSureDel={setPopSureDelMedia}
                          setIdDelete={setIdDelete}
                        />
                      ) : null}
                      {/* // - SQUARE */}
                      {checkMedias && dataMedias.length > 0 && isSquare ? (
                        <div className="my-4 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                          {dataMedias.map((card, index) => (
                            <Multi
                              key={`Square${index}${id}`}
                              info={card}
                              isUser
                              setChangeSeenPending={setChangeSeenPending}
                              changeSeenPending={changeSeenPending}
                              isPlaylist={!isOtherUser ? user.id : ""}
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
                              key={`MultiList${index}${id}`}
                              info={card}
                              isUser
                              setChangeSeenPending={setChangeSeenPending}
                              changeSeenPending={changeSeenPending}
                              isPlaylist={!isOtherUser ? user.id : ""}
                              setPopSureDel={setPopSureDelMedia}
                              setIdDelete={setIdDelete}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {/* // - CHAT */}
                    <ForumChat
                      id={id}
                      isOtherUser={isOtherUser}
                      transl={t}
                      userId={user.id}
                    />
                  </div>
                </div>
              </div>
            ) : null}
            {!isOtherUser && editForum ? (
              <EditForum
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                setEditForum={setEditForum}
                dataForum={dataForum}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default ForumSingle;
