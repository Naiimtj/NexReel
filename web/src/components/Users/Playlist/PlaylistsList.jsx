import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  deleteFollowPlaylist,
  getFollowPlaylistDetail,
  postFollowPlaylist,
} from '../../../../services/DB/services-db';
import { useAuthContext } from '../../../context/auth-context';
import { BaseIcon } from '../../base';

export const PlaylistsList = ({
  info,
  userId,
  isOtherUser,
  setPopSureDel,
  setIdDelete,
}) => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
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
  const isPlaylist = !isOtherUser ? id : '';

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

  const isFollowing = !playlistFollow?.id ? (
    <BaseIcon
      icon="playlistAdd"
      size={25}
      color="#FFCA28"
      className="inline-block transition ease-in-out md:hover:scale-110 duration-300"
      onClick={handleFollow}
      tooltip={t('Follow Playlist')}
    />
  ) : (
    <BaseIcon
      icon="playlistRemove"
      size={25}
      className="inline-block transition ease-in-out md:hover:scale-110 duration-300 text-purpleNR"
      onClick={handleUnFollow}
      tooltip={t('UnFollow Playlist')}
    />
  );

  const handleDeletePlaylist = (event) => {
    event.stopPropagation();
    setPopSureDel(true);
    setIdDelete(id);
  };

  return (
    <div
      className="relative text-gray-200 rounded-xl bg-cover w-full ring-2 ring-inset ring-[#20283E]"
      style={{ backgroundImage: `url(${imgPlaylist})` }}
    >
      <div className="relative bg-local hover:bg-[#1a1f35]/70 backdrop-blur-md bg-[#1a1f35]/85 p-2 rounded-xl h-full">
        <div
          className="flex gap-4 items-start"
          onClick={() => navigate(`/playlists/${userId}/${id}`)}
        >
          {/* // . POSTER */}
          <div className="transition ease-in-out md:hover:scale-105 duration-300">
            <img
              className="md:w-full w-20 h-20 object-cover cursor-pointer rounded-lg"
              src={imgPlaylist}
              alt={title}
            />
          </div>

          {/* // . INFO */}
          <Link
            to={`/playlists/${userId}/${id}`}
            className="min-w-0 flex-1 flex flex-col gap-1 pb-6"
          >
            <div className="flex flex-row gap-1 items-start flex-wrap">
              <p className="font-semibold text-sm leading-tight line-clamp-2 cursor-pointer">
                {title}
              </p>
              <span className="text-xs text-gray-400 bg-[#20283E]/60 px-2 py-0.5 rounded-full whitespace-nowrap">
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
          </Link>
        </div>

        {/* // . ACTIONS — esquina inferior derecha */}
        {userExist ? (
          <div className="absolute bottom-2 right-3 flex items-center gap-3">
            {/* // . FOLLOW/UNFOLLOW */}
            {info && followersPlaylist && isOtherUser ? isFollowing : null}
            {/* // . NUM FOLLOWERS */}
            {info && followersPlaylist && !isOtherUser ? (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <BaseIcon icon="userGroup" size={14} tooltip={t('Followers')} />
                {followersPlaylist.length}
              </div>
            ) : null}
            {/* // ! DELETE */}
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
        ) : null}
      </div>
    </div>
  );
};

export default PlaylistsList;

PlaylistsList.defaultProps = {
  info: {},
  userId: '',
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
