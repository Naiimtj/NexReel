import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  postPlaylistMedia,
  getUserListPlaylist,
  deletePlaylistMedia,
} from '../../../services/DB/services-db';
import { BaseButton, BaseIcon } from '../../components/base';

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

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuCoords, setMenuCoords] = useState(null);

  useEffect(() => {
    if (openPlaylistsList && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuCoords({ top: rect.bottom + 4, left: rect.left });
    }
  }, [openPlaylistsList]);

  useEffect(() => {
    if (!openPlaylistsList) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpenPlaylistsList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPlaylistsList]);

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
    <div
      ref={triggerRef}
      className={`relative ${triggerTextClass} align-middle`}
    >
      <BaseButton
        variant="icon"
        size="small"
        className={`flex flex-row items-center text-left px:center ${
          !openPlaylistsList ? 'text-[#7B6EF6] md:hover:text-gray-400' : 'text-gray-400'
        } transition ease-in-out md:hover:scale-105 duration-300 xs:text-xs sm:text-base !p-0`}
        onClick={(event) => {
          (event.stopPropagation(), setOpenPlaylistsList(!openPlaylistsList));
        }}
      >
        <BaseIcon
          icon={openPlaylistsList ? 'remove' : 'add'}
          size={iconSize}
          className="inline-block size-8 md:size-6"
        />
        <span className={labelVisibilityClass}>{t('Playlists')}</span>
      </BaseButton>
      {openPlaylistsList && menuCoords
        ? createPortal(
            <div
              ref={menuRef}
              className={`fixed z-[9999] flex flex-col ${menuTextClass} bg-grayNR/90 rounded-md ${menuWidthClass}`}
              style={{ top: menuCoords.top, left: menuCoords.left }}
              onClick={(e) => e.stopPropagation()}
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
              <Link
                to={`/playlists/${userId}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-[#7B6EF6] hover:text-white hover:bg-gray-50/20 p-2 rounded-md transition duration-200"
              >
                {t('Create playlist')}
              </Link>
            </div>,
            document.body,
          )
        : null}
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
