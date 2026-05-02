import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';
import { BaseIcon } from '../base';
import { NoImage, PlexTile, star } from '../../assets/image';
import calculateAverageVote from './calculateAverageVote';
import { useAuthContext } from '../../context/auth-context';
import { usePlexContext } from '../../context/plex-context';
import AddForum from '../../utils/Forum/AddForum';
import ShowPlaylistMenu from '../../utils/Playlists/ShowPlaylistMenu';
import SeenPending from './SeenPendingMedia/SeenPending';
import SeenPendingButton from '../../utils/Buttons/SeenPendingButton';
import {
  isMediaInPlex,
  ratingFromImdb,
  resolveDate,
  resolveMediaType,
  resolvePosterUrl,
  resolveTypeIcon,
  roundedVote,
  useMediaData,
  useMediaUserEntry,
} from './mediaCardHelpers';

export const Multi = ({
  info = {},
  mediaMovie = false,
  mediaTv = false,
  isUser = false,
  changeSeenPending = false,
  setChangeSeenPending = () => {},
  isPlaylist = '',
  setPopSureDel = () => {},
  setIdDelete = () => {},
  hideSearch = () => {},
  isForum = false,
  basicForum = {},
  mediasUser = [],
  size = 'normal',
}) => {
  const [t, i18next] = useTranslation('translation');
  const { user, onReload } = useAuthContext();
  const plex = usePlexContext();
  const navigate = useNavigate();

  const userExist = !!user;
  const { media_type } = info;
  const id = isUser ? info.mediaId : info.id;
  const mediaType = resolveMediaType(mediaMovie, mediaTv, media_type);

  const { dataMedia, imdbID, imdbData } = useMediaData(
    mediaType,
    id,
    i18next.language,
  );

  const [pendingSeen, setPendingSeen] = useState(false);

  const {
    poster_path,
    vote_average,
    release_date,
    first_air_date,
    known_for_department,
    profile_path,
    runtime,
    number_of_episodes,
    episode_run_time,
    title,
    name,
  } = dataMedia;

  const url = resolvePosterUrl(poster_path, profile_path);

  const processInfo = {
    bgPoster: url || NoImage,
    voteAverage: calculateAverageVote(
      roundedVote(vote_average),
      ratingFromImdb(imdbData?.IMDb),
      ratingFromImdb(imdbData?.FilmAffinity),
    ),
    title: title || name,
    date: resolveDate(release_date, first_air_date, known_for_department),
    type: mediaType,
    runTime:
      runtime || (episode_run_time && number_of_episodes * episode_run_time[0]),
  };

  const [dataMediaUser] = useMediaUserEntry(mediasUser, id, mediaType, [
    changeSeenPending,
    pendingSeen,
    userExist,
  ]);

  const { seen, pending, vote } = dataMediaUser;
  const runTime = processInfo.runTime;

  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  useEffect(() => {
    if (!errorAddPlaylists) return undefined;
    const timerId = setTimeout(() => setErrorAddPlaylists(false), 3000);
    return () => clearTimeout(timerId);
  }, [errorAddPlaylists]);

  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      mediaType,
      runTime,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      'seen',
      onReload,
    );
  };

  // - PENDING/NO PENDING
  const handlePending = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      mediaType,
      runTime,
      pending,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      'pending',
      onReload,
    );
  };

  const handleDeletePlaylist = (event) => {
    if (event) {
      event.stopPropagation();
      setPopSureDel(true);
      setIdDelete(id);
    } else {
      setErrorAddPlaylists(t('Is in the playlist'));
    }
  };

  const typeIcon = resolveTypeIcon(processInfo.type);
  const navigatePath = `/${mediaType}/${id}`;
  const inPlex = isMediaInPlex(mediaType, id, imdbID, plex);

  let titleSizeClass = 'text-sm';
  if (size === 'small') titleSizeClass = 'text-xs line-clamp-2';
  else if (isUser) titleSizeClass = 'text-sm line-clamp-3';
  const titleClampClass =
    size === 'small' ? 'line-clamp-2' : 'line-clamp-3 h-max-[4.5rem]';

  return (
    // BACKGROUND
    <div
      className="static text-gray-200 rounded-2xl bg-cover w-full"
      style={{
        backgroundImage: `url(${processInfo.bgPoster})`,
      }}
    >
      <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
        <button
          type="button"
          className="relative block w-full text-left"
          onClick={() => {
            hideSearch();
            navigate(navigatePath);
          }}
        >
          {/* //.POSTER AND RATINGS */}
          <div className="relative cursor-pointer">
            {/* //-POSTER + OVERLAYS (scale together) */}
            <div className="relative transition ease-in-out md:hover:scale-105 duration-300">
              {/* //-PLEX BADGE */}
              {inPlex && (
                <img
                  src={PlexTile}
                  alt="Plex Icon"
                  className="absolute z-10 top-2 right-2 w-6 h-6 blur-[0.5px] pointer-events-none border border-yellow-600 rounded-md bg-black/50 p-0.5"
                />
              )}
              {/* //-AVERAGE RATINGS */}
              {processInfo.voteAverage > 0 && (
                <div className="absolute z-10 bottom-auto right-auto left-0 px-2 ml-2 inset-y-2 inset-x-8 backdrop-blur-md bg-black/50 rounded-lg">
                  <img
                    alt="Star Icon"
                    className="inline-block pr-1 py-2 w-4"
                    src={star}
                  />
                  <div className="inline-block inset-y-2 inset-x-5 text-amber-400 text-xs text-left leading-4">
                    {processInfo.voteAverage}
                  </div>
                  {/* // * User Vote */}
                  {userExist && vote >= 0 && (
                    <div className="flex items-start">
                      <FaStar
                        size={12}
                        color="#FFCA28"
                        alt={t('Seen')}
                        className="mr-1"
                      />
                      <div className="inset-b-2 inset-x-5 mb-1 text-amber-400 text-xs text-left leading-4">
                        {vote}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {url ? (
                <img
                  className="static aspect-auto w-full cursor-pointer rounded-xl"
                  src={processInfo.bgPoster}
                  alt={processInfo.title}
                />
              ) : (
                <div className="relative flex justify-center items-center">
                  {typeIcon && (
                    <img
                      className="absolute h-24 opacity-10"
                      src={typeIcon}
                      alt={t('Icon')}
                    />
                  )}
                  <img
                    className="static aspect-auto w-full cursor-pointer rounded-xl"
                    src={processInfo.bgPoster}
                    alt={t('No photo')}
                  />
                </div>
              )}
            </div>
          </div>
          {/* //.ICONS AND TITLE */}
          <div className="mt-4 px-2 cursor-pointer">
            <div className="mb-1 grid grid-cols-2 gap-4 ">
              {/* //-ICON BY TYPE */}
              <div className="text-xs align-middle">
                {typeIcon && <img className="w-4" src={typeIcon} alt="" />}
              </div>
              <div className="text-right flex items-center justify-end text-xs">
                {processInfo.date}
                {/* // ! Delete Button */}
                {isPlaylist && (
                  <BaseIcon
                    icon="trash"
                    size="x-small"
                    color="currentColor"
                    onClick={handleDeletePlaylist}
                    aria-label={t('Delete Playlist Icon')}
                    className="z-50 text-red-500 md:hover:text-gray-500 duration-200 ml-1"
                    tooltip={t('Delete')}
                  />
                )}
              </div>
            </div>
            {/* //-TITLE */}
            <div
              className={`font-semibold ${titleSizeClass} ${
                userExist ? 'pb-8' : 'pb-2'
              } cursor-pointer`}
            >
              <p className={titleClampClass}>{processInfo.title}</p>
            </div>
          </div>
        </button>
        {/* //.BUTTON AND SEEN/UNSEEN */}
        {userExist && (
          <div className="mb-1 grid grid-cols-5 gap-2 bottom-0 absolute w-full pr-4">
            {/* //-ADD BUTTON PLAYLIST */}
            {!isForum && (
              <ShowPlaylistMenu
                userId={user.id}
                id={Number(id)}
                type={processInfo.type}
                runTime={processInfo.runTime}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                size={size}
              />
            )}
            {isForum && (
              <AddForum
                id={Number(id)}
                runTime={processInfo.runTime}
                type={processInfo.type}
                basicForum={basicForum}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
              />
            )}
            {/* //-SEEN/UNSEEN */}
            <div className="text-right align-middle">
              {mediaType !== 'person' && (
                <SeenPendingButton
                  condition={seen}
                  size={size === 'small' ? 18 : 20}
                  text={'Seen'}
                  handle={handleSeenMedia}
                />
              )}
            </div>
            {/* //-PENDING/NO PENDING */}
            <div className="text-right align-middle">
              {mediaType !== 'person' && (
                <SeenPendingButton
                  condition={pending}
                  size={size === 'small' ? 15 : 17}
                  text={'Pending'}
                  handle={handlePending}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Multi;

Multi.propTypes = {
  info: PropTypes.object,
  mediaMovie: PropTypes.bool,
  mediaTv: PropTypes.bool,
  isUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  hideSearch: PropTypes.func,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
  mediasUser: PropTypes.array,
  size: PropTypes.oneOf(['small', 'normal']),
};
