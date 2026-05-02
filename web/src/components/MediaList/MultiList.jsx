import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';
import { NoImage, PlexTile, star } from '../../assets/image';
import calculateAverageVote from './calculateAverageVote';
import { useAuthContext } from '../../context/auth-context';
import { usePlexContext } from '../../context/plex-context';
import SeenPending from './SeenPendingMedia/SeenPending';
import ShowPlaylistMenu from '../../utils/Playlists/ShowPlaylistMenu';
import SeenPendingButton from '../../utils/Buttons/SeenPendingButton';
import { BaseIcon, DeleteConfirmModal } from '../base';
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

export const MultiList = ({
  info = {},
  mediaMovie = false,
  mediaTv = false,
  isUser = false,
  changeSeenPending = false,
  setChangeSeenPending = () => {},
  isPlaylist = '',
  setPopSureDel = () => {},
  setIdDelete = () => {},
  setAnswerDel,
  mediasUser = [],
}) => {
  const [t, i18next] = useTranslation('translation');
  const navigate = useNavigate();
  const { user, onReload } = useAuthContext();
  const plex = usePlexContext();
  const userExist = !!user;
  const { media_type } = info;
  const id = isUser ? info.mediaId : info.id;
  const mediaType = resolveMediaType(mediaMovie, mediaTv, media_type);

  const [pendingSeen, setPendingSeen] = useState(false);
  const { dataMedia, imdbID, imdbData } = useMediaData(
    mediaType,
    id,
    i18next.language,
  );

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

  const inPlex = isMediaInPlex(mediaType, id, imdbID, plex);
  const typeIcon = resolveTypeIcon(processInfo.type);

  const [dataMediaUser] = useMediaUserEntry(mediasUser, id, mediaType, [
    changeSeenPending,
    pendingSeen,
    userExist,
  ]);
  const { seen, pending, vote } = dataMediaUser;
  const runTime = processInfo.runTime;

  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  useEffect(() => {
    if (!errorAddPlaylists) return undefined;
    const timerId = setTimeout(() => setErrorAddPlaylists(false), 3000);
    return () => clearTimeout(timerId);
  }, [errorAddPlaylists]);

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
    event.stopPropagation();
    setIdDelete(id);
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteVisible(false);
    if (typeof setAnswerDel === 'function') {
      setAnswerDel(true);
    } else {
      setPopSureDel(true);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteVisible(false);
    setIdDelete(null);
  };

  return (
    <div
      className="relative text-gray-200 rounded-2xl bg-cover w-full"
      style={{ backgroundImage: `url(${processInfo.bgPoster})` }}
    >
      <div className="grid grid-row-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
        <div
          type="button"
          tabIndex={0}
          className="relative text-left w-full cursor-pointer"
          onClick={() => navigate(`/${mediaType}/${id}`)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              navigate(`/${mediaType}/${id}`);
            }
          }}
        >
          <div className="grid grid-cols-6 justify-between gap-x-6 py-0">
            <div className="absolute flex flex-row gap-1 top-0 items-start z-10 right-0 left-auto inset-y-2 inset-x-8">
              {inPlex && (
                <img
                  src={PlexTile}
                  alt="Plex Icon"
                  className="w-7 h-7 rounded-md bg-black/50 p-0.5"
                />
              )}
              {processInfo.voteAverage > 0 && (
                <div className="px-2 mr-2 backdrop-blur-md bg-black/50 rounded-lg">
                  <img
                    className="inline-block pr-1 py-2 w-4"
                    src={star}
                    alt=""
                  />
                  <div className="inline-block inset-y-2 inset-x-5 text-amber-400 text-xs text-left leading-4">
                    {processInfo.voteAverage}
                  </div>
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
            </div>

            <div className="col-span-6 flex min-w-0 gap-x-4 mb-2 md:mb-0">
              <div className="h-full w-14">
                <div className="transition ease-in-out md:hover:scale-105 duration-300">
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
                          alt={t('Icon people')}
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
              <div className="min-w-0 flex-auto mt-4 px-2">
                <div className="mb-1 flex flex-row items-center gap-4">
                  {typeIcon && (
                    <img
                      className="w-4"
                      src={typeIcon}
                      alt={`Type ${processInfo.type}`}
                    />
                  )}
                  <div className="text-right align-middle items-center flex gap-4 text-xs">
                    {processInfo.date ?? null}
                    {isPlaylist && (
                      <BaseIcon
                        icon="trash"
                        size="x-small"
                        color="currentColor"
                        onClick={handleDeletePlaylist}
                        aria-label={t('Delete Playlist Icon')}
                        className="z-50 text-red-500 md:hover:text-gray-500 duration-200"
                        tooltip={t('Delete')}
                      />
                    )}
                  </div>
                </div>
                <div className="font-semibold text-sm md:text-base cursor-pointer">
                  <p className="line-clamp-3">{processInfo.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {userExist && (
        <div className="absolute bottom-0 mb-1 flex justify-end gap-6 w-full pr-4 z-40">
          <ShowPlaylistMenu
            userId={user.id}
            id={Number(id)}
            type={processInfo.type}
            runTime={processInfo.runTime}
          />
          <div className="text-right align-middle">
            {mediaType !== 'person' && (
              <SeenPendingButton
                condition={seen}
                size={20}
                text="Seen"
                handle={handleSeenMedia}
              />
            )}
          </div>
          <div className="text-right align-middle">
            {mediaType !== 'person' && (
              <SeenPendingButton
                condition={pending}
                size={17}
                text="Pending"
                handle={handlePending}
              />
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        visible={confirmDeleteVisible}
        itemName={processInfo.title}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

MultiList.propTypes = {
  info: PropTypes.object,
  mediaMovie: PropTypes.bool,
  mediaTv: PropTypes.bool,
  isUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  setAnswerDel: PropTypes.func,
  mediasUser: PropTypes.array,
};

export default MultiList;
