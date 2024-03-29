import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  postPlaylistMedia,
  getUserListPlaylist,
} from "../../../services/DB/services-db";
import { IoIosRemove, IoMdAdd } from "react-icons/io";

const ShowPlaylistMenu = ({
  userId,
  id,
  type,
  runTime,
  onReload,
  changeSeenPending,
  setChangeSeenPending,
}) => {
  const [t] = useTranslation("translation");
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
          setPlaylistsChange(!playlistsChange),
            setOpenPlaylistsList(false),
            setChangeSeenPending(!changeSeenPending);
          onReload();
        }
      });
    } catch (error) {
      if (error) {
        const { message } = error.response?.data || {};
        setErrorAddPlaylists(message);
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
    <div className="relative text-base align-middle col-span-3">
      <button
        className={`cursor-pointer text-left font-semibold px:center ${
          !openPlaylistsList ? "text-[#7B6EF6]" : "text-gray-600"
        } transition ease-in-out md:hover:scale-105 duration-300`}
        onClick={(event) => {
          event.stopPropagation(), setOpenPlaylistsList(!openPlaylistsList);
        }}
      >
        {!openPlaylistsList ? (
          <IoMdAdd
            className="inline-block"
            size={20}
            alt={t("Add to one list")}
          />
        ) : (
          <IoIosRemove
            className="inline-block"
            size={20}
            alt={t("Add to one list")}
          />
        )}
        {t("Playlists")}
      </button>
      {openPlaylistsList ? (
        <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
          {errorAddPlaylists ? (
            <div className="text-white bg-gray-50/20 px-1 font-bold">
              {t(errorAddPlaylists)}
            </div>
          ) : null}
          {dataUser &&
            dataUser.map((i, index) => {
              const roundedTopItem = index === 0 ? "rounded-t-md" : null;
              const roundedBottomItem =
                dataUser && dataUser.length === index + 1
                  ? "rounded-b-md"
                  : null;
              const isInPlaylist =
                i &&
                i.medias &&
                i.medias.some((media) => Number(media.mediaId) === id);
              return (
                <div
                  key={i.id}
                  className={`hover:bg-gray-50 px-1 ${
                    dataUser && dataUser.length === 1 ? "rounded-md" : null
                  } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                  onClick={(event) => {
                    event.stopPropagation(),
                      isInPlaylist ? null : handleAddPlaylist(i.id);
                  }}
                >
                  <div
                    className={
                      isInPlaylist
                        ? "text-green-700 text-left"
                        : "text-black text-left"
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
  userId: "",
  id: 0,
  type: "",
  runTime: 0,
  onReload: () => {},
  changeSeenPending: false,
  setChangeSeenPending: () => {},
};

ShowPlaylistMenu.propTypes = {
  userId: PropTypes.string,
  id: PropTypes.number,
  type: PropTypes.string,
  runTime: PropTypes.number,
  onReload: PropTypes.func,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
};
