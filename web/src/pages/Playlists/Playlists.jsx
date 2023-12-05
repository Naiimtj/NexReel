import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/auth-context";
import { useTranslation } from "react-i18next";
import {
  deletePlaylist,
  getDetailUser,
  getUser,
} from "../../../services/DB/services-db";
import { IoIosArrowBack } from "react-icons/io";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { BsGrid3X2GapFill, BsListUl } from "react-icons/bs";
import Playlist from "../../components/Users/Playlist/Playlist";
import NewPlaylist from "../../components/Users/Playlist/NewPlaylist";
import { NoImageMore } from "../../assets/image";
import PlaylistsList from "../../components/Users/Playlist/PlaylistsList";
import PopSureDelete from "../../components/PopUp/PopSureDelete";
import SearchPlaylists from "../../components/Users/Playlist/SearchPlaylists";
import PageTitle from "../../components/PageTitle";

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : check &&
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return DataPendingOrder;
}

const Playlists = () => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const { userId } = useParams();
  const isOtherUser = user.id !== userId;
  const [dataUser, setDataUser] = useState({});
  const title = t("Playlists");
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesing, setVisualDesign] = useState(0);
  useEffect(() => {
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
  }, [changeSeenPending, userId, isOtherUser]);
  const checkPlaylists = !!(
    dataUser &&
    dataUser.playlists &&
    dataUser.playlists.length > 0
  );

  const checkMedias = !!(
    dataUser &&
    dataUser.medias &&
    dataUser.medias.length > 0
  );
  const [createPlaylist, setCreatePlaylist] = useState(false);
  const [isAsc, setIsAsc] = useState(false);
  const dataMedias =
    checkPlaylists && DataOrder(checkPlaylists, dataUser.playlists, isAsc);
  let isSquare;
  let isList;
  switch (visualDesing) {
    case 0:
      isSquare = true;
      isList = null;
      break;
    case 1:
      isSquare = null;
      isList = true;
      break;
    default:
      isSquare = true;
      isList = null;
      break;
  }
  // - DELETE PLAYLIST
  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState(false);

  useEffect(() => {
    const deleteMedia = async () => {
      try {
        await deletePlaylist(idDelete);
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
      deleteMedia();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDel]);

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

  const [hiden, setHiden] = useState(false);
  const searchRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setHiden(true);
        setTimeout(() => {
          setHiden(false);
        }, 500);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-full text-gray-200">
      <PageTitle title={`${Object.keys(dataUser).length && title}`} />
      <div className="relative text-gray-200 mb-20 mt-6">
        <div className="text-gray-200">
          {/* // . BACK USER */}
          <Link
            to={!isOtherUser ? "/me" : `/users/${dataUser.id}`}
            className="ml-5 pt-5 text-[#b1a9fa] md:hover:text-gray-500 capitalize"
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt="Left arrow icon"
            />
            {dataUser.username}
          </Link>
        </div>
        {/* // - SEARCH USERS */}
        <div className="flex justify-end mb-4" ref={searchRef}>
          <SearchPlaylists hiden={hiden} />
        </div>
        {/* // - POP DELETE */}
        {popSureDel ? (
          <div className="absolute object-cover backdrop-blur-md bg-transparent/30 rounded-3xl h-full w-full z-50 grid justify-center align-middle">
            <PopSureDelete
              setPopSureDel={setPopSureDel}
              setAnswerDel={setAnswerDel}
            />
          </div>
        ) : null}
        <>
          <div className="grid grid-cols-3 pr-2 ">
            {/* // . Asc/Desc */}
            <div className="col-start-2 flex items-center justify-center">
              {isAsc ? (
                <div
                  className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                  onClick={() =>
                    checkMedias && dataMedias.length ? setIsAsc(!isAsc) : null
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
                    checkMedias && dataMedias.length ? setIsAsc(!isAsc) : null
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
            {/* // . BUTTONs */}
            <div className="flex items-center justify-end">
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
                  onClick={() => setVisualDesign(0)}
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
                  onClick={() => setVisualDesign(1)}
                />
              </div>
            </div>
          </div>
          {/* // - TITLE */}
          <div className="flex justify-between items-center">
            <div className="flex text-gray-200">
              <h1 className="pl-4 text-sm md:text-2xl uppercase">{t(title)}</h1>
              <p className="ml-1 text-xs">{`( ${
                checkPlaylists && dataMedias.length ? dataMedias.length : 0
              } )`}</p>
            </div>
          </div>
          {/* // - SQUAR */}
          {isSquare ? (
            <div className="relative my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {/* // . CREATE A PLAYLIST */}
              {!isOtherUser ? (
                <div className="flex justify-end gap-1">
                  {!createPlaylist ? (
                    <button
                      className="static text-gray-200 rounded-xl bg-cover w-full mb-2 mt-4"
                      onClick={() => setCreatePlaylist(true)}
                    >
                      <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl h-full">
                        <div className="relative transition ease-in-out md:hover:scale-105 duration-300">
                          {/* //-PORTADA*/}
                          <div>
                            <img
                              className="rounded-lg object-cover object-center w-[500px] h-[150px]"
                              src={NoImageMore}
                              alt={"New Playlist"}
                            />
                          </div>
                        </div>
                        <div className="text-gray-200 mt-2">
                          <h3 className="pl-4 text-xl">{t("Add Playlist")}</h3>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
              ) : null}
              {checkPlaylists &&
                dataMedias.map((playlist, index) => (
                  <div
                    key={`${index + playlist.id}`}
                    className="mt-4 text-gray-200"
                  >
                    <Playlist
                      data={playlist}
                      isOtherUser={isOtherUser}
                      userId={userId}
                      setPopSureDel={setPopSureDel}
                      setIdDelete={setIdDelete}
                    />
                  </div>
                ))}
              {!isOtherUser && createPlaylist ? (
                <NewPlaylist
                  setChangeSeenPending={setChangeSeenPending}
                  changeSeenPending={changeSeenPending}
                  createPlaylist={createPlaylist}
                  setCreatePlaylist={setCreatePlaylist}
                  isAbsolute
                />
              ) : null}
            </div>
          ) : (
            <div className="relative my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {!isOtherUser && isSquare ? (
                <div className="flex justify-end gap-1">
                  {!createPlaylist ? (
                    <button
                      className="static text-gray-200 rounded-xl bg-cover w-full mb-2 mt-4"
                      onClick={() => setCreatePlaylist(true)}
                    >
                      <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl h-full">
                        <div className="relative transition ease-in-out md:hover:scale-105 duration-300">
                          {/* //-PORTADA*/}
                          <div>
                            <img
                              className="rounded-lg object-cover object-center w-[500px] h-[150px]"
                              src={NoImageMore}
                              alt={"New Playlist"}
                            />
                          </div>
                        </div>
                        <div className="text-gray-200 mt-2">
                          <h3 className="pl-4 text-xl">{t("Add Playlist")}</h3>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
          {/* // - LIST */}
          {isList ? (
            <div className="relative flex flex-col gap-1">
              {/* // . CREATE A PLAYLIST */}
              {!isOtherUser ? (
                <div className="flex justify-end gap-1">
                  {!createPlaylist ? (
                    <button
                      className="static text-gray-200 hover:text-purpleNR rounded-xl bg-cover w-full mb-2 mt-4"
                      onClick={() => setCreatePlaylist(true)}
                    >
                      <div className="grid grid-cols-5 justify-between gap-x-6 py-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
                        {/* // - POSTER AND RATINGS */}
                        <div className="col-span-2 flex min-w-0 gap-x-4">
                          <div className="h-full">
                            {/* // . POSTER*/}
                            <div className="transition ease-in-out md:hover:scale-105 duration-300">
                              <img
                                className=" static object-cover cursor-pointer rounded-xl w-[150px] h-[84px]"
                                src={NoImageMore}
                                alt={t("New Playlist")}
                              />
                            </div>
                          </div>
                          <div className="min-w-0 flex-auto mt-4 px-2">
                            {/* // . TITLE */}
                            <div className="flex  font-semibold text-sm md:text-base cursor-pointer">
                              <h3 className="pl-4 text-xl">
                                {t("Add Playlist")}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
              ) : null}
              {/* // . LIST PLAYLISTS */}
              {checkPlaylists &&
                dataMedias.map((playlist) => (
                  <PlaylistsList
                    key={`${playlist.id}`}
                    info={playlist}
                    isOtherUser={isOtherUser}
                    userId={userId}
                    setPopSureDel={setPopSureDel}
                    setIdDelete={setIdDelete}
                  />
                ))}
              {!isOtherUser && createPlaylist ? (
                <NewPlaylist
                  setChangeSeenPending={setChangeSeenPending}
                  changeSeenPending={changeSeenPending}
                  setCreatePlaylist={setCreatePlaylist}
                  isAbsolute
                />
              ) : null}
            </div>
          ) : (
            <div className="relative flex flex-col gap-1">
              {!isOtherUser && isList ? (
                <div className="flex justify-end gap-1">
                  {!createPlaylist ? (
                    <button
                      className="static text-gray-200 hover:text-purpleNR rounded-xl bg-cover w-full mb-2 mt-4"
                      onClick={() => setCreatePlaylist(true)}
                    >
                      <div className="grid grid-cols-5 justify-between gap-x-6 py-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
                        {/* // - POSTER AND RATINGS */}
                        <div className="col-span-2 flex min-w-0 gap-x-4">
                          <div className="h-full">
                            {/* // . POSTER*/}
                            <div className="transition ease-in-out md:hover:scale-105 duration-300">
                              <img
                                className=" static object-cover cursor-pointer rounded-xl w-[150px] h-[84px]"
                                src={NoImageMore}
                                alt={t("New Playlist")}
                              />
                            </div>
                          </div>
                          <div className="min-w-0 flex-auto mt-4 px-2">
                            {/* // . TITLE */}
                            <div className="flex  font-semibold text-sm md:text-base cursor-pointer">
                              <h3 className="pl-4 text-xl">
                                {t("Add Playlist")}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </>
      </div>
    </div>
  );
};

export default Playlists;
