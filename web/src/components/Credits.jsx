import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { NoImage, people } from '../assets/image';
import { useAuthContext } from '../context/auth-context';
import { useEffect, useState } from 'react';
import { BaseIcon } from './base';
import { useTranslation } from 'react-i18next';
import AddForum from '../utils/Forum/AddForum';
import ShowPlaylistMenu from '../utils/Playlists/ShowPlaylistMenu';
import { getMediaDetails } from '../../services/TMDB/services-tmdb';

export const Credits = ({
  repInfo,
  media,
  idInfo,
  isForum,
  changeSeenPending,
  setChangeSeenPending,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  basicForum,
  size,
  playlistLabelVisibility,
}) => {
  const [t, i18next] = useTranslation('translation');
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const userExist = !!user;

  const {
    profile_path,
    name,
    known_for_department,
    character,
    id,
    roles,
    username,
    avatarURL,
  } = repInfo;
  // - ALL INFO MEDIA
  const [dataMedia, setDataMedia] = useState({});

  useEffect(() => {
    if (i18next.language && !id && repInfo.mediaId) {
      getMediaDetails('person', repInfo.mediaId, i18next.language).then((d) => {
        setDataMedia(d);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18next.language, repInfo]);
  const urlPoster = profile_path
    ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${profile_path}`
    : null;
  const urlPosterPerson = !dataMedia.profile_path
    ? NoImage
    : `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${dataMedia.profile_path}`;

  const processInfo = {};
  switch (media) {
    case 'movie':
      processInfo.repId = id;
      processInfo.repPoster = profile_path ? urlPoster : NoImage;
      processInfo.repName = name;
      processInfo.repCharacter = character;
      processInfo.repKnownForDepartment = known_for_department;
      processInfo.urlNavigation = `/${media}/${idInfo}/person/${id}`;
      processInfo.runTime = 0;
      break;
    case 'tv':
      processInfo.repId = id;
      processInfo.repPoster = profile_path ? urlPoster : NoImage;
      processInfo.repName = name;
      processInfo.repCharacter =
        roles && roles.length > 0 ? roles[0].character : character;
      processInfo.repKnownForDepartment = known_for_department;
      processInfo.urlNavigation = `/${media}/${idInfo}/person/${id}`;
      processInfo.runTime = 0;
      break;
    case 'person':
      processInfo.repId = id ? id : dataMedia.id;
      processInfo.repPoster = profile_path ? urlPoster : urlPosterPerson;
      processInfo.repName = name ? name : dataMedia.name;
      processInfo.repCharacter = known_for_department
        ? known_for_department
        : dataMedia.known_for_department;
      processInfo.urlNavigation = id
        ? `/person/${id}`
        : `/person/${dataMedia.id}`;
      processInfo.runTime = 0;
      break;
    case 'user':
      processInfo.repId = id;
      processInfo.repPoster = avatarURL !== null ? avatarURL : NoImage;
      processInfo.repName = username;
      processInfo.repCharacter = 'User';
      processInfo.urlNavigation = `/users/${id}`;
      processInfo.runTime = 0;
      break;
    default:
      break;
  }
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorAddPlaylists) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorAddPlaylists(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorAddPlaylists]);

  const handleDeletePlaylist = (event) => {
    event.stopPropagation();
    setPopSureDel(true);
    setIdDelete(`${processInfo.repId}`);
  };
  const isSmall = size === 'small';
  const isPersonOrUser = media === 'person' || media === 'user';
  let posterSizeClass;
  if (isSmall) posterSizeClass = isPersonOrUser ? 'h-20 w-20' : 'h-28 w-28';
  else posterSizeClass = isPersonOrUser ? 'h-28 w-28' : 'h-40 w-40';
  let placeholderIconClass;
  if (isSmall)
    placeholderIconClass = isPersonOrUser ? 'h-10 w-10' : 'h-14 w-14';
  else placeholderIconClass = isPersonOrUser ? 'h-14 w-14' : 'h-20 w-20';
  let nameTextClass;
  if (isSmall) nameTextClass = 'text-xs';
  else nameTextClass = isPersonOrUser ? 'text-sm' : 'text-base';
  const characterTextClass = isSmall
    ? 'align-middle text-xs text-gray-400 break-words'
    : 'align-middle text-sm text-gray-400 break-words';
  return (
    <div className="slide flex flex-col justify-start content-center items-center">
      <div>
        {profile_path || avatarURL ? (
          <img
            className={`cursor-pointer rounded-full object-cover ${posterSizeClass} transition ease-in-out md:hover:scale-105 duration-300`}
            src={processInfo.repPoster}
            alt={processInfo.repName}
            onClick={() => navigate(processInfo.urlNavigation)}
          />
        ) : (
          <div
            className={`relative flex justify-center items-center cursor-pointer rounded-full object-cover ${posterSizeClass} transition ease-in-out md:hover:scale-105 duration-300`}
            onClick={() => navigate(processInfo.urlNavigation)}
          >
            <img
              className={`absolute opacity-10 object-cover ${placeholderIconClass}`}
              src={people}
              alt={t('Icon people')}
            />
            <img
              className={`rounded-full object-cover ${posterSizeClass} `}
              src={processInfo.repPoster}
              alt={t('No photo')}
            />
          </div>
        )}
        {/* <img
          className={`cursor-pointer rounded-full object-cover ${
            media === "person" || media === "user" ? "h-28 w-28" : "h-40 w-40"
          } transition ease-in-out md:hover:scale-105 duration-300`}
          src={processInfo.repPoster}
          alt={processInfo.repName}
          onClick={() => navigate(processInfo.urlNavigation)}
        /> */}
      </div>
      <div
        className=" cursor-pointer text-center mt-4 w-full"
        onClick={() => navigate(processInfo.urlNavigation)}
      >
        <h2 className={`font-semibold ${nameTextClass} break-words`}>
          {processInfo.repName}
        </h2>

        <div className={characterTextClass}>
          {processInfo.repCharacter}
          {/* // ! Delete Button */}
          {isPlaylist && isPlaylist !== '' ? (
            <BaseIcon
              icon="trash"
              size="x-small"
              color="currentColor"
              onClick={handleDeletePlaylist}
              aria-label={t('Delete Playlist Icon')}
              className="z-50 text-red-500 md:hover:text-gray-500 duration-200 ml-1"
              tooltip={t('Delete')}
            />
          ) : null}
          {/* //.BUTTON AND SEEN/UNSEEN */}
          {userExist ? (
            <div className="mb-1 w-full pr-4">
              {/* //-ADD BUTTON PLAYLIST */}
              {!isForum && media !== 'user' ? (
                <ShowPlaylistMenu
                  userId={user.id}
                  id={Number(processInfo.repId)}
                  type={'person'}
                  runTime={processInfo.runTime}
                  changeSeenPending={changeSeenPending}
                  setChangeSeenPending={setChangeSeenPending}
                  size={size}
                  labelVisibility={playlistLabelVisibility}
                />
              ) : null}
              {isForum ? (
                <AddForum
                  id={Number(processInfo.repId)}
                  runTime={processInfo.runTime}
                  type={media}
                  basicForum={basicForum}
                  changeSeenPending={changeSeenPending}
                  setChangeSeenPending={setChangeSeenPending}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Credits;

Credits.defaultProps = {
  idInfo: 0,
  repInfo: {},
  media: '',
  basicForum: {},
  isForum: false,
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  isPlaylist: false,
  setPopSureDel: () => {},
  setIdDelete: () => {},
  size: 'normal',
  playlistLabelVisibility: 'responsive',
};

Credits.propTypes = {
  idInfo: PropTypes.number,
  repInfo: PropTypes.object,
  media: PropTypes.string,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.bool,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  size: PropTypes.oneOf(['small', 'normal']),
  playlistLabelVisibility: PropTypes.oneOf(['responsive', 'always', 'hidden']),
};
