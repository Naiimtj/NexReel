import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  postPlaylistMedia,
  getUserListPlaylist,
  deletePlaylistMedia,
} from '../../../services/DB/services-db';
import { IoIosRemove, IoMdAdd } from 'react-icons/io';

const ShowPlaylistMenu = ({
  userId,
  id,
  type,
  runTime,
  onReload,
  changeSeenPending,
  setChangeSeenPending,
  size,
  labelVisibility,
}) => {
  const isSmall = size === 'small';
  const LABEL_VISIBILITY_CLASS = {
    always: 'inline',
    hidden: 'hidden',
    responsive: 'hidden md:inline',
  };
  const labelVisibilityClass =
    LABEL_VISIBILITY_CLASS[labelVisibility] ||
    LABEL_VISIBILITY_CLASS.responsive;
  const triggerTextClass = isSmall ? 'text-sm' : 'text-base';
  const iconSize = isSmall ? 14 : 20;
  const menuTextClass = isSmall ? 'text-sm' : 'text-base';
  const menuItemPaddingClass = isSmall ? 'p-1' : 'p-2';
  const menuWidthClass = isSmall
    ? 'md:w-[160px] w-[120px]'
    : 'md:w-[200px] w-[150px]';
  const [t] = useTranslation('translation');
  const [playlistsChange, setPlaylistsChange] = useState(false);
  const [openPlaylistsList, setOpenPlaylistsList] = useState(false);

  const [playlistUser, setPlaylistUser] = useState([]);
  useEffect(() => {
    const DataPlaylist = async () => {
      getUserListPlaylist()
        .then((data) => {
          setPlaylistUser(data);
        })
        .catch((err) => err);
    };
    if (userId && openPlaylistsList) {
      DataPlaylist();
    }
  }, [userId, changeSeenPending, openPlaylistsList]);

  const [dataUser, setDataUser] = useState([]);

  useEffect(() => {
    const Data = async () => {
      setDataUser(playlistUser);
    };
    if (openPlaylistsList) {
      Data();
    }
  }, [
    playlistsChange,
    changeSeenPending,
    id,
    userId,
    playlistUser,
    openPlaylistsList,
  ]);

  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const handleAddPlaylist = async (playlistId) => {
    try {
      await postPlaylistMedia(playlistId, {
        mediaId: `${id}`,
        media_type: type,
        runtime: runTime,
      }).then((data) => {
        if (data) {
          (setPlaylistsChange(!playlistsChange),
            setOpenPlaylistsList(false),
            setChangeSeenPending(!changeSeenPending));
          onReload();
        }
      });
    } catch (error) {
      if (error) {
        const { detail } = error.response?.data || {};
        setErrorAddPlaylists(detail);
      }
    }
  };

  const handleRemovePlaylist = async (playlistId) => {
    try {
      await deletePlaylistMedia(playlistId, {
        mediaIdDelete: `${id}`,
      });
      setPlaylistsChange(!playlistsChange);
      setOpenPlaylistsList(false);
      setChangeSeenPending(!changeSeenPending);
      onReload();
    } catch (error) {
      if (error) {
        const { detail, message } = error.response?.data || {};
        setErrorAddPlaylists(detail || message);
      }
    }
  };

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

  return (
    <div className={`relative ${triggerTextClass} align-middle col-span-3`}>
      <button
        className={`flex flex-row items-center cursor-pointer text-left px:center ${
          !openPlaylistsList ? 'text-[#7B6EF6]' : 'text-gray-600'
        } transition ease-in-out md:hover:scale-105 duration-300 xs:text-xs sm:text-base`}
        onClick={(event) => {
          (event.stopPropagation(), setOpenPlaylistsList(!openPlaylistsList));
        }}
      >
        {!openPlaylistsList ? (
          <IoMdAdd
            className="inline-block"
            size={iconSize}
            alt={t('Add to one list')}
          />
        ) : (
          <IoIosRemove
            className="inline-block"
            size={iconSize}
            alt={t('Add to one list')}
          />
        )}
        <span className={labelVisibilityClass}>{t('Playlists')}</span>
      </button>
      {openPlaylistsList ? (
        <div
          className={`absolute z-50 flex flex-col ${menuTextClass} bg-grayNR/90 rounded-md ${menuWidthClass}`}
        >
          {errorAddPlaylists ? (
            <div className="text-white bg-gray-50/20 px-1 font-bold">
              {t(errorAddPlaylists)}
            </div>
          ) : null}
          {dataUser.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-2 py-2">
              <span className="text-white text-center">
                {t('No playlists')}
              </span>
              <Link
                to={`/playlists/${userId}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-[#7B6EF6] hover:text-white hover:bg-gray-50/20 p-2 rounded-md transition duration-200"
              >
                {t('Create playlist')}
              </Link>
            </div>
          ) : null}
          {dataUser.map((i, index) => {
            const roundedTopItem = index === 0 ? 'rounded-t-md' : null;
            const roundedBottomItem =
              dataUser.length === index + 1 ? 'rounded-b-md' : null;
            const isInPlaylist = i.medias.some(
              (media) => Number(media.mediaId) === id,
            );
            return (
              <div
                key={i.id}
                className={`hover:bg-gray-50 ${menuItemPaddingClass}  ${
                  dataUser.length === 1 ? 'rounded-md' : null
                } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                onClick={(event) => {
                  (event.stopPropagation(),
                    isInPlaylist
                      ? handleRemovePlaylist(i.id)
                      : handleAddPlaylist(i.id));
                }}
              >
                <div
                  className={
                    isInPlaylist
                      ? 'text-green-700 text-left'
                      : 'text-black text-left'
                  }
                >
                  {isInPlaylist ? `✓ ${i.title}` : `· ${i.title}`}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default ShowPlaylistMenu;

ShowPlaylistMenu.defaultProps = {
  userId: '',
  id: 0,
  type: '',
  runTime: 0,
  onReload: () => {},
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  size: 'normal',
  labelVisibility: 'responsive',
};

ShowPlaylistMenu.propTypes = {
  userId: PropTypes.string,
  id: PropTypes.number,
  type: PropTypes.string,
  runTime: PropTypes.number,
  onReload: PropTypes.func,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  size: PropTypes.oneOf(['small', 'normal']),
  labelVisibility: PropTypes.oneOf(['responsive', 'always', 'hidden']),
};
