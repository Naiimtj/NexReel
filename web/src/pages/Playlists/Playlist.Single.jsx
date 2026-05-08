import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
import { useMediaContext } from '../../context/media-context';
import { useTranslation } from 'react-i18next';
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
} from '../../../services/DB/services-db';
// icons
import { HiSortAscending, HiSortDescending, HiUserGroup } from 'react-icons/hi';
import { IoIosArrowBack } from 'react-icons/io';
import { BiHeart, BiSolidHeart } from 'react-icons/bi';
// components
import Multi from '../../components/MediaList/Multi';
import MultiList from '../../components/MediaList/MultiList';
import Carousel from '../../utils/Carousel/Carousel';
import DateAndTimeConvert from '../../utils/DateAndTimeConvert';
import Spinner from '../../utils/Spinner/Spinner';
import EditPlaylist from '../../components/Users/Playlist/EditPlaylist';
import { BaseIcon, DeleteConfirmModal } from '../../components/base';
import PageTitle from '../../components/PageTitle';
import ButtonIsFollowing from '../../utils/ButtonIsFollowing';
import CarouselCredits from '../../utils/Carousel/CarouselCredits';
import ViewToggle from '../../utils/Buttons/ViewToggle';

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : check &&
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return DataPendingOrder;
}

const PlaylistSingle = () => {
  const [t] = useTranslation('translation');
  const { user } = useAuthContext();
  const { mediasUser } = useMediaContext();
  const { userId, id } = useParams();
  const isOtherUser = user.id !== userId;
  const [dataPlaylist, setDataPlaylist] = useState({});
  const [dataUser, setDataUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesign, setVisualDesign] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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
  const dataMediasAll = checkMedias
    ? DataOrder(checkMedias, medias, isAsc)
    : null;
  const dataMedias = checkMedias
    ? dataMediasAll && dataMediasAll.filter((f) => f.media_type !== 'person')
    : null;
  const dataMediasPersons = checkMedias
    ? dataMediasAll && dataMediasAll.filter((f) => f.media_type === 'person')
    : null;
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
    postFollowPlaylist(id).then(() => setChangeSeenPending(!changeSeenPending));
  };
  // -NO FOLLOW
  const handleUnFollow = () => {
    deleteFollowPlaylist(id).then(() =>
      setChangeSeenPending(!changeSeenPending),
    );
  };
  // -LIKE
  const handleLike = () => {
    patchFollowPlaylist(id, { like: true }).then(() =>
      setChangeSeenPending(!changeSeenPending),
    );
  };
  // -UNLIKE
  const handleUnLike = () => {
    patchFollowPlaylist(id, { like: false }).then(() =>
      setChangeSeenPending(!changeSeenPending),
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
    t,
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
    const canPlaylist = async () => {
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
      canPlaylist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerDel]);
  useEffect(() => {
    const deleteMedia = async () => {
      try {
        await deletePlaylistMedia(!isOtherUser ? id : '', {
          mediaIdDelete: idDelete,
        });
        setChangeSeenPending(!changeSeenPending);
        setAnswerDelMedia(!answerDelMedia);
        setIdDelete(null);
      } catch (error) {
        if (error) {
          const { message } = error.response?.data || {};
          setErrorDelete(message);
          setIdDelete(null);
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
                to={!isOtherUser ? '/me' : `/users/${dataUser.id}`}
                className="ml-5 pt-5 text-[#b1a9fa] md:hover:text-gray-500 capitalize"
              >
                <IoIosArrowBack
                  className="inline-block mr-1"
                  size={25}
                  alt={t('Left arrow icon')}
                />
                {dataUser?.username}
              </Link>
              <Link
                to={`/playlists/${dataUser.id}`}
                className="ml-5 pt-5 text-[#b1a9fa] md:hover:text-gray-500 capitalize"
              >
                <IoIosArrowBack
                  className="inline-block mr-1"
                  size={25}
                  alt={t('Left arrow icon')}
                />
                {t('Playlists')}
              </Link>
            </div>
            {!editPlaylist ? (
              <div
                className="text-gray-200 rounded-xl bg-cover w-full ring-2 ring-inset ring-[#20283E]"
                style={{
                  backgroundImage: `url(${imgPlaylist})`,
                }}
              >
                <div className="bg-local backdrop-blur-md bg-[#20283E]/80 rounded-xl h-full md:py-10 py-4 px-4">
                  <div className="relative">
                    {/* // - POP DELETE */}
                    <DeleteConfirmModal
                      visible={popSureDel}
                      onConfirm={() => {
                        setPopSureDel(false);
                        setAnswerDel(true);
                      }}
                      onCancel={() => {
                        setPopSureDel(false);
                        setAnswerDel(false);
                      }}
                    />
                    {/* // - TOP */}
                    <h1 className="text-lg md:text-3xl uppercase text-gray-200 text-center mb-1">
                      {t(title)}
                    </h1>
                    {/* // . TAGS */}
                    <div className="text-xs text-gray-500 text-center mb-4">
                      {tags && tags.join(', ')}
                    </div>
                    <div className="md:grid md:grid-cols-6 flex flex-col border-b border-gray-700 mb-2 pb-2">
                      {/* //-POSTER*/}
                      <div className="col-start-1 col-span-2 flex justify-center">
                        <img
                          className="static object-cover rounded-lg w-[600px] h-full"
                          src={imgPlaylist}
                          alt={title}
                        />
                      </div>
                      {/* // - INFO PLAYLIST */}
                      <div className="col-span-4 md:ml-10">
                        <div className="flex gap-2">
                          <p className="text-gray-400">{`${t(
                            'Create by',
                          )}:`}</p>
                          <Link
                            to={
                              isOtherUser
                                ? `/users/${dataPlaylist.user?.id}`
                                : '/me'
                            }
                            className="capitalize text-purpleNR hover:text-gray-600 transition duration-300"
                          >
                            {dataPlaylist?.user?.username}
                          </Link>
                        </div>

                        <>
                          <div className="text-gray-400">{`${t(
                            'Description',
                          )}:`}</div>
                          <div
                            className={`${
                              descriptionExpanded ? '' : 'line-clamp-2'
                            } md:line-clamp-none font-extralight text-sm`}
                          >
                            {description && description !== 'null'
                              ? description
                              : ''}
                          </div>
                          {description && description !== 'null'
                            ? description
                            : '' && (
                                <button
                                  type="button"
                                  className="md:hidden mt-1 text-xs text-purpleNR cursor-pointer hover:text-gray-400 transition duration-300"
                                  onClick={() =>
                                    setDescriptionExpanded((v) => !v)
                                  }
                                >
                                  {descriptionExpanded
                                    ? t('Read less')
                                    : t('Read more')}
                                </button>
                              )}
                        </>
                        <div className="md:col-span-2 col-span-4">
                          <div className="flex gap-2">
                            {dataMediasPersons &&
                              dataMediasPersons.length > 0 && (
                                <>
                                  <p className="text-gray-400">{`${t(
                                    'Quantity Persons',
                                  )}:`}</p>
                                  <div className="inline-block capitalize">
                                    {dataMediasPersons
                                      ? dataMediasPersons.length
                                      : 0}
                                  </div>
                                </>
                              )}
                          </div>
                          <div className="flex gap-2">
                            <p className="text-gray-400">{`${t(
                              'Quantity',
                            )}:`}</p>
                            <div className="inline-block capitalize">
                              {dataMedias ? dataMedias.length : 0}
                            </div>
                          </div>
                          {dataMedias && dataMedias.length > 0 && (
                            <div className="flex gap-2">
                              <p className="text-gray-400">{`${t(
                                'Total Time',
                              )}:`}</p>
                              <div className="inline-block">
                                {TimeTotalSeen}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* // - LIKES/FOLLOWS & BUTTONS */}
                      <div className="col-start-1 col-span-2 mt-2 flex justify-between items-center">
                        {/* // . DATA PLAYLIST */}
                        <div className="ml-4 flex items-center gap-4">
                          {!isOtherUser ? (
                            <div className="text-center flex items-center gap-2">
                              <BiSolidHeart
                                size={20}
                                alt={t('Solid Heart Icon')}
                                className=""
                              />
                              <p>{TotalLikesFollowPlaylist}</p>
                            </div>
                          ) : null}
                          <div className="text-center flex items-center gap-2">
                            <HiUserGroup size={20} alt={t('Followers')} />
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
                                      alt={t('No Heart Icon')}
                                      className="text-purpleNR cursor-pointer hover:text-gray-600 transition ease-in-out md:hover:scale-110 duration-300"
                                      onClick={handleLike}
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center flex items-center gap-2">
                                    <p>{TotalLikesFollowPlaylist}</p>
                                    <BiSolidHeart
                                      size={20}
                                      alt={t('Solid Heart Icon')}
                                      className="cursor-pointer text-red-200 hover:text-purpleNR transition ease-in-out md:hover:scale-110 duration-300"
                                      onClick={handleUnLike}
                                    />
                                  </div>
                                )
                              ) : (
                                <BaseIcon
                                  icon="trash"
                                  size="small"
                                  onClick={handleDeletePlaylist}
                                  aria-label={t('Delete Playlist')}
                                  className="z-50 text-red-500 md:hover:text-gray-500 duration-200"
                                  tooltip={t('Delete')}
                                />
                              )}
                            </>
                          ) : null}
                          {/* // FOLLOW & NO FOLLOW or NUM FOLLOWERS / EDIT PLAYLIST */}
                          <div className="mr-4">
                            {isOtherUser ? (
                              dataPlaylist && followersPlaylist ? (
                                <div className="mt-1">
                                  <ButtonIsFollowing
                                    isFollowing={
                                      isUserFollowPlaylist &&
                                      !isUserFollowPlaylist.length > 0
                                    }
                                    handleFollow={handleFollow}
                                    handleUnFollow={handleUnFollow}
                                  />
                                </div>
                              ) : null
                            ) : (
                              <BaseIcon
                                icon="edit"
                                size="small"
                                onClick={() => setEditPlaylist(true)}
                                aria-label={t('Edit Playlist')}
                                className="text-[#b1a9fa] md:hover:text-gray-500 duration-200 cursor-pointer"
                                tooltip={t('Edit')}
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
                    <DeleteConfirmModal
                      visible={popSureDelMedia}
                      onConfirm={() => {
                        setPopSureDelMedia(false);
                        setAnswerDelMedia(true);
                      }}
                      onCancel={() => {
                        setPopSureDelMedia(false);
                        setAnswerDelMedia(false);
                      }}
                    />
                    {/* // - CAROUSEL */}
                    {checkMedias && dataMediasPersons.length > 0 ? (
                      <CarouselCredits
                        title={'Persons'}
                        info={dataMediasPersons}
                        media={'person'}
                        isUser={true}
                        isPlaylist={true}
                        setPopSureDel={setPopSureDelMedia}
                        setIdDelete={setIdDelete}
                      />
                    ) : null}
                    {/* // . ORDER & VISUALIZATION */}
                    <div className="flex md:flex-row flex-col justify-between items-center px-4">
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
                            {t('Date Added')}
                            <HiSortAscending
                              className="ml-1 text-2xl inline-block"
                              alt={t('Ascendant')}
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
                            {t('Date Added')}
                            <HiSortDescending
                              className="ml-1 text-2xl inline-block"
                              alt={t('Descending')}
                            />
                          </div>
                        )}
                      </div>
                      {/* // . BUTTONS */}
                      <div className="col-span-2 flex items-center justify-end">
                        <ViewToggle
                          visualDesign={visualDesign}
                          setVisualDesign={setVisualDesign}
                        />
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
                        isPlaylist={!isOtherUser ? id : ''}
                        setPopSureDel={setPopSureDelMedia}
                        setIdDelete={setIdDelete}
                      />
                    ) : null}
                    {/* // - SQUAD */}
                    {checkMedias && dataMedias.length > 0 && isSquare ? (
                      <div className="my-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {dataMedias.map((card, index) => (
                          <Multi
                            key={`Square${index}${userId}`}
                            info={card}
                            isUser
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                            isPlaylist={!isOtherUser ? id : ''}
                            setPopSureDel={setPopSureDelMedia}
                            setIdDelete={setIdDelete}
                            mediasUser={mediasUser}
                          />
                        ))}
                      </div>
                    ) : null}
                    {/* // - LIST */}
                    {checkMedias && dataMedias.length > 0 && isList ? (
                      <div className="flex flex-col gap-1 bg-white/20 p-2 rounded-lg">
                        {dataMedias.map((card, index) => (
                          <MultiList
                            key={`MultiList${index}${userId}`}
                            info={card}
                            isUser
                            setChangeSeenPending={setChangeSeenPending}
                            changeSeenPending={changeSeenPending}
                            isPlaylist={!isOtherUser ? id : ''}
                            setPopSureDel={setPopSureDelMedia}
                            setIdDelete={setIdDelete}
                            mediasUser={mediasUser}
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
