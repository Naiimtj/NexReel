import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  UnFollow,
  deleteFollower,
  getUser,
  postFollow,
  getFollowersUser,
} from "../../../services/DB/services-db";
import UserDetails from "./UserDetails";
import ViewsPending from "./ViewsPending";
import Playlist from "./Playlist/Playlist";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import Spinner from "../../utils/Spinner/Spinner";
import EmptySmall from "../MediaList/EmptySmall";
import UpdateProfile from "./UpdateProfile";
import Carousel from "../../utils/Carousel/Carousel";
import {
  FaUserAltSlash,
  FaUserClock,
  FaUserPlus,
  FaUserTimes,
} from "react-icons/fa";
import { MdModeEditOutline } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import UpdatePassword from "./UpdatePassword";
import NewPlaylist from "./Playlist/NewPlaylist";
import { NoImageMore } from "../../assets/image";
import PopSureDelete from "../PopUp/PopSureDelete";
import SearchUsers from "./SearchUsers";
import PageTitle from "../PageTitle";

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : check &&
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return DataPendingOrder;
}

const Profile = ({
  dataUser,
  isOtherUser,
  changeOtherUser,
  setChangeOtherUser,
}) => {
  const [t] = useTranslation("translation");
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [user, setUser] = useState({});
  const otherUser = dataUser && dataUser.user;
  const isFollowing = dataUser && dataUser.isFollowing;
  const isConfirm = dataUser && dataUser.isConfirm;
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setUser(data);
        })
        .catch((err) => err);
    };
    const userData = async () => {
      setUser(otherUser);
    };
    if (!isOtherUser) {
      Data();
    }
    if (isOtherUser) {
      userData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOtherUser, changeSeenPending, otherUser]);

  // PEOPLE FOLLOWING USER
  const [followers, setFollowers] = useState([]);
  const isFollowingOtherUser =
    followers &&
    followers.filter(
      (i) => i.UserIDFollower === user.id && i.UserConfirm === true
    ).length > 0;

  useEffect(() => {
    const Data = async () => {
      getFollowersUser(user.id)
        .then((data) => {
          setFollowers(data);
        })
        .catch((err) => err);
    };
    if (user.id) {
      Data();
    }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const newDate = new DateAndTimeConvert(
    user.createdAt,
    t,
    false,
    false,
    false,
    true,
    "long"
  ).DateTimeConvertLocale();
  const checkMedias = !!(user && user.medias && user.medias.length > 0);
  const UserMedias = checkMedias && user.medias;
  const pendingData = checkMedias
    ? DataOrder(
        checkMedias,
        user.medias.filter((i) => i.pending !== false)
      )
    : null;

  const seenData = checkMedias
    ? DataOrder(
        checkMedias,
        user.medias.filter((i) => i.seen !== false)
      )
    : null;

  const checkPlaylists = !!(
    user &&
    user.playlists &&
    user.playlists.length > 0
  );

  const playlistData =
    checkPlaylists && DataOrder(checkPlaylists, user.playlists);
  const [createPlaylist, setCreatePlaylist] = useState(false);

  const checkPlaylistsFollow = !!(
    user &&
    user.playlistsFollow &&
    user.playlistsFollow.length > 0
  );

  console.log(dataUser);

  const playlistsFollowData =
    checkPlaylistsFollow &&
    DataOrder(checkPlaylistsFollow, user.playlistsFollow);

  const [modalForm, setModalForm] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const TimeTotalSeenMin =
    UserMedias &&
    UserMedias.filter((i) => i.seen === true || i.vote !== -1)
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

  // Follow
  const handleFollow = () => {
    postFollow(user.id).then(
      () => setChangeSeenPending(!changeSeenPending),
      setChangeOtherUser(!changeOtherUser)
    );
  };
  const [hovered, setHovered] = useState(false);
  const handleUnFollow = () => {
    UnFollow(user.id).then(
      () => setChangeSeenPending(!changeSeenPending),
      setChangeOtherUser(!changeOtherUser)
    );
  };

  const handleDeleteFollower = () => {
    deleteFollower(user.id).then(
      () => setChangeSeenPending(!changeSeenPending),
      setChangeOtherUser(!changeOtherUser)
    );
  };

  // FOLLOWERS USER
  const FollowersUser =
    user &&
    user.followers &&
    user.followers.filter((i) => i.UserConfirm === true);
  const FollowingUser =
    user &&
    user.following &&
    user.following.filter((i) => i.UserConfirm === true);

  // - DELETE PLAYLIST
  const [answerDel, setAnswerDel] = useState(false);
  const [idDelete, setIdDelete] = useState(null);
  const [popSureDel, setPopSureDel] = useState(false);
  const [errorDelete, setErrorDelete] = useState(false);

  useEffect(() => {
    const deletePlaylist = async () => {
      try {
        await deletePlaylist(idDelete);
        setChangeSeenPending(!changeSeenPending);
        setChangeOtherUser(!changeOtherUser);
        setAnswerDel(false);
        setIdDelete(null);
      } catch (error) {
        if (error) {
          const { message } = error.response?.data || {};
          setErrorDelete(message);
        }
      }
    };

    if (answerDel) {
      deletePlaylist();
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

  console.log(checkPlaylistsFollow);

  return (
    <>
      {!Object.keys(user).length > 0 ? (
        <Spinner result />
      ) : (
        <div
          className={isFollowing || isFollowing === undefined ? "mb-20" : ""}
        >
          <PageTitle
            title={`${
              Object.keys(user).length && t("Profile") + " " + user.username
            }`}
          />
          <div className="text-gray-200 mt-6 h-full w-full">
            {/* // MODAL UPDATE PROFILE */}
            {modalForm ? (
              <UpdateProfile
                setModalForm={setModalForm}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
              />
            ) : null}
            {modalPassword ? (
              <UpdatePassword
                setModalPassword={setModalPassword}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
              />
            ) : null}
            {/* // - DATA USERS */}
            {!modalForm && !modalPassword ? (
              <div className="relative grid grid-cols-4 md:grid-flow-col gap-4">
                <div className="row-span-2 place-self-center flex flex-col items-center">
                  <img
                    className="rounded-full object-cover h-44 w-44 my-4"
                    src={user.avatarURL}
                    alt={t('"Profile avatar"')}
                  />
                  <h1 className="italic text-center mt-2">
                    {user.favoritePhrase !== "" && user.favoritePhrase !== null
                      ? `"${user.favoritePhrase}"`
                      : `"${t("Personalized phrase")}"`}
                  </h1>

                  {isConfirm || !isOtherUser ? (
                    <>
                      <h1 className="font-semibold text-left mt-2">
                        {t("Time Viewed")}
                      </h1>
                      <p className="text-center">{TimeTotalSeen}</p>
                    </>
                  ) : null}
                </div>
                <div className="col-span-3 ml-10">
                  {/* // - SEARCH USERS */}
                  <div className="flex justify-end mb-4" ref={searchRef}>
                    <SearchUsers hiden={hiden} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    {/* // . INFO USER */}
                    <div>
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-xl ">{t("Name")}:</h3>
                      </div>
                      <p className="font-base text-base mb-4">
                        {user.username}
                      </p>
                      <h3 className="font-semibold text-xl ">
                        {t("Member since")}:{" "}
                      </h3>
                      <p className="font-base text-base mb-4">{newDate}</p>
                      {/* // - BUTTON FOLLOW */}
                      {isOtherUser && !isFollowing ? (
                        <div className="flex items-center gap-1 mb-8">
                          <div
                            className="flex items-center gap-2 cursor-pointer text-purpleNR md:hover:text-gray-500 transition duration-200"
                            onClick={handleFollow}
                          >
                            <FaUserPlus
                              className="h-14 w-14 md:h-5 md:w-5"
                              alt={t("Follow")}
                            />
                            {t("Follow")}
                          </div>
                        </div>
                      ) : null}
                      {/* // - BUTTON CANCEL REQUEST */}
                      {isOtherUser && isFollowing && !isConfirm ? (
                        <div className="flex items-center gap-1 mb-8">
                          <div
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            className="cursor-pointer text-purpleNR transition"
                          >
                            {hovered ? (
                              <div
                                className="flex items-center gap-2 text-gray-500"
                                onClick={handleUnFollow}
                              >
                                <FaUserTimes
                                  className="h-14 w-14 md:h-5 md:w-5"
                                  alt={t("Cancel request")}
                                />
                                {t("Cancel request")}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <FaUserClock
                                  className="h-14 w-14 md:h-5 md:w-5"
                                  alt={t("Waiting confirmation Icon")}
                                />
                                {t("Waiting confirmation")}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                      {/* // - MORE INFO USER */}
                      {!isOtherUser && (
                        <div className="flex flex-col items-start">
                          <h1 className="font-semibold text-xl ">Email: </h1>
                          <p className="font-base text-base mb-4">
                            {user.email}
                          </p>

                          <button
                            className="flex items-center gap-1 transition ease-in-out text-purpleNR md:hover:text-gray-500 duration-200 cursor-pointer mb-4"
                            onClick={() => setModalForm(true)}
                          >
                            <MdModeEditOutline className="h-14 w-14 md:h-4 md:w-4" />
                            {t("Edit profile")}
                          </button>
                          <button
                            className="flex items-center gap-1 transition ease-in-out text-purpleNR md:hover:text-gray-500 duration-200 cursor-pointer"
                            onClick={() => setModalPassword(true)}
                          >
                            <RiLockPasswordFill className="h-14 w-14 md:h-4 md:w-4" />
                            {t("Change password")}
                          </button>
                        </div>
                      )}
                      {/* // -UNFOLLOW / UNFOLLOWING */}
                      <div className="flex flex-col gap-4">
                        {/* // . UNFOLLOW */}
                        {isOtherUser && isFollowing && isConfirm ? (
                          <div
                            className="flex gap-2 text-sm cursor-pointer text-purpleNR hover:text-gray-500 transition w-[180px]"
                            onClick={handleUnFollow}
                          >
                            <FaUserTimes
                              className="h-12 w-12 md:h-5 md:w-5"
                              alt={t("Unfollow")}
                            />
                            {t("Unfollow")}
                          </div>
                        ) : null}
                        {/* // . DELETE FOLLOWER */}
                        {isOtherUser && isFollowingOtherUser ? (
                          <div
                            className="flex gap-2 text-sm cursor-pointer text-red-500 hover:text-gray-500 transition w-[180px]"
                            onClick={handleDeleteFollower}
                          >
                            <FaUserAltSlash
                              className="h-12 w-12 md:h-5 md:w-5"
                              alt={t("Remove Follower")}
                            />
                            {t("Remove Follower")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {/* // . FOLLOWS */}
                    {isConfirm || !isOtherUser ? (
                      <div className="grid grid-cols-2 grid-rows-2 ml-10">
                        {/* // - FOLLOWERS */}
                        {FollowersUser && FollowersUser.length > 0 && (
                          <div>
                            <h1 className="font-semibold text-xl inline-block">
                              {t("Followers")}
                            </h1>
                            <p className="inline-block ml-1">{`(${FollowersUser.length})`}</p>
                            <div className="flex flex-row gap-2 mt-2">
                              {FollowersUser.map((i, index) =>
                                index <= 5 ? (
                                  <UserDetails
                                    key={i.id}
                                    data={i}
                                    num={index}
                                    isFollower
                                  />
                                ) : null
                              )}
                              {user.followers.length > 5 ? (
                                <div className="flex flex-col justify-end">
                                  <button className="cursor-pointer text-left text-base font-semibold px:center text-[#7B6EF6] transition ease-in-out md:hover:scale-105 duration-300 hover:text-grayNR">
                                    {t("See all")}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                        {/* // - FOLLOWING */}
                        {FollowingUser && FollowingUser.length > 0 && (
                          <div>
                            <h1 className="font-semibold text-xl inline-block">
                              {t("Following")}
                            </h1>
                            <p className="inline-block ml-1">{`(${FollowingUser.length})`}</p>
                            <div className="flex flex-row gap-2 mt-2">
                              {FollowingUser.map((i, index) =>
                                index <= 5 ? (
                                  <UserDetails
                                    key={i.id}
                                    data={i}
                                    num={index}
                                  />
                                ) : null
                              )}
                              {FollowingUser.length > 5 ? (
                                <div className="flex flex-col justify-end">
                                  <button className="cursor-pointer text-left text-base font-semibold px:center text-[#7B6EF6] transition ease-in-out md:hover:scale-105 duration-300 hover:text-grayNR">
                                    {t("See all")}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {/* // - MEDIAS USER */}
          {isConfirm || !isOtherUser ? (
            <div className="mt-4 border-t border-gray-800">
              {/* // - ALL MEDIAS */}
              {UserMedias ? (
                <div className="text-gray-200 pt-4">
                  <div className="text-gray-200 px-4 md:px-6">
                    <Carousel
                      title={t("All")}
                      info={UserMedias}
                      isUser
                      setChangeSeenPending={setChangeSeenPending}
                      changeSeenPending={changeSeenPending}
                    />
                  </div>
                </div>
              ) : null}
              {/* // - PENDING & VIEWS */}
              <div className="bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 mt-4 px-4 ">
                {/* // . PENDING */}
                <div className="md:border-r-4 md:border-gray-900">
                  <div className="flex justify-between pr-2">
                    <Link to={`/pending/${user.id}`}>
                      <div className="flex transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide">
                        <h1 className="pl-4 text-2xl">{t("PENDINGS")}</h1>
                        <p className="ml-1 text-xs">{`( ${
                          checkMedias && pendingData.length
                            ? pendingData.length
                            : 0
                        } )`}</p>
                      </div>
                    </Link>
                  </div>
                  {/* // List */}
                  {checkMedias && pendingData.length > 0 ? (
                    <div className="mt-4 text-gray-200 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
                      {pendingData.map((i, index) =>
                        index < 2 ? (
                          <ViewsPending
                            key={i.id}
                            data={i}
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                          />
                        ) : null
                      )}
                      {pendingData.length > 2 ? (
                        <div className="hidden xl:flex justify-end bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl ">
                          <Link
                            to={`/pending/${user.id}`}
                            target="_blank"
                            className="h-full w-full"
                          >
                            <EmptySmall />
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {checkMedias && pendingData.length > 2 ? (
                    <div className="flex justify-end mr-2 xl:hidden">
                      <Link
                        to={`/pending/${user.id}`}
                        className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300"
                      >
                        {t("See all")}
                      </Link>
                    </div>
                  ) : null}
                </div>
                {/* // . VIEWS */}
                <div>
                  <div className="flex justify-between pr-2 ">
                    <Link to={`/view/${user.id}`}>
                      <div className="flex transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide">
                        <h1 className="pl-4 text-2xl">{t("VIEWS")}</h1>
                        <p className="ml-1 text-xs">{`( ${
                          checkMedias && seenData.length ? seenData.length : 0
                        } )`}</p>
                      </div>
                    </Link>
                  </div>
                  {/* // List */}
                  {checkMedias && seenData.length > 0 ? (
                    <div className="mt-4 mb-2 text-gray-200 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
                      {seenData.map((i, index) =>
                        index < 2 ? (
                          <ViewsPending
                            key={i.id}
                            data={i}
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                          />
                        ) : null
                      )}
                      {seenData.length > 2 ? (
                        <div className="hidden xl:flex justify-end bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl ">
                          <Link
                            to={`/view/${user.id}`}
                            className="h-full w-full"
                          >
                            <EmptySmall />
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {checkMedias && seenData.length > 2 ? (
                    <div className="flex justify-end mr-2 xl:hidden">
                      <Link
                        to={`/view/${user.id}`}
                        className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300"
                      >
                        {t("See all")}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
              {/* // - PLAYLISTS */}
              <div className="mt-4 flex items-center justify-between">
                <Link
                  to={`/playlists/${user.id}`}
                  className="flex justify-start  text-2xl transition ease-in-out text-purpleNR md:hover:text-gray-500 duration-300 tracking-wide"
                >
                  {t("Playlists")}
                  {checkPlaylists && (
                    <p className="text-sm ml-1">( {playlistData.length} )</p>
                  )}
                </Link>
              </div>
              <div className="bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 px-2 grid sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1 mt-4">
                {/* // - POP DELETE */}
                {popSureDel ? (
                  <div className="absolute object-cover backdrop-blur-md bg-transparent/30 rounded-3xl h-full w-full z-50 grid justify-center align-middle">
                    <PopSureDelete
                      setPopSureDel={setPopSureDel}
                      setAnswerDel={setAnswerDel}
                    />
                  </div>
                ) : null}
                {/* // New Playlist */}
                {!isOtherUser && createPlaylist ? (
                  <div className="col-span-full">
                    <NewPlaylist
                      setChangeSeenPending={setChangeSeenPending}
                      changeSeenPending={changeSeenPending}
                      createPlaylist={createPlaylist}
                      setCreatePlaylist={setCreatePlaylist}
                      isAbsolute={false}
                    />
                  </div>
                ) : null}
                {/* // List Playlists */}
                {checkPlaylists && playlistData.length > 0
                  ? playlistData.map((i) => (
                      <div key={i.id}>
                        {/* // List */}
                        {checkPlaylists ? (
                          <div className="mt-4">
                            <Playlist
                              data={i}
                              isOtherUser={isOtherUser}
                              userId={user.id}
                              setPopSureDel={setPopSureDel}
                              setIdDelete={setIdDelete}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
                {/* // - CREATE A PLAYLIST */}
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
                            <div className="">
                              <img
                                className="rounded-lg object-cover object-center w-[500px] h-[150px]"
                                src={NoImageMore}
                                alt={"New Playlist"}
                              />
                            </div>
                          </div>
                          <div className="text-gray-200 mt-2">
                            <h3 className="pl-4 text-xl">
                              {t("Add Playlist")}
                            </h3>
                          </div>
                        </div>
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {/* // See All Playlists */}
                {checkPlaylists && playlistData.length > 4 ? (
                  <div className="col-span-4 flex justify-end">
                    <Link
                      to={`/playlists/${user.id}`}
                      className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 pr-2"
                    >
                      {t("See all")}
                    </Link>
                  </div>
                ) : null}
              </div>
              {/* // - PLAYLISTS FOLLOWER */}
              <div className="mt-4 flex items-center justify-between">
                {checkPlaylistsFollow && playlistsFollowData.length > 0 ? (
                  <Link
                    to={`/playlistsFollow/${user.id}`}
                    className="flex justify-start  text-2xl transition ease-in-out text-purpleNR md:hover:text-gray-500 duration-300 tracking-wide"
                  >
                    {t("Playlists Follow")}
                    {checkPlaylistsFollow && (
                      <p className="text-sm ml-1">
                        ( {playlistsFollowData.length} )
                      </p>
                    )}
                  </Link>
                ) : (
                  <div className="flex justify-start  text-2xl transition ease-in-out text-grayNR duration-300 tracking-wide">
                    {t("Playlists Follow")}
                  </div>
                )}
              </div>
              <div className="bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 px-2 grid sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1 mt-4">
                {checkPlaylistsFollow && playlistsFollowData.length > 0 ? (
                  playlistsFollowData.map((i) => (
                    <div key={i.id}>
                      {/* // Playlist */}
                      {checkPlaylistsFollow ? (
                        <div className="mt-4">
                          <Playlist
                            data={i}
                            isOtherUser={true}
                            userId={i.author}
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                            setPopSureDel={setPopSureDel}
                            setAnswerDel={setAnswerDel}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="ml-4 text-green-50 italic">
                    {t("Not follow playlists")}{" "}
                  </div>
                )}
                {checkPlaylists && playlistData.length > 4 ? (
                  <div className="col-span-4 flex justify-end">
                    <Link
                      to={`/playlistsFollow/${user.id}`}
                      className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 pr-2"
                    >
                      {t("See all")}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          ) : isFollowing && isConfirm ? (
            <div className="mt-4 border-t border-gray-800">
              {/* // - PLAYLISTS */}
              <div className="mt-4 flex items-center justify-between">
                <Link
                  to={`/playlists/${user.id}`}
                  className="flex justify-start  text-2xl transition ease-in-out text-purpleNR md:hover:text-gray-500 duration-300 tracking-wide"
                >
                  {t("Playlists")}
                  {checkPlaylists && (
                    <p className="text-sm ml-1">( {playlistData.length} )</p>
                  )}
                </Link>
              </div>
              <div className="bg-local rounded-xl backdrop-blur-3xl bg-[#2c3349]/80 py-4 px-2 grid sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-1 mt-4">
                {checkPlaylists && playlistData.length > 0
                  ? playlistData.map((i) => (
                      <div key={i.id}>
                        {/* // List */}
                        {checkPlaylists ? (
                          <div className="mt-4">
                            <Playlist
                              data={i}
                              isOtherUser={isOtherUser}
                              userId={user.id}
                              setPopSureDel={setPopSureDel}
                              setIdDelete={setIdDelete}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
                {checkPlaylists && playlistData.length > 4 ? (
                  <div className="col-span-4 flex justify-end">
                    <Link
                      to={`/playlists/${user.id}`}
                      className="transition ease-in-out text-purpleNR fill-purptext-purpleNR md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 pr-2"
                    >
                      {t("See all")}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};

export default Profile;

Profile.defaultProps = {
  dataUser: {},
  isOtherUser: false,
  setChangeOtherUser: () => {},
  changeOtherUser: false,
};

Profile.propTypes = {
  dataUser: PropTypes.object,
  isOtherUser: PropTypes.bool,
  setChangeOtherUser: PropTypes.func,
  changeOtherUser: PropTypes.bool,
};
