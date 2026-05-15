import { useTranslation } from 'react-i18next';
import Spinner from '../../../utils/Spinner/Spinner';
import { Link, useNavigate } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi';
import {
  deleteFollowPlaylist,
  getFollowPlaylistDetail,
  postFollowPlaylist,
} from '../../../../services/DB/services-db';
import { useEffect, useState } from 'react';
import { BaseIcon } from '../../base';
import ButtonIsFollowing from '../../../utils/ButtonIsFollowing';

const Playlist = ({
  data = {},
  userId = '',
  isOtherUser = false,
  setPopSureDel = () => {},
  setIdDelete = () => {},
  compact = false,
}) => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const {
    description,
    tags,
    id,
    followersPlaylist,
    imgPlaylist,
    medias,
    title,
  } = data;
  const isPlaylist = !isOtherUser ? id : '';

  const [changeDataUser, setChangeDataUser] = useState(false);
  const [playlistFollow, setPlayListFollow] = useState('');
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
  // -NO FOLLOW
  const handleUnFollow = () => {
    deleteFollowPlaylist(id).then(() => setChangeDataUser(!changeDataUser));
  };

  const handleDeletePlaylist = (event) => {
    event.stopPropagation();
    setPopSureDel(true);
    setIdDelete(id);
  };

  return (
    <div className="mb-2">
      {!data && !Object.keys(data).length > 0 ? (
        <Spinner result />
      ) : compact ? (
        <div
          className="relative cursor-pointer text-gray-200 rounded-2xl bg-cover w-full ring-2 ring-inset ring-[#7c6ee0]/60  duration-200"
          style={{ backgroundImage: `url(${imgPlaylist})` }}
          onClick={() => navigate(`/playlists/${userId}/${id}`)}
        >
          <div className="static bg-local hover:bg-[#1a1f35]/70 backdrop-blur-md bg-[#1a1f35]/85 p-2 rounded-xl h-full">
            <div className="flex gap-4 items-start">
              {/* Thumbnail cuadrado — diferencia visual respecto a póster vertical de película */}
              <div className="transition ease-in-out md:hover:scale-105 duration-300">
                <img
                  className="md:w-full w-20 h-20 object-cover cursor-pointer rounded-lg"
                  src={imgPlaylist}
                  alt={title}
                />
              </div>
              <div className="flex flex-col gap-2 md:flex-row w-full">
                {/* Info */}
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <div className="flex flex-row gap-1">
                    <p className="font-semibold text-sm leading-tight line-clamp-2 cursor-pointer">
                      {title}
                    </p>

                    {/* Contador de medias */}
                    <span className="text-xs text-gray-400 bg-[#20283E]/60 px-2 py-0.5 rounded-full">
                      {medias && medias.length} {t('items')}
                    </span>
                  </div>

                  {description && description !== 'null' && (
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                      {description}
                    </p>
                  )}
                  {tags && tags.length > 0 && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {tags.join(', ')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {/* Followers o follow button */}
                  {data && followersPlaylist && isOtherUser ? (
                    <ButtonIsFollowing
                      isFollowing={!playlistFollow?.id}
                      handleFollow={handleFollow}
                      handleUnFollow={handleUnFollow}
                    />
                  ) : null}
                  {data && followersPlaylist && !isOtherUser ? (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <HiUserGroup size={14} alt={t('Followers')} />
                      {followersPlaylist.length}
                    </div>
                  ) : null}

                  {/* Delete */}
                  {isPlaylist !== '' ? (
                    <BaseIcon
                      icon="trash"
                      size="x-small"
                      color="currentColor"
                      onClick={handleDeletePlaylist}
                      aria-label={t('Delete Playlist Icon')}
                      className="text-red-500 md:hover:text-gray-500 duration-200"
                      tooltip={t('Delete')}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="static text-gray-200 rounded-xl bg-cover w-full ring-2 ring-inset ring-[#20283E]"
          style={{
            backgroundImage: `url(${imgPlaylist})`,
          }}
        >
          <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl h-full">
            <Link to={`/playlists/${userId}/${id}`}>
              <div className="relative">
                {/* //-POSTER*/}
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
                {description !== 'null' && (
                  <div className="font-semibold">
                    <p className="font-normal text-xs">{description}</p>
                  </div>
                )}
                <div className="text-xs text-gray-500 text-center">
                  {tags && tags.join(', ')}
                </div>
              </Link>
              <div className="">
                {/* // ! Delete Button */}
                {isPlaylist !== '' ? (
                  <BaseIcon
                    icon="trash"
                    size="x-small"
                    color="currentColor"
                    onClick={handleDeletePlaylist}
                    aria-label={t('Delete Playlist Icon')}
                    className="absolute z-50 text-red-500 md:hover:text-gray-500 duration-200"
                    tooltip={t('Delete')}
                  />
                ) : null}
                {/* //- FOLLOW/NOFOLLOW or NUM FOLLOWERS */}
                <div className="flex justify-end">
                  {data && followersPlaylist && isOtherUser ? (
                    <div className="pb-1">
                      <ButtonIsFollowing
                        isFollowing={!playlistFollow?.id}
                        handleFollow={handleFollow}
                        handleUnFollow={handleUnFollow}
                      />
                    </div>
                  ) : null}
                  {data && followersPlaylist && !isOtherUser ? (
                    <div className="flex justify-end gap-1">
                      <HiUserGroup size={20} alt={t('Followers')} />
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

export default Playlist;
